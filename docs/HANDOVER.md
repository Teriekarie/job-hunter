# Job Hunter: handover

## Live app
- https://job-hunter-teriekarie-8558.vercel.app (Vercel project `job-hunter`, account teriekarie-8558)
- Code: https://github.com/Teriekarie/job-hunter (private). Every push to `main` deploys automatically.

## What was built (v1)
- Next.js 15 app (App Router, TypeScript, Tailwind 4) in this folder.
- Database: the existing Supabase project **thess-content-manager**. All tables start with `jh_` and nothing in the content-manager tables was changed.
  Sign-in reuses the account already in that project (owner id stored in `jh_settings`), so no new user or profile row was created.
- Daily automatic search via Vercel Cron (`vercel.json`, 05:00 UTC = 06:00 Lagos) calling `/api/cron`.

## Where things live
| Path | What |
|---|---|
| `lib/sources/` | One file per job board (8: Remotive, Himalayas, Jobicy, Remote OK, Arbeitnow, Working Nomads, Workafro, MyJobMag). We Work Remotely was removed in Nov 2026 (apply links always went through WWR, never the employer); `wwr.ts` was deleted. Add a board: write a file returning `RawJob[]` (plus an optional `detail` reader), add it to `lib/sources/index.ts`. |
| `lib/pipeline/relevance.ts` | Which titles count as her kind of role. |
| `lib/pipeline/eligibility.ts` | Can she apply from Nigeria? Board location fields first, then job text. |
| `lib/pipeline/trust.ts` | Verified / Needs review / High risk, with evidence. |
| `lib/pipeline/apply.ts` | Detects email applications and required subject lines. |
| `lib/pipeline/score.ts` | Rule-based fit score (weights from architecture §6). |
| `lib/pipeline/run.ts` | The whole search: collect → filter role → merge duplicates → freshness/deadline/closed/location → trust → score. |
| `lib/ai/` | The only code that calls the Claude API (scoring, letters, emails). Off unless `ANTHROPIC_API_KEY` is set. |
| `lib/letters.ts` | Template letters/emails used without AI. Every sentence comes from the CV. |
| `lib/run-server.ts` | Runs a search and saves it (used by the button and the daily cron). |
| `app/actions.ts` | Everything the buttons do (stages, notes, letters, add-a-job, profile). |
| `supabase/migrations/001_job_hunter.sql` | Tables, owner-only security rules, and the two save/load functions. |
| `profile/` | CV, cover-letter voice samples, search profile. Copied into the database on first sign-in; after that, edit on the Profile page. |
| `scripts/dry-run.ts` | `NODE_USE_ENV_PROXY=1 npm run search:dry` tests the search against live boards without saving. |

## Environment variables (Vercel → Project → Settings → Environment Variables)
| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fabxgpnhbonuhudybzbo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the project's publishable key |
| `CRON_SECRET` | long random text (24+ characters). The app saves its fingerprint to the database automatically the next time the owner opens any page. To change it: edit it in Vercel, redeploy, open the app once. |
| `ANTHROPIC_API_KEY` | optional; turns on AI scoring and letters |

## Security
- Every `jh_` table has Row Level Security: only the owner account can read or write. Tested: without sign-in every table reads empty and the search functions refuse.
- The daily search proves itself with `CRON_SECRET`; only its hash is in the database.
- No secret keys are in the code.

## Test results (15 Nov 2026)
- Live search: all 7 boards answered; ~1,525 jobs → 110 in her role types → 76 dropped (location 60+, too old) → 12 saved.
- Re-running the search added 0 jobs (no duplicates).

## Companies checked directly
- `lib/sources/employers.ts` reads public job-board APIs of Greenhouse, Lever, Ashby, Workable and SmartRecruiters for every active row in `jh_companies` (107 starter companies, verified Nov 2026; list in `lib/sources/starter-companies.json`, seeded by `supabase/migrations/003_companies.sql`).
- Only matching titles get a detail fetch (max 160 per run, newest first). Workable is read one company at a time (it rate-limits).
- Discovery: board links found in job-site data are added to `jh_companies` as `auto`; job-level links found in descriptions become the apply link.
- Company jobs that are only city/office based (no "remote") are treated as location-locked unless the text offers relocation.

## AI and spending
- AI is optional (`ANTHROPIC_API_KEY`). Scoring uses Claude Haiku 5.5 (fast, very cheap); letters and emails use Claude Sonnet 5.5 (cheaper; set `AI_MODEL_WRITE=claude-opus-5-5` for the very best) (change with `AI_MODEL_SCORE` / `AI_MODEL_WRITE`).
- By default AI is used only when she clicks (cover letter, email, "Check fit with AI"). "Score new jobs with AI during each search" is an opt-in on the Profile page.
- Monthly AI limit (default $3) is enforced in the app: every AI cost is logged (`jh_runs.ai_cost_usd`, `jh_ai_usage`) and the app falls back to rules/templates once the month's total reaches the limit. Also set a spend limit in the Anthropic Console as a second safety net.

## Sources checked and not added (Nov 2026)
- Jobberman: robots.txt blocks job pages (`/job/`) and searches. Covered by a search shortcut button + "Add a job I found".
- Jobgurus and Hot Nigerian Jobs: no feed, and their robots.txt blocks AI crawlers. Shortcut buttons only.
- LinkedIn, Indeed, Glassdoor, Google: no permitted access. Shortcut buttons only.
- Workafro (allowed, all crawlers welcome) and MyJobMag (job pages allowed, standard JobPosting data) were added.

## Known limits
- Himalayas limits free calls; if it is busy the run logs it and carries on. A free Himalayas developer key would raise the limit.
- Remotive delays its jobs by 24 hours (their rule).
- Without an AI key, scores use keyword rules and letters are templates with [square bracket] parts to fill.
- Most jobs show "Legit check: needs review" because they are on one board only; that is normal, not a warning.
- Vercel Hobby plan runs crons once a day, within the hour; the search must finish within 5 minutes (it takes about 10 seconds).
