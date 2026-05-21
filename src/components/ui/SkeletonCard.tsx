'use client';

interface SkeletonCardProps {
  type?: 'card' | 'feed' | 'summary' | 'circle';
  count?: number;
  className?: string;
}

export default function SkeletonCard({ type = 'card', count = 1, className = '' }: SkeletonCardProps) {
  const items = Array.from({ length: count });

  if (type === 'circle') {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-full ${className}`} />
    );
  }

  if (type === 'summary') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {items.map((_, idx) => (
          <div
            key={idx}
            className={`animate-pulse bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4 ${className}`}
          >
            <div className="w-12 h-12 bg-gray-200 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
              <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
              <div className="h-3 bg-gray-200 rounded-lg w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'feed') {
    return (
      <div className="space-y-3 w-full">
        {items.map((_, idx) => (
          <div
            key={idx}
            className={`animate-pulse p-4 bg-white rounded-2xl border border-gray-50 flex items-center justify-between ${className}`}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="w-10 h-10 bg-gray-200 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
                <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-xl flex-shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  // Default block card skeleton
  return (
    <div className="space-y-4 w-full">
      {items.map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3 ${className}`}
        >
          <div className="h-3 bg-gray-200 rounded-lg w-1/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
            <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
