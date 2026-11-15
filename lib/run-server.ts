import fs from 'node:fs';
import path from 'node:path';
import type { SupabaseClient } from '@supabase/supabase-js';
import { runSearch } from './pipeline/run';
import { aiAllowed } from './ai';
import { aiScore } from './ai/prompts';
import type { Job, SearchProfile } from './types';

export function defaultProfile() {
  const dir = path.join(process.cwd(), 'profile');
  return {
    cv_text: fs.readFileSync(path.join(dir, 'cv.md'), 'utf8'),
    search_profile: JSON.parse(fs.readFileSync(path.join(dir, 'search-profile.json'), 'utf8')) as SearchProfile,
  };
}
export const voiceSamples = () => fs.readFileSync(path.join(process.cwd(), 'profile', 'cover-letter-base.md'), 'utf8');

// First visit: copy the CV and search rules from the profile/ folder into the database.
export async function ensureProfile(supabase: SupabaseClient) {
  const { data } = await supabase.from('jh_profile').select('*').eq('id', 1).maybeSingle();
  if (data) return data;
  const d = defaultProfile();
  const { data: created, error } = await supabase.from('jh_profile').insert({ id: 1, ...d }).select().single();
  if (error) throw new Error(error.message);
  return created;
}

// One full search, used by both the button (signed-in) and the daily run (secret).
export async function doRun(supabase: SupabaseClient, trigger: 'button' | 'daily', secret: string | null) {
  const started = Date.now();
  const { data: ctx, error } = await supabase.rpc('jh_run_context', { p_secret: secret });
  if (error) throw new Error(error.message);
  const profileRow = ctx.profile ?? { ...defaultProfile(), learned_preferences: [] };
  const result = await runSearch({ profile: profileRow.search_profile, cvText: profileRow.cv_text, existing: ctx.existing });

  const known = new Set<string>((ctx.existing as { dedupe_key: string }[]).map((e) => e.dedupe_key));
  let fresh = result.jobs.filter((j) => !known.has(j.dedupe_key));
  const seenAgain = result.jobs.filter((j) => known.has(j.dedupe_key));

  // AI scoring only for new jobs, best first, in small batches, and never past the time limit.
  let cost = 0;
  if (fresh.length && profileRow.search_profile?.aiScoreOnSearch === true && aiAllowed(profileRow.search_profile, Number(ctx.ai_spent_month ?? 0))) {
    const scored: Job[] = [];
    for (let i = 0; i < fresh.length; i += 6) {
      const batch = fresh.slice(i, i + 6);
      if (i >= 24 || Date.now() - started > 150_000) { scored.push(...batch); continue; }
      try { const r = await aiScore(batch, profileRow.cv_text, profileRow.learned_preferences ?? []); scored.push(...r.jobs); cost += r.costUsd; }
      catch { scored.push(...batch); }
    }
    fresh = scored;
  }

  const failed = result.stats.filter((s) => s.error);
  const summary = `${result.stats.length - failed.length} of ${result.stats.length} sources searched · ${result.found} jobs found · ${result.relevant} in your role types · ${result.dropped.length} dropped · ${fresh.length} new for you`;
  const payload = {
    trigger, status: failed.length === result.stats.length ? 'failed' : 'done', found: result.found, merged: result.merged,
    source_stats: result.stats, ai_cost_usd: cost, summary, dropped: result.dropped,
    jobs: [...fresh, ...seenAgain.map((j) => ({ dedupe_key: j.dedupe_key, sources: j.sources }))],
  };
  const { data: saved, error: e2 } = await supabase.rpc('jh_run_save', { p_payload: payload, p_secret: secret });
  if (e2) throw new Error(e2.message);
  return { summary, added: saved.added as number, failed: failed.map((f) => f.source) };
}
