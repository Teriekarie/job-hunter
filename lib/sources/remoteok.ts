import type { RawJob } from '../types';
import { getJson, iso } from './http';

// Remote OK public feed. Terms: credit Remote OK and link back to the job page.
// Remote OK sometimes sends text with broken accents and bullets ("â¢"). This repairs it.
function fix(s: string): string {
  if (!/[\u00c2\u00c3\u00e2][\u0080-\u00bf]/.test(s)) return s;
  const out = Buffer.from(s, 'latin1').toString('utf8');
  return out.includes('\ufffd') ? s : out;
}

export async function remoteok(): Promise<RawJob[]> {
  const d = await getJson<any[]>('https://remoteok.com/api');
  return d.filter((j) => j && j.id && j.position).map((j) => ({
    source: 'remoteok', sourceUrl: j.url || j.apply_url, title: j.position, company: j.company,
    descriptionHtml: fix(j.description || ''), locationText: fix(j.location || ''), remote: true,
    salaryText: j.salary_min > 0 ? `USD ${Number(j.salary_min).toLocaleString('en-US')}–${Number(j.salary_max).toLocaleString('en-US')} / year` : undefined,
    postedAt: iso(j.date), tags: j.tags || [], boardVerified: !!j.verified,
  }));
}
