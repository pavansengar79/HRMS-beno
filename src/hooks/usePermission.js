// src/hooks/usePermission.js
//
// Scalable permission hook — works with grouped + flat structure in Redux.
//
// ─── Quick Reference ──────────────────────────────────────────────────────
//
//  const { can, canAny, canAll, hasModule, moduleActions, isRole } = usePermission()
//
//  can('employee.create')                          → true / false
//  canAny(['employee.create','employee.update'])   → true if at least 1 matches
//  canAll(['payroll.read','payroll.create'])        → true only if ALL match
//  hasModule('payroll')                            → true if any payroll perm exists
//  moduleActions('department')                     → ["create","read","update","delete"]
//  isRole('Tenant Admin')                          → true / false
//  isRoleSlug('company_admin')                      → true / false
//
// ─────────────────────────────────────────────────────────────────────────

import { useSelector } from 'react-redux'
import {
  selectPermissions,
  selectPermissionsByModule,
  selectRole,
  selectRoleSlug,
  selectRoleId
} from 'src/store/auth/authSlice'

const usePermission = () => {
  const permissions         = useSelector(selectPermissions)          // flat array
  const permissionsByModule = useSelector(selectPermissionsByModule)  // grouped
  const role                = useSelector(selectRole)
  const roleSlug            = useSelector(selectRoleSlug)
  const roleId              = useSelector(selectRoleId)

  // ── Single permission check ───────────────────────────────
  // Usage: can('employee.create')
  const can = permission =>
    permissions.includes(permission)

  // ── At least one permission ───────────────────────────────
  // Usage: canAny(['employee.create', 'employee.update'])
  const canAny = permissionList =>
    permissionList.some(p => permissions.includes(p))

  // ── All permissions required ──────────────────────────────
  // Usage: canAll(['payroll.read', 'payroll.update'])
  const canAll = permissionList =>
    permissionList.every(p => permissions.includes(p))

  // ── Module-level check ────────────────────────────────────
  // Usage: hasModule('payroll') → true if user has ANY payroll permission
  const hasModule = module =>
    !!permissionsByModule[module]

  // ── Get all actions for a module ─────────────────────────
  // Usage: moduleActions('department') → ["create","read","update","delete"]
  const moduleActions = module =>
    permissionsByModule[module] || []

  // ── Can do a specific action in a module ─────────────────
  // Usage: canInModule('department', 'create')
  const canInModule = (module, action) =>
    (permissionsByModule[module] || []).includes(action)

  // ── Role checks ───────────────────────────────────────────
  const isRole     = name => role === name
  const isRoleSlug = slug => roleSlug === slug

  return {
    // Permission checks
    can,
    canAny,
    canAll,
    hasModule,
    moduleActions,
    canInModule,

    // Role checks
    isRole,
    isRoleSlug,

    // Raw values (if needed)
    role,
    roleSlug,
    roleId,
    permissions,
    permissionsByModule
  }
}

export default usePermission