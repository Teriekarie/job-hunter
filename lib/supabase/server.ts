import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Signed-in client: everything it reads or writes is checked by the database's owner-only rules.
export async function db() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* called from a page: middleware refreshes instead */ }
      },
    },
  });
}

// No-login client, used only by the daily search (which proves itself with the secret instead).
export const anonDb = () => createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
