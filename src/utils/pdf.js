import { monthly, billFromSlabs, applianceKwh, applianceCost, detectAlerts } from './calc'
import { buildInsights, totalSavings } from './insights'
import { co2 } from './carbon'
const rs = (n) => `Rs. ${Math.round(n).toLocaleString('en-IN')}` // built-in PDF fonts lack the rupee glyph
export async function downloadReport({ settings, user, readings, appliances }) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF(), cur = monthly(readings).at(-1), b = billFromSlabs(cur.projected, settings.tariff), f = Number(settings.emissionFactor) || 0.82
  let y = 20
  const t = (s, size = 11, bold = false, gap = 6.5) => { doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size); const l = doc.splitTextToSize(String(s), 176); if (y + l.length * gap > 282) { doc.addPage(); y = 20 } doc.text(l, 17, y); y += l.length * gap }
  t('Solor-Bijli Energy Report', 20, true, 10)
  t(`Prepared for ${user?.name ?? settings.name} on ${new Date().toLocaleDateString('en-IN')}. Month: ${cur.month} (demo data unless you added readings).`, 10)
  y += 4; t('Summary', 14, true, 9)
  ;[`Projected usage: ${cur.projected.toFixed(0)} kWh (avg ${cur.avg.toFixed(1)} kWh/day)`, `Projected bill: ${rs(b.total)} (energy ${rs(b.energy)}, fixed ${rs(b.fixed)}, tax and extras ${rs(b.tax)})`, `Monthly budget: ${rs(settings.budget)}`, `Estimated CO2: ${co2(cur.projected, f).toFixed(0)} kg this month (factor ${f} kg/kWh)`].forEach((s) => t(s))
  y += 4; t('Appliances', 14, true, 9)
  appliances.forEach((a) => { if (y > 280) { doc.addPage(); y = 20 } doc.setFont('helvetica', 'normal').setFontSize(11); doc.text(a.name.slice(0, 32), 17, y); doc.text(`${applianceKwh(a).toFixed(1)} kWh`, 105, y); doc.text(rs(applianceCost(a)), 145, y); y += 6.5 })
  y += 4; t('Savings suggestions', 14, true, 9)
  const ins = buildInsights(readings, appliances, settings)
  ins.forEach((x) => t(`[${x.priority}] ${x.title}${x.savings ? ` - save about ${rs(x.savings)}/month` : ''}`, 11, true)) 
  t(`Potential savings: ${rs(totalSavings(ins))} per month (rule-based estimate).`)
  const al = detectAlerts(readings, settings)
  y += 4; t(`Alerts (${al.length})`, 14, true, 9)
  al.slice(0, 8).forEach((a) => t(`- ${a.title}: ${a.reason}`, 10, false, 5.5))
  if (settings.solar) { y += 4; t('Solar plan', 14, true, 9); t(`Saved plan: ${settings.solar.roofM2} m2 roof, ${settings.solar.panelW} W panels. Open the Solar Savings page for results.`, 10) }
  y += 6; t('Disclaimer: estimates only. Actual bills vary by provider, tariff category, taxes, subsidies and billing rules. No live meter data or external AI is used.', 9, false, 5)
  doc.save('solor-bijli-report.pdf')
}
