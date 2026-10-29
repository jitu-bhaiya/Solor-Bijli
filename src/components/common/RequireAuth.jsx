import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
export default function RequireAuth({ role, to = '/login', children }) {
  const { user, ready, logout } = useAuth()
  if (!ready) return <p className="muted p-8 text-center text-sm" role="status">Loading…</p>
  if (!user || (role === 'admin' && user.role !== 'admin')) return <Navigate to={to} replace />
  if (user.status === 'suspended') return <div className="grid min-h-screen place-items-center p-4"><div className="card max-w-sm text-center"><h1 className="text-lg font-semibold">Account suspended</h1><p className="muted mt-2 text-sm">Please contact the administrator.</p><button className="btn mt-4" onClick={logout}>Log out</button></div></div>
  return children
}
