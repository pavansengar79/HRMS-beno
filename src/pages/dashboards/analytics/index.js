import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { selectLevel, selectRoleSlug, selectPermissions } from 'src/store/auth/authSlice'

import SuperAdminDashboard   from './superAdminDashboard'
import OrganisationDashboard from './organisationDashboard'
import CompanyDashboard      from './companyAdminDashboard'
import UnitDashboard         from './unitDashboard'
import HRDashboard           from './hrDashboard'
import ManagerDashboard      from './managerDashboard'
import EmployeeDashboard     from './employeeDashboard'
import CustomRoleDashboard   from './customRoleDashboard'

// Level-based dashboard mapping (primary routing strategy)
const LEVEL_DASHBOARD_MAP = {
  org:     OrganisationDashboard,
  company: CompanyDashboard,
  unit:    UnitDashboard,
}

// Legacy role-based mapping (fallback for roles without level)
const ROLE_DASHBOARD_MAP = {
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

// Check if role is a custom role (not in ROLE_DASHBOARD_MAP)
const isCustomRole = (roleSlug) => {
  if (!roleSlug) return false
  const key = String(roleSlug).toLowerCase().trim()
  return !Object.keys(ROLE_DASHBOARD_MAP).includes(key)
}

// Permission to page redirect mapping for custom roles without dashboard
const PERMISSION_REDIRECT_MAP = {
  'company.read': '/company',
  'admin_user.read': '/admin-users',
  'employee.read': '/users',
  'department.read': '/department',
  'designation.read': '/designation',
  'attendance.read': '/attendance',
  'leave.read': '/leaves',
  'payroll.read': '/payroll',
  'holiday.read': '/holidays',
  'shift.read': '/shift',
  'unit.read': '/units',
  'site.read': '/sites',
}

const AnalyticsDashboard = () => {
  const router = useRouter()
  const level = useSelector(selectLevel)
  const roleSlug = useSelector(selectRoleSlug)
  const permissions = useSelector(selectPermissions) || []

  // Redirect custom roles to first available module
  useEffect(() => {
    // If no dashboard available, redirect to first permitted module
    const hasLevelDashboard = level && LEVEL_DASHBOARD_MAP[level]
    const hasRoleDashboard = roleSlug && ROLE_DASHBOARD_MAP[String(roleSlug).toLowerCase().trim()]
    
    if (!hasLevelDashboard && !hasRoleDashboard && permissions.length > 0) {
      // Find first permission with a redirect path
      for (const perm of permissions) {
        if (PERMISSION_REDIRECT_MAP[perm]) {
          console.log(`No dashboard available. Redirecting to: ${PERMISSION_REDIRECT_MAP[perm]}`)
          router.replace(PERMISSION_REDIRECT_MAP[perm])
          return
        }
      }
    }
  }, [level, roleSlug, permissions, router])

  // Priority: level-based routing over role-based routing
  let DashboardComponent = null
  if (level && LEVEL_DASHBOARD_MAP[level]) {
    DashboardComponent = LEVEL_DASHBOARD_MAP[level]
  } else if (roleSlug) {
    const key = String(roleSlug).toLowerCase().trim()
    // Check if it's a known role
    if (ROLE_DASHBOARD_MAP[key]) {
      DashboardComponent = ROLE_DASHBOARD_MAP[key]
    } else if (isCustomRole(roleSlug)) {
      // Custom role - show CustomRoleDashboard with permission-based modules
      DashboardComponent = CustomRoleDashboard
    }
  }

  // If no dashboard found but has permissions, redirect to first available module
  if (!DashboardComponent && permissions.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#64748b', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: 16, fontWeight: 700 }}>
          No dashboard available. Redirecting...
        </p>
      </div>
    )
  }

  // If still no component, use CustomRoleDashboard as fallback
  if (!DashboardComponent) {
    DashboardComponent = CustomRoleDashboard
  }

  return <DashboardComponent />
}

export default AnalyticsDashboard
