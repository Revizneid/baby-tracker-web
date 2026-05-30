export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F5] text-slate-600">
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 rounded-full border-4 border-[#1D9E75]/20 border-t-[#1D9E75] animate-spin" />
        <p className="text-sm font-semibold">Đang tải giao diện dashboard...</p>
      </div>
    </div>
  );
}
