'use client';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="max-w-xl w-full rounded-[32px] bg-white p-10 shadow-xl shadow-slate-900/5 text-center">
        <p className="text-5xl font-black text-slate-900">Có lỗi xảy ra</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Xin lỗi, không thể tải trang</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Có lỗi không mong muốn xảy ra. Vui lòng thử lại hoặc quay lại trang chủ.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex rounded-2xl bg-[#1D9E75] px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Tải lại
          </button>
          <a
            href="/"
            className="inline-flex rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Về trang chủ
          </a>
        </div>
        <pre className="mt-6 overflow-x-auto rounded-2xl bg-slate-100 p-4 text-left text-xs text-slate-500">
          {error.message}
        </pre>
      </div>
    </div>
  );
}
