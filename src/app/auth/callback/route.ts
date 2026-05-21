import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      const match = supabaseUrl.match(/https:\/\/([a-z0-9\-]+)\.supabase/);
      const projectId = match ? match[1] : '';
      const cookieName = `sb-${projectId}-auth-token`;
      
      const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      const response = NextResponse.redirect(new URL(next, request.url));
      
      response.cookies.set(cookieName, JSON.stringify(data.session), {
        path: '/',
        expires,
        sameSite: 'lax',
        secure: true
      });
      
      return response;
    } else {
      console.error('OAuth code exchange failed:', error);
    }
  }

  return NextResponse.redirect(new URL('/login', request.url));
}
