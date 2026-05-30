'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface InviteClientProps {
  token: string;
}

export default function InviteClient({ token }: InviteClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invite, setInvite] = useState<any | null>(null);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('family_invites')
          .select('*, babies(name)')
          .eq('token', token)
          .single();
        if (error) {
          setError(error.message || 'Không tìm thấy lời mời');
          return;
        }
        setInvite(data);

        // Auto-accept if user is already signed in
        const { data: sessionData } = await supabase.auth.getUser();
        if (sessionData?.user) {
          await doAccept();
        }
      } catch (err: any) {
        setError(err?.message || 'Lỗi khi tải lời mời');
      }
    };

    load();
  }, [token]);

  useEffect(() => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      if (origin) setInviteUrl(`${origin}/invite/${token}`);
    } catch (e) {
      // ignore
    }
  }, [token]);

  const doAccept = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/family/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed');
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Có lỗi khi tham gia.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    // If user not logged in, redirect to login with next param
    const { data: sessionData } = await supabase.auth.getUser();
    if (!sessionData?.user) {
      const next = `/invite/${encodeURIComponent(token)}`;
      // store next path for OAuth flow as well
      window.localStorage.setItem('supabase_oauth_next', next);
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    await doAccept();
  };

  const babyName = invite?.babies?.name || invite?.baby?.name || invite?.baby_name || 'bé yêu';
  const expired = invite?.expires_at && new Date(invite.expires_at) < new Date();
  const used = !!invite?.used_at;
  const [inviteUrl, setInviteUrl] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-xl w-full rounded-3xl bg-white p-8 shadow-lg text-center">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Bạn được mời tham gia gia đình</h1>
        <p className="mt-2 text-sm text-slate-500">Lời mời cho: <span className="font-medium">{babyName}</span></p>
        <p className="mt-1 text-sm text-slate-500">Token: <span className="font-mono text-xs">{token}</span></p>

        <div className="mt-6 space-y-3">
          <p className="text-sm text-slate-600">Nhấn vào nút bên dưới để tham gia gia đình và truy cập trang quản lý bé.</p>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {expired && <p className="text-sm text-yellow-700">Lời mời đã hết hạn.</p>}
          {used && <p className="text-sm text-gray-600">Lời mời đã được sử dụng.</p>}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={handleJoin}
            disabled={loading || expired || used}
            className="rounded-2xl bg-[#1D9E75] px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Đang xử lý...' : 'Tham gia'}
          </button>
        </div>

        {inviteUrl ? (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex w-full max-w-md gap-2">
              <input readOnly value={inviteUrl} className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
              <button
                onClick={() => navigator.clipboard.writeText(inviteUrl)}
                className="rounded-2xl bg-white px-3 py-2 border border-slate-200 cursor-pointer"
              >
                Copy
              </button>
            </div>
            <div>
              <img src={`https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(inviteUrl)}`} alt="QR invite" className="w-40 h-40 rounded-xl border" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
