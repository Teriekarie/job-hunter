import { signIn } from '@/app/actions';

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; denied?: string }> }) {
  const q = await searchParams;
  return (
    <main className="wrap" style={{ maxWidth: 420, paddingTop: 80 }}>
      <div className="row" style={{ gap: 12 }}><span className="mark" aria-hidden="true" style={{ width: 40, height: 40, fontSize: 16, borderRadius: 12 }}>JH</span><h1>Job Hunter</h1></div>
      <p className="muted" style={{ margin: 0 }}>Private. Sign in to see your jobs and applications.</p>
      {q.error && <p className="notice bad" role="alert">That email or password is not right. Please try again.</p>}
      {q.denied && <p className="notice bad" role="alert">This account is not allowed to use this app.</p>}
      <form action={signIn} className="card stack" style={{ gap: 10 }}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="inp" />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="inp" />
        <button className="btn p" style={{ marginTop: 6 }}>Sign in</button>
      </form>
    </main>
  );
}
