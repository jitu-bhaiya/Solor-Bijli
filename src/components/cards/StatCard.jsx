import { TrendingUp, TrendingDown } from 'lucide-react'
import useCountUp from '../../hooks/useCountUp'
import { num } from '../../utils/format'
export default function StatCard({ icon: Icon, label, value, prefix = '', suffix = '', delta, goodWhenDown = true }) {
  const v = useCountUp(value)
  const good = delta == null ? null : goodWhenDown ? delta <= 0 : delta >= 0
  return (
    <div className="card">
      <div className="flex items-center justify-between"><span className="muted text-sm">{label}</span>
        <span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-volt dark:bg-slate-800"><Icon size={18} aria-hidden /></span></div>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-navy dark:text-white">{prefix}{num(v, value < 100 ? 1 : 0)}<span className="muted ml-1 text-base font-normal">{suffix}</span></p>
      {delta != null && (<p className={`mt-2 flex items-center gap-1 text-sm ${good ? 'text-emerald-600' : 'text-red-600'}`}>
        {delta >= 0 ? <TrendingUp size={16} aria-hidden /> : <TrendingDown size={16} aria-hidden />}{Math.abs(delta).toFixed(1)}% vs previous month</p>)}
    </div>
  )
}
