const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…', bull: '•' };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x10ffff ? String.fromCodePoint(n) : ' ';
    }
    return ENT[e.toLowerCase()] ?? m;
  });
}

// Turn job-board HTML into plain readable text (keeps paragraphs and bullet points).
export function htmlToText(html: string): string {
  let s = html || '';
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ');
  s = s.replace(/<li[^>]*>/gi, '\n• ').replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/(p|div|h[1-6]|ul|ol|tr|section)>/gi, '\n\n').replace(/<h[1-6][^>]*>/gi, '\n\n');
  s = s.replace(/<[^>]+>/g, ' ');
  s = decodeEntities(decodeEntities(s));
  s = s.replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

export const norm = (s: string) =>
  (s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();

export function normCompany(s: string): string {
  return norm(s).replace(/\b(inc|llc|ltd|limited|gmbh|corp|corporation|co|company|plc|group|sa|bv|ag|pty|io|ai|hq)\b/g, ' ').replace(/\s+/g, ' ').trim() || norm(s);
}

export function normTitle(s: string): string {
  return norm(s.replace(/\([^)]*\)/g, ' ').replace(/\s[-–|].*$/, ' '))
    .replace(/\b(remote|worldwide|anywhere|m f d|f m d|w m d|contract|full time|part time|hybrid)\b/g, ' ')
    .replace(/\s+/g, ' ').trim() || norm(s);
}

export const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Does the text mention this term as a whole word? ("Make" must not match "makes")
export function mentions(text: string, term: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${escapeRe(term.toLowerCase())}($|[^a-z0-9])`, 'i').test(text);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}
