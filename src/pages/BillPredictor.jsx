import { useState } from 'react'
import { Calculator, Save } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { billFromSlabs, monthly } from '../utils/calc'
import { money, num } from '../utils/format'
import { PageHeader, Field } from '../components/common/UI'
import TariffEditor, { validateTariff } from '../components/forms/TariffEditor'
export default function BillPredictor() {
  const { settings, update, readings, notify } = useApp()
  const last = monthly(readings).at(-1), prev = monthly(readings).at(-2)
  const [tariff, setTariff] = useState(settings.tariff)
  const [kwh, setKwh] = useState(String(Math.round(last?.projected ?? 200)))
  const [applied, setApplied] = useState({ kwh: Number(kwh), tariff: settings.tariff })
  const [errors, setErrors] = useState({})
  const c = settings.currency
  const calc = (k = kwh, t = tariff) => {
    const e = validateTariff(t)
    if (k === '' || isNaN(k) || Number(k) < 0 || Number(k) > 5000) e.kwh = 'Enter 0–5000 kWh.'
    setErrors(e)
    if (Object.keys(e).length) { notify('Fix the highlighted fields', 'err'); return }
    setApplied({ kwh: Number(k), tariff: t })
  }
  const r = billFromSlabs(applied.kwh, applied.tariff), pr = prev ? billFromSlabs(prev.projected, settings.tariff).total : null
  return (
    <>
      <PageHeader title="Bill predictor" sub="Configure your provider's slabs; nothing assumes one national tariff." />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card space-y-4"><Field label="Monthly consumption (kWh)" error={errors.kwh}><input className="input" inputMode="decimal" value={kwh} onChange={(e) => setKwh(e.target.value)} /></Field>
          <input type="range" min="0" max="1000" step="5" aria-label="Consumption slider" className="w-full accent-volt" value={Math.min(1000, Number(kwh) || 0)} onChange={(e) => { setKwh(e.target.value); calc(e.target.value) }} />
          <TariffEditor value={tariff} onChange={setTariff} errors={errors} currency={c} />
          <div className="flex flex-wrap gap-2"><button className="btn" onClick={() => calc()}><Calculator size={16} />Calculate My Bill</button>
            <button className="btn btn-ghost" onClick={() => { if (Object.keys(validateTariff(tariff)).length) return notify('Fix tariff errors first', 'err'); update({ tariff }); notify('Saved as your tariff') }}><Save size={16} />Save as my tariff</button></div></section>
        <section className="card" aria-live="polite"><p className="muted text-sm">Estimated total bill</p>
          <p className="text-4xl font-semibold tabular-nums text-navy dark:text-white">{money(r.total, c)}</p>
          <p className="muted text-sm">{num(applied.kwh, 0)} kWh · about {money(r.total * 12, c)} per year at this level</p>
          <table className="mt-4 w-full text-sm"><thead><tr className="muted border-b border-slate-200 text-left dark:border-slate-700"><th className="py-2">Slab</th><th>Units</th><th>Rate</th><th className="text-right">Amount</th></tr></thead>
            <tbody>{r.breakdown.map((b) => <tr key={b.range} className="border-b border-slate-100 dark:border-slate-800"><td className="py-2">{b.range}</td><td>{num(b.units, 0)}</td><td>{b.rate}</td><td className="text-right">{money(b.amount, c)}</td></tr>)}
              <tr><td className="py-2" colSpan="3">Energy charges</td><td className="text-right">{money(r.energy, c)}</td></tr>
              <tr><td className="py-2" colSpan="3">Fixed charges</td><td className="text-right">{money(r.fixed, c)}</td></tr>
              <tr><td className="py-2" colSpan="3">Taxes and additional ({applied.tariff.taxPct}%)</td><td className="text-right">{money(r.tax, c)}</td></tr></tbody></table>
          {pr != null && <p className="mt-3 text-sm">Compared with last month's normalised bill ({money(pr, c)}): <b className={r.total > pr ? 'text-red-600' : 'text-emerald-600'}>{r.total > pr ? '+' : ''}{money(r.total - pr, c)}</b></p>}
          <p className="muted mt-4 text-xs">Disclaimer: actual bills may differ according to your electricity provider, tariff category, taxes, subsidies and billing rules.</p></section>
      </div>
    </>
  )
}
