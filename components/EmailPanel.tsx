'use client';

import { useState, useTransition } from 'react';
import { getEmail, saveEmail, setStatus } from '@/app/actions';
import { CopyButton, LetterModal, type CardJob } from './JobActions';

export default function EmailPanel({ job, to, initial, followUp, requiredSubject }: { job: CardJob; to: string; initial: { subject: string; body: string }; followUp: boolean; requiredSubject: boolean }) {
  const [toAddr, setTo] = useState(to);
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);
  const [letter, setLetter] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, start] = useTransition();
  const enc = encodeURIComponent;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(toAddr)}&su=${enc(subject)}&body=${enc(body)}`;
  const mailto = `mailto:${enc(toAddr)}?subject=${enc(subject)}&body=${enc(body)}`;
  const save = () => { if (!followUp) void saveEmail(job.id, subject, body); };
  const hasBlanks = /\[[^\]]+\]/.test(body);

  return (
    <>
      {requiredSubject && !followUp && <p className="notice warn" style={{ margin: 0 }}>This posting asks for a specific subject line. It has been copied exactly.</p>}
      <p className="notice info" style={{ margin: 0 }}>The app never sends anything. You review, edit and send from your own email.</p>
      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="row"><label htmlFor="em-to" className="muted" style={{ flex: '0 0 64px', fontWeight: 500 }}>To</label>
          <input id="em-to" className="inp grow" style={{ minWidth: 200 }} value={toAddr} onChange={(e) => setTo(e.target.value)} placeholder="Add the email address" /><CopyButton text={toAddr} /></div>
        <div className="row"><label htmlFor="em-su" className="muted" style={{ flex: '0 0 64px', fontWeight: 500 }}>Subject</label>
          <input id="em-su" className="inp grow" style={{ minWidth: 200 }} value={subject} onChange={(e) => setSubject(e.target.value)} onBlur={save} /><CopyButton text={subject} /></div>
        <div className="row" style={{ justifyContent: 'space-between' }}><label htmlFor="em-bo" className="muted" style={{ fontWeight: 500 }}>Message</label><CopyButton text={body} /></div>
        <textarea id="em-bo" className="inp" rows={18} value={body} onChange={(e) => setBody(e.target.value)} onBlur={save} />
        <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px' }}>
          <b>Before you send</b>
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, listStyle: 'disc' }}>
            {hasBlanks && <li>Fill in the parts in [square brackets].</li>}
            {!toAddr && <li>Add the email address to send to.</li>}
            {!followUp && <li>Attach your CV and your cover letter.</li>}
            <li>Read it once more. Only what is in your CV should be claimed.</li>
          </ul>
        </div>
        <div className="row">
          {!followUp && <button className="btn" onClick={() => setLetter(true)}>Open cover letter</button>}
          <button className="btn" disabled={busy} onClick={() => start(async () => { const r = await getEmail(job.id, { rewrite: true, followUp }); setSubject(r.subject); setBody(r.body); })}>{busy ? 'Writing…' : 'Write it again'}</button>
        </div>
      </section>
      <div className="row">
        <a className="btn p" style={{ minHeight: 48 }} href={gmail} target="_blank" rel="noopener noreferrer">Open in Gmail ↗</a>
        <a className="btn" style={{ minHeight: 48 }} href={mailto}>Open in my mail app</a>
        <span className="grow" />
        {!followUp && (done
          ? <span className="b g" role="status">Marked as Applied</span>
          : <button className="btn ok" style={{ minHeight: 48 }} disabled={busy} onClick={() => start(async () => { await setStatus(job.id, 'applied', 'email'); setDone(true); })}>I've sent it: mark as Applied</button>)}
      </div>
      <p className="muted small" style={{ margin: 0 }}>"Open in Gmail" opens a new draft with To, Subject and Message already filled in.</p>
      {letter && <LetterModal job={job} onClose={() => setLetter(false)} />}
    </>
  );
}
