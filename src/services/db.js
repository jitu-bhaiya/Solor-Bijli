import { supabase } from './supabase'
const ok = ({ error, data }) => { if (error) throw new Error(error.message); return data }
export async function loadUserData(uid) {
  const [ud, rd] = await Promise.all([
    supabase.from('user_data').select('settings,appliances').eq('user_id', uid).maybeSingle(),
    supabase.from('readings').select('date,kwh').eq('user_id', uid).order('date').limit(1000),
  ])
  const u = ok(ud), r = ok(rd)
  return { settings: u?.settings ?? null, appliances: u?.appliances ?? null, readings: r?.length ? r.map((x) => ({ date: x.date, kwh: Number(x.kwh) })) : null }
}
export const saveUserData = async (uid, settings, appliances) => ok(await supabase.from('user_data').upsert({ user_id: uid, settings, appliances, updated_at: new Date().toISOString() }))
export const saveReadings = async (uid, readings) => ok(await supabase.from('readings').upsert(readings.map((r) => ({ user_id: uid, date: r.date, kwh: r.kwh })), { onConflict: 'user_id,date' }))
export async function adminUsers() {
  const [p, u] = await Promise.all([supabase.from('profiles').select('id,name,phone,role,status'), supabase.rpc('admin_user_usage')])
  const usage = Object.fromEntries((ok(u) ?? []).map((x) => [x.user_id, Number(x.kwh)]))
  return (ok(p) ?? []).map((x) => ({ id: x.id, name: x.name, email: x.phone ?? '', plan: x.role === 'admin' ? 'Admin' : 'User', status: x.status ?? 'active', kwh: Math.round(usage[x.id] ?? 0) }))
}
export const setStatus = async (id, status) => ok(await supabase.from('profiles').update({ status }).eq('id', id))
