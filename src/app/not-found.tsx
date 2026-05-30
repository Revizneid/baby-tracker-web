export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="max-w-xl w-full rounded-[32px] bg-white p-10 shadow-xl shadow-slate-900/5 text-center">
        <p className="text-5xl font-black text-slate-900">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Trang không tìm thấy</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Đường dẫn yêu cầu không tồn tại hoặc đã được di chuyển. Quay lại trang chủ để tiếp tục theo dõi hành trình bé yêu.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex rounded-2xl bg-[#1D9E75] px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          Về trang chủ
        </a>
      </div>
    </div>
  );
}
