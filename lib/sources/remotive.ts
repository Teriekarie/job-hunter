import type { RawJob } from '../types';
import { getJson, iso } from './http';

// Remotive public API. Terms: link back to Remotive and name it as the source; call at most ~4 times a day.
export async function remotive(): Promise<RawJob[]> {
  const d = await getJson<{ jobs: any[] }>('https://remotive.com/api/remote-jobs');
  return (d.jobs || []).map((j) => ({
    source: 'remotive', sourceUrl: j.url, title: j.title, company: j.company_name,
    descriptionHtml: j.description || '', locationText: j.candidate_required_location || '', remote: true,
    jobType: (j.job_type || '').replace(/_/g, '-'), salaryText: j.salary || undefined,
    postedAt: iso(j.publication_date), tags: j.tags || [],
  }));
}
