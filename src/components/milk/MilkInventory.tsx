'use client';

import { useBabyStore } from '@/store/useBabyStore';
import { MilkStorage } from '@/types/database';
import { Droplets, Calendar, Trash2, CheckCircle2, AlertCircle, Snowflake, Refrigerator } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function MilkInventory() {
  const { milkStorage, markMilkUsed, deleteLog, loading } = useBabyStore();

  const activeMilk = milkStorage.filter(m => !m.used);
  const totalMl = activeMilk.reduce((sum, m) => sum + m.amount_ml, 0);
  
  const fridgeMilk = activeMilk.filter(m => m.stored_at === 'fridge');
  const freezerMilk = activeMilk.filter(m => m.stored_at === 'freezer');

  const getExpiryStatus = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const now = new Date();
    const soon = addDays(now, 1);

    if (isBefore(expiry, now)) return { label: 'Hết hạn', color: 'text-red-500', bg: 'bg-red-50', icon: <AlertCircle className="w-4 h-4" /> };
    if (isBefore(expiry, soon)) return { label: 'Sắp hết hạn', color: 'text-orange-500', bg: 'bg-orange-50', icon: <AlertCircle className="w-4 h-4" /> };
    return { label: 'Còn hạn', color: 'text-green-500', bg: 'bg-green-50', icon: <CheckCircle2 className="w-4 h-4" /> };
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Tổng lượng sữa trữ</p>
            <h2 className="text-4xl font-black mt-1">{totalMl} <span className="text-xl font-normal">ml</span></h2>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Droplets className="w-10 h-10 text-white fill-white" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-xs text-blue-100 uppercase tracking-wider font-bold">Ngăn mát</p>
            <p className="text-xl font-bold">{fridgeMilk.reduce((s, m) => s + m.amount_ml, 0)} ml</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-xs text-blue-100 uppercase tracking-wider font-bold">Ngăn đông</p>
            <p className="text-xl font-bold">{freezerMilk.reduce((s, m) => s + m.amount_ml, 0)} ml</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Danh sách túi sữa</h3>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {activeMilk.length} túi
          </span>
        </div>

        {activeMilk.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Droplets className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Kho sữa đang trống</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activeMilk.map((item) => {
              const status = getExpiryStatus(item.expires_at);
              return (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                      item.stored_at === 'fridge' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {item.stored_at === 'fridge' ? <Refrigerator className="w-6 h-6" /> : <Snowflake className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-gray-800">{item.amount_ml} ml</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${status.bg} ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Hạn dùng: {format(new Date(item.expires_at), 'dd/MM/yyyy', { locale: vi })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => markMilkUsed(item.id)}
                      className="p-2 text-green-500 hover:bg-green-50 rounded-xl transition-all"
                      title="Đánh dấu đã dùng"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteLog('milk_storage', item.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
