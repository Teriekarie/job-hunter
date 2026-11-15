'use client';

import { useState, useTransition } from 'react';
import { changePassword, saveProfile } from '@/app/actions';

export function ProfileForm({ cv, avoid, preferences, freshnessDays }: { cv: string; avoid: string; preferences: string; freshnessDays: number }) {
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, start] = useTransition();
  return (
    <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }} action={(fd) => start(async () => setMsg(await saveProfile(fd)))}>
      <h3>My CV (the only source of facts for letters and emails)</h3>
      <label className="sr" htmlFor="pf-cv">CV text</label>
      <textarea id="pf-cv" name="cv_text" className="inp" rows={18} defaultValue={cv} />
      <h3 style={{ marginTop: 6 }}>What the app has learned (one per line; edit or delete freely)</h3>
      <label className="sr" htmlFor="pf-pr">Learned preferences</label>
      <textarea id="pf-pr" name="preferences" className="inp" rows={4} defaultValue={preferences} placeholder={'For example: skip sales-quota roles'} />
      <h3 style={{ marginTop: 6 }}>Words to skip in job titles (one per line)</h3>
      <label className="sr" htmlFor="pf-av">Words to skip</label>
      <textarea id="pf-av" name="avoid" className="inp" rows={3} defaultValue={avoid} placeholder={'For example: intern'} />
      <label htmlFor="pf-fr">Only show jobs posted in the last (days)</label>
      <input id="pf-fr" name="freshnessDays" type="number" min={1} max={60} className="inp" style={{ width: 120 }} defaultValue={freshnessDays} />
      <div className="row"><button className="btn p" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>{msg && <span role="status" className={`b ${msg.ok ? 'g' : 'r'}`}>{msg.message}</span>}</div>
    </form>
  );
}

export function PasswordForm() {
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, start] = useTransition();
  return (
    <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }} action={(fd) => start(async () => setMsg(await changePassword(fd)))}>
      <h3>Change my password</h3>
      <label htmlFor="pw">New password (at least 10 characters)</label>
      <input id="pw" name="password" type="password" autoComplete="new-password" minLength={10} required className="inp" style={{ maxWidth: 320 }} />
      <div className="row"><button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>{msg && <span role="status" className={`b ${msg.ok ? 'g' : 'r'}`}>{msg.message}</span>}</div>
    </form>
  );
}
