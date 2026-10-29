export const PageHeader = ({ title, sub, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="text-2xl font-semibold text-navy dark:text-white">{title}</h1>{sub && <p className="muted mt-1 text-sm">{sub}</p>}</div>
    <div className="no-print flex flex-wrap gap-2">{children}</div>
  </div>
)
const tone = { High: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300', critical: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300', Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', Low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', info: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' }
export const Badge = ({ level, children }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tone[level]}`}>{children ?? level}</span>
export const Empty = ({ title, text }) => (<div className="card py-10 text-center"><p className="font-medium">{title}</p><p className="muted mt-1 text-sm">{text}</p></div>)
export const DemoTag = () => <span className="muted text-xs">Demo data</span>
export const Field = ({ label, error, children }) => (<label className="block"><span className="label">{label}</span>{children}{error && <span role="alert" className="mt-1 block text-xs text-red-600">{error}</span>}</label>)
