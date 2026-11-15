import type { RawJob } from '../types';
import { getText, sleep } from './http';
import { clean, dayMonthYear } from './html';

// Workafro: remote jobs open to people living in Africa. Its robots.txt welcomes all crawlers.
// We read the "Remote jobs you can do from Nigeria" list (a few pages, politely), and later open
// the detail page only for jobs that match her roles, to get the employer's own apply link.
const BASE = 'https://workafro.com';
const PAGES = 4;

export async function workafro(): Promise<RawJob[]> {
  const out: RawJob[] = [];
  for (let p = 1; p <= PAGES; p++) {
    const html = await getText(`${BASE}/remote-jobs-in-nigeria/${p > 1 ? `page/${p}/` : ''}`);
    for (const m of html.matchAll(/<a class="jrow" href="(\/jobs\/[^"]+)">([\s\S]*?)<\/a>/g)) {
      const card = m[2];
      const title = clean(card.match(/class="jt">([\s\S]*?)<\/span>/)?.[1] ?? '');
      const company = clean(card.match(/class="jc-co">([\s\S]*?)<\/span>/)?.[1] ?? '');
      const tag = clean(card.match(/<span class="tag">([\s\S]*?)<\/span>/)?.[1] ?? '');
      const date = clean(card.match(/class="jdate">([\s\S]*?)<\/span>/)?.[1] ?? '');
      const cat = clean(card.match(/class="tag tag-dim">([\s\S]*?)<\/span>/)?.[1] ?? '');
      if (!title || !company) continue;
      out.push({
        source: 'workafro', sourceUrl: BASE + m[1], title, company,
        descriptionHtml: '', locationText: tag.replace(/^Remote\s*·\s*/i, ''), remote: /remote/i.test(tag),
        postedAt: dayMonthYear(date), tags: cat ? [cat] : [],
      });
    }
    if (p < PAGES) await sleep(800);
  }
  return out;
}

// Detail page: who can apply (in plain words), posting date, and the employer's apply link.
export async function workafroDetail(job: RawJob): Promise<RawJob> {
  const html = await getText(job.sourceUrl);
  const who = clean(html.match(/<section class="who"[\s\S]*?<p>([\s\S]*?)<\/p>/)?.[1] ?? '');
  const employerLink = html.match(/<a [^>]*href="(https?:\/\/[^"]+)"[^>]*data-apply/)?.[1];
  const posted = clean(html.match(/<dt>Posted<\/dt><dd>([\s\S]*?)<\/dd>/)?.[1] ?? '');
  // The named-country list, e.g. Ghana, Kenya, Nigeria... (absent for worldwide / region-wide jobs).
  const whoBlock = html.match(/<section class="who"[\s\S]*?<\/section>/)?.[0] ?? '';
  const countries = [...whoBlock.matchAll(/<\/span>([^<]+)<\/a><\/li>/g)].map((x) => clean(x[1])).filter(Boolean);
  const foundOn = clean(html.match(/<dt>Found on<\/dt><dd>([\s\S]*?)<\/dd>/)?.[1] ?? '');
  return {
    ...job,
    postedAt: dayMonthYear(posted) ?? job.postedAt,
    employerApplyUrl: employerLink ? decodeURI(employerLink) === employerLink ? employerLink : employerLink : undefined,
    descriptionHtml: `<p><strong>Who can apply (Workafro):</strong> ${who || job.locationText}</p>` +
      `<p>The full description, pay and requirements are on the employer's own page${foundOn ? ` (${foundOn})` : ''}. Open "Apply on site" to read them.</p>`,
    locationText: countries.length ? countries.join(', ') : job.locationText,
    locationList: countries.length ? countries : job.locationList,
  };
}
