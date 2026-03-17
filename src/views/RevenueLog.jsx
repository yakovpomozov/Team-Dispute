import { useState, useEffect, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import {
  RefreshCw, AlertCircle, Download, DollarSign,
  CreditCard, CheckCircle, Clock, XCircle, Search,
} from 'lucide-react'
import axios from 'axios'

function fmt$(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0)
}

function statusBadge(status) {
  const map = {
    settledSuccessfully:          { label: 'Settled',   color: 'text-green-400  bg-green-900/20  border-green-800/30',  icon: CheckCircle },
    capturedPendingSettlement:    { label: 'Pending',   color: 'text-amber-400  bg-amber-900/20  border-amber-800/30',  icon: Clock       },
    authorizedPendingCapture:     { label: 'Auth',      color: 'text-blue-400   bg-blue-900/20   border-blue-800/30',   icon: Clock       },
    voided:                       { label: 'Voided',    color: 'text-gray-400   bg-gray-800/40   border-gray-700/30',   icon: XCircle     },
    refundSettledSuccessfully:    { label: 'Refunded',  color: 'text-red-400    bg-red-900/20    border-red-800/30',    icon: XCircle     },
    declined:                     { label: 'Declined',  color: 'text-red-400    bg-red-900/20    border-red-800/30',    icon: XCircle     },
  }
  const { label, color, icon: Icon } = map[status] || { label: status, color: 'text-gray-400 bg-gray-800/40 border-gray-700/30', icon: Clock }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${color}`}>
      <Icon size={10} />
      {label}
    </span>
  )
}

function exportToCSV(transactions) {
  const headers = ['Date', 'Client Name', 'Email', 'Amount', 'Status', 'Card', 'Transaction ID']
  const rows = transactions.map(tx => [
    tx.submitTime ? format(parseISO(tx.submitTime), 'yyyy-MM-dd HH:mm') : '',
    `${tx.firstName} ${tx.lastName}`.trim() || tx.email || '—',
    tx.email || '',
    tx.amount?.toFixed(2) || '0.00',
    tx.status || '',
    tx.last4 ? `${tx.cardType} ****${tx.last4}` : '',
    tx.id || '',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `team-dispute-revenue-${format(new Date(), 'yyyy-MM')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function RevenueLog({ settings }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const loginId = settings.anetLoginId || ''
  const transKey = settings.anetTransKey || ''
  const env = settings.anetEnv || 'production'

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('/api/anet/transactions', {
        loginId,
        transactionKey: transKey,
        env,
      })
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch transactions')
    }
    setLoading(false)
  }, [loginId, transKey, env])

  useEffect(() => { fetchData() }, [fetchData])

  const transactions = data?.transactions || []

  const filtered = transactions.filter(tx => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const name = `${tx.firstName} ${tx.lastName}`.toLowerCase()
    return name.includes(q) || tx.email?.toLowerCase().includes(q) || tx.id?.includes(q)
  })

  const monthTotal = data?.monthTotal ?? null
  const todayTotal = data?.todayTotal ?? null
  const weekTotal = data?.weekTotal ?? null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Revenue Log</h2>
          <p className="text-gray-400 text-sm">Authorize.net · Current Month</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-900/30 hover:bg-green-900/50 text-green-400 text-sm border border-green-800/30 transition-colors disabled:opacity-40"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-red-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-1">Could not load transactions</p>
            <p>{error}</p>
            <p className="text-gray-500 mt-1.5 text-xs">Check your Authorize.net credentials in Settings.</p>
          </div>
        </div>
      )}

      {/* Revenue summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Today', value: todayTotal },
          { label: 'This Week', value: weekTotal },
          { label: 'This Month', value: monthTotal },
        ].map(({ label, value }) => (
          <div key={label} className="card rounded-xl border border-gray-800 p-4 text-center">
            <DollarSign size={16} className="text-green-400 mx-auto mb-2" />
            {loading
              ? <div className="h-6 w-16 bg-gray-800 rounded animate-pulse mx-auto" />
              : <p className="text-lg font-bold text-white">{fmt$(value)}</p>
            }
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          className="input pl-9 w-full"
          placeholder="Search by name, email, or transaction ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Transaction count */}
      {!loading && (
        <p className="text-xs text-gray-500">
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          {search ? ` matching "${search}"` : ' this month'}
        </p>
      )}

      {/* Transaction list */}
      <div className="space-y-2">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card rounded-xl border border-gray-800 p-4 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-800 rounded" />
                    <div className="h-3 w-48 bg-gray-800 rounded" />
                  </div>
                  <div className="h-5 w-20 bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CreditCard size={32} className="mx-auto mb-3 opacity-30" />
            <p>{search ? 'No transactions match your search.' : 'No transactions found for this month.'}</p>
          </div>
        )}

        {!loading && filtered.map(tx => {
          const name = `${tx.firstName} ${tx.lastName}`.trim() || tx.email || 'Unknown Client'
          const date = tx.submitTime ? (() => {
            try { return format(parseISO(tx.submitTime), 'MMM d, yyyy · h:mm a') }
            catch { return tx.submitTime }
          })() : '—'

          return (
            <div key={tx.id} className="card rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-white truncate">{name}</p>
                    {statusBadge(tx.status)}
                  </div>
                  <p className="text-xs text-gray-500">{date}</p>
                  {tx.email && (
                    <p className="text-xs text-gray-600 mt-0.5">{tx.email}</p>
                  )}
                  {tx.last4 && (
                    <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                      <CreditCard size={11} />
                      {tx.cardType} ****{tx.last4}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-base font-bold ${
                    tx.status?.includes('refund') || tx.status === 'voided'
                      ? 'text-red-400'
                      : 'text-green-400'
                  }`}>
                    {tx.status?.includes('refund') ? '-' : ''}{fmt$(tx.amount)}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">#{tx.id}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
