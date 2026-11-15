import type { RawJob } from '../types';
import { isEmployerLink } from './apply';

// Verified / Needs review / High risk, always with the evidence. A small company is never called a scam.
const RED_FLAGS: [RegExp, string][] = [
  [/\b(registration|training|application|processing|onboarding) fee\b|\bpay (a |an )?(small )?(fee|deposit)\b/i, 'Mentions a fee or deposit paid by the applicant'],
  [/\b(purchase|buy) (your own )?(equipment|laptop|software) (from|through) (us|our)/i, 'Asks you to buy equipment from them'],
  [/\b(interview|contact|reach|message) (us |me |will be )?(via|on|through|over) (telegram|whatsapp|signal)\b/i, 'Interview or contact only by Telegram/WhatsApp'],
  [/\b(bank (account )?details|social security number|ssn|passport (copy|scan)|bvn)\b[^.\n]{0,60}\b(apply|application|before|upfront)/i, 'Asks for bank or ID details early'],
  [/\b(no experience (needed|required))\b[^.\n]{0,80}\$\s?\d{3,}/i, 'High pay promised for no experience'],
];
const FREE_MAIL = /@(gmail|yahoo|outlook|hotmail|proton|protonmail|aol|icloud)\./i;

export function trust(sources: RawJob[], text: string, applyEmail?: string): { label: 'Verified' | 'Needs review' | 'High risk'; checks: string[] } {
  const checks: string[] = [];
  const flags = RED_FLAGS.filter(([re]) => re.test(text)).map(([, why]) => why);
  const boards = [...new Set(sources.map((s) => s.source))];
  const employerLink = sources.some((s) => isEmployerLink(s.sourceUrl) || (s.employerApplyUrl && isEmployerLink(s.employerApplyUrl)));
  const site = sources.find((s) => s.companyWebsite)?.companyWebsite;

  if (boards.length >= 2) checks.push(`Good: listed on ${boards.length} independent job boards with matching details`);
  else checks.push('Check: found on one job board only so far');
  if (employerLink) checks.push("Good: links to the employer's own hiring page");
  if (site) checks.push(`Good: company website is listed (${site})`);
  if (sources.some((s) => s.boardVerified)) checks.push('Good: the job board marks this employer as verified');
  if (applyEmail && FREE_MAIL.test(applyEmail)) checks.push('Check: applications go to a free email address (Gmail, Yahoo...), not a company address');
  if (text.length < 400) checks.push('Check: the description is very short');
  if (!flags.length) checks.push('Good: no requests for payment, ID or bank details in the posting');
  flags.forEach((f) => checks.push(`Warning: ${f}`));

  if (flags.length) return { label: 'High risk', checks };
  if (boards.length >= 2 || employerLink) return { label: 'Verified', checks };
  return { label: 'Needs review', checks };
}
