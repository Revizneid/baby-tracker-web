import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env.local file.');
}

const getCookieName = () => {
  if (!supabaseUrl) return '';
  const projectId = new URL(supabaseUrl).hostname.split('.')[0];
  return `sb-${projectId}-auth-token`;
};

const customStorage = {
  getItem: (key: string) => {
    if (typeof document === 'undefined') return null;
    
    // For PKCE flow, use localStorage
    if (key.includes('code-verifier') || key.includes('pkce') || key === 'sb-auth-token-code-verifier') {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    
    // For session token, use cookie
    const cookieName = getCookieName();
    if (key === 'sb-auth-token' && cookieName) {
      const name = `${cookieName}=`;
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
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return;
    
    // For PKCE flow, use localStorage
    if (key.includes('code-verifier') || key.includes('pkce') || key === 'sb-auth-token-code-verifier') {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Fail silently if localStorage unavailable
      }
      return;
    }
    
    // For session token, use cookie
    const cookieName = getCookieName();
    if (key === 'sb-auth-token' && cookieName) {
      const encodedValue = encodeURIComponent(value);
      const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${cookieName}=${encodedValue};expires=${expires};path=/;SameSite=None;Secure`;
    }
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') return;
    
    // For PKCE flow, use localStorage
    if (key.includes('code-verifier') || key.includes('pkce') || key === 'sb-auth-token-code-verifier') {
      try {
        localStorage.removeItem(key);
      } catch {
        // Fail silently if localStorage unavailable
      }
      return;
    }
    
    // For session token, use cookie
    const cookieName = getCookieName();
    if (key === 'sb-auth-token' && cookieName) {
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
  }
};

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    flowType: 'pkce',
    persistSession: true,
  }
});
