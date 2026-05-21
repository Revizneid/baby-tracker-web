import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const cookieStore = await cookies();
  
  // Extract project id from Supabase URL to match client-side cookie name
  const projectId = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : '';
  const cookieName = `sb-${projectId}-auth-token`;
  
  const tokenCookie = cookieStore.get(cookieName);
  
  const serverClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  if (tokenCookie?.value) {
    try {
      const decodedValue = decodeURIComponent(tokenCookie.value);
      const tokenData = JSON.parse(decodedValue);
      if (tokenData.access_token) {
        await serverClient.auth.setSession({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || '',
        });
      }
    } catch (e) {
      console.error('Error setting session on server client:', e);
    }
  }

  return serverClient;
}
