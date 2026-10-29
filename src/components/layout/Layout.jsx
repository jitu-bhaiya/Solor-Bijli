import { useState } from 'react'
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Lightbulb, Calculator, Plug, History, BellRing, Settings, Menu, X, Sun, Moon, Bell, LogOut, SunMedium, Leaf, Zap, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { detectAlerts } from '../../utils/calc'
const nav = [['/dashboard', 'Dashboard', LayoutDashboard], ['/insights', 'Energy Insights', Lightbulb], ['/bill', 'Bill Predictor', Calculator], ['/appliances', 'Appliances', Plug], ['/history', 'Usage History', History], ['/alerts', 'Alerts', BellRing], ['/solar', 'Solar Savings', SunMedium], ['/carbon', 'Carbon Footprint', Leaf], ['/settings', 'Settings', Settings]]
export default function Layout() {
  const [open, setOpen] = useState(false)
  const { settings, update, readings, toast } = useApp()
  const { user, logout } = useAuth(), navigate = useNavigate()
  const { pathname } = useLocation()
  const count = detectAlerts(readings, settings).length
  const title = nav.find(([p]) => p === pathname)?.[1] ?? 'Solor-Bijli'
  const dark = settings.theme === 'dark'
  return (
    <div className="min-h-screen lg:flex">
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy p-4 text-slate-200 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? '' : '-translate-x-full'}`} aria-label="Main navigation">
        <div className="mb-6 flex items-center justify-between"><Link to="/" className="flex items-center gap-2 text-lg font-semibold text-white"><Zap className="text-emerald-400" size={20} />Solor-Bijli</Link>
          <button className="lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button></div>
        <nav className="space-y-1">{nav.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm ${isActive ? 'bg-volt text-white' : 'hover:bg-white/10'}`}><Icon size={18} aria-hidden />{label}</NavLink>))}</nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <button className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button>
          <div className="min-w-0 flex-1"><p className="truncate font-medium">{title}</p><p className="muted hidden text-xs sm:block">Welcome back, {user.name}</p></div>
          <button className="btn btn-ghost px-2.5" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => update({ theme: dark ? 'light' : 'dark' })}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <Link to="/alerts" className="btn btn-ghost relative px-2.5" aria-label={`Notifications: ${count} alerts`}><Bell size={18} />{count > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-red-600 text-[10px] text-white">{count}</span>}</Link>
          <Link to="/settings" className="grid size-10 place-items-center rounded-full bg-volt text-sm font-semibold text-white" aria-label="Profile settings">{user.name.slice(0, 1).toUpperCase()}</Link>
          <button className="btn btn-ghost px-2.5" aria-label="Log out" onClick={async () => { await logout(); navigate('/login') }}><LogOut size={18} /></button>
        </header>
        <main className="p-4 lg:p-8"><motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}><Outlet /></motion.div></main>
      </div>
      {toast && <div role="status" className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${toast.type === 'err' ? 'bg-red-600' : 'bg-emerald-600'}`}>{toast.type === 'err' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}{toast.msg}</div>}
    </div>
  )
}
