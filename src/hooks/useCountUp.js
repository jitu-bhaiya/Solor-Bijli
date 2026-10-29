import { useEffect, useState } from 'react'
export default function useCountUp(target, ms = 700) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); return }
    let raf, s
    const f = (t) => { s ??= t; const p = Math.min(1, (t - s) / ms); setV(target * (1 - (1 - p) ** 3)); if (p < 1) raf = requestAnimationFrame(f) }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}
