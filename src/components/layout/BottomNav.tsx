'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBabyStore } from '@/store/useBabyStore';
import { 
  LayoutDashboard, 
  Baby, 
  Moon, 
  Sparkles, 
  Droplet 
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { currentBaby } = useBabyStore();
  const activeBabyId = currentBaby?.id || '';

  const navItems = [
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
      name: 'Ngủ', 
      href: activeBabyId ? `/${activeBabyId}/sleep` : '#', 
      icon: Moon,
      active: pathname.endsWith('/sleep')
    },
    { 
      name: 'Tã', 
      href: activeBabyId ? `/${activeBabyId}/diaper` : '#', 
      icon: Sparkles,
      active: pathname.endsWith('/diaper')
    },
    { 
      name: 'Hút sữa', 
      href: activeBabyId ? `/${activeBabyId}/pump` : '#', 
      icon: Droplet,
      active: pathname.endsWith('/pump')
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-16 flex items-center justify-around px-2 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] font-sans pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isDisabled = item.href === '#';

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 gap-1 text-[10px] font-bold transition-all select-none ${
              isDisabled
                ? 'opacity-30 cursor-not-allowed text-gray-400'
                : item.active
                ? 'text-[#1D9E75]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={(e) => {
              if (isDisabled) e.preventDefault();
            }}
          >
            <Icon 
              className={`w-5 h-5 transition-transform duration-200 ${
                item.active ? 'text-[#1D9E75] scale-105' : 'text-gray-400'
              }`} 
            />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
