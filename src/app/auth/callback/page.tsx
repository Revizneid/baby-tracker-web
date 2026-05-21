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
    const nextPath = params.get('next') || '/';

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
          throw error;
        }

        if (data?.session) {
          router.replace(nextPath.startsWith('/') ? nextPath : '/');
          return;
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }

        if (sessionData?.session) {
          router.replace(nextPath.startsWith('/') ? nextPath : '/');
          return;
        }

        throw new Error('Không thể xác thực phiên đăng nhập.');
      } catch (err: any) {
        setError(err.message || 'Đăng nhập Google thất bại.');
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
