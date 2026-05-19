import { useSelector } from 'react-redux'
import { selectRoleSlug } from 'src/store/auth/authSlice'

import EmployeeDashboard     from './employeeDashboard'
import HRDashboard           from './hrDashboard'
import SuperAdminDashboard   from './superAdminDashboard'
import CompanyAdminDashboard from './companyAdminDashboard'

// ── Role slug → component map ─────────────────────────────────────────────────
// Add or rename keys here to match whatever slugs your auth slice returns
const DASHBOARD_MAP = {
  employee:       EmployeeDashboard,
  hr:             HRDashboard,
  hr_manager:     HRDashboard,
  super_admin:    SuperAdminDashboard,
  superadmin:     SuperAdminDashboard,
  tenant_admin:   CompanyAdminDashboard,
  companyadmin:   CompanyAdminDashboard,
  admin:          CompanyAdminDashboard,
}

const AnalyticsDashboard = () => {
  const roleSlug = useSelector(selectRoleSlug)

  // Normalise: lowercase + trim so 'HR_Manager' → 'hr_manager'
  const key = String(roleSlug || '').toLowerCase().trim()

  const DashboardComponent = DASHBOARD_MAP[key]

  if (!DashboardComponent) {
    // Unrecognised role — show a neutral fallback instead of crashing
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#64748b', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: 16, fontWeight: 700 }}>No dashboard available for role: <code>{roleSlug}</code></p>
        <p style={{ fontSize: 13, marginTop: 8 }}>Contact your administrator if this seems incorrect.</p>
      </div>
    )
  }

  return <DashboardComponent />
}

export default AnalyticsDashboard