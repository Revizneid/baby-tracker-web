import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env.local file.');
}

const cookieStorage = {
  getItem: (key: string) => {
    if (typeof document === 'undefined') return null;
    const name = `${key}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name)) {
        const value = cookie.substring(name.length);
        try {
          return decodeURIComponent(value);
        } catch {
          return value;
        }
      }
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return;
    const encodedValue = encodeURIComponent(value);
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${key}=${encodedValue};expires=${expires};path=/;SameSite=Lax;Secure`;
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax;Secure`;
  }
};

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: cookieStorage,
    flowType: 'pkce',
    persistSession: true,
    detectSessionInUrl: false,
  }
});
