export default function StatCard({ label, value, sub, accent, icon: Icon, onClick }) {
  return (
    <div
      className={`card flex flex-col gap-1 ${onClick ? 'cursor-pointer hover:border-indigo-700 transition-colors' : ''} ${accent ? 'border-indigo-700/50 bg-indigo-950/40' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={14} className="text-gray-600 mt-0.5" />}
      </div>
      <span className={`text-2xl font-bold ${accent ? 'text-indigo-300' : 'text-white'}`}>{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  )
}
