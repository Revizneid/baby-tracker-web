import { ArrowRight } from 'lucide-react';
import { VaccineMeta, getStatusLabel, getStatusColor, VaccineStatus } from '@/lib/data/vaccines';
import { VaccineRecord } from '@/types/database';

interface VaccineCardProps {
  vaccine: VaccineMeta;
  status: VaccineStatus;
  plannedDate: string;
  record?: VaccineRecord;
  onClick: () => void;
}

export default function VaccineCard({ vaccine, status, plannedDate, record, onClick }: VaccineCardProps) {
  const color = getStatusColor(status);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left rounded-3xl border border-gray-100 bg-slate-50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{vaccine.name}</p>
          <p className="mt-2 text-xs text-slate-400 leading-5 line-clamp-2">{vaccine.disease}</p>
        </div>
        <span className={`rounded-full px-3 py-2 text-xs font-semibold ${color.bg} ${color.text} ${color.border} border`}>
          {getStatusLabel(status)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{vaccine.type === 'tcmr' ? 'TCMR' : 'Dịch vụ'}</span>
        <span>Ngày dự kiến {plannedDate}</span>
      </div>

      {record?.vacc_date ? (
        <div className="mt-4 rounded-3xl bg-white border border-slate-100 p-4 text-sm text-slate-700">
          <p className="font-semibold">Đã tiêm</p>
          <p className="mt-2 text-sm">Ngày: {new Date(record.vacc_date).toLocaleDateString('vi-VN')}</p>
          <p className="mt-1 text-sm text-slate-500">Thương hiệu: {record.brand || 'Chưa có'}</p>
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between text-sm font-semibold text-[#1D9E75]">
        <span>Xem chi tiết</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </button>
  );
}
