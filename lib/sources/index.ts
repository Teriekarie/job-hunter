import type { RawJob, SourceStat } from '../types';
import { remotive } from './remotive';
import { himalayas } from './himalayas';
import { jobicy } from './jobicy';
import { remoteok } from './remoteok';
import { arbeitnow } from './arbeitnow';
import { workingnomads } from './workingnomads';
import { workafro, workafroDetail } from './workafro';
import { myjobmag, myjobmagDetail } from './myjobmag';
import { pool } from './html';
import { employerDetail, employers, findDirectApplyLink, type Board } from './employers';

// To add a new job board: write one file that returns RawJob[], then add it to this list.
// `detail` (optional) opens a job's own page for more facts. It only runs for jobs that match her roles.
export const SOURCES: { id: string; name: string; home: string; fetch: () => Promise<RawJob[]>; detail?: (j: RawJob) => Promise<RawJob> }[] = [
  { id: 'remotive', name: 'Remotive', home: 'https://remotive.com', fetch: remotive },
  { id: 'himalayas', name: 'Himalayas', home: 'https://himalayas.app', fetch: himalayas },
  { id: 'jobicy', name: 'Jobicy', home: 'https://jobicy.com', fetch: jobicy },
  { id: 'remoteok', name: 'Remote OK', home: 'https://remoteok.com', fetch: remoteok },
  { id: 'arbeitnow', name: 'Arbeitnow', home: 'https://www.arbeitnow.com', fetch: arbeitnow },
  { id: 'workingnomads', name: 'Working Nomads', home: 'https://www.workingnomads.com', fetch: workingnomads },
  { id: 'workafro', name: 'Workafro', home: 'https://workafro.com', fetch: workafro, detail: workafroDetail },
  { id: 'myjobmag', name: 'MyJobMag', home: 'https://www.myjobmag.com', fetch: myjobmag, detail: myjobmagDetail },
];

// Opens the detail page of matching jobs (at most `limit`, a few at a time). A failed page keeps the short version.
const detailFor = (j: RawJob) => (j.source === 'employer' ? (j.detailRef ? employerDetail : undefined) : SOURCES.find((s) => s.id === j.source)?.detail);
export async function addDetails(jobs: RawJob[], limit = 160): Promise<RawJob[]> {
  const want = jobs.filter((j) => detailFor(j))
    .sort((a, b) => (b.postedAt ?? '').localeCompare(a.postedAt ?? '')) // newest first, in case we hit the limit
    .slice(0, limit);
  const done = new Map<RawJob, RawJob>();
  await pool(want, 6, async (j) => {
    try { done.set(j, await detailFor(j)!(j)); } catch { /* keep the list version */ }
  });
  return jobs.map((j) => done.get(j) ?? j);
}

// Boards no longer searched, kept so older jobs still show a readable name.
// We Work Remotely was removed in Nov 2026: its apply links always went through WWR, never to the employer.
const RETIRED: Record<string, string> = { wwr: 'We Work Remotely', user_link: 'Added by you', employer: "Company's own careers page" };
export const sourceName = (id: string) => SOURCES.find((s) => s.id === id)?.name ?? RETIRED[id] ?? id;

// Pull from every job site and every watched company at the same time. If one fails, the others still count.
export async function collectAll(boards: Board[] = []): Promise<{ jobs: RawJob[]; stats: SourceStat[] }> {
  const direct = boards.length ? employers(boards) : Promise.resolve({ jobs: [], failed: [] as string[] });
  const results = await Promise.allSettled(SOURCES.map((s) => s.fetch()));
  const jobs: RawJob[] = [];
  const stats: SourceStat[] = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      const good = r.value.filter((j) => j.title && j.company && /^https?:\/\//.test(j.sourceUrl || ''));
      jobs.push(...good);
      stats.push({ source: SOURCES[i].id, found: good.length });
    } else {
      stats.push({ source: SOURCES[i].id, found: 0, error: String(r.reason?.message || r.reason).slice(0, 200) });
    }
  });
  // Use the company's own application link when a job site's description contains one.
  for (const j of jobs) if (!j.employerApplyUrl) j.employerApplyUrl = findDirectApplyLink(j.descriptionHtml);
  const d = await direct;
  if (boards.length) {
    jobs.push(...d.jobs);
    stats.push({ source: 'employer', found: d.jobs.length,
      error: d.failed.length ? `${d.failed.length} of ${boards.length} companies could not be read: ${d.failed.slice(0, 6).join(', ')}${d.failed.length > 6 ? '…' : ''}` : undefined });
  }
  return { jobs, stats };
}
