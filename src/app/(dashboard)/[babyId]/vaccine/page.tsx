'use client';

import { useEffect, useMemo, useState, use } from 'react';
import { babyService } from '@/lib/services/babyService';
import { useBabyStore } from '@/store/useBabyStore';
import { VaccineRecord } from '@/types/database';
import { VACCINES, formatPlannedDate, getVaccineStatus, groupVaccinesByAge, VaccineStatus } from '@/lib/data/vaccines';
import VaccineProgress from '@/components/vaccine/VaccineProgress';
import VaccineFilterTabs from '@/components/vaccine/VaccineFilterTabs';
import VaccineGroupSection from '@/components/vaccine/VaccineGroupSection';
import VaccineSheet from '@/components/vaccine/VaccineSheet';
import SkeletonCard from '@/components/ui/SkeletonCard';

interface PageProps {
  params: Promise<{ babyId: string }>;
}

export default function VaccinePage({ params }: PageProps) {
  const { babyId } = use(params);
  const { babies, currentBaby, setCurrentBaby, fetchBabies } = useBabyStore();
  const [records, setRecords] = useState<VaccineRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'done'>('all');
  const [selectedVaccine, setSelectedVaccine] = useState<typeof VACCINES[number] | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [toast, setToast] = useState('');

  const pageBaby = useMemo(() => {
    if (currentBaby?.id === babyId) return currentBaby;
    return babies.find((baby) => baby.id === babyId) ?? null;
  }, [babyId, babies, currentBaby]);

  useEffect(() => {
    if (!pageBaby && babies.length === 0) {
      fetchBabies();
    }

    if (pageBaby && currentBaby?.id !== pageBaby.id) {
      setCurrentBaby(pageBaby);
    }
  }, [pageBaby, babies.length, currentBaby, fetchBabies, setCurrentBaby]);

  useEffect(() => {
    const load = async () => {
      if (!babyId) return;
      setLoadingRecords(true);
      try {
        const data = await babyService.getVaccineRecords(babyId);
        setRecords(data ?? []);
      } catch (error: any) {
        setToast(error?.message ?? 'Không thể tải dữ liệu tiêm chủng.');
      } finally {
        setLoadingRecords(false);
      }
    };

    load();
  }, [babyId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const recordMap = useMemo<Record<string, VaccineRecord>>(() => {
    return records.reduce((acc, record) => {
      if (!acc[record.vaccine_id]) {
        acc[record.vaccine_id] = record;
      }
      return acc;
    }, {} as Record<string, VaccineRecord>);
  }, [records]);

  const doneCount = Object.keys(recordMap).length;
  const tcmrCount = Object.values(recordMap).filter((record) => VACCINES.find((v) => v.id === record.vaccine_id)?.type === 'tcmr').length;
  const dvCount = Object.values(recordMap).filter((record) => VACCINES.find((v) => v.id === record.vaccine_id)?.type === 'dv').length;

  const groups = useMemo(() => groupVaccinesByAge(VACCINES), []);

  const filteredGroups = useMemo(() => {
    if (!pageBaby) return [];

    return groups
      .map((group) => {
        const visibleVaccines = group.vaccines.filter((vaccine) => {
          const record = recordMap[vaccine.id];
          const status = getVaccineStatus(pageBaby.birth_date, vaccine, record);
          if (activeTab === 'all') return true;
          if (activeTab === 'done') return status === 'done';
          return status !== 'done';
        });

        return {
          ...group,
          visibleVaccines,
          completedCount: group.vaccines.filter((vaccine) => getVaccineStatus(pageBaby.birth_date, vaccine, recordMap[vaccine.id]) === 'done').length,
          plannedDateLabel: formatPlannedDate(pageBaby.birth_date, group.ageWeeks),
          statusMap: group.vaccines.reduce((acc, vaccine) => {
            acc[vaccine.id] = getVaccineStatus(pageBaby.birth_date, vaccine, recordMap[vaccine.id]);
            return acc;
          }, {} as Record<string, VaccineStatus>),
        };
      })
      .filter((group) => group.visibleVaccines.length > 0);
  }, [activeTab, groups, pageBaby, recordMap]);

  const totalCount = VACCINES.length;

  const handleSelectVaccine = (vaccine: typeof VACCINES[number]) => {
    setSelectedVaccine(vaccine);
    setIsSheetOpen(true);
  };

  const handleSaveRecord = async (payload: {
    id?: string;
    baby_id: string;
    vaccine_id: string;
    vacc_date: string;
    brand: string;
    note: string;
  }) => {
    try {
      const saved = await babyService.upsertVaccineRecord(payload);
      setRecords((current) => {
        const other = current.filter((item) => item.vaccine_id !== saved.vaccine_id);
        return [saved, ...other];
      });
      setToast('Đã lưu mũi tiêm thành công.');
    } catch (error: any) {
      setToast(error?.message ?? 'Lưu mũi tiêm thất bại.');
      throw error;
    }
  };

  const handleDeleteRecord = async (id: string) => {
    await babyService.deleteVaccineRecord(id);
    setRecords((current) => current.filter((record) => record.id !== id));
    setToast('Đã bỏ đánh dấu tiêm.');
  };

  useEffect(() => {
    if (loadingRecords || !pageBaby) return;
    const overdueSection = document.querySelector('[data-vaccine-overdue]');
    overdueSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loadingRecords, pageBaby, filteredGroups]);

  if (!pageBaby) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-3xl space-y-5">
          <SkeletonCard type="summary" count={1} />
          <SkeletonCard count={2} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute -top-6 -right-8 w-32 h-32 rounded-full bg-[#1D9E75]/10 blur-2xl" />
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Tiêm chủng</p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Sổ tiêm chủng của {pageBaby.name}</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Theo dõi 27 mũi TCMR và dịch vụ. Hệ thống sẽ cảnh báo mũi quá hạn, sắp đến và cập nhật trạng thái ngay khi bạn lưu.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <VaccineProgress
          doneCount={doneCount}
          totalCount={totalCount}
          tcmrCount={tcmrCount}
          dvCount={dvCount}
        />

        <div className="space-y-4">
          <VaccineFilterTabs activeTab={activeTab} onChange={setActiveTab} />
          <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Thông tin bé</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ngày sinh</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{new Date(pageBaby.birth_date).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Giới tính</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{pageBaby.gender === 'male' ? 'Bé trai' : pageBaby.gender === 'female' ? 'Bé gái' : 'Chưa rõ'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loadingRecords ? (
        <div className="space-y-5">
          <SkeletonCard type="card" count={2} />
          <SkeletonCard type="card" count={1} />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
          <p className="text-lg font-semibold text-slate-900">Chưa có mũi tiêm phù hợp</p>
          <p className="mt-2 text-sm">Thử chọn lại bộ lọc hoặc kiểm tra lại thông tin em bé.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group, index) => {
            const isFirstOverdue = index === 0 && group.visibleVaccines.some((vaccine) => getVaccineStatus(pageBaby.birth_date, vaccine, recordMap[vaccine.id]) === 'overdue');

            return (
              <div key={group.ageWeeks} data-vaccine-overdue={isFirstOverdue ? 'true' : undefined}>
                <VaccineGroupSection
                  ageLabel={group.ageLabel}
                  plannedDateLabel={group.plannedDateLabel}
                  completedCount={group.completedCount}
                  totalCount={group.vaccines.length}
                  vaccines={group.visibleVaccines}
                  recordMap={recordMap}
                  statusMap={group.statusMap}
                  onSelect={handleSelectVaccine}
                />
              </div>
            );
          })}
        </div>
      )}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-3xl bg-[#1D9E75] px-6 py-3 text-sm font-semibold text-white shadow-2xl shadow-slate-900/10">
          {toast}
        </div>
      ) : null}

      <VaccineSheet
        vaccine={selectedVaccine}
        record={selectedVaccine ? recordMap[selectedVaccine.id] : undefined}
        babyBirthDate={pageBaby.birth_date}
        babyId={babyId}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSave={handleSaveRecord}
        onDelete={handleDeleteRecord}
      />
    </div>
  );
}
