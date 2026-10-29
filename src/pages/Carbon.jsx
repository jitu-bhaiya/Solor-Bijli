import { Leaf, TreePine, CloudOff } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { monthly } from '../utils/calc'
import { solarPlan } from '../utils/solar'
import { co2, trees, KG_PER_TREE_YEAR } from '../utils/carbon'
import { num } from '../utils/format'
import StatCard from '../components/cards/StatCard'
import { PageHeader, Field } from '../components/common/UI'
import { ChartBox, BarSeries } from '../components/charts/Charts'
export default function Carbon() {
  const { settings, update, readings } = useApp()
  const f = Number(settings.emissionFactor) || 0.82, ms = monthly(readings), cur = ms.at(-1), prev = ms.at(-2)
  const kg = co2(cur.projected, f), pk = prev ? co2(prev.projected, f) : null
  const sol = settings.solar ? solarPlan(settings.solar, cur.projected, settings.tariff, f) : null
  return (
    <>
      <PageHeader title="Carbon footprint" sub="CO₂ estimated from your usage and the grid emission factor. Demo readings." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Leaf} label="CO₂ this month (full month)" value={kg} suffix="kg" delta={pk ? (kg / pk - 1) * 100 : null} />
        <StatCard icon={TreePine} label="Trees needed to offset per year" value={trees(kg * 12)} />
        <StatCard icon={CloudOff} label="CO₂ solar could avoid per year" value={sol?.co2Year ?? 0} suffix="kg" />
      </div>
      {!sol && <p className="muted mt-2 text-sm">Save a plan in Solar Savings to see avoided emissions.</p>}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><ChartBox title="Monthly CO₂ emissions" desc="kg CO₂ per month, normalised to full months."><BarSeries data={ms.map((m) => ({ label: m.month, kg: co2(m.projected, f) }))} y="kg" unit="kg" color="#10b981" /></ChartBox></div>
        <section className="card space-y-3"><Field label="Emission factor (kg CO₂ per kWh)"><input className="input" inputMode="decimal" value={settings.emissionFactor} onChange={(e) => update({ emissionFactor: e.target.value })} /></Field>
          <p className="muted text-xs">Default 0.82 is an approximate Indian grid average; check the latest CEA figure. One tree is assumed to absorb about {KG_PER_TREE_YEAR} kg CO₂ per year. All values are estimates. You use about {num(cur.avg * f)} kg CO₂ per day.</p></section>
      </div>
    </>
  )
}
