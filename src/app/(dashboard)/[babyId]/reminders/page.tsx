'use client';

import { useEffect, useMemo, useState, use } from 'react';
import { Reminder } from '@/types/database';
import { useBabyStore } from '@/store/useBabyStore';
import { parseISO, differenceInCalendarDays } from 'date-fns';
import { Bell, Plus, Trash2, Pencil, Sparkles } from 'lucide-react';

interface PageProps {
  params: Promise<{ babyId: string }>;
}

const vitaminPreset = {
  title: 'Vitamin D3+K2',
  type: 'vitamin' as const,
  doses_per_day: 1,
  time_schedule: ['08:00'],
  enabled: true,
};

export default function RemindersPage({ params }: PageProps) {
  const { babyId } = use(params);
  const { babies, currentBaby, setCurrentBaby, fetchBabies, reminders, fetchReminders, addReminder, updateReminder, deleteReminder, loading } = useBabyStore();
  const [toast, setToast] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [title, setTitle] = useState('Vitamin D3+K2');
  const [type, setType] = useState<'vitamin' | 'medicine' | 'other'>('vitamin');
  const [time, setTime] = useState('08:00');
  const [dosesPerDay, setDosesPerDay] = useState(1);
  const [enabled, setEnabled] = useState(true);
  const [completedDoseIds, setCompletedDoseIds] = useState<string[]>([]);

  const pageBaby = useMemo(() => {
    if (currentBaby?.id === babyId) return currentBaby;
    return babies.find((baby) => baby.id === babyId) ?? null;
  }, [babyId, babies, currentBaby]);

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
      fetchReminders(babyId);
    }
  }, [babyId, fetchReminders]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const todaySchedule = useMemo(
    () =>
      reminders
        .filter((item) => item.enabled)
        .flatMap((item) =>
          item.time_schedule.map((schedule) => ({
            id: `${item.id}-${schedule}`,
            title: item.title,
            time: schedule,
            reminder: item,
          }))
        )
        .sort((a, b) => a.time.localeCompare(b.time)),
    [reminders]
  );

  const openCreateSheet = () => {
    setEditingReminder(null);
    setTitle('Vitamin D3+K2');
    setType('vitamin');
    setTime('08:00');
    setDosesPerDay(1);
    setEnabled(true);
    setIsSheetOpen(true);
  };

  const openEditSheet = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setTitle(reminder.title);
    setType(reminder.type as 'vitamin' | 'medicine' | 'other');
    setTime(reminder.time_schedule[0] ?? '08:00');
    setDosesPerDay(reminder.doses_per_day);
    setEnabled(reminder.enabled);
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setToast('Tiêu đề nhắc nhở không được để trống.');
      return;
    }

    const payload = {
      baby_id: babyId,
      title: title.trim(),
      type,
      doses_per_day: dosesPerDay,
      time_schedule: [time],
      enabled,
    };

    try {
      if (editingReminder && 'id' in editingReminder) {
        await updateReminder(editingReminder.id, payload);
        setToast('Đã cập nhật nhắc nhở.');
      } else {
        await addReminder(payload);
        setToast('Đã thêm nhắc nhở mới.');
      }
      setIsSheetOpen(false);
    } catch (error: any) {
      setToast(error?.message ?? 'Có lỗi khi lưu nhắc nhở.');
    }
  };

  const handleAddPreset = async () => {
    const exists = reminders.some(
      (item) => item.title.toLowerCase().includes('vitamin d3+k2') || item.title.toLowerCase().includes('d3+k2')
    );
    if (exists) {
      setToast('Nhắc nhở D3+K2 đã tồn tại.');
      return;
    }

    try {
      await addReminder({ baby_id: babyId, ...vitaminPreset });
      setToast('Đã thêm nhắc nhở Vitamin D3+K2.');
    } catch (error: any) {
      setToast(error?.message ?? 'Không thể thêm nhắc nhở preset.');
    }
  };

  const handleToggle = async (reminder: typeof reminders[number]) => {
    await updateReminder(reminder.id, { enabled: !reminder.enabled });
    setToast(reminder.enabled ? 'Tắt nhắc nhở.' : 'Bật nhắc nhở.');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhắc nhở này?')) return;
    try {
      await deleteReminder(id);
      setToast('Đã xóa nhắc nhở.');
    } catch (error: any) {
      setToast(error?.message ?? 'Không thể xóa nhắc nhở.');
    }
  };

  const completeDose = (doseId: string) => {
    setCompletedDoseIds((prev) => [...new Set([...prev, doseId])]);
  };

  const missedDose = (doseId: string) => {
    setCompletedDoseIds((prev) => prev.filter((id) => id !== doseId));
  };

  const reminderStreak = (createdAt?: string) => {
    if (!createdAt) return 'Mới thêm';
    const days = differenceInCalendarDays(new Date(), parseISO(createdAt)) + 1;
    return `${days} ngày liên tục`;
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Nhắc nhở</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Quản lý lịch uống và vitamin</h1>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              Tạo nhắc nhở cho vitamin, thuốc bổ, uống nước hay các cữ ăn dặm cố định theo nhu cầu bé.
            </p>
          </div>
          <button
            onClick={openCreateSheet}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1D9E75] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1D9E75]/20 hover:bg-emerald-600 transition"
          >
            <Plus className="w-4 h-4" /> Thêm nhắc nhở
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.75fr_0.7fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Preset vitamin</p>
                <p className="mt-1 text-sm text-slate-500">Thêm nhanh nhắc nhở D3+K2 chuẩn.</p>
              </div>
              <button
                onClick={handleAddPreset}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition"
              >
                <Sparkles className="w-4 h-4" /> Thêm preset
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Lịch hôm nay</p>
                <p className="mt-1 text-sm text-slate-500">Danh sách nhắc nhở đang bật cho hôm nay.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                {todaySchedule.length} mục
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {todaySchedule.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500">
                  Chưa có nhắc nhở nào được bật cho hôm nay.
                </div>
              ) : (
                todaySchedule.map((item) => {
                  const doseId = item.id;
                  const isDone = completedDoseIds.includes(doseId);
                  return (
                    <div key={doseId} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.time}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => (isDone ? missedDose(doseId) : completeDose(doseId))}
                          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${isDone ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
                        >
                          {isDone ? 'Đã thực hiện' : 'Đánh dấu'}
                        </button>
                        <button
                          onClick={() => openEditSheet(item.reminder)}
                          className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 transition"
                        >Chỉnh sửa</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Danh sách nhắc nhở</p>
                <p className="text-sm text-slate-500">Quản lý bật/tắt hoặc xóa nhắc nhở.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-16 rounded-3xl bg-slate-100" />
                  <div className="h-16 rounded-3xl bg-slate-100" />
                </div>
              ) : reminders.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500">Chưa có nhắc nhở nào.</div>
              ) : (
                reminders.map((reminder) => (
                  <div key={reminder.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{reminder.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{reminder.time_schedule.join(', ')} · {reminder.doses_per_day} lần/ngày</p>
                        <p className="mt-2 text-xs text-slate-500">{reminderStreak(reminder.created_at)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleToggle(reminder)}
                          className={`rounded-full px-3 py-2 text-xs font-semibold transition ${reminder.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                          {reminder.enabled ? 'Bật' : 'Tắt'}
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditSheet(reminder)}
                            className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 transition"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(reminder.id)}
                            className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-red-600 border border-red-100 hover:bg-red-50 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {isSheetOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Nhắc nhở</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{editingReminder ? 'Chỉnh sửa nhắc nhở' : 'Thêm nhắc nhở mới'}</h2>
              </div>
              <button
                onClick={() => setIsSheetOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >Đóng</button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Tiêu đề
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ví dụ: Vitamin D3+K2"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Loại
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as 'vitamin' | 'medicine' | 'other')}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="vitamin">Vitamin</option>
                  <option value="medicine">Thuốc</option>
                  <option value="other">Khác</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Giờ nhắc
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Lượt mỗi ngày
                <input
                  type="number"
                  min={1}
                  value={dosesPerDay}
                  onChange={(event) => setDosesPerDay(Number(event.target.value))}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => setEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
                Bật nhắc nhở
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setIsSheetOpen(false)}
                className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >Hủy</button>
              <button
                onClick={handleSave}
                className="rounded-3xl bg-[#1D9E75] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1D9E75]/20 hover:bg-emerald-600 transition"
              >Lưu nhắc nhở</button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-3xl bg-[#1D9E75] px-6 py-3 text-sm font-semibold text-white shadow-2xl shadow-slate-900/20">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
