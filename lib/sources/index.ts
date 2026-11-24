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

// Opens the detail page of matching jobs (at most `limit`, 3 at a time). A failed page keeps the short version.
export async function addDetails(jobs: RawJob[], limit = 40): Promise<RawJob[]> {
  const want = jobs.filter((j) => SOURCES.find((s) => s.id === j.source)?.detail).slice(0, limit);
  const done = new Map<RawJob, RawJob>();
  await pool(want, 3, async (j) => {
    try { done.set(j, await SOURCES.find((s) => s.id === j.source)!.detail!(j)); } catch { /* keep the list version */ }
  });
  return jobs.map((j) => done.get(j) ?? j);
}

// Boards no longer searched, kept so older jobs still show a readable name.
// We Work Remotely was removed in Nov 2026: its apply links always went through WWR, never to the employer.
const RETIRED: Record<string, string> = { wwr: 'We Work Remotely', user_link: 'Added by you' };
export const sourceName = (id: string) => SOURCES.find((s) => s.id === id)?.name ?? RETIRED[id] ?? id;

// Pull from every board at the same time. If one board fails, the others still count.
export async function collectAll(): Promise<{ jobs: RawJob[]; stats: SourceStat[] }> {
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
  return { jobs, stats };
}
