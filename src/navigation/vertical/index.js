import { useSelector } from 'react-redux'
import { selectPermissionsByModule, selectRoleSlug } from 'src/store/auth/authSlice'

const ALL_NAV_ITEMS = [
  { title: 'Dashboard', icon: 'mdi:view-dashboard-outline', path: '/dashboards/analytics', module: null,
    visibleFor: ['super_admin','org_admin','company_admin','unit_admin','hr_manager','manager','employee','company_hr_manager'] },

  // Super Admin
  { title: 'Organisations', icon: 'mdi:office-building', path: '/organisation', module: 'organisation', visibleFor: ['super_admin'] },
  { title: 'Customers', icon: 'mdi:account-group-outline', path: '/customers', module: 'customers', visibleFor: ['super_admin'] },
  { title: 'Plans', icon: 'mdi:credit-card-outline', path: '/pages/pricing', module: 'plans', visibleFor: ['super_admin'] },

  // Org Admin
  { title: 'Companies', icon: 'mdi:domain', path: '/company', module: 'company', visibleFor: ['org_admin','org_head'] },

  // Company Admin
  { title: 'LOBs',     icon: 'mdi:source-branch',  path: '/lob',    module: 'organisation', visibleFor: ['company_admin'] },
  { title: 'Units',    icon: 'mdi:store-outline',   path: '/units',  module: 'organisation', visibleFor: ['company_admin'] },
  { title: 'Holidays', icon: 'mdi:calendar-star',   path: '/holidays', module: 'holiday',   visibleFor: ['company_admin','company_hr_manager'] },
    

  // Admin Users — visible to all admin levels
  { title: 'Admin Users', icon: 'mdi:shield-account-outline', path: '/admin-users', module: 'role',
    visibleFor: ['org_admin','company_admin','unit_admin','hr_manager','company_hr_manager'] },

  // Roles visible to all admins
  { title: 'Roles & Permissions', icon: 'mdi:key-outline', path: '/rolesPermission', module: 'role',
    visibleFor: ['org_admin','company_admin','unit_admin','hr_manager','company_hr_manager'] },

  // Unit level
  { title: 'Departments', icon: 'mdi:office-building-outline', path: '/department', module: 'department', visibleFor: ['unit_admin','hr_manager'] },
  { title: 'Designations', icon: 'mdi:briefcase-outline', path: '/designation', module: 'designation', visibleFor: ['unit_admin','hr_manager'] },
  { title: 'Employees', icon: 'mdi:account-group-outline', path: '/users', module: 'employee', visibleFor: ['unit_admin','hr_manager','company_hr_manager'] },
  { title: 'Attendance', icon: 'mdi:clock-check-outline', path: '/attendance', module: 'attendance', visibleFor: ['unit_admin','hr_manager'] },
  { title: 'Leaves', icon: 'mdi:calendar-account-outline', path: '/leaves', module: 'leave', visibleFor: ['unit_admin','hr_manager'] },
  { title: 'Payroll', icon: 'mdi:cash-multiple', path: '/payroll', module: 'payroll', visibleFor: ['unit_admin','hr_manager'] },
  { title: 'Policies', icon: 'mdi:shield-outline', path: '/policy', module: 'policy', visibleFor: ['unit_admin','hr_manager'] },

  // Employee self service
  { title: 'My Attendance', icon: 'mdi:clock-outline', path: '/my-attendance', module: 'attendance', visibleFor: ['employee','manager'] },
  { title: 'My Leaves', icon: 'mdi:calendar-check-outline', path: '/my-leaves', module: 'leave', visibleFor: ['employee','manager'] },
  { title: 'My Payroll', icon: 'mdi:file-document-outline', path: '/my-payroll', module: 'payroll', visibleFor: ['employee','manager'] },
]

const PLATFORM_MODULES = ['company','organisation','holiday','role','department','designation','customers','plans','policy']

const VerticalNavItems = () => {
  const permissionsByModule = useSelector(selectPermissionsByModule)
  const roleSlug            = useSelector(selectRoleSlug)

  return ALL_NAV_ITEMS.filter(item => {
    if (!item.visibleFor.includes(roleSlug)) return false
    if (item.module === null) return true
    if (roleSlug === 'super_admin') return true
    if (PLATFORM_MODULES.includes(item.module)) return true
    const moduleActions = permissionsByModule?.[item.module]
    return Array.isArray(moduleActions) && moduleActions.length > 0
  })
}

export default VerticalNavItems
