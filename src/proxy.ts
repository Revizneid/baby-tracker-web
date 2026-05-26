import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient as createServerSupabaseClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths (including static files, invite links, login, and auth callbacks)
  const isPublicPath = 
    pathname === '/login' || 
    pathname.startsWith('/auth/callback') || 
    pathname.startsWith('/invite/') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico');

  // Retrieve Supabase config
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-to-prevent-build-crashes';

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
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
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
        // SSR client will apply cookie updates automatically
      } else {
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
