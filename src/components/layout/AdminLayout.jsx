import { useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutGrid, Users, Receipt, ShieldCheck, LogOut, Menu, X, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
const nav = [['/admin', 'Overview', LayoutGrid, true], ['/admin/users', 'Users', Users], ['/admin/tariff', 'Tariff and budget', Receipt]]
export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { toast } = useApp()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const title = nav.find(([p]) => p === pathname)?.[1] ?? 'Admin'
  return (
    <div className="min-h-screen lg:flex">
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 p-4 text-slate-300 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? '' : '-translate-x-full'}`} aria-label="Admin navigation">
        <div className="mb-6 flex items-center justify-between"><span className="flex items-center gap-2 text-lg font-semibold text-white"><ShieldCheck className="text-leaf" size={20} />Solor-Bijli Admin</span>
          <button className="lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button></div>
        <nav className="space-y-1">{nav.map(([to, label, Icon, end]) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm ${isActive ? 'bg-leaf text-slate-950 font-medium' : 'hover:bg-white/10'}`}><Icon size={18} aria-hidden />{label}</NavLink>))}</nav>
        <Link to="/dashboard" className="mt-6 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm hover:bg-white/10"><ExternalLink size={18} aria-hidden />View user dashboard</Link>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <button className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button>
          <p className="flex-1 font-medium">{title}</p>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">{user.name}</span>
          <button className="btn btn-ghost" onClick={logout}><LogOut size={16} />Sign out</button>
        </header>
        <main className="p-4 lg:p-8"><Outlet /></main>
      </div>
      {toast && <div role="status" className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${toast.type === 'err' ? 'bg-red-600' : 'bg-emerald-600'}`}>{toast.type === 'err' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}{toast.msg}</div>}
    </div>
  )
}
