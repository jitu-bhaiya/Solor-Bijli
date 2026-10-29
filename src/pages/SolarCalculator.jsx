import { useState } from 'react'
import { SunMedium, IndianRupee, Hourglass, Leaf, Save } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { monthly } from '../utils/calc'
import { solarPlan, defaultSolar, PERFORMANCE_RATIO } from '../utils/solar'
import { money, num } from '../utils/format'
import StatCard from '../components/cards/StatCard'
import { PageHeader, Field } from '../components/common/UI'
import { ChartBox, BarSeries } from '../components/charts/Charts'
const fields = [['roofM2', 'Usable roof area (m²)'], ['panelW', 'Panel rating (W)'], ['panelM2', 'Area per panel (m²)'], ['sunHours', 'Peak sun hours per day'], ['costPerKw', 'Installed cost per kW'], ['subsidy', 'Subsidy or discount (total)']]
export default function SolarCalculator() {
  const { settings, update, readings, notify } = useApp()
  const [f, setF] = useState(Object.fromEntries(Object.entries(settings.solar ?? defaultSolar).map(([k, v]) => [k, String(v)])))
  const [err, setErr] = useState({})
  const usage = monthly(readings).at(-1)?.projected ?? 0, c = settings.currency
  const e = {}
  fields.forEach(([k]) => { const n = Number(f[k]); if (f[k] === '' || isNaN(n) || n < 0 || (k !== 'subsidy' && n === 0)) e[k] = 'Enter a valid number.' })
  if (Number(f.sunHours) > 12) e.sunHours = 'Must be 12 or less.'
  const valid = Object.keys(e).length === 0
  const p = valid ? solarPlan(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, Number(v)])), usage, settings.tariff, settings.emissionFactor) : null
  const save = () => { setErr(e); if (!valid) return notify('Fix the highlighted fields', 'err'); update({ solar: Object.fromEntries(Object.entries(f).map(([k, v]) => [k, Number(v)])) }); notify('Solar plan saved') }
  return (
    <>
      <PageHeader title="Solar savings calculator" sub={`Based on your latest month (${num(usage, 0)} kWh, normalised). Estimates only.`}><button className="btn" onClick={save}><Save size={16} />Save plan</button></PageHeader>
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card space-y-3">{fields.map(([k, l]) => <Field key={k} label={l} error={(err[k] ?? e[k])}><input className="input" inputMode="decimal" value={f[k]} onChange={(x) => setF({ ...f, [k]: x.target.value })} /></Field>)}</section>
        <div className="space-y-4 lg:col-span-2">
          {p && <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard icon={SunMedium} label={`${p.panels} panels · ${num(p.kw)} kW`} value={p.generation} suffix="kWh/mo" />
              <StatCard icon={IndianRupee} label="Monthly bill saving" value={p.saving} prefix={c} />
              <StatCard icon={Hourglass} label="Payback period" value={p.payback ?? 0} suffix="years" />
            </div>
            <ChartBox title="Monthly bill with and without solar" desc={`Bill in ${c}. Without solar ${money(p.before, c)}, with solar ${money(p.after, c)}.`}><BarSeries data={[{ label: 'Without solar', bill: p.before }, { label: 'With solar', bill: p.after }]} x="label" y="bill" unit={c} highlight={(d) => d.label === 'With solar'} /></ChartBox>
            <section className="card text-sm"><p>System cost after subsidy: <b>{money(p.cost, c)}</b>. Estimated 25-year net saving: <b className={p.net25 >= 0 ? 'text-emerald-600' : 'text-red-600'}>{money(p.net25, c)}</b>.</p>
              <p className="mt-2 flex items-center gap-2"><Leaf size={16} className="text-leaf" />CO₂ avoided: about {num(p.co2Year, 0)} kg per year.</p>
              <p className="muted mt-3 text-xs">Assumptions: output = kW × sun hours × 30 × {PERFORMANCE_RATIO} performance ratio; generated units offset consumed units (no export credit); 0.5% yearly degradation; no tariff increase or maintenance cost. Real results depend on shading, tilt, net-metering rules and your provider.</p></section>
          </>}
          {!valid && <p className="card muted text-sm">Fix the highlighted fields to see results.</p>}
        </div>
      </div>
    </>
  )
}
