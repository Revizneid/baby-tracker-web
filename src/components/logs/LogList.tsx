'use client';

import LogCard from './LogCard';

interface Log {
  id: string;
  type: 'feed' | 'sleep' | 'diaper';
  time: string;
  date: string;
  timestamp?: number;
  [key: string]: any;
}

interface LogListProps {
  logs: Log[];
  type: 'feed' | 'sleep' | 'diaper';
  onDelete: (id: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  title?: string;
  subtitle?: string;
}

export default function LogList({
  logs,
  type,
  onDelete,
  loading,
  emptyMessage,
  title,
  subtitle,
}: LogListProps) {
  const defaultEmptyMessages: Record<string, string> = {
    feed: 'Chưa có cữ nào trong khoảng thời gian này. Nhấn "Thêm cữ mới" để bắt đầu.',
    sleep: 'Chưa có giấc ngủ nào trong khoảng thời gian này. Nhấn "Thêm giấc ngủ" để bắt đầu.',
    diaper: 'Chưa có bản ghi thay tã nào trong khoảng thời gian này. Nhấn "Thêm bản ghi" để bắt đầu.',
  };

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {loading && <span className="text-sm text-gray-400">Đang tải...</span>}
      </div>

      {logs.length === 0 ? (
        <div className="p-10 text-center text-gray-400">
          {emptyMessage || defaultEmptyMessages[type]}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {logs.map((log) => (
            <LogCard
              key={log.id}
              id={log.id}
              type={type}
              time={log.time}
              date={log.date}
              timestamp={log.timestamp}
              data={log}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
