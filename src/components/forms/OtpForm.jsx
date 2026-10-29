import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Smartphone, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { normalizePhone, DEMO_ADMIN } from '../../services/auth'
import { Field } from '../common/UI'
export default function OtpForm({ mode, requireRole, onDone, title }) {
  const { sendOtp, verify, logout, isDemo } = useAuth()
  const [name, setName] = useState(''), [mobile, setMobile] = useState(''), [code, setCode] = useState('')
  const [step, setStep] = useState(1), [err, setErr] = useState({}), [busy, setBusy] = useState(false), [demo, setDemo] = useState(''), [wait, setWait] = useState(0)
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t) }, [wait])
  const send = async (ev) => {
    ev?.preventDefault()
    const e = {}, phone = normalizePhone(mobile)
    if (mode === 'signup' && name.trim().length < 2) e.name = 'Enter your name.'
    if (!phone) e.mobile = 'Enter a valid 10-digit Indian mobile number.'
    setErr(e); if (Object.keys(e).length) return
    setBusy(true)
    try { const r = await sendOtp(phone, mode, name.trim()); setDemo(r.demoCode ?? ''); setStep(2); setWait(30); setCode('') }
    catch (x) { setErr({ mobile: x.message }) }
    setBusy(false)
  }
  const check = async (ev) => {
    ev.preventDefault()
    if (!/^\d{6}$/.test(code)) return setErr({ code: 'Enter the 6-digit code.' })
    setBusy(true)
    try {
      const u = await verify(normalizePhone(mobile), code, name.trim())
      if (requireRole && u.role !== requireRole) { await logout(); setErr({ code: 'This number does not have admin access.' }); setBusy(false); return }
      onDone(u)
    } catch (x) { setErr({ code: x.message }); setBusy(false) }
  }
  return (
    <div className="card w-full max-w-sm space-y-4">
      <h1 className="flex items-center gap-2 text-xl font-semibold">{requireRole ? <ShieldCheck size={20} /> : <Smartphone size={20} />}{title}</h1>
      {step === 1 ? (
        <form onSubmit={send} className="space-y-4" noValidate>
          {mode === 'signup' && <Field label="Full name" error={err.name}><input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></Field>}
          <Field label="Mobile number" error={err.mobile}><div className="flex"><span className="grid place-items-center rounded-l-lg border border-r-0 border-slate-300 px-3 text-sm dark:border-slate-700">+91</span><input className="input rounded-l-none" inputMode="numeric" maxLength={10} autoComplete="tel-national" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} /></div></Field>
          <button className="btn w-full" disabled={busy}>{busy ? 'Sending…' : 'Send OTP'}</button>
        </form>
      ) : (
        <form onSubmit={check} className="space-y-4" noValidate>
          <p className="muted text-sm">Code sent to +91 {mobile}. <button type="button" className="font-medium text-volt" onClick={() => { setStep(1); setErr({}) }}>Change number</button></p>
          {demo && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">Demo mode: no SMS is sent. Your code is <b className="tabular-nums">{demo}</b></p>}
          <Field label="6-digit OTP" error={err.code}><input className="input tracking-widest" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} /></Field>
          <button className="btn w-full" disabled={busy}>{busy ? 'Verifying…' : 'Verify and continue'}</button>
          <button type="button" className="btn btn-ghost w-full" disabled={wait > 0 || busy} onClick={() => send()}>{wait > 0 ? `Resend in ${wait}s` : 'Resend OTP'}</button>
        </form>
      )}
      <div className="muted space-y-1 text-sm">
        {mode === 'login' && !requireRole && <p>New here? <Link to="/signup" className="font-medium text-volt">Create an account</Link></p>}
        {mode === 'signup' && <p>Already registered? <Link to="/login" className="font-medium text-volt">Log in</Link></p>}
        {requireRole && isDemo && <p className="text-xs">Demo admin number: {DEMO_ADMIN.slice(3)}</p>}
        <p><Link to="/" className="font-medium text-volt">Back to home</Link></p>
      </div>
    </div>
  )
}
