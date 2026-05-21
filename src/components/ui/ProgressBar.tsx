'use client';

import { useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  showText?: boolean;
  className?: string;
}

export default function ProgressBar({ value, max, showText = true, className = '' }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Smooth transition from 0 to target percent on mount
    const timer = setTimeout(() => {
      setWidth(percent);
    }, 100);
    return () => clearTimeout(timer);
  }, [percent]);

  // Determine color theme based on percentage
  let barColor = 'bg-red-500';
  let textColor = 'text-red-600';
  
  if (percent >= 70) {
    barColor = 'bg-[#1D9E75]'; // Sage Green
    textColor = 'text-[#1D9E75]';
  } else if (percent >= 30) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-600';
  }

  return (
    <div className={`w-full ${className} font-sans`}>
      <div className="flex justify-between items-center mb-1">
        {showText && (
          <span className="text-[10px] sm:text-xs font-bold text-gray-400">
            Tiến độ: {value}/{max}
          </span>
        )}
        {showText && (
          <span className={`text-[10px] sm:text-xs font-extrabold ${textColor} transition-colors duration-500`}>
            {percent}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden relative shadow-inner">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out shadow-sm`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
