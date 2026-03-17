import { format, parseISO } from 'date-fns'
import { Trash2 } from 'lucide-react'

const COLS = [
  { key: 'callsMade',       label: 'Calls'  },
  { key: 'textsSent',       label: 'Texts'  },
  { key: 'leadsContacted',  label: 'Leads'  },
  { key: 'appointmentsSet', label: 'Appts'  },
  { key: 'closes',          label: 'Closes' },
  { key: 'noShows',         label: 'No-Show'},
]

function fmt$(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function KPITable({ entries, deleteEntry, pricePerClose }) {
  if (!entries.length) {
    return <p className="text-gray-500 text-sm text-center py-8">No entries yet.</p>
  }

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
            <th className="text-left py-2 pr-3 font-medium">Date</th>
            <th className="text-left py-2 pr-3 font-medium">Rep</th>
            {COLS.map(c => (
              <th key={c.key} className="text-right py-2 pr-3 font-medium">{c.label}</th>
            ))}
            <th className="text-right py-2 pr-3 font-medium">Rate</th>
            <th className="text-right py-2 font-medium">Revenue</th>
            {deleteEntry && <th className="w-8" />}
          </tr>
        </thead>
        <tbody>
          {sorted.map(e => {
            const closeRate = e.leadsContacted > 0
              ? ((e.closes / e.leadsContacted) * 100).toFixed(0) + '%'
              : '—'
            const revenue = e.revenueFromApi
              ? e.revenueCollected
              : (e.closes || 0) * pricePerClose

            return (
              <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="py-2 pr-3 text-gray-300">{format(parseISO(e.date), 'MM/dd')}</td>
                <td className="py-2 pr-3">
                  <span className="bg-indigo-900/40 text-indigo-300 px-2 py-0.5 rounded text-xs font-medium">{e.rep}</span>
                </td>
                {COLS.map(c => (
                  <td key={c.key} className="py-2 pr-3 text-right text-gray-200">{e[c.key] || 0}</td>
                ))}
                <td className="py-2 pr-3 text-right">
                  <span className={`font-medium ${closeRate !== '—' && parseInt(closeRate) >= 20 ? 'text-green-400' : 'text-gray-300'}`}>
                    {closeRate}
                  </span>
                </td>
                <td className="py-2 text-right font-semibold text-green-400">{fmt$(revenue)}</td>
                {deleteEntry && (
                  <td className="py-2 pl-2">
                    <button
                      onClick={() => deleteEntry(e.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
