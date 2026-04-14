/**
 * Calendar Role-Based Behavior Utilities
 *
 * Centralized logic for handling role-based calendar interactions
 * Used for date clicks, form display, and permission checks
 *
 * @file src/utils/calendarRoleUtils.js
 */

import { isPrivilegedRole, isEmployeeRole } from 'src/configs/roleConstants'

// ─────────────────────────────────────────────────────────────────────────────
// ROLE-BASED CALENDAR BEHAVIOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determines the calendar behavior for date clicks based on user role
 *
 * Rules:
 * - EMPLOYEE role:
 *     → Behavior: DIRECT_LEAVE_FORM
 *     → No modal shown
 *     → Directly open Leave form
 *
 * - PRIVILEGED roles (admin, hr, manager, tenant_admin):
 *     → Behavior: SHOW_ACTION_MODAL
 *     → Modal shown with options:
 *       a) Add Leave
 *       b) Add Holiday
 *
 * - UNKNOWN roles:
 *     → Behavior: DIRECT_LEAVE_FORM (safe default)
 *     → Directly open Leave form
 *
 * @param {string} roleSlug - The user's role slug
 * @returns {Object} Calendar behavior configuration
 * @returns {string} behavior - One of: 'DIRECT_LEAVE_FORM' | 'SHOW_ACTION_MODAL'
 * @returns {boolean} canAddHoliday - Whether user can add holidays
 * @returns {boolean} canAddLeave - Whether user can add leaves
 *
 * @example
 * const behavior = getCalendarBehaviorForRole('admin')
 * // Returns: {
 * //   behavior: 'SHOW_ACTION_MODAL',
 * //   canAddHoliday: true,
 * //   canAddLeave: true
 * // }
 *
 * const behavior = getCalendarBehaviorForRole('employee')
 * // Returns: {
 * //   behavior: 'DIRECT_LEAVE_FORM',
 * //   canAddHoliday: false,
 * //   canAddLeave: true
 * // }
 */
export const getCalendarBehaviorForRole = roleSlug => {
  const isEmployee = isEmployeeRole(roleSlug)
  const isPrivileged = isPrivilegedRole(roleSlug)

  if (isEmployee) {
    return {
      behavior: 'DIRECT_LEAVE_FORM',
      canAddHoliday: false,
      canAddLeave: true,
      displayName: 'Employee'
    }
  } else if (isPrivileged) {
    return {
      behavior: 'SHOW_ACTION_MODAL',
      canAddHoliday: true,
      canAddLeave: true,
      displayName: 'Admin/Manager'
    }
  } else {
    // Unknown role: Default to safe behavior
    return {
      behavior: 'DIRECT_LEAVE_FORM',
      canAddHoliday: false,
      canAddLeave: true,
      displayName: 'Guest'
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BEHAVIOR CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const CALENDAR_BEHAVIORS = {
  DIRECT_LEAVE_FORM: 'DIRECT_LEAVE_FORM',
  SHOW_ACTION_MODAL: 'SHOW_ACTION_MODAL'
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE-BASED QUICK CHECKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if user should see the date click modal
 * Based on role, some users bypass the modal entirely
 *
 * @param {string} roleSlug - User's role slug
 * @returns {boolean} true if modal should be shown, false if direct form should open
 */
export const shouldShowDateClickModal = roleSlug => {
  const behavior = getCalendarBehaviorForRole(roleSlug)
  return behavior.behavior === CALENDAR_BEHAVIORS.SHOW_ACTION_MODAL
}

/**
 * Check if user can manage holidays
 * Only privileged roles can create/edit/delete holidays
 *
 * @param {string} roleSlug - User's role slug
 * @returns {boolean} true if user can manage holidays
 */
export const canManageHolidays = roleSlug => {
  const behavior = getCalendarBehaviorForRole(roleSlug)
  return behavior.canAddHoliday
}

/**
 * Check if user can create leave requests
 * All roles can technically request leave
 *
 * @param {string} roleSlug - User's role slug
 * @returns {boolean} true if user can request leaves
 */
export const canRequestLeave = roleSlug => {
  const behavior = getCalendarBehaviorForRole(roleSlug)
  return behavior.canAddLeave
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTATION & USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * USAGE EXAMPLE 1: Date Click Handler
 *
 * const handleDateClick = (dateInfo) => {
 *   const behavior = getCalendarBehaviorForRole(roleSlug)
 *
 *   if (behavior.behavior === CALENDAR_BEHAVIORS.DIRECT_LEAVE_FORM) {
 *     // Employee: Directly open Leave form
 *     openLeaveForm(dateInfo)
 *   } else if (behavior.behavior === CALENDAR_BEHAVIORS.SHOW_ACTION_MODAL) {
 *     // Admin/Manager: Show modal with both options
 *     showDateClickModal(dateInfo)
 *   }
 * }
 */

/**
 * USAGE EXAMPLE 2: UI Visibility
 *
 * // In component:
 * const behavior = getCalendarBehaviorForRole(roleSlug)
 *
 * return (
 *   <>
 *     {behavior.canAddHoliday && (
 *       <Button onClick={handleAddHoliday}>Add Holiday</Button>
 *     )}
 *     {behavior.canAddLeave && (
 *       <Button onClick={handleAddLeave}>Request Leave</Button>
 *     )}
 *   </>
 * )
 */

/**
 * USAGE EXAMPLE 3: Permission Gate
 *
 * // In component or thunk:
 * if (!canManageHolidays(roleSlug)) {
 *   return rejectWithValue('User cannot manage holidays')
 * }
 */
