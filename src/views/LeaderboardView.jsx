import Leaderboard from '../components/Leaderboard'
import { format } from 'date-fns'

function fmt$(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function LeaderboardView({ repLeaderboard, settings, monthlyRevenue, revenueGoalPct }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        <p className="text-gray-400 text-sm">{format(new Date(), 'MMMM yyyy')} — Monthly Rankings</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{repLeaderboard.reduce((s, r) => s + r.closes, 0)}</p>
          <p className="text-xs text-gray-400 mt-1">Total Closes</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-400">{fmt$(monthlyRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">Month Revenue</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-indigo-400">{revenueGoalPct}%</p>
          <p className="text-xs text-gray-400 mt-1">Goal Progress</p>
        </div>
      </div>

      <Leaderboard repLeaderboard={repLeaderboard} />

      {repLeaderboard.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-8">
          Add reps in Settings and log KPI entries to see the leaderboard.
        </p>
      )}
    </div>
  )
}
