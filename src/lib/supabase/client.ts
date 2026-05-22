import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env.local file.');
}

// Hybrid storage: PKCE verifier in cookies, session in cookies
const hybridStorage = {
  getItem: (key: string) => {
    if (typeof document === 'undefined') return null;
    const name = `${key}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name)) {
        const value = cookie.substring(name.length);
        try {
          const decoded = decodeURIComponent(value);
          console.debug('[hybridStorage] getItem', { key, found: true });
          return decoded;
        } catch {
          console.debug('[hybridStorage] getItem (no-decode)', { key, found: true });
          return value;
        }
      }
    }
    console.debug('[hybridStorage] getItem', { key, found: false, availableCookies: document.cookie });
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return;
    const encodedValue = encodeURIComponent(value);
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();

    // Store in cookie with SameSite=None for cross-site OAuth redirect
    const cookieStr = `${key}=${encodedValue};expires=${expires};path=/;SameSite=None;Secure`;
    document.cookie = cookieStr;

    // Also write a few reasonable fallback cookie names that some runtimes/libraries may look for
    const fallbackKeys = [
      'pkce_code_verifier',
      'pkce.code_verifier',
      'supabase_pkce_code_verifier',
      'sb-pkce-code-verifier'
    ];

    fallbackKeys.forEach((fk) => {
      try {
        document.cookie = `${fk}=${encodedValue};expires=${expires};path=/;SameSite=None;Secure`;
      } catch (e) {
        // ignore
      }
    });

    console.debug('[hybridStorage] setItem', { key, cookieWritten: true, fallbacks: fallbackKeys });
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=None;Secure`;
    // also remove common fallbacks
    ['pkce_code_verifier', 'pkce.code_verifier', 'supabase_pkce_code_verifier', 'sb-pkce-code-verifier'].forEach((fk) => {
      document.cookie = `${fk}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=None;Secure`;
    });
    console.debug('[hybridStorage] removeItem', { key });
  }
};

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: hybridStorage,
    flowType: 'pkce',
    persistSession: true,
  }
});
