// DEMO DATA: synthetic values for presentation. Not real meter readings.
const pad = (n) => String(n).padStart(2, '0')
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const demoReadings = () => {
  const out = [], t = new Date()
  for (let i = 119; i >= 0; i--) {
    const d = new Date(t); d.setDate(t.getDate() - i)
    const wk = d.getDay() === 0 || d.getDay() === 6 ? 2.5 : 0
    let kwh = 11 + 4 * Math.sin(i / 9) + wk + ((((i * 7919) % 13) - 6) / 6) * 1.2
    if (i % 23 === 5) kwh *= 1.45
    out.push({ date: isoDate(d), kwh: +kwh.toFixed(1) })
  }
  return out
}
export const demoAppliances = [
  { id: 1, name: 'Air conditioner', watts: 1500, hours: 6, days: 30, rate: 6.5 },
  { id: 2, name: 'Refrigerator', watts: 100, hours: 24, days: 30, rate: 6.5 },
  { id: 3, name: 'LED lighting', watts: 120, hours: 6, days: 30, rate: 6.5 },
  { id: 4, name: 'Ceiling fans', watts: 75, hours: 10, days: 30, rate: 6.5 },
  { id: 5, name: 'Water heater', watts: 2000, hours: 1, days: 30, rate: 6.5 },
  { id: 6, name: 'Television', watts: 100, hours: 4, days: 30, rate: 6.5 },
]
// Sample slab tariff (demo). Configure your own provider's slabs in Settings.
export const defaultSettings = {
  name: 'Demo User', currency: '₹', theme: 'light', budget: 2500, emissionFactor: 0.82, solar: null, dailyThreshold: 18,
  tariff: { slabs: [{ upto: 100, rate: 3.5 }, { upto: 200, rate: 5 }, { upto: '', rate: 7 }], fixed: 100, taxPct: 5 },
  notify: { budget: true, spikes: true, weekly: false },
}
// Modelled share of daily load per hour (demo profile).
export const HOURLY = [2,1.5,1.5,1.5,2,3,4,5,4,3,3,3,3.5,3.5,3,3,3.5,5,7,8,8,7,5,3].map((v, i, a) => v / a.reduce((s, x) => s + x, 0))
// DEMO USERS for the admin dashboard (synthetic).
export const demoUsers = [
  { id: 1, name: 'Aarav Mehta', email: 'aarav@example.com', plan: 'Residential', status: 'active', kwh: 310 },
  { id: 2, name: 'Priya Nair', email: 'priya@example.com', plan: 'Residential', status: 'active', kwh: 245 },
  { id: 3, name: 'Rohan Gupta', email: 'rohan@example.com', plan: 'Commercial', status: 'active', kwh: 820 },
  { id: 4, name: 'Sneha Iyer', email: 'sneha@example.com', plan: 'Residential', status: 'suspended', kwh: 180 },
  { id: 5, name: 'Kabir Shah', email: 'kabir@example.com', plan: 'Commercial', status: 'active', kwh: 640 },
]
