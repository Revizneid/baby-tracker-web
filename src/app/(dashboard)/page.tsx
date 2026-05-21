'use client';

import { useEffect, useState } from 'react';
import { useBabyStore } from '@/store/useBabyStore';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight, Sparkles } from 'lucide-react';
import AddBabyModal from '@/components/modals/AddBabyModal';

export default function DashboardIndexPage() {
  const { babies, currentBaby, setCurrentBaby, loading } = useBabyStore();
  const [isAddBabyOpen, setIsAddBabyOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (babies.length > 0) {
      const activeBaby = currentBaby || babies[0];
      if (!currentBaby) {
        setCurrentBaby(activeBaby);
      }
      router.replace(`/${activeBaby.id}`);
    }
  }, [babies, currentBaby, setCurrentBaby, router]);

  if (loading) {
    return null; // Layout.tsx already handles the global spinner
  }

  if (babies.length === 0) {
    return (
      <div className="text-center py-16 sm:py-24 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 px-6 max-w-xl mx-auto mt-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto w-20 h-20 bg-[#1D9E75]/10 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-[#1D9E75]" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Chào mừng bạn đến với BabyTracker!</h2>
        <p className="text-gray-500 mt-3 text-sm max-w-sm mx-auto leading-relaxed">
          Hãy thêm hồ sơ em bé đầu tiên để bắt đầu theo dõi chế độ dinh dưỡng, giấc ngủ, thay tã và tiêm chủng.
        </p>
        <button 
          onClick={() => setIsAddBabyOpen(true)}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 bg-[#1D9E75] hover:bg-[#157a5a] text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#1D9E75]/20 hover:shadow-xl hover:shadow-[#1D9E75]/30 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Thêm bé yêu
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>

        <AddBabyModal isOpen={isAddBabyOpen} onClose={() => setIsAddBabyOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D9E75]"></div>
    </div>
  );
}
