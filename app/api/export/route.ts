import { db } from '@/lib/supabase/server';
import { stageName } from '@/lib/types';

// Tracker as a spreadsheet (CSV).
export async function GET() {
  const supabase = await db();
  const { data } = await supabase.from('jh_jobs')
    .select('title, company, status, applied_at, applied_via, match_score, eligibility_label, salary_text, location, apply_url, notes, updated_at')
    .not('status', 'in', '(new,not_a_match)').order('applied_at', { ascending: false, nullsFirst: false });
  const cols = ['Job', 'Company', 'Stage', 'Applied on', 'Applied via', 'Match score', 'Who can apply', 'Salary', 'Location', 'Link', 'Notes', 'Last update'];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`;
  const rows = (data ?? []).map((j) => [j.title, j.company, stageName(j.status), j.applied_at?.slice(0, 10), j.applied_via, j.match_score, j.eligibility_label, j.salary_text, j.location, j.apply_url, j.notes, j.updated_at?.slice(0, 10)].map(esc).join(','));
  return new Response([cols.map(esc).join(','), ...rows].join('\r\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="job-applications.csv"' },
  });
}
