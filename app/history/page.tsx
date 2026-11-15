import Nav from '@/components/Nav';
import { requireOwner } from '@/lib/session';
import { sourceName } from '@/lib/sources';
import { fmtDateTime } from '@/lib/format';
import type { SourceStat } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function History() {
  const { supabase } = await requireOwner();
  const { data: runs } = await supabase.from('jh_runs').select('*').order('started_at', { ascending: false }).limit(30);
  const latest = runs?.[0];
  const { data: dropped } = latest
    ? await supabase.from('jh_dropped_jobs').select('title, company, url, source, reason').eq('run_id', latest.id).order('reason').limit(500)
    : { data: [] };
  const kind = (r: string) => r.split(':')[0];
  return (
    <>
      <Nav current="/history" />
      <main className="wrap">
      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 style={{ fontSize: 22 }}>Search history</h1>
        {!runs?.length ? <p className="muted">No searches yet.</p> : (
          <div className="tablebox">
            <table className="t">
              <thead><tr><th>When</th><th>Type</th><th>Found</th><th>Duplicates merged</th><th>Dropped</th><th>New for you</th><th>Problems</th></tr></thead>
              <tbody>
                {runs.map((r) => {
                  const bad = ((r.source_stats ?? []) as SourceStat[]).filter((s) => s.error);
                  return (
                    <tr key={r.id}>
                      <td>{fmtDateTime(r.started_at)}</td><td>{r.trigger === 'daily' ? 'Daily (6am)' : r.trigger === 'test' ? 'Test run' : 'You clicked'}</td>
                      <td>{r.found}</td><td>{r.merged}</td><td>{r.dropped}</td><td><b>{r.added}</b></td>
                      <td>{bad.length === 0 ? <span className="b g">None</span> : bad.map((s) => <div key={s.source}><span className="b w">{sourceName(s.source)} skipped</span> <span className="muted small">{s.error}</span></div>)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="muted small" style={{ margin: 0 }}>"Found" is every job the boards returned. Most are other professions; only jobs in your role types are checked further.</p>
      </section>
      {latest && (
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Dropped in the latest search ({dropped?.length ?? 0}) and why</h2>
          <div className="tablebox">
            <table className="t">
              <thead><tr><th>Job</th><th>Company</th><th>Found on</th><th>Why it was dropped</th></tr></thead>
              <tbody>
                {(dropped ?? []).map((d, i) => (
                  <tr key={i}>
                    <td><a href={d.url} target="_blank" rel="noopener noreferrer">{d.title}</a></td><td>{d.company}</td><td>{sourceName(d.source)}</td>
                    <td><span className={`b ${kind(d.reason) === 'Location' || kind(d.reason) === 'High risk' ? 'r' : 'w'}`}>{kind(d.reason)}</span> {d.reason.slice(kind(d.reason).length + 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small" style={{ margin: 0 }}>If the app got one wrong, open the link and use "Add a job I found" on the Jobs page to keep it.</p>
        </section>
      )}
      </main>
    </>
  );
}
