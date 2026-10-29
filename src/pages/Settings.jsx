import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { defaultSettings } from '../data/demo'
import { useApp } from '../context/AppContext'
import { PageHeader, Field } from '../components/common/UI'
import TariffEditor, { validateTariff } from '../components/forms/TariffEditor'
export default function Settings() {
  const { settings, update, reset, notify } = useApp()
  const [name, setName] = useState(settings.name), [budget, setBudget] = useState(String(settings.budget)), [thr, setThr] = useState(String(settings.dailyThreshold))
  const [tariff, setTariff] = useState(settings.tariff), [err, setErr] = useState({})
  const save = () => {
    const e = validateTariff(tariff)
    if (!name.trim()) e.name = 'Enter a name.'
    if (!(Number(budget) > 0)) e.budget = 'Budget must be above 0.'
    if (!(Number(thr) > 0)) e.thr = 'Threshold must be above 0.'
    setErr(e); if (Object.keys(e).length) return notify('Fix the highlighted fields', 'err')
    update({ name: name.trim(), budget: +budget, dailyThreshold: +thr, tariff }); notify('Settings saved')
  }
  const tog = (k) => update({ notify: { ...settings.notify, [k]: !settings.notify[k] } })
  return (
    <>
      <PageHeader title="Settings"><button className="btn" onClick={save}><Save size={16} />Save changes</button></PageHeader>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card space-y-4"><h2 className="font-medium">Profile and budget</h2>
          <Field label="Name" error={err.name}><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label={`Monthly budget (${settings.currency})`} error={err.budget}><input className="input" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} /></Field>
          <Field label="Daily usage threshold (kWh)" error={err.thr}><input className="input" inputMode="decimal" value={thr} onChange={(e) => setThr(e.target.value)} /></Field>
          <Field label="Currency symbol"><select className="input" value={settings.currency} onChange={(e) => update({ currency: e.target.value })}>{['₹', '$', '€', '£'].map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Theme"><select className="input" value={settings.theme} onChange={(e) => update({ theme: e.target.value })}><option value="light">Light</option><option value="dark">Dark</option></select></Field>
          <p className="muted text-xs">Unit: kWh (fixed).</p></section>
        <section className="card space-y-4"><h2 className="font-medium">Electricity tariff</h2><TariffEditor value={tariff} onChange={setTariff} errors={err} currency={settings.currency} /></section>
        <section className="card space-y-2"><h2 className="font-medium">Notifications</h2>
          {[['budget', 'Budget alerts'], ['spikes', 'Spike and baseline alerts'], ['weekly', 'Weekly summary (preference only in this demo)']].map(([k, l]) => <label key={k} className="flex min-h-10 items-center gap-3 text-sm"><input type="checkbox" className="size-4 accent-volt" checked={settings.notify[k]} onChange={() => tog(k)} />{l}</label>)}</section>
        <section className="card"><h2 className="font-medium">Data</h2><p className="muted mt-1 text-sm">Restore demo readings, appliances and settings.</p>
          <button className="btn btn-danger mt-3" onClick={() => window.confirm('Reset all data to demo defaults?') && (reset(), setTariff(defaultSettings.tariff))}><RotateCcw size={16} />Reset data</button></section>
      </div>
    </>
  )
}
