import Link from 'next/link';
import { signOut } from '@/app/actions';

const LINKS = [['/', 'Jobs'], ['/tracker', 'Tracker'], ['/history', 'Search history'], ['/profile', 'Profile & rules']] as const;

export default function Nav({ current }: { current: string }) {
  return (
    <nav className="row" style={{ justifyContent: 'space-between' }} aria-label="Main">
      <div className="row" style={{ gap: 20 }}>
        <span className="display" style={{ fontWeight: 700, fontSize: 20 }}>Job Hunter</span>
        <div className="row nav" style={{ gap: 4 }}>
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className={current === href ? 'on' : ''} aria-current={current === href ? 'page' : undefined}>{label}</Link>
          ))}
        </div>
      </div>
      <form action={signOut}><button className="btn" style={{ minHeight: 36 }}>Sign out</button></form>
    </nav>
  );
}
