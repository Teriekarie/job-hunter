import Nav from '@/components/Nav';
import { PasswordForm, ProfileForm } from '@/components/ProfileForms';
import { requireOwner } from '@/lib/session';
import { ensureProfile } from '@/lib/run-server';
import { aiEnabled } from '@/lib/ai';
import { SOURCES } from '@/lib/sources';

export const dynamic = 'force-dynamic';

export default async function Profile() {
  const { supabase, user } = await requireOwner();
  const p = await ensureProfile(supabase);
  const { data: fb } = await supabase.from('jh_feedback').select('reasons');
  const tally: Record<string, number> = {};
  (fb ?? []).forEach((f) => (f.reasons as string[]).forEach((r) => (tally[r] = (tally[r] || 0) + 1)));
  const sp = p.search_profile;
  return (
    <main className="wrap">
      <Nav current="/profile" />
      <h1 style={{ margin: 0, fontSize: 20 }}>Profile &amp; rules</h1>
      <div className="cols">
        <section className="card">
          <h3>Roles the app searches for</h3>
          {Object.entries(sp.roleFamilies as Record<string, string[]>).map(([fam, words]) => <p key={fam} style={{ margin: '0 0 6px' }}><b>{fam}:</b> <span className="muted">{words.join(', ')}</span></p>)}
        </section>
        <section className="card">
          <h3>Rules</h3>
          <ul>
            <li>Signed in as {user.email}</li>
            <li>Location: {sp.location}. Work rights: {sp.workAuthorization}.</li>
            <li>Shown in this order: {(sp.eligibilityPriority as string[]).join(' → ')}. Jobs that exclude Nigeria are dropped.</li>
            <li>Salary: every job is shown, even with no pay listed.</li>
            <li>Sources: {SOURCES.map((s) => s.name).join(', ')}.</li>
            <li>AI scoring and letters: <b>{aiEnabled() ? 'on' : 'off (using rules and templates)'}</b>.</li>
          </ul>
          <h3 style={{ marginTop: 14 }}>Your "Not a match" reasons so far</h3>
          {Object.keys(tally).length ? <ul>{Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([r, n]) => <li key={r}>{r}: {n}</li>)}</ul> : <p className="muted" style={{ margin: 0 }}>None yet.</p>}
        </section>
      </div>
      <ProfileForm cv={p.cv_text} avoid={(sp.avoid ?? []).join('\n')} preferences={(p.learned_preferences ?? []).join('\n')} freshnessDays={sp.freshnessDays ?? 14} />
      <PasswordForm />
    </main>
  );
}
