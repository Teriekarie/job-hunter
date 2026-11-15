import type { RawJob } from '../types';
import { getJson, iso, sleep } from './http';

// Himalayas public API. Terms: visible link back. It limits how often you can call, so we ask only a few times.
const QUERIES = ['automation', 'crm', 'data analyst', 'revenue operations'];

function map(j: any): RawJob {
  const pay = j.minSalary || j.maxSalary
    ? `${j.currency || ''} ${[j.minSalary, j.maxSalary].filter(Boolean).map((n: number) => Number(n).toLocaleString('en-US')).join('–')} / ${j.salaryPeriod || 'year'}`.trim()
    : undefined;
  return {
    source: 'himalayas', sourceUrl: j.applicationLink || j.guid, title: j.title, company: j.companyName,
    descriptionHtml: j.description || j.excerpt || '',
    locationText: Array.isArray(j.locationRestrictions) && j.locationRestrictions.length ? j.locationRestrictions.join(', ') : '',
    locationList: Array.isArray(j.locationRestrictions) ? j.locationRestrictions : null,
    remote: true, jobType: j.employmentType, seniority: Array.isArray(j.seniority) ? j.seniority.join(', ') : j.seniority,
    salaryText: pay, postedAt: iso(j.pubDate), deadline: iso(j.expiryDate), tags: j.categories || [],
  };
}

export async function himalayas(): Promise<RawJob[]> {
  const out: RawJob[] = [];
  let firstError: unknown;
  for (const q of QUERIES) {
    try {
      const d = await getJson<{ jobs: any[] }>(`https://himalayas.app/jobs/api/search?q=${encodeURIComponent(q)}&sort=recent`);
      out.push(...(d.jobs || []).map(map));
    } catch (e) { firstError ??= e; break; }
    await sleep(1500);
  }
  if (!out.length && firstError) throw firstError;
  return out;
}
