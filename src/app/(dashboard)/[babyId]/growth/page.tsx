'use client';

import { useEffect, useMemo, useState, use } from 'react';
import { useBabyStore } from '@/store/useBabyStore';
import { Baby } from '@/types/database';
import LineChartGrowth from '@/components/charts/LineChartGrowth';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { format, parseISO, differenceInWeeks } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Plus, Ruler, Trash2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ babyId: string }>;
}

function getIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

// Safe ISO date parser
const safeParseISO = (dateStr: string) => {
  try {
    return parseISO(dateStr);
  } catch {
    return new Date();
  }
};

export default function GrowthPage({ params }: PageProps) {
  const { babyId } = use(params);
  const {
    babies,
    currentBaby,
    setCurrentBaby,
    fetchBabies,
    fetchGrowthLogs,
    growths,
    addGrowth,
    loading,
  } = useBabyStore();

  const pageBaby = useMemo(() => {
    if (currentBaby?.id === babyId) return currentBaby;
    return babies.find((baby: Baby) => baby.id === babyId) ?? null;
  }, [babyId, babies, currentBaby]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [date, setDate] = useState(getIsoDate(new Date()));
  const [weight, setWeight] = useState('3.2');
  const [height, setHeight] = useState('52.0');
  const [head, setHead] = useState('34.0');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!pageBaby && babies.length === 0) {
      fetchBabies();
    }

    if (pageBaby && currentBaby?.id !== pageBaby.id) {
      setCurrentBaby(pageBaby);
    }
  }, [pageBaby, babies.length, currentBaby, fetchBabies, setCurrentBaby]);

  useEffect(() => {
    if (babyId) {
      fetchGrowthLogs(babyId);
    }
  }, [babyId, fetchGrowthLogs]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const sortedGrowths = useMemo(
    () => [...growths].sort((a, b) => b.date.localeCompare(a.date)),
    [growths]
  );

  const latestGrowth = sortedGrowths[0];

  const ageWeeks = pageBaby
    ? Math.max(
        0,
        differenceInWeeks(safeParseISO(latestGrowth?.date ?? getIsoDate(new Date())), safeParseISO(pageBaby.birth_date))
      )
    : 0;

  const recentGrowths = useMemo(() => sortedGrowths.slice(0, 12), [sortedGrowths]);

  const handleOpenSheet = () => {
    setDate(getIsoDate(new Date()));
    setWeight('0');
    setHeight('0');
    setHead('0');
    setNote('');
    setIsSheetOpen(true);
  };

  const handleSubmit = async () => {
    if (!pageBaby) return;

    const parsedWeight = Number(weight || '0');
    const parsedHeight = Number(height || '0');
    const parsedHead = Number(head || '0');
    const ageInput = Math.max(0, differenceInWeeks(parseISO(date), parseISO(pageBaby.birth_date)));

    if (!date || parsedWeight <= 0 || parsedHeight <= 0 || parsedHead <= 0) {
      setToast('Vui lòng nhập đầy đủ chỉ số hợp lệ.');
      return;
    }

    try {
      await addGrowth({
        baby_id: babyId,
        date,
        age_weeks: ageInput,
        weight_kg: parsedWeight,
        height_cm: parsedHeight,
        head_cm: parsedHead,
        note,
      });
      setToast('Đã lưu chỉ số tăng trưởng.');
      setIsSheetOpen(false);
    } catch (error: any) {
      setToast(error?.message ?? 'Có lỗi khi lưu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bản ghi này?')) return;
    try {
      await useBabyStore.getState().deleteLog('growth_logs', id);
      setToast('Đã xóa bản ghi.');
    } catch (error: any) {
      setToast(error?.message ?? 'Xóa thất bại.');
    }
  };

  if (!pageBaby) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <SkeletonCard count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden relative">
        <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-[#1D9E75]/10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tăng trưởng</p>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Theo dõi phát triển của {pageBaby.name}</h1>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              Ghi nhận cân nặng, chiều cao và chu vi đầu của bé. Dữ liệu sẽ lưu lại lịch sử để dễ so sánh.
            </p>
          </div>

          <button
            onClick={handleOpenSheet}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1D9E75] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1D9E75]/20 hover:bg-emerald-600 transition"
          >
            <Plus className="w-4 h-4" /> Thêm đo lường
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cân nặng</p>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">{latestGrowth?.weight_kg ?? '--'} kg</p>
              <p className="mt-2 text-sm text-slate-500">Lần đo gần nhất</p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Chiều cao</p>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">{latestGrowth?.height_cm ?? '--'} cm</p>
              <p className="mt-2 text-sm text-slate-500">Lần đo gần nhất</p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Chu vi đầu</p>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">{latestGrowth?.head_cm ?? '--'} cm</p>
              <p className="mt-2 text-sm text-slate-500">Lần đo gần nhất</p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Biểu đồ 12 lần đo gần nhất</p>
                <p className="text-xs text-slate-500 mt-1">Tăng trưởng cân nặng và chiều cao theo tuần tuổi</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Tuần {ageWeeks}</span>
            </div>
            <div className="mt-6">
              {loading ? (
                <SkeletonCard className="min-h-[320px]" />
              ) : (
                <LineChartGrowth data={recentGrowths} />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Bảng lịch sử đo</h2>
            {sortedGrowths.length === 0 ? (
              <div className="mt-6 rounded-3xl bg-slate-50 p-8 text-center text-slate-500">
                Không có dữ liệu đo nào. Thêm đo đầu tiên để bắt đầu.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-3xl border border-slate-100">
                <table className="min-w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-[0.2em]">
                    <tr>
                      <th className="px-4 py-3">Ngày</th>
                      <th className="px-4 py-3">Tuần</th>
                      <th className="px-4 py-3">CN</th>
                      <th className="px-4 py-3">CC</th>
                      <th className="px-4 py-3">CVĐ</th>
                      <th className="px-4 py-3">Ghi chú</th>
                      <th className="px-4 py-3">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedGrowths.map((growth) => (
                      <tr key={growth.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-semibold text-slate-800">{format(parseISO(growth.date), 'dd/MM/yyyy', { locale: vi })}</td>
                        <td className="px-4 py-4">{growth.age_weeks}</td>
                        <td className="px-4 py-4">{growth.weight_kg} kg</td>
                        <td className="px-4 py-4">{growth.height_cm} cm</td>
                        <td className="px-4 py-4">{growth.head_cm} cm</td>
                        <td className="px-4 py-4">{growth.note || '—'}</td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleDelete(growth.id)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {isSheetOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Thêm chỉ số mới</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Ghi nhận đo lường</h2>
              </div>
              <button
                onClick={() => setIsSheetOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >Đóng</button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Ngày đo
                <input
                  type="date"
                  value={date}
                  max={getIsoDate(new Date())}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1D9E75]"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Tuần tuổi
                <input
                  type="number"
                  value={ageWeeks}
                  readOnly
                  className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Cân nặng (kg)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1D9E75]"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Chiều cao (cm)
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1D9E75]"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Chu vi đầu (cm)
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={head}
                  onChange={(event) => setHead(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1D9E75]"
                />
              </label>
            </div>

            <label className="mt-4 block space-y-2 text-sm font-semibold text-slate-700">
              Ghi chú
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1D9E75]"
              />
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setIsSheetOpen(false)}
                className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >Hủy</button>
              <button
                onClick={handleSubmit}
                className="rounded-3xl bg-[#1D9E75] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1D9E75]/20 hover:bg-emerald-600 transition"
              >Lưu chỉ số</button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-3xl bg-[#1D9E75] px-6 py-3 text-sm font-semibold text-white shadow-2xl shadow-slate-900/10">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
