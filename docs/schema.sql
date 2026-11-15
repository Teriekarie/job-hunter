-- Job Hunter: Supabase schema (v1). Single user; enable RLS so only the owner can read and write.

create table profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  cv_text text not null,                    -- master CV (from profile/cv.md)
  search_profile jsonb not null,            -- role families, skills, rules, preferences
  learned_preferences jsonb default '[]',   -- editable list built from feedback
  updated_at timestamptz default now()
);

create table runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  started_at timestamptz default now(),
  finished_at timestamptz,
  status text default 'running',            -- running | done | failed
  progress jsonb default '{}',              -- {stage, found, fresh, eligible, added}
  source_errors jsonb default '[]',
  ai_cost_usd numeric default 0,
  summary text
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  dedupe_key text not null,                 -- normalised company+title+location
  title text not null,
  company text not null,
  company_website text,
  description text,                         -- original text, kept as-is
  summary text,
  requirements jsonb default '[]',
  location text,
  work_mode text,                           -- remote | hybrid | onsite
  eligibility_label text,                   -- Worldwide | Nigeria eligible | Africa eligible | EMEA | Relocation supported | Sponsorship possible | Unclear
  eligibility_evidence text,
  job_type text,                            -- full-time | contract | part-time | consulting
  seniority text,
  salary_text text,
  salary_min numeric, salary_max numeric, salary_currency text, salary_period text,
  posted_at date,                           -- original posting date
  found_at timestamptz default now(),
  last_verified_at timestamptz,
  deadline date,
  is_repost boolean default false,
  apply_url text not null,
  apply_method text default 'link',         -- link | email
  apply_email text,
  role_families jsonb default '[]',
  match_score int,
  match_band text,
  match_reasons jsonb default '[]',
  gaps jsonb default '[]',
  cv_tips jsonb default '[]',
  advice text,
  trust_label text,                         -- Verified | Needs review | High risk
  trust_checks jsonb default '[]',
  cover_letter text,                        -- generated on first open
  email_subject text, email_body text,
  status text default 'new',                -- new | shortlisted | applied | acknowledged | interviewing | interviewed_stalled | offer | rejected | not_a_match | withdrawn
  applied_at timestamptz, applied_via text, -- website | email
  notes text,
  run_id uuid references runs,
  updated_at timestamptz default now(),
  unique (user_id, dedupe_key)
);

create table job_sources (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs on delete cascade,
  source text not null,                     -- remotive | himalayas | wwr | user_link …
  source_url text not null,
  external_id text,
  seen_at timestamptz default now(),
  unique (job_id, source_url)
);

create table status_history (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs on delete cascade,
  status text not null,
  changed_at timestamptz default now(),
  note text
);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs on delete cascade,
  reasons jsonb default '[]',
  note text,
  created_at timestamptz default now()
);

create table dropped_jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references runs,
  title text, company text, url text,
  reason text,                              -- stale | closed | ineligible: US only | duplicate | high risk …
  created_at timestamptz default now()
);

create table pasted_links (                 -- "Add a job I found"
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  url text not null,
  pasted_text text,
  note text,
  processed boolean default false,
  created_at timestamptz default now()
);

-- RLS: enable on every table, with policies that let only the owner (user_id = auth.uid(),
-- or via jobs.user_id for child tables) read and write.
