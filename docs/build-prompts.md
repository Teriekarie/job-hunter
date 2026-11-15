# Build prompts: paste these into Claude Code, one at a time

Finish and test each phase before you start the next.

---

## Prompt 0: read and plan (nothing gets built)

```
Read CLAUDE.md, README.md, everything in docs/, profile/ and reference/.
Open reference/prototype.html to see the layout I liked.
Then give me:
1. A short summary of what we're building, in plain language.
2. Any questions or gaps you see before we start.
3. A step-by-step plan for Phase 1 only.
Don't write any code yet.
```

---

## Phase 1: app, database, and jobs flowing in (no AI yet)

```
Build Phase 1:
- Next.js + TypeScript + Tailwind app, Supabase auth (magic link, only my email can sign in).
- Create the Supabase tables from docs/schema.sql as a migration, with RLS.
- Seed the profile table from profile/cv.md and profile/search-profile.json.
- Source connectors in lib/sources/ for Remotive, Himalayas, Jobicy, Remote OK and We Work Remotely RSS.
  Use the role-family keywords from search-profile.json.
- Pipeline in lib/pipeline/: normalise → dedupe (architecture §5) → rules filter (freshness 14 days,
  closed/expired, eligibility labels from structured location fields, architecture §3–4).
  Save survivors to jobs + job_sources, dropped ones to dropped_jobs, and progress/errors to runs.
- Jobs page modelled on reference/prototype.html: "Find new jobs" button with live progress, counts,
  stage tabs, filters, job cards with Apply on site (+ "Did you apply?") and the stage dropdown.
- Runs page showing history and dropped jobs with reasons.
Show me how to run it locally and how to test one search. Then update docs/SOP.md and docs/HANDOVER.md.
```

---

## Phase 2: AI scoring, trust checks and feedback

```
Build Phase 2:
- lib/ai/ wrapper around the Claude API (model name in env, so it can be swapped). Log token cost per run.
- After the rules filter, score each surviving job (batch them) and return strict JSON as described
  in architecture §6–7. Never re-score an unchanged job.
- Cards show the score, band, advice, why it fits, gaps (closable or not), CV tips and trust checks with evidence.
- "Not a match" modal with the reasons from PRD §3.2. Save to feedback.
- Before each run, turn the feedback into an editable "What the agent learned" list on the Profile page,
  and feed it into scoring.
- "Add a job I found": paste a link or the job text → it goes through the same pipeline.
Test with 3 real jobs and show me the JSON for each. Update the SOP and handover docs.
```

---

## Phase 3: applying and tracking

```
Build Phase 3:
- Cover letter generated the first time I open it, saved, and editable. Use only facts from profile/cv.md.
  No reused paragraphs across jobs. Match the voice in profile/cover-letter-base.md.
  See reference/sample-jobs.json for the quality I expect.
- Apply by email: To/Subject/Body with copy buttons, "Open in Gmail" (compose URL), mailto fallback,
  and "I've sent it: mark Applied" (applied_via = email).
- Full stages from PRD §3.3 with status_history, plus the dashboard counts and response rate from PRD §3.4.
- Tracker page with CSV export. Follow-up badge at 7 days with a follow-up email draft. Deadline badge.
- Write docs/SOP.md (daily use: find → review → apply → update) and docs/HANDOVER.md (what was built,
  env vars, where things live, how to add a new job source, known limits).
Then deploy to Vercel, and give me the URL and a short checklist to test it.
```

---

## Later ideas (ask for them one by one)
- Company watchlist via Greenhouse/Lever/Ashby board APIs
- Adzuna API for UK/Ireland/Canada relocation roles
- Skills-gap report from all scored jobs
- Interview prep pack per job
- Optional scheduled run plus a morning email digest
