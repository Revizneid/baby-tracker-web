'use client';

interface WaterProgressRingProps {
  total: number;
  target: number;
}

export default function WaterProgressRing({ total, target }: WaterProgressRingProps) {
  const progress = Math.min(target > 0 ? total / target : 0, 1);
  const percentage = Math.round(progress * 100);
  const radius = 84;
  const stroke = 16;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  const ringColor =
    percentage >= 100
      ? '#047857'
      : percentage >= 60
      ? '#16a34a'
      : percentage >= 30
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div className="relative mx-auto flex w-full max-w-xs flex-col items-center justify-center gap-4">
      <svg width={radius * 2} height={radius * 2} className="block">
        <circle
          stroke="#e2e8f0"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={ringColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.6s ease' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Đã uống</p>
        <p className="text-3xl font-extrabold text-slate-900">{percentage}%</p>
        <p className="text-sm text-slate-500">Trong mục tiêu hôm nay</p>
      </div>
    </div>
  );
}
