import { LayoutDashboard, GitBranch, DollarSign, Settings } from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline',  label: 'Pipeline',  icon: GitBranch       },
  { id: 'revenue',   label: 'Revenue',   icon: DollarSign      },
  { id: 'settings',  label: 'Settings',  icon: Settings        },
]

export default function Layout({ activeView, setActiveView, children }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">

      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-800 bg-gray-950 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <span className="text-white font-black text-sm">TD</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Team Dispute</p>
              <p className="text-gray-500 text-[11px]">Credit Repair CRM</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeView === id
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800 border border-transparent'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-gray-800">
          <p className="text-gray-600 text-[10px]">v2.0 · Live Data</p>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">TD</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Team Dispute</p>
              <p className="text-gray-500 text-[10px]">Credit Repair CRM</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
            {NAV.find(n => n.id === activeView)?.label}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 md:px-6 py-6 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-gray-950/95 backdrop-blur border-t border-gray-800 flex justify-around py-1.5">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeView === id ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
