import type { RawJob, SourceStat } from '../types';
import { remotive } from './remotive';
import { himalayas } from './himalayas';
import { jobicy } from './jobicy';
import { remoteok } from './remoteok';
import { wwr } from './wwr';
import { arbeitnow } from './arbeitnow';
import { workingnomads } from './workingnomads';

// To add a new job board: write one file that returns RawJob[], then add it to this list.
export const SOURCES: { id: string; name: string; home: string; fetch: () => Promise<RawJob[]> }[] = [
  { id: 'remotive', name: 'Remotive', home: 'https://remotive.com', fetch: remotive },
  { id: 'himalayas', name: 'Himalayas', home: 'https://himalayas.app', fetch: himalayas },
  { id: 'jobicy', name: 'Jobicy', home: 'https://jobicy.com', fetch: jobicy },
  { id: 'remoteok', name: 'Remote OK', home: 'https://remoteok.com', fetch: remoteok },
  { id: 'wwr', name: 'We Work Remotely', home: 'https://weworkremotely.com', fetch: wwr },
  { id: 'arbeitnow', name: 'Arbeitnow', home: 'https://www.arbeitnow.com', fetch: arbeitnow },
  { id: 'workingnomads', name: 'Working Nomads', home: 'https://www.workingnomads.com', fetch: workingnomads },
];

export const sourceName = (id: string) =>
  SOURCES.find((s) => s.id === id)?.name ?? (id === 'user_link' ? 'Added by you' : id);

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
