import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, IndianRupee, Gauge, PiggyBank } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { monthly, billFromSlabs, applianceKwh, detectAlerts } from '../utils/calc'
import { buildInsights, totalSavings } from '../utils/insights'
import { money } from '../utils/format'
import { HOURLY } from '../data/demo'
import StatCard from '../components/cards/StatCard'
import { PageHeader, Badge, Empty } from '../components/common/UI'
import { ChartBox, DailyLine, BarSeries, Donut, BillArea } from '../components/charts/Charts'
export default function Dashboard() {
  const { readings, settings, appliances } = useApp()
  const months = monthly(readings)
  const [m, setM] = useState(months.at(-1)?.month)
  if (!months.length) return <Empty title="No readings yet" text="Add readings in Usage History to see analytics." />
  const idx = Math.max(0, months.findIndex((x) => x.month === m)), cur = months[idx], prev = months[idx - 1]
  const bill = (x) => billFromSlabs(x.projected, settings.tariff).total
  const d = (a, b) => (b ? (a / b - 1) * 100 : null)
  const insights = buildInsights(readings, appliances, settings), alerts = detectAlerts(readings, settings).slice(0, 4)
  const daily = readings.filter((r) => r.date.startsWith(cur.month)).map((r) => ({ label: r.date.slice(8), kwh: r.kwh }))
  const hourly = HOURLY.map((s, h) => ({ label: `${h}h`, kwh: +(s * cur.avg).toFixed(2), peak: h >= 18 && h <= 22 }))
  const split = appliances.map((a) => ({ name: a.name, value: applianceKwh(a) }))
  return (
    <>
      <PageHeader title="Dashboard" sub="Sample values are demo data, not live meter readings.">
        <select aria-label="Select month" className="input w-auto" value={cur.month} onChange={(e) => setM(e.target.value)}>{months.map((x) => <option key={x.month}>{x.month}</option>)}</select>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Zap} label="Consumption this month" value={cur.kwh} suffix="kWh" delta={d(cur.avg, prev?.avg)} />
        <StatCard icon={IndianRupee} label="Estimated bill (full month)" value={bill(cur)} prefix={settings.currency} delta={prev ? d(bill(cur), bill(prev)) : null} />
        <StatCard icon={Gauge} label="Average daily usage" value={cur.avg} suffix="kWh" delta={d(cur.avg, prev?.avg)} />
        <StatCard icon={PiggyBank} label="Potential monthly savings" value={totalSavings(insights)} prefix={settings.currency} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartBox title="Daily consumption" desc={`kWh per day in ${cur.month} (demo data).`}><DailyLine data={daily} /></ChartBox>
        <ChartBox title="Monthly consumption" desc="Full-month kWh, normalised from daily averages (demo data)."><BarSeries data={months.map((x) => ({ label: x.month, kwh: x.projected }))} highlight={(x) => x.label === cur.month} /></ChartBox>
        <ChartBox title="Peak-hour usage" desc="Modelled hourly load; 6–10 pm highlighted. Demo profile, not measured."><BarSeries data={hourly} y="kwh" highlight={(x) => x.peak} /></ChartBox>
        <ChartBox title="Appliance share" desc="Monthly kWh by appliance from the Appliances page."><Donut data={split} /></ChartBox>
        <ChartBox title="Estimated bill trend" desc="Bill per month using your tariff slabs."><BillArea cur={settings.currency} data={months.map((x) => ({ label: x.month, bill: bill(x) }))} /></ChartBox>
        <section className="card"><h3 className="mb-3 font-medium">Recent activity</h3>
          {alerts.length ? <ul className="space-y-3">{alerts.map((a) => <li key={a.id} className="flex items-start gap-2 text-sm"><Badge level={a.severity} /><span>{a.reason}</span></li>)}</ul> : <p className="muted text-sm">No alerts. Usage looks normal.</p>}
          <Link to="/alerts" className="mt-4 inline-block text-sm font-medium text-volt">View all alerts</Link></section>
      </div>
    </>
  )
}
