import { createHash } from 'node:crypto';
import { redirect } from 'next/navigation';
import { db } from './supabase/server';

let cronRegistered: string | null = null;

// Every page calls this first: signed in AND the owner, or out you go.
export async function requireOwner() {
  const supabase = await db();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: ok } = await supabase.rpc('jh_is_owner');
  if (!ok) { await supabase.auth.signOut(); redirect('/login?denied=1'); }

  // Connect the daily search: store the fingerprint (never the secret itself) of CRON_SECRET
  // so the database accepts the 6am run. Runs once per server start, or after the secret changes.
  const secret = process.env.CRON_SECRET;
  if (secret && secret.length >= 24) {
    const hash = createHash('sha256').update(secret).digest('hex');
    if (cronRegistered !== hash) {
      const { error } = await supabase.rpc('jh_set_cron_hash', { p_hash: hash });
      if (!error) cronRegistered = hash;
    }
  }
  return { supabase, user };
}
