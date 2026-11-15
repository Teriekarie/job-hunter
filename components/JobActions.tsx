'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { getLetter, notAMatch, saveLetter, setStatus } from '@/app/actions';

export type CardJob = {
  id: string; title: string; company: string; status: string; apply_url: string; apply_method: string; apply_email: string | null;
};

const REASONS = ['Not my skill set', 'Too senior', 'Too junior', 'Salary too low', 'Location restriction', 'No relocation support',
  'Company not credible', 'Not interested in this industry', 'Already applied', 'Job looks stale', 'Other'];

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
          <button className="btn" onClick={onClose} style={{ minHeight: 36 }}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn" onClick={async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}>
      {done ? 'Copied' : label}
    </button>
  );
}

export function LetterModal({ job, onClose }: { job: CardJob; onClose: () => void }) {
  const [text, setText] = useState<string | null>(null);
  const [by, setBy] = useState('');
  const [busy, start] = useTransition();
  useEffect(() => { getLetter(job.id).then((r) => { setText(r.text); setBy(r.by); }); }, [job.id]);
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text ?? ''], { type: 'text/plain' }));
    a.download = `Cover letter - ${job.company} - ${job.title}.txt`.replace(/[\\/:*?"<>|]/g, ' ');
    a.click();
  };
  return (
    <Modal title={`Cover letter: ${job.title}`} onClose={onClose}>
      {text == null ? <p className="muted">Writing your letter…</p> : (
        <>
          {by === 'template' && <p className="notice warn" style={{ margin: 0 }}>This is a starter letter built from your CV. Fill in the part in [square brackets] and adjust it for this job. With an AI key added, the app writes a tailored letter for each job.</p>}
          <label className="sr" htmlFor="letter">Cover letter</label>
          <textarea id="letter" className="inp" rows={18} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="row">
            <button className="btn p" disabled={busy} onClick={() => start(async () => { await saveLetter(job.id, text); })}>{busy ? 'Saving…' : 'Save changes'}</button>
            <CopyButton text={text} />
            <button className="btn" onClick={download}>Download</button>
            <span className="grow" />
            <button className="btn" disabled={busy} onClick={() => start(async () => { const r = await getLetter(job.id, true); setText(r.text); setBy(r.by); })}>Write it again</button>
          </div>
        </>
      )}
    </Modal>
  );
}

function NotMatchModal({ job, onClose }: { job: CardJob; onClose: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [busy, start] = useTransition();
  return (
    <Modal title="Why is this not a match?" onClose={onClose}>
      <p className="muted" style={{ margin: 0 }}>{job.title} · {job.company}. Your answer helps the app learn what to skip.</p>
      <div className="row">
        {REASONS.map((r) => (
          <button key={r} type="button" aria-pressed={picked.includes(r)} className={`chipbtn ${picked.includes(r) ? 'on' : ''}`}
            onClick={() => setPicked((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]))}>{r}</button>
        ))}
      </div>
      <label htmlFor="nm-note">Note (optional)</label>
      <textarea id="nm-note" className="inp" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="btn danger" disabled={busy} onClick={() => start(async () => { await notAMatch(job.id, picked, note); onClose(); })}>{busy ? 'Saving…' : 'Mark as not a match'}</button>
      </div>
    </Modal>
  );
}

export default function JobActions({ job, showDetailsLink = true }: { job: CardJob; showDetailsLink?: boolean }) {
  const [asked, setAsked] = useState(false);
  const [modal, setModal] = useState<'letter' | 'nm' | null>(null);
  const [busy, start] = useTransition();
  const applied = !['new', 'shortlisted', 'not_a_match'].includes(job.status);
  const byEmail = job.apply_method === 'email';

  return (
    <>
      <div className="actions">
        {byEmail
          ? <Link className="btn p" href={`/jobs/${job.id}/email`}>Prepare email application</Link>
          : <a className="btn p" href={job.apply_url} target="_blank" rel="noopener noreferrer" onClick={() => setAsked(true)}>Apply on site ↗</a>}
        {showDetailsLink && <Link className="btn" href={`/jobs/${job.id}`}>View full details</Link>}
        <button className="btn" onClick={() => setModal('letter')}>Cover letter</button>
        {job.status === 'new' && <button className="btn" disabled={busy} onClick={() => start(() => setStatus(job.id, 'shortlisted'))}>Shortlist</button>}
        <span className="grow" />
        {job.status !== 'not_a_match' && !applied && <button className="btn danger" onClick={() => setModal('nm')}>Not a match</button>}
        {job.status === 'not_a_match' && <button className="btn" disabled={busy} onClick={() => start(() => setStatus(job.id, 'new'))}>Move back to New</button>}
      </div>
      {asked && !applied && (
        <div className="notice info row" role="status" style={{ margin: 0 }}>
          <span className="grow">Did you apply for this job?</span>
          <button className="btn p" disabled={busy} onClick={() => start(async () => { await setStatus(job.id, 'applied', 'website'); setAsked(false); })}>Yes, mark as Applied</button>
          <button className="btn" onClick={() => setAsked(false)}>Not yet</button>
        </div>
      )}
      {modal === 'letter' && <LetterModal job={job} onClose={() => setModal(null)} />}
      {modal === 'nm' && <NotMatchModal job={job} onClose={() => setModal(null)} />}
    </>
  );
}
