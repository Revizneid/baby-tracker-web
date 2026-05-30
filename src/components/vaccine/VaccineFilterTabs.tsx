interface VaccineFilterTabsProps {
  activeTab: 'all' | 'pending' | 'done';
  onChange: (tab: 'all' | 'pending' | 'done') => void;
}

const tabs = [
  { id: 'all', label: 'Tất cả', subtitle: '27' },
  { id: 'pending', label: 'Chưa tiêm', subtitle: 'Chưa tiêm' },
  { id: 'done', label: 'Đã tiêm', subtitle: 'Đã tiêm' },
] as const;

export default function VaccineFilterTabs({ activeTab, onChange }: VaccineFilterTabsProps) {
  return (
    <div className="bg-white p-2 rounded-3xl border border-gray-100 shadow-sm flex gap-2 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`min-w-[110px] flex-1 py-3 px-4 rounded-2xl text-left transition-all duration-200 text-sm font-semibold ${
            activeTab === tab.id
              ? 'bg-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/10'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>{tab.label}</span>
          <p className="text-xs text-slate-400 mt-1">{tab.subtitle}</p>
        </button>
      ))}
    </div>
  );
}
