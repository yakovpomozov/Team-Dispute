import { useState } from 'react'
import { startOfMonth, startOfWeek, subMonths, format } from 'date-fns'
import KPITable from '../components/KPITable'
import TotalsSection from '../components/TotalsSection'

const PERIODS = [
  { id: 'this_week',  label: 'This Week'  },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'all',        label: 'All Time'   },
]

export default function HistoryView({ entries, deleteEntry, settings, filterEntries, sumEntries }) {
  const [period, setPeriod]     = useState('this_month')
  const [repFilter, setRepFilter] = useState('all')

  const today     = format(new Date(), 'yyyy-MM-dd')
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const lastMonthStart = format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd')
  const lastMonthEnd   = format(new Date(startOfMonth(new Date()) - 1), 'yyyy-MM-dd')

  const periodEntries = {
    this_week:  filterEntries(weekStart, today),
    this_month: filterEntries(monthStart, today),
    last_month: filterEntries(lastMonthStart, lastMonthEnd),
    all:        [...entries],
  }[period] || []

  const filtered = repFilter === 'all'
    ? periodEntries
    : periodEntries.filter(e => e.rep === repFilter)

  const totals = sumEntries(filtered)
  const revenue = filtered.reduce((s, e) =>
    s + (e.revenueFromApi ? e.revenueCollected : (e.closes || 0) * settings.pricePerClose), 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">History</h2>
        <p className="text-gray-400 text-sm">All logged KPI entries</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <select
          className="input w-auto text-xs py-1.5 px-2"
          value={repFilter}
          onChange={e => setRepFilter(e.target.value)}
        >
          <option value="all">All Reps</option>
          {settings.reps.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Period totals */}
      <TotalsSection
        title={PERIODS.find(p => p.id === period)?.label || 'Period'}
        totals={totals}
        pricePerClose={settings.pricePerClose}
        revenue={revenue}
      />

      {/* Table */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">
          Entries ({filtered.length})
        </h3>
        <KPITable
          entries={filtered}
          deleteEntry={deleteEntry}
          pricePerClose={settings.pricePerClose}
        />
      </div>
    </div>
  )
}
