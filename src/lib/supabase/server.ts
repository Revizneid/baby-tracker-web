import { createServerClient as createServerSupabaseClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const cookieStore = await cookies();
  const projectId = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : '';
  const cookieName = `sb-${projectId}-auth-token`;

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
      name: cookieName,
      path: '/',
      sameSite: 'none',
      secure: true,
    },
  });
}
