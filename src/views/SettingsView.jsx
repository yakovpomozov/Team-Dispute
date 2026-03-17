import { useState } from 'react'
import { Save, Plus, Trash2, AlertTriangle, ExternalLink, CheckCircle2 } from 'lucide-react'

export default function SettingsView({ settings, updateSettings }) {
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)
  const [newRep, setNewRep] = useState('')

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const addRep = () => {
    const trimmed = newRep.trim()
    if (trimmed && !form.reps.includes(trimmed)) {
      setForm(prev => ({ ...prev, reps: [...prev.reps, trimmed] }))
      setNewRep('')
    }
  }

  const removeRep = (rep) => {
    setForm(prev => ({ ...prev, reps: prev.reps.filter(r => r !== rep) }))
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 text-sm">Configure pricing, goals, reps, and integrations.</p>
      </div>

      {/* ── Business ── */}
      <section className="card space-y-4">
        <h3 className="text-sm font-bold text-gray-200 border-b border-gray-800 pb-2">Business</h3>

        <div>
          <label className="label">Price Per Close ($)</label>
          <input
            type="number"
            min="0"
            step="1"
            className="input"
            value={form.pricePerClose}
            onChange={e => set('pricePerClose', Number(e.target.value))}
          />
          <p className="text-xs text-gray-500 mt-1">Used to auto-calculate revenue from closes.</p>
        </div>

        <div>
          <label className="label">Monthly Revenue Goal ($)</label>
          <input
            type="number"
            min="0"
            step="1000"
            className="input"
            value={form.monthlyRevenueGoal}
            onChange={e => set('monthlyRevenueGoal', Number(e.target.value))}
          />
        </div>
      </section>

      {/* ── Reps ── */}
      <section className="card space-y-3">
        <h3 className="text-sm font-bold text-gray-200 border-b border-gray-800 pb-2">Sales Reps</h3>
        <div className="space-y-2">
          {form.reps.map(rep => (
            <div key={rep} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
              <span className="text-gray-200 text-sm">{rep}</span>
              <button onClick={() => removeRep(rep)} className="text-gray-500 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="input"
            placeholder="Rep name"
            value={newRep}
            onChange={e => setNewRep(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRep())}
          />
          <button onClick={addRep} className="btn-secondary flex items-center gap-1 whitespace-nowrap text-sm">
            <Plus size={14} /> Add
          </button>
        </div>
      </section>

      {/* ── GoHighLevel ── */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <h3 className="text-sm font-bold text-gray-200">GoHighLevel (GHL)</h3>
          <a
            href="https://highlevel.stoplight.io/docs/integrations/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs"
          >
            API Docs <ExternalLink size={11} />
          </a>
        </div>

        <div className="flex items-center gap-3">
          <label className="label mb-0">Enable GHL Sync</label>
          <button
            type="button"
            onClick={() => set('ghlEnabled', !form.ghlEnabled)}
            className={`relative w-10 h-5 rounded-full transition-colors ${form.ghlEnabled ? 'bg-indigo-600' : 'bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.ghlEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div>
          <label className="label">GHL API Key</label>
          <input
            type="password"
            className="input font-mono text-sm"
            placeholder="eyJhbGci…"
            value={form.ghlApiKey}
            onChange={e => set('ghlApiKey', e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Found in GHL → Settings → Integrations → API Key
          </p>
        </div>

        <div>
          <label className="label">GHL Base URL</label>
          <input
            type="text"
            className="input font-mono text-sm"
            value={form.ghlBaseUrl}
            onChange={e => set('ghlBaseUrl', e.target.value)}
          />
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 flex gap-2 text-xs text-yellow-400">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <span>
            GHL sync will auto-populate <strong>leads, appointments, and closes</strong> in the KPI entry form.
            Click "Sync APIs" on the Log KPIs page after enabling.
          </span>
        </div>
      </section>

      {/* ── Authorize.net ── */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <h3 className="text-sm font-bold text-gray-200">Authorize.net</h3>
          <a
            href="https://developer.authorize.net/api/reference/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs"
          >
            API Docs <ExternalLink size={11} />
          </a>
        </div>

        <div className="flex items-center gap-3">
          <label className="label mb-0">Enable Revenue Sync</label>
          <button
            type="button"
            onClick={() => set('authorizeNetEnabled', !form.authorizeNetEnabled)}
            className={`relative w-10 h-5 rounded-full transition-colors ${form.authorizeNetEnabled ? 'bg-indigo-600' : 'bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.authorizeNetEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div>
          <label className="label">API Login ID</label>
          <input
            type="text"
            className="input font-mono text-sm"
            placeholder="Your Authorize.net login ID"
            value={form.authorizeNetApiLoginId}
            onChange={e => set('authorizeNetApiLoginId', e.target.value)}
          />
        </div>

        <div>
          <label className="label">Transaction Key</label>
          <input
            type="password"
            className="input font-mono text-sm"
            placeholder="Your transaction key"
            value={form.authorizeNetTransactionKey}
            onChange={e => set('authorizeNetTransactionKey', e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="label mb-0">Use Sandbox</label>
          <button
            type="button"
            onClick={() => set('authorizeNetSandbox', !form.authorizeNetSandbox)}
            className={`relative w-10 h-5 rounded-full transition-colors ${form.authorizeNetSandbox ? 'bg-indigo-600' : 'bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.authorizeNetSandbox ? 'translate-x-5' : ''}`} />
          </button>
          <span className="text-xs text-gray-500">{form.authorizeNetSandbox ? 'Sandbox mode' : 'Production mode'}</span>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 flex gap-2 text-xs text-yellow-400">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <span>
            <strong>Security note:</strong> In production, API keys should be stored on a secure backend server,
            not in the browser. This prototype stores them in localStorage for convenience only.
            Authorize.net sync will auto-populate the <strong>Revenue Collected</strong> field.
          </span>
        </div>
      </section>

      <button
        onClick={handleSave}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {saved
          ? <><CheckCircle2 size={16} /> Settings Saved!</>
          : <><Save size={16} /> Save Settings</>}
      </button>
    </div>
  )
}
