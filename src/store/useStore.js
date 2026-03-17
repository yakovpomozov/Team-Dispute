import { useState, useEffect, useCallback } from 'react'
import { format, startOfWeek, startOfMonth, isWithinInterval, parseISO } from 'date-fns'

// ─── Default settings ────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  pricePerClose: 1500,
  monthlyRevenueGoal: 100000,
  reps: ['Ken'],
  // GHL integration
  ghlApiKey: '',
  ghlBaseUrl: 'https://rest.gohighlevel.com/v1',
  ghlEnabled: false,
  // Authorize.net integration
  authorizeNetApiLoginId: '',
  authorizeNetTransactionKey: '',
  authorizeNetSandbox: true,
  authorizeNetEnabled: false,
}

// ─── Default KPI entry ────────────────────────────────────────────────────────
export const emptyEntry = (rep = '') => ({
  id: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  rep,
  callsMade: 0,
  textsSent: 0,
  leadsContacted: 0,
  appointmentsSet: 0,
  closes: 0,
  noShows: 0,
  revenueCollected: 0,
  revenueFromApi: false, // true when pulled from Authorize.net
})

// ─── localStorage helpers ─────────────────────────────────────────────────────
function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// ─── Main hook ────────────────────────────────────────────────────────────────
export function useStore() {
  const [entries, setEntries] = useState(() => loadLS('td_entries', []))
  const [settings, setSettings] = useState(() => loadLS('td_settings', DEFAULT_SETTINGS))
  const [activeView, setActiveView] = useState('dashboard')

  // Persist on change
  useEffect(() => saveLS('td_entries', entries), [entries])
  useEffect(() => saveLS('td_settings', settings), [settings])

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const addEntry = useCallback((entry) => {
    const newEntry = { ...entry, id: `${entry.date}_${entry.rep}_${Date.now()}` }
    setEntries(prev => {
      // Replace if same date+rep exists
      const idx = prev.findIndex(e => e.date === entry.date && e.rep === entry.rep)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...newEntry, id: prev[idx].id }
        return updated
      }
      return [...prev, newEntry]
    })
    return newEntry
  }, [])

  const updateEntry = useCallback((id, patch) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))
  }, [])

  const deleteEntry = useCallback((id) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  // ── Settings ────────────────────────────────────────────────────────────────
  const updateSettings = useCallback((patch) => {
    setSettings(prev => ({ ...prev, ...patch }))
  }, [])

  // ── Computed ────────────────────────────────────────────────────────────────
  const today = format(new Date(), 'yyyy-MM-dd')
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')

  const filterEntries = useCallback((from, to = today) => {
    return entries.filter(e => e.date >= from && e.date <= to)
  }, [entries, today])

  const sumEntries = useCallback((list) => {
    return list.reduce((acc, e) => ({
      callsMade:        acc.callsMade        + Number(e.callsMade || 0),
      textsSent:        acc.textsSent        + Number(e.textsSent || 0),
      leadsContacted:   acc.leadsContacted   + Number(e.leadsContacted || 0),
      appointmentsSet:  acc.appointmentsSet  + Number(e.appointmentsSet || 0),
      closes:           acc.closes           + Number(e.closes || 0),
      noShows:          acc.noShows          + Number(e.noShows || 0),
      revenueCollected: acc.revenueCollected + Number(e.revenueCollected || 0),
    }), {
      callsMade: 0, textsSent: 0, leadsContacted: 0,
      appointmentsSet: 0, closes: 0, noShows: 0, revenueCollected: 0,
    })
  }, [])

  const todayEntries  = filterEntries(today, today)
  const weekEntries   = filterEntries(weekStart, today)
  const monthEntries  = filterEntries(monthStart, today)

  const dailyTotals   = sumEntries(todayEntries)
  const weeklyTotals  = sumEntries(weekEntries)
  const monthlyTotals = sumEntries(monthEntries)

  // Auto-calc revenue from closes when not overridden
  const effectiveRevenue = (entry) =>
    entry.revenueFromApi
      ? entry.revenueCollected
      : Number(entry.closes || 0) * settings.pricePerClose

  // Rep leaderboard for current month
  const repLeaderboard = settings.reps.map(rep => {
    const repEntries = monthEntries.filter(e => e.rep === rep)
    const totals = sumEntries(repEntries)
    const closeRate = totals.leadsContacted > 0
      ? ((totals.closes / totals.leadsContacted) * 100).toFixed(1)
      : '0.0'
    const revenue = repEntries.reduce((s, e) => s + effectiveRevenue(e), 0)
    return { rep, ...totals, closeRate, revenue }
  }).sort((a, b) => b.closes - a.closes)

  // Monthly revenue (using effectiveRevenue)
  const monthlyRevenue = monthEntries.reduce((s, e) => s + effectiveRevenue(e), 0)
  const revenueGoalPct = Math.min(100,
    (monthlyRevenue / settings.monthlyRevenueGoal) * 100
  ).toFixed(1)

  return {
    // State
    entries,
    settings,
    activeView,
    setActiveView,
    // CRUD
    addEntry,
    updateEntry,
    deleteEntry,
    // Settings
    updateSettings,
    // Computed
    today,
    weekStart,
    monthStart,
    todayEntries,
    weekEntries,
    monthEntries,
    dailyTotals,
    weeklyTotals,
    monthlyTotals,
    repLeaderboard,
    monthlyRevenue,
    revenueGoalPct,
    effectiveRevenue,
    filterEntries,
    sumEntries,
  }
}
