export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos' }) : '';
export const fmtDateTime = (d?: string | null) =>
  d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos' }) : '';
export const daysAgo = (d?: string | null) => (d ? Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000)) : null);
export const daysUntil = (d?: string | null) => (d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null);
export const postedLabel = (d?: string | null) => {
  const n = daysAgo(d);
  return n == null ? 'Posting date not given' : n === 0 ? 'Posted today' : n === 1 ? 'Posted yesterday' : `Posted ${n} days ago`;
};
export const eligClass = (l?: string | null) => (l === 'Unclear' ? 'w' : l === 'EMEA' || l === 'Relocation supported' ? 'u' : 'g');
export const eligText = (l?: string | null) => (l === 'Unclear' ? 'Check who can apply' : l ?? '');
export const trustClass = (l?: string | null) => (l === 'Verified' ? 'g' : l === 'High risk' ? 'r' : 'w');
export const ringClass = (s?: number | null) => ((s ?? 0) >= 70 ? 'hi' : (s ?? 0) >= 55 ? 'mid' : 'lo');
export const initials = (company: string) =>
  company.replace(/\(.*?\)/g, '').split(/[\s\-&.,]+/).filter((w) => /^[A-Za-z0-9]/.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '·';
