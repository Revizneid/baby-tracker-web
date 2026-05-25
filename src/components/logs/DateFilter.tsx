'use client';

type DateRange = 'today' | 'yesterday' | 'week' | 'all';

interface DateFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

const options: Array<{ label: string; value: DateRange }> = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Hôm qua', value: 'yesterday' },
  { label: '7 ngày', value: 'week' },
  { label: 'Tất cả', value: 'all' },
];

export default function DateFilter({ value, onChange }: DateFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            value === option.value
              ? 'bg-[#1D9E75] text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
