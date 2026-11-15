# Job Hunter: product requirements

## 1. Goal
Help Thess find **fresh, legitimate jobs she can actually apply for from Nigeria** (or with relocation/visa support), across automation, data, CRM, AI and operations, then help her apply and track every outcome. The goal is credible, realistic jobs, not the most jobs.

## 2. Who uses it
One user: Thess. Private login (Supabase auth, email magic link).

## 3. Main flows

### 3.1 Find new jobs (on demand only)
- One big **Find new jobs** button. There are no automatic daily runs (a schedule can be added later as an option).
- Clicking it starts a run and shows live progress: "Searching 8 sources… 214 found → 37 fresh & eligible → 12 new matches".
- When it's done: new jobs appear in **New**, and the dropped ones are listed with reasons.
- Show the last run time and summary at the top.

### 3.2 Review a job (job card)
Each card shows:
- Title, company, match score (0–100) + band (Excellent 85+, Strong 70–84, Potential 55–69, Stretch <55)
- Eligibility label (see architecture §3), work mode, location, salary (or "Not listed"), job type, seniority
- Posted date ("posted 3 days ago"), deadline if any, trust label (Verified / Needs review / High risk)
- One-line summary and one-line advice ("Apply now…", "Stretch, apply only if…")
- Expandable: why it fits, gaps (and if they can be closed), requirements, CV changes for this job, trust checks with evidence, every source the job was found on, notes, status history

Buttons:
- **Apply on site ↗**: opens the employer's apply page in a new tab. When she comes back, ask "Did you apply?" → **Yes, mark Applied** / Not yet.
- **Apply by email** (when the job asks for email applications): opens a panel with To / Subject / Body plus copy buttons, an **Open in Gmail** link (a Gmail compose URL with the fields filled in) and a mailto fallback. Then **I've sent it: mark Applied** records `applied_via = email` and the date.
- **Cover letter**: generated when she first opens it (not during the search, to save cost), saved, editable, copyable. One letter per job; never reuse text across jobs.
- **Shortlist**
- **Not a match** → asks why (chips: Not my skill set, Too senior, Too junior, Salary too low, Location restriction, No relocation support, Company not credible, Not interested in this industry, Already applied, Job looks stale, Other) + an optional note.
- **Stage** dropdown

### 3.3 Pipeline stages
New → Shortlisted → Applied → Acknowledged → Interviewing → Interviewed, then stopped → Offer / Job secured
Also: Rejected, Not a match, Withdrawn.
Every change is saved to `status_history` with a timestamp.

### 3.4 Dashboard counts (top of page)
Jobs found · To review · Applied · Heard back (acknowledged or further) · Interviews · Offers / secured · Rejected · Not a match · Response rate (heard back ÷ applied).
Later: these counts by week and by source.

### 3.5 Add a job I found myself
Paste any job link (LinkedIn, Glassdoor, a company site). The app fetches what it can, then scores it, checks it and writes the cover letter like any other job. If the page can't be read (e.g. LinkedIn), ask her to paste the job description text instead.

### 3.6 Learning from feedback
- "Not a match" reasons and notes are saved to `feedback`.
- Before each run, summarise the feedback into a short **preferences** list (e.g. "skip sales-quota roles", "minimum ~$1,500/month for full-time") and show it on a **What the agent learned** panel that she can edit or delete lines from.
- Scoring uses these preferences. No model training; it's just an editable list.

### 3.7 Reminders
- Follow up: applied 7+ days ago with no change → show a "time to follow up" badge, and offer a short follow-up email draft.
- Deadline: closes within 5 days → red badge.

## 4. Pages
1. **Jobs**: the counts, tabs by stage, filters (eligibility, role family, sort by match/newest/deadline, "only last 14 days" toggle), and the job cards.
2. **Tracker**: table of everything she's applied to, with stages, dates and notes. Export as CSV.
3. **Profile & rules**: her CV text, skills, role families, preferences and learned preferences, all editable.
4. **Runs**: history of searches: when, sources, counts, errors, and the dropped list with reasons.

## 5. Her preferences (defaults)
- Work rights: Nigeria only. Prioritise Worldwide → Nigeria eligible → Africa eligible → EMEA (if Nigeria isn't excluded) → Relocation/visa supported. Hide Ineligible.
- Hours: any (US, UK/EU, Asia are all fine).
- Salary: show everything, including undisclosed. Rank higher pay above lower pay, but never hide a job because of pay.
- Job types: all (full-time, contract, part-time, consulting).
- Freshness: 14 days.

## 6. Later (not in v1)
Skills-gap report (which tools show up most in her matches), company watchlist (check favourite companies' Greenhouse/Lever/Ashby boards), interview prep pack, salary comparison, CV versions per application, an optional scheduled run, email/WhatsApp digest.
