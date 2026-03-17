import { Trophy, Star, Zap } from 'lucide-react'

export default function AlertBadge({ closes }) {
  if (closes >= 4) {
    return (
      <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/40 rounded-xl px-4 py-3 animate-pulse">
        <Trophy size={20} className="text-yellow-400" />
        <div>
          <p className="text-yellow-300 font-bold text-sm">GRAND SLAM! 🏆</p>
          <p className="text-yellow-500 text-xs">{closes} closes today — absolute legend</p>
        </div>
      </div>
    )
  }
  if (closes === 3) {
    return (
      <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/40 rounded-xl px-4 py-3">
        <Star size={20} className="text-purple-400" />
        <div>
          <p className="text-purple-300 font-bold text-sm">HAT TRICK! ⭐</p>
          <p className="text-purple-500 text-xs">3 closes in a day — crushing it!</p>
        </div>
      </div>
    )
  }
  if (closes === 2) {
    return (
      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/40 rounded-xl px-4 py-3">
        <Zap size={20} className="text-green-400" />
        <div>
          <p className="text-green-300 font-bold text-sm">Double Close! ⚡</p>
          <p className="text-green-500 text-xs">2 closes — one more for the Hat Trick!</p>
        </div>
      </div>
    )
  }
  return null
}
