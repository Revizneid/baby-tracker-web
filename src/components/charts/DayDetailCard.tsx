'use client';

import { format, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FeedLog, SleepLog, DiaperLog, PumpingLog } from '@/types/database';
import { useEffect } from 'react';

interface DayDetailCardProps {
  isOpen: boolean;
  dateStr: string; // YYYY-MM-DD
  feeds?: FeedLog[];
  sleeps?: SleepLog[];
  diapers?: DiaperLog[];
  pumping?: PumpingLog[];
  type: 'feed' | 'sleep' | 'diaper' | 'pump';
  onClose: () => void;
}

interface TimelineEvent {
  time: string;
  type: 'feed' | 'sleep' | 'diaper' | 'pump';
  label: string;
  icon: string;
  details: string;
  timestamp: number; // for sorting
}

export default function DayDetailCard({
  isOpen,
  dateStr,
  feeds = [],
  sleeps = [],
  diapers = [],
  pumping = [],
  type,
  onClose,
}: DayDetailCardProps) {
  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Filter events by date
  const getEventsForDate = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Feed events
    feeds.forEach((log) => {
      if (log.date === dateStr) {
        const time = log.time || '00:00';
        const [h, m] = time.split(':').map(Number);
        const amount = Number(log.amount) || 0;
        events.push({
          time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
          type: 'feed',
          label: log.type === 'breast-left' ? 'Bú mẹ trái' : 
                 log.type === 'breast-right' ? 'Bú mẹ phải' :
                 log.type === 'breast-both' ? 'Bú mẹ hai bên' :
                 log.type === 'formula' ? 'Ăn sữa công thức' :
                 log.type === 'pumped' ? 'Bú sữa vắt' : 'Bú',
          icon: '🍼',
          details: `${amount}ml${log.note ? ` • ${log.note}` : ''}`,
          timestamp: h * 60 + m,
        });
      }
    });

    // Sleep events
    sleeps.forEach((log) => {
      if (log.date === dateStr) {
        const startTime = log.start_time || '00:00';
        const endTime = log.end_time || '00:00';
        const [sh, sm] = startTime.split(':').map(Number);
        
        const duration = log.duration_minutes || 0;
        const hours = Math.floor(duration / 60);
        const mins = duration % 60;
        const durationStr = `${hours}h ${mins}m`;
        
        events.push({
          time: startTime,
          type: 'sleep',
          label: log.type === 'night' ? 'Ngủ đêm' : 'Ngủ ngày',
          icon: '😴',
          details: `${durationStr} (${startTime}–${endTime})`,
          timestamp: sh * 60 + sm,
        });
      }
    });

    // Diaper events
    diapers.forEach((log) => {
      if (log.date === dateStr) {
        const time = log.time || '00:00';
        const [h, m] = time.split(':').map(Number);
        events.push({
          time,
          type: 'diaper',
          label: log.type === 'wet' ? 'Tã ướt' : 
                 log.type === 'dirty' ? 'Tã bẩn' :
                 log.type === 'both' ? 'Tã ướt+bẩn' :
                 log.type === 'clean' ? 'Tã sạch' : 'Thay tã',
          icon: '🧷',
          details: log.color ? `Màu ${log.color}` : '',
          timestamp: h * 60 + m,
        });
      }
    });

    // Pumping events
    pumping.forEach((log) => {
      if (log.date === dateStr) {
        const time = log.time || log.start_time || '00:00';
        const [h, m] = time.split(':').map(Number);
        const total = (log.left_ml || 0) + (log.right_ml || 0);
        events.push({
          time,
          type: 'pump',
          label: 'Hút sữa',
          icon: '🤱',
          details: `${total}ml (T: ${log.left_ml || 0}ml, P: ${log.right_ml || 0}ml)`,
          timestamp: h * 60 + m,
        });
      }
    });

    // Sort by timestamp
    return events.sort((a, b) => a.timestamp - b.timestamp);
  };

  const events = getEventsForDate();
  const dateObj = parse(dateStr, 'yyyy-MM-dd', new Date());
  const displayDate = format(dateObj, 'EEEE, dd/MM/yyyy', { locale: vi });

  // Calculate stats
  const getStats = () => {
    switch (type) {
      case 'feed': {
        const count = feeds.filter((f) => f.date === dateStr).length;
        const total = feeds
          .filter((f) => f.date === dateStr)
          .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
        const avg = count > 0 ? (total / count).toFixed(1) : '0';
        return {
          count: `${count} cữ`,
          total: `${total}ml`,
          average: `${avg}ml/cữ`,
        };
      }
      case 'sleep': {
        const count = sleeps.filter((s) => s.date === dateStr).length;
        const totalMins = sleeps
          .filter((s) => s.date === dateStr)
          .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
        const totalHours = (totalMins / 60).toFixed(1);
        const avgHours = count > 0 ? ((totalMins / count) / 60).toFixed(1) : 0;
        return {
          count: `${count} giấc`,
          total: `${totalHours}h`,
          average: `${avgHours}h/giấc`,
        };
      }
      case 'diaper': {
        const count = diapers.filter((d) => d.date === dateStr).length;
        return {
          count: `${count} lần`,
          total: `Thay tã ${count} lần`,
          average: `—`,
        };
      }
      case 'pump': {
        const count = pumping.filter((p) => p.date === dateStr).length;
        const total = pumping
          .filter((p) => p.date === dateStr)
          .reduce((sum, p) => sum + ((p.left_ml || 0) + (p.right_ml || 0)), 0);
        const avg = count > 0 ? (total / count).toFixed(0) : 0;
        return {
          count: `${count} lần`,
          total: `${total}ml`,
          average: `${avg}ml/lần`,
        };
      }
      default:
        return { count: '—', total: '—', average: '—' };
    }
  };

  const stats = getStats();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Detail Card - Desktop: right panel, Mobile: full overlay */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white shadow-2xl z-50 overflow-auto
          animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-50 to-teal-50 border-b border-gray-100 p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Chi tiết ngày</p>
            <p className="text-lg font-semibold text-gray-800 capitalize">
              {displayDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.count}</p>
              <p className="text-xs text-gray-600 mt-1">Số lần</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.total}</p>
              <p className="text-xs text-gray-600 mt-1">Tổng</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.average}</p>
              <p className="text-xs text-gray-600 mt-1">Trung bình</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-4 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h3>

          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Không có sự kiện hôm nay</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, idx) => (
                <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-base">
                      {event.icon}
                    </div>
                    {idx < events.length - 1 && (
                      <div className="w-0.5 h-6 bg-gray-200 mt-1" />
                    )}
                  </div>

                  {/* Event details */}
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-semibold text-gray-800">{event.label}</p>
                    <p className="text-xs text-gray-500">{event.time}</p>
                    {event.details && (
                      <p className="text-xs text-gray-600 mt-1">{event.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
