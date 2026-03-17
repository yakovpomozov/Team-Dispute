import KPIEntryForm from '../components/KPIEntryForm'

export default function EntryView({ settings, addEntry, todayEntries, setActiveView }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Log KPIs</h2>
        <p className="text-gray-400 text-sm">Enter your daily activity numbers below.</p>
      </div>
      <KPIEntryForm
        settings={settings}
        addEntry={addEntry}
        todayEntries={todayEntries}
        onSaved={() => setActiveView('dashboard')}
      />
    </div>
  )
}
