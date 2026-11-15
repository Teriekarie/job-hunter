import Link from 'next/link';
import { notFound } from 'next/navigation';
import EmailPanel from '@/components/EmailPanel';
import { requireOwner } from '@/lib/session';
import { getEmail } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function EmailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ followup?: string }> }) {
  const { id } = await params;
  const followUp = !!(await searchParams).followup;
  const { supabase } = await requireOwner();
  const { data: j } = await supabase.from('jh_jobs').select('id, title, company, status, apply_url, apply_method, apply_email, required_subject').eq('id', id).maybeSingle();
  if (!j) notFound();
  const email = await getEmail(id, { followUp });
  return (
    <main className="wrap" style={{ maxWidth: 860 }}>
      <Link href={`/jobs/${id}`} style={{ padding: '10px 0', fontWeight: 600, textDecoration: 'none' }}>← Back to the job</Link>
      <header>
        <h1 style={{ margin: 0, fontSize: 22 }}>{followUp ? 'Follow-up email' : 'Email application'}</h1>
        <span className="muted">{j.title} · {j.company}</span>
      </header>
      <EmailPanel job={j} to={j.apply_email ?? ''} initial={email} followUp={followUp} requiredSubject={!!j.required_subject} />
    </main>
  );
}
