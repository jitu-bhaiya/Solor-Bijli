import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import * as auth from '../services/auth'
const Ctx = createContext()
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(Ctx)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false)
  useEffect(() => { auth.currentUser().then((u) => { setUser(u); setReady(true) }).catch(() => setReady(true)) }, [])
  const verify = useCallback(async (phone, code, name) => { const u = await auth.verifyOtp(phone, code, name); setUser(u); return u }, [])
  const logout = useCallback(async () => { await auth.signOut(); setUser(null) }, [])
  const value = useMemo(() => ({ user, ready, verify, logout, sendOtp: auth.sendOtp, isDemo: auth.isDemo }), [user, ready, verify, logout])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
