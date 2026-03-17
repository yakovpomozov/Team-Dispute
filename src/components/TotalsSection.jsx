import StatCard from './StatCard'
import { Phone, MessageSquare, Users, Calendar, CheckCircle, XCircle, DollarSign } from 'lucide-react'

function fmt$(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const STATS = [
  { key: 'callsMade',       label: 'Calls Made',       icon: Phone          },
  { key: 'textsSent',       label: 'Texts Sent',       icon: MessageSquare  },
  { key: 'leadsContacted',  label: 'Leads Contacted',  icon: Users          },
  { key: 'appointmentsSet', label: 'Appointments Set', icon: Calendar       },
  { key: 'closes',          label: 'Closes',           icon: CheckCircle    },
  { key: 'noShows',         label: 'No Shows',         icon: XCircle        },
]

export default function TotalsSection({ title, totals, pricePerClose, revenue }) {
  const closeRate = totals.leadsContacted > 0
    ? ((totals.closes / totals.leadsContacted) * 100).toFixed(1) + '%'
    : '—'

  const displayRevenue = revenue !== undefined ? revenue : totals.closes * pricePerClose

  return (
    <div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map(({ key, label, icon }) => (
          <StatCard
            key={key}
            label={label}
            value={totals[key] || 0}
            icon={icon}
          />
        ))}
        <StatCard
          label="Close Rate"
          value={closeRate}
          icon={CheckCircle}
          accent
        />
        <StatCard
          label="Revenue"
          value={fmt$(displayRevenue)}
          icon={DollarSign}
          accent
        />
      </div>
    </div>
  )
}
