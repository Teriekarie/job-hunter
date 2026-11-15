import { redirect } from 'next/navigation';
import { db } from './supabase/server';

// Every page calls this first: signed in AND the owner, or out you go.
export async function requireOwner() {
  const supabase = await db();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: ok } = await supabase.rpc('jh_is_owner');
  if (!ok) { await supabase.auth.signOut(); redirect('/login?denied=1'); }
  return { supabase, user };
}
