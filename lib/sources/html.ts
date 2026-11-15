import { decodeEntities } from '../pipeline/text';

// Small helpers for the few job sites that publish plain web pages (and allow reading them).
export const clean = (s: string) => decodeEntities((s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const MONTHS: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
// "13 Nov 2026" or "13 November 2026" -> ISO date
export function dayMonthYear(s: string): string | undefined {
  const m = (s || '').match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?\s+(\d{4})/);
  if (!m || MONTHS[m[2].toLowerCase()] == null) return undefined;
  return new Date(Date.UTC(+m[3], MONTHS[m[2].toLowerCase()], +m[1], 12)).toISOString();
}

export function jsonLd(html: string): any[] {
  const out: any[] = [];
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const d = JSON.parse(m[1].trim());
      for (const x of Array.isArray(d) ? d : d['@graph'] ?? [d]) out.push(x);
    } catch { /* skip broken blocks */ }
  }
  return out;
}

// Runs async work a few at a time, so we never hammer a site.
export async function pool<T, R>(items: T[], size: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  return out;
}
