'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/components/providers/AuthProvider';
import { useEffect } from 'react';
import { useBabyStore } from '@/store/useBabyStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { fetchBabies, loading: storeLoading, babies } = useBabyStore();

  useEffect(() => {
    if (user) {
      fetchBabies();
    }
  }, [user, fetchBabies]);

  if (authLoading || (storeLoading && babies.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7F5]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-[#1D9E75]/20 rounded-full mb-4 flex items-center justify-center">
            <div className="w-6 h-6 bg-[#1D9E75] rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7F5] text-gray-800 antialiased selection:bg-[#1D9E75]/10">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Navigation Header */}
        <Header />
        
        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-6 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
