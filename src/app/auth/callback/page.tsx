'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const storedNext = window.localStorage.getItem('supabase_oauth_next');
    const nextPath = storedNext || params.get('next') || '/';

    if (!code) {
      setError('Không tìm thấy mã xác thực Google.');
      setLoading(false);
      return;
    }

    const completeOAuth = async () => {
      setError(null);
      setLoading(true);

      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          throw new Error(JSON.stringify(error));
        }

        const session = data?.session ?? (await supabase.auth.getSession()).data?.session;
        if (!session) {
          throw new Error(`Không thể xác thực phiên đăng nhập. exchange data=${JSON.stringify(data)}`);
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        if (!supabaseUrl) {
          throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.');
        }

        const match = supabaseUrl.match(/https:\/\/([a-z0-9\-]+)\.supabase/);
        const projectId = match ? match[1] : '';
        if (!projectId) {
          throw new Error(`Unable to extract Supabase project ID from ${supabaseUrl}`);
        }

        const cookieName = `sb-${projectId}-auth-token`;
        const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(session))};expires=${expires};path=/;SameSite=None;Secure`;

        window.localStorage.removeItem('supabase_oauth_next');
        router.replace(nextPath.startsWith('/') ? nextPath : '/');
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err?.message ? String(err.message) : String(err));
      } finally {
        setLoading(false);
      }
    };

    completeOAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F5] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-[#1D9E75]">Đang xử lý đăng nhập...</h1>
          <p className="text-sm text-gray-500">Bạn sẽ được chuyển tiếp ngay khi hoàn tất xác thực.</p>
          {loading && <Loader2 className="w-10 h-10 mx-auto animate-spin text-[#1D9E75]" />}
          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-red-50 text-red-700 border border-red-100 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
