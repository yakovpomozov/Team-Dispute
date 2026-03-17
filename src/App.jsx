import { useState } from 'react'
import './index.css'
import Layout from './components/Layout'
import Dashboard from './views/Dashboard'
import Pipeline from './views/Pipeline'
import RevenueLog from './views/RevenueLog'
import Settings, { loadSettings } from './views/Settings'

function useSettings() {
  const [settings, setSettings] = useState(() => loadSettings())

  const updateSettings = (newSettings) => {
    setSettings(newSettings)
    localStorage.setItem('td_settings', JSON.stringify(newSettings))
  }

  return { settings, updateSettings }
}

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const { settings, updateSettings } = useSettings()

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {activeView === 'dashboard' && (
        <Dashboard settings={settings} />
      )}
      {activeView === 'pipeline' && (
        <Pipeline settings={settings} />
      )}
      {activeView === 'revenue' && (
        <RevenueLog settings={settings} />
      )}
      {activeView === 'settings' && (
        <Settings settings={settings} updateSettings={updateSettings} />
      )}
    </Layout>
  )
}
