import { VaccineMeta, VaccineStatus } from '@/lib/data/vaccines';
import VaccineCard from './VaccineCard';
import { VaccineRecord } from '@/types/database';

interface VaccineGroupSectionProps {
  ageLabel: string;
  plannedDateLabel: string;
  completedCount: number;
  totalCount: number;
  vaccines: VaccineMeta[];
  recordMap: Record<string, VaccineRecord | undefined>;
  statusMap: Record<string, VaccineStatus>;
  onSelect: (vaccine: VaccineMeta) => void;
}

export default function VaccineGroupSection({
  ageLabel,
  plannedDateLabel,
  completedCount,
  totalCount,
  vaccines,
  recordMap,
  statusMap,
  onSelect,
}: VaccineGroupSectionProps) {
  return (
    <section className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">{ageLabel}</p>
          <h3 className="mt-2 text-xl font-extrabold text-slate-900">Dự kiến: {plannedDateLabel}</h3>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          {completedCount}/{totalCount} đã tiêm
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {vaccines.map((vaccine) => (
          <VaccineCard
            key={vaccine.id}
            vaccine={vaccine}
            status={statusMap[vaccine.id]}
            record={recordMap[vaccine.id]}
            plannedDate={plannedDateLabel}
            onClick={() => onSelect(vaccine)}
          />
        ))}
      </div>
    </section>
  );
}
