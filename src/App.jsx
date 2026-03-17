import './index.css'
import Layout from './components/Layout'
import Dashboard from './views/Dashboard'
import EntryView from './views/EntryView'
import LeaderboardView from './views/LeaderboardView'
import HistoryView from './views/HistoryView'
import SettingsView from './views/SettingsView'
import { useStore } from './store/useStore'

export default function App() {
  const store = useStore()

  const {
    entries, settings, activeView, setActiveView,
    addEntry, updateEntry, deleteEntry, updateSettings,
    todayEntries, weekEntries, monthEntries,
    dailyTotals, weeklyTotals, monthlyTotals,
    repLeaderboard, monthlyRevenue, revenueGoalPct,
    filterEntries, sumEntries,
  } = store

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {activeView === 'dashboard' && (
        <Dashboard
          dailyTotals={dailyTotals}
          weeklyTotals={weeklyTotals}
          monthlyTotals={monthlyTotals}
          monthlyRevenue={monthlyRevenue}
          revenueGoalPct={revenueGoalPct}
          repLeaderboard={repLeaderboard}
          settings={settings}
          todayEntries={todayEntries}
          setActiveView={setActiveView}
        />
      )}
      {activeView === 'entry' && (
        <EntryView
          settings={settings}
          addEntry={addEntry}
          todayEntries={todayEntries}
          setActiveView={setActiveView}
        />
      )}
      {activeView === 'leaderboard' && (
        <LeaderboardView
          repLeaderboard={repLeaderboard}
          settings={settings}
          monthlyRevenue={monthlyRevenue}
          revenueGoalPct={revenueGoalPct}
        />
      )}
      {activeView === 'history' && (
        <HistoryView
          entries={entries}
          deleteEntry={deleteEntry}
          settings={settings}
          filterEntries={filterEntries}
          sumEntries={sumEntries}
        />
      )}
      {activeView === 'settings' && (
        <SettingsView
          settings={settings}
          updateSettings={updateSettings}
        />
      )}
    </Layout>
  )
}
