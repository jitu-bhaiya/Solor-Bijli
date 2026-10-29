import { billFromSlabs } from './calc'
export const PERFORMANCE_RATIO = 0.8 // losses from heat, wiring, inverter, dust
export const DEGRADATION = 0.005 // 0.5% output loss per year
export const defaultSolar = { roofM2: 30, panelW: 400, panelM2: 2, sunHours: 5, costPerKw: 55000, subsidy: 0 }
// Assumes units generated offset units consumed (net-metering style). Excess is not credited. No tariff escalation.
export function solarPlan(inp, usageKwh, tariff, factor = 0.82) {
  const panels = Math.max(0, Math.floor(inp.roofM2 / inp.panelM2)), kw = (panels * inp.panelW) / 1000
  const generation = kw * inp.sunHours * 30 * PERFORMANCE_RATIO, offset = Math.min(generation, usageKwh)
  const before = billFromSlabs(usageKwh, tariff).total, after = billFromSlabs(usageKwh - offset, tariff).total
  const saving = before - after, cost = Math.max(0, kw * inp.costPerKw - inp.subsidy)
  let total25 = 0; for (let y = 0; y < 25; y++) total25 += saving * 12 * (1 - DEGRADATION) ** y
  return { panels, kw, generation, offset, before, after, saving, cost, payback: saving > 0 && cost > 0 ? cost / (saving * 12) : null, net25: total25 - cost, co2Year: offset * 12 * factor }
}
