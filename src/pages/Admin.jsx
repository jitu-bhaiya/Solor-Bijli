import { useState } from 'react'
import { Users, UserCheck, Zap, IndianRupee, Download, LogOut, Lock, Plus, Trash2, Ban, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { billFromSlabs } from '../utils/calc'
import { download, toCSV } from '../utils/format'
import StatCard from '../components/cards/StatCard'
import { PageHeader, Field, Badge, Empty } from '../components/common/UI'
import { ChartBox, BarSeries } from '../components/charts/Charts'
function Login({ onLogin }) {
  const [p, setP] = useState(''), [e, setE] = useState('')
  return (
    <form className="card mx-auto mt-10 max-w-sm space-y-4" onSubmit={(ev) => { ev.preventDefault(); setE(onLogin(p) ? '' : 'Incorrect passcode.') }}>
      <h1 className="flex items-center gap-2 text-xl font-semibold"><Lock size={18} />Admin sign in</h1>
      <Field label="Passcode" error={e}><input type="password" className="input" value={p} onChange={(x) => setP(x.target.value)} autoFocus /></Field>
      <button className="btn w-full">Sign in</button>
      <p className="muted text-xs">Demo passcode: admin123. This browser-only check is not real security; production needs Supabase Auth with server-side roles.</p>
    </form>
  )
}
export default function Admin() {
  const { users, setUsers, settings, isAdmin, adminLogin, adminLogout, notify } = useApp()
  const [q, setQ] = useState(''), [f, setF] = useState({ name: '', email: '', plan: 'Residential', kwh: '' }), [err, setErr] = useState({})
  if (!isAdmin) return <Login onLogin={adminLogin} />
  const c = settings.currency, bill = (k) => billFromSlabs(k, settings.tariff).total
  const active = users.filter((u) => u.status === 'active')
  const list = users.filter((u) => (u.name + u.email).toLowerCase().includes(q.toLowerCase()))
  const add = (ev) => {
    ev.preventDefault(); const x = {}
    if (!f.name.trim()) x.name = 'Enter a name.'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Enter a valid email.'
    else if (users.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) x.email = 'Email already exists.'
    if (!(Number(f.kwh) > 0 && Number(f.kwh) <= 100000)) x.kwh = 'Enter monthly kWh above 0.'
    setErr(x); if (Object.keys(x).length) return
    setUsers((l) => [...l, { id: Date.now(), name: f.name.trim(), email: f.email.trim(), plan: f.plan, status: 'active', kwh: +f.kwh }])
    setF({ name: '', email: '', plan: 'Residential', kwh: '' }); notify('User added')
  }
  const toggle = (u) => { setUsers((l) => l.map((x) => (x.id === u.id ? { ...x, status: x.status === 'active' ? 'suspended' : 'active' } : x))); notify(`${u.name} ${u.status === 'active' ? 'suspended' : 'activated'}`) }
  const remove = (u) => { if (window.confirm(`Delete ${u.name}?`)) { setUsers((l) => l.filter((x) => x.id !== u.id)); notify('User deleted') } }
  const exp = () => { download(toCSV(users.map(({ name, email, plan, status, kwh }) => ({ name, email, plan, status, monthly_kwh: kwh, est_bill: bill(kwh).toFixed(0) }))), 'solor-bijli-users.csv', 'text/csv'); notify('CSV exported') }
  return (
    <>
      <PageHeader title="Admin dashboard" sub="Demo users and usage. Not connected to a live database.">
        <button className="btn btn-ghost" onClick={exp}><Download size={16} />Export users</button>
        <button className="btn btn-ghost" onClick={adminLogout}><LogOut size={16} />Sign out</button>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={users.length} />
        <StatCard icon={UserCheck} label="Active users" value={active.length} />
        <StatCard icon={Zap} label="Active usage / month" value={active.reduce((t, u) => t + u.kwh, 0)} suffix="kWh" />
        <StatCard icon={IndianRupee} label="Estimated monthly billing" value={active.reduce((t, u) => t + bill(u.kwh), 0)} prefix={c} />
      </div>
      <div className="mt-4"><ChartBox title="Usage by user" desc="Monthly kWh per user (demo data). Green bars exceed 600 kWh."><BarSeries data={users} x="name" y="kwh" highlight={(u) => u.kwh > 600} /></ChartBox></div>
      <form onSubmit={add} noValidate className="card mt-4 grid items-start gap-3 sm:grid-cols-5">
        <Field label="Name" error={err.name}><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Email" error={err.email}><input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Plan"><select className="input" value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value })}><option>Residential</option><option>Commercial</option></select></Field>
        <Field label="Monthly kWh" error={err.kwh}><input className="input" inputMode="decimal" value={f.kwh} onChange={(e) => setF({ ...f, kwh: e.target.value })} /></Field>
        <button className="btn sm:mt-6"><Plus size={16} />Add user</button>
      </form>
      <section className="card mt-4"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-medium">Users</h2><input aria-label="Search users" className="input max-w-xs" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {list.length ? <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="muted text-left"><th className="py-2">User</th><th>Plan</th><th>kWh</th><th>Est. bill</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{list.map((u) => <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800"><td className="py-2">{u.name}<div className="muted text-xs">{u.email}</div></td><td>{u.plan}</td><td>{u.kwh}</td><td>{c}{Math.round(bill(u.kwh))}</td><td><Badge level={u.status === 'active' ? 'Low' : 'High'}>{u.status}</Badge></td>
            <td className="whitespace-nowrap text-right"><button className="btn btn-ghost mr-1 px-2.5" aria-label={u.status === 'active' ? `Suspend ${u.name}` : `Activate ${u.name}`} onClick={() => toggle(u)}>{u.status === 'active' ? <Ban size={15} /> : <CheckCircle size={15} />}</button><button className="btn btn-ghost px-2.5" aria-label={`Delete ${u.name}`} onClick={() => remove(u)}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div>
          : <Empty title="No users found" text="Try a different search or add a user above." />}</section>
    </>
  )
}
