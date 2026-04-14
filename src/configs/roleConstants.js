/**
 * Role-Based Access Control Configuration
 *
 * Centralized role definitions for the entire application
 * Used for permission checks, UI visibility, and feature access
 *
 * @file src/configs/roleConstants.js
 */

// ─────────────────────────────────────────────────────────────────────────────
// PRIVILEGED ROLES (Can manage holidays and see admin features)
// These roles have access to create/edit/delete holidays
// ─────────────────────────────────────────────────────────────────────────────
export const PRIVILEGED_ROLES = ['admin', 'hr', 'hr_manager', 'tenant_admin', 'manager']

/**
 * Checks if a role is privileged (admin/HR)
 *
 * @param {string} roleSlug - Role slug to check
 * @returns {boolean} true if role is privileged, false otherwise
 *
 * @example
 * const isPrivileged = isPrivilegedRole('admin')  // true
 * const isPrivileged = isPrivilegedRole('employee')  // false
 */
export const isPrivilegedRole = roleSlug => {
  return PRIVILEGED_ROLES.includes(roleSlug)
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEE ROLES (Restricted access, can only apply for leave)
// ─────────────────────────────────────────────────────────────────────────────
export const EMPLOYEE_ROLES = ['employee']

/**
 * Checks if a role is employee
 *
 * @param {string} roleSlug - Role slug to check
 * @returns {boolean} true if role is employee, false otherwise
 */
export const isEmployeeRole = roleSlug => {
  return EMPLOYEE_ROLES.includes(roleSlug)
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE HIERARCHY (For future expansion)
// ─────────────────────────────────────────────────────────────────────────────
export const ROLE_LEVELS = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  HR: 2,
  MANAGER: 1,
  EMPLOYEE: 0
}

/**
 * Complex permission check for advanced scenarios
 * Can be used to determine access to specific features
 *
 * @param {string} roleSlug - Role slug to check
 * @param {number} requiredLevel - Minimum required level
 * @returns {boolean} true if role meets or exceeds required level
 *
 * @example
 * const canManageHolidays = hasMinimumRoleLevel(roleSlug, ROLE_LEVELS.HR)
 */
export const hasMinimumRoleLevel = (roleSlug, requiredLevel) => {
  const normalized = roleSlug.toLowerCase()
  const level = ROLE_LEVELS[normalized.toUpperCase()] ?? -1
  return level >= requiredLevel
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE DISPLAY LABELS (For UI)
// ─────────────────────────────────────────────────────────────────────────────
export const ROLE_LABELS = {
  admin: 'Administrator',
  hr: 'HR Manager',
  hr_manager: 'HR Manager',
  tenant_admin: 'Tenant Admin',
  manager: 'Manager',
  employee: 'Employee'
}

/**
 * Get display label for a role
 *
 * @param {string} roleSlug - Role slug to get label for
 * @returns {string} Display label or original slug if not found
 */
export const getRoleLabel = roleSlug => {
  return ROLE_LABELS[roleSlug] || roleSlug
}
