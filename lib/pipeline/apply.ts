// How does the employer want applications: by email, or through a link?
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const APPLY_WORDS = /(apply|application|send|email|e-mail|submit|cv|resume|résumé|cover letter|portfolio)/i;
const NOT_APPLY = /(accommodat|disabilit|privacy|gdpr|unsubscribe|support@|press@|legal@|abuse@|security@|dpo@)/i;

export function applyMethod(text: string): { method: 'link' | 'email'; email?: string; subject?: string } {
  for (const m of text.matchAll(EMAIL)) {
    const i = m.index ?? 0;
    const around = text.slice(Math.max(0, i - 160), i + m[0].length + 80);
    if (APPLY_WORDS.test(around) && !NOT_APPLY.test(around)) {
      const subj = text.match(/subject(?:\s+line)?\s*(?:of|as|should be|must be|:|-|–)?\s*[:\-–]?\s*["“']([^"”'\n]{4,140})["”']/i)
        || text.match(/subject(?:\s+line)?\s*:\s*([^\n.]{4,140})/i);
      return { method: 'email', email: m[0].replace(/\.$/, ''), subject: subj?.[1]?.trim() };
    }
  }
  return { method: 'link' };
}

const ATS = /(gh_jid=|jobs\.workable\.com|apply\.workable\.com|greenhouse\.io|lever\.co|ashbyhq\.com|workable\.com|smartrecruiters\.com|bamboohr\.com|recruitee\.com|teamtailor\.com|myworkdayjobs\.com|breezy\.hr|jobvite\.com|icims\.com|personio\.)/i;
export const isEmployerLink = (url: string) => ATS.test(url);
