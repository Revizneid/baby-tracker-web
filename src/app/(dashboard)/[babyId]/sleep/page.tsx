'use client';

import { useEffect, useMemo, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowLeft, Plus } from 'lucide-react';
import { useBabyStore } from '@/store/useBabyStore';
import LogModal from '@/components/modals/LogModal';
import DateFilter from '@/components/logs/DateFilter';
import LogList from '@/components/logs/LogList';

interface PageProps {
  params: Promise<{ babyId: string }>;
}

export default function SleepPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { babyId } = resolvedParams;
  const router = useRouter();
  const { currentBaby, sleeps, fetchSleeps, deleteLog, loadingSleeps } = useBabyStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [range, setRange] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');

  useEffect(() => {
    if (!babyId) return;
    fetchSleeps(babyId);
    const unsubscribe = useBabyStore.getState().subscribeToLogs(babyId);
    return () => unsubscribe();
  }, [babyId, fetchSleeps]);

  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');
  const yesterdayKey = format(subDays(today, 1), 'yyyy-MM-dd');
  const weekKey = format(subDays(today, 6), 'yyyy-MM-dd');

  const filteredSleeps = useMemo(() => {
    return sleeps.filter((sleep) => {
      if (range === 'today') return sleep.date === todayKey;
      if (range === 'yesterday') return sleep.date === yesterdayKey;
      if (range === 'week') return sleep.date >= weekKey;
      return true;
    });
  }, [sleeps, range, todayKey, yesterdayKey, weekKey]);

  const totalMinutes = useMemo(
    () => filteredSleeps.reduce((sum, sleep) => sum + (sleep.duration_minutes || 0), 0),
    [filteredSleeps]
  );
  const totalHours = (totalMinutes / 60).toFixed(1);
  const lastSleep = filteredSleeps.length > 0 ? filteredSleeps[0] : sleeps[0];

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
          className="inline-flex items-center gap-2 rounded-2xl bg-[#7C3AED] text-white px-4 py-3 text-sm font-bold shadow-sm hover:bg-[#6D28D9] transition"
        >
          <Plus className="w-4 h-4" />
          Thêm giấc ngủ
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400 font-bold">Tổng giờ ngủ</p>
          <h2 className="mt-3 text-4xl font-extrabold text-gray-900">{totalHours}h</h2>
          <p className="mt-2 text-sm text-gray-500">{filteredSleeps.length} giấc</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400 font-bold">Giấc gần nhất</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">{lastSleep ? lastSleep.start_time : 'Chưa có'}</h2>
          {lastSleep && (
            <p className="mt-2 text-sm text-gray-500">
              {formatDistanceToNow(new Date(Number(lastSleep.start_timestamp)), { addSuffix: true, locale: vi })}
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
        <LogList
          logs={filteredSleeps.map((sleep) => ({
            ...sleep,
            time: sleep.start_time,
            type: 'sleep' as const,
          }))}
          type="sleep"
          onDelete={(id) => {
            if (window.confirm('Bạn có chắc muốn xóa bản ghi này?')) {
              deleteLog('sleep_logs', id);
            }
          }}
          loading={loadingSleeps}
          title="Lịch sử giấc ngủ"
          subtitle="Danh sách giấc ngủ đã ghi nhận"
        />
      </section>

      <LogModal isOpen={modalOpen} onClose={() => setModalOpen(false)} type="sleep" />
    </div>
  );
}
