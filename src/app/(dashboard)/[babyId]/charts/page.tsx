'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3 } from 'lucide-react';

interface PageProps {
  params: Promise<{ babyId: string }>;
}

export default function ChartsPlaceholderPage({ params }: PageProps) {
  const { babyId } = use(params);
  const router = useRouter();

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto text-center font-sans space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
        <BarChart3 className="w-8 h-8 text-rose-600" />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Thống kê & Biểu đồ</h1>
        <p className="text-sm text-gray-400 mt-2 font-medium">
          Xem phân tích trực quan về xu hướng ăn uống, giấc ngủ, lượng sữa mẹ vắt và biểu đồ phát triển thể chất.
        </p>
      </div>
      <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/30 text-xs text-rose-800 font-bold leading-relaxed">
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
