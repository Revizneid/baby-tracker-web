'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

export default function OAuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [debugNext, setDebugNext] = useState<string>('/');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const storedNext = window.localStorage.getItem('supabase_oauth_next');
    const nextPath = storedNext || params.get('next') || '/';
    setDebugCode(code);
    setDebugNext(nextPath);

    if (!code) {
      setError('Không tìm thấy mã xác thực Google.');
      setLoading(false);
      return;
    }

    const completeOAuth = async () => {
      setError(null);
      setLoading(true);

      // Debug: print available cookies and check for PKCE keys
      try {
        console.debug('[Callback] document.cookie', document.cookie);
        const cookies = document.cookie.split(';').map(c => c.trim());
        const keys = cookies.map(c => c.split('=')[0]);
        console.debug('[Callback] cookie keys', keys);
        const commonPkceKeys = ['pkce_code_verifier', 'pkce.code_verifier', 'supabase_pkce_code_verifier', 'sb-pkce-code-verifier'];
        commonPkceKeys.forEach(k => {
          if (document.cookie.includes(k + '=')) console.debug('[Callback] found pkce key', k);
        });
      } catch (e) {
        console.debug('[Callback] cookie debug error', e);
      }

      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          throw new Error(JSON.stringify(error));
        }

        if (!data?.session) {
          throw new Error('Không thể xác thực phiên đăng nhập.');
        }

        window.localStorage.removeItem('supabase_oauth_next');
        window.location.replace(nextPath.startsWith('/') ? nextPath : '/');
      } catch (err: any) {
        console.error('[Callback] OAuth error:', err);
        setError(err?.message ? String(err.message) : String(err));
      } finally {
        setLoading(false);
      }
    };

    completeOAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F5] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-[#1D9E75]">Đang xử lý đăng nhập...</h1>
          <p className="text-sm text-gray-500">Bạn sẽ được chuyển tiếp ngay khi hoàn tất xác thực.</p>
          {loading && <Loader2 className="w-10 h-10 mx-auto animate-spin text-[#1D9E75]" />}
          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-red-50 text-red-700 border border-red-100 text-sm flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <span>{error}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-500">
                <div><strong>Debug:</strong></div>
                <div>code: <span className="font-mono">{debugCode ?? 'null'}</span></div>
                <div>next: <span className="font-mono">{debugNext}</span></div>
              </div>
            </div>
          )}
          {!loading && !error && (
            <div className="mt-4 p-4 rounded-2xl bg-green-50 text-green-700 border border-green-100 text-sm">
              Đã nhận được mã, đang chuyển hướng... Nếu trang đứng yên, thử làm mới hoặc kiểm tra console.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
