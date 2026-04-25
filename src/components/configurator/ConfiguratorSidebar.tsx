interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "stages", label: "Stages", icon: "🎪" },
  { id: "artists", label: "Lineup", icon: "🎤" },
  { id: "vendors", label: "Vendors", icon: "🍔" },
  { id: "toilets", label: "Toilets", icon: "🚽" },
  { id: "security", label: "Security", icon: "👮" },
  { id: "amenities", label: "Amenities", icon: "🏕️" },
];

export function ConfiguratorSidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-48 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Configure</h2>
      <nav className="space-y-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
