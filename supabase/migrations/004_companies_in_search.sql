-- The search reads the watched companies and saves newly discovered ones.
create or replace function jh_run_save(p_payload jsonb, p_secret text default null) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_run uuid; v_added int := 0; j jsonb; s jsonb; v_job uuid;
begin
  if not jh_can_run(p_secret) then raise exception 'not allowed'; end if;
  insert into jh_runs (trigger, status, found, merged, dropped, source_stats, ai_cost_usd, summary, finished_at)
  values (coalesce(p_payload->>'trigger','button'), coalesce(p_payload->>'status','done'),
          coalesce((p_payload->>'found')::int,0), coalesce((p_payload->>'merged')::int,0),
          coalesce(jsonb_array_length(p_payload->'dropped'),0), coalesce(p_payload->'source_stats','[]'),
          coalesce((p_payload->>'ai_cost_usd')::numeric,0), p_payload->>'summary', now())
  returning id into v_run;

  for j in select * from jsonb_array_elements(coalesce(p_payload->'jobs','[]')) loop
    if exists (select 1 from jh_deleted_jobs where dedupe_key = j->>'dedupe_key') then continue; end if;
    v_job := null;
    select id into v_job from jh_jobs where dedupe_key = j->>'dedupe_key';
    if v_job is null and j ? 'title' then
      insert into jh_jobs (dedupe_key, title, company, company_website, description, summary, requirements, location, work_mode,
        eligibility_label, eligibility_evidence, job_type, seniority, salary_text, posted_at, deadline, is_repost, apply_url,
        apply_method, apply_email, required_subject, role_families, match_score, match_band, match_reasons, gaps, cv_tips, advice,
        scored_by, trust_label, trust_checks, run_id)
      values (j->>'dedupe_key', j->>'title', j->>'company', j->>'company_website', j->>'description', j->>'summary',
        coalesce(j->'requirements','[]'), j->>'location', j->>'work_mode', j->>'eligibility_label', j->>'eligibility_evidence',
        j->>'job_type', j->>'seniority', j->>'salary_text', nullif(j->>'posted_at','')::date, nullif(j->>'deadline','')::date,
        coalesce((j->>'is_repost')::boolean,false), j->>'apply_url', coalesce(j->>'apply_method','link'), j->>'apply_email',
        j->>'required_subject', coalesce(j->'role_families','[]'), (j->>'match_score')::int, j->>'match_band',
        coalesce(j->'match_reasons','[]'), coalesce(j->'gaps','[]'), coalesce(j->'cv_tips','[]'), j->>'advice',
        coalesce(j->>'scored_by','rules'), j->>'trust_label', coalesce(j->'trust_checks','[]'), v_run)
      on conflict (dedupe_key) do nothing
      returning id into v_job;
      if v_job is not null then
        insert into jh_status_history (job_id, status, note) values (v_job, 'new', 'Found by search');
        v_added := v_added + 1;
      else
        select id into v_job from jh_jobs where dedupe_key = j->>'dedupe_key';
      end if;
    elsif v_job is not null then
      update jh_jobs set last_seen_at = now() where id = v_job;
    end if;
    if v_job is null then continue; end if;
    for s in select * from jsonb_array_elements(coalesce(j->'sources','[]')) loop
      insert into jh_job_sources (job_id, source, source_url) values (v_job, s->>'source', s->>'source_url')
      on conflict (job_id, source_url) do update set seen_at = now();
    end loop;
  end loop;

  insert into jh_dropped_jobs (run_id, title, company, url, source, reason)
  select v_run, d->>'title', d->>'company', d->>'url', d->>'source', d->>'reason'
  from jsonb_array_elements(coalesce(p_payload->'dropped','[]')) d;

  -- Companies spotted on job sites with their own hiring page join the daily watch list.
  insert into jh_companies (ats, slug, name, added_by)
  select b->>'ats', b->>'slug', coalesce(nullif(b->>'name',''), b->>'slug'), 'auto'
  from jsonb_array_elements(coalesce(p_payload->'discovered','[]')) b
  where b->>'ats' in ('greenhouse','lever','ashby','workable','smartrecruiters') and coalesce(b->>'slug','') <> ''
  on conflict (ats, slug) do nothing;

  update jh_runs set added = v_added where id = v_run;
  return jsonb_build_object('run_id', v_run, 'added', v_added);
end $$;
revoke all on function jh_run_save(jsonb, text) from public;
grant execute on function jh_run_save(jsonb, text) to anon, authenticated;

-- Deleted jobs also count as "already known", so the search skips them early (no detail pages, no AI scoring).
create or replace function jh_run_context(p_secret text default null) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not jh_can_run(p_secret) then raise exception 'not allowed'; end if;
  return jsonb_build_object(
    'profile', (select to_jsonb(p) from jh_profile p where id = 1),
    'existing', coalesce((select jsonb_agg(x) from (
        select jsonb_build_object('id', j.id, 'dedupe_key', j.dedupe_key, 'posted_at', j.posted_at) as x from jh_jobs j
        union all
        select jsonb_build_object('id', null, 'dedupe_key', d.dedupe_key, 'posted_at', null) from jh_deleted_jobs d) t), '[]'::jsonb),
    'known_urls', coalesce((select jsonb_agg(s.source_url) from jh_job_sources s), '[]'::jsonb),
    'ai_spent_month', jh_ai_spent_month(),
    'companies', coalesce((select jsonb_agg(jsonb_build_object('ats', c.ats, 'slug', c.slug, 'name', c.name)) from jh_companies c where c.active), '[]'::jsonb)
  );
end $$;
revoke all on function jh_run_context(text) from public;
grant execute on function jh_run_context(text) to anon, authenticated;
