import { ChevronRight } from 'lucide-react';

interface VaccineProgressProps {
  doneCount: number;
  totalCount: number;
  tcmrCount: number;
  dvCount: number;
}

export default function VaccineProgress({ doneCount, totalCount, tcmrCount, dvCount }: VaccineProgressProps) {
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const barWidth = `${Math.min(100, progress)}%`;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">Tiêm chủng</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{doneCount}/{totalCount} mũi đã tiêm</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
          <ChevronRight className="w-4 h-4 text-[#1D9E75]" />
          <span>{progress}% hoàn thành</span>
        </div>
      </div>

      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-[#1D9E75] transition-all duration-500" style={{ width: barWidth }} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-3xl bg-emerald-50 p-4 border border-emerald-100">
          <p className="text-sm text-emerald-700 font-semibold">TCMR đã tiêm</p>
          <p className="mt-2 text-xl font-bold text-emerald-900">{tcmrCount}</p>
        </div>
        <div className="rounded-3xl bg-violet-50 p-4 border border-violet-100">
          <p className="text-sm text-violet-700 font-semibold">Dịch vụ đã tiêm</p>
          <p className="mt-2 text-xl font-bold text-violet-900">{dvCount}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
          <p className="text-sm text-slate-600 font-semibold">Chưa tiêm</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{totalCount - doneCount}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
          <p className="text-sm text-slate-600 font-semibold">Tổng số mũi</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{totalCount}</p>
        </div>
      </div>
    </div>
  );
}
