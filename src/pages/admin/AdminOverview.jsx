import { Users, UserCheck, Zap, IndianRupee, Download } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { billFromSlabs } from '../../utils/calc'
import { download, toCSV } from '../../utils/format'
import StatCard from '../../components/cards/StatCard'
import { PageHeader, Badge } from '../../components/common/UI'
import { ChartBox, BarSeries } from '../../components/charts/Charts'
export default function AdminOverview() {
  const { users, settings, notify } = useApp()
  const c = settings.currency, bill = (k) => billFromSlabs(k, settings.tariff).total
  const active = users.filter((u) => u.status === 'active'), heavy = users.filter((u) => u.kwh > 600)
  const exp = () => { download(toCSV(users.map(({ name, email, plan, status, kwh }) => ({ name, email, plan, status, monthly_kwh: kwh, est_bill: bill(kwh).toFixed(0) }))), 'solor-bijli-users.csv', 'text/csv'); notify('CSV exported') }
  return (
    <>
      <PageHeader title="Platform overview" sub="Demo users and usage. Not connected to a live database."><button className="btn btn-ghost" onClick={exp}><Download size={16} />Export users</button></PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={users.length} />
        <StatCard icon={UserCheck} label="Active users" value={active.length} />
        <StatCard icon={Zap} label="Active usage / month" value={active.reduce((t, u) => t + u.kwh, 0)} suffix="kWh" />
        <StatCard icon={IndianRupee} label="Estimated monthly billing" value={active.reduce((t, u) => t + bill(u.kwh), 0)} prefix={c} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><ChartBox title="Usage by user" desc="Monthly kWh per user (demo data). Green bars exceed 600 kWh."><BarSeries data={users} x="name" y="kwh" highlight={(u) => u.kwh > 600} /></ChartBox></div>
        <section className="card"><h2 className="mb-3 font-medium">High-usage users</h2>
          {heavy.length ? <ul className="space-y-3 text-sm">{heavy.map((u) => <li key={u.id} className="flex items-center justify-between gap-2"><span>{u.name}<span className="muted block text-xs">{u.plan}</span></span><Badge level="Medium">{u.kwh} kWh</Badge></li>)}</ul> : <p className="muted text-sm">No user is above 600 kWh.</p>}</section>
      </div>
    </>
  )
}
