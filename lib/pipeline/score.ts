import type { Eligibility, Gap, SearchProfile } from '../types';
import { mentions } from './text';

// Rule-based fit score (no AI needed). Weights follow docs/architecture.md §6.
// Tools she does not list, but that employers often ask for. Used to spot gaps.
const OTHER_TOOLS = ['Salesforce', 'HubSpot', 'Workato', 'Marketo', 'Pardot', 'Looker', 'dbt', 'Snowflake', 'BigQuery', 'Redshift', 'Databricks',
  'JavaScript', 'TypeScript', 'Node.js', 'React', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jira', 'Asana', 'ClickUp', 'Monday.com',
  'Intercom', 'Zendesk', 'Braze', 'Klaviyo', 'Segment', 'Mixpanel', 'Amplitude', 'Excel', 'Outreach', 'Salesloft', 'Gong', 'Clay', 'Apollo',
  'Retool', 'Bubble', 'UiPath', 'Deluge', 'Shopify', 'NetSuite', 'SAP', 'Tray.io', 'Pipedrive', 'ActiveCampaign', 'Mailchimp', 'RAG', 'vector database'];

export const bandOf = (s: number) => (s >= 85 ? 'Excellent' : s >= 70 ? 'Strong' : s >= 55 ? 'Potential' : 'Stretch');

export type ScoreInput = {
  title: string; text: string; families: string[]; elig: Eligibility; salaryText?: string | null; profile: SearchProfile; yearsExperience: number;
};

export function ruleScore(i: ScoreInput) {
  const mySkills = [...new Set(Object.values(i.profile.skills || {}).flat())];
  const has = mySkills.filter((s) => mentions(i.text, s) || (s === 'Make' && /make\.com|integromat/i.test(i.text)));
  const equivalents: { tool: string; mine: string[] }[] = [];
  const missing: string[] = [];
  for (const t of OTHER_TOOLS) {
    if (!mentions(i.text, t) || mySkills.some((s) => s.toLowerCase() === t.toLowerCase())) continue;
    const eq = Object.entries(i.profile.equivalentTools || {}).find(([k]) => k.toLowerCase().split('/').includes(t.toLowerCase()));
    if (eq) equivalents.push({ tool: t, mine: eq[1] }); else missing.push(t);
  }
  const totalTools = has.length + equivalents.length + missing.length;
  const skills = totalTools === 0 ? 0.45 : Math.min(1, (has.length + 0.7 * equivalents.length) / Math.max(totalTools, 4));

  const yrs = [...i.text.matchAll(/(\d{1,2})\s*\+?\s*(?:-\s*\d{1,2}\s*)?years?/gi)].map((m) => +m[1]).filter((n) => n > 0 && n < 20);
  const need = yrs.length ? Math.min(...yrs) : null;
  const experience = need == null ? 0.75 : need <= i.yearsExperience ? 1 : need <= i.yearsExperience + 2 ? 0.6 : 0.3;

  const role = i.families.length >= 2 ? 1 : i.families.length === 1 ? 0.85 : 0.4;
  const eligMap: Record<string, number> = { 'Worldwide': 1, 'Nigeria eligible': 1, 'Africa eligible': 0.95, 'EMEA': 0.8, 'Relocation supported': 0.7, 'Unclear': 0.5 };
  const elig = eligMap[i.elig.label] ?? 0;

  const t = i.title.toLowerCase();
  const seniorityLabel = /\b(principal|director|head of|vp|vice president|chief|staff)\b/.test(t) ? 'director+'
    : /\b(senior|sr\.?|lead|manager)\b/.test(t) ? 'senior' : /\b(junior|jr\.?|intern|entry|graduate|trainee)\b/.test(t) ? 'junior' : 'mid';
  const seniority = { 'director+': 0.35, senior: 0.85, junior: 0.6, mid: 1 }[seniorityLabel]!;
  const salary = i.salaryText ? 1 : 0.5;

  const score = Math.round(100 * (0.25 * skills + 0.2 * experience + 0.2 * role + 0.2 * elig + 0.1 * seniority + 0.05 * salary));

  const reasons: string[] = [];
  if (has.length) reasons.push(`Uses tools on your CV: ${has.slice(0, 7).join(', ')}`);
  if (i.families.length) reasons.push(`The title matches your target roles (${i.families.join(', ')})`);
  if (need != null && need <= i.yearsExperience) reasons.push(`Asks for ${need}+ years; you have ${i.yearsExperience}+`);
  if (elig >= 0.95) reasons.push(`Open to you: ${i.elig.label}`);
  if (i.salaryText) reasons.push(`Pay is stated: ${i.salaryText}`);

  const gaps: Gap[] = [];
  equivalents.forEach((e) => gaps.push({ gap: `${e.tool} is not on your CV, but you use similar tools (${e.mine.join(', ')})`, closable: true }));
  missing.slice(0, 5).forEach((m) => gaps.push({ gap: `${m} is mentioned and is not on your CV`, closable: true }));
  if (need != null && need > i.yearsExperience) gaps.push({ gap: `Asks for ${need}+ years of experience; your CV shows ${i.yearsExperience}+`, closable: need <= i.yearsExperience + 2 });
  if (seniorityLabel === 'director+') gaps.push({ gap: 'The level looks more senior than your current title', closable: false });
  if (i.elig.label === 'Unclear') gaps.push({ gap: 'It is not clear whether applicants in Nigeria are accepted', closable: true });
  if (totalTools === 0) gaps.push({ gap: 'The posting names no specific tools, so the skills match could not be checked', closable: true });

  const tips: string[] = [];
  if (has.length) tips.push(`Put ${has.slice(0, 4).join(', ')} near the top of your CV for this job`);
  equivalents.slice(0, 2).forEach((e) => tips.push(`Explain how your ${e.mine[0]} work transfers to ${e.tool}`));
  if (i.families.includes('Data & BI')) tips.push('Lead with your dashboards and KPI reporting results');
  if (i.families.includes('CRM & RevOps')) tips.push('Lead with the zero-lead-leakage CRM automation project');

  const band = bandOf(score);
  const advice = i.elig.label === 'Unclear' ? 'Check who can apply before spending time on this one.'
    : band === 'Excellent' ? 'Apply now. This is a very close match.'
    : band === 'Strong' ? 'Apply. Good match with a few small gaps.'
    : band === 'Potential' ? 'Worth a look. Read the gaps before you apply.'
    : 'Stretch. Apply only if the role really interests you.';

  return { score, band, reasons, gaps, tips, advice, seniority: seniorityLabel === 'director+' ? 'director or above' : seniorityLabel };
}
