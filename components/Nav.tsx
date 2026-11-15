import Link from 'next/link';
import { signOut } from '@/app/actions';

const LINKS = [['/', 'Jobs'], ['/tracker', 'Tracker'], ['/history', 'Search history'], ['/profile', 'Profile & rules']] as const;

export default function Nav({ current }: { current: string }) {
  return (
    <header className="topbar">
      <div className="topbar-in">
        <Link href="/" className="brand" aria-label="Job Hunter home"><span className="mark" aria-hidden="true">JH</span>Job Hunter</Link>
        <nav className="nav" aria-label="Main">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className={current === href ? 'on' : ''} aria-current={current === href ? 'page' : undefined}>{label}</Link>
          ))}
        </nav>
        <form action={signOut}><button className="btn ghost" style={{ minHeight: 40 }}>Sign out</button></form>
      </div>
    </header>
  );
}
