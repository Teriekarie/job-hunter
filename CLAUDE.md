# Job Hunter: project instructions

## What this is
A private web app for one person, Theresa (Thess) Karamor, based in Lagos, Nigeria. When she clicks **Find new jobs**, the app searches legitimate job sources, keeps only fresh jobs she's allowed to apply for, scores how well each one fits her, checks it's real, and shows her a shortlist. She reviews each job and applies **herself**. The app then tracks every application through to an outcome.

Read before building: `docs/PRD.md`, `docs/architecture.md`, `docs/schema.sql`, `profile/`.

## Stack
- Next.js (App Router) + TypeScript, Tailwind
- Supabase (Postgres + auth, single user)
- Vercel hosting
- Claude API for scoring, verification notes, cover letters, emails. Keep the AI behind one module (`lib/ai/`) so the model or provider can be swapped.
- Job collection in server code (route handler / Supabase Edge Function). Keep it in one module (`lib/sources/`) so it can move to n8n later.

## Hard rules (never break these)
1. Never invent a job, employer, salary, description or link. Every job must have a real source URL.
2. Never invent experience, metrics, tools or qualifications in a cover letter or email. Use only `profile/cv.md` and facts Thess adds in the app.
3. Never apply or send an email for her. The app prepares; she submits.
4. Never label a job "Worldwide" just because it says "remote". Use the eligibility rules in `docs/architecture.md`.
5. Hide jobs that exclude Nigeria (US-only, LATAM-only, EU-residents-only, etc.). Log them as dropped, with the reason.
6. Freshness: only jobs posted in the last 14 days, still open, with no passed deadline. Keep the original posting date separate from the date found, and flag reposts.
7. One record per job. If the same job is on several boards, keep one record, list every source, and use the employer's own apply link where there is one.
8. Never mark a job "Verified" without evidence. Never call a company a scam just because it has a small online footprint.
9. One missing tool doesn't disqualify a job (Workato ≈ Make/n8n; HubSpot ≈ GoHighLevel/Zoho).
10. Every match score needs a plain explanation: why it fits, gaps, and whether the gaps can be closed.
11. Searches must be safe to re-run: re-running never creates duplicates. Log errors per source and keep going if one source fails.
12. No secrets in the code or the client. API keys live in env vars only.
13. Respect each source's terms: use official APIs and RSS feeds first, attribute and link back where a source requires it, and don't scrape LinkedIn.

## How to work with Thess
- Use plain, simple language. No jargon in the UI or in explanations.
- Build in small phases. Show what changed and how to test it before moving on.
- When rewriting a file, give the complete file, not a partial snippet.
- At the end of each phase, update `docs/SOP.md` (how to use and run the app) and `docs/HANDOVER.md` (what was built, where things live, known issues).
