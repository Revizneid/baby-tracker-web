'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBabyStore } from '@/store/useBabyStore';
import { 
  LayoutDashboard, 
  Baby, 
  Moon, 
  Sparkles, 
  Droplet, 
  Ruler, 
  Syringe, 
  Bell, 
  BarChart3, 
  Settings,
  Heart
} from 'lucide-react';

interface SidebarProps {
  babyId?: string;
}

export default function Sidebar({ babyId }: SidebarProps) {
  const pathname = usePathname();
  const { currentBaby } = useBabyStore();
  
  // If no baby selected or no babyId, default to empty or main selector
  const activeBabyId = babyId || currentBaby?.id || '';

  const menuItems = [
    { 
      name: 'Tổng quan', 
      href: activeBabyId ? `/${activeBabyId}` : '/', 
      icon: LayoutDashboard,
      active: activeBabyId ? pathname === `/${activeBabyId}` : pathname === '/'
    },
    { 
      name: 'Bú/Ăn', 
      href: activeBabyId ? `/${activeBabyId}/feed` : '#', 
      icon: Baby,
      active: pathname.endsWith('/feed')
    },
    { 
      name: 'Giấc ngủ', 
      href: activeBabyId ? `/${activeBabyId}/sleep` : '#', 
      icon: Moon,
      active: pathname.endsWith('/sleep')
    },
    { 
      name: 'Thay tã', 
      href: activeBabyId ? `/${activeBabyId}/diaper` : '#', 
      icon: Sparkles, // replacing safety-pin (diaper) with sparkles or baby
      active: pathname.endsWith('/diaper')
    },
    { 
      name: 'Hút sữa', 
      href: activeBabyId ? `/${activeBabyId}/pump` : '#', 
      icon: Droplet,
      active: pathname.endsWith('/pump')
    },
    { 
      name: 'Tăng trưởng', 
      href: activeBabyId ? `/${activeBabyId}/growth` : '#', 
      icon: Ruler,
      active: pathname.endsWith('/growth')
    },
    { 
      name: 'Tiêm chủng', 
      href: activeBabyId ? `/${activeBabyId}/vaccine` : '#', 
      icon: Syringe,
      active: pathname.endsWith('/vaccine')
    },
    { 
      name: 'Nhắc nhở', 
      href: activeBabyId ? `/${activeBabyId}/reminders` : '#', 
      icon: Bell,
      active: pathname.endsWith('/reminders')
    },
    { 
      name: 'Biểu đồ', 
      href: activeBabyId ? `/${activeBabyId}/charts` : '#', 
      icon: BarChart3,
      active: pathname.endsWith('/charts')
    },
    { 
      name: 'Cài đặt', 
      href: activeBabyId ? `/${activeBabyId}/settings` : '#', 
      icon: Settings,
      active: pathname.endsWith('/settings')
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 hidden lg:flex flex-col h-screen sticky top-0 font-sans shadow-sm">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-gray-50 flex-shrink-0">
        <div className="w-8 h-8 bg-[#1D9E75] rounded-xl flex items-center justify-center shadow-md shadow-[#1D9E75]/20">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg text-gray-900 tracking-tight">BabyTracker</span>
          <span className="text-[10px] block font-bold text-[#1D9E75] uppercase tracking-wider -mt-1">Nhật Ký Bé Yêu</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isDisabled = item.href === '#';

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                isDisabled
                  ? 'opacity-40 cursor-not-allowed text-gray-400'
                  : item.active
                  ? 'bg-[#F5F7F5] text-[#1D9E75]'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={(e) => {
                if (isDisabled) e.preventDefault();
              }}
            >
              <Icon 
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                  item.active ? 'text-[#1D9E75]' : 'text-gray-400 group-hover:text-gray-600'
                }`} 
              />
              <span>{item.name}</span>
              
              {item.active && (
                <div className="ml-auto w-1.5 h-1.5 bg-[#1D9E75] rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Info / Account */}
      {currentBaby && (
        <div className="p-4 border-t border-gray-50 bg-[#F5F7F5]/50 flex items-center gap-3">
          <div className="w-10 h-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-lg shadow-sm">
            {currentBaby.gender === 'male' ? '👦' : currentBaby.gender === 'female' ? '👧' : '👶'}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-sm text-gray-800 truncate">{currentBaby.name}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Em bé đang chọn</p>
          </div>
        </div>
      )}
    </aside>
  );
}
