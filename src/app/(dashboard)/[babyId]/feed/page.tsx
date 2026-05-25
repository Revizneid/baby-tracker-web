'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowLeft, Plus, Clock, Droplet, Trash2 } from 'lucide-react';
import { useBabyStore } from '@/store/useBabyStore';
import LogModal from '@/components/modals/LogModal';
import DateFilter from '@/components/logs/DateFilter';

interface PageProps {
  params: { babyId: string };
}

export default function FeedPage({ params }: PageProps) {
  const { babyId } = params;
  const router = useRouter();
  const { currentBaby, feeds, fetchLogs, deleteLog, loading } = useBabyStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [range, setRange] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');

  useEffect(() => {
    if (!babyId) return;
    fetchLogs(babyId);
    const unsubscribe = useBabyStore.getState().subscribeToLogs(babyId);
    return () => unsubscribe();
  }, [babyId, fetchLogs]);

  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');
  const yesterdayKey = format(subDays(today, 1), 'yyyy-MM-dd');
  const weekKey = format(subDays(today, 6), 'yyyy-MM-dd');

  const filteredFeeds = useMemo(() => {
    return feeds.filter((feed) => {
      if (range === 'today') return feed.date === todayKey;
      if (range === 'yesterday') return feed.date === yesterdayKey;
      if (range === 'week') return feed.date >= weekKey;
      return true;
    });
  }, [feeds, range, todayKey, yesterdayKey, weekKey]);

  const totalMl = useMemo(
    () => filteredFeeds.reduce((sum, feed) => sum + (Number(feed.amount) || 0), 0),
    [filteredFeeds]
  );

  const lastFeed = filteredFeeds.length > 0 ? filteredFeeds[0] : feeds[0];

  if (!currentBaby) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-500 font-semibold">Đang đồng bộ bé yêu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <button
            onClick={() => router.push(`/${babyId}`)}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1D9E75] hover:text-[#157a5a]"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại tổng quan
          </button>
          <DateFilter value={range} onChange={setRange} />
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#1D9E75] text-white px-4 py-3 text-sm font-bold shadow-sm hover:bg-[#157a5a] transition"
        >
          <Plus className="w-4 h-4" />
          Thêm cữ mới
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400 font-bold">Tổng ml hôm nay</p>
          <h2 className="mt-3 text-4xl font-extrabold text-gray-900">{totalMl} ml</h2>
          <p className="mt-2 text-sm text-gray-500">{filteredFeeds.length} cữ</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400 font-bold">Giờ cữ gần nhất</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">{lastFeed ? lastFeed.time : 'Chưa có'}</h2>
          {lastFeed && (
            <p className="mt-2 text-sm text-gray-500">
              {formatDistanceToNow(new Date(Number(lastFeed.timestamp)), { addSuffix: true, locale: vi })}
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400 font-bold">Bé</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">{currentBaby.name}</h2>
          <p className="mt-2 text-sm text-gray-500">{currentBaby.gender === 'male' ? 'Bé trai' : currentBaby.gender === 'female' ? 'Bé gái' : 'Chưa xác định'}</p>
        </div>
      </div>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Lịch sử bú/ăn</h3>
            <p className="text-sm text-gray-500">Xem lại cữ bú, loại sữa và ghi chú</p>
          </div>
          {loading && <span className="text-sm text-gray-400">Đang tải...</span>}
        </div>
        {filteredFeeds.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Chưa có cữ nào trong khoảng thời gian này. Nhấn "Thêm cữ mới" để bắt đầu.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredFeeds.map((feed) => (
              <div key={feed.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50 transition">
                <div>
                  <div className="text-sm text-gray-500">{feed.date} • {feed.time}</div>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {feed.type === 'formula' ? 'Sữa công thức' : feed.type === 'pumped' ? 'Sữa mẹ vắt' : `Bú mẹ (${feed.type === 'breast-left' ? 'Trái' : feed.type === 'breast-right' ? 'Phải' : 'Hai bên'})`}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{feed.amount} ml {feed.note ? `• ${feed.note}` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-[#1D9E75]/10 text-[#1D9E75] px-3 py-1 text-xs font-semibold">{feed.amount} ml</span>
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa bản ghi này?')) {
                        deleteLog('feeds', feed.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <LogModal isOpen={modalOpen} onClose={() => setModalOpen(false)} type="feed" />
    </div>
  );
}
