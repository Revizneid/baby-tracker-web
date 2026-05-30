'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { GrowthLog } from '@/types/database';

interface LineChartGrowthProps {
  data: GrowthLog[];
}

interface GrowthTooltipEntry {
  payload: GrowthLog;
  color?: string;
  name: string;
  value: number | string;
  dataKey: string;
}

interface GrowthTooltipProps {
  active?: boolean;
  payload?: GrowthTooltipEntry[];
}

const CustomTooltip = ({ active, payload }: GrowthTooltipProps) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-3 border border-gray-100">
        <p className="text-sm font-semibold text-gray-800">
          Tuần {payload[0].payload.age_weeks}
        </p>
        {payload.map((entry, index) => {
          const unit = entry.dataKey === 'height_cm' ? 'cm' : 'kg';
          return (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {unit}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function LineChartGrowth({ data }: LineChartGrowthProps) {
  // Sort by age_weeks and take last 12 records
  const chartData = data
    .filter((log) => log.weight_kg || log.height_cm)
    .sort((a, b) => (a.age_weeks || 0) - (b.age_weeks || 0))
    .slice(-12)
    .map((log) => ({
      ...log,
      label: `W${log.age_weeks}`,
    }));

  if (chartData.length === 0) {
    return (
      <div className="w-full h-96 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Chưa có dữ liệu tăng trưởng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📏 Tăng trưởng</h3>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 60, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          {/* Left Y-axis for weight */}
          <YAxis
            yAxisId="left"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Cân nặng (kg)', angle: -90, position: 'insideLeft' }}
          />
          {/* Right Y-axis for height */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Chiều cao (cm)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Weight line - Teal/Green */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="weight_kg"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            name="Cân nặng (kg)"
          />

          {/* Height line - Orange */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="height_cm"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 4 }}
            activeDot={{ r: 6 }}
            name="Chiều cao (cm)"
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Hiển thị {chartData.length} lần đo gần nhất
      </p>
    </div>
  );
}
