import { useState } from 'react'
import { Save } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { PageHeader, Field } from '../../components/common/UI'
import TariffEditor, { validateTariff } from '../../components/forms/TariffEditor'
export default function AdminTariff() {
  const { settings, update, notify } = useApp()
  const [tariff, setTariff] = useState(settings.tariff), [budget, setBudget] = useState(String(settings.budget)), [err, setErr] = useState({})
  const save = () => {
    const e = validateTariff(tariff)
    if (!(Number(budget) > 0)) e.budget = 'Budget must be above 0.'
    setErr(e); if (Object.keys(e).length) return notify('Fix the highlighted fields', 'err')
    update({ tariff, budget: +budget }); notify('Platform tariff saved')
  }
  return (
    <>
      <PageHeader title="Tariff and budget" sub="Default slabs used for estimated bills across the demo."><button className="btn" onClick={save}><Save size={16} />Save changes</button></PageHeader>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card"><TariffEditor value={tariff} onChange={setTariff} errors={err} currency={settings.currency} /></section>
        <section className="card"><Field label={`Default monthly budget (${settings.currency})`} error={err.budget}><input className="input" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} /></Field></section>
      </div>
    </>
  )
}
