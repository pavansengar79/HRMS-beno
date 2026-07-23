// src/utils/permissions.js
//
// Permission checking utilities for UI rendering
// Used across pages to show/hide action buttons based on user permissions

import { selectPermissions } from 'src/store/auth/authSlice'

/**
 * Check if user has a specific permission
 * @param {string[]} permissions - User's permission array
 * @param {string} permissionSlug - Permission to check (e.g., 'employee.update')
 * @returns {boolean}
 */
export const hasPermission = (permissions, permissionSlug) => {
  if (!permissions || !Array.isArray(permissions)) return false
  return permissions.includes(permissionSlug)
}

/**
 * Check if user has any of the given permissions
 * @param {string[]} permissions - User's permission array
 * @param {string[]} permissionSlugs - Array of permissions to check
 * @returns {boolean}
 */
export const hasAnyPermission = (permissions, permissionSlugs) => {
  if (!permissions || !Array.isArray(permissions)) return false
  if (!permissionSlugs || !Array.isArray(permissionSlugs)) return false
  return permissionSlugs.some(slug => permissions.includes(slug))
}

/**
 * Check if user has all of the given permissions
 * @param {string[]} permissions - User's permission array
 * @param {string[]} permissionSlugs - Array of permissions to check
 * @returns {boolean}
 */
export const hasAllPermissions = (permissions, permissionSlugs) => {
  if (!permissions || !Array.isArray(permissions)) return false
  if (!permissionSlugs || !Array.isArray(permissionSlugs)) return false
  return permissionSlugs.every(slug => permissions.includes(slug))
}

/**
 * Check if user can perform a specific action on a module
 * @param {string[]} permissions - User's permission array
 * @param {string} module - Module name (e.g., 'employee', 'company')
 * @param {string} action - Action name (e.g., 'create', 'update', 'delete')
 * @returns {boolean}
 */
export const canPerformAction = (permissions, module, action) => {
  const permissionSlug = `${module}.${action}`
  return hasPermission(permissions, permissionSlug)
}

/**
 * Get button visibility config for a module
 * @param {string[]} permissions - User's permission array
 * @param {string} module - Module name
 * @returns {Object} - Button visibility config { view, create, update, delete }
 */
export const getModuleButtons = (permissions, module) => {
  return {
    view: canPerformAction(permissions, module, 'read'),
    create: canPerformAction(permissions, module, 'create'),
    update: canPerformAction(permissions, module, 'update'),
    delete: canPerformAction(permissions, module, 'delete'),
  }
}

/**
 * React hook for permission checks (to be used with useSelector)
 * @example
 * const permissions = useSelector(selectPermissions)
 * const { canUpdate, canDelete } = usePermissionChecks(permissions, 'employee')
 */
export const usePermissionChecks = (permissions, module) => {
  return {
    canView: canPerformAction(permissions, module, 'read'),
    canCreate: canPerformAction(permissions, module, 'create'),
    canUpdate: canPerformAction(permissions, module, 'update'),
    canDelete: canPerformAction(permissions, module, 'delete'),
    canApprove: canPerformAction(permissions, module, 'approve'),
  }
}

/**
 * Permission-based button visibility constants
 * Used for common UI patterns across pages
 */
export const PERMISSION_BUTTONS = {
  // Employee module
  EMPLOYEE_VIEW: 'employee.read',
  EMPLOYEE_CREATE: 'employee.create',
  EMPLOYEE_UPDATE: 'employee.update',
  EMPLOYEE_DELETE: 'employee.delete',
  
  // Company module
  COMPANY_VIEW: 'company.read',
  COMPANY_CREATE: 'company.create',
  COMPANY_UPDATE: 'company.update',
  COMPANY_DELETE: 'company.delete',
  
  // Attendance module
  ATTENDANCE_VIEW: 'attendance.read',
  ATTENDANCE_CREATE: 'attendance.create',
  ATTENDANCE_UPDATE: 'attendance.update',
  ATTENDANCE_DELETE: 'attendance.delete',
  
  // Leave module
  LEAVE_VIEW: 'leave.read',
  LEAVE_CREATE: 'leave.create',
  LEAVE_UPDATE: 'leave.update',
  LEAVE_DELETE: 'leave.delete',
  LEAVE_APPROVE: 'leave.approve',
  
  // Payroll module
  PAYROLL_VIEW: 'payroll.read',
  PAYROLL_CREATE: 'payroll.create',
  PAYROLL_UPDATE: 'payroll.update',
  PAYROLL_DELETE: 'payroll.delete',
  PAYROLL_RUN: 'payroll.run',
  
  // Department module
  DEPARTMENT_VIEW: 'department.read',
  DEPARTMENT_CREATE: 'department.create',
  DEPARTMENT_UPDATE: 'department.update',
  DEPARTMENT_DELETE: 'department.delete',
  
  // Designation module
  DESIGNATION_VIEW: 'designation.read',
  DESIGNATION_CREATE: 'designation.create',
  DESIGNATION_UPDATE: 'designation.update',
  DESIGNATION_DELETE: 'designation.delete',
  
  // Shift module
  SHIFT_VIEW: 'shift.read',
  SHIFT_CREATE: 'shift.create',
  SHIFT_UPDATE: 'shift.update',
  SHIFT_DELETE: 'shift.delete',
  
  // Holiday module
  HOLIDAY_VIEW: 'holiday.read',
  HOLIDAY_CREATE: 'holiday.create',
  HOLIDAY_UPDATE: 'holiday.update',
  HOLIDAY_DELETE: 'holiday.delete',

  // Biometric module
  BIOMETRIC_VIEW: 'biometric.read',
  BIOMETRIC_CREATE: 'biometric.create',
  BIOMETRIC_UPDATE: 'biometric.update',
  BIOMETRIC_DELETE: 'biometric.delete',

  // Investment Declaration module
  INVESTMENT_DECLARATION_CREATE: 'investment_declaration.create',
  INVESTMENT_DECLARATION_VIEW: 'investment_declaration.read',
  INVESTMENT_DECLARATION_UPDATE: 'investment_declaration.update',
  INVESTMENT_DECLARATION_DELETE: 'investment_declaration.delete',
}


