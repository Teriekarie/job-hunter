'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { addJob, deleteExpiredJobs, findJobs } from '@/app/actions';
import JobActions, { Modal, type CardJob } from './JobActions';
import { isEmployerLink } from '@/lib/pipeline/apply';
import Score from './Score';
import { daysUntil, eligClass, eligText, initials, postedLabel, trustClass } from '@/lib/format';

export type BoardJob = CardJob & {
  summary: string | null; advice: string | null; match_score: number | null; match_band: string | null; scored_by: string | null;
  eligibility_label: string | null; trust_label: string | null; salary_text: string | null; posted_at: string | null; deadline: string | null;
  location: string | null; job_type: string | null; seniority: string | null; role_families: string[]; is_repost: boolean;
  source_count: number; applied_at: string | null; found_at: string;
  match_reasons?: string[] | null; gaps?: { gap: string; closable: boolean }[] | null;
};

const TABS = [['new', 'New'], ['shortlisted', 'Shortlisted'], ['applied', 'Applied'], ['interviewing', 'Interviewing'], ['offer', 'Offer'], ['rejected', 'Rejected'], ['not_a_match', 'Not a match']] as const;
const tabOf = (s: string) => (s === 'acknowledged' ? 'applied' : s === 'interviewed_stalled' ? 'interviewing' : s === 'withdrawn' ? 'rejected' : s);

const SHORTCUT_WORDS = ['Automation Specialist', 'AI Automation', 'CRM Specialist', 'Revenue Operations', 'Data Analyst', 'Business Intelligence', 'Implementation Specialist'];
const shortcuts = (q: string) => {
  const e = encodeURIComponent(q);
  return [
    ['LinkedIn', `https://www.linkedin.com/jobs/search/?keywords=${e}&f_TPR=r86400&f_WT=2`],
    ['Indeed', `https://ng.indeed.com/jobs?q=${e}&fromage=3`],
    ['Jobberman', `https://www.jobberman.com/jobs?q=${e}`],
    ['Jobgurus', `https://www.google.com/search?q=${encodeURIComponent(`site:jobgurus.com.ng ${q}`)}&tbs=qdr:w`],
    ['Hot Nigerian Jobs', `https://www.google.com/search?q=${encodeURIComponent(`site:hotnigerianjobs.com ${q}`)}&tbs=qdr:w`],
    ['Google jobs', `https://www.google.com/search?q=${encodeURIComponent(`${q} remote jobs`)}&udm=8`],
  ];
};

function AddJobModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  const [busy, start] = useTransition();
  return (
    <Modal title="Add a job I found" onClose={onClose}>
      <p className="muted" style={{ margin: 0 }}>For jobs from LinkedIn, Indeed, Jobberman, Google or anywhere else. The app checks, scores and tracks it like the others.</p>
      <form className="stack" style={{ gap: 8 }} action={(fd) => start(async () => {
        const r = await addJob(fd);
        if (r.ok && r.id) { onClose(); router.push(`/jobs/${r.id}`); } else setMsg(r.message);
      })}>
        <label htmlFor="aj-url">Link to the job</label>
        <input id="aj-url" name="url" type="url" required className="inp" placeholder="https://" />
        <div className="cols" style={{ gap: 8 }}>
          <div><label htmlFor="aj-title">Job title</label><input id="aj-title" name="title" className="inp" style={{ width: '100%' }} required /></div>
          <div><label htmlFor="aj-co">Company</label><input id="aj-co" name="company" className="inp" style={{ width: '100%' }} required /></div>
        </div>
        <label htmlFor="aj-loc">Location as written in the posting (for example "Remote, Worldwide" or "Lagos")</label>
        <input id="aj-loc" name="location" className="inp" />
        <label htmlFor="aj-text">Job description (copy and paste the text from the page)</label>
        <textarea id="aj-text" name="text" rows={8} className="inp" />
        {msg && <p className="notice bad" role="alert">{msg}</p>}
        <button className="btn p" disabled={busy}>{busy ? 'Checking the job…' : 'Add job'}</button>
      </form>
    </Modal>
  );
}

export default function JobsBoard({ jobs, lastRun, aiOn }: { jobs: BoardJob[]; lastRun: { when: string; summary: string; trigger: string } | null; aiOn: boolean }) {
  const [tab, setTab] = useState('new');
  const [q, setQ] = useState('');
  const [elig, setElig] = useState('');
  const [fam, setFam] = useState('');
  const [how, setHow] = useState('');
  const [sort, setSort] = useState('match');
  const [adding, setAdding] = useState(false);
  const [word, setWord] = useState(SHORTCUT_WORDS[0]);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, start] = useTransition();

  const count = (t: string) => jobs.filter((j) => tabOf(j.status) === t).length;
  const appliedAll = jobs.filter((j) => !['new', 'shortlisted', 'not_a_match'].includes(j.status));
  const heard = appliedAll.filter((j) => !['applied', 'withdrawn'].includes(j.status));
  const stats: [string, string | number][] = [
    ['Jobs found', jobs.length], ['To review', count('new')], ['Applied', appliedAll.length], ['Heard back', heard.length],
    ['Interviews', jobs.filter((j) => ['interviewing', 'interviewed_stalled'].includes(j.status)).length],
    ['Offers', jobs.filter((j) => j.status === 'offer').length],
    ['Response rate', appliedAll.length ? `${Math.round((100 * heard.length) / appliedAll.length)}%` : '–'],
  ];

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return jobs.filter((j) => tabOf(j.status) === tab)
      .filter((j) => !s || `${j.title} ${j.company} ${j.summary ?? ''}`.toLowerCase().includes(s))
      .filter((j) => !elig || j.eligibility_label === elig)
      .filter((j) => !fam || j.role_families?.includes(fam))
      .filter((j) => !how || j.apply_method === how)
      .sort((a, b) => sort === 'newest' ? (b.posted_at ?? '').localeCompare(a.posted_at ?? '')
        : sort === 'deadline' ? (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999')
        : (b.match_score ?? 0) - (a.match_score ?? 0));
  }, [jobs, tab, q, elig, fam, how, sort]);

  const filtered = !!(q || elig || fam || how);
  const today = new Date().toISOString().slice(0, 10);
  const expired = jobs.filter((j) => j.deadline && j.deadline < today && ['new', 'shortlisted', 'not_a_match'].includes(j.status)).length;
  const [cleaning, clean] = useTransition();
  const trig = lastRun?.trigger === 'daily' ? ' · daily search' : lastRun?.trigger === 'test' ? ' · test run' : '';

  return (
    <>
      <section className="hero">
        <div className="row" style={{ gap: 16, justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div className="stack" style={{ gap: 4, flex: 1, minWidth: 260 }}>
            <span className="small">{busy ? 'Working…' : lastRun ? `Last search: ${lastRun.when}${trig}` : 'No search yet'}</span>
            <h1>{busy ? 'Searching 8 job boards…' : count('new') ? `${count('new')} job${count('new') === 1 ? '' : 's'} waiting for your review` : 'You are all caught up'}</h1>
            <span className="muted">{busy ? 'This takes about a minute. Please keep this page open.' : lastRun ? lastRun.summary : 'Click "Find new jobs now" to run your first search.'}</span>
            <span className="small">A new search runs by itself every day at about 6:00am Lagos time. <Link href="/history">See what was dropped and why</Link></span>
          </div>
          <div className="row">
            <button className="btn" onClick={() => setAdding(true)}>+ Add a job I found</button>
            <button className="btn p big" disabled={busy} onClick={() => start(async () => setResult(await findJobs()))}>{busy ? 'Searching…' : 'Find new jobs now'}</button>
          </div>
        </div>
        <div className="kpis" aria-label="Summary">
          {stats.map(([label, v]) => <div className="kpi" key={label}><span>{label}</span><b>{v}</b></div>)}
        </div>
      </section>
      {result && <p className={`notice ${result.ok ? 'good' : 'bad'}`} role="status">{result.ok ? 'Search finished. ' : ''}{result.message}</p>}
      {!aiOn && <p className="notice info">Scores and letters use simple rules for now (free). Add an AI key on <Link href="/profile">Profile &amp; rules</Link> for smarter scoring and tailored letters.</p>}

      <div className="board">
        <aside className="side" aria-label="Stages and filters">
          <div className="card">
            <h4>Stages</h4>
            <div className="stages" role="tablist" aria-label="Stages">
              {TABS.map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} className={`stage ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{label}<span className="n">{count(k)}</span></button>)}
            </div>
          </div>
          <div className="card stack" style={{ gap: 8 }}>
            <h4>Filter</h4>
            <label htmlFor="f-q">Search</label>
            <input id="f-q" type="search" className="inp" placeholder="Title, company or skill" value={q} onChange={(e) => setQ(e.target.value)} />
            <label htmlFor="f-e">Who can apply</label>
            <select id="f-e" className="inp" value={elig} onChange={(e) => setElig(e.target.value)}>
              <option value="">All</option>
              {['Worldwide', 'Nigeria eligible', 'Africa eligible', 'EMEA', 'Relocation supported', 'Unclear'].map((o) => <option key={o}>{o}</option>)}
            </select>
            <label htmlFor="f-f">Role type</label>
            <select id="f-f" className="inp" value={fam} onChange={(e) => setFam(e.target.value)}>
              <option value="">All</option>
              {['Automation', 'Data & BI', 'CRM & RevOps', 'AI & Agents', 'Product & Business Ops', 'Customer Ops'].map((o) => <option key={o}>{o}</option>)}
            </select>
            <label htmlFor="f-h">How to apply</label>
            <select id="f-h" className="inp" value={how} onChange={(e) => setHow(e.target.value)}>
              <option value="">All</option><option value="email">By email</option><option value="link">On a website</option>
            </select>
            {filtered && <button className="btn ghost" onClick={() => { setQ(''); setElig(''); setFam(''); setHow(''); }}>Clear filters</button>}
          </div>
          <div className="card stack" style={{ gap: 8 }}>
            <h4>Search other sites</h4>
            <p className="muted small" style={{ margin: 0 }}>These sites do not let apps collect jobs. Open one, then use "+ Add a job I found".</p>
            <label className="sr" htmlFor="sc-w">Role to search for</label>
            <select id="sc-w" className="inp" value={word} onChange={(e) => setWord(e.target.value)}>{SHORTCUT_WORDS.map((w) => <option key={w}>{w}</option>)}</select>
            <div className="row" style={{ gap: 6 }}>
              {shortcuts(word).map(([name, url]) => <a key={name} className="btn" style={{ minHeight: 36, padding: '0 10px', fontSize: 12 }} href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}
            </div>
          </div>
        </aside>

        <section className="list" aria-label="Jobs">
          <div className="listhead">
            <h2>{TABS.find(([k]) => k === tab)?.[1]} <span className="muted" style={{ fontWeight: 500 }}>· {shown.length}</span></h2>
            <span className="grow" />
            {expired > 0 && (
              <button className="btn danger" disabled={cleaning}
                onClick={() => {
                  if (!window.confirm(`Delete ${expired} job${expired === 1 ? '' : 's'} whose deadline has passed?\n\nJobs you already applied to are kept in your tracker.`)) return;
                  clean(async () => setResult(await deleteExpiredJobs()));
                }}>{cleaning ? 'Deleting…' : `Delete expired jobs (${expired})`}</button>
            )}
            <label className="sr" htmlFor="f-s">Sort</label>
            <select id="f-s" className="inp" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="match">Best match first</option><option value="newest">Newest first</option><option value="deadline">Deadline soonest</option>
            </select>
          </div>

          {shown.length === 0 && <div className="empty">{jobs.length ? (filtered ? 'No jobs match these filters.' : 'Nothing in this stage yet.') : 'No jobs yet. Run your first search.'}</div>}
          {shown.map((j) => {
            const left = daysUntil(j.deadline);
            const follow = j.status === 'applied' && j.applied_at && Date.now() - new Date(j.applied_at).getTime() > 7 * 86400000;
            const reason = j.match_reasons?.[0];
            const gap = j.gaps?.[0]?.gap;
            return (
              <article key={j.id} className="card job">
                <div className="job-top">
                  <span className="ava" aria-hidden="true">{initials(j.company)}</span>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <h2><Link href={`/jobs/${j.id}`}>{j.title}</Link></h2>
                    <span className="meta">{[j.company, j.job_type, j.seniority].filter(Boolean).join(' · ')}</span>
                    <div className="row" style={{ gap: 6, marginTop: 2 }}>
                      <span className={`b ${trustClass(j.trust_label)}`}>Legit check: {j.trust_label?.toLowerCase()}</span>
                      {j.source_count > 1 && <span className="b">On {j.source_count} job boards</span>}
                      {left != null && left <= 5 && <span className="b r">{left < 0 ? 'Deadline passed' : left === 0 ? 'Closes today' : `Closes in ${left} days`}</span>}
                      {j.is_repost && <span className="b w">Reposted</span>}
                      {follow && <span className="b w">Time to follow up</span>}
                    </div>
                  </div>
                  <Score score={j.match_score} band={j.match_band} />
                </div>
                <div className="facts4">
                  <div><span>Who can apply</span><b className={eligClass(j.eligibility_label)}>{eligText(j.eligibility_label)}</b></div>
                  <div><span>Salary</span><b title={j.salary_text ?? undefined}>{j.salary_text || 'Not listed'}</b></div>
                  <div><span>Posted</span><b>{postedLabel(j.posted_at).replace('Posted ', '')}{left != null && left > 5 ? ` · ${left}d left` : ''}</b></div>
                  <div><span>Apply</span>{j.apply_method === 'email' ? <b>By email</b>
                    : isEmployerLink(j.apply_url) ? <b className="g">On company site</b>
                    : <b className="w" title={j.apply_url}>Via {(() => { try { return new URL(j.apply_url).hostname.replace(/^www\./, ''); } catch { return 'job site'; } })()}</b>}</div>
                </div>
                {j.summary && <p style={{ margin: 0 }}>{j.summary}</p>}
                {(reason || gap) && (
                  <div className="why">
                    {reason && <span><b>Fits:</b> {reason}</span>}
                    {gap && <span><b>Gap:</b> {gap}</span>}
                  </div>
                )}
                {j.advice && <p className={`advice ${j.eligibility_label === 'Unclear' ? 'w' : ''}`}>{j.advice}</p>}
                <JobActions job={j} />
              </article>
            );
          })}
          <p className="muted small" style={{ margin: 0 }}>
            Jobs are sourced from <a href="https://remotive.com">Remotive</a>, <a href="https://himalayas.app">Himalayas</a>, <a href="https://jobicy.com">Jobicy</a>, <a href="https://remoteok.com">Remote OK</a>, <a href="https://www.arbeitnow.com">Arbeitnow</a>, <a href="https://www.workingnomads.com">Working Nomads</a>, <a href="https://workafro.com">Workafro</a> and <a href="https://www.myjobmag.com">MyJobMag</a>. Each job links back to where it was found.
          </p>
        </section>
      </div>
      {adding && <AddJobModal onClose={() => setAdding(false)} />}
    </>
  );
}
