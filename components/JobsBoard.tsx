'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { addJob, findJobs } from '@/app/actions';
import JobActions, { Modal, type CardJob } from './JobActions';
import { daysUntil, eligClass, postedLabel, ringClass, trustClass } from '@/lib/format';

export type BoardJob = CardJob & {
  summary: string | null; advice: string | null; match_score: number | null; match_band: string | null; scored_by: string | null;
  eligibility_label: string | null; trust_label: string | null; salary_text: string | null; posted_at: string | null; deadline: string | null;
  location: string | null; job_type: string | null; seniority: string | null; role_families: string[]; is_repost: boolean;
  source_count: number; applied_at: string | null; found_at: string;
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
      <form style={{ display: 'flex', flexDirection: 'column', gap: 8 }} action={(fd) => start(async () => {
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
        {msg && <p className="notice bad" role="alert" style={{ margin: 0 }}>{msg}</p>}
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
  const metrics: [string, string | number][] = [
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

  return (
    <>
      <section className="card row" style={{ gap: 14, justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="display" style={{ fontWeight: 700, fontSize: 18 }}>
            {busy ? 'Searching the job boards…' : lastRun ? `Last search: ${lastRun.when}${lastRun.trigger === 'daily' ? ' (daily)' : ''}` : 'No search yet'}
          </div>
          <div className="muted">{busy ? 'This takes about a minute. Please keep this page open.' : lastRun ? lastRun.summary : 'Click "Find new jobs now" to run your first search.'}</div>
          <div className="muted small">Automatic search runs every day at about 6:00am Lagos time. <Link href="/history">See what was dropped and why</Link></div>
        </div>
        <div className="row">
          <button className="btn" onClick={() => setAdding(true)}>+ Add a job I found</button>
          <button className="btn p" style={{ minHeight: 48, fontSize: 14, padding: '0 18px' }} disabled={busy}
            onClick={() => start(async () => setResult(await findJobs()))}>{busy ? 'Searching…' : 'Find new jobs now'}</button>
        </div>
      </section>
      {result && <p className={`notice ${result.ok ? 'good' : 'bad'}`} role="status" style={{ margin: 0 }}>{result.ok ? 'Search finished. ' : ''}{result.message}</p>}
      {!aiOn && <p className="notice warn" style={{ margin: 0 }}>Scores and letters are using simple rules for now. Add an AI key (see Profile &amp; rules) for smarter scoring and tailored letters.</p>}

      <section className="metrics" aria-label="Summary">
        {metrics.map(([label, v]) => <div className="metric" key={label}><b>{v}</b><span>{label}</span></div>)}
      </section>

      <div className="row" role="tablist" aria-label="Stages" style={{ gap: 6 }}>
        {TABS.map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{label} · {count(k)}</button>)}
      </div>

      <div className="card row" style={{ padding: 10 }}>
        <label className="sr" htmlFor="f-q">Search jobs</label>
        <input id="f-q" type="search" className="inp grow" style={{ minWidth: 180 }} placeholder="Search title, company or skill" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="sr" htmlFor="f-e">Who can apply</label>
        <select id="f-e" className="inp" value={elig} onChange={(e) => setElig(e.target.value)}>
          <option value="">Who can apply: all</option>
          {['Worldwide', 'Nigeria eligible', 'Africa eligible', 'EMEA', 'Relocation supported', 'Unclear'].map((o) => <option key={o}>{o}</option>)}
        </select>
        <label className="sr" htmlFor="f-f">Role type</label>
        <select id="f-f" className="inp" value={fam} onChange={(e) => setFam(e.target.value)}>
          <option value="">Role type: all</option>
          {['Automation', 'Data & BI', 'CRM & RevOps', 'AI & Agents', 'Product & Business Ops', 'Customer Ops'].map((o) => <option key={o}>{o}</option>)}
        </select>
        <label className="sr" htmlFor="f-h">How to apply</label>
        <select id="f-h" className="inp" value={how} onChange={(e) => setHow(e.target.value)}>
          <option value="">How to apply: all</option><option value="email">By email</option><option value="link">On a website</option>
        </select>
        <label className="sr" htmlFor="f-s">Sort</label>
        <select id="f-s" className="inp" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="match">Sort: best match</option><option value="newest">Newest</option><option value="deadline">Deadline soonest</option>
        </select>
      </div>

      {shown.length === 0 && <div className="card muted" style={{ textAlign: 'center', padding: 36, borderStyle: 'dashed' }}>{jobs.length ? 'No jobs here with these filters.' : 'No jobs yet. Run your first search.'}</div>}
      {shown.map((j) => {
        const left = daysUntil(j.deadline);
        const follow = j.status === 'applied' && j.applied_at && Date.now() - new Date(j.applied_at).getTime() > 7 * 86400000;
        return (
          <article key={j.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 60px', textAlign: 'center' }}>
                <div className={`ring ${ringClass(j.match_score)}`} aria-label={`Match score ${j.match_score}`}>{j.match_score ?? '–'}</div>
                <span className="small muted">{j.match_band}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <h2 style={{ margin: 0, fontSize: 17 }}><Link href={`/jobs/${j.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{j.title}</Link></h2>
                <span className="muted" style={{ fontWeight: 500 }}>{[j.company, j.location, j.job_type, j.seniority].filter(Boolean).join(' · ')}</span>
                <div className="row" style={{ gap: 6 }}>
                  <span className={`b ${eligClass(j.eligibility_label)}`}>{j.eligibility_label === 'Unclear' ? 'Check who can apply' : j.eligibility_label}</span>
                  <span className={`b ${trustClass(j.trust_label)}`}>Legit check: {j.trust_label?.toLowerCase()}</span>
                  <span className="b u">{j.apply_method === 'email' ? 'Apply by email' : 'Apply on website'}</span>
                  <span className="b">{j.salary_text || 'Salary not listed'}</span>
                  <span className="b">{postedLabel(j.posted_at)}</span>
                  {left != null && <span className={`b ${left <= 5 ? 'r' : ''}`}>{left < 0 ? 'Deadline passed' : left === 0 ? 'Closes today' : `Closes in ${left} days`}</span>}
                  {j.source_count > 1 && <span className="b">Found on {j.source_count} job boards</span>}
                  {j.is_repost && <span className="b w">Reposted</span>}
                  {follow && <span className="b w">Time to follow up</span>}
                </div>
                {j.summary && <p style={{ margin: 0 }}>{j.summary}</p>}
                {j.advice && <p style={{ margin: 0, color: 'var(--good)', fontWeight: 500 }}>Advice: {j.advice}</p>}
              </div>
            </div>
            <JobActions job={j} />
          </article>
        );
      })}

      <section className="card">
        <h3>Search other sites yourself</h3>
        <p className="muted" style={{ margin: '0 0 8px' }}>LinkedIn, Indeed, Jobberman and Google do not let apps search them. These buttons open each site already filtered. When you find a job, come back and click "Add a job I found".</p>
        <div className="row">
          <label className="sr" htmlFor="sc-w">Role to search for</label>
          <select id="sc-w" className="inp" value={word} onChange={(e) => setWord(e.target.value)}>{SHORTCUT_WORDS.map((w) => <option key={w}>{w}</option>)}</select>
          {shortcuts(word).map(([name, url]) => <a key={name} className="btn" href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}
        </div>
      </section>
      <p className="muted small" style={{ margin: 0 }}>
        Jobs are sourced from <a href="https://remotive.com">Remotive</a>, <a href="https://himalayas.app">Himalayas</a>, <a href="https://jobicy.com">Jobicy</a>, <a href="https://remoteok.com">Remote OK</a>, <a href="https://weworkremotely.com">We Work Remotely</a>, <a href="https://www.arbeitnow.com">Arbeitnow</a> and <a href="https://www.workingnomads.com">Working Nomads</a>. Each job links back to where it was found.
      </p>
      {adding && <AddJobModal onClose={() => setAdding(false)} />}
    </>
  );
}
