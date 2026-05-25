'use client';

import { useState } from 'react';
import { useBabyStore } from '@/store/useBabyStore';
import { X, Loader2, Clock, StickyNote, GlassWater, BedDouble, Droplets } from 'lucide-react';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'feed' | 'sleep' | 'diaper';
}

export default function LogModal({ isOpen, onClose, type }: LogModalProps) {
  const { currentBaby, addFeed, addSleep, addDiaper } = useBabyStore();
  const [loading, setLoading] = useState(false);

  // Common fields
  const [note, setNote] = useState('');
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Feed specific
  const [feedType, setFeedType] = useState<'formula' | 'breast-left' | 'breast-right' | 'breast-both' | 'pumped'>('formula');
  const [amount, setAmount] = useState('');

  // Sleep specific
  const [sleepType, setSleepType] = useState<'nap' | 'night'>('nap');
  const [endTime, setEndTime] = useState(new Date().toTimeString().slice(0, 5));

  // Diaper specific
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty' | 'both' | 'clean'>('wet');

  if (!isOpen || !currentBaby) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const timestamp = Date.now();

    try {
      if (type === 'feed') {
        await addFeed({
          baby_id: currentBaby.id,
          time,
          timestamp,
          type: feedType,
          amount: amount.trim(),
          note,
          date,
        });
      } else if (type === 'sleep') {
        const start = new Date(`${date}T${time}:00`);
        let end = new Date(`${date}T${endTime}:00`);
        if (end.getTime() < start.getTime()) {
          end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
        }
        const durationMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));

        await addSleep({
          baby_id: currentBaby.id,
          start_time: time,
          end_time: endTime || time,
          start_timestamp: timestamp,
          type: sleepType,
          duration_minutes: durationMinutes,
          date,
        });
      } else if (type === 'diaper') {
        await addDiaper({
          baby_id: currentBaby.id,
          time,
          timestamp,
          type: diaperType,
          color: '',
          note,
          date,
        });
      }
      onClose();
      setNote('');
      setAmount('');
      setEndTime(new Date().toTimeString().slice(0, 5));
      setDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const config = {
    feed: { title: 'Ghi nhật ký ăn uống', icon: <GlassWater className="w-6 h-6 text-orange-500" />, color: 'orange' },
    sleep: { title: 'Ghi nhật ký ngủ', icon: <BedDouble className="w-6 h-6 text-purple-500" />, color: 'purple' },
    diaper: { title: 'Ghi nhật ký vệ sinh', icon: <Droplets className="w-6 h-6 text-blue-500" />, color: 'blue' },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center space-x-3">
            {config.icon}
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{config.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Time Picker */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 ml-1">Ngày</label>
              <input
                type="date"
                required
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 ml-1">Thời gian</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Type Selector based on Log Type */}
          {type === 'feed' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 ml-1 mb-2">Loại sữa</label>
                <select
                  value={feedType}
                  onChange={(e) => setFeedType(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                >
                  <option value="formula">Sữa công thức</option>
                  <option value="breast-left">Bú mẹ (Trái)</option>
                  <option value="breast-right">Bú mẹ (Phải)</option>
                  <option value="breast-both">Bú mẹ (Hai bên)</option>
                  <option value="pumped">Sữa mẹ vắt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 ml-1">Lượng (ml)</label>
                <input
                  type="number"
                  className="block w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  placeholder="Ví dụ: 120"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </>
          )}

          {type === 'sleep' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 ml-1 mb-2">Loại giấc ngủ</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSleepType('nap')}
                    className={`py-3 rounded-xl border-2 transition-all ${
                      sleepType === 'nap' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-100 bg-gray-50 text-gray-500'
                    }`}
                  >
                    Ngủ ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => setSleepType('night')}
                    className={`py-3 rounded-xl border-2 transition-all ${
                      sleepType === 'night' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-100 bg-gray-50 text-gray-500'
                    }`}
                  >
                    Ngủ đêm
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 ml-1">Bắt đầu</label>
                  <input
                    type="time"
                    required
                    className="block w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 ml-1">Kết thúc</label>
                  <input
                    type="time"
                    required
                    className="block w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {type === 'diaper' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 ml-1 mb-2">Loại tã</label>
              <div className="grid grid-cols-4 gap-3">
                {(['wet', 'dirty', 'both', 'clean'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiaperType(d)}
                    className={`py-3 rounded-xl border-2 transition-all capitalize ${
                      diaperType === d ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-500'
                    }`}
                  >
                    {d === 'wet' ? 'Ướt' : d === 'dirty' ? 'Bẩn' : d === 'both' ? 'Cả hai' : 'Sạch'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 ml-1">Ghi chú</label>
            <div className="mt-1 relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <StickyNote className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                rows={2}
                placeholder="Thêm lưu ý nếu có..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 sm:mt-6 py-4 sm:py-5 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2 active:scale-95 ${
              type === 'feed'
                ? 'bg-orange-500 hover:bg-orange-600'
                : type === 'sleep'
                ? 'bg-purple-500 hover:bg-purple-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="text-base sm:text-lg">Lưu nhật ký</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
