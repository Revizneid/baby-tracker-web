import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env.local file.');
}

const projectId = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : '';
const cookieName = `sb-${projectId}-auth-token`;

export const supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookieOptions: {
    name: cookieName,
    path: '/',
    sameSite: 'none',
    secure: true,
  },
});
