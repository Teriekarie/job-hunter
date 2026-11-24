import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Score from '@/components/Score';
import JobActions from '@/components/JobActions';
import { AiCheck, Notes, StageSelect } from '@/components/DetailBits';
import { requireOwner } from '@/lib/session';
import { sourceName } from '@/lib/sources';
import { aiEnabled } from '@/lib/ai';
import { stageName, type Gap } from '@/lib/types';
import { daysUntil, eligClass, eligText, fmtDate, fmtDateTime, initials, postedLabel, trustClass } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireOwner();
  const { data: j } = await supabase.from('jh_jobs').select('*, jh_job_sources(source, source_url), jh_status_history(status, changed_at, note)').eq('id', id).maybeSingle();
  if (!j) notFound();
  const left = daysUntil(j.deadline);
  const history = [...(j.jh_status_history ?? [])].sort((a: any, b: any) => a.changed_at.localeCompare(b.changed_at));
  const tone = (c: string) => (c.startsWith('Good') ? 'var(--good)' : c.startsWith('Warning') ? 'var(--bad)' : 'var(--warn)');
  const firstSource = j.jh_job_sources?.[0]?.source_url ?? j.apply_url;

  return (
    <>
      <Nav current="/" />
      <main className="wrap">
        <Link href="/" style={{ fontWeight: 600, textDecoration: 'none' }}>← Back to all jobs</Link>

        <header className="card stack">
          <div className="job-top">
            <span className="ava" aria-hidden="true">{initials(j.company)}</span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h1 style={{ fontSize: 24 }}>{j.title}</h1>
              <span className="meta">{j.company}{j.company_website && <> · <a href={j.company_website} target="_blank" rel="noopener noreferrer">{j.company_website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a></>}</span>
              <div className="row" style={{ gap: 6 }}>
                <span className={`b ${eligClass(j.eligibility_label)}`}>{eligText(j.eligibility_label)}</span>
                <span className={`b ${trustClass(j.trust_label)}`}>Legit check: {j.trust_label?.toLowerCase()}</span>
                <span className="b u">{j.apply_method === 'email' ? 'Apply by email' : 'Apply on website'}</span>
                {(j.role_families ?? []).map((f: string) => <span className="b" key={f}>{f}</span>)}
              </div>
            </div>
            <Score score={j.match_score} band={j.match_band} large />
          </div>
          <div className="row" style={{ alignItems: 'flex-end' }}>
            {j.advice && <p className={`advice grow ${j.eligibility_label === 'Unclear' ? 'w' : ''}`}>{j.advice}</p>}
            <StageSelect jobId={j.id} status={j.status} />
          </div>
          <JobActions job={j} showDetailsLink={false} onJobPage />
          {firstSource !== j.apply_url && <a className="small" href={firstSource} target="_blank" rel="noopener noreferrer">View the original listing ↗</a>}
        </header>

        <div className="cols">
          <section className="card">
            <h3>Job details</h3>
            <dl className="facts">
              <dt>Salary</dt><dd>{j.salary_text || 'Not listed'}</dd>
              <dt>Job type</dt><dd>{j.job_type || 'Not stated'}</dd>
              <dt>Level</dt><dd>{j.seniority || 'Not stated'}</dd>
              <dt>Work mode</dt><dd style={{ textTransform: 'capitalize' }}>{j.work_mode}</dd>
              <dt>Location</dt><dd>{j.location || 'Not stated'}</dd>
              <dt>Posted</dt><dd>{j.posted_at ? `${fmtDate(j.posted_at)} (${postedLabel(j.posted_at).replace('Posted ', '')})` : 'Not given'}{j.is_repost && ' · reposted'}</dd>
              <dt>Found by app</dt><dd>{fmtDate(j.found_at)}</dd>
              <dt>Deadline</dt><dd>{j.deadline ? `${fmtDate(j.deadline)} (${left! < 0 ? 'passed' : `${left} days left`})` : 'Not given'}</dd>
              <dt>How to apply</dt><dd>{j.apply_method === 'email' ? `Email to ${j.apply_email}` : <a href={j.apply_url} target="_blank" rel="noopener noreferrer">{new URL(j.apply_url).hostname.replace(/^www\./, '')} ↗</a>}</dd>
              {j.applied_at && <><dt>You applied</dt><dd>{fmtDate(j.applied_at)} by {j.applied_via}</dd></>}
            </dl>
          </section>

          <section className="card">
            <h3>Can I apply from Nigeria?</h3>
            <p style={{ margin: '0 0 8px' }}><span className={`b ${eligClass(j.eligibility_label)}`}>{j.eligibility_label}</span></p>
            <p style={{ margin: 0 }}>{j.eligibility_evidence}</p>
            <h3 style={{ marginTop: 16 }}>Where this job was found</h3>
            <ul>{(j.jh_job_sources ?? []).map((s: any) => <li key={s.source_url}><a href={s.source_url} target="_blank" rel="noopener noreferrer">{sourceName(s.source)}</a></li>)}</ul>
          </section>

          <section className="card">
            <h3>Why it fits you</h3>
            {j.match_reasons?.length ? <ul>{j.match_reasons.map((r: string) => <li key={r}>{r}</li>)}</ul> : <p className="muted" style={{ margin: 0 }}>No strong reasons found.</p>}
            <h3 style={{ marginTop: 16 }}>Gaps</h3>
            {j.gaps?.length ? <ul>{j.gaps.map((g: Gap) => <li key={g.gap}>{g.gap} <span className={`b ${g.closable ? 'g' : 'w'}`}>{g.closable ? 'Can be closed' : 'Hard to close'}</span></li>)}</ul> : <p className="muted" style={{ margin: 0 }}>None found.</p>}
            {j.cv_tips?.length > 0 && <><h3 style={{ marginTop: 16 }}>CV changes for this job</h3><ul>{j.cv_tips.map((t: string) => <li key={t}>{t}</li>)}</ul></>}
            <AiCheck jobId={j.id} scoredBy={j.scored_by} aiOn={aiEnabled()} />
          </section>

          <section className="card">
            <h3>Is it legitimate?</h3>
            <p style={{ margin: '0 0 8px' }}><span className={`b ${trustClass(j.trust_label)}`}>{j.trust_label}</span></p>
            <ul>{(j.trust_checks ?? []).map((c: string) => { const [k, ...rest] = c.split(': '); return <li key={c}><b style={{ color: tone(c) }}>{k}:</b> {rest.join(': ')}</li>; })}</ul>
          </section>
        </div>

        {j.requirements?.length > 0 && (
          <section className="card"><h3>What they are asking for</h3><ul>{j.requirements.map((r: string) => <li key={r}>{r}</li>)}</ul></section>
        )}

        <section className="card">
          <h3>Full job description</h3>
          <div className="desc">{j.description}</div>
        </section>

        <div className="cols">
          <section className="card"><h3>My notes</h3><Notes jobId={j.id} initial={j.notes ?? ''} /></section>
          <section className="card">
            <h3>History</h3>
            <ul>{history.map((h: any) => <li key={h.changed_at + h.status}>{fmtDateTime(h.changed_at)}: {stageName(h.status)}{h.note ? ` (${h.note})` : ''}</li>)}</ul>
          </section>
        </div>
      </main>
    </>
  );
}
