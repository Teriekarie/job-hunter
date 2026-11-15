import type { RawJob } from '../types';
import { getJson, iso } from './http';

// Arbeitnow public API (mostly Europe). Useful for relocation / visa-sponsorship roles. Please link back.
export async function arbeitnow(): Promise<RawJob[]> {
  const d = await getJson<{ data: any[] }>('https://www.arbeitnow.com/api/job-board-api');
  return (d.data || []).map((j) => ({
    source: 'arbeitnow', sourceUrl: j.url, title: j.title, company: j.company_name,
    descriptionHtml: j.description || '', locationText: j.location || '', remote: !!j.remote,
    jobType: Array.isArray(j.job_types) ? j.job_types.join(', ') : undefined,
    postedAt: iso(j.created_at), tags: j.tags || [],
  }));
}
