'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ChartData {
  dateStr: string; // YYYY-MM-DD
  label: string; // DD/MM for display
  value: number;
}

interface BarChartDayProps {
  data: ChartData[];
  label: string; // Chart title
  unit: string; // 'ml', 'hours', 'lần'
  color: string; // Tailwind color or hex
  selectedDate?: string;
  onBarClick?: (dateStr: string) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartData;
    value: number;
  }>;
  unit: string;
}

const CustomTooltip = ({ active, payload, unit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-3xl shadow-xl p-3 border border-gray-100">
        <p className="text-sm font-semibold text-gray-800">{data.label}</p>
        <p className="text-sm text-gray-600 mt-1">
          {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
};

export default function BarChartDay({
  data,
  label,
  unit,
  color,
  selectedDate,
  onBarClick,
}: BarChartDayProps) {
  const handleBarClick = (clickedData: ChartData) => {
    onBarClick?.(clickedData.dateStr);
  };

  // Map Tailwind colors to hex
  const colorMap: Record<string, string> = {
    'orange-500': '#f97316',
    'blue-500': '#3b82f6',
    'purple-500': '#8b5cf6',
    'emerald-500': '#10b981',
    'amber-500': '#f59e0b',
  };

  const barColor = colorMap[color] || color;

  return (
    <div className="w-full h-96 bg-white rounded-2xl p-6 shadow-sm border border-gray-100" style={{ minWidth: 0, minHeight: 320 }}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{label}</h3>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          onClick={(state) => {
            if (state?.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null && typeof state.activeTooltipIndex === 'number') {
              handleBarClick(data[state.activeTooltipIndex]);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            label={{ value: unit, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar
            dataKey="value"
            fill={barColor}
            radius={[8, 8, 0, 0]}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry, index) => {
              const isSelected = selectedDate === entry.dateStr;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={barColor}
                  opacity={isSelected ? 1 : 0.65}
                  stroke={isSelected ? '#0f766e' : 'transparent'}
                  strokeWidth={isSelected ? 3 : 0}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-500 mt-2 text-center">Click cột để xem chi tiết</p>
    </div>
  );
}
