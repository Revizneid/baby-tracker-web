import { createServerClient as createServerSupabaseClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const cookieStore = await cookies();

  return createServerSupabaseClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: async () => {
        return cookieStore.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value || '',
        }));
      },
      setAll: async (cookiesToSet) => {
        cookiesToSet.forEach((cookie) => {
          cookieStore.set(cookie.name, cookie.value || '', cookie.options as any);
        });
      },
    },
    cookieOptions: {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    },
  });
}
