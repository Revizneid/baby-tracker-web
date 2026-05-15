'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useBabyStore } from '@/store/useBabyStore';
import { LogOut, Plus, Baby as BabyIcon, History, Settings, Trash2, Clock, BarChart3 } from 'lucide-react';
import AddBabyModal from '@/components/modals/AddBabyModal';
import LogModal from '@/components/modals/LogModal';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function Home() {
  const { user, signOut } = useAuth();
  const { babies, fetchBabies, currentBaby, setCurrentBaby, loading, feeds, sleeps, diapers, deleteLog } = useBabyStore();
  
  const [isAddBabyOpen, setIsAddBabyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'analytics'>('history');
  const [logModal, setLogModal] = useState<{ isOpen: boolean; type: 'feed' | 'sleep' | 'diaper' }>({
    isOpen: false,
    type: 'feed',
  });

  useEffect(() => {
    if (user) {
      fetchBabies();
    }
  }, [user, fetchBabies]);

  // Handle Real-time subscription
  useEffect(() => {
    if (currentBaby) {
      const unsubscribe = useBabyStore.getState().subscribeToLogs(currentBaby.id);
      return () => unsubscribe();
    }
  }, [currentBaby]);

  // Combine and sort logs for history
  const allLogs = [
    ...feeds.map(f => ({ ...f, logType: 'feed', icon: '🍼', label: 'Ăn uống', color: 'orange' })),
    ...sleeps.map(s => ({ ...s, timestamp: s.start_timestamp, logType: 'sleep', icon: '💤', label: 'Ngủ nghỉ', color: 'purple' })),
    ...diapers.map(d => ({ ...d, logType: 'diaper', icon: '👶', label: 'Vệ sinh', color: 'blue' })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const getLogLabel = (log: any) => {
    if (log.logType === 'feed') return `${log.type === 'formula' ? 'Sữa công thức' : 'Bú mẹ'} - ${log.amount}ml`;
    if (log.logType === 'sleep') return `Giấc ${log.type === 'nap' ? 'ngày' : 'đêm'}`;
    if (log.logType === 'diaper') return `Tã ${log.type === 'wet' ? 'ướt' : log.type === 'dirty' ? 'bẩn' : 'sạch'}`;
    return '';
  };

  if (loading && babies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-pink-200 rounded-full mb-4"></div>
          <p className="text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center shadow-sm">
              <BabyIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">BabyTracker</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => signOut()}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {babies.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm px-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Chưa có thông tin em bé</h2>
            <p className="text-gray-500 mt-2">Hãy thêm thành viên mới để bắt đầu theo dõi</p>
            <button 
              onClick={() => setIsAddBabyOpen(true)}
              className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-200"
            >
              Thêm em bé
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Baby Selection */}
              <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-400 text-[10px] sm:text-sm uppercase tracking-wider">Em bé của bạn</h3>
                  <button onClick={() => setIsAddBabyOpen(true)} className="text-pink-500 hover:text-pink-600">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-row md:flex-col gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  {babies.map(baby => (
                    <button
                      key={baby.id}
                      onClick={() => setCurrentBaby(baby)}
                      className={`flex-shrink-0 md:flex-shrink flex items-center space-x-3 p-3 rounded-2xl transition-all ${
                        currentBaby?.id === baby.id 
                          ? 'bg-pink-50 border-2 border-pink-500 ring-4 ring-pink-50' 
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-sm">
                        {baby.gender === 'male' ? '👦' : baby.gender === 'female' ? '👧' : '👶'}
                      </div>
                      <div className="text-left">
                        <p className={`font-bold text-sm sm:text-base ${currentBaby?.id === baby.id ? 'text-pink-700' : 'text-gray-700'}`}>
                          {baby.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button 
                  onClick={() => setLogModal({ isOpen: true, type: 'feed' })}
                  className="bg-orange-50 p-3 sm:p-4 rounded-2xl border border-orange-100 text-center hover:bg-orange-100 transition-all group"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 text-white shadow-lg group-hover:scale-110 transition-transform">
                    🍼
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-orange-900">Ăn</span>
                </button>
                <button 
                  onClick={() => setLogModal({ isOpen: true, type: 'sleep' })}
                  className="bg-purple-50 p-3 sm:p-4 rounded-2xl border border-purple-100 text-center hover:bg-purple-100 transition-all group"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 text-white shadow-lg group-hover:scale-110 transition-transform">
                    💤
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-purple-900">Ngủ</span>
                </button>
                <button 
                  onClick={() => setLogModal({ isOpen: true, type: 'diaper' })}
                  className="bg-blue-50 p-3 sm:p-4 rounded-2xl border border-blue-100 text-center hover:bg-blue-100 transition-all group"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2 text-white shadow-lg group-hover:scale-110 transition-transform">
                    🚽
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-blue-900">Tã</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4 sm:space-y-6">
              {/* Tab Selector */}
              <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex">
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'history' ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Lịch sử
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'analytics' ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Thống kê
                </button>
              </div>

              {activeTab === 'history' ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[400px] overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-lg sm:text-xl flex items-center gap-2 text-gray-800">
                      <History className="w-5 h-5 text-pink-500" />
                      Lịch sử hoạt động
                    </h2>
                  </div>
                  
                  {allLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-80 text-gray-400">
                      <History className="w-12 h-12 mb-3 opacity-20" />
                      <p>Chưa có hoạt động nào</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {allLogs.map((log: any) => (
                        <div key={log.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${log.color}-50 rounded-2xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0`}>
                              {log.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{getLogLabel(log)}</p>
                              <div className="flex items-center text-[10px] sm:text-xs text-gray-400 mt-0.5">
                                <Clock className="w-3 h-3 mr-1" />
                                {log.time} • {new Date(log.date).toLocaleDateString('vi-VN')}
                              </div>
                              {log.note && <p className="text-xs sm:text-sm text-gray-500 mt-1 italic line-clamp-1">"{log.note}"</p>}
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteLog(log.logType === 'feed' ? 'feeds' : log.logType === 'sleep' ? 'sleep_logs' : 'diaper_logs', log.id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl md:opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-0 sm:px-0">
                  <AnalyticsDashboard />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <AddBabyModal isOpen={isAddBabyOpen} onClose={() => setIsAddBabyOpen(false)} />
      <LogModal 
        isOpen={logModal.isOpen} 
        onClose={() => setLogModal({ ...logModal, isOpen: false })} 
        type={logModal.type} 
      />
    </div>
  );
}
