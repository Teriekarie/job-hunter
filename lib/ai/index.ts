import Anthropic from '@anthropic-ai/sdk';

// The only file that talks to the AI. Swap the model with the env vars below, or the provider by rewriting this file.
// AI is optional: with no ANTHROPIC_API_KEY the app uses rule-based scoring and template letters instead.
export const aiEnabled = () => !!process.env.ANTHROPIC_API_KEY;

// Spending rules live in the search profile (editable on the Profile page).
export type AiSettings = { aiScoreOnSearch?: boolean; aiMonthlyLimitUsd?: number };
export const aiLimit = (sp: AiSettings | undefined) => (typeof sp?.aiMonthlyLimitUsd === 'number' ? sp.aiMonthlyLimitUsd : 3);
export const aiAllowed = (sp: AiSettings | undefined, spentThisMonth: number) => aiEnabled() && spentThisMonth < aiLimit(sp);
const SCORE_MODEL = process.env.AI_MODEL_SCORE || 'claude-haiku-5-5';   // cheap, used for scoring many jobs
const WRITE_MODEL = process.env.AI_MODEL_WRITE || 'claude-sonnet-5-5';  // good writing at about half the Opus price (≈1 US cent per letter); her choice to save cost

// USD per 1M tokens (input, output), for the per-run cost log.
const PRICES: Record<string, [number, number]> = { 'claude-haiku-5-5': [0.1, 0.5], 'claude-sonnet-5-5': [2, 10], 'claude-opus-5-5': [4, 20] };

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic());

export type AiResult = { text: string; costUsd: number };

export async function ask(kind: 'score' | 'write', system: string, user: string, maxTokens = 16000): Promise<AiResult> {
  const model = kind === 'score' ? SCORE_MODEL : WRITE_MODEL;
  // If the main model declines a request, let the API retry on its default fallback (supported on these models only).
  const withFallback = /^claude-(opus-5-5|sonnet-5-5|fable-5-[12])$/.test(model);
  const params = { model, max_tokens: maxTokens, system, messages: [{ role: 'user' as const, content: user }] };
  const res = withFallback
    ? await getClient().beta.messages.create({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } as any)
    : await getClient().messages.create(params);
  if (res.stop_reason === 'refusal') throw new Error('The AI declined this request.');
  const text = (res.content as { type: string; text?: string }[]).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('').trim();
  const [pi, po] = PRICES[model] ?? [4, 20];
  const costUsd = ((res.usage.input_tokens ?? 0) * pi + (res.usage.output_tokens ?? 0) * po) / 1_000_000;
  return { text, costUsd };
}

export function parseJson<T>(text: string): T | null {
  const m = text.match(/[\[{][\s\S]*[\]}]/);
  if (!m) return null;
  try { return JSON.parse(m[0]) as T; } catch { return null; }
}
