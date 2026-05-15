'use client';

import { useState } from 'react';
import { useBabyStore } from '@/store/useBabyStore';
import { X, Loader2, Calendar, User } from 'lucide-react';
import { babyService } from '@/lib/services/babyService';

interface AddBabyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBabyModal({ isOpen, onClose }: AddBabyModalProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [loading, setLoading] = useState(false);
  const { fetchBabies } = useBabyStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await babyService.addBaby({ name, birth_date: birthDate, gender });
      await fetchBabies();
      onClose();
      setName('');
      setBirthDate('');
      setGender('');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi thêm em bé');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Thêm em bé mới</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 ml-1">Tên em bé</label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                placeholder="Ví dụ: Bé Bo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 ml-1">Ngày sinh</label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 ml-1 mb-2">Giới tính</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'male', label: 'Nam', emoji: '👦' },
                { id: 'female', label: 'Nữ', emoji: '👧' },
                { id: '', label: 'Khác', emoji: '✨' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGender(opt.id as any)}
                  className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center ${
                    gender === opt.id
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <span className="text-xl mb-1">{opt.emoji}</span>
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-200 flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Xác nhận thêm bé</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
