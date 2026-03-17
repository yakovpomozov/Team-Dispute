import { format } from 'date-fns'
import AlertBadge from '../components/AlertBadge'
import RevenueGoalBar from '../components/RevenueGoalBar'
import TotalsSection from '../components/TotalsSection'
import Leaderboard from '../components/Leaderboard'
import { ClipboardList } from 'lucide-react'

export default function Dashboard({
  dailyTotals, weeklyTotals, monthlyTotals,
  monthlyRevenue, revenueGoalPct,
  repLeaderboard, settings,
  todayEntries, setActiveView,
}) {
  const todayCloses = dailyTotals.closes

  // Revenue using effectiveRevenue sum
  const weeklyRevenue  = weeklyTotals.closes * settings.pricePerClose
  const dailyRevenue   = todayEntries.reduce((s, e) =>
    s + (e.revenueFromApi ? e.revenueCollected : (e.closes || 0) * settings.pricePerClose), 0)

  return (
    <div className="space-y-6">
      {/* Date header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400 text-sm">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <button
          onClick={() => setActiveView('entry')}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <ClipboardList size={14} />
          Log Today's KPIs
        </button>
      </div>

      {/* Achievement alert */}
      {todayCloses >= 2 && <AlertBadge closes={todayCloses} />}

      {/* Monthly goal */}
      <RevenueGoalBar
        current={monthlyRevenue}
        goal={settings.monthlyRevenueGoal}
        pct={revenueGoalPct}
      />

      {/* Daily totals */}
      <TotalsSection
        title="Today"
        totals={dailyTotals}
        pricePerClose={settings.pricePerClose}
        revenue={dailyRevenue}
      />

      {/* Weekly totals */}
      <TotalsSection
        title="This Week"
        totals={weeklyTotals}
        pricePerClose={settings.pricePerClose}
        revenue={weeklyRevenue}
      />

      {/* Monthly totals */}
      <TotalsSection
        title="This Month"
        totals={monthlyTotals}
        pricePerClose={settings.pricePerClose}
        revenue={monthlyRevenue}
      />

      {/* Leaderboard */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Monthly Leaderboard
        </h3>
        <Leaderboard repLeaderboard={repLeaderboard} />
      </div>
    </div>
  )
}
