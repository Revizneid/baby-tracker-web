'use client';

import { useEffect, useMemo, useState } from 'react';
import { useBabyStore } from '@/store/useBabyStore';
import WaterProgressRing from '@/components/water/WaterProgressRing';
import { format, isToday, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Droplet, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';

const quickAmounts = [120, 180, 250, 300];

export default function WaterPage() {
  const { waterLogs, fetchWaterLogs, addWaterLog, deleteWaterLog, loading } = useBabyStore();
  const [target, setTarget] = useState(2000);
  const [interval, setInterval] = useState('60');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchWaterLogs();

    const storedTarget = window.localStorage.getItem('waterTarget');
    const storedInterval = window.localStorage.getItem('waterReminderInterval');
    const storedStart = window.localStorage.getItem('waterStartTime');
    const storedEnd = window.localStorage.getItem('waterEndTime');

    if (storedTarget) setTarget(Number(storedTarget));
    if (storedInterval) setInterval(storedInterval);
    if (storedStart) setStartTime(storedStart);
    if (storedEnd) setEndTime(storedEnd);
  }, [fetchWaterLogs]);

  useEffect(() => {
    window.localStorage.setItem('waterTarget', target.toString());
  }, [target]);

  useEffect(() => {
    window.localStorage.setItem('waterReminderInterval', interval);
  }, [interval]);

  useEffect(() => {
    window.localStorage.setItem('waterStartTime', startTime);
  }, [startTime]);

  useEffect(() => {
    window.localStorage.setItem('waterEndTime', endTime);
  }, [endTime]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const todayLogs = useMemo(
    () =>
      waterLogs
        .filter((entry) => {
          const loggedAt = entry.logged_at ?? entry.created_at ?? '';
          if (!loggedAt) return false;
          return isToday(parseISO(loggedAt));
        })
        .sort((a, b) => (b.logged_at ?? b.created_at ?? '').localeCompare(a.logged_at ?? a.created_at ?? '')),
    [waterLogs]
  );

  const totalToday = useMemo(
    () => todayLogs.reduce((sum, item) => sum + item.amount_ml, 0),
    [todayLogs]
  );

  const progressPercent = Math.min(100, Math.round((totalToday / target) * 100));
  const missing = Math.max(0, target - totalToday);

  const handleAddAmount = async (amount: number) => {
    try {
      await addWaterLog(amount);
      setToast(`Đã thêm ${amount} ml nước`);
    } catch (error: any) {
      setToast(error?.message ?? 'Không thể thêm nước');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bản ghi này?')) return;
    try {
      await deleteWaterLog(id);
      setToast('Đã xóa mục uống nước.');
    } catch (error: any) {
      setToast(error?.message ?? 'Không thể xóa mục uống nước.');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Uống nước</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Bổ sung nước cho cả ngày</h1>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              Theo dõi lượng nước đã uống, mục tiêu hàng ngày và lịch sử từng lần uống.
            </p>
          </div>
          <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            Mục tiêu: {target} ml
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_0.7fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Tiến độ ngày hôm nay</p>
                <p className="mt-2 text-sm text-slate-500">Đã uống {totalToday} ml / {target} ml</p>
              </div>
              <span className="rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {progressPercent}% hoàn thành
              </span>
            </div>

            <div className="mt-8 flex items-center justify-center">
              <WaterProgressRing total={totalToday} target={target} />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Thêm nhanh</p>
                <p className="mt-1 text-sm text-slate-500">Chọn lượng nước bạn vừa uống.</p>
              </div>
              <Droplet className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleAddAmount(amount)}
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-semibold text-slate-900 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <span className="block text-2xl">{amount}</span>
                  <span className="text-slate-500">ml</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Lịch sử uống nước</p>
                <p className="mt-1 text-sm text-slate-500">Các lần uống nước trong ngày</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                {todayLogs.length} lượt
              </span>
            </div>

            {loading ? (
              <div className="mt-6 space-y-3">
                <div className="h-12 rounded-3xl bg-slate-100" />
                <div className="h-12 rounded-3xl bg-slate-100" />
              </div>
            ) : todayLogs.length === 0 ? (
              <div className="mt-6 rounded-3xl bg-slate-50 px-5 py-8 text-center text-slate-500">
                Chưa có mục uống nước hôm nay.
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {todayLogs.map((log) => {
                  const timestamp = log.logged_at ?? log.created_at ?? '';
                  return (
                    <div key={log.id} className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{log.amount_ml} ml</p>
                        <p className="text-xs text-slate-500">{timestamp ? format(parseISO(timestamp), 'HH:mm', { locale: vi }) : 'Không xác định'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(log.id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />Xóa
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-5 w-5 text-slate-700" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Cài đặt mục tiêu</p>
                <p className="text-sm text-slate-500">Lưu cấu hình uống nước và nhận nhắc nhở.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Mục tiêu mỗi ngày (ml)
                <input
                  type="range"
                  min={800}
                  max={4000}
                  step={100}
                  value={target}
                  onChange={(event) => setTarget(Number(event.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-slate-500">{target} ml mỗi ngày</div>
              </label>

              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Khoảng nhắc mỗi
                <select
                  value={interval}
                  onChange={(event) => setInterval(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="30">30 phút</option>
                  <option value="45">45 phút</option>
                  <option value="60">60 phút</option>
                  <option value="90">90 phút</option>
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Bắt đầu
                  <input
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Kết thúc
                  <input
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Còn thiếu <span className="font-semibold text-slate-900">{missing} ml</span> để đạt mục tiêu.
            </div>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-2xl shadow-slate-900/20">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
