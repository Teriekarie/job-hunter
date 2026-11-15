import { XMLParser } from 'fast-xml-parser';
import type { RawJob } from '../types';
import { getText, iso } from './http';

// We Work Remotely RSS feeds. The <region> field says who can apply ("Anywhere in the World", "USA Only"...).
const FEEDS = [
  'https://weworkremotely.com/remote-jobs.rss',
  'https://weworkremotely.com/categories/remote-customer-support-jobs.rss',
  'https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss',
  'https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss',
  'https://weworkremotely.com/categories/all-other-remote-jobs.rss',
];

export async function wwr(): Promise<RawJob[]> {
  const parser = new XMLParser({ ignoreAttributes: true, processEntities: true, htmlEntities: false });
  const results = await Promise.allSettled(FEEDS.map((f) => getText(f, 25000)));
  const ok = results.filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled');
  if (!ok.length) throw (results[0] as PromiseRejectedResult).reason;
  const out: RawJob[] = [];
  for (const r of ok) {
    const items = parser.parse(r.value)?.rss?.channel?.item;
    for (const it of Array.isArray(items) ? items : items ? [items] : []) {
      const full = String(it.title || '');
      const i = full.indexOf(': ');
      const company = i > 0 ? full.slice(0, i) : 'Unknown company';
      const desc = String(it.description || '');
      const site = desc.match(/<strong>URL:<\/strong>\s*<a href="([^"]+)"/i)?.[1];
      out.push({
        source: 'wwr', sourceUrl: String(it.link || it.guid), title: i > 0 ? full.slice(i + 2) : full, company,
        companyWebsite: site, descriptionHtml: desc.replace(/<img[^>]*>/gi, ''),
        locationText: [it.region, it.country].filter((x) => x && String(x).trim()).join(' · '), remote: true,
        jobType: it.type ? String(it.type) : undefined, postedAt: iso(it.pubDate), deadline: iso(it.expires_at),
        tags: it.skills ? String(it.skills).split(/,\s*/) : [],
      });
    }
  }
  return out;
}
