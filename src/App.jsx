import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import EnergyInsights from './pages/EnergyInsights'
import BillPredictor from './pages/BillPredictor'
import ApplianceCalculator from './pages/ApplianceCalculator'
import UsageHistory from './pages/UsageHistory'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import SolarCalculator from './pages/SolarCalculator'
import Carbon from './pages/Carbon'
import Login from './pages/Login'
import RequireAuth from './components/common/RequireAuth'
import AdminLayout from './components/layout/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminOverview from './pages/admin/AdminOverview'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTariff from './pages/admin/AdminTariff'
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login mode="signup" />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/insights" element={<EnergyInsights />} />
        <Route path="/bill" element={<BillPredictor />} />
        <Route path="/appliances" element={<ApplianceCalculator />} />
        <Route path="/history" element={<UsageHistory />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/solar" element={<SolarCalculator />} />
        <Route path="/carbon" element={<Carbon />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<RequireAuth role="admin" to="/admin/login"><AdminLayout /></RequireAuth>}>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="tariff" element={<AdminTariff />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
