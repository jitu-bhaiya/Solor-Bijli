import { supabase } from './supabase'
import { load, save } from './storage'
export const isDemo = !supabase
// DEMO ONLY: this number is treated as admin in demo mode. In Supabase mode, roles come from the profiles table.
export const DEMO_ADMIN = '+919999999999'
const pending = {}
const NO_ACCOUNT = 'No account found for this number. Please sign up first.'
export const normalizePhone = (v) => { const d = String(v).replace(/\D/g, ''); return /^[6-9]\d{9}$/.test(d) ? `+91${d}` : null }
async function profileOf(u) {
  const { data } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle()
  return { id: u.id, phone: u.phone ? `+${u.phone.replace('+', '')}` : '', name: data?.name ?? 'User', role: data?.role ?? 'user', status: data?.status ?? 'active' }
}
export async function sendOtp(phone, mode, name) {
  if (supabase) {
    const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: mode === 'signup', data: name ? { name } : undefined } })
    if (error) throw new Error(/signups? not allowed|not found/i.test(error.message) ? NO_ACCOUNT : error.message)
    return {}
  }
  const exists = load('bs_accounts', []).some((a) => a.phone === phone) || phone === DEMO_ADMIN
  if (mode === 'login' && !exists) throw new Error(NO_ACCOUNT)
  if (mode === 'signup' && exists) throw new Error('This number is already registered. Please log in.')
  const code = String(Math.floor(100000 + Math.random() * 900000))
  pending[phone] = { code, exp: Date.now() + 300000, tries: 0 }
  return { demoCode: code }
}
export async function verifyOtp(phone, code, name) {
  if (supabase) {
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' })
    if (error) throw new Error('Invalid or expired code.')
    return profileOf(data.user)
  }
  const p = pending[phone]
  if (!p || Date.now() > p.exp) throw new Error('Code expired. Request a new one.')
  if (++p.tries > 5) { delete pending[phone]; throw new Error('Too many attempts. Request a new code.') }
  if (p.code !== code) throw new Error('Incorrect code.')
  delete pending[phone]
  const accs = load('bs_accounts', [])
  let a = accs.find((x) => x.phone === phone)
  if (!a) { a = { id: phone, phone, name: name || 'Admin', role: phone === DEMO_ADMIN ? 'admin' : 'user' }; save('bs_accounts', [...accs, a]) }
  save('bs_session', a)
  return a
}
export async function currentUser() {
  if (supabase) { const { data } = await supabase.auth.getSession(); return data.session ? profileOf(data.session.user) : null }
  return load('bs_session', null)
}
export async function signOut() { if (supabase) await supabase.auth.signOut(); else try { localStorage.removeItem('bs_session') } catch { /* ignore */ } }
