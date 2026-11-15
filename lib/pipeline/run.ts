import type { Dropped, Job, RawJob, SearchProfile, SourceStat } from '../types';
import { collectAll } from '../sources';
import { daysBetween, htmlToText, normCompany, normTitle } from './text';
import { roleFamilies } from './relevance';
import { eligibility } from './eligibility';
import { applyMethod, isEmployerLink } from './apply';
import { trust } from './trust';
import { ruleScore } from './score';

export type RunContext = {
  profile: SearchProfile;
  cvText: string;
  existing: { dedupe_key: string; posted_at: string | null }[];
};
export type RunResult = { jobs: Job[]; dropped: Dropped[]; stats: SourceStat[]; found: number; merged: number; relevant: number };

const CLOSED = /\b(no longer accepting applications|position (has been|is) (filled|closed)|this (job|role|position) (is|has been) (closed|filled)|applications (are )?(now )?closed)\b/i;

export const dedupeKey = (company: string, title: string) => `${normCompany(company)}|${normTitle(title)}`;

export function yearsOfExperience(cvText: string): number {
  const m = cvText.match(/(\d{1,2})\+?\s*years/i);
  return m ? +m[1] : 4;
}

function summarise(text: string): string {
  const para = text.split(/\n+/).map((p) => p.trim()).find((p) => p.length > 80 && !/^(headquarters|url|about (us|the company))/i.test(p)) || text;
  const s = para.replace(/\s+/g, ' ');
  return s.length > 260 ? s.slice(0, 257).replace(/\s\S*$/, '') + '…' : s;
}

function requirements(text: string): string[] {
  const m = text.match(/(requirements?|qualifications?|what you('ll| will)? (need|bring)|who you are|you have|must[- ]haves?|skills (and|&) experience|about you)[^\n]*\n([\s\S]{0,1800})/i);
  const block = m ? m[m.length - 1] || '' : '';
  return block.split('\n').filter((l) => l.startsWith('• ')).map((l) => l.slice(2).trim()).filter((l) => l.length > 8 && l.length < 260).slice(0, 8);
}

// Turns one group of identical postings (same job on several boards) into a single job record.
export function buildJob(group: RawJob[], ctx: RunContext, now = new Date()): { job?: Job; dropped?: Dropped } {
  // Prefer the copy that she can actually apply to (e.g. the "Anywhere" version over the "USA Only" one).
  const ranked = group.map((g) => {
    const text = htmlToText(g.descriptionHtml);
    return { g, text, e: eligibility(g, text) };
  }).sort((a, b) => rank(a.e.label) - rank(b.e.label) || b.text.length - a.text.length);
  const { g, text, e } = ranked[0];
  const drop = (reason: string): { dropped: Dropped } => ({ dropped: { title: g.title, company: g.company, url: g.sourceUrl, source: g.source, reason } });

  const dates = group.map((x) => x.postedAt).filter(Boolean).sort() as string[];
  const posted = dates[0];
  const maxAge = ctx.profile.freshnessDays || 14;
  if (posted && daysBetween(new Date(posted), now) > maxAge) return drop(`Too old: posted ${daysBetween(new Date(posted), now)} days ago`);
  const deadline = group.map((x) => x.deadline).filter(Boolean).sort()[0];
  if (deadline && new Date(deadline) < now) return drop(`Deadline passed on ${deadline.slice(0, 10)}`);
  if (CLOSED.test(text)) return drop('Closed: no longer accepting applications');
  if (e.label === 'Ineligible') return drop(`Location: ${e.evidence}`);

  const families = roleFamilies(g.title, ctx.profile);
  const how = applyMethod(text);
  const tr = trust(group, text, how.email);
  if (tr.label === 'High risk') return drop(`High risk: ${tr.checks.filter((c) => c.startsWith('Warning')).join('; ')}`);

  const sc = ruleScore({ title: g.title, text, families, elig: e, salaryText: g.salaryText, profile: ctx.profile, yearsExperience: yearsOfExperience(ctx.cvText) });
  const key = dedupeKey(g.company, g.title);
  const before = ctx.existing.find((x) => x.dedupe_key === key);
  const employer = group.find((x) => isEmployerLink(x.sourceUrl));

  return {
    job: {
      dedupe_key: key, title: g.title.trim(), company: g.company.trim(),
      company_website: group.find((x) => x.companyWebsite)?.companyWebsite ?? null,
      description: text, summary: summarise(text), requirements: requirements(text),
      location: g.remote ? (g.locationText ? `Remote · ${g.locationText.slice(0, 120)}` : 'Remote') : g.locationText,
      work_mode: g.remote ? 'remote' : 'onsite',
      eligibility_label: e.label, eligibility_evidence: e.evidence,
      job_type: (group.find((x) => x.jobType)?.jobType || '').toLowerCase() || null,
      seniority: group.find((x) => x.seniority)?.seniority || sc.seniority,
      salary_text: group.find((x) => x.salaryText)?.salaryText ?? null,
      posted_at: posted ? posted.slice(0, 10) : null, deadline: deadline ? deadline.slice(0, 10) : null,
      is_repost: !!(before?.posted_at && posted && before.posted_at < posted.slice(0, 10)),
      apply_url: (employer ?? g).sourceUrl,
      apply_method: how.method, apply_email: how.email ?? null, required_subject: how.subject ?? null,
      role_families: families,
      match_score: sc.score, match_band: sc.band, match_reasons: sc.reasons, gaps: sc.gaps, cv_tips: sc.tips, advice: sc.advice, scored_by: 'rules',
      trust_label: tr.label, trust_checks: tr.checks,
      sources: [...new Map(group.map((x) => [x.sourceUrl, { source: x.source, source_url: x.sourceUrl }])).values()],
    },
  };
}

const rank = (l: string) => ['Worldwide', 'Nigeria eligible', 'Africa eligible', 'EMEA', 'Relocation supported', 'Unclear', 'Ineligible'].indexOf(l);

// The whole search: collect → keep her kind of roles → merge duplicates → filter → score.
export async function runSearch(ctx: RunContext, raw?: { jobs: RawJob[]; stats: SourceStat[] }): Promise<RunResult> {
  const { jobs: all, stats } = raw ?? (await collectAll());
  const relevant = all.filter((j) => roleFamilies(j.title, ctx.profile).length > 0);

  const groups = new Map<string, RawJob[]>();
  for (const j of relevant) {
    const k = dedupeKey(j.company, j.title);
    groups.set(k, [...(groups.get(k) ?? []), j]);
  }
  const jobs: Job[] = [];
  const dropped: Dropped[] = [];
  for (const group of groups.values()) {
    const r = buildJob(group, ctx);
    if (r.job) jobs.push(r.job); else if (r.dropped) dropped.push(r.dropped);
  }
  jobs.sort((a, b) => b.match_score - a.match_score);
  return { jobs, dropped, stats, found: all.length, merged: relevant.length - groups.size, relevant: relevant.length };
}
