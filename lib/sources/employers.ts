import type { RawJob } from '../types';
import { getJson, iso, sleep } from './http';
import { decodeEntities } from '../pipeline/text';
import { pool } from './html';

// Jobs straight from companies' own hiring pages (Greenhouse, Lever, Ashby, Workable, SmartRecruiters).
// These systems publish each company's open jobs publicly. Applying goes to the company's own form,
// which almost never needs an account. The company list lives in jh_companies (Profile page).

export type Ats = 'greenhouse' | 'lever' | 'ashby' | 'workable' | 'smartrecruiters';
export type Board = { ats: Ats; slug: string; name: string };

const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; job-hunter-personal/1.0; single-user job search tool)' };

// ---------- reading each system's job list ----------

async function greenhouse(b: Board): Promise<RawJob[]> {
  const d = await getJson<{ jobs: any[] }>(`https://boards-api.greenhouse.io/v1/boards/${b.slug}/jobs`);
  return (d.jobs || []).map((j) => ({
    source: 'employer', sourceUrl: j.absolute_url, title: j.title, company: b.name,
    descriptionHtml: '', locationText: j.location?.name || '', remote: /remote|home[- ]based|anywhere|worldwide/i.test(j.location?.name || ''),
    postedAt: iso(j.first_published || j.updated_at), employerApplyUrl: j.absolute_url,
    detailRef: `https://boards-api.greenhouse.io/v1/boards/${b.slug}/jobs/${j.id}`,
  }));
}

async function lever(b: Board): Promise<RawJob[]> {
  const d = await getJson<any[]>(`https://api.lever.co/v0/postings/${b.slug}?mode=json`);
  return (Array.isArray(d) ? d : []).map((j) => {
    const lists = (j.lists || []).map((l: any) => `<h3>${l.text}</h3><ul>${l.content}</ul>`).join('');
    const locs: string[] = j.categories?.allLocations?.length ? j.categories.allLocations : [j.categories?.location].filter(Boolean);
    return {
      source: 'employer', sourceUrl: j.hostedUrl, title: j.text, company: b.name,
      descriptionHtml: `${j.description || ''}${lists}${j.additional || ''}`,
      locationText: locs.join(', '), remote: j.workplaceType === 'remote' || /remote|global|anywhere/i.test(locs.join(' ')),
      jobType: j.categories?.commitment, postedAt: iso(j.createdAt ? j.createdAt / 1000 : undefined), employerApplyUrl: j.applyUrl || j.hostedUrl,
    };
  });
}

async function ashby(b: Board): Promise<RawJob[]> {
  const d = await getJson<{ jobs: any[] }>(`https://api.ashbyhq.com/posting-api/job-board/${b.slug}?includeCompensation=true`);
  return (d.jobs || []).filter((j) => j.isListed !== false).map((j) => {
    const locs = [j.location, ...(j.secondaryLocations || []).map((s: any) => s.location)].filter(Boolean);
    return {
      source: 'employer', sourceUrl: j.jobUrl, title: j.title, company: b.name,
      descriptionHtml: j.descriptionHtml || '', locationText: locs.join(', '),
      remote: !!j.isRemote || j.workplaceType === 'Remote', jobType: j.employmentType,
      salaryText: j.compensation?.compensationTierSummary || j.compensation?.scrapeableCompensationSalarySummary || undefined,
      postedAt: iso(j.publishedAt), employerApplyUrl: j.applyUrl || j.jobUrl,
    };
  });
}

async function workable(b: Board): Promise<RawJob[]> {
  const res = await fetch(`https://apply.workable.com/api/v3/accounts/${b.slug}/jobs`, {
    method: 'POST', headers: { ...UA, 'Content-Type': 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(20000),
    body: JSON.stringify({ query: '', location: [], department: [], worktype: [], remote: [] }),
  });
  if (res.status === 429) throw new Error('Workable is busy (too many requests); skipped this time.');
  if (!res.ok) throw new Error(`Workable answered with error ${res.status}`);
  const d = await res.json();
  return (d.results || []).map((j: any) => {
    const locs = (j.locations?.length ? j.locations : [j.location]).filter(Boolean).map((l: any) => [l.city, l.country].filter(Boolean).join(', ')).filter(Boolean);
    const url = `https://apply.workable.com/${b.slug}/j/${j.shortcode}/`;
    return {
      source: 'employer', sourceUrl: url, title: j.title, company: b.name, descriptionHtml: '',
      locationText: (j.remote ? 'Remote' + (locs.length ? ' · ' : '') : '') + locs.join(' | '), remote: !!j.remote || j.workplace === 'remote',
      jobType: j.type, postedAt: iso(j.published || j.created), employerApplyUrl: url,
      detailRef: `https://apply.workable.com/api/v2/accounts/${b.slug}/jobs/${j.shortcode}`,
    };
  });
}

async function smartrecruiters(b: Board): Promise<RawJob[]> {
  const d = await getJson<{ content: any[] }>(`https://api.smartrecruiters.com/v1/companies/${b.slug}/postings?limit=100`);
  return (d.content || []).map((j) => {
    const loc = j.location || {};
    const url = `https://jobs.smartrecruiters.com/${b.slug}/${j.id}`;
    return {
      source: 'employer', sourceUrl: url, title: j.name, company: j.company?.name || b.name, descriptionHtml: '',
      locationText: [loc.remote ? 'Remote' : '', loc.fullLocation || [loc.city, loc.country?.toUpperCase()].filter(Boolean).join(', ')].filter(Boolean).join(' · '),
      remote: !!loc.remote, jobType: j.typeOfEmployment?.label, seniority: j.experienceLevel?.label !== 'Not Applicable' ? j.experienceLevel?.label : undefined,
      postedAt: iso(j.releasedDate), employerApplyUrl: url, detailRef: j.ref,
    };
  });
}

const READERS: Record<Ats, (b: Board) => Promise<RawJob[]>> = { greenhouse, lever, ashby, workable, smartrecruiters };

// Read every watched company's board. Workable is asked one company at a time, slowly (it limits requests).
export async function employers(boards: Board[]): Promise<{ jobs: RawJob[]; failed: string[] }> {
  const jobs: RawJob[] = [];
  const failed: string[] = [];
  const fast = boards.filter((b) => b.ats !== 'workable');
  const slow = boards.filter((b) => b.ats === 'workable');
  await pool(fast, 8, async (b) => {
    try { jobs.push(...(await READERS[b.ats](b))); } catch { failed.push(b.name); }
  });
  for (const b of slow) {
    try { jobs.push(...(await workable(b))); } catch { failed.push(b.name); }
    await sleep(1200);
  }
  return { jobs: jobs.filter((j) => j.title && j.sourceUrl), failed };
}

// ---------- full details for the jobs that match her roles ----------

export async function employerDetail(job: RawJob): Promise<RawJob> {
  if (!job.detailRef) return job;
  const host = new URL(job.detailRef).hostname;
  if (host.includes('greenhouse')) {
    const d = await getJson<any>(job.detailRef);
    return { ...job, descriptionHtml: decodeEntities(d.content || ''), postedAt: iso(d.first_published) ?? job.postedAt,
      deadline: iso(d.application_deadline) ?? job.deadline, locationText: d.location?.name || job.locationText };
  }
  if (host.includes('workable')) {
    await sleep(800);
    const res = await fetch(job.detailRef, { headers: UA, cache: 'no-store', signal: AbortSignal.timeout(20000) });
    if (!res.ok) return job;
    const d = await res.json();
    return { ...job, descriptionHtml: [d.description, d.requirements && `<h3>Requirements</h3>${d.requirements}`, d.benefits && `<h3>Benefits</h3>${d.benefits}`].filter(Boolean).join('') };
  }
  if (host.includes('smartrecruiters')) {
    const d = await getJson<any>(job.detailRef);
    const s = d.jobAd?.sections || {};
    const html = ['jobDescription', 'qualifications', 'additionalInformation', 'companyDescription'].map((k) => s[k] && `<h3>${s[k].title || ''}</h3>${s[k].text || ''}`).filter(Boolean).join('');
    return { ...job, descriptionHtml: html, employerApplyUrl: d.applyUrl || job.employerApplyUrl };
  }
  return job;
}

// ---------- finding companies' hiring pages inside other job sites' data ----------

// A link to one job on a company's hiring page (used as the direct apply link).
const JOB_LINKS: [Ats, RegExp][] = [
  ['greenhouse', /https?:\/\/(?:job-boards|boards)(?:\.eu|\.anz)?\.greenhouse\.io\/([a-z0-9_-]+)\/jobs\/\d+/i],
  ['lever', /https?:\/\/jobs\.(?:eu\.)?lever\.co\/([a-z0-9_.-]+)\/[0-9a-f-]{36}/i],
  ['ashby', /https?:\/\/jobs\.ashbyhq\.com\/([A-Za-z0-9_.%-]+)\/[0-9a-f-]{36}/i],
  ['workable', /https?:\/\/apply\.workable\.com\/([a-z0-9_-]+)\/j\/[A-Z0-9]+/i],
  ['smartrecruiters', /https?:\/\/jobs\.smartrecruiters\.com\/([A-Za-z0-9_-]+)\/\d+[^\s"'<]*/i],
];
// A link to a company's whole board (used to add the company to the list).
const BOARD_LINKS: [Ats, RegExp][] = [
  ['greenhouse', /(?:job-boards|boards)(?:\.eu|\.anz)?\.greenhouse\.io\/(?:embed\/job_board\?for=)?([a-z0-9_-]+)/gi],
  ['lever', /jobs\.(?:eu\.)?lever\.co\/([a-z0-9_.-]+)/gi],
  ['ashby', /jobs\.ashbyhq\.com\/([A-Za-z0-9_.%-]+)/gi],
  ['workable', /apply\.workable\.com\/([a-z0-9_-]+)/gi],
  ['smartrecruiters', /(?:jobs|careers)\.smartrecruiters\.com\/([A-Za-z0-9_-]+)/gi],
];
const NOT_SLUGS = new Set(['embed', 'api', 'v1', 'jobs', 'j', 'view', 'search', 'oneclick-ui', 'company']);

export function findDirectApplyLink(text: string): string | undefined {
  for (const [, re] of JOB_LINKS) {
    const m = text.match(re);
    if (m && !NOT_SLUGS.has(m[1].toLowerCase())) return m[0].replace(/[).,;]+$/, '');
  }
  return undefined;
}

export function findBoards(jobs: RawJob[]): Board[] {
  const out = new Map<string, Board>();
  for (const j of jobs) {
    if (j.source === 'employer') continue;
    const text = `${j.descriptionHtml} ${j.employerApplyUrl ?? ''}`;
    for (const [ats, re] of BOARD_LINKS) for (const m of text.matchAll(re)) {
      const slug = decodeURIComponent(m[1]).toLowerCase();
      if (NOT_SLUGS.has(slug) || slug.length < 2) continue;
      out.set(`${ats}:${slug}`, { ats, slug, name: j.company });
    }
  }
  return [...out.values()];
}

// Turn a careers-page link she pastes into a board. Returns null if the hiring system is not supported.
export function boardFromUrl(url: string, name: string): Board | null {
  for (const [ats, re] of BOARD_LINKS) {
    const m = new RegExp(re.source, 'i').exec(url);
    if (m && !NOT_SLUGS.has(m[1].toLowerCase())) return { ats, slug: decodeURIComponent(m[1]).toLowerCase(), name };
  }
  return null;
}
