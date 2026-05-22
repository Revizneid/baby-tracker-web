import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient as createServerSupabaseClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths
  const isPublicPath = pathname === '/login' || pathname.startsWith('/auth/callback') || pathname.startsWith('/invite/');

  // Retrieve Supabase config
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Extract project id from Supabase URL to match cookie name
  const projectId = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : '';
  const cookieName = `sb-${projectId}-auth-token`;

  const response = NextResponse.next();
  const cookieStore = request.cookies;

  const supabaseClient = createServerSupabaseClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: async () => {
        return cookieStore.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value || '',
        }));
      },
      setAll: async (cookiesToSet) => {
        cookiesToSet.forEach((cookie) => {
          response.cookies.set(cookie.name, cookie.value || '', cookie.options as any);
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

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  // If path is protected and no valid session
  if (!isPublicPath && (!session || !session.access_token)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
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
      const { data, error } = await supabaseClient.auth.refreshSession({
        refresh_token: session.refresh_token,
      });

      if (!error && data.session) {
        // If refreshSession triggers server-side cookie updates, the SSR client will apply them.
      } else {
        response.cookies.delete(cookieName);
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
