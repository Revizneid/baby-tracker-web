'use client';

import React, { useMemo, useState } from 'react';
import { useBabyStore } from '@/store/useBabyStore';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Milk, Moon, Baby, Trash2 } from 'lucide-react';

interface Activity {
  id: string;
  type: 'feed' | 'sleep' | 'diaper';
  timestamp: number;
  label: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}

export default function RecentActivityFeed() {
  const { feeds, sleeps, diapers, deleteLog } = useBabyStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Combine all activities and sort by timestamp
  const recentActivities = useMemo(() => {
    const activities: Activity[] = [];

    // Add feeds
    feeds.slice(0, 6).forEach((f) => {
      const typeLabel = {
        'formula': 'Sữa công thức',
        'breast-left': 'Bú mẹ (Trái)',
        'breast-right': 'Bú mẹ (Phải)',
        'breast-both': 'Bú mẹ (Hai bên)',
        'pumped': 'Sữa mẹ vắt'
      }[f.type] || 'Bú';

      const amountLabel = f.amount ? ` • ${f.amount}ml` : '';
      activities.push({
        id: `feed-${f.id}`,
        type: 'feed',
        timestamp: f.timestamp || 0,
        label: `${typeLabel}${amountLabel}`,
        time: f.time,
        icon: <Milk className="w-4 h-4" />,
        color: 'bg-orange-100 text-orange-600 border-orange-200'
      });
    });

    // Add sleeps
    sleeps.slice(0, 6).forEach((s) => {
      const typeLabel = s.type === 'night' ? 'Ngủ đêm' : 'Ngủ ngày';
      let durText = '';
      
      let diffMin = s.duration_minutes;
      if (!diffMin) {
        try {
          const [sh, sm] = s.start_time.split(':').map(Number);
          const [eh, em] = s.end_time.split(':').map(Number);
          diffMin = (eh * 60 + em) - (sh * 60 + sm);
          if (diffMin < 0) diffMin += 24 * 60;
        } catch (e) {}
      }
      
      if (diffMin > 0) {
        const h = Math.floor(diffMin / 60);
        const m = diffMin % 60;
        durText = ` • ${h > 0 ? `${h}g ` : ''}${m}p`;
      }

      activities.push({
        id: `sleep-${s.id}`,
        type: 'sleep',
        timestamp: s.start_timestamp || 0,
        label: `${typeLabel}${durText}`,
        time: s.start_time,
        icon: <Moon className="w-4 h-4" />,
        color: 'bg-purple-100 text-purple-600 border-purple-200'
      });
    });

    // Add diapers
    diapers.slice(0, 6).forEach((d) => {
      const typeLabel = {
        'wet': 'Tã ướt 💧',
        'dirty': 'Tã bẩn 💩',
        'both': 'Cả hai 🔴',
        'clean': 'Tã sạch ✅'
      }[d.type] || 'Thay tã';

      activities.push({
        id: `diaper-${d.id}`,
        type: 'diaper',
        timestamp: d.timestamp || 0,
        label: typeLabel,
        time: d.time,
        icon: <Baby className="w-4 h-4" />,
        color: 'bg-blue-100 text-blue-600 border-blue-200'
      });
    });

    // Sort by timestamp descending and return top 6
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);
  }, [feeds, sleeps, diapers]);

  const handleDelete = async (activityId: string, type: 'feed' | 'sleep' | 'diaper') => {
    setDeletingId(activityId);
    try {
      const id = activityId.split('-')[1];
      const tableMap = {
        feed: 'feeds',
        sleep: 'sleep_logs',
        diaper: 'diaper_logs'
      };
      await deleteLog(tableMap[type], id);
    } catch (error) {
      console.error('Error deleting log:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (recentActivities.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-64 font-sans">
        <div className="text-5xl">🍼</div>
        <h3 className="font-bold text-gray-700">Chưa có hoạt động hôm nay</h3>
        <p className="text-sm text-gray-500">Thêm lần bú/ngủ/tã đầu tiên của bé!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 font-sans">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hoạt động gần đây</h3>
      
      <div className="space-y-3">
        {/* Timeline container */}
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1D9E75] to-gray-100" />
          
          {/* Timeline items */}
          {recentActivities.map((activity, index) => {
            const relativeTime = formatDistanceToNow(
              new Date(activity.timestamp),
              { addSuffix: true, locale: vi }
            );

            return (
              <div
                key={activity.id}
                className={`group flex items-start gap-3 p-3 rounded-2xl transition-all duration-300 hover:bg-gray-50 ${
                  deletingId === activity.id ? 'opacity-50' : ''
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute -left-3 top-4 w-6 h-6 bg-white border-2 border-[#1D9E75] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <div className="w-2 h-2 bg-[#1D9E75] rounded-full" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-2 rounded-lg border ${activity.color}`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {activity.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {activity.time} — {relativeTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(activity.id, activity.type)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 flex-shrink-0"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
