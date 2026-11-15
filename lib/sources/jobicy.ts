import type { RawJob } from '../types';
import { getJson, iso } from './http';

// Jobicy public API. Terms: credit Jobicy with a direct link, and apply buttons must go to the Jobicy job URL.
const TAGS = ['', 'automation', 'crm', 'data analyst', 'operations'];

export async function jobicy(): Promise<RawJob[]> {
  const results = await Promise.allSettled(TAGS.map((t) =>
    getJson<{ jobs: any[] }>(`https://jobicy.com/api/v2/remote-jobs?count=100${t ? `&tag=${encodeURIComponent(t)}` : ''}`)));
  const ok = results.filter((r): r is PromiseFulfilledResult<{ jobs: any[] }> => r.status === 'fulfilled');
  if (!ok.length) throw (results[0] as PromiseRejectedResult).reason;
  return ok.flatMap((r) => r.value.jobs || []).map((j) => ({
    source: 'jobicy', sourceUrl: j.url, title: j.jobTitle, company: j.companyName,
    descriptionHtml: j.jobDescription || j.jobExcerpt || '', locationText: j.jobGeo || '', remote: true,
    jobType: Array.isArray(j.jobType) ? j.jobType.join(', ') : j.jobType, seniority: j.jobLevel,
    salaryText: j.salaryMin || j.salaryMax
      ? `${j.salaryCurrency || ''} ${[j.salaryMin, j.salaryMax].filter(Boolean).map((n: number) => Number(n).toLocaleString('en-US')).join('–')} / ${j.salaryPeriod || 'year'}`.trim()
      : undefined,
    postedAt: iso(j.pubDate), tags: j.jobIndustry || [],
  }));
}
