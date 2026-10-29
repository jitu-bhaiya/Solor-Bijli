import { applianceKwh, billFromSlabs, marginalRate, monthly, detectAlerts } from './calc'
const TIPS = [
  [/air|\bac\b/i, 'Set the thermostat to 24–26°C and clean filters monthly.'],
  [/fridge|refrig/i, 'Keep coils clean, door seals tight, and avoid placing it near heat.'],
  [/light|led|bulb/i, 'Use LED bulbs and switch off lights in empty rooms.'],
  [/heater|geyser/i, 'Use a timer and lower the thermostat; shorter showers help.'],
  [/fan/i, 'Use BLDC fans and switch off when the room is empty.'],
]
export const tipFor = (name) => TIPS.find(([r]) => r.test(name))?.[1] ?? 'Switch off at the plug when idle to avoid standby draw.'
// Transparent rule-based engine. Each rule states its assumption. No external AI is used.
export function buildInsights(readings, appliances, s) {
  const months = monthly(readings), cur = months.at(-1), prev = months.at(-2), out = []
  if (!cur) return out
  const mr = marginalRate(cur.projected, s.tariff)
  const rule = (id, re, pct, title, steps, label) => {
    const kwh = appliances.filter((a) => re.test(a.name)).reduce((t, a) => t + applianceKwh(a), 0)
    if (kwh > 0) { const sv = kwh * pct * mr
      out.push({ id, title, priority: sv > 250 ? 'High' : sv > 80 ? 'Medium' : 'Low', savings: Math.round(sv), steps, basis: `Assumes ${label} (rule of thumb) on ${kwh.toFixed(0)} kWh/month at your marginal rate of ${mr.toFixed(2)}/kWh.` }) }
  }
  rule('ac', /air|\bac\b/i, 0.12, 'Raise AC setpoint by 2°C', ['Set 24–26°C with fan on low', 'Close doors and windows while cooling', 'Clean filters monthly'], '~6% AC energy saved per °C')
  rule('light', /light|led|bulb/i, 0.3, 'Trim lighting usage', ['Switch off in empty rooms', 'Replace any non-LED bulbs', 'Use daylight where possible'], '30% reduction')
  rule('fridge', /fridge|refrig/i, 0.08, 'Tune the refrigerator', ['Set to 3–5°C', 'Defrost and clean coils', 'Keep 10 cm clearance behind'], '8% reduction')
  rule('heater', /heater|geyser/i, 0.25, 'Shorten water heater runtime', ['Fit a timer', 'Lower the thermostat to 50–55°C'], '25% reduction')
  const top = [...readings.slice(-30)].sort((a, b) => b.kwh - a.kwh)[0]
  out.push({ id: 'peak', title: 'Shift evening load', priority: 'Medium', savings: Math.round(cur.projected * 0.04 * mr), steps: ['Run washing machine and iron before 6 pm', 'Stagger high-power appliances', `Highest recent day: ${top.date} (${top.kwh} kWh)`], basis: 'Assumes 4% of usage can be shifted or avoided. Demo load profile peaks 6–10 pm.' })
  if (prev) { const d = (cur.projected / prev.projected - 1) * 100
    out.push({ id: 'mom', title: `Usage ${d >= 0 ? 'up' : 'down'} ${Math.abs(d).toFixed(1)}% vs last month`, priority: d > 10 ? 'High' : 'Low', savings: 0, steps: [`This month (normalised): ${cur.projected.toFixed(0)} kWh`, `Last month (normalised): ${prev.projected.toFixed(0)} kWh`], basis: 'Daily averages scaled to full-month length.' }) }
  return out
}
export const totalSavings = (i) => i.reduce((t, x) => t + x.savings, 0)
export function reportText(readings, appliances, s) {
  const ins = buildInsights(readings, appliances, s), cur = monthly(readings).at(-1), b = billFromSlabs(cur.projected, s.tariff)
  return [`Solor-Bijli energy report (demo data, rule-based)`, `Projected usage: ${cur.projected.toFixed(0)} kWh`, `Projected bill: ${s.currency}${b.total.toFixed(0)} (budget ${s.currency}${s.budget})`, `Alerts: ${detectAlerts(readings, s).length}`, '', ...ins.map((x) => `- [${x.priority}] ${x.title}${x.savings ? ` - save ~${s.currency}${x.savings}/month` : ''}\n    ${x.steps.join('; ')}`), '', `Potential savings: ${s.currency}${totalSavings(ins)}/month`].join('\n')
}
