import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import OtpForm from '../../components/forms/OtpForm'
export default function AdminLogin() {
  const { user } = useAuth(), nav = useNavigate()
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  return <div className="grid min-h-screen place-items-center p-4"><OtpForm mode="login" requireRole="admin" title="Admin sign in" onDone={() => nav('/admin')} /></div>
}
