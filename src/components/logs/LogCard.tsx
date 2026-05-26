'use client';

import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';

interface LogCardProps {
  id: string;
  type: 'feed' | 'sleep' | 'diaper';
  time: string;
  date: string;
  data: Record<string, any>;
  onDelete: (id: string) => void;
  timestamp?: number;
}

export default function LogCard({ id, type, time, date, data, onDelete, timestamp }: LogCardProps) {
  const handleDelete = () => {
    if (window.confirm('Bạn có chắc muốn xóa bản ghi này?')) {
      onDelete(id);
    }
  };

  const getDisplayContent = () => {
    switch (type) {
      case 'feed':
        return {
          title: data.type === 'formula' ? 'Sữa công thức' : data.type === 'pumped' ? 'Sữa mẹ vắt' : `Bú mẹ (${data.type === 'breast-left' ? 'Trái' : data.type === 'breast-right' ? 'Phải' : 'Hai bên'})`,
          subtitle: `${data.amount} ml ${data.note ? `• ${data.note}` : ''}`,
          badge: `${data.amount} ml`,
          badgeColor: 'bg-orange-500/10 text-orange-600',
        };
      case 'sleep':
        const minutes = data.duration_minutes || 0;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const durationText = hours > 0 ? `${hours}h${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
        return {
          title: data.type === 'nap' ? 'Ngủ ngày' : 'Ngủ đêm',
          subtitle: `${data.start_time || time} → ${data.end_time || time} (${durationText})${data.note ? ` • ${data.note}` : ''}`,
          badge: durationText,
          badgeColor: 'bg-purple-500/10 text-purple-600',
        };
      case 'diaper':
        const typeLabels: Record<string, string> = {
          wet: 'Ướt 💧',
          dirty: 'Bẩn 💩',
          both: 'Cả hai 🔴',
          clean: 'Sạch ✅',
        };
        const colorMap: Record<string, string> = {
          wet: 'bg-blue-500/10 text-blue-600',
          dirty: 'bg-amber-600/10 text-amber-700',
          both: 'bg-red-500/10 text-red-600',
          clean: 'bg-green-500/10 text-green-600',
        };
        return {
          title: typeLabels[data.type] || data.type,
          subtitle: `${data.color ? `Màu: ${data.color}` : 'Bình thường'}${data.note ? ` • ${data.note}` : ''}`,
          badge: data.type,
          badgeColor: colorMap[data.type] || 'bg-gray-500/10 text-gray-600',
        };
      default:
        return {
          title: 'Log entry',
          subtitle: '',
          badge: '',
          badgeColor: '',
        };
    }
  };

  const content = getDisplayContent();
  const relativeTime = timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: vi }) : '';

  return (
    <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50 transition">
      <div className="flex-1">
        <div className="text-sm text-gray-500">
          {date} • {time} {relativeTime && `(${relativeTime})`}
        </div>
        <p className="mt-2 text-base font-semibold text-gray-900">{content.title}</p>
        <p className="mt-1 text-sm text-gray-500">{content.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${content.badgeColor}`}>
          {content.badge}
        </span>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 transition"
          title="Xóa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
