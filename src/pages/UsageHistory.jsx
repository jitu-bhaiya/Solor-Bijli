import { useState } from 'react'
import { Download, Printer, Plus, FileText } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { downloadReport } from '../utils/pdf'
import { monthly, billFromSlabs, mean } from '../utils/calc'
import { download, toCSV, money, num } from '../utils/format'
import { isoDate } from '../data/demo'
import { PageHeader, Field, Empty } from '../components/common/UI'
import { ChartBox, BarSeries } from '../components/charts/Charts'
export default function UsageHistory() {
  const { readings, setReadings, settings, appliances, notify } = useApp()
  const { user } = useAuth()
  const [view, setView] = useState('daily'), [nd, setNd] = useState(isoDate(new Date())), [nk, setNk] = useState(''), [err, setErr] = useState('')
  const months = monthly(readings), rate = Object.fromEntries(months.map((m) => [m.month, billFromSlabs(m.projected, settings.tariff).total / m.projected]))
  const cost = (date, kwh) => kwh * (rate[date.slice(0, 7)] ?? 0)
  let rows = []
  if (view === 'daily') rows = readings.slice(-30).map((r) => ({ period: r.date, kwh: r.kwh, cost: cost(r.date, r.kwh) }))
  if (view === 'weekly') { const w = []; for (let i = readings.length; i > 0 && w.length < 12; i -= 7) { const s = readings.slice(Math.max(0, i - 7), i); w.unshift({ period: `${s[0].date} week`, kwh: +s.reduce((t, r) => t + r.kwh, 0).toFixed(1), cost: s.reduce((t, r) => t + cost(r.date, r.kwh), 0) }) } rows = w }
  if (view === 'monthly') rows = months.map((m) => ({ period: m.month, kwh: m.kwh, cost: billFromSlabs(m.kwh, settings.tariff).total }))
  const top = [...readings].sort((a, b) => b.kwh - a.kwh)[0], cur = months.at(-1), prev = months.at(-2)
  const add = (e) => {
    e.preventDefault()
    if (!nd || isNaN(nk) || nk === '' || Number(nk) <= 0 || Number(nk) > 500) return setErr('Enter a date and a reading between 0 and 500 kWh.')
    setErr(''); setReadings((l) => [...l.filter((r) => r.date !== nd), { date: nd, kwh: +nk }].sort((a, b) => a.date.localeCompare(b.date))); setNk(''); notify('Reading saved')
  }
  const csv = () => { download(toCSV(rows.map((r) => ({ period: r.period, kwh: r.kwh.toFixed(1), cost: r.cost.toFixed(0) }))), `solor-bijli-${view}.csv`, 'text/csv'); notify('CSV exported') }
  return (
    <>
      <PageHeader title="Usage history" sub="Demo data plus any readings you add.">
        <div role="group" aria-label="Period" className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">{['daily', 'weekly', 'monthly'].map((v) => <button key={v} aria-pressed={view === v} className={`px-3 py-2 text-sm capitalize ${view === v ? 'bg-volt text-white' : ''}`} onClick={() => setView(v)}>{v}</button>)}</div>
        <button className="btn btn-ghost" onClick={csv}><Download size={16} />Export CSV</button><button className="btn btn-ghost" onClick={async () => { try { await downloadReport({ settings, user, readings, appliances }); notify('PDF report downloaded') } catch { notify('Could not create PDF', 'err') } }}><FileText size={16} />PDF report</button><button className="btn btn-ghost" onClick={() => window.print()}><Printer size={16} />Print</button>
      </PageHeader>
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="muted text-sm">Highest day</p><p className="text-xl font-semibold">{top?.kwh} kWh</p><p className="muted text-xs">{top?.date}</p></div>
        <div className="card"><p className="muted text-sm">Average daily usage</p><p className="text-xl font-semibold">{num(mean(readings.map((r) => r.kwh)))} kWh</p></div>
        <div className="card"><p className="muted text-sm">This vs last month (daily avg)</p><p className="text-xl font-semibold">{prev ? `${((cur.avg / prev.avg - 1) * 100).toFixed(1)}%` : 'n/a'}</p></div>
      </div>
      {rows.length ? <div className="grid gap-4 lg:grid-cols-2">
        <ChartBox title="Consumption" desc={`kWh per ${view.replace('ly', '').replace('dai', 'day')} period.`}><BarSeries data={rows} x="period" y="kwh" /></ChartBox>
        <ChartBox title="Estimated cost" desc={`Cost in ${settings.currency} per period at your tariff.`}><BarSeries data={rows} x="period" y="cost" unit={settings.currency} color="#10b981" /></ChartBox></div> : <Empty title="No readings" text="Add a reading below." />}
      <form onSubmit={add} className="card mt-4 flex flex-wrap items-start gap-3 no-print" noValidate><Field label="Date"><input type="date" className="input" value={nd} onChange={(e) => setNd(e.target.value)} /></Field>
        <Field label="Reading (kWh)" error={err}><input className="input" inputMode="decimal" value={nk} onChange={(e) => setNk(e.target.value)} /></Field><button className="btn mt-6"><Plus size={16} />Save reading</button></form>
      <div className="card mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="muted text-left"><th className="py-2">Period</th><th>kWh</th><th>Cost</th></tr></thead><tbody>{rows.map((r) => <tr key={r.period} className="border-t border-slate-100 dark:border-slate-800"><td className="py-2">{r.period}</td><td>{num(r.kwh)}</td><td>{money(r.cost, settings.currency)}</td></tr>)}</tbody></table></div>
    </>
  )
}
