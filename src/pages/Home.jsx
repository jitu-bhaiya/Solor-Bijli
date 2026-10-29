import { Link } from 'react-router-dom'
import { Zap, BarChart3, Receipt, ShieldAlert, Leaf, Plug, Sparkles, ArrowDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MiniArea } from '../components/charts/Charts'
const features = [[BarChart3, 'Consumption tracking', 'Daily, weekly and monthly usage in clear charts.'], [Receipt, 'Bill prediction', 'Estimate bills with your own tariff slabs and taxes.'], [ShieldAlert, 'Anomaly detection', 'Flag spikes with a documented 2-sigma rule and thresholds.'], [Leaf, 'Energy optimisation', 'Rule-based tips with estimated rupee savings.']]
const steps = [['Add your data', 'Enter readings and appliances, or explore the demo data.'], ['Set your tariff', 'Configure slabs, fixed charges and taxes for your provider.'], ['Act on insights', 'Follow prioritised steps and watch your projected bill fall.']]
export default function Home() {
  const { readings } = useApp()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-navy dark:text-white"><Zap className="text-leaf" size={20} />Solor-Bijli</Link>
          <nav className="flex items-center gap-4 text-sm" aria-label="Site"><a href="#top" className="hidden sm:inline">Home</a><a href="#features" className="hidden sm:inline">Features</a><a href="#how" className="hidden sm:inline">How it works</a><Link to="/login">Log in</Link><Link to="/signup" className="btn min-h-0 px-3 py-1">Sign up</Link><Link to="/admin" className="rounded-md border border-slate-300 px-2.5 py-1 dark:border-slate-700">Admin</Link><a href="#about" className="hidden sm:inline">About</a></nav>
        </div>
      </header>
      <section id="top" className="bg-navy text-white"><div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <div><h1 className="text-4xl font-bold leading-tight sm:text-5xl">Understand Your Energy. Reduce Your Electricity Bill.</h1>
          <p className="mt-5 max-w-lg text-slate-300">See where your units go, estimate your next bill from your own tariff, and get rule-based savings suggestions you can act on today.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/dashboard" className="btn px-5">Explore Dashboard</Link><a href="#features" className="btn btn-ghost border-white/30 text-white hover:bg-white/10"><ArrowDown size={16} />Discover Features</a></div></div>
        <div className="rounded-2xl bg-white p-5 text-slate-800 shadow-xl dark:bg-slate-900 dark:text-slate-200">
          <div className="flex items-center justify-between"><span className="text-sm font-medium">Last 30 days</span><span className="rounded-md bg-slate-900 px-2 py-1 font-mono text-xs tabular-nums text-emerald-400">{readings.at(-1)?.kwh} kWh today</span></div>
          <div className="mt-3 h-40" role="img" aria-label="Sample area chart of the last 30 days of demo usage"><MiniArea data={readings.slice(-30)} /></div>
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"><Sparkles size={16} className="mt-0.5 shrink-0" />Raising AC setpoint by 2°C could save about 12% of AC energy. Demo data.</p></div>
      </div></section>
      <section id="features" className="mx-auto max-w-6xl px-4 py-16"><h2 className="text-2xl font-semibold">Everything you need to read your meter</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(([I, t, s]) => <div key={t} className="card"><I className="text-volt" aria-hidden /><h3 className="mt-3 font-medium">{t}</h3><p className="muted mt-1 text-sm">{s}</p></div>)}</div></section>
      <section id="how" className="bg-white py-16 dark:bg-slate-900"><div className="mx-auto max-w-6xl px-4"><h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">{steps.map(([t, s], i) => <li key={t} className="flex gap-4"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-volt font-semibold text-white">{i + 1}</span><div><h3 className="font-medium">{t}</h3><p className="muted text-sm">{s}</p></div></li>)}</ol></div></section>
      <section id="about" className="mx-auto max-w-6xl px-4 py-16"><h2 className="text-2xl font-semibold">Built for clarity, honest about limits</h2>
        <p className="muted mt-3 max-w-2xl text-sm">Solor-Bijli runs entirely in your browser with demo data and a transparent rule-based engine. It does not read live meters or call an AI service unless you add that integration. Actual bills vary by provider, tariff category, taxes and subsidies.</p>
        <Link to="/appliances" className="btn mt-6"><Plug size={16} />Try the appliance calculator</Link></section>
      <footer className="border-t border-slate-200 py-8 text-center text-sm dark:border-slate-800 muted">© Solor-Bijli · Demo project by Jitendra Sharma</footer>
    </div>
  )
}
