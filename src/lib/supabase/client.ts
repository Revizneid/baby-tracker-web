import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-to-prevent-build-crashes';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookieOptions: {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },
});
