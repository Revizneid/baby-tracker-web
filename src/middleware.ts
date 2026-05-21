import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths
  const isPublicPath = pathname === '/login' || pathname.startsWith('/auth/callback') || pathname.startsWith('/invite/');

  // Retrieve Supabase config
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Extract project id from Supabase URL to match cookie name
  const match = supabaseUrl.match(/https:\/\/([a-z0-9\-]+)\.supabase/);
  const projectId = match ? match[1] : '';
  const cookieName = `sb-${projectId}-auth-token`;

  const tokenCookie = request.cookies.get(cookieName);
  let session = null;

  if (tokenCookie?.value) {
    try {
      const rawValue = decodeURIComponent(tokenCookie.value);
      session = JSON.parse(rawValue);
    } catch (e) {
      console.error('Middleware cookie parse error:', e);
    }
  }

  // Create response
  let response = NextResponse.next();

  // If path is protected and no valid session
  if (!isPublicPath && (!session || !session.access_token)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Optionally redirect back after login
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // If path is login and user is already logged in, redirect to home
  if (pathname === '/login' && session?.access_token) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Auto-refresh token if it's expired
  if (session && session.expires_at) {
    const isExpired = session.expires_at * 1000 < Date.now();
    if (isExpired && session.refresh_token) {
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false }
      });
      
      const { data, error } = await tempClient.auth.refreshSession({
        refresh_token: session.refresh_token
      });

      if (!error && data.session) {
        // Update the cookie in the response
        const newSessionValue = JSON.stringify(data.session);
        const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        
        response.cookies.set(cookieName, newSessionValue, {
          path: '/',
          expires,
          sameSite: 'none',
          secure: true
        });
      } else {
        // If refresh failed, clear session and redirect to login
        response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete(cookieName);
        return response;
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
