import type { Job } from '../types';
import { ask, parseJson } from './index';
import { bandOf } from '../pipeline/score';

const RULES = `Hard rules:
- Use ONLY facts from the CV provided. Never invent experience, employers, tools, numbers or qualifications.
- Never invent anything about the job or the company. If something is unknown, leave it out.
- Plain, simple English. No clichés such as "I am writing to express my keen interest".`;

// Re-scores a batch of jobs with the AI. Returns the same fields the rule-based scorer produces.
export async function aiScore(jobs: Job[], cvText: string, preferences: string[]) {
  const system = `You score how well jobs fit one candidate, for her private job-search app.
${RULES}
- One missing tool does not disqualify a job. Similar tools count (Workato ≈ Make/n8n/Zapier; HubSpot or Salesforce ≈ GoHighLevel/Zoho CRM; Looker ≈ Power BI/Tableau).
- Weights: skills & tools 25%, relevant experience 20%, role & responsibilities 20%, location eligibility 20%, seniority 10%, salary 5%.
- Do not change the eligibility label you are given; use it for the location part.
Reply with ONLY a JSON array, one object per job, in the same order:
[{"i":0,"score":0-100,"reasons":["why it fits, max 4"],"gaps":[{"gap":"...","closable":true}],"cv_tips":["max 3"],"advice":"one sentence","summary":"one or two sentences on what the job is"}]`;
  const user = `CANDIDATE CV:\n${cvText}\n\nHER PREFERENCES (learned from feedback):\n${preferences.join('\n') || '(none yet)'}\n\nJOBS:\n` +
    jobs.map((j, i) => `--- JOB ${i} ---\nTitle: ${j.title}\nCompany: ${j.company}\nEligibility: ${j.eligibility_label}\nSalary: ${j.salary_text || 'not listed'}\nDescription:\n${j.description.slice(0, 6000)}`).join('\n\n');
  const r = await ask('score', system, user);
  const arr = parseJson<any[]>(r.text) ?? [];
  const out = jobs.map((j, i) => {
    const a = arr.find((x) => x?.i === i);
    if (!a || typeof a.score !== 'number') return j;
    const score = Math.max(0, Math.min(100, Math.round(a.score)));
    return { ...j, match_score: score, match_band: bandOf(score), match_reasons: (a.reasons ?? j.match_reasons).slice(0, 5),
      gaps: Array.isArray(a.gaps) ? a.gaps.filter((g: any) => g?.gap).map((g: any) => ({ gap: String(g.gap), closable: !!g.closable })) : j.gaps,
      cv_tips: (a.cv_tips ?? j.cv_tips).slice(0, 4), advice: a.advice || j.advice, summary: a.summary || j.summary, scored_by: 'ai' as const };
  });
  return { jobs: out, costUsd: r.costUsd };
}

type LetterJob = { title: string; company: string; description: string | null; eligibility_label?: string | null; required_subject?: string | null };

export async function aiCoverLetter(job: LetterJob, cvText: string, voice: string) {
  const system = `You write cover letters for Theresa Karamor.
${RULES}
- 4–5 short paragraphs, 200–300 words. Open with the exact job title and one specific line about this company's need.
- Use 2–3 achievements from the CV that match the job's top requirements.
- Close with her location (Lagos, UTC+1) and a simple ask for a call.
- Match the warm, confident, results-led voice of the sample letters, but never copy their sentences.
Reply with the letter text only.`;
  const user = `CV:\n${cvText}\n\nVOICE SAMPLES (tone only):\n${voice}\n\nJOB: ${job.title} at ${job.company}\n${(job.description || '').slice(0, 8000)}`;
  return ask('write', system, user);
}

export async function aiEmail(job: LetterJob, cvText: string, followUp = false) {
  const system = `You write short ${followUp ? 'follow-up' : 'job application'} emails for Theresa Karamor to send herself.
${RULES}
- ${followUp ? '60–100 words: polite check-in on an application already sent, restate interest, offer to share more.' : '90–150 words: say which role, two matching strengths from the CV, mention the attached CV and cover letter, her links from the CV, location Lagos (UTC+1).'}
- Where she must add something herself, write it in [square brackets].
Reply with ONLY JSON: {"subject":"...","body":"..."}`;
  const user = `CV:\n${cvText}\n\nJOB: ${job.title} at ${job.company}\n${job.required_subject ? `The posting requires this exact subject line: ${job.required_subject}\n` : ''}${(job.description || '').slice(0, 6000)}`;
  const r = await ask('write', system, user);
  const j = parseJson<{ subject: string; body: string }>(r.text);
  return j?.body ? { ...j, subject: job.required_subject || j.subject, costUsd: r.costUsd } : null;
}
