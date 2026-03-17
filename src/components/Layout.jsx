import { LayoutDashboard, ClipboardList, Trophy, Settings, TrendingUp } from 'lucide-react'

const NAV = [
  { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'entry',       label: 'Log KPIs',    icon: ClipboardList   },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy          },
  { id: 'history',     label: 'History',     icon: TrendingUp      },
  { id: 'settings',    label: 'Settings',    icon: Settings        },
]

export default function Layout({ activeView, setActiveView, children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">TD</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Team Dispute</h1>
            <p className="text-gray-500 text-xs">Credit Repair KPI Tracker</p>
          </div>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeView === id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 max-w-6xl mx-auto w-full pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur border-t border-gray-800 flex justify-around py-2 z-20">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
              activeView === id ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={18} />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
