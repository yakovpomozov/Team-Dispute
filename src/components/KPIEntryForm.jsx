import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { emptyEntry } from '../store/useStore'
import { syncGHLForDate } from '../api/ghl'
import { syncAuthorizeNetForDate } from '../api/authorizenet'

const FIELDS = [
  { key: 'callsMade',       label: 'Calls Made',        min: 0 },
  { key: 'textsSent',       label: 'Texts Sent',        min: 0 },
  { key: 'leadsContacted',  label: 'Leads Contacted',   min: 0 },
  { key: 'appointmentsSet', label: 'Appointments Set',  min: 0 },
  { key: 'closes',          label: 'Closes (Sales)',     min: 0 },
  { key: 'noShows',         label: 'No Shows',          min: 0 },
]

export default function KPIEntryForm({ settings, addEntry, todayEntries, onSaved }) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const defaultRep = settings.reps[0] || ''

  const [form, setForm]       = useState({ ...emptyEntry(defaultRep), date: todayStr })
  const [rep, setRep]         = useState(defaultRep)
  const [syncing, setSyncing] = useState(false)
  const [saved, setSaved]     = useState(false)
  const [apiNotes, setApiNotes] = useState([])

  // Pre-fill from existing entry for selected rep/date
  useEffect(() => {
    const existing = todayEntries.find(e => e.rep === rep && e.date === form.date)
    if (existing) {
      setForm({ ...existing })
    } else {
      setForm({ ...emptyEntry(rep), date: form.date })
    }
    setApiNotes([])
  }, [rep, form.date]) // eslint-disable-line

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val === '' ? '' : Number(val) }))

  const closeRate = form.leadsContacted > 0
    ? ((form.closes / form.leadsContacted) * 100).toFixed(1) + '%'
    : '—'

  const calcRevenue = !form.revenueFromApi
    ? form.closes * settings.pricePerClose
    : form.revenueCollected

  // Pull from integrations
  const handleSync = async () => {
    setSyncing(true)
    setApiNotes([])
    const notes = []

    const [ghlResult, anResult] = await Promise.all([
      syncGHLForDate(settings, form.date),
      syncAuthorizeNetForDate(settings, form.date),
    ])

    let patch = {}
    if (Object.keys(ghlResult.patch).length > 0) {
      patch = { ...patch, ...ghlResult.patch }
      notes.push({ type: 'success', msg: `GHL: synced leads, appointments, closes` })
    } else {
      notes.push({ type: 'warn', msg: `GHL: not connected — enter API key in Settings` })
    }

    if (Object.keys(anResult.patch).length > 0) {
      patch = { ...patch, ...anResult.patch }
      notes.push({ type: 'success', msg: `Authorize.net: synced revenue (${anResult.transactionCount} transactions)` })
    } else {
      notes.push({ type: 'warn', msg: `Authorize.net: not connected — enter API key in Settings` })
    }

    setForm(prev => ({ ...prev, ...patch }))
    setApiNotes(notes)
    setSyncing(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const entry = {
      ...form,
      rep,
      revenueCollected: form.revenueFromApi ? form.revenueCollected : calcRevenue,
    }
    addEntry(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    if (onSaved) onSaved()
  }

  return (
    <div className="card max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white">Log Daily KPIs</h2>
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="btn-secondary flex items-center gap-2 text-sm py-1.5"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing…' : 'Sync APIs'}
        </button>
      </div>

      {/* API notes */}
      {apiNotes.length > 0 && (
        <div className="mb-4 space-y-1">
          {apiNotes.map((n, i) => (
            <div key={i} className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg ${
              n.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
            }`}>
              {n.type === 'success'
                ? <CheckCircle2 size={12} className="mt-0.5 shrink-0" />
                : <AlertCircle  size={12} className="mt-0.5 shrink-0" />}
              {n.msg}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date + Rep */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
              max={todayStr}
            />
          </div>
          <div>
            <label className="label">Rep</label>
            <select
              className="input"
              value={rep}
              onChange={e => setRep(e.target.value)}
            >
              {settings.reps.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* KPI fields */}
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form[key] === 0 ? '' : form[key]}
                placeholder="0"
                onChange={e => set(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Revenue */}
        <div>
          <label className="label flex items-center gap-2">
            Revenue Collected
            {form.revenueFromApi && (
              <span className="badge bg-green-900/50 text-green-400 border border-green-700/40 normal-case tracking-normal font-normal">
                from Authorize.net
              </span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input pl-7"
              value={form.revenueFromApi ? form.revenueCollected : calcRevenue}
              readOnly={!form.revenueFromApi}
              onChange={e => form.revenueFromApi && setForm(prev => ({ ...prev, revenueCollected: Number(e.target.value) }))}
            />
          </div>
          {!form.revenueFromApi && (
            <p className="text-xs text-gray-500 mt-1">
              Auto: {form.closes} close{form.closes !== 1 ? 's' : ''} × ${settings.pricePerClose.toLocaleString()} = ${calcRevenue.toLocaleString()}
            </p>
          )}
        </div>

        {/* Live stats preview */}
        <div className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between text-sm">
          <span className="text-gray-400">Close Rate</span>
          <span className="text-white font-bold">{closeRate}</span>
        </div>

        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {saved
            ? <><CheckCircle2 size={16} /> Saved!</>
            : <><Save size={16} /> Save KPIs</>}
        </button>
      </form>
    </div>
  )
}
