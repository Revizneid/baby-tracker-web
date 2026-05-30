interface ActivityToastProps {
  message: string;
  visible: boolean;
}

export default function ActivityToast({ message, visible }: ActivityToastProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed top-5 right-5 z-50 max-w-sm rounded-3xl border border-emerald-200 bg-white/95 px-4 py-3 shadow-xl shadow-slate-900/10 backdrop-blur-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Thông báo hoạt động</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{message}</p>
    </div>
  );
}
