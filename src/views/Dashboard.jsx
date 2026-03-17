import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import {
  TrendingUp, Phone, MessageSquare, Calendar, Target,
  RefreshCw, AlertCircle, Trophy, Zap, DollarSign,
} from 'lucide-react'
import axios from 'axios'

const GOAL = 100000

function fmt$(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function StatCard({ label, value, sub, icon: Icon, color = 'indigo', loading }) {
  const colors = {
    indigo: 'text-indigo-400 bg-indigo-900/20 border-indigo-800/30',
    green:  'text-green-400  bg-green-900/20  border-green-800/30',
    blue:   'text-blue-400   bg-blue-900/20   border-blue-800/30',
    purple: 'text-purple-400 bg-purple-900/20 border-purple-800/30',
    amber:  'text-amber-400  bg-amber-900/20  border-amber-800/30',
  }
  return (
    <div className={`card rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        <Icon size={16} className={colors[color].split(' ')[0]} />
      </div>
      {loading
        ? <div className="h-8 w-16 bg-gray-800 rounded animate-pulse" />
        : <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      }
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function Badge({ type }) {
  if (type === 'hatTrick') return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-amber-900/40 to-yellow-900/20 border border-amber-600/40 rounded-xl p-4">
      <div className="text-3xl">🎩</div>
      <div>
        <p className="text-amber-400 font-bold text-sm">Hat Trick!</p>
        <p className="text-gray-400 text-xs">3 deals closed today — incredible work, Yasha!</p>
      </div>
      <Trophy size={20} className="ml-auto text-amber-400" />
    </div>
  )
  if (type === 'grandSlam') return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-purple-900/40 to-indigo-900/20 border border-purple-600/40 rounded-xl p-4">
      <div className="text-3xl">🏆</div>
      <div>
        <p className="text-purple-400 font-bold text-sm">Grand Slam!</p>
        <p className="text-gray-400 text-xs">4+ deals closed today — absolute legend, Yasha!</p>
      </div>
      <Zap size={20} className="ml-auto text-purple-400" />
    </div>
  )
  return null
}

export default function Dashboard({ settings }) {
  const [revenue, setRevenue] = useState(null)
  const [ghl, setGhl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const ghlKey = settings.ghlApiKey || import.meta.env.VITE_GHL_API_KEY || ''
  const anetLoginId = settings.anetLoginId || import.meta.env.VITE_ANET_LOGIN || ''
  const anetTransKey = settings.anetTransKey || import.meta.env.VITE_ANET_KEY || ''
  const anetEnv = settings.anetEnv || 'production'

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const results = await Promise.allSettled([
      // Authorize.net revenue
      axios.post('/api/anet/transactions', {
        loginId: anetLoginId,
        transactionKey: anetTransKey,
        env: anetEnv,
      }),
      // GHL dashboard metrics
      axios.get('/api/ghl/dashboard', {
        headers: ghlKey ? { 'x-ghl-key': ghlKey } : {},
        params: {
          kenUserId: settings.kenUserId || '',
          yashaUserId: settings.yashaUserId || '',
        },
      }),
    ])

    if (results[0].status === 'fulfilled') {
      setRevenue(results[0].value.data)
    }
    if (results[1].status === 'fulfilled') {
      setGhl(results[1].value.data)
    }

    const anyError = results.every(r => r.status === 'rejected')
    if (anyError) {
      setError('Could not reach APIs. Check your settings and ensure the server is running.')
    }

    setLoading(false)
    setLastUpdated(new Date())
  }, [ghlKey, anetLoginId, anetTransKey, anetEnv, settings.kenUserId, settings.yashaUserId])

  useEffect(() => { fetchData() }, [fetchData])

  const monthRevenue = revenue?.monthTotal ?? null
  const todayRevenue = revenue?.todayTotal ?? null
  const weekRevenue = revenue?.weekTotal ?? null
  const goalPct = monthRevenue != null ? Math.min(100, (monthRevenue / GOAL) * 100) : 0

  const closes = ghl?.closes ?? null
  const appointments = ghl?.appointments ?? null
  const closeRate = closes != null && appointments
    ? Math.round((closes / appointments) * 100)
    : null

  const badge = closes >= 4 ? 'grandSlam' : closes === 3 ? 'hatTrick' : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400 text-sm">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          {lastUpdated && (
            <p className="text-gray-600 text-xs mt-0.5">
              Updated {format(lastUpdated, 'h:mm a')}
            </p>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-red-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Badge */}
      {badge && <Badge type={badge} />}

      {/* Monthly goal progress */}
      <div className="card rounded-xl border border-gray-800 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-gray-200">Monthly Revenue Goal</span>
          </div>
          <span className="text-sm font-bold text-white">
            {fmt$(monthRevenue)} <span className="text-gray-500 font-normal">/ {fmt$(GOAL)}</span>
          </span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-600 to-indigo-400"
            style={{ width: loading ? '0%' : `${goalPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{goalPct.toFixed(1)}% of goal</span>
          <span>{fmt$(GOAL - (monthRevenue || 0))} remaining</span>
        </div>
      </div>

      {/* Revenue stats */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Revenue — Authorize.net
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Today" value={fmt$(todayRevenue)} icon={DollarSign} color="green" loading={loading} />
          <StatCard label="This Week" value={fmt$(weekRevenue)} icon={TrendingUp} color="blue" loading={loading} />
          <StatCard label="This Month" value={fmt$(monthRevenue)} icon={DollarSign} color="indigo" loading={loading} />
        </div>
      </div>

      {/* GHL stats */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Today's Activity — GoHighLevel
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Ken — Calls"
            value={ghl?.calls ?? '—'}
            icon={Phone}
            color="blue"
            loading={loading}
            sub="Outbound calls today"
          />
          <StatCard
            label="Ken — Texts"
            value={ghl?.texts ?? '—'}
            icon={MessageSquare}
            color="indigo"
            loading={loading}
            sub="SMS messages today"
          />
          <StatCard
            label="Ken — Appointments"
            value={appointments ?? '—'}
            icon={Calendar}
            color="purple"
            loading={loading}
            sub="Booked today"
          />
          <StatCard
            label="Yasha — Closes"
            value={closes ?? '—'}
            icon={Trophy}
            color="amber"
            loading={loading}
            sub="Won deals today"
          />
        </div>
      </div>

      {/* Close rate */}
      <div className="card rounded-xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-200">Close Rate</span>
          <span className="text-2xl font-bold text-white">
            {closeRate != null ? `${closeRate}%` : '—'}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Yasha's closes ÷ Ken's booked appointments
          {closes != null && appointments != null
            ? ` (${closes} / ${appointments})`
            : ''}
        </p>
        {closeRate != null && (
          <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700"
              style={{ width: `${Math.min(100, closeRate)}%` }}
            />
          </div>
        )}
      </div>

      {/* GHL API errors */}
      {ghl?.errors && Object.values(ghl.errors).some(Boolean) && (
        <div className="bg-yellow-900/10 border border-yellow-800/20 rounded-xl p-4 text-xs text-yellow-500 space-y-1">
          <p className="font-semibold mb-2">Partial GHL data — some endpoints failed:</p>
          {Object.entries(ghl.errors).map(([k, v]) => v && (
            <p key={k}>• {k}: {v}</p>
          ))}
          <p className="text-gray-500 mt-2">Configure Ken's and Yasha's User IDs in Settings for accurate filtering.</p>
        </div>
      )}
    </div>
  )
}
