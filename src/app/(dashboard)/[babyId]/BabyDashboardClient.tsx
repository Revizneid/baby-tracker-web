'use client';

import { useEffect, useState } from 'react';
import { Baby, FeedLog, SleepLog, DiaperLog } from '@/types/database';
import { useAuth } from '@/components/providers/AuthProvider';
import { useBabyStore } from '@/store/useBabyStore';
import { History, Clock, Trash2, BarChart3, Droplets } from 'lucide-react';
import LogModal from '@/components/modals/LogModal';
import PumpingModal from '@/components/modals/PumpingModal';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import MilkInventory from '@/components/milk/MilkInventory';
import TodaySummaryBar from '@/components/dashboard/TodaySummaryBar';
import QuickAddButtons from '@/components/dashboard/QuickAddButtons';
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed';
import DailyTip from '@/components/dashboard/DailyTip';

interface BabyDashboardClientProps {
  babyId: string;
}

export default function BabyDashboardClient({ babyId }: BabyDashboardClientProps) {
  const { 
    babies, currentBaby, setCurrentBaby, 
    feeds, sleeps, diapers, deleteLog, fetchLogs,
    fetchPumpingLogs, fetchMilkStorage
  } = useBabyStore();
  
  const [isPumpingOpen, setIsPumpingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'analytics' | 'milk'>('history');
  const [logModal, setLogModal] = useState<{ isOpen: boolean; type: 'feed' | 'sleep' | 'diaper' }>({
    isOpen: false,
    type: 'feed',
  });

  // Sync route babyId with Zustand store
  useEffect(() => {
    if (babies.length > 0) {
      const matchedBaby = babies.find((b: Baby) => b.id === babyId);
      if (matchedBaby && currentBaby?.id !== babyId) {
        setCurrentBaby(matchedBaby);
      }
    }
  }, [babyId, babies, currentBaby, setCurrentBaby]);

  // Sync logs when babyId changes
  useEffect(() => {
    if (babyId) {
      fetchLogs(babyId);
      const unsubscribe = useBabyStore.getState().subscribeToLogs(babyId);
      return () => unsubscribe();
    }
  }, [babyId, fetchLogs]);

  // Lazy load milk storage logs when the tab is selected
  useEffect(() => {
    if (activeTab === 'milk' && babyId) {
      fetchPumpingLogs(babyId);
      fetchMilkStorage(babyId);
    }
  }, [activeTab, babyId, fetchPumpingLogs, fetchMilkStorage]);

  // Combine and sort logs for history
  const allLogs = [
    ...feeds.map((f: FeedLog) => ({ ...f, logType: 'feed', icon: '🍼', label: 'Ăn uống', color: 'orange' })),
    ...sleeps.map((s: SleepLog) => ({ ...s, timestamp: s.start_timestamp, logType: 'sleep', icon: '💤', label: 'Ngủ nghỉ', color: 'purple' })),
    ...diapers.map((d: DiaperLog) => ({ ...d, logType: 'diaper', icon: '💩', label: 'Vệ sinh', color: 'blue' })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const getLogLabel = (log: any) => {
    if (log.logType === 'feed') return `${log.type === 'formula' ? 'Sữa công thức' : 'Bú mẹ'} - ${log.amount}ml`;
    if (log.logType === 'sleep') return `Giấc ${log.type === 'nap' ? 'ngày' : 'đêm'}`;
    if (log.logType === 'diaper') return `Tã ${log.type === 'wet' ? 'ướt' : log.type === 'dirty' ? 'bẩn' : 'sạch'}`;
    return '';
  };

  if (!currentBaby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D9E75] mb-4"></div>
        <p className="font-bold text-sm">Đang đồng bộ em bé...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#1D9E75]/5 rounded-full blur-xl"></div>
        <div className="w-16 h-16 bg-[#1D9E75]/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
          {currentBaby.gender === 'male' ? '👦' : currentBaby.gender === 'female' ? '👧' : '👶'}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Chào ngày mới, {currentBaby.name}! 👋
          </h2>
          <p className="text-sm text-gray-400 mt-1 font-bold">
            Bé yêu {currentBaby.gender === 'male' ? 'trai' : currentBaby.gender === 'female' ? 'gái' : ''} • Sinh ngày {new Date(currentBaby.birth_date).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Today's Summary Bar - Full Width */}
      <TodaySummaryBar />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions + Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <QuickAddButtons 
            onAddLog={(type) => setLogModal({ isOpen: true, type })}
            onAddPump={() => setIsPumpingOpen(true)}
          />
          <RecentActivityFeed />
        </div>

        {/* Right Column: Daily Tip */}
        <div className="lg:col-span-1">
          <DailyTip />
        </div>
      </div>

      {/* Tab Selector & Content */}
      <div className="space-y-6">
        <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex overflow-x-auto scrollbar-hide">
          {[
            { id: 'history', label: 'Lịch sử', icon: <History className="w-4 h-4" /> },
            { id: 'analytics', label: 'Thống kê', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'milk', label: 'Kho sữa', icon: <Droplets className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/20' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[400px] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg sm:text-xl flex items-center gap-2 text-gray-800">
                <History className="w-5 h-5 text-[#1D9E75]" />
                Lịch sử hoạt động
              </h2>
            </div>
            
            {allLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 text-gray-400">
                <History className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-bold text-gray-400 uppercase">Chưa có hoạt động nào hôm nay</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {allLogs.map((log: any) => (
                  <div key={log.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 shadow-sm border border-gray-100`}>
                        {log.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{getLogLabel(log)}</p>
                        <div className="flex items-center text-[10px] sm:text-xs text-gray-400 mt-0.5 font-medium">
                          <Clock className="w-3 h-3 mr-1" />
                          {log.time} • {new Date(log.date).toLocaleDateString('vi-VN')}
                        </div>
                        {log.note && <p className="text-xs sm:text-sm text-gray-400 mt-1 italic line-clamp-1">&ldquo;{log.note}&rdquo;</p>}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteLog(log.logType === 'feed' ? 'feeds' : log.logType === 'sleep' ? 'sleep_logs' : 'diaper_logs', log.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl md:opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'milk' && <MilkInventory />}
      </div>

      <LogModal 
        isOpen={logModal.isOpen} 
        onClose={() => setLogModal({ ...logModal, isOpen: false })} 
        type={logModal.type} 
      />
      <PumpingModal isOpen={isPumpingOpen} onClose={() => setIsPumpingOpen(false)} />
    </div>
  );
}
