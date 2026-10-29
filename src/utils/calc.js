export const applianceKwh = (a) => (Number(a.watts) * Number(a.hours) * Number(a.days)) / 1000
export const applianceCost = (a) => applianceKwh(a) * Number(a.rate)
export function billFromSlabs(kwh, tariff) {
  const { slabs, fixed = 0, taxPct = 0 } = tariff
  const breakdown = []; let prev = 0, rate = 0
  for (const s of slabs) {
    const cap = s.upto === '' || s.upto == null ? Infinity : Number(s.upto)
    rate = Number(s.rate)
    const units = Math.max(0, Math.min(kwh, cap) - prev)
    if (units > 0) breakdown.push({ range: `${prev}–${cap === Infinity ? '∞' : cap} kWh`, units, rate, amount: units * rate })
    prev = Math.max(prev, cap)
    if (cap >= kwh) break
  }
  if (prev < kwh) breakdown.push({ range: `${prev}+ kWh`, units: kwh - prev, rate, amount: (kwh - prev) * rate })
  const energy = breakdown.reduce((s, b) => s + b.amount, 0)
  const sub = energy + Number(fixed), tax = (sub * Number(taxPct)) / 100
  return { breakdown, energy, fixed: Number(fixed), tax, total: sub + tax }
}
export const marginalRate = (kwh, tariff) => billFromSlabs(kwh + 1, tariff).total - billFromSlabs(kwh, tariff).total
const dim = (m) => { const [y, mo] = m.split('-').map(Number); return new Date(y, mo, 0).getDate() }
export function monthly(readings) {
  const map = {}
  readings.forEach((r) => { const m = r.date.slice(0, 7); (map[m] ??= { month: m, kwh: 0, days: 0 }); map[m].kwh += r.kwh; map[m].days++ })
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).map((x) => {
    const avg = x.kwh / x.days
    return { ...x, kwh: +x.kwh.toFixed(1), avg, projected: avg * dim(x.month) }
  })
}
export const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0)
export const stdev = (a) => { const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))) }
// Documented method: a day is a spike if it is > mean + 2 standard deviations of the prior 30 days.
export function detectAlerts(readings, s) {
  const out = [], last = monthly(readings).at(-1)
  if (!last || readings.length < 14) return out
  const proj = billFromSlabs(last.projected, s.tariff).total, pct = (proj / s.budget) * 100
  if (s.notify.budget && pct >= 80) out.push({ id: 'budget', severity: pct >= 100 ? 'critical' : 'warning', title: 'Bill approaching budget', reason: `Projected bill ${Math.round(proj)} is ${Math.round(pct)}% of your ${s.budget} budget.`, action: 'Review Energy Insights and cut the highest-saving items first.' })
  const week = readings.slice(-7).map((r) => r.kwh), base = readings.slice(-37, -7).map((r) => r.kwh)
  const up = (mean(week) / mean(base) - 1) * 100
  if (s.notify.spikes && up > 25) out.push({ id: 'base', severity: 'warning', title: 'Usage above baseline', reason: `Last 7 days average ${mean(week).toFixed(1)} kWh/day, ${up.toFixed(0)}% above the prior 30-day baseline.`, action: 'Check AC runtime and any new appliances.' })
  readings.slice(-14).filter((r) => r.kwh > s.dailyThreshold).forEach((r) => out.push({ id: 'thr' + r.date, severity: 'info', date: r.date, title: 'Daily threshold exceeded', reason: `${r.kwh} kWh on ${r.date} exceeds your ${s.dailyThreshold} kWh threshold.`, action: 'Compare with appliance schedules for that day.' }))
  if (s.notify.spikes) readings.slice(-30).forEach((r, i) => {
    const i0 = readings.length - 30 + i, prior = readings.slice(Math.max(0, i0 - 30), i0).map((x) => x.kwh)
    if (prior.length > 7 && r.kwh > mean(prior) + 2 * stdev(prior)) out.push({ id: 'spk' + r.date, severity: 'critical', date: r.date, title: 'Statistical spike', reason: `${r.kwh} kWh on ${r.date} is over 2 standard deviations above its prior 30-day mean (${mean(prior).toFixed(1)}).`, action: 'Look for long AC/heater sessions or guests that day.' })
  })
  return out
}
