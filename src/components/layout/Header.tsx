'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useBabyStore } from '@/store/useBabyStore';
import { LogOut, Plus, ChevronDown, User as UserIcon, Heart, Baby as BabyIcon } from 'lucide-react';
import AddBabyModal from '@/components/modals/AddBabyModal';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, signOut } = useAuth();
  const { babies, currentBaby, setCurrentBaby } = useBabyStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAddBabyOpen, setIsAddBabyOpen] = useState(false);
  const router = useRouter();

  const handleBabySelect = (baby: any) => {
    setCurrentBaby(baby);
    setDropdownOpen(false);
    router.push(`/${baby.id}`);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-100 h-16 sticky top-0 z-20 flex items-center px-4 sm:px-6 justify-between font-sans shadow-sm">
      {/* Brand logo (mobile-only visible, hidden on desktop since sidebar has it) */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-8 h-8 bg-[#1D9E75] rounded-xl flex items-center justify-center shadow-md">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="font-extrabold text-base tracking-tight text-gray-900 sm:inline">BabyTracker</span>
      </div>

      {/* Spacer on Desktop */}
      <div className="hidden lg:block"></div>

      {/* Right side: Baby Switcher & User Profile */}
      <div className="flex items-center gap-3">
        {/* Baby Switcher Dropdown */}
        {babies.length > 0 && currentBaby && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200/80 rounded-2xl text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            >
              <span className="text-base">
                {currentBaby.gender === 'male' ? '👦' : currentBaby.gender === 'female' ? '👧' : '👶'}
              </span>
              <span className="max-w-[80px] sm:max-w-[120px] truncate">{currentBaby.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chọn em bé</p>
                <div className="max-h-60 overflow-y-auto mt-1">
                  {babies.map((baby) => (
                    <button
                      key={baby.id}
                      onClick={() => handleBabySelect(baby)}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer ${
                        currentBaby.id === baby.id ? 'bg-[#F5F7F5] text-[#1D9E75] font-bold' : 'text-gray-700 font-medium'
                      }`}
                    >
                      <span>
                        {baby.gender === 'male' ? '👦' : baby.gender === 'female' ? '👧' : '👶'}
                      </span>
                      <span className="truncate">{baby.name}</span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-50 mt-2 pt-2 px-2">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsAddBabyOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-[#1D9E75] bg-[#F5F7F5] rounded-xl hover:bg-[#eaf0ea] transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm em bé
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Account / Signout */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 border border-[#1D9E75]/20 flex items-center justify-center text-gray-600 shadow-inner">
            <UserIcon className="w-4 h-4 text-[#1D9E75]" />
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-200"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AddBabyModal isOpen={isAddBabyOpen} onClose={() => setIsAddBabyOpen(false)} />
    </header>
  );
}
