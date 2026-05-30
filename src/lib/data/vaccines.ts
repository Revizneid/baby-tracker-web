import { addWeeks, differenceInCalendarDays, format, startOfDay } from 'date-fns';
import { VaccineRecord } from '@/types/database';

export type VaccineMeta = {
  id: string;
  name: string;
  disease: string;
  ageWeeks: number;
  type: 'tcmr' | 'dv';
  brands: string[];
};

export const VACCINES: VaccineMeta[] = [
  { id: 'bcg', name: 'BCG', disease: 'Lao', ageWeeks: 0, type: 'tcmr', brands: ['BCG SSI'] },
  { id: 'hepb-1', name: 'Viêm gan B mũi 1', disease: 'Viêm gan B', ageWeeks: 0, type: 'tcmr', brands: ['Euvax B', 'Engerix B'] },
  { id: '6in1-1', name: '6-trong-1 mũi 1', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, VGB', ageWeeks: 8, type: 'dv', brands: ['Infanrix Hexa', 'Hexaxim'] },
  { id: '5in1-1', name: '5-trong-1 mũi 1', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib', ageWeeks: 8, type: 'tcmr', brands: ['Pentaxim', 'ComBE Five'] },
  { id: 'pcv-1', name: 'Phế cầu PCV mũi 1', disease: 'Viêm phổi, Viêm màng não do phế cầu', ageWeeks: 8, type: 'dv', brands: ['Synflorix', 'Prevenar 13'] },
  { id: 'rota-1', name: 'Rotavirus mũi 1', disease: 'Tiêu chảy do Rotavirus', ageWeeks: 8, type: 'dv', brands: ['Rotarix', 'Rotateq'] },
  { id: 'vmnbc-1', name: 'VMN BC mũi 1', disease: 'Viêm màng não mô cầu BC', ageWeeks: 8, type: 'dv', brands: ['VA-MENGOC-BC'] },
  { id: '6in1-2', name: '6-trong-1 mũi 2', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, VGB', ageWeeks: 12, type: 'dv', brands: ['Infanrix Hexa', 'Hexaxim'] },
  { id: '5in1-2', name: '5-trong-1 mũi 2', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib', ageWeeks: 12, type: 'tcmr', brands: ['Pentaxim', 'ComBE Five'] },
  { id: 'rota-2', name: 'Rotavirus mũi 2', disease: 'Tiêu chảy do Rotavirus', ageWeeks: 12, type: 'dv', brands: ['Rotarix', 'Rotateq'] },
  { id: 'vmnbc-2', name: 'VMN BC mũi 2', disease: 'Viêm màng não mô cầu BC', ageWeeks: 12, type: 'dv', brands: ['VA-MENGOC-BC'] },
  { id: '6in1-3', name: '6-trong-1 mũi 3', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, VGB', ageWeeks: 16, type: 'dv', brands: ['Infanrix Hexa', 'Hexaxim'] },
  { id: '5in1-3', name: '5-trong-1 mũi 3', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib', ageWeeks: 16, type: 'tcmr', brands: ['Pentaxim', 'ComBE Five'] },
  { id: 'pcv-2', name: 'Phế cầu PCV mũi 2', disease: 'Viêm phổi, Viêm màng não do phế cầu', ageWeeks: 16, type: 'dv', brands: ['Synflorix', 'Prevenar 13'] },
  { id: 'rota-3', name: 'Rotavirus mũi 3', disease: 'Tiêu chảy do Rotavirus', ageWeeks: 16, type: 'dv', brands: ['Rotateq'] },
  { id: 'hepb-3', name: 'Viêm gan B mũi 3', disease: 'Viêm gan B', ageWeeks: 24, type: 'tcmr', brands: ['Euvax B', 'Engerix B'] },
  { id: 'flu-1', name: 'Cúm mùa mũi 1', disease: 'Cúm', ageWeeks: 24, type: 'dv', brands: ['Vaxigrip Tetra', 'Influvac Tetra'] },
  { id: 'vmn-ac', name: 'VMN A+C', disease: 'Viêm màng não mô cầu A+C', ageWeeks: 24, type: 'dv', brands: ['Polysaccharide A+C'] },
  { id: 'mmr-1', name: 'MMR mũi 1', disease: 'Sởi, Quai bị, Rubella', ageWeeks: 36, type: 'dv', brands: ['MMR II', 'Priorix'] },
  { id: 'measles', name: 'Sởi đơn', disease: 'Sởi', ageWeeks: 36, type: 'tcmr', brands: ['MVVAC'] },
  { id: 'je-1', name: 'Viêm não NB mũi 1', disease: 'Viêm não Nhật Bản', ageWeeks: 36, type: 'tcmr', brands: ['Jevax', 'Imojev'] },
  { id: 'pcv-3', name: 'Phế cầu PCV nhắc', disease: 'Viêm phổi, Viêm màng não do phế cầu', ageWeeks: 48, type: 'dv', brands: ['Synflorix', 'Prevenar 13'] },
  { id: 'je-2', name: 'Viêm não NB mũi 2', disease: 'Viêm não Nhật Bản', ageWeeks: 48, type: 'tcmr', brands: ['Jevax', 'Imojev'] },
  { id: 'varicella', name: 'Thủy đậu', disease: 'Thủy đậu', ageWeeks: 48, type: 'dv', brands: ['Varivax', 'Varilrix'] },
  { id: 'hepb-4', name: 'Viêm gan B nhắc', disease: 'Viêm gan B', ageWeeks: 48, type: 'dv', brands: ['Euvax B'] },
  { id: 'mmr-2', name: 'MMR mũi 2', disease: 'Sởi, Quai bị, Rubella', ageWeeks: 72, type: 'dv', brands: ['MMR II', 'Priorix'] },
  { id: 'dpt-booster', name: 'DPT nhắc lại', disease: 'Bạch hầu, Ho gà, Uốn ván', ageWeeks: 72, type: 'tcmr', brands: ['Adacel', 'Boostrix'] },
];

export type VaccineStatus = 'done' | 'overdue' | 'soon' | 'upcoming';

export function getAgeLabel(weeks: number) {
  const labels: Record<number, string> = {
    0: 'Sơ sinh',
    8: '2 tháng',
    12: '3 tháng',
    16: '4 tháng',
    24: '6 tháng',
    36: '9 tháng',
    48: '12 tháng',
    72: '18 tháng',
  };

  return labels[weeks] ?? `${weeks} tuần`;
}

export function formatPlannedDate(birthDate: string, ageWeeks: number) {
  return format(addWeeks(new Date(birthDate), ageWeeks), 'dd/MM/yyyy');
}

export function getVaccineStatus(birthDate: string, vaccine: VaccineMeta, record?: VaccineRecord): VaccineStatus {
  if (record?.vacc_date) {
    return 'done';
  }

  const plannedDate = startOfDay(addWeeks(new Date(birthDate), vaccine.ageWeeks));
  const today = startOfDay(new Date());
  const daysUntil = differenceInCalendarDays(plannedDate, today);

  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 7) return 'soon';
  return 'upcoming';
}

export function getStatusColor(status: VaccineStatus) {
  switch (status) {
    case 'done':
      return { text: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' };
    case 'overdue':
      return { text: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-200' };
    case 'soon':
      return { text: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' };
    default:
      return { text: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' };
  }
}

export function getStatusLabel(status: VaccineStatus) {
  switch (status) {
    case 'done':
      return 'Đã tiêm';
    case 'overdue':
      return 'Quá hạn';
    case 'soon':
      return 'Sắp đến';
    default:
      return 'Lịch tiếp theo';
  }
}

export function groupVaccinesByAge(vaccines: VaccineMeta[]) {
  const groups = new Map<number, VaccineMeta[]>();
  vaccines.forEach((vaccine) => {
    const set = groups.get(vaccine.ageWeeks) ?? [];
    set.push(vaccine);
    groups.set(vaccine.ageWeeks, set);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => a - b)
    .map(([ageWeeks, items]) => ({ ageWeeks, ageLabel: getAgeLabel(ageWeeks), vaccines: items }));
}
