import Nav from '@/components/Nav';
import JobsBoard, { type BoardJob } from '@/components/JobsBoard';
import { requireOwner } from '@/lib/session';
import { ensureProfile } from '@/lib/run-server';
import { aiEnabled } from '@/lib/ai';
import { fmtDateTime } from '@/lib/format';

export const maxDuration = 300; // the "Find new jobs" button runs the whole search from this page
export const dynamic = 'force-dynamic';

export default async function JobsPage() {
  const { supabase } = await requireOwner();
  await ensureProfile(supabase);
  const [{ data: jobs }, { data: runs }] = await Promise.all([
    supabase.from('jh_jobs').select('id, title, company, status, apply_url, apply_method, apply_email, summary, advice, match_score, match_band, scored_by, eligibility_label, trust_label, salary_text, posted_at, deadline, location, job_type, seniority, role_families, is_repost, applied_at, found_at, jh_job_sources(count)').order('match_score', { ascending: false }).limit(1000),
    supabase.from('jh_runs').select('started_at, summary, trigger').order('started_at', { ascending: false }).limit(1),
  ]);
  const list = (jobs ?? []).map((j: any) => ({ ...j, source_count: j.jh_job_sources?.[0]?.count ?? 1 })) as BoardJob[];
  const last = runs?.[0] ? { when: fmtDateTime(runs[0].started_at), summary: runs[0].summary ?? '', trigger: runs[0].trigger } : null;
  return (
    <main className="wrap">
      <Nav current="/" />
      <JobsBoard jobs={list} lastRun={last} aiOn={aiEnabled()} />
    </main>
  );
}
