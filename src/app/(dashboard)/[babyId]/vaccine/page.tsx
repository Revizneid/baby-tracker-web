'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Syringe } from 'lucide-react';

interface PageProps {
  params: Promise<{ babyId: string }>;
}

export default function VaccinePlaceholderPage({ params }: PageProps) {
  const { babyId } = use(params);
  const router = useRouter();

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto text-center font-sans space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto">
        <Syringe className="w-8 h-8 text-teal-600" />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Sổ tiêm chủng (27 mũi TCMR)</h1>
        <p className="text-sm text-gray-400 mt-2 font-medium">
          Quản lý lịch tiêm phòng dịch vụ & TCMR, tính toán ngày tiêm dự kiến và cảnh báo mũi trễ.
        </p>
      </div>
      <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100/30 text-xs text-teal-800 font-bold leading-relaxed">
        🚀 Tính năng này đang được thiết lập và sẽ sẵn sàng trong Sprint tiếp theo!
      </div>
      <button
        onClick={() => router.push(`/${babyId}`)}
        className="inline-flex items-center gap-2 text-sm font-bold text-[#1D9E75] hover:text-[#157a5a] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại tổng quan
      </button>
    </div>
  );
}
