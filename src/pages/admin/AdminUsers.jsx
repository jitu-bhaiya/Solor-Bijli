import { useState } from 'react'
import { Plus, Trash2, Ban, CheckCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import * as db from '../../services/db'
import { billFromSlabs } from '../../utils/calc'
import { PageHeader, Field, Badge, Empty } from '../../components/common/UI'
export default function AdminUsers() {
  const { users, setUsers, settings, notify } = useApp()
  const { isDemo } = useAuth()
  const [q, setQ] = useState(''), [f, setF] = useState({ name: '', email: '', plan: 'Residential', kwh: '' }), [err, setErr] = useState({})
  const c = settings.currency, bill = (k) => billFromSlabs(k, settings.tariff).total
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
  const toggle = async (u) => { const next = u.status === 'active' ? 'suspended' : 'active'; if (!isDemo) { try { await db.setStatus(u.id, next) } catch { return notify('Could not update user', 'err') } } setUsers((l) => l.map((x) => (x.id === u.id ? { ...x, status: next } : x))); notify(`${u.name} ${next === 'active' ? 'activated' : 'suspended'}`) }
  const remove = (u) => { if (window.confirm(`Delete ${u.name}?`)) { setUsers((l) => l.filter((x) => x.id !== u.id)); notify('User deleted') } }
  return (
    <>
      <PageHeader title="Users" sub="Add, suspend or remove users." />
      {isDemo && <form onSubmit={add} noValidate className="card grid items-start gap-3 sm:grid-cols-5">
        <Field label="Name" error={err.name}><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Email" error={err.email}><input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Plan"><select className="input" value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value })}><option>Residential</option><option>Commercial</option></select></Field>
        <Field label="Monthly kWh" error={err.kwh}><input className="input" inputMode="decimal" value={f.kwh} onChange={(e) => setF({ ...f, kwh: e.target.value })} /></Field>
        <button className="btn sm:mt-6"><Plus size={16} />Add user</button>
      </form>}
      <section className="card mt-4"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-medium">All users</h2><input aria-label="Search users" className="input max-w-xs" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {list.length ? <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="muted text-left"><th className="py-2">User</th><th>Plan</th><th>kWh</th><th>Est. bill</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{list.map((u) => <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800"><td className="py-2">{u.name}<div className="muted text-xs">{u.email}</div></td><td>{u.plan}</td><td>{u.kwh}</td><td>{c}{Math.round(bill(u.kwh))}</td><td><Badge level={u.status === 'active' ? 'Low' : 'High'}>{u.status}</Badge></td>
            <td className="whitespace-nowrap text-right"><button className="btn btn-ghost mr-1 px-2.5" aria-label={u.status === 'active' ? `Suspend ${u.name}` : `Activate ${u.name}`} onClick={() => toggle(u)}>{u.status === 'active' ? <Ban size={15} /> : <CheckCircle size={15} />}</button>{isDemo && <button className="btn btn-ghost px-2.5" aria-label={`Delete ${u.name}`} onClick={() => remove(u)}><Trash2 size={15} /></button>}</td></tr>)}</tbody></table></div>
          : <Empty title="No users found" text="Try a different search or add a user above." />}</section>
    </>
  )
}
