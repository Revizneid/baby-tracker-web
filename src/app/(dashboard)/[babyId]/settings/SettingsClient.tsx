'use client';

import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';

interface SettingsClientProps {
  babyId: string;
}

export default function SettingsClient({ babyId }: SettingsClientProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (!babyId) return;
    setLoading(true);
    fetch(`/api/family/members?babyId=${encodeURIComponent(babyId)}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setMembers(j.members || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [babyId]);

  const handleCreateInvite = async () => {
    if (!babyId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/family/create-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ babyId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không thể tạo invite');
      
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const token = json.invite?.token || json.token;
      const fullInviteUrl = token ? `${baseUrl}/invite/${token}` : json.url;

      setInviteUrl(fullInviteUrl);
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullInviteUrl)}`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Thành viên gia đình</h2>
        <p className="text-sm text-slate-500 mt-1">Quản lý quyền truy cập cho mỗi bé.</p>

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100" />
          ) : members.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có thành viên nào.</div>
          ) : (
            members.map((m) => {
              const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
              return (
                <div key={m.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div>
                    <p className="font-semibold text-slate-900">{profile?.full_name ?? 'Người dùng'}</p>
                    <p className="text-xs text-slate-500">{m.role}</p>
                  </div>
                  <div className="text-sm text-slate-500">{profile?.id || ''}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Mời thành viên</h2>
        <p className="text-sm text-slate-500 mt-1">Tạo link mời để chia sẻ cho người thân.</p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handleCreateInvite}
            className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 cursor-pointer"
          >
            Tạo link mời
          </button>

          {inviteUrl ? (
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <input
                readOnly
                value={inviteUrl}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
              <button onClick={handleCopy} className="rounded-2xl bg-white px-3 py-2 border border-slate-200 cursor-pointer">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>

        {qrUrl ? (
          <div className="mt-4">
            <img src={qrUrl} alt="QR invite" className="w-40 h-40 rounded-xl border" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
