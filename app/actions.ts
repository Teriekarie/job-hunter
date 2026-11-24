'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/supabase/server';
import { requireOwner } from '@/lib/session';
import { doRun, ensureProfile, voiceSamples } from '@/lib/run-server';
import { buildJob, dedupeKey } from '@/lib/pipeline/run';
import { aiAllowed } from '@/lib/ai';
import type { SupabaseClient } from '@supabase/supabase-js';
import { aiCoverLetter, aiEmail, aiScore } from '@/lib/ai/prompts';
import { templateEmail, templateFollowUp, templateLetter } from '@/lib/letters';
import { fmtDate } from '@/lib/format';
import { decodeEntities } from '@/lib/pipeline/text';

// May we use the AI right now? (key set, and this month's spend is under her limit)
async function canUseAi(supabase: SupabaseClient) {
  const p = await ensureProfile(supabase);
  const { data: spent } = await supabase.rpc('jh_ai_spent_month');
  return { ok: aiAllowed(p.search_profile, Number(spent ?? 0)), profile: p };
}
async function logAi(supabase: SupabaseClient, kind: string, costUsd: number) {
  if (costUsd > 0) await supabase.from('jh_ai_usage').insert({ kind, cost_usd: costUsd });
}

export async function signIn(form: FormData) {
  const supabase = await db();
  const { error } = await supabase.auth.signInWithPassword({ email: String(form.get('email') || '').trim(), password: String(form.get('password') || '') });
  if (error) redirect('/login?error=1');
  redirect('/');
}

export async function signOut() {
  const supabase = await db();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function changePassword(form: FormData): Promise<{ ok: boolean; message: string }> {
  const { supabase } = await requireOwner();
  const pw = String(form.get('password') || '');
  if (pw.length < 10) return { ok: false, message: 'Use at least 10 characters.' };
  const { error } = await supabase.auth.updateUser({ password: pw });
  return error ? { ok: false, message: error.message } : { ok: true, message: 'Password changed.' };
}

export async function findJobs(): Promise<{ ok: boolean; message: string }> {
  const { supabase } = await requireOwner();
  try {
    await ensureProfile(supabase);
    const r = await doRun(supabase, 'button', null);
    revalidatePath('/');
    return { ok: true, message: r.summary + (r.failed.length ? ` · could not reach: ${r.failed.join(', ')}` : '') };
  } catch (e) {
    return { ok: false, message: `The search could not finish: ${(e as Error).message}` };
  }
}

export async function setStatus(jobId: string, status: string, via?: 'website' | 'email') {
  const { supabase } = await requireOwner();
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'applied') { patch.applied_at = new Date().toISOString(); patch.applied_via = via ?? 'website'; }
  await supabase.from('jh_jobs').update(patch).eq('id', jobId);
  await supabase.from('jh_status_history').insert({ job_id: jobId, status, note: status === 'applied' ? `Applied by ${via ?? 'website'}` : null });
  revalidatePath('/'); revalidatePath(`/jobs/${jobId}`); revalidatePath('/tracker');
}

export async function notAMatch(jobId: string, reasons: string[], note: string) {
  const { supabase } = await requireOwner();
  await supabase.from('jh_feedback').insert({ job_id: jobId, reasons, note: note || null });
  await setStatus(jobId, 'not_a_match');
}

export async function saveNotes(jobId: string, notes: string) {
  const { supabase } = await requireOwner();
  await supabase.from('jh_jobs').update({ notes, updated_at: new Date().toISOString() }).eq('id', jobId);
  revalidatePath(`/jobs/${jobId}`); revalidatePath('/tracker');
}

export async function getLetter(jobId: string, rewrite = false): Promise<{ text: string; by: string }> {
  const { supabase } = await requireOwner();
  const { data: job } = await supabase.from('jh_jobs').select('*').eq('id', jobId).single();
  if (!job) return { text: '', by: '' };
  const ai = await canUseAi(supabase);
  const savedIsTemplate = !!job.cover_letter && job.cover_letter.includes('[Add one line');
  // A saved letter is reused, unless it is the starter template and the AI is now available.
  if (job.cover_letter && !rewrite && !(savedIsTemplate && ai.ok)) return { text: job.cover_letter, by: savedIsTemplate ? 'template' : 'saved' };
  let text = templateLetter(job); let by = 'template';
  if (ai.ok) {
    try {
      const r = await aiCoverLetter(job, ai.profile.cv_text, voiceSamples());
      await logAi(supabase, 'letter', r.costUsd);
      if (r.text) { text = r.text; by = 'ai'; }
    } catch (e) {
      console.error('AI cover letter failed:', (e as Error).message);
      by = `ai-error: ${(e as Error).message}`.slice(0, 300);
    }
  }
  await supabase.from('jh_jobs').update({ cover_letter: text }).eq('id', jobId);
  return { text, by };
}

export async function saveLetter(jobId: string, text: string) {
  const { supabase } = await requireOwner();
  await supabase.from('jh_jobs').update({ cover_letter: text }).eq('id', jobId);
}

export async function getEmail(jobId: string, opts: { rewrite?: boolean; followUp?: boolean } = {}): Promise<{ subject: string; body: string }> {
  const { supabase } = await requireOwner();
  const { data: job } = await supabase.from('jh_jobs').select('*').eq('id', jobId).single();
  if (!job) return { subject: '', body: '' };
  if (opts.followUp) {
    const t = templateFollowUp(job, fmtDate(job.applied_at) || 'recently');
    const ai = await canUseAi(supabase);
    if (ai.ok) { try { const a = await aiEmail(job, ai.profile.cv_text, true); if (a) { await logAi(supabase, 'follow-up', a.costUsd); return { subject: t.subject, body: a.body }; } } catch (e) { console.error('AI email failed:', (e as Error).message); } }
    return t;
  }
  if (job.email_body && !opts.rewrite) return { subject: job.email_subject, body: job.email_body };
  let out = templateEmail(job);
  const ai = await canUseAi(supabase);
  if (ai.ok) { try { const a = await aiEmail(job, ai.profile.cv_text); if (a) { await logAi(supabase, 'email', a.costUsd); out = { subject: a.subject, body: a.body }; } } catch (e) { console.error('AI email failed:', (e as Error).message); } }
  await supabase.from('jh_jobs').update({ email_subject: out.subject, email_body: out.body }).eq('id', jobId);
  return out;
}

export async function saveEmail(jobId: string, subject: string, body: string) {
  const { supabase } = await requireOwner();
  await supabase.from('jh_jobs').update({ email_subject: subject, email_body: body }).eq('id', jobId);
}

// "Add a job I found": a link (LinkedIn, Jobberman, Indeed...) plus the pasted job text go through the same checks.
export async function addJob(form: FormData): Promise<{ ok: boolean; message: string; id?: string }> {
  const { supabase } = await requireOwner();
  const url = String(form.get('url') || '').trim();
  let title = String(form.get('title') || '').trim();
  const company = String(form.get('company') || '').trim();
  let text = String(form.get('text') || '').trim();
  const location = String(form.get('location') || '').trim();
  if (!/^https?:\/\/\S+$/i.test(url)) return { ok: false, message: 'Please paste the full link to the job, starting with https://' };
  if (!text || !title) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; job-hunter-personal/1.0)' }, signal: AbortSignal.timeout(10000), redirect: 'follow' });
      const html = res.ok ? await res.text() : '';
      if (!title) title = decodeEntities(html.match(/<title[^>]*>([^<]{3,200})<\/title>/i)?.[1] ?? '').split(/\s[|–-]\s/)[0].trim();
      if (!text && html.length > 2000 && !/linkedin\.com|glassdoor\.|indeed\./i.test(url)) text = html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? '';
    } catch { /* the page could not be read */ }
  }
  if (!title || !company) return { ok: false, message: 'Please fill in the job title and the company name.' };
  if (text.replace(/<[^>]+>/g, '').length < 200) return { ok: false, message: 'This page could not be read automatically. Please paste the job description text into the box.' };

  const profile = await ensureProfile(supabase);
  const built = buildJob([{ source: 'user_link', sourceUrl: url, title, company, descriptionHtml: /<[a-z][\s\S]*>/i.test(text) ? text : text.replace(/\n/g, '<br>'),
    locationText: location, remote: !/\b(on-?site|onsite|hybrid)\b/i.test(location), postedAt: undefined }],
    { profile: profile.search_profile, cvText: profile.cv_text, existing: [] });
  // A job she adds herself is never dropped silently: keep it and show the warning on the card instead.
  let job = built.job;
  if (!job) {
    const loose = buildJob([{ source: 'user_link', sourceUrl: url, title, company, descriptionHtml: '<p>' + text.replace(/<[^>]+>/g, ' ').slice(0, 300) + '</p>', locationText: 'Worldwide', remote: true }],
      { profile: profile.search_profile, cvText: profile.cv_text, existing: [] }).job!;
    job = { ...loose, description: text.replace(/<[^>]+>/g, ' '), eligibility_label: 'Unclear', eligibility_evidence: `The app's check said: ${built.dropped?.reason}. You added it yourself, so it is kept. Please check before applying.` };
  }
  if ((await canUseAi(supabase)).ok) { try { const r = await aiScore([job], profile.cv_text, profile.learned_preferences ?? []); job = r.jobs[0]; await logAi(supabase, 'score', r.costUsd); } catch { /* rules score stays */ } }
  const { data: existing } = await supabase.from('jh_jobs').select('id').eq('dedupe_key', dedupeKey(company, title)).maybeSingle();
  if (existing) {
    await supabase.from('jh_job_sources').upsert({ job_id: existing.id, source: 'user_link', source_url: url }, { onConflict: 'job_id,source_url' });
    return { ok: true, message: 'You already have this job. The new link was added to it.', id: existing.id };
  }
  const { sources, ...row } = job;
  const { data: created, error } = await supabase.from('jh_jobs').insert(row).select('id').single();
  if (error) return { ok: false, message: error.message };
  await supabase.from('jh_job_sources').insert(sources.map((s) => ({ ...s, job_id: created.id })));
  await supabase.from('jh_status_history').insert({ job_id: created.id, status: 'new', note: 'Added by you' });
  revalidatePath('/');
  return { ok: true, message: 'Job added.', id: created.id };
}

export async function saveProfile(form: FormData): Promise<{ ok: boolean; message: string }> {
  const { supabase } = await requireOwner();
  const current = await ensureProfile(supabase);
  const lines = (k: string) => String(form.get(k) || '').split('\n').map((s) => s.trim()).filter(Boolean);
  const limit = Number(form.get('aiMonthlyLimitUsd'));
  const sp = { ...current.search_profile, avoid: lines('avoid'), freshnessDays: Math.min(60, Math.max(1, Number(form.get('freshnessDays')) || 14)),
    aiScoreOnSearch: form.get('aiScoreOnSearch') === 'on', aiMonthlyLimitUsd: Number.isFinite(limit) ? Math.min(100, Math.max(0, limit)) : 3 };
  const cv = String(form.get('cv_text') || '').trim();
  if (cv.length < 200) return { ok: false, message: 'The CV text looks too short.' };
  const { error } = await supabase.from('jh_profile').update({ cv_text: cv, search_profile: sp, learned_preferences: lines('preferences'), updated_at: new Date().toISOString() }).eq('id', 1);
  revalidatePath('/profile');
  return error ? { ok: false, message: error.message } : { ok: true, message: 'Saved.' };
}

// "Check fit with AI" button on a job: one cheap AI call, only when she clicks.
export async function aiRescore(jobId: string): Promise<{ ok: boolean; message: string }> {
  const { supabase } = await requireOwner();
  const ai = await canUseAi(supabase);
  if (!ai.ok) return { ok: false, message: "AI is off, or this month's AI limit is reached (see Profile & rules)." };
  const { data: j } = await supabase.from('jh_jobs').select('*').eq('id', jobId).single();
  if (!j) return { ok: false, message: 'Job not found.' };
  try {
    const r = await aiScore([{ ...j, sources: [] }], ai.profile.cv_text, ai.profile.learned_preferences ?? []);
    await logAi(supabase, 'score', r.costUsd);
    const x = r.jobs[0];
    if (x.scored_by !== 'ai') return { ok: false, message: 'The AI did not return a score. Please try again.' };
    await supabase.from('jh_jobs').update({ match_score: x.match_score, match_band: x.match_band, match_reasons: x.match_reasons, gaps: x.gaps,
      cv_tips: x.cv_tips, advice: x.advice, summary: x.summary, scored_by: 'ai', updated_at: new Date().toISOString() }).eq('id', jobId);
    revalidatePath(`/jobs/${jobId}`); revalidatePath('/');
    return { ok: true, message: `Scored by AI (cost about $${r.costUsd.toFixed(3)}).` };
  } catch (e) { return { ok: false, message: `The AI check failed: ${(e as Error).message}` }; }
}

// Delete jobs for good. They are remembered in jh_deleted_jobs so the search never brings them back.
async function removeJobs(supabase: SupabaseClient, ids: string[]) {
  if (!ids.length) return 0;
  const { data: rows } = await supabase.from('jh_jobs').select('id, dedupe_key, title, company').in('id', ids);
  if (!rows?.length) return 0;
  await supabase.from('jh_deleted_jobs').upsert(rows.map((r) => ({ dedupe_key: r.dedupe_key, title: r.title, company: r.company })), { onConflict: 'dedupe_key' });
  const { error } = await supabase.from('jh_jobs').delete().in('id', rows.map((r) => r.id));
  if (error) throw new Error(error.message);
  revalidatePath('/'); revalidatePath('/tracker');
  return rows.length;
}

export async function deleteJob(jobId: string): Promise<{ ok: boolean; message: string }> {
  const { supabase } = await requireOwner();
  try { const n = await removeJobs(supabase, [jobId]); return n ? { ok: true, message: 'Job deleted.' } : { ok: false, message: 'Job not found.' }; }
  catch (e) { return { ok: false, message: `Could not delete: ${(e as Error).message}` }; }
}

// Deletes every job whose deadline has passed, except ones she has already applied to (those stay in her tracker).
export async function deleteExpiredJobs(): Promise<{ ok: boolean; message: string }> {
  const { supabase } = await requireOwner();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase.from('jh_jobs').select('id').lt('deadline', today).in('status', ['new', 'shortlisted', 'not_a_match']);
  try {
    const n = await removeJobs(supabase, (data ?? []).map((r) => r.id));
    return { ok: true, message: n ? `Deleted ${n} job${n === 1 ? '' : 's'} with a passed deadline.` : 'No jobs with a passed deadline.' };
  } catch (e) { return { ok: false, message: `Could not delete: ${(e as Error).message}` }; }
}
