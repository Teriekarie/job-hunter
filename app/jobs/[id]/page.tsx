import Link from 'next/link';
import { notFound } from 'next/navigation';
import JobActions from '@/components/JobActions';
import { Notes, StageSelect } from '@/components/DetailBits';
import { requireOwner } from '@/lib/session';
import { sourceName } from '@/lib/sources';
import { stageName, type Gap } from '@/lib/types';
import { daysUntil, eligClass, fmtDate, fmtDateTime, postedLabel, ringClass, trustClass } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireOwner();
  const { data: j } = await supabase.from('jh_jobs').select('*, jh_job_sources(source, source_url), jh_status_history(status, changed_at, note)').eq('id', id).maybeSingle();
  if (!j) notFound();
  const left = daysUntil(j.deadline);
  const history = [...(j.jh_status_history ?? [])].sort((a: any, b: any) => a.changed_at.localeCompare(b.changed_at));
  const tone = (c: string) => (c.startsWith('Good') ? 'var(--good)' : c.startsWith('Warning') ? 'var(--bad)' : 'var(--warn)');

  return (
    <main className="wrap">
      <Link href="/" style={{ padding: '10px 0', fontWeight: 600, textDecoration: 'none' }}>← Back to all jobs</Link>

      <header className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="row" style={{ gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flex: '0 0 76px', textAlign: 'center' }}>
            <div className={`ring ${ringClass(j.match_score)}`} style={{ width: 64, height: 64, fontSize: 20, borderWidth: 4 }}>{j.match_score ?? '–'}</div>
            <span className="small muted">{j.match_band} match</span>
          </div>
          <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h1 style={{ margin: 0, fontSize: 22 }}>{j.title}</h1>
            <span className="muted" style={{ fontWeight: 500 }}>{j.company}{j.company_website && <> · <a href={j.company_website} target="_blank" rel="noopener noreferrer">{j.company_website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a></>}</span>
            <div className="row" style={{ gap: 6 }}>
              <span className={`b ${eligClass(j.eligibility_label)}`}>{j.eligibility_label === 'Unclear' ? 'Check who can apply' : j.eligibility_label}</span>
              <span className={`b ${trustClass(j.trust_label)}`}>Legit check: {j.trust_label?.toLowerCase()}</span>
              <span className="b u">{j.apply_method === 'email' ? 'Apply by email' : 'Apply on website'}</span>
              {(j.role_families ?? []).map((f: string) => <span className="b" key={f}>{f}</span>)}
            </div>
          </div>
          <StageSelect jobId={j.id} status={j.status} />
        </div>
        {j.advice && <p className="notice good" style={{ margin: 0, fontWeight: 500 }}>Advice: {j.advice}</p>}
        <JobActions job={j} showDetailsLink={false} />
        <div className="row"><a className="btn" href={j.jh_job_sources?.[0]?.source_url ?? j.apply_url} target="_blank" rel="noopener noreferrer">View original posting ↗</a></div>
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
            <dt>How to apply</dt><dd>{j.apply_method === 'email' ? `Email to ${j.apply_email}` : 'On the website'}</dd>
            {j.applied_at && <><dt>You applied</dt><dd>{fmtDate(j.applied_at)} by {j.applied_via}</dd></>}
          </dl>
        </section>

        <section className="card">
          <h3>Can I apply from Nigeria?</h3>
          <p style={{ margin: '0 0 8px' }}><span className={`b ${eligClass(j.eligibility_label)}`}>{j.eligibility_label}</span></p>
          <p style={{ margin: 0 }}>{j.eligibility_evidence}</p>
          <h3 style={{ marginTop: 14 }}>Where this job was found</h3>
          <ul>{(j.jh_job_sources ?? []).map((s: any) => <li key={s.source_url}><a href={s.source_url} target="_blank" rel="noopener noreferrer">{sourceName(s.source)}</a></li>)}</ul>
        </section>

        <section className="card">
          <h3>Why it fits you</h3>
          {j.match_reasons?.length ? <ul>{j.match_reasons.map((r: string) => <li key={r}>{r}</li>)}</ul> : <p className="muted" style={{ margin: 0 }}>No strong reasons found.</p>}
          <h3 style={{ marginTop: 14 }}>Gaps</h3>
          {j.gaps?.length ? <ul>{j.gaps.map((g: Gap) => <li key={g.gap}>{g.gap} <span className={`b ${g.closable ? 'g' : 'w'}`}>{g.closable ? 'Can be closed' : 'Hard to close'}</span></li>)}</ul> : <p className="muted" style={{ margin: 0 }}>None found.</p>}
          {j.cv_tips?.length > 0 && <><h3 style={{ marginTop: 14 }}>CV changes for this job</h3><ul>{j.cv_tips.map((t: string) => <li key={t}>{t}</li>)}</ul></>}
          <p className="muted small" style={{ margin: '10px 0 0' }}>{j.scored_by === 'ai' ? 'Scored by AI against your CV.' : 'Scored by simple rules against your CV (tools, years, role, location).'}</p>
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
  );
}
