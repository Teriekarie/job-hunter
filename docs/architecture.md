# Job Hunter: architecture

## 1. The pipeline (one run = one click)

```
Find new jobs button
  → 1. COLLECT    pull from each source (APIs/RSS), per role-family keyword set
  → 2. NORMALISE  map every job to one shape (see schema `jobs`)
  → 3. DEDUPE     skip jobs already in the DB; merge cross-posted copies
  → 4. RULES      no AI, free: drop stale, closed, past deadline, ineligible location
  → 5. AI SCORE   only on survivors (cheap model): fit score, reasons, gaps, eligibility label, trust notes
  → 6. SAVE       jobs + sources + run log + dropped list
  → (later, on open) AI WRITES cover letter / email (better model), saved once
```

Run it as a background job and report progress (write progress to the `runs` row and poll it, or use Supabase realtime). If one source fails, log it and continue.

## 2. Sources (start with the free, legal ones)

| Source | How | Notes |
|---|---|---|
| Remotive | Public API (JSON) | Data is delayed 24h. At most ~4 calls/day advised. Must link back to Remotive and name it as the source. Has a candidate_required_location field. |
| Himalayas | Public API, no key | 20 jobs per request, refreshed every 24h. Visible link back required. Has location-restriction fields. |
| Jobicy | Public API | Has a jobGeo field. |
| Remote OK | Public JSON/RSS | Credit Remote OK and link back. |
| We Work Remotely | RSS per category | Region shown in the posting. |
| Arbeitnow | Public API | Mostly Europe. |
| Working Nomads | Feed | Shows country restrictions. |
| Workafro | Page/feed (check terms) | Remote jobs open to people living in Africa. High priority. |
| Greenhouse / Lever / Ashby | Public job-board APIs per company | For a company watchlist; gives the employer's own apply link. |
| Adzuna | Official API (free key) | Many countries, includes salary. Good for UK/IE/CA relocation searches. |
| Jobberman | No API: user pastes links, or permitted browser discovery | Nigerian roles. |
| LinkedIn / Glassdoor | Don't scrape. User pastes links ("Add a job I found"). | Optional later: JobSpy (open source) can search them, but it scrapes, so keep it off by default. |

Keyword sets come from `profile/search-profile.json → roleFamilies`.

## 3. Eligibility labels (most important filter)

| Label | Meaning | Show? |
|---|---|---|
| Worldwide | Explicitly accepts applicants anywhere | Yes (top priority) |
| Nigeria eligible | Explicitly accepts Nigeria | Yes |
| Africa eligible | Africa or a list including Nigeria | Yes |
| EMEA | EMEA without excluding Nigeria | Yes (needs a check) |
| Relocation supported / Sponsorship possible | Onsite/hybrid abroad with relocation or visa help | Yes |
| Regional remote | Remote, but for a country list that excludes Nigeria | No → dropped |
| Unclear | Not enough info | Yes, flagged "check eligibility" |
| Ineligible | Explicitly excludes her | No → dropped |

Order of evidence: the source's structured location field → the job text → the timezone requirement ("UTC-1 to +3" is OK for Lagos; "US timezones" alone is unclear, not ineligible). Watch for the same job posted in several country versions (e.g. a US version and a worldwide version): link the worldwide one.

**Finding from the live search:** about half the "remote" jobs found were locked to the US, LATAM, Bulgaria or Brazil. This filter does most of the work.

## 4. Freshness
- `posted_at` = original posting date from the source; `found_at` = when we found it.
- Drop if `posted_at` is older than 14 days, if closed or expired, or if the deadline has passed.
- Repost check: same company + normalised title seen before with an older `posted_at` → keep the older date, and mark `is_repost`.

## 5. Duplicate check
Key = `normalise(company) + normalise(title) + location bucket`. Also match on canonical URL / external job ID.
On a match: don't create a new job; add a row to `job_sources`. Prefer the employer or ATS URL (greenhouse.io, lever.co, ashbyhq.com, workable.com, company domain) as `apply_url`.

## 6. Scoring (AI, explainable)

| Part | Weight |
|---|---|
| Skills & tools | 25% |
| Relevant experience | 20% |
| Role & responsibilities | 20% |
| Location & work eligibility | 20% |
| Seniority fit | 10% |
| Salary | 5% |

Ineligible or closed jobs are excluded outright, whatever their score. Bands: Excellent 85+, Strong 70–84, Potential 55–69, Stretch <55. The AI returns strict JSON: `score, band, reasons[], gaps[{gap, closable}], cv_tips[], advice, eligibility_label, eligibility_evidence, trust_label, trust_checks[]`.

## 7. Trust check (Verified / Needs review / High risk)
- Verified: the company exists (website, real presence) **and** the vacancy is corroborated (on the employer's ATS/careers page or on 2+ independent boards).
- Needs review: one source only, a young company, or details missing.
- High risk: asks for payment, training fees, equipment purchases, Telegram/WhatsApp-only interviews, personal ID or bank details early; a free email domain for a "big company"; pay far above market for entry-level work; a vague description.
Show the evidence for every label.

## 8. Cost control
- Rules filter before any AI call.
- Cheap model for scoring (batch several jobs per call); better model only for letters, and only when she opens a job.
- Cache: never re-score an unchanged job.
- Keep a per-run token/cost log in `runs`.

## 9. Folder layout (suggested)
```
app/            pages: jobs, tracker, profile, runs; api/run, api/jobs/[id]/letter
lib/sources/    one file per source + common normaliser
lib/pipeline/   dedupe, rules, eligibility, freshness, run orchestrator
lib/ai/         provider wrapper, prompts (score, verify, letter, email, follow-up)
supabase/       migrations (from docs/schema.sql)
profile/        cv.md, search-profile.json
```
