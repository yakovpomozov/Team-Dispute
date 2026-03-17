import { useState } from 'react'
import {
  Save, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff,
  Wifi, ExternalLink,
} from 'lucide-react'
import axios from 'axios'

function Toggle({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-sm text-gray-300">{label}</span>}
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-indigo-600' : 'bg-gray-700'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, hint, reveal }) {
  const [show, setShow] = useState(false)
  const inputType = reveal ? (show ? 'text' : 'password') : type
  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 block mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          className="input w-full font-mono text-sm pr-10"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        {reveal && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
    </div>
  )
}

function TestButton({ label, onTest }) {
  const [status, setStatus] = useState(null) // null | 'loading' | 'ok' | 'error'
  const [msg, setMsg] = useState('')

  const run = async () => {
    setStatus('loading')
    setMsg('')
    try {
      const res = await onTest()
      setStatus('ok')
      setMsg(res || 'Connection successful')
    } catch (err) {
      setStatus('error')
      setMsg(err.response?.data?.error || err.message || 'Connection failed')
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={run}
        disabled={status === 'loading'}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm border border-gray-700 transition-colors disabled:opacity-50"
      >
        {status === 'loading'
          ? <Loader2 size={14} className="animate-spin" />
          : <Wifi size={14} />
        }
        {label}
      </button>
      {status === 'ok' && (
        <span className="flex items-center gap-1.5 text-green-400 text-xs">
          <CheckCircle2 size={13} /> {msg}
        </span>
      )}
      {status === 'error' && (
        <span className="flex items-center gap-1.5 text-red-400 text-xs">
          <AlertCircle size={13} /> {msg}
        </span>
      )}
    </div>
  )
}

const DEFAULT_SETTINGS = {
  ghlApiKey: '',
  kenUserId: '',
  yashaUserId: '',
  anetLoginId: '',
  anetTransKey: '',
  anetEnv: 'production',
}

export function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem('td_settings') || '{}')
    // Seed from .env values if not yet overridden
    return {
      ...DEFAULT_SETTINGS,
      ghlApiKey:    stored.ghlApiKey    ?? import.meta.env.VITE_GHL_API_KEY    ?? '',
      kenUserId:    stored.kenUserId    ?? '',
      yashaUserId:  stored.yashaUserId  ?? '',
      anetLoginId:  stored.anetLoginId  ?? import.meta.env.VITE_ANET_LOGIN     ?? '',
      anetTransKey: stored.anetTransKey ?? import.meta.env.VITE_ANET_KEY       ?? '',
      anetEnv:      stored.anetEnv      ?? 'production',
      ...stored,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export default function Settings({ settings, updateSettings }) {
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const testGhl = async () => {
    const res = await axios.get('/api/ghl/test', {
      headers: { 'x-ghl-key': form.ghlApiKey },
    })
    return `Connected · Location ID: ${res.data.locationId}`
  }

  const testAnet = async () => {
    await axios.post('/api/anet/test', {
      loginId: form.anetLoginId,
      transactionKey: form.anetTransKey,
      env: form.anetEnv,
    })
    return `Connected · ${form.anetEnv === 'sandbox' ? 'Sandbox' : 'Production'} mode`
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 text-sm">API credentials and user configuration.</p>
      </div>

      {/* ── GoHighLevel ──────────────────────────────────────────── */}
      <section className="card rounded-xl border border-gray-800 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-sm font-bold text-white">GoHighLevel (GHL)</h3>
          <a
            href="https://highlevel.stoplight.io/docs/integrations/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs"
          >
            Docs <ExternalLink size={11} />
          </a>
        </div>

        <Field
          label="GHL API Key"
          value={form.ghlApiKey}
          onChange={v => set('ghlApiKey', v)}
          placeholder="eyJhbGci…"
          hint="Found in GHL → Settings → Integrations → API Key"
          reveal
        />

        <Field
          label="Ken's GHL User ID"
          value={form.kenUserId}
          onChange={v => set('kenUserId', v)}
          placeholder="User ID for filtering calls/texts/appointments"
          hint="Leave blank to count all users"
        />

        <Field
          label="Yasha's GHL User ID"
          value={form.yashaUserId}
          onChange={v => set('yashaUserId', v)}
          placeholder="User ID for filtering closes"
          hint="Leave blank to count all users"
        />

        <TestButton label="Test GHL Connection" onTest={testGhl} />
      </section>

      {/* ── Authorize.net ──────────────────────────────────────────── */}
      <section className="card rounded-xl border border-gray-800 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-sm font-bold text-white">Authorize.net</h3>
          <a
            href="https://developer.authorize.net/api/reference/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs"
          >
            Docs <ExternalLink size={11} />
          </a>
        </div>

        <Field
          label="API Login ID"
          value={form.anetLoginId}
          onChange={v => set('anetLoginId', v)}
          placeholder="Your Authorize.net API Login ID"
        />

        <Field
          label="Transaction Key"
          value={form.anetTransKey}
          onChange={v => set('anetTransKey', v)}
          placeholder="Your Transaction Key"
          reveal
        />

        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800">
          <div>
            <p className="text-sm text-gray-200 font-medium">
              {form.anetEnv === 'sandbox' ? 'Sandbox Mode' : 'Production Mode'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {form.anetEnv === 'sandbox' ? 'Using test environment' : 'Using live transactions'}
            </p>
          </div>
          <Toggle
            value={form.anetEnv === 'sandbox'}
            onChange={v => set('anetEnv', v ? 'sandbox' : 'production')}
          />
        </div>

        <TestButton label="Test Authorize.net Connection" onTest={testAnet} />
      </section>

      {/* ── Save ────────────────────────────────────────────────── */}
      <button
        onClick={handleSave}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold"
      >
        {saved
          ? <><CheckCircle2 size={16} /> Settings Saved!</>
          : <><Save size={16} /> Save Settings</>
        }
      </button>

      <p className="text-xs text-gray-600 text-center">
        Settings are saved to localStorage. API keys are sent only to your local server proxy.
      </p>
    </div>
  )
}
