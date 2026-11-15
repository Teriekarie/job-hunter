# Project brief: Job Hunter

**Owner:** Theresa (Thess) Karamor
**Built with:** Claude Code · Next.js · Supabase · Vercel · Claude API
**Status:** Planning → Phase 1

## Problem
Finding good jobs takes hours a day. LinkedIn no longer allows a "Worldwide" location search, and most "remote" jobs turn out to be locked to the US or Europe. Some postings are old or fake. Applications get scattered and are hard to track.

## Solution
A private web app. One click searches legitimate job sources, keeps only fresh jobs she can apply for from Nigeria (or with relocation support), checks they're real, scores the fit against her CV, and writes a tailored cover letter or email for each job. She reviews each job and applies herself, and the app tracks every application to its outcome.

## In scope (v1)
On-demand search · eligibility, freshness and duplicate filters · AI fit score with reasons · trust check · cover letter and email per job · full application pipeline and counts · feedback learning · paste-a-link.

## Out of scope (v1)
Auto-applying, LinkedIn scraping, scheduled runs, multiple users.

## Success looks like
- Every job shown is fresh (≤14 days), open, and open to Nigeria or offers relocation
- No duplicates
- 10+ good matches a week
- Reviewing and applying to a job takes under 10 minutes
- Response rate tracked

## Risks
- Source terms and rate limits. Mitigation: official APIs and RSS only, with attribution.
- AI cost. Mitigation: filter with rules first, write letters only on open, set a spend limit.
- Eligibility misread. Mitigation: show the evidence on every label, and use "Unclear" when unsure.
