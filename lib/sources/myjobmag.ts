import type { RawJob } from '../types';
import { getText, iso, sleep } from './http';
import { clean, jsonLd } from './html';

// MyJobMag: Nigerian job board. Its job pages carry standard job data (schema.org JobPosting).
// robots.txt allows the field lists and job pages (only search-with-? URLs are off limits, so we use none).
const BASE = 'https://www.myjobmag.com';
const LISTS = ['/jobs-by-field/information-technology', '/jobs-by-field/information-technology/2'];

export async function myjobmag(): Promise<RawJob[]> {
  const seen = new Map<string, RawJob>();
  for (const path of LISTS) {
    const html = await getText(BASE + path);
    for (const m of html.matchAll(/<a href="(\/job\/[^"?#]+)"[^>]*>([^<]{4,200})<\/a>/g)) {
      const text = clean(m[2]);
      const at = text.lastIndexOf(' at ');
      if (at < 1 || seen.has(m[1])) continue;
      seen.set(m[1], {
        source: 'myjobmag', sourceUrl: BASE + m[1], title: text.slice(0, at), company: text.slice(at + 4),
        descriptionHtml: '', locationText: 'Nigeria', remote: false,
      });
    }
    await sleep(800);
  }
  return [...seen.values()];
}

// Detail page: full description, dates, location and job type from the page's JobPosting data.
export async function myjobmagDetail(job: RawJob): Promise<RawJob> {
  const html = await getText(job.sourceUrl);
  const jp = jsonLd(html).find((x) => x?.['@type'] === 'JobPosting');
  if (!jp) return job;
  const locs = (Array.isArray(jp.jobLocation) ? jp.jobLocation : [jp.jobLocation]).filter(Boolean)
    .map((l: any) => [l.address?.addressLocality, l.address?.addressRegion].filter(Boolean).join(', ')).filter(Boolean);
  const remote = /telecommute|remote/i.test(`${jp.jobLocationType ?? ''} ${jp.title} ${locs.join(' ')}`);
  return {
    ...job,
    title: clean(jp.title || job.title),
    company: clean(jp.hiringOrganization?.name || job.company),
    companyWebsite: jp.hiringOrganization?.sameAs || jp.hiringOrganization?.url || undefined,
    descriptionHtml: jp.description || '',
    locationText: `${locs[0] || 'Nigeria'}, Nigeria`,
    remote,
    jobType: Array.isArray(jp.employmentType) ? jp.employmentType.join(', ') : jp.employmentType,
    postedAt: iso(jp.datePosted), deadline: iso(jp.validThrough),
  };
}
