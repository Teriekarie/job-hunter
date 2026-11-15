import type { RawJob } from '../types';
import { getJson, iso } from './http';

// Working Nomads public feed. The location field shows country or timezone limits.
export async function workingnomads(): Promise<RawJob[]> {
  const d = await getJson<any[]>('https://www.workingnomads.com/api/exposed_jobs/');
  return d.map((j) => ({
    source: 'workingnomads', sourceUrl: j.url, title: j.title, company: j.company_name,
    descriptionHtml: j.description || '', locationText: j.location || '', remote: true,
    postedAt: iso(j.pub_date), tags: j.tags ? String(j.tags).split(',') : [],
  }));
}
