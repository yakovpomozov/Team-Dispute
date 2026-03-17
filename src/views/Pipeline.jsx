import { useState, useEffect, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import {
  RefreshCw, AlertCircle, Users, Phone, MessageSquare, Calendar,
  ChevronRight, WifiOff, Clock,
} from 'lucide-react'
import axios from 'axios'

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

const STAGE_COLORS = [
  'bg-blue-600',
  'bg-indigo-600',
  'bg-purple-600',
  'bg-fuchsia-600',
  'bg-pink-600',
  'bg-rose-600',
  'bg-orange-600',
  'bg-amber-600',
  'bg-yellow-600',
  'bg-lime-600',
  'bg-green-600',
  'bg-teal-600',
]

function ManualFallback({ manual, setManual }) {
  const set = (k, v) => {
    const updated = { ...manual, [k]: v }
    setManual(updated)
    localStorage.setItem('td_pipeline_manual', JSON.stringify(updated))
  }

  return (
    <div className="card rounded-xl border border-yellow-800/30 bg-yellow-900/10 p-5 space-y-4">
      <div className="flex items-center gap-2 text-yellow-400">
        <WifiOff size={16} />
        <span className="text-sm font-semibold">Manual Input (API unavailable)</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">Ken's Calls</label>
          <input
            type="number"
            min="0"
            className="input w-full"
            value={manual.calls ?? ''}
            onChange={e => set('calls', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">Ken's Texts</label>
          <input
            type="number"
            min="0"
            className="input w-full"
            value={manual.texts ?? ''}
            onChange={e => set('texts', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">Appointments</label>
          <input
            type="number"
            min="0"
            className="input w-full"
            value={manual.appointments ?? ''}
            onChange={e => set('appointments', Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  )
}

export default function Pipeline({ settings }) {
  const [pipelines, setPipelines] = useState([])
  const [ghlStats, setGhlStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000)
  const [manual, setManual] = useState(() => {
    try { return JSON.parse(localStorage.getItem('td_pipeline_manual') || '{}') }
    catch { return {} }
  })

  const timerRef = useRef(null)
  const countRef = useRef(null)

  const ghlKey = settings.ghlApiKey || ''

  const fetchData = useCallback(async () => {
    setLoading(true)
    setApiError(null)

    const [pipelineRes, statsRes] = await Promise.allSettled([
      axios.get('/api/ghl/pipelines', {
        headers: ghlKey ? { 'x-ghl-key': ghlKey } : {},
      }),
      axios.get('/api/ghl/dashboard', {
        headers: ghlKey ? { 'x-ghl-key': ghlKey } : {},
        params: {
          kenUserId: settings.kenUserId || '',
          yashaUserId: settings.yashaUserId || '',
        },
      }),
    ])

    if (pipelineRes.status === 'fulfilled') {
      setPipelines(pipelineRes.value.data.pipelines || [])
    } else {
      setApiError(pipelineRes.reason?.response?.data?.error || pipelineRes.reason?.message || 'GHL API error')
      setPipelines([])
    }

    if (statsRes.status === 'fulfilled') {
      setGhlStats(statsRes.value.data)
    }

    setLoading(false)
    setLastUpdated(new Date())
    setCountdown(REFRESH_INTERVAL / 1000)
  }, [ghlKey, settings.kenUserId, settings.yashaUserId])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchData()

    timerRef.current = setInterval(fetchData, REFRESH_INTERVAL)
    countRef.current = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? REFRESH_INTERVAL / 1000 : prev - 1))
    }, 1000)

    return () => {
      clearInterval(timerRef.current)
      clearInterval(countRef.current)
    }
  }, [fetchData])

  const calls = ghlStats?.calls ?? manual.calls ?? null
  const texts = ghlStats?.texts ?? manual.texts ?? null
  const appointments = ghlStats?.appointments ?? manual.appointments ?? null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Pipeline</h2>
          <p className="text-gray-400 text-sm">
            {lastUpdated ? `Updated ${format(lastUpdated, 'h:mm a')}` : 'Loading…'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Clock size={12} />
            <span>Refresh in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
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
      </div>

      {/* Ken's daily stats */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Ken's Activity Today
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Calls', value: calls, icon: Phone, color: 'text-blue-400' },
            { label: 'Texts', value: texts, icon: MessageSquare, color: 'text-indigo-400' },
            { label: 'Appointments', value: appointments, icon: Calendar, color: 'text-purple-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card rounded-xl border border-gray-800 p-4 text-center">
              <Icon size={18} className={`${color} mx-auto mb-2`} />
              {loading
                ? <div className="h-7 w-8 bg-gray-800 rounded animate-pulse mx-auto" />
                : <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
              }
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Manual fallback if API fails */}
      {apiError && (
        <>
          <div className="flex items-start gap-3 bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-red-400 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>GHL API error: {apiError}</span>
          </div>
          <ManualFallback manual={manual} setManual={setManual} />
        </>
      )}

      {/* Pipelines */}
      {!apiError && !loading && pipelines.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users size={32} className="mx-auto mb-3 opacity-30" />
          <p>No pipelines found. Check your GHL API key in Settings.</p>
        </div>
      )}

      {pipelines.map((pipeline, pi) => (
        <div key={pipeline.id} className="space-y-3">
          <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
            <ChevronRight size={14} className="text-indigo-400" />
            {pipeline.name}
          </h3>
          <div className="space-y-2">
            {(pipeline.stages || []).map((stage, si) => {
              const color = STAGE_COLORS[si % STAGE_COLORS.length]
              const count = stage.contactCount || 0
              const maxCount = Math.max(...(pipeline.stages || []).map(s => s.contactCount || 0), 1)
              const barPct = Math.round((count / maxCount) * 100)

              return (
                <div
                  key={stage.id}
                  className="card rounded-xl border border-gray-800 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                      <span className="text-sm text-gray-200 font-medium truncate">{stage.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Users size={13} className="text-gray-500" />
                      {loading
                        ? <div className="h-4 w-6 bg-gray-800 rounded animate-pulse" />
                        : <span className="text-sm font-bold text-white">{count}</span>
                      }
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color}`}
                      style={{ width: loading ? '0%' : `${barPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {loading && pipelines.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="card rounded-xl border border-gray-800 p-4 animate-pulse">
              <div className="flex justify-between mb-2">
                <div className="h-4 w-32 bg-gray-800 rounded" />
                <div className="h-4 w-6 bg-gray-800 rounded" />
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
