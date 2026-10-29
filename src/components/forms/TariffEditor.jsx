import { Plus, Trash2 } from 'lucide-react'
import { Field } from '../common/UI'
export const validateTariff = (t) => {
  const e = {}
  if (!t.slabs.length) e.slabs = 'Add at least one slab.'
  t.slabs.forEach((s, i) => { if (s.rate === '' || Number(s.rate) < 0 || isNaN(s.rate)) e['r' + i] = 'Rate must be 0 or more.'; if (s.upto !== '' && (isNaN(s.upto) || Number(s.upto) <= (i ? Number(t.slabs[i - 1].upto) || 0 : 0))) e['u' + i] = 'Must exceed the previous slab.' })
  if (t.fixed === '' || Number(t.fixed) < 0) e.fixed = 'Enter 0 or more.'
  if (t.taxPct === '' || Number(t.taxPct) < 0 || Number(t.taxPct) > 100) e.taxPct = 'Enter 0–100.'
  return e
}
export default function TariffEditor({ value, onChange, errors = {}, currency }) {
  const set = (p) => onChange({ ...value, ...p })
  const setSlab = (i, p) => set({ slabs: value.slabs.map((s, j) => (j === i ? { ...s, ...p } : s)) })
  return (
    <div className="space-y-4">
      <fieldset><legend className="label">Tariff slabs (leave “up to” empty for the last slab)</legend>
        <div className="space-y-2">
          {value.slabs.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1"><input aria-label={`Slab ${i + 1} up to kWh`} className="input" inputMode="decimal" placeholder="No limit" value={s.upto} onChange={(e) => setSlab(i, { upto: e.target.value })} />{errors['u' + i] && <p role="alert" className="mt-1 text-xs text-red-600">{errors['u' + i]}</p>}</div>
              <div className="flex-1"><input aria-label={`Slab ${i + 1} rate per kWh`} className="input" inputMode="decimal" placeholder={`${currency}/kWh`} value={s.rate} onChange={(e) => setSlab(i, { rate: e.target.value })} />{errors['r' + i] && <p role="alert" className="mt-1 text-xs text-red-600">{errors['r' + i]}</p>}</div>
              <button type="button" className="btn btn-ghost px-2.5" aria-label={`Remove slab ${i + 1}`} onClick={() => set({ slabs: value.slabs.filter((_, j) => j !== i) })}><Trash2 size={16} /></button>
            </div>))}
        </div>
        {errors.slabs && <p role="alert" className="mt-1 text-xs text-red-600">{errors.slabs}</p>}
        <button type="button" className="btn btn-ghost mt-2" onClick={() => set({ slabs: [...value.slabs, { upto: '', rate: '' }] })}><Plus size={16} />Add slab</button>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={`Fixed monthly charges (${currency})`} error={errors.fixed}><input className="input" inputMode="decimal" value={value.fixed} onChange={(e) => set({ fixed: e.target.value })} /></Field>
        <Field label="Taxes and additional charges (%)" error={errors.taxPct}><input className="input" inputMode="decimal" value={value.taxPct} onChange={(e) => set({ taxPct: e.target.value })} /></Field>
      </div>
    </div>
  )
}
