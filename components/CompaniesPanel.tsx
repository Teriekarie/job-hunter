'use client';

import { useMemo, useState, useTransition } from 'react';
import { addCompany, setCompanyActive } from '@/app/actions';

export type Company = { ats: string; slug: string; name: string; added_by: string; active: boolean };

const ATS_NAME: Record<string, string> = { greenhouse: 'Greenhouse', lever: 'Lever', ashby: 'Ashby', workable: 'Workable', smartrecruiters: 'SmartRecruiters' };
const boardUrl = (c: Company) => ({
  greenhouse: `https://job-boards.greenhouse.io/${c.slug}`, lever: `https://jobs.lever.co/${c.slug}`, ashby: `https://jobs.ashbyhq.com/${c.slug}`,
  workable: `https://apply.workable.com/${c.slug}/`, smartrecruiters: `https://jobs.smartrecruiters.com/${c.slug}`,
} as Record<string, string>)[c.ats];

export default function CompaniesPanel({ companies }: { companies: Company[] }) {
  const [q, setQ] = useState('');
  const [showOff, setShowOff] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, start] = useTransition();
  const active = companies.filter((c) => c.active);
  const list = useMemo(() => companies
    .filter((c) => (showOff ? !c.active : c.active))
    .filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name)), [companies, q, showOff]);

  return (
    <section className="card stack">
      <div>
        <h3>Companies checked directly ({active.length})</h3>
        <p className="muted" style={{ margin: 0 }}>
          Every day the app reads these companies' own hiring pages. Jobs from them open the company's own application form, which normally needs no account.
          New companies are added automatically when a job site shows one of their jobs.
        </p>
      </div>

      <form className="row" action={(fd) => start(async () => setMsg(await addCompany(fd)))}>
        <label className="sr" htmlFor="co-url">Careers page link</label>
        <input id="co-url" name="url" className="inp grow" style={{ minWidth: 220 }} placeholder="Paste a careers page link, e.g. https://jobs.lever.co/company" required />
        <label className="sr" htmlFor="co-name">Company name</label>
        <input id="co-name" name="name" className="inp" style={{ width: 180 }} placeholder="Company name" required />
        <button className="btn p" disabled={busy}>{busy ? 'Checking…' : 'Add company'}</button>
      </form>
      {msg && <p className={`notice ${msg.ok ? 'good' : 'bad'}`} role="status">{msg.message}</p>}
      <p className="muted small" style={{ margin: 0 }}>
        Works with companies that use Greenhouse, Lever, Ashby, Workable or SmartRecruiters. Tip: on a company's careers page, click any job; the link usually shows which one it uses.
      </p>

      <div className="row">
        <label className="sr" htmlFor="co-q">Find a company</label>
        <input id="co-q" type="search" className="inp grow" placeholder="Find a company" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="btn ghost" onClick={() => setShowOff((v) => !v)}>{showOff ? 'Show companies being checked' : `Show removed (${companies.length - active.length})`}</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 8 }}>
        {list.map((c) => (
          <div key={`${c.ats}:${c.slug}`} className="row" style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '6px 6px 6px 12px', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
            <div style={{ minWidth: 0 }}>
              <a href={boardUrl(c)} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, textDecoration: 'none' }}>{c.name}</a>
              <div className="muted small">{ATS_NAME[c.ats]}{c.added_by === 'auto' ? ' · found automatically' : c.added_by === 'you' ? ' · added by you' : ''}</div>
            </div>
            <button type="button" className="btn ghost" style={{ minHeight: 36, padding: '0 10px', color: c.active ? 'var(--bad)' : 'var(--brand)' }} disabled={busy}
              aria-label={`${c.active ? 'Stop checking' : 'Check again'} ${c.name}`}
              onClick={() => start(async () => setMsg(await setCompanyActive(c.ats, c.slug, !c.active)))}>{c.active ? 'Remove' : 'Restore'}</button>
          </div>
        ))}
        {!list.length && <p className="muted" style={{ margin: 0 }}>No companies here.</p>}
      </div>
    </section>
  );
}
