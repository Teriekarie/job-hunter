'use client';

import { useState, useTransition } from 'react';
import { changePassword, saveProfile } from '@/app/actions';

type Props = {
  cv: string; avoid: string; preferences: string; freshnessDays: number;
  aiKey: boolean; aiScoreOnSearch: boolean; aiMonthlyLimitUsd: number; aiSpent: number;
};

export function ProfileForm(p: Props) {
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, start] = useTransition();
  return (
    <form className="card stack" action={(fd) => start(async () => setMsg(await saveProfile(fd)))}>
      <section className="stack" style={{ gap: 8 }}>
        <h3>AI and spending</h3>
        {!p.aiKey && <p className="notice warn" style={{ margin: 0 }}>No AI key added yet, so the app uses rules and templates (free). See "How to add the AI key" below.</p>}
        <p className="muted" style={{ margin: 0 }}>
          Spent on AI this month: <b className="ink">${p.aiSpent.toFixed(2)}</b> of your ${p.aiMonthlyLimitUsd.toFixed(2)} limit.
          When the limit is reached, the app quietly goes back to rules and templates until next month.
        </p>
        <label className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
          <input type="checkbox" name="aiScoreOnSearch" defaultChecked={p.aiScoreOnSearch} style={{ width: 20, height: 20, marginTop: 2 }} />
          <span>Score new jobs with AI during each search <span className="muted">(about $0.01–0.03 a day. Off = AI is only used when you click a button.)</span></span>
        </label>
        <label htmlFor="pf-lim">Monthly AI limit (US dollars)</label>
        <input id="pf-lim" name="aiMonthlyLimitUsd" type="number" min={0} max={100} step={0.5} className="inp" style={{ width: 140 }} defaultValue={p.aiMonthlyLimitUsd} />
      </section>

      <section className="stack" style={{ gap: 8 }}>
        <h3>My CV (the only source of facts for letters and emails)</h3>
        <label className="sr" htmlFor="pf-cv">CV text</label>
        <textarea id="pf-cv" name="cv_text" className="inp" rows={16} defaultValue={p.cv} />
      </section>

      <section className="stack" style={{ gap: 8 }}>
        <h3>What the app has learned (one per line; edit or delete freely)</h3>
        <label className="sr" htmlFor="pf-pr">Learned preferences</label>
        <textarea id="pf-pr" name="preferences" className="inp" rows={4} defaultValue={p.preferences} placeholder="For example: skip sales-quota roles" />
      </section>

      <div className="cols" style={{ gap: 14 }}>
        <section className="stack" style={{ gap: 8 }}>
          <h3>Words to skip in job titles (one per line)</h3>
          <label className="sr" htmlFor="pf-av">Words to skip</label>
          <textarea id="pf-av" name="avoid" className="inp" rows={3} defaultValue={p.avoid} placeholder="For example: intern" />
        </section>
        <section className="stack" style={{ gap: 8 }}>
          <h3>Freshness</h3>
          <label htmlFor="pf-fr">Only show jobs posted in the last (days)</label>
          <input id="pf-fr" name="freshnessDays" type="number" min={1} max={60} className="inp" style={{ width: 120 }} defaultValue={p.freshnessDays} />
        </section>
      </div>

      <div className="row"><button className="btn p" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>{msg && <span role="status" className={`b ${msg.ok ? 'g' : 'r'}`}>{msg.message}</span>}</div>
    </form>
  );
}

export function PasswordForm() {
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, start] = useTransition();
  return (
    <form className="card stack" style={{ gap: 10 }} action={(fd) => start(async () => setMsg(await changePassword(fd)))}>
      <h3>Change my password</h3>
      <label htmlFor="pw">New password (at least 10 characters)</label>
      <input id="pw" name="password" type="password" autoComplete="new-password" minLength={10} required className="inp" style={{ maxWidth: 320 }} />
      <div className="row"><button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>{msg && <span role="status" className={`b ${msg.ok ? 'g' : 'r'}`}>{msg.message}</span>}</div>
    </form>
  );
}
