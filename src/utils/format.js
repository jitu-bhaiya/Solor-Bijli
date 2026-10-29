export const money = (n, c = '₹') => `${c}${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
export const num = (n, d = 1) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: d })
export function download(text, name, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type })), a = document.createElement('a')
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url)
}
export const toCSV = (rows) => rows.length ? [Object.keys(rows[0]).join(','), ...rows.map((r) => Object.values(r).join(','))].join('\n') : ''
