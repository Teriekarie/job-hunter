-- Job Hunter tables. Every table starts with jh_ so it never mixes with other apps in the same project.
-- One owner only. Row Level Security lets only the owner read and write.

create table if not exists jh_settings (
  id int primary key default 1 check (id = 1),
  owner_id uuid not null,
  cron_secret_hash text            -- sha256 of the daily-search secret (the secret itself is never stored)
);
alter table jh_settings enable row level security;   -- no policies: only the functions below can read it

create or replace function jh_is_owner() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select auth.uid() is not null and auth.uid() = (select owner_id from jh_settings where id = 1);
$$;

create or replace function jh_can_run(p_secret text) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select jh_is_owner() or (
    p_secret is not null and length(p_secret) >= 24 and
    encode(sha256(convert_to(p_secret, 'utf8')), 'hex') = (select cron_secret_hash from jh_settings where id = 1)
  );
$$;

create table if not exists jh_profile (
  id int primary key default 1 check (id = 1),
  cv_text text not null,
  search_profile jsonb not null,
  learned_preferences jsonb not null default '[]',
  updated_at timestamptz default now()
);

create table if not exists jh_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz default now(),
  finished_at timestamptz,
  trigger text default 'button',             -- button | daily
  status text default 'done',                -- done | failed
  found int default 0, merged int default 0, dropped int default 0, added int default 0,
  source_stats jsonb default '[]',           -- [{source, found, error}]
  ai_cost_usd numeric default 0,
  summary text
);

create table if not exists jh_jobs (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text not null unique,
  title text not null,
  company text not null,
  company_website text,
  description text,
  summary text,
  requirements jsonb default '[]',
  location text,
  work_mode text,
  eligibility_label text,
  eligibility_evidence text,
  job_type text,
  seniority text,
  salary_text text,
  posted_at date,
  found_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  deadline date,
  is_repost boolean default false,
  apply_url text not null,
  apply_method text default 'link',          -- link | email
  apply_email text,
  required_subject text,
  role_families jsonb default '[]',
  match_score int,
  match_band text,
  match_reasons jsonb default '[]',
  gaps jsonb default '[]',
  cv_tips jsonb default '[]',
  advice text,
  scored_by text default 'rules',            -- rules | ai
  trust_label text,
  trust_checks jsonb default '[]',
  cover_letter text,
  email_subject text, email_body text,
  status text default 'new',
  applied_at timestamptz, applied_via text,
  notes text,
  run_id uuid references jh_runs,
  updated_at timestamptz default now()
);
create index if not exists jh_jobs_status_idx on jh_jobs (status);

create table if not exists jh_job_sources (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jh_jobs on delete cascade,
  source text not null,
  source_url text not null,
  seen_at timestamptz default now(),
  unique (job_id, source_url)
);

create table if not exists jh_status_history (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jh_jobs on delete cascade,
  status text not null,
  changed_at timestamptz default now(),
  note text
);

create table if not exists jh_feedback (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jh_jobs on delete cascade,
  reasons jsonb default '[]',
  note text,
  created_at timestamptz default now()
);

create table if not exists jh_dropped_jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references jh_runs on delete cascade,
  title text, company text, url text, source text,
  reason text,
  created_at timestamptz default now()
);

do $$
declare t text;
begin
  foreach t in array array['jh_profile','jh_runs','jh_jobs','jh_job_sources','jh_status_history','jh_feedback','jh_dropped_jobs'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists %I on %I', t || '_owner', t);
    execute format('create policy %I on %I for all to authenticated using (jh_is_owner()) with check (jh_is_owner())', t || '_owner', t);
  end loop;
end $$;

-- What a search needs before it starts: profile + the jobs already saved (so nothing is added twice).
create or replace function jh_run_context(p_secret text default null) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not jh_can_run(p_secret) then raise exception 'not allowed'; end if;
  return jsonb_build_object(
    'profile', (select to_jsonb(p) from jh_profile p where id = 1),
    'existing', coalesce((select jsonb_agg(jsonb_build_object('id', j.id, 'dedupe_key', j.dedupe_key, 'posted_at', j.posted_at)) from jh_jobs j), '[]'::jsonb),
    'known_urls', coalesce((select jsonb_agg(s.source_url) from jh_job_sources s), '[]'::jsonb)
  );
end $$;

-- Saves one finished search. Safe to re-run: a job that already exists is never added twice.
create or replace function jh_run_save(p_payload jsonb, p_secret text default null) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_run uuid; v_added int := 0; j jsonb; s jsonb; v_job uuid; v_new boolean;
begin
  if not jh_can_run(p_secret) then raise exception 'not allowed'; end if;
  insert into jh_runs (trigger, status, found, merged, dropped, source_stats, ai_cost_usd, summary, finished_at)
  values (coalesce(p_payload->>'trigger','button'), coalesce(p_payload->>'status','done'),
          coalesce((p_payload->>'found')::int,0), coalesce((p_payload->>'merged')::int,0),
          coalesce(jsonb_array_length(p_payload->'dropped'),0), coalesce(p_payload->'source_stats','[]'),
          coalesce((p_payload->>'ai_cost_usd')::numeric,0), p_payload->>'summary', now())
  returning id into v_run;

  for j in select * from jsonb_array_elements(coalesce(p_payload->'jobs','[]')) loop
    v_job := null;
    select id into v_job from jh_jobs where dedupe_key = j->>'dedupe_key';
    v_new := v_job is null;
    if v_new then
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
      returning id into v_job;
      insert into jh_status_history (job_id, status, note) values (v_job, 'new', 'Found by search');
      v_added := v_added + 1;
    else
      update jh_jobs set last_seen_at = now() where id = v_job;
    end if;
    for s in select * from jsonb_array_elements(coalesce(j->'sources','[]')) loop
      insert into jh_job_sources (job_id, source, source_url) values (v_job, s->>'source', s->>'source_url')
      on conflict (job_id, source_url) do update set seen_at = now();
    end loop;
  end loop;

  insert into jh_dropped_jobs (run_id, title, company, url, source, reason)
  select v_run, d->>'title', d->>'company', d->>'url', d->>'source', d->>'reason'
  from jsonb_array_elements(coalesce(p_payload->'dropped','[]')) d;

  update jh_runs set added = v_added where id = v_run;
  return jsonb_build_object('run_id', v_run, 'added', v_added);
end $$;

revoke all on function jh_run_context(text) from public;
revoke all on function jh_run_save(jsonb, text) from public;
revoke all on function jh_can_run(text) from public;
grant execute on function jh_is_owner() to anon, authenticated;
grant execute on function jh_can_run(text) to anon, authenticated;
grant execute on function jh_run_context(text) to anon, authenticated;
grant execute on function jh_run_save(jsonb, text) to anon, authenticated;

-- Tightening (applied as a second migration): helpers are only called from inside the functions above.
revoke execute on function jh_can_run(text) from anon, authenticated, public;
revoke execute on function jh_is_owner() from anon, public;

-- The app registers the hash of its CRON_SECRET itself when the owner signs in (see lib/session.ts).
create or replace function jh_set_cron_hash(p_hash text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not jh_is_owner() then raise exception 'not allowed'; end if;
  if p_hash !~ '^[0-9a-f]{64}$' then raise exception 'bad hash'; end if;
  update jh_settings set cron_secret_hash = p_hash where id = 1;
end $$;
revoke all on function jh_set_cron_hash(text) from public, anon;
grant execute on function jh_set_cron_hash(text) to authenticated;
