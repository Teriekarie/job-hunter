// One shape for every job, whichever board it came from.
export type RawJob = {
  source: string;            // remotive | himalayas | jobicy | remoteok | wwr | arbeitnow | workingnomads | user_link
  sourceUrl: string;         // link back to the board (required by the boards' terms)
  title: string;
  company: string;
  companyWebsite?: string;
  descriptionHtml: string;
  locationText: string;      // the board's own location field, as written
  locationList?: string[] | null; // structured country list when the board gives one (null = no restriction stated)
  remote: boolean;
  jobType?: string;
  seniority?: string;
  salaryText?: string;
  postedAt?: string;         // ISO date
  deadline?: string;         // ISO date
  tags?: string[];
  boardVerified?: boolean;
};

export type Eligibility = {
  label: 'Worldwide' | 'Nigeria eligible' | 'Africa eligible' | 'EMEA' | 'Relocation supported' | 'Unclear' | 'Ineligible';
  evidence: string;
};

export type Gap = { gap: string; closable: boolean };

export type Job = {
  dedupe_key: string;
  title: string;
  company: string;
  company_website?: string | null;
  description: string;
  summary: string;
  requirements: string[];
  location: string;
  work_mode: 'remote' | 'hybrid' | 'onsite';
  eligibility_label: string;
  eligibility_evidence: string;
  job_type?: string | null;
  seniority?: string | null;
  salary_text?: string | null;
  posted_at?: string | null;
  deadline?: string | null;
  is_repost: boolean;
  apply_url: string;
  apply_method: 'link' | 'email';
  apply_email?: string | null;
  required_subject?: string | null;
  role_families: string[];
  match_score: number;
  match_band: string;
  match_reasons: string[];
  gaps: Gap[];
  cv_tips: string[];
  advice: string;
  scored_by: 'rules' | 'ai';
  trust_label: 'Verified' | 'Needs review' | 'High risk';
  trust_checks: string[];
  sources: { source: string; source_url: string }[];
};

export type Dropped = { title: string; company: string; url: string; source: string; reason: string };
export type SourceStat = { source: string; found: number; error?: string };

export type SearchProfile = {
  name: string;
  location: string;
  freshnessDays: number;
  roleFamilies: Record<string, string[]>;
  skills: Record<string, string[]>;
  equivalentTools: Record<string, string[]>;
  avoid: string[];
  [k: string]: unknown;
};

export const STAGES = [
  ['new', 'New'], ['shortlisted', 'Shortlisted'], ['applied', 'Applied'], ['acknowledged', 'Acknowledged'],
  ['interviewing', 'Interviewing'], ['interviewed_stalled', 'Interviewed, then stopped'], ['offer', 'Offer / secured'],
  ['rejected', 'Rejected'], ['not_a_match', 'Not a match'], ['withdrawn', 'Withdrawn'],
] as const;
export const stageName = (s: string) => STAGES.find(([k]) => k === s)?.[1] ?? s;
