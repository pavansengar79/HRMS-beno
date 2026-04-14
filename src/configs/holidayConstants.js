/**
 * Holiday Category Constants
 *
 * Used across the application for holiday/calendar event categorization.
 * IMPORTANT: Do NOT hardcode these strings in components. Always import from this file.
 *
 * @file src/configs/holidayConstants.js
 */

// ─────────────────────────────────────────────────────────────────────────────
// HOLIDAY CATEGORIES ENUM
// ─────────────────────────────────────────────────────────────────────────────

export const HOLIDAY_CATEGORIES = {
  RH: 'RH', // Restricted Holidays
  NATIONAL: 'NATIONAL', // National Holidays
  OPTIONAL: 'OPTIONAL', // Optional Holidays
  COMPANY: 'COMPANY' // Company Holidays
}

// ─────────────────────────────────────────────────────────────────────────────
// HOLIDAY CATEGORY DISPLAY LABELS
// For UI rendering (sidebar filters, badges, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export const HOLIDAY_CATEGORY_LABELS = {
  [HOLIDAY_CATEGORIES.RH]: 'Restricted Holidays',
  [HOLIDAY_CATEGORIES.NATIONAL]: 'National Holidays',
  [HOLIDAY_CATEGORIES.OPTIONAL]: 'Optional Holidays',
  [HOLIDAY_CATEGORIES.COMPANY]: 'Company Holidays'
}

// ─────────────────────────────────────────────────────────────────────────────
// HOLIDAY CATEGORY COLORS
// For UI rendering (calendar colors, badges, sidebar icons)
// Uses MUI color names for consistency
// ─────────────────────────────────────────────────────────────────────────────

export const HOLIDAY_CATEGORY_COLORS = {
  [HOLIDAY_CATEGORIES.RH]: 'error', // Red
  [HOLIDAY_CATEGORIES.NATIONAL]: 'success', // Green
  [HOLIDAY_CATEGORIES.OPTIONAL]: 'warning', // Amber
  [HOLIDAY_CATEGORIES.COMPANY]: 'primary' // Blue
}

// ─────────────────────────────────────────────────────────────────────────────
// ALL HOLIDAY CATEGORIES (for iteration, initialization, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_HOLIDAY_CATEGORIES = Object.values(HOLIDAY_CATEGORIES)
// Returns: ['RH', 'NATIONAL', 'OPTIONAL', 'COMPANY']

// ─────────────────────────────────────────────────────────────────────────────
// ROLE-BASED ACCESS CONFIGURATION
// Determines which roles can add/edit/delete holidays
// ─────────────────────────────────────────────────────────────────────────────

export const HOLIDAY_ADMIN_ROLES = ['admin', 'hr', 'hr_manager', 'tenant_admin']
export const HOLIDAY_EMPLOYEE_ROLES = ['employee']

// Helper function to check if role is admin
export const isHolidayAdmin = roleSlug => {
  return HOLIDAY_ADMIN_ROLES.includes(roleSlug)
}

// Helper function to check if role is employee
export const isHolidayEmployee = roleSlug => {
  return HOLIDAY_EMPLOYEE_ROLES.includes(roleSlug)
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION: Ensure category exists
// Use this before processing any category
// ─────────────────────────────────────────────────────────────────────────────

export const isValidHolidayCategory = category => {
  return ALL_HOLIDAY_CATEGORIES.includes(category)
}
