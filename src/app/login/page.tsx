'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, Mail, Lock, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showGuide, setShowGuide] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;

    const completeOAuth = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          throw error;
        }
        if (data?.session) {
          router.replace('/');
        } else {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (sessionData?.session) {
            router.replace('/');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Đăng nhập Google thất bại.');
      } finally {
        setLoading(false);
      }
    };

    completeOAuth();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Vui lòng kiểm tra email để xác nhận đăng ký!');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const currentParams = new URLSearchParams(window.location.search);
      const nextPath = currentParams.get('next');
      if (nextPath) {
        window.localStorage.setItem('supabase_oauth_next', nextPath);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Đăng nhập Google thất bại');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F7F5] to-[#E3E8E3] p-4 font-sans text-gray-800">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-white/20 backdrop-blur-sm relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1D9E75]/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
        
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-[#1D9E75] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 transition-transform hover:rotate-0 duration-300">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-[#1D9E75] tracking-tight">
            BabyTracker
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Dõi theo hành trình khôn lớn của bé yêu 👶💚
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D9E75] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#1D9E75]" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.67 0 3.2.58 4.38 1.71l3.27-3.27C17.67 1.54 15.03 1 12 1 7.37 1 3.4 3.63 1.45 7.45l3.86 3C6.27 7.42 8.87 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.45 12.3c0-.82-.07-1.6-.2-2.3H12v4.4h6.43c-.28 1.44-1.1 2.66-2.33 3.48l3.6 2.8c2.1-1.94 3.75-4.8 3.75-8.38z"
              />
              <path
                fill="#FBBC05"
                d="M5.31 10.45c-.24-.72-.37-1.5-.37-2.3s.13-1.58.37-2.3L1.45 2.85C.52 4.7.02 6.8.02 9s.5 4.3 1.43 6.15l3.86-3.7z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.6-2.8c-1.1.74-2.52 1.18-4.36 1.18-3.13 0-5.73-2.38-6.69-5.41l-3.86 3C3.4 20.37 7.37 23 12 23z"
              />
            </svg>
          )}
          <span>Tiếp tục với Google</span>
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-wider font-bold">hoặc</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Email Form */}
        <form className="space-y-4" onSubmit={handleAuth}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition-all text-sm"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mật khẩu</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition-all text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#1D9E75] hover:bg-[#157a5a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D9E75] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[#1D9E75]/10"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'login' ? (
              'Đăng nhập'
            ) : (
              'Đăng ký'
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-xs font-bold text-[#1D9E75] hover:text-[#157a5a] transition-colors cursor-pointer"
          >
            {mode === 'login'
              ? 'Chưa có tài khoản? Đăng ký ngay'
              : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>

        {/* Supabase Google OAuth Config Guide (collapsible) */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-gray-600 font-bold transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#1D9E75]" />
              Hướng dẫn cấu hình Google OAuth
            </span>
            {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showGuide && (
            <div className="mt-3 bg-gray-50 p-3 rounded-xl text-[11px] text-gray-500 space-y-2 border border-gray-200/50 leading-relaxed max-h-48 overflow-y-auto">
              <p className="font-bold text-gray-700">Để đăng nhập Google hoạt động:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Vào <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-[#1D9E75] underline font-bold">Google Cloud Console</a>, tạo project.</li>
                <li>Tạo Credentials dạng <strong>OAuth client ID</strong> (Web Application).</li>
                <li>Vào <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-[#1D9E75] underline font-bold">Supabase Dashboard</a> &rarr; Auth &rarr; Providers &rarr; Google.</li>
                <li>Bật Google Provider, copy <strong>Redirect URI</strong> dán vào Google Cloud Console.</li>
                <li>Copy <strong>Client ID</strong> và <strong>Client Secret</strong> từ Google Cloud dán vào Supabase và bấm Save.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
