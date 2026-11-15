'use client';

import { useState, useTransition } from 'react';
import { saveNotes, setStatus } from '@/app/actions';
import { STAGES } from '@/lib/types';

export function StageSelect({ jobId, status }: { jobId: string; status: string }) {
  const [busy, start] = useTransition();
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }} className="small muted">Stage
      <select className="inp" value={status} disabled={busy} onChange={(e) => start(() => setStatus(jobId, e.target.value))}>
        {STAGES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
      </select>
    </label>
  );
}

export function Notes({ jobId, initial }: { jobId: string; initial: string }) {
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [busy, start] = useTransition();
  return (
    <>
      <label className="sr" htmlFor="notes">My notes</label>
      <textarea id="notes" className="inp" rows={4} placeholder="Anything you want to remember about this job" value={text} onChange={(e) => { setText(e.target.value); setSaved(false); }} />
      <div className="row" style={{ marginTop: 8 }}>
        <button className="btn" disabled={busy} onClick={() => start(async () => { await saveNotes(jobId, text); setSaved(true); })}>{busy ? 'Saving…' : 'Save notes'}</button>
        {saved && <span className="muted small" role="status">Saved</span>}
      </div>
    </>
  );
}
