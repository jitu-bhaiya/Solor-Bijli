import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import OtpForm from '../components/forms/OtpForm'
export default function Login({ mode = 'login' }) {
  const { user } = useAuth(), nav = useNavigate()
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return <div className="grid min-h-screen place-items-center p-4"><OtpForm mode={mode} title={mode === 'signup' ? 'Create your account' : 'Log in with mobile'} onDone={(u) => nav(u.role === 'admin' ? '/admin' : '/dashboard')} /></div>
}
