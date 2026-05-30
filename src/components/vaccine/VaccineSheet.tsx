'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, Trash2 } from 'lucide-react';
import { VaccineMeta, formatPlannedDate, getAgeLabel } from '@/lib/data/vaccines';
import { VaccineRecord } from '@/types/database';

interface VaccineSheetProps {
  vaccine: VaccineMeta | null;
  record?: VaccineRecord;
  babyBirthDate: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    id?: string;
    baby_id: string;
    vaccine_id: string;
    vacc_date: string;
    brand: string;
    note: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  babyId: string;
}

export default function VaccineSheet({
  vaccine,
  record,
  babyBirthDate,
  isOpen,
  onClose,
  onSave,
  onDelete,
  babyId,
}: VaccineSheetProps) {
  const [brand, setBrand] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vaccine) return;
    setBrand(record?.brand ?? vaccine.brands[0] ?? '');
    setNote(record?.note ?? '');
    const today = new Date().toISOString().slice(0, 10);
    setDate(record?.vacc_date ?? today);
  }, [vaccine, record]);

  if (!vaccine || !isOpen) return null;

  const plannedDate = formatPlannedDate(babyBirthDate, vaccine.ageWeeks);
  const ageLabel = getAgeLabel(vaccine.ageWeeks);

  const handleSave = async () => {
    if (!vaccine) return;
    setLoading(true);
    try {
      await onSave({
        id: record?.id,
        baby_id: babyId,
        vaccine_id: vaccine.id,
        vacc_date: date,
        brand,
        note,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!record?.id) return;
    const confirmed = window.confirm('Bạn có chắc muốn bỏ đánh dấu mũi tiêm này?');
    if (!confirmed) return;
    setLoading(true);
    try {
      await onDelete(record.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
      <div className="w-full max-w-xl rounded-t-[32px] sm:rounded-3xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{ageLabel}</p>
            <h2 className="mt-2 text-xl font-extrabold text-slate-900">{vaccine.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-sm text-slate-500">Dự kiến tiêm</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{plannedDate}</p>
            <p className="mt-2 text-xs text-slate-500">Bé sẽ được định lịch theo ngày tuổi {ageLabel}.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Ngày tiêm thực tế</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Thương hiệu</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
                placeholder="Nhập tên thương hiệu"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Gợi ý thương hiệu</p>
            <div className="flex flex-wrap gap-2">
              {vaccine.brands.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setBrand(item)}
                  className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition-all ${
                    brand === item ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Ghi chú</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
              placeholder="Thêm ghi chú nếu cần"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-3xl bg-[#1D9E75] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#157a5a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {record ? 'Cập nhật mũi đã tiêm' : 'Đánh dấu đã tiêm'}
            </button>
            {record ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-3xl border border-rose-200 bg-white px-5 py-4 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Bỏ đánh dấu
              </button>
            ) : (
              <div className="inline-flex items-center rounded-3xl bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Lưu mũi tiêm
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
