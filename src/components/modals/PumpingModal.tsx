'use client';

import { useState } from 'react';
import { useBabyStore } from '@/store/useBabyStore';
import { X, Loader2, Clock, GlassWater, Refrigerator, Snowflakex, Save } from 'lucide-react';
import { addDays, addMonths, format } from 'date-fns';

interface PumpingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PumpingModal({ isOpen, onClose }: PumpingModalProps) {
  const { addPumping, addMilk } = useBabyStore();
  const [loading, setLoading] = useState(false);

  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [leftMl, setLeftMl] = useState('');
  const [rightMl, setRightMl] = useState('');
  const [storedAt, setStoredAt] = useState<'fridge' | 'freezer' | 'none'>('none');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const date = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    const total = (parseInt(leftMl) || 0) + (parseInt(rightMl) || 0);

    try {
      // 1. Log Pumping
      await addPumping({
        date,
        time,
        timestamp,
        start_time: time,
        end_time: time,
        duration_minutes: 0,
        left_ml: parseInt(leftMl) || 0,
        right_ml: parseInt(rightMl) || 0,
        total_ml: total,
        stored_as: storedAt === 'none' ? '' : storedAt,
        note,
      });

      // 2. Add to Milk Storage if selected
      if (storedAt !== 'none' && total > 0) {
        const expiresAt = storedAt === 'fridge' 
          ? addDays(new Date(), 4) 
          : addMonths(new Date(), 6);

        await addMilk({
          date,
          timestamp,
          amount_ml: total,
          stored_at: storedAt as 'fridge' | 'freezer',
          expires_at: expiresAt.toISOString().split('T')[0],
          note,
          used: false,
        });
      }

      onClose();
      setLeftMl('');
      setRightMl('');
      setStoredAt('none');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <GlassWater className="w-6 h-6 text-pink-500" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Ghi nhật ký hút sữa</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 ml-1">Vú trái (ml)</label>
              <input
                type="number"
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                placeholder="0"
                value={leftMl}
                onChange={(e) => setLeftMl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 ml-1">Vú phải (ml)</label>
              <input
                type="number"
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                placeholder="0"
                value={rightMl}
                onChange={(e) => setRightMl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 ml-1 mb-2">Lưu vào kho sữa?</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'none', label: 'Không lưu', icon: <X className="w-4 h-4" /> },
                { id: 'fridge', label: 'Ngăn mát', icon: <Refrigerator className="w-4 h-4" /> },
                { id: 'freezer', label: 'Ngăn đông', icon: <Snowflakex className="w-4 h-4" /> },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStoredAt(opt.id as any)}
                  className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-1 ${
                    storedAt === opt.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  {opt.icon}
                  <span className="text-[10px] font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
            <Clock className="w-4 h-4" />
            <span>Thời gian: {time}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> <span>Lưu nhật ký</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}
