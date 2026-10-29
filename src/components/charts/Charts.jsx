import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
const COLORS = ['#1d6bf3', '#10b981', '#0b1f3a', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']
const tip = { contentStyle: { borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 } }
const axis = { tick: { fontSize: 11, fill: '#64748b' }, tickLine: false, axisLine: false }
export const ChartBox = ({ title, desc, children }) => (
  <section className="card" aria-label={title}>
    <h3 className="mb-1 font-medium">{title}</h3><p className="muted mb-3 text-xs">{desc}</p>
    <div className="h-64" role="img" aria-label={`${title}. ${desc}`}>{children}</div>
  </section>
)
const grid = <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
export const DailyLine = ({ data }) => (<ResponsiveContainer><LineChart data={data}>{grid}<XAxis dataKey="label" {...axis} minTickGap={24} /><YAxis {...axis} width={32} /><Tooltip {...tip} formatter={(v) => [`${v} kWh`, 'Usage']} /><Line type="monotone" dataKey="kwh" stroke="#1d6bf3" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer>)
export const BarSeries = ({ data, x = 'label', y = 'kwh', unit = 'kWh', color = '#1d6bf3', highlight }) => (<ResponsiveContainer><BarChart data={data}>{grid}<XAxis dataKey={x} {...axis} minTickGap={12} /><YAxis {...axis} width={40} /><Tooltip {...tip} formatter={(v) => [`${Number(v).toFixed(1)} ${unit}`, '']} /><Bar dataKey={y} radius={[4, 4, 0, 0]}>{data.map((d, i) => <Cell key={i} fill={highlight?.(d) ? '#10b981' : color} />)}</Bar></BarChart></ResponsiveContainer>)
export const Donut = ({ data }) => (<ResponsiveContainer><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip {...tip} formatter={(v) => `${Number(v).toFixed(0)} kWh`} /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer>)
export const BillArea = ({ data, cur }) => (<ResponsiveContainer><AreaChart data={data}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>{grid}<XAxis dataKey="label" {...axis} /><YAxis {...axis} width={44} /><Tooltip {...tip} formatter={(v) => [`${cur}${Math.round(v)}`, 'Bill']} /><Area type="monotone" dataKey="bill" stroke="#10b981" strokeWidth={2.5} fill="url(#g)" /></AreaChart></ResponsiveContainer>)
export const MiniArea = ({ data }) => (<ResponsiveContainer><AreaChart data={data}><defs><linearGradient id="h" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1d6bf3" stopOpacity={0.45} /><stop offset="100%" stopColor="#1d6bf3" stopOpacity={0} /></linearGradient></defs><Tooltip {...tip} formatter={(v) => [`${v} kWh`, 'Usage']} labelFormatter={() => ''} /><Area type="monotone" dataKey="kwh" stroke="#1d6bf3" strokeWidth={2} fill="url(#h)" /></AreaChart></ResponsiveContainer>)
