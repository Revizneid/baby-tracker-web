'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

interface InviteClientProps {
  token: string;
}

export default function InviteClient({ token }: InviteClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-xl w-full rounded-3xl bg-white p-8 shadow-lg text-center">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Bạn được mời tham gia gia đình</h1>
        <p className="mt-2 text-sm text-slate-500">Token mời: <span className="font-mono text-xs">{token}</span></p>

        <div className="mt-6 space-y-3">
          <p className="text-sm text-slate-600">Nhấn vào nút bên dưới để tham gia gia đình và truy cập trang quản lý bé.</p>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={handleJoin}
            disabled={loading}
            className="rounded-2xl bg-[#1D9E75] px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Đang xử lý...' : 'Tham gia'}
          </button>
        </div>
      </div>
    </div>
  );
}
