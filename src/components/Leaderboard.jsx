import { Trophy, Medal, Award } from 'lucide-react'

function fmt$(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const RANKS = [
  { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  { icon: Medal,  color: 'text-gray-300',   bg: 'bg-gray-700/30 border-gray-600/30'    },
  { icon: Award,  color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30'},
]

export default function Leaderboard({ repLeaderboard }) {
  if (!repLeaderboard.length) {
    return <p className="text-gray-500 text-sm text-center py-6">No rep data yet.</p>
  }

  return (
    <div className="space-y-3">
      {repLeaderboard.map((rep, idx) => {
        const rank = RANKS[idx] || { icon: Award, color: 'text-gray-500', bg: 'bg-gray-800/30 border-gray-700/30' }
        const Icon = rank.icon
        return (
          <div key={rep.rep} className={`card border ${rank.bg} flex items-center gap-4`}>
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800/50">
              <Icon size={18} className={rank.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-sm truncate">{rep.rep}</span>
                <span className="text-green-400 font-bold text-sm ml-2">{fmt$(rep.revenue)}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                <span><span className="text-white font-semibold">{rep.closes}</span> closes</span>
                <span><span className="text-white font-semibold">{rep.leadsContacted}</span> leads</span>
                <span><span className="text-white font-semibold">{rep.closeRate}%</span> close rate</span>
                <span><span className="text-white font-semibold">{rep.appointmentsSet}</span> appts</span>
                <span><span className="text-white font-semibold">{rep.callsMade}</span> calls</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
