import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { detectAlerts } from '../utils/calc'
import { PageHeader, Badge, Empty } from '../components/common/UI'
export default function Alerts() {
  const { readings, settings } = useApp()
  const alerts = detectAlerts(readings, settings)
  return (
    <>
      <PageHeader title="Alerts" sub="Based on the thresholds in Settings and a 2-standard-deviation spike rule over the prior 30 days. This does not detect electrical faults." />
      {alerts.length ? <ul className="space-y-3">{alerts.map((a) => (
        <li key={a.id} className="card"><div className="flex items-center gap-2"><Badge level={a.severity} /><h2 className="font-medium">{a.title}</h2></div>
          <p className="mt-2 text-sm">{a.reason}</p><p className="muted mt-1 text-sm">Suggested action: {a.action}</p></li>))}</ul>
        : <Empty title="All clear" text="No usage exceeds your thresholds. Adjust them in Settings if needed." />}
      <Link to="/settings" className="mt-4 inline-block text-sm font-medium text-volt">Edit thresholds and budget</Link>
    </>
  )
}
