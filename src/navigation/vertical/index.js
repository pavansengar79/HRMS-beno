// src/navigation/vertical/index.js

import { useSelector } from 'react-redux'
import {
  selectPermissionsByModule,
  selectRoleSlug
} from 'src/store/auth/authSlice'

// ❌ These modules only for super_admin
const SUPER_ADMIN_ONLY_MODULES = ['company', 'organisation', 'plans', 'customers', 'policy']

const ALL_NAV_ITEMS = [
  { title: 'Dashboard', icon: 'mdi:view-dashboard-outline', path: '/dashboards/analytics', module: null },
  { title: 'Customers', icon: 'mdi:user-group-outline', path: '/customers', module: 'customers' },

  { title: 'Plans', icon: 'mdi:wrench', path: '/pages/pricing/', module: 'plans' },
  { title: 'Organisation', icon: 'mdi:mdi-bank', path: '/organisation', module: 'organisation' },
  { title: 'Company', icon: 'mdi:domain', path: '/company', module: 'company' },

  { title: 'Departments', icon: 'mdi:office-building-outline', path: '/department', module: 'department' },
  { title: 'Employees', icon: 'mdi:account-group-outline', path: '/users', module: 'employee' },
  { title: 'Roles & Permissions', icon: 'mdi:key-outline', path: '/rolesPermission', module: 'role' },
    { title: 'Policy', icon: 'mdi:key-outline', path: '/policy', module: 'role' },
  { title: 'Attendance', icon: 'mdi:clock-check-outline', path: '/attendance', module: 'attendance' },
  { title: 'Leaves', icon: 'mdi:calendar-account-outline', path: '/leaves', module: 'leave' },
  { title: 'Payrolls', icon: 'mdi:cash-multiple', path: '/payroll', module: 'payroll' },

  { title: 'Holidays', icon: 'mdi:calendar-star', path: '/holidays', module: null },
  { title: 'Policy', icon: 'mdi:shield-outline', path: '/policy', module: 'policy' },
  { title: 'Settings', icon: 'mdi:cog-outline', path: '/settings', module: 'company' }
]

const VerticalNavItems = () => {
  const permissionsByModule = useSelector(selectPermissionsByModule)
  const roleSlug = useSelector(selectRoleSlug)

  console.log('roleSlug:', roleSlug)

  return ALL_NAV_ITEMS.filter(item => {
    // ✅ Always visible items
    if (item.module === null) return true

    // 🔥 HARD BLOCK FIRST (MOST IMPORTANT)
    if (roleSlug !== 'super_admin' && SUPER_ADMIN_ONLY_MODULES.includes(item.module)) {
      return false
    }

    // 👑 SUPER ADMIN → allow only specific modules
    if (roleSlug === 'super_admin') {
      return SUPER_ADMIN_ONLY_MODULES.includes(item.module)
    }

    // ✅ NORMAL USERS → permission based
    const moduleActions = permissionsByModule?.[item.module]

    return Array.isArray(moduleActions) && moduleActions.length > 0
  })
}

export default VerticalNavItems