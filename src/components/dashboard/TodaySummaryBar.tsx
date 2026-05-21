'use client';

import { useBabyStore } from '@/store/useBabyStore';
import ProgressBar from '../ui/ProgressBar';
import { Milk, Moon, Baby } from 'lucide-react';
import { useMemo } from 'react';

export default function TodaySummaryBar() {
  const { feeds, sleeps, diapers } = useBabyStore();

  // Get today's date in YYYY-MM-DD format (local timezone)
  const todayStr = useMemo(() => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    return (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
  }, []);

  // Filter logs for today
  const feedsToday = useMemo(() => feeds.filter((f) => f.date === todayStr), [feeds, todayStr]);
  const sleepsToday = useMemo(() => sleeps.filter((s) => s.date === todayStr), [sleeps, todayStr]);
  const diapersToday = useMemo(() => diapers.filter((d) => d.date === todayStr), [diapers, todayStr]);

  // Aggregate Feeding metrics
  const totalFeedMl = useMemo(() => {
    return feedsToday.reduce((sum, f) => {
      const ml = parseInt(f.amount) || 0;
      return sum + ml;
    }, 0);
  }, [feedsToday]);

  const lastFeedText = useMemo(() => {
    if (feeds.length === 0) return 'Chưa ghi nhận cữ bú nào';
    const last = feeds[0]; // Already sorted descending by Zustand
    const typeLabel = {
      'formula': 'Sữa công thức',
      'breast-left': 'Bú mẹ (Trái)',
      'breast-right': 'Bú mẹ (Phải)',
      'breast-both': 'Bú mẹ (Hai bên)',
      'pumped': 'Sữa mẹ vắt'
    }[last.type] || 'Bú';

    const amountLabel = last.amount ? ` • ${last.amount}ml` : '';
    return `${last.time} - ${typeLabel}${amountLabel}`;
  }, [feeds]);

  // Aggregate Sleeping metrics (in hours)
  const totalSleepHours = useMemo(() => {
    const totalMinutes = sleepsToday.reduce((sum, s) => {
      if (s.duration_minutes > 0) return sum + s.duration_minutes;
      // Backup calculation from HH:MM
      try {
        const [sh, sm] = s.start_time.split(':').map(Number);
        const [eh, em] = s.end_time.split(':').map(Number);
        if (!isNaN(sh) && !isNaN(eh)) {
          let diff = (eh * 60 + em) - (sh * 60 + sm);
          if (diff < 0) diff += 24 * 60; // Midnight rollover
          return sum + diff;
        }
      } catch (e) {}
      return sum;
    }, 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
  }, [sleepsToday]);

  const lastSleepText = useMemo(() => {
    if (sleeps.length === 0) return 'Chưa ghi nhận giấc ngủ nào';
    const last = sleeps[0];
    const typeLabel = last.type === 'night' ? 'Ngủ đêm' : 'Ngủ ngày';
    let durText = '';
    
    // Calculate duration
    let diffMin = last.duration_minutes;
    if (!diffMin) {
      try {
        const [sh, sm] = last.start_time.split(':').map(Number);
        const [eh, em] = last.end_time.split(':').map(Number);
        diffMin = (eh * 60 + em) - (sh * 60 + sm);
        if (diffMin < 0) diffMin += 24 * 60;
      } catch (e) {}
    }
    
    if (diffMin > 0) {
      const h = Math.floor(diffMin / 60);
      const m = diffMin % 60;
      durText = ` (${h > 0 ? `${h}g` : ''}${m}p)`;
    }

    return `${last.start_time} - ${typeLabel}${durText}`;
  }, [sleeps]);

  // Aggregate Diaper metrics
  const diaperCount = diapersToday.length;
  const lastDiaperText = useMemo(() => {
    if (diapers.length === 0) return 'Chưa ghi nhận lần tã nào';
    const last = diapers[0];
    const typeLabel = {
      'wet': 'Tã ướt 💧',
      'dirty': 'Tã bẩn 💩',
      'both': 'Cả hai 🔴',
      'clean': 'Tã sạch ✅'
    }[last.type] || 'Thay tã';
    return `${last.time} - ${typeLabel}`;
  }, [diapers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full font-sans">
      {/* Feed Summary Card */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-lg group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center space-x-3.5 mb-4">
          <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner flex-shrink-0">
            <Milk className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Cữ bú hôm nay</h4>
            <span className="text-2xl font-extrabold text-gray-900 leading-none">{feedsToday.length} cữ</span>
            {totalFeedMl > 0 && <span className="text-xs font-bold text-orange-600 ml-1.5">({totalFeedMl}ml)</span>}
          </div>
        </div>
        <ProgressBar value={feedsToday.length} max={8} showText={true} className="mb-3" />
        <div className="text-[10px] sm:text-xs text-gray-400 bg-gray-50/70 p-2 rounded-xl border border-gray-50/50 mt-1 truncate">
          <span className="font-bold text-gray-500">Mới nhất:</span> {lastFeedText}
        </div>
      </div>

      {/* Sleep Summary Card */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-lg group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center space-x-3.5 mb-4">
          <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 shadow-inner flex-shrink-0">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Ngủ nghỉ hôm nay</h4>
            <span className="text-2xl font-extrabold text-gray-900 leading-none">{totalSleepHours} giờ</span>
          </div>
        </div>
        <ProgressBar value={totalSleepHours} max={14} showText={true} className="mb-3" />
        <div className="text-[10px] sm:text-xs text-gray-400 bg-gray-50/70 p-2 rounded-xl border border-gray-50/50 mt-1 truncate">
          <span className="font-bold text-gray-500">Mới nhất:</span> {lastSleepText}
        </div>
      </div>

      {/* Diaper Summary Card */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#1D9E75]/5 rounded-full blur-lg group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center space-x-3.5 mb-4">
          <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#1D9E75] shadow-inner flex-shrink-0">
            <Baby className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Vệ sinh hôm nay</h4>
            <span className="text-2xl font-extrabold text-gray-900 leading-none">{diaperCount} lần</span>
          </div>
        </div>
        <ProgressBar value={diaperCount} max={6} showText={true} className="mb-3" />
        <div className="text-[10px] sm:text-xs text-gray-400 bg-gray-50/70 p-2 rounded-xl border border-gray-50/50 mt-1 truncate">
          <span className="font-bold text-gray-500">Mới nhất:</span> {lastDiaperText}
        </div>
      </div>
    </div>
  );
}
