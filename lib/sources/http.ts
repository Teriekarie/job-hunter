const UA = 'Mozilla/5.0 (compatible; job-hunter-personal/1.0; single-user job search tool)';

export async function getJson<T = any>(url: string, timeoutMs = 20000): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(timeoutMs), cache: 'no-store' });
  if (res.status === 429) throw new Error('The site is busy (too many requests). It will be tried again next search.');
  if (!res.ok) throw new Error(`The site answered with error ${res.status}`);
  return (await res.json()) as T;
}

export async function getText(url: string, timeoutMs = 20000): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(timeoutMs), cache: 'no-store' });
  if (!res.ok) throw new Error(`The site answered with error ${res.status}`);
  return await res.text();
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const iso = (d: unknown): string | undefined => {
  if (d == null || d === '') return undefined;
  const dt = typeof d === 'number' ? new Date(d * 1000) : new Date(String(d));
  return isNaN(dt.getTime()) ? undefined : dt.toISOString();
};
