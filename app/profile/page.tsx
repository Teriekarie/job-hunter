import Nav from '@/components/Nav';
import { PasswordForm, ProfileForm } from '@/components/ProfileForms';
import { requireOwner } from '@/lib/session';
import { ensureProfile } from '@/lib/run-server';
import { aiEnabled, aiLimit } from '@/lib/ai';
import { SOURCES } from '@/lib/sources';

export const dynamic = 'force-dynamic';

export default async function Profile() {
  const { supabase, user } = await requireOwner();
  const p = await ensureProfile(supabase);
  const [{ data: fb }, { data: spent }] = await Promise.all([
    supabase.from('jh_feedback').select('reasons'),
    supabase.rpc('jh_ai_spent_month'),
  ]);
  const tally: Record<string, number> = {};
  (fb ?? []).forEach((f) => (f.reasons as string[]).forEach((r) => (tally[r] = (tally[r] || 0) + 1)));
  const sp = p.search_profile;
  return (
    <>
      <Nav current="/profile" />
      <main className="wrap">
        <header className="pagehead">
          <h1>Profile &amp; rules</h1>
          <p className="muted">What the app searches for, how it decides, and what it is allowed to spend.</p>
        </header>
        <div className="cols">
          <section className="card">
            <h3>Roles the app searches for</h3>
            {Object.entries(sp.roleFamilies as Record<string, string[]>).map(([fam, words]) => <p key={fam} style={{ margin: '0 0 8px' }}><b>{fam}:</b> <span className="muted">{words.join(', ')}</span></p>)}
          </section>
          <section className="card">
            <h3>Rules</h3>
            <ul>
              <li>Signed in as {user.email}</li>
              <li>Location: {sp.location}. Work rights: {sp.workAuthorization}.</li>
              <li>Shown in this order: {(sp.eligibilityPriority as string[]).join(' → ')}. Jobs that exclude Nigeria are dropped.</li>
              <li>Salary: every job is shown, even with no pay listed.</li>
              <li>Sources ({SOURCES.length}): {SOURCES.map((s) => s.name).join(', ')}.</li>
            </ul>
            <h3 style={{ marginTop: 14 }}>Your "Not a match" reasons so far</h3>
            {Object.keys(tally).length ? <ul>{Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([r, n]) => <li key={r}>{r}: {n}</li>)}</ul> : <p className="muted" style={{ margin: 0 }}>None yet.</p>}
          </section>
        </div>
        <ProfileForm cv={p.cv_text} avoid={(sp.avoid ?? []).join('\n')} preferences={(p.learned_preferences ?? []).join('\n')} freshnessDays={sp.freshnessDays ?? 14}
          aiKey={aiEnabled()} aiScoreOnSearch={sp.aiScoreOnSearch === true} aiMonthlyLimitUsd={aiLimit(sp)} aiSpent={Number(spent ?? 0)} />
        {!aiEnabled() && (
          <section className="card">
            <h3>How to add the AI key</h3>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>Go to console.anthropic.com, sign in, open <b>Billing</b>, add a few dollars of credit and set a <b>monthly spend limit</b> (for example $5).</li>
              <li>Open <b>API Keys</b> → <b>Create Key</b>, name it "job-hunter", and copy it. Do not paste it into any chat.</li>
              <li>Go to vercel.com → project <b>job-hunter</b> → <b>Settings</b> → <b>Environment Variables</b>.</li>
              <li>Add <b>ANTHROPIC_API_KEY</b> with the key as the value, tick <b>Sensitive</b>, and save.</li>
              <li>Open <b>Deployments</b>, click the three dots on the top one and choose <b>Redeploy</b>. After about a minute, AI is on.</li>
            </ol>
          </section>
        )}
        <PasswordForm />
      </main>
    </>
  );
}
