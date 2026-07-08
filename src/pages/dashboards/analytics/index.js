import { useSelector } from 'react-redux'
import { selectRoleSlug } from 'src/store/auth/authSlice'

import SuperAdminDashboard   from './superAdminDashboard'
import OrganisationDashboard from './organisationDashboard'
import CompanyDashboard      from './companyAdminDashboard'
import UnitDashboard         from './unitDashboard'
import HRDashboard           from './hrDashboard'
import ManagerDashboard      from './managerDashboard'
import EmployeeDashboard     from './employeeDashboard'

const DASHBOARD_MAP = {
  super_admin:        SuperAdminDashboard,
  org_admin:          OrganisationDashboard,
  org_auditor:        OrganisationDashboard,
  company_admin:      CompanyDashboard,
  company_hr_manager: CompanyDashboard,
  unit_admin:         UnitDashboard,
  hr_manager:         HRDashboard,
  manager:            ManagerDashboard,
  Manager:            ManagerDashboard,
  employee:           EmployeeDashboard,
}

const AnalyticsDashboard = () => {
  const roleSlug = useSelector(selectRoleSlug)
  const key      = String(roleSlug || '').toLowerCase().trim()
  const DashboardComponent = DASHBOARD_MAP[key]

  if (!DashboardComponent) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#64748b', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: 16, fontWeight: 700 }}>
          No dashboard available for role: <code>{roleSlug}</code>
        </p>
        <p style={{ fontSize: 13, marginTop: 8 }}>
          Contact your administrator if this seems incorrect.
        </p>
      </div>
    )
  }

  return <DashboardComponent />
}

export default AnalyticsDashboard
