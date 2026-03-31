// src/navigation/vertical/index.js

import { useSelector } from 'react-redux'
import { selectPermissionsByModule } from 'src/store/auth/authSlice'

// ─────────────────────────────────────────────────────────────────────────────
// NAV ITEM STRUCTURE
//
// Each item has a `module` field that maps to the permission module name from API.
//
//   module: 'department'  → visible only if permissionsByModule['department'] exists
//   module: null          → always visible (no permission needed — e.g. Dashboard)
//
// Permission module → nav item mapping:
//   department  → Departments
//   employee    → Employees
//   role        → Roles & Permissions
//   attendance  → Attendance
//   leave       → Leaves
//   payroll     → Payrolls
//   company     → Company  +  Settings
//   null        → Dashboard, Holidays  (always shown)
// ─────────────────────────────────────────────────────────────────────────────

const ALL_NAV_ITEMS = [
  {
    title:  'Dashboard',
    icon:   'mdi:view-dashboard-outline',
    path:   '/dashboards/analytics',
    module: null,   // always show — no permission needed
  },
  // {
  //   title:  'Customers',
  //   icon:   'mdi:user-group-outline',
  //   path:   '/customers',
  //   module: null,   // visible if user has any customer.* permission
  // },
  // {
  //   title:  'Plans',
  //   icon:   'mdi:wrench',
  //   path:   '/pages/pricing/',
  //   module: null,   // visible if user has any customer.* permission
  // },
 
 
  //  {
  //   title:  'Organisation',
  //   icon:   'mdi:mdi-bank',
  //   path:   '/pages/pricing/',
  //   module: null,   // visible if user has any customer.* permission
  // },
  {
    title:  'Company',
    icon:   'mdi:domain',
    path:   '/company',
    module: 'company',   // visible if user has any company.* permission
  },
  {
    title:  'Departments',
    icon:   'mdi:office-building-outline',
    path:   '/department',
    module: 'department',   // visible if user has any department.* permission
  },
  {
    title:  'Employees',
    icon:   'mdi:account-group-outline',
    path:   '/users',
    module: 'employee',   // visible if user has any employee.* permission
  },
  {
    title:  'Roles & Permissions',
    icon:   'mdi:key-outline',
    path:   '/rolesPermission',
    module: 'role',   // visible if user has any role.* permission
  },
  {
    title:  'Attendance',
    icon:   'mdi:clock-check-outline',
    path:   '/attendance',
    module: 'attendance',   // visible if user has any attendance.* permission
  },
  {
    title:  'Leaves',
    icon:   'mdi:calendar-account-outline',
    path:   '/leaves',
    module: 'leave',   // visible if user has any leave.* permission
  },
  {
    title:  'Payrolls',
    icon:   'mdi:cash-multiple',
    path:   '/payroll',
    module: 'payroll',   // visible if user has any payroll.* permission
  },
  {
    title:  'Holidays',
    icon:   'mdi:calendar-star',
    path:   '/holidays',
    module: null,   // always show — no permission needed
  },
  {
    title:  'Settings',
    icon:   'mdi:cog-outline',
    path:   '/settings',
    module: 'company',   // same module as Company — visible to whoever has company.*
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// VerticalNavItems
//
// Called by UserLayout:  navItems: VerticalNavItems()
//
// Reads permissionsByModule from Redux store.
// Keeps an item if:
//   (a) item.module is null  → always show
//   (b) permissionsByModule[item.module] exists and has at least one action
//       → means user has at least one permission for that module
// ─────────────────────────────────────────────────────────────────────────────
const VerticalNavItems = () => {
  // permissionsByModule = { department: ["create","read","update","delete"], payroll: ["read"], ... }
  // Built by buildPermissions() in authSlice when user logs in
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const permissionsByModule = useSelector(selectPermissionsByModule)

  return ALL_NAV_ITEMS.filter(item => {
    // No module = always visible (Dashboard, Holidays)
    if (item.module === null) return true

    // Check if the module exists in the user's permissions
    // permissionsByModule['department'] = ["create","read","update","delete"]  → truthy → show
    // permissionsByModule['payroll']    = undefined                            → falsy  → hide
    const moduleActions = permissionsByModule[item.module]
    return Array.isArray(moduleActions) && moduleActions.length > 0
  })
}

export default VerticalNavItems