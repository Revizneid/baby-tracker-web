'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Droplet, Refrigerator, Trash2 } from 'lucide-react';
import { useBabyStore } from '@/store/useBabyStore';
import PumpingModal from '@/components/modals/PumpingModal';
import DateFilter from '@/components/logs/DateFilter';

interface PageProps {
  params: { babyId: string };
}

export default function PumpPage({ params }: PageProps) {
  const { babyId } = params;
  const router = useRouter();
  const { currentBaby, pumpingLogs, fetchLogs, deleteLog, loading } = useBabyStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [range, setRange] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');

  useEffect(() => {
    if (!babyId) return;
    fetchLogs(babyId);
    const unsubscribe = useBabyStore.getState().subscribeToLogs(babyId);
    return () => unsubscribe();
  }, [babyId, fetchLogs]);

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const yesterdayKey = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);
  const weekKey = new Date(today.getTime() - 6 * 86400000).toISOString().slice(0, 10);

  const filteredPumps = useMemo(() => {
    return pumpingLogs.filter((log) => {
      if (range === 'today') return log.date === todayKey;
      if (range === 'yesterday') return log.date === yesterdayKey;
      if (range === 'week') return log.date >= weekKey;
      return true;
    });
  }, [pumpingLogs, range, todayKey, yesterdayKey, weekKey]);

  const totalMl = useMemo(
    () => filteredPumps.reduce((sum, log) => sum + (log.total_ml || 0), 0),
    [filteredPumps]
  );
  const lastPump = filteredPumps.length > 0 ? filteredPumps[0] : pumpingLogs[0];

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
          className="inline-flex items-center gap-2 rounded-2xl bg-[#10B981] text-white px-4 py-3 text-sm font-bold shadow-sm hover:bg-[#059669] transition"
        >
          <Plus className="w-4 h-4" />
          Thêm lần hút
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400 font-bold">Tổng ml hút</p>
          <h2 className="mt-3 text-4xl font-extrabold text-gray-900">{totalMl} ml</h2>
          <p className="mt-2 text-sm text-gray-500">{filteredPumps.length} lần hút</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400 font-bold">Lần hút gần nhất</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">{lastPump ? lastPump.time : 'Chưa có'}</h2>
          {lastPump && <p className="mt-2 text-sm text-gray-500">{lastPump.stored_as ? `Lưu: ${lastPump.stored_as}` : 'Chưa lưu'} </p>}
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
            <h3 className="text-lg font-bold text-gray-900">Lịch sử hút sữa</h3>
            <p className="text-sm text-gray-500">Theo dõi lượng sữa hút và kho sữa.</p>
          </div>
          {loading && <span className="text-sm text-gray-400">Đang tải...</span>}
        </div>
        {filteredPumps.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Chưa có lần hút nào trong khoảng thời gian này. Thêm để ghi lại.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPumps.map((log) => (
              <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50 transition">
                <div>
                  <div className="text-sm text-gray-500">{log.date} • {log.time}</div>
                  <p className="mt-2 text-base font-semibold text-gray-900">{log.total_ml} ml hút</p>
                  <p className="mt-1 text-sm text-gray-500">Trái {log.left_ml} ml • Phải {log.right_ml} ml</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">
                    {log.stored_as ? `Lưu ${log.stored_as}` : 'Chưa lưu'}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa bản ghi này?')) {
                        deleteLog('pumping_logs', log.id);
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

      <PumpingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
