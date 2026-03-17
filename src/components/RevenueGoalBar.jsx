import { Target } from 'lucide-react'

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function RevenueGoalBar({ current, goal, pct }) {
  const remaining = Math.max(0, goal - current)
  const over      = current > goal

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-indigo-400" />
          <span className="text-sm font-semibold text-gray-200">Monthly Revenue Goal</span>
        </div>
        <span className={`text-xs font-bold ${over ? 'text-green-400' : 'text-gray-400'}`}>
          {over ? `+${fmt(current - goal)} over goal!` : `${fmt(remaining)} remaining`}
        </span>
      </div>

      {/* Bar */}
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            over ? 'bg-green-500' : Number(pct) >= 75 ? 'bg-indigo-500' : Number(pct) >= 50 ? 'bg-indigo-600' : 'bg-indigo-700'
          }`}
          style={{ width: `${Math.min(100, Number(pct))}%` }}
        />
      </div>

      <div className="flex justify-between items-end">
        <span className="text-white font-bold text-lg">{fmt(current)}</span>
        <span className="text-gray-500 text-sm">Goal: {fmt(goal)}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">{pct}% of monthly goal</p>
    </div>
  )
}
