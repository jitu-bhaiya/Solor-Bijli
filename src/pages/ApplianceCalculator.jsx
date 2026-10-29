import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { applianceKwh, applianceCost, billFromSlabs, monthly } from '../utils/calc'
import { tipFor } from '../utils/insights'
import { money, num } from '../utils/format'
import { PageHeader, Field, Empty } from '../components/common/UI'
export default function ApplianceCalculator() {
  const { appliances, setAppliances, settings, readings, notify } = useApp()
  const cur = monthly(readings).at(-1), eff = cur ? +(billFromSlabs(cur.projected, settings.tariff).total / cur.projected).toFixed(2) : 6
  const blank = { name: '', watts: '', hours: '', days: '30', rate: String(eff) }
  const [f, setF] = useState(blank), [editId, setEditId] = useState(null), [err, setErr] = useState({})
  const submit = (e) => {
    e.preventDefault()
    const x = {}
    if (!f.name.trim()) x.name = 'Enter a name.'
    if (!(Number(f.watts) > 0)) x.watts = 'Watts must be above 0.'
    if (!(Number(f.hours) > 0 && Number(f.hours) <= 24)) x.hours = 'Hours must be 0–24.'
    if (!(Number(f.days) >= 1 && Number(f.days) <= 31)) x.days = 'Days must be 1–31.'
    if (!(Number(f.rate) >= 0) || f.rate === '') x.rate = 'Enter a rate.'
    setErr(x); if (Object.keys(x).length) return
    const item = { ...f, name: f.name.trim(), watts: +f.watts, hours: +f.hours, days: +f.days, rate: +f.rate }
    if (editId) { setAppliances((l) => l.map((a) => (a.id === editId ? { ...item, id: editId } : a))); notify('Appliance updated') }
    else { setAppliances((l) => [...l, { ...item, id: Date.now() }]); notify('Appliance added') }
    setF(blank); setEditId(null)
  }
  const remove = (a) => { if (window.confirm(`Remove ${a.name}?`)) { setAppliances((l) => l.filter((x) => x.id !== a.id)); notify('Appliance removed') } }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const total = appliances.reduce((t, a) => t + applianceKwh(a), 0)
  return (
    <>
      <PageHeader title="Appliance calculator" sub="kWh = watts × hours per day × days ÷ 1000. Cost = kWh × rate." />
      <form onSubmit={submit} className="card mb-4 grid items-start gap-3 sm:grid-cols-3 lg:grid-cols-6" noValidate>
        <Field label="Appliance" error={err.name}><input className="input" value={f.name} onChange={set('name')} /></Field>
        <Field label="Power (W)" error={err.watts}><input className="input" inputMode="decimal" value={f.watts} onChange={set('watts')} /></Field>
        <Field label="Hours per day" error={err.hours}><input className="input" inputMode="decimal" value={f.hours} onChange={set('hours')} /></Field>
        <Field label="Days" error={err.days}><input className="input" inputMode="numeric" value={f.days} onChange={set('days')} /></Field>
        <Field label={`Rate (${settings.currency}/kWh)`} error={err.rate}><input className="input" inputMode="decimal" value={f.rate} onChange={set('rate')} /></Field>
        <div className="flex gap-2 sm:pt-6"><button className="btn flex-1"><Plus size={16} />{editId ? 'Save' : 'Add'}</button>{editId && <button type="button" className="btn btn-ghost" aria-label="Cancel edit" onClick={() => { setEditId(null); setF(blank); setErr({}) }}><X size={16} /></button>}</div>
      </form>
      {appliances.length ? <div className="card overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="muted border-b border-slate-200 text-left dark:border-slate-700"><th className="py-2">Appliance</th><th>kWh</th><th>Cost</th><th>Suggestion</th><th><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{appliances.map((a) => <tr key={a.id} className="border-b border-slate-100 align-top dark:border-slate-800"><td className="py-2 font-medium">{a.name}<div className="muted text-xs">{a.watts} W · {a.hours} h × {a.days} d</div></td><td>{num(applianceKwh(a))}</td><td>{money(applianceCost(a), settings.currency)}</td><td className="muted max-w-xs">{tipFor(a.name)}</td>
          <td className="whitespace-nowrap"><button className="btn btn-ghost mr-1 px-2.5" aria-label={`Edit ${a.name}`} onClick={() => { setEditId(a.id); setF({ name: a.name, watts: String(a.watts), hours: String(a.hours), days: String(a.days), rate: String(a.rate) }) }}><Pencil size={15} /></button><button className="btn btn-ghost px-2.5" aria-label={`Remove ${a.name}`} onClick={() => remove(a)}><Trash2 size={15} /></button></td></tr>)}
          <tr className="font-medium"><td className="py-2">Total</td><td>{num(total)}</td><td>{money(appliances.reduce((t, a) => t + applianceCost(a), 0), settings.currency)}</td><td colSpan="2" /></tr></tbody></table></div>
        : <Empty title="No appliances yet" text="Add your first appliance above." />}
    </>
  )
}
