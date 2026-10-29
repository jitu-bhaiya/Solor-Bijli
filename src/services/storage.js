export const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
export const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage blocked */ } }
export const clearAll = () => ['bs_settings', 'bs_appliances', 'bs_readings', 'bs_users'].forEach((k) => { try { localStorage.removeItem(k) } catch { /* ignore */ } })
