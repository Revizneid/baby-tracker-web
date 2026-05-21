'use client';

import { Milk, Moon, Baby, GlassWater } from 'lucide-react';

interface QuickAddButtonsProps {
  onAddLog: (type: 'feed' | 'sleep' | 'diaper') => void;
  onAddPump: () => void;
}

export default function QuickAddButtons({ onAddLog, onAddPump }: QuickAddButtonsProps) {
  const actions = [
    {
      label: 'Bú / Ăn',
      icon: <Milk className="w-6 h-6" />,
      color: 'bg-orange-500 shadow-orange-500/20 text-orange-600 bg-orange-50 hover:bg-orange-100/70 border-orange-100',
      iconColor: 'bg-orange-500 text-white',
      onClick: () => onAddLog('feed')
    },
    {
      label: 'Giấc ngủ',
      icon: <Moon className="w-6 h-6" />,
      color: 'bg-purple-500 shadow-purple-500/20 text-purple-600 bg-purple-50 hover:bg-purple-100/70 border-purple-100',
      iconColor: 'bg-purple-500 text-white',
      onClick: () => onAddLog('sleep')
    },
    {
      label: 'Thay tã',
      icon: <Baby className="w-6 h-6" />,
      color: 'bg-blue-500 shadow-blue-500/20 text-blue-600 bg-blue-50 hover:bg-blue-100/70 border-blue-100',
      iconColor: 'bg-blue-500 text-white',
      onClick: () => onAddLog('diaper')
    },
    {
      label: 'Hút sữa',
      icon: <GlassWater className="w-6 h-6" />,
      color: 'bg-[#1D9E75] shadow-emerald-500/20 text-[#1D9E75] bg-emerald-50 hover:bg-emerald-100/70 border-emerald-100',
      iconColor: 'bg-[#1D9E75] text-white',
      onClick: onAddPump
    }
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 font-sans">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ghi chép nhanh</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((act, index) => (
          <button
            key={index}
            onClick={act.onClick}
            className={`flex flex-col items-center p-4 rounded-2xl border text-center transition-all duration-300 transform active:scale-95 group hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${act.color}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 shadow-lg group-hover:scale-110 transition-transform ${act.iconColor}`}>
              {act.icon}
            </div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide opacity-90">{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
