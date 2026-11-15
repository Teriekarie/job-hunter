import Link from 'next/link';
import Nav from '@/components/Nav';
import { requireOwner } from '@/lib/session';
import { stageName } from '@/lib/types';
import { daysAgo, daysUntil, fmtDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Tracker() {
  const { supabase } = await requireOwner();
  const { data } = await supabase.from('jh_jobs').select('id, title, company, status, applied_at, applied_via, deadline, notes, updated_at')
    .not('status', 'in', '(new,not_a_match)').order('applied_at', { ascending: false, nullsFirst: false });
  const rows = data ?? [];
  return (
    <>
      <Nav current="/tracker" />
      <main className="wrap">
      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 22 }}>My applications</h1>
          <a className="btn" href="/api/export">Download as spreadsheet (CSV)</a>
        </div>
        {rows.length === 0 ? <p className="muted">Nothing here yet. Jobs you shortlist or apply to appear in this list.</p> : (
          <div className="tablebox">
            <table className="t">
              <thead><tr><th>Job</th><th>Stage</th><th>Applied</th><th>How</th><th>Last update</th><th>Reminder</th><th>Notes</th></tr></thead>
              <tbody>
                {rows.map((j) => {
                  const waiting = j.status === 'applied' ? daysAgo(j.applied_at) : null;
                  const left = ['shortlisted'].includes(j.status) ? daysUntil(j.deadline) : null;
                  return (
                    <tr key={j.id}>
                      <td><Link href={`/jobs/${j.id}`} style={{ fontWeight: 600 }}>{j.title}</Link><br /><span className="muted">{j.company}</span></td>
                      <td><span className={`b ${j.status === 'offer' ? 'g' : j.status === 'rejected' ? 'r' : j.status === 'applied' || j.status === 'shortlisted' ? '' : 'u'}`}>{stageName(j.status)}</span></td>
                      <td>{fmtDate(j.applied_at) || '–'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{j.applied_via || '–'}</td>
                      <td>{fmtDate(j.updated_at)}</td>
                      <td>
                        {waiting != null && waiting >= 7 && <><span className="b w">Time to follow up ({waiting} days)</span><br /><Link href={`/jobs/${j.id}/email?followup=1`}>Draft follow-up email</Link></>}
                        {left != null && left >= 0 && left <= 5 && <span className="b r">Closes in {left} days</span>}
                        {!(waiting != null && waiting >= 7) && !(left != null && left >= 0 && left <= 5) && '–'}
                      </td>
                      <td className="muted" style={{ maxWidth: 240 }}>{j.notes || ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="muted small" style={{ margin: 0 }}>A follow-up reminder appears 7 days after applying with no change. A deadline warning appears when a shortlisted job closes within 5 days.</p>
      </section>
      </main>
    </>
  );
}
