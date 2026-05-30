'use client';

import { useState, useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useBabyStore } from '@/store/useBabyStore';
import { PumpingLog, FeedLog, SleepLog, DiaperLog } from '@/types/database';
import BarChartDay from '@/components/charts/BarChartDay';
import LineChartGrowth from '@/components/charts/LineChartGrowth';
import DayDetailCard from '@/components/charts/DayDetailCard';
import SkeletonCard from '@/components/ui/SkeletonCard';

type TabType = 'pump' | 'feed' | 'sleep' | 'diaper' | 'growth';

interface ChartData {
  dateStr: string;
  label: string;
  value: number;
}

const TABS = [
  { id: 'pump', label: 'Hút sữa', icon: '🤱' },
  { id: 'feed', label: 'Bú/Ăn', icon: '🍼' },
  { id: 'sleep', label: 'Giấc ngủ', icon: '😴' },
  { id: 'diaper', label: 'Tã', icon: '🧷' },
  { id: 'growth', label: 'Tăng trưởng', icon: '📏' },
] as const;

export default function ChartsPage() {
  const [selectedTab, setSelectedTab] = useState<TabType>('pump');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { pumpingLogs, feeds, sleeps, diapers, growths, loading } = useBabyStore();

  // Data aggregation functions
  const aggregatePumpData = useMemo(() => {
    const data: ChartData[] = [];
    const last6Days = Array.from({ length: 6 }, (_, i) =>
      subDays(new Date(), 5 - i)
    );

    last6Days.forEach((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const label = format(date, 'dd/MM', { locale: vi });
      const dayLogs = pumpingLogs.filter((log: PumpingLog) => log.date === dateStr);
      const total = dayLogs.reduce(
        (sum: number, log: PumpingLog) => sum + ((log.left_ml || 0) + (log.right_ml || 0)),
        0
      );
      data.push({ dateStr, label, value: total });
    });
    return data;
  }, [pumpingLogs]);

  const aggregateFeedData = useMemo(() => {
    const data: ChartData[] = [];
    const last6Days = Array.from({ length: 6 }, (_, i) =>
      subDays(new Date(), 5 - i)
    );

    last6Days.forEach((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const label = format(date, 'dd/MM', { locale: vi });
      const dayLogs = feeds.filter((log: FeedLog) => log.date === dateStr);
      const total = dayLogs.reduce((sum: number, log: FeedLog) => sum + (parseInt(log.amount as string) || 0), 0);
      data.push({ dateStr, label, value: total });
    });
    return data;
  }, [feeds]);

  const aggregateSleepData = useMemo(() => {
    const data: ChartData[] = [];
    const last6Days = Array.from({ length: 6 }, (_, i) =>
      subDays(new Date(), 5 - i)
    );

    last6Days.forEach((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const label = format(date, 'dd/MM', { locale: vi });
      const dayLogs = sleeps.filter((log: SleepLog) => log.date === dateStr);
      const totalMinutes = dayLogs.reduce(
        (sum: number, log: SleepLog) => sum + (log.duration_minutes || 0),
        0
      );
      const hours = parseFloat((totalMinutes / 60).toFixed(1));
      data.push({ dateStr, label, value: hours });
    });
    return data;
  }, [sleeps]);

  const aggregateDiaperData = useMemo(() => {
    const data: ChartData[] = [];
    const last6Days = Array.from({ length: 6 }, (_, i) =>
      subDays(new Date(), 5 - i)
    );

    last6Days.forEach((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const label = format(date, 'dd/MM', { locale: vi });
      const dayLogs = diapers.filter((log: DiaperLog) => log.date === dateStr);
      data.push({ dateStr, label, value: dayLogs.length });
    });
    return data;
  }, [diapers]);

  // Chart configuration
  const chartConfigs: Record<
    TabType,
    {
      data: ChartData[];
      label: string;
      unit: string;
      color: string;
      isLoading: boolean;
    }
  > = {
    pump: {
      data: aggregatePumpData,
      label: '🤱 Hút sữa',
      unit: 'ml',
      color: 'orange-500',
      isLoading: loading,
    },
    feed: {
      data: aggregateFeedData,
      label: '🍼 Bú/Ăn',
      unit: 'ml',
      color: 'orange-500',
      isLoading: loading,
    },
    sleep: {
      data: aggregateSleepData,
      label: '😴 Giấc ngủ',
      unit: 'giờ',
      color: 'purple-500',
      isLoading: loading,
    },
    diaper: {
      data: aggregateDiaperData,
      label: '🧷 Tã',
      unit: 'lần',
      color: 'blue-500',
      isLoading: loading,
    },
    growth: {
      data: [],
      label: '📏 Tăng trưởng',
      unit: '',
      color: 'emerald-500',
      isLoading: loading,
    },
  };

  const currentConfig = chartConfigs[selectedTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Biểu đồ & Thống kê</h1>
          <p className="text-gray-600 mt-2">Theo dõi sức khỏe và phát triển của bé</p>
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-4 z-20 bg-teal-50/95 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 p-3 mb-6">
          <div className="flex gap-2 overflow-x-auto px-1 py-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTab(tab.id as TabType);
                  setSelectedDate(null);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl font-medium text-sm transition-all whitespace-nowrap border
                  ${
                    selectedTab === tab.id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300 hover:text-teal-700'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart - spans 2 columns on desktop */}
          <div className="lg:col-span-2">
            {currentConfig.isLoading ? (
              <SkeletonCard className="min-h-[420px]" />
            ) : selectedTab === 'growth' ? (
              <LineChartGrowth data={growths} />
            ) : currentConfig.data.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500 text-lg">
                  Chưa có dữ liệu {currentConfig.label}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Hãy thêm bản ghi lần đầu tiên
                </p>
              </div>
            ) : (
              <BarChartDay
                data={currentConfig.data}
                label={currentConfig.label}
                unit={currentConfig.unit}
                color={currentConfig.color}
                selectedDate={selectedDate || undefined}
                onBarClick={(dateStr) => setSelectedDate(dateStr)}
              />
            )}
          </div>

          {/* Info Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">ℹ️ Thông tin</h3>

            <div className="space-y-4 text-sm text-gray-700">
              {selectedTab === 'pump' && (
                <>
                  <p>
                    <strong>Hút sữa:</strong> Theo dõi lượng sữa hàng ngày
                  </p>
                  <p>
                    <strong>Mục tiêu:</strong> 500-800ml mỗi lần hút
                  </p>
                  <p>
                    <strong>Tần suất:</strong> 6-8 lần mỗi ngày
                  </p>
                </>
              )}

              {selectedTab === 'feed' && (
                <>
                  <p>
                    <strong>Bú/Ăn:</strong> Theo dõi lượng sữa bé uống
                  </p>
                  <p>
                    <strong>0-3 tháng:</strong> 8-12 cữ mỗi ngày
                  </p>
                  <p>
                    <strong>3-6 tháng:</strong> 6-8 cữ mỗi ngày
                  </p>
                </>
              )}

              {selectedTab === 'sleep' && (
                <>
                  <p>
                    <strong>Giấc ngủ:</strong> Theo dõi thời gian ngủ
                  </p>
                  <p>
                    <strong>0-3 tháng:</strong> 16-17 giờ mỗi ngày
                  </p>
                  <p>
                    <strong>3-6 tháng:</strong> 14-16 giờ mỗi ngày
                  </p>
                </>
              )}

              {selectedTab === 'diaper' && (
                <>
                  <p>
                    <strong>Thay tã:</strong> Theo dõi tần suất
                  </p>
                  <p>
                    <strong>0-1 tháng:</strong> 6-8 lần mỗi ngày
                  </p>
                  <p>
                    <strong>1-3 tháng:</strong> 4-6 lần mỗi ngày
                  </p>
                </>
              )}

              {selectedTab === 'growth' && (
                <>
                  <p>
                    <strong>Tăng trưởng:</strong> Theo dõi cân nặng & chiều cao
                  </p>
                  <p>
                    <strong>Cân nặng:</strong> Tăng khoảng 150-200g/tuần
                  </p>
                  <p>
                    <strong>Chiều cao:</strong> Tăng khoảng 1-1.5cm/tuần
                  </p>
                </>
              )}
            </div>

            {selectedDate && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  ✅ Chọn {format(
                    new Date(selectedDate + 'T00:00:00'),
                    'dd/MM/yyyy',
                    { locale: vi }
                  )} để xem chi tiết
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Card */}
      {selectedTab !== 'growth' && (
        <DayDetailCard
          isOpen={!!selectedDate}
          dateStr={selectedDate || ''}
          feeds={selectedTab === 'feed' ? feeds : []}
          sleeps={selectedTab === 'sleep' ? sleeps : []}
          diapers={selectedTab === 'diaper' ? diapers : []}
          pumping={selectedTab === 'pump' ? pumpingLogs : []}
          type={selectedTab}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
