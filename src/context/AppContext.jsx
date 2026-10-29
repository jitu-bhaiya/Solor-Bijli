import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { demoReadings, demoAppliances, defaultSettings, demoUsers } from '../data/demo'
import { load, save, clearAll } from '../services/storage'
import * as db from '../services/db'
import { useAuth } from './AuthContext'
const Ctx = createContext()
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(Ctx)
export function AppProvider({ children }) {
  const { user, isDemo } = useAuth()
  const remote = !isDemo && !!user // Supabase mode with a signed-in user: data lives in the database
  const [settings, setSettings] = useState(() => ({ ...defaultSettings, ...load('bs_settings', {}) }))
  const [appliances, setAppliances] = useState(() => load('bs_appliances', demoAppliances))
  const [readings, setReadings] = useState(() => load('bs_readings', null) ?? demoReadings())
  const [users, setUsers] = useState(() => load('bs_users', demoUsers))
  const [synced, setSynced] = useState(false)
  const [toast, setToast] = useState(null)
  const notify = useCallback((msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2600) }, [])
  useEffect(() => {
    if (!remote) { setSynced(false); return }
    let off = false; setSynced(false); setUsers([])
    ;(async () => {
      try {
        const d = await db.loadUserData(user.id); if (off) return
        setSettings(d.settings ? { ...defaultSettings, ...d.settings } : defaultSettings)
        setAppliances(d.appliances ?? demoAppliances); setReadings(d.readings ?? demoReadings()); setSynced(true)
      } catch { notify('Could not load your data', 'err') }
      if (user.role === 'admin') { try { const u = await db.adminUsers(); if (!off) setUsers(u) } catch { notify('Could not load users', 'err') } }
    })()
    return () => { off = true }
  }, [remote, user?.id, user?.role, notify]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { document.documentElement.classList.toggle('dark', settings.theme === 'dark') }, [settings.theme])
  useEffect(() => { if (!remote) save('bs_settings', settings) }, [settings, remote])
  useEffect(() => { if (!remote) save('bs_appliances', appliances) }, [appliances, remote])
  useEffect(() => { if (!remote) save('bs_readings', readings) }, [readings, remote])
  useEffect(() => { if (!remote) save('bs_users', users) }, [users, remote])
  useEffect(() => { if (!remote || !synced) return; const t = setTimeout(() => db.saveUserData(user.id, settings, appliances).catch(() => notify('Sync failed. Changes may not be saved.', 'err')), 600); return () => clearTimeout(t) }, [settings, appliances, synced, remote, user?.id, notify])
  useEffect(() => { if (!remote || !synced) return; const t = setTimeout(() => db.saveReadings(user.id, readings).catch(() => notify('Sync failed. Changes may not be saved.', 'err')), 600); return () => clearTimeout(t) }, [readings, synced, remote, user?.id, notify])
  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), [])
  const reset = useCallback(() => { if (!remote) clearAll(); setSettings(defaultSettings); setAppliances(demoAppliances); setReadings(demoReadings()); if (!remote) setUsers(demoUsers); notify('Demo data restored') }, [notify, remote])
  const value = useMemo(() => ({ settings, update, appliances, setAppliances, readings, setReadings, toast, notify, reset, users, setUsers }), [settings, update, appliances, readings, toast, notify, reset, users])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
