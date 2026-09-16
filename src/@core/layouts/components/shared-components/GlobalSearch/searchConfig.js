// src/@core/layouts/components/shared-components/GlobalSearch/searchConfig.js

// ─── Module Configuration ────────────────────────────────────────────────────
export const MODULE_CONFIG = {
  employees: {
    icon: 'tabler:user',
    color: 'primary',
    label: 'Employee',
    route: (item) => `/users/${item._id}/details/account`
  },
  leave: {
    icon: 'tabler:file-text',
    color: 'warning',
    label: 'Leave Request',
    route: (item) => `/leaves/${item._id}`
  },
  attendance: {
    icon: 'tabler:clock',
    color: 'info',
    label: 'Attendance',
    route: (item) => `/attendance/${item._id}`
  },
  departments: {
    icon: 'tabler:building',
    color: 'success',
    label: 'Department',
    route: (item) => `/department/${item._id}`
  },
  designations: {
    icon: 'tabler:briefcase',
    color: 'secondary',
    label: 'Job Role',
    route: (item) => `/designation/${item._id}`
  },
  holidays: {
    icon: 'tabler:calendar',
    color: 'error',
    label: 'Holiday',
    route: (item) => `/holidays/${item._id}`
  },
  auditLogs: {
    icon: 'tabler:history',
    color: 'default',
    label: 'Audit Log',
    route: (item) => `/audit-logs/${item._id}`
  },
  notifications: {
    icon: 'tabler:bell',
    color: 'info',
    label: 'Notification',
    route: (item) => `/notifications/${item._id}`
  }
}

// ─── Get Module Config Helper ────────────────────────────────────────────────
export const getModuleConfig = (moduleKey) => {
  return MODULE_CONFIG[moduleKey] || {
    icon: 'tabler:file',
    color: 'default',
    label: moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1),
    route: (item) => `/${moduleKey}/${item._id}`
  }
}

// ─── Keyboard Shortcuts ───────────────────────────────────────────────────────
export const KEYBOARD_SHORTCUT = {
  open: 'k', // ⌘K or Ctrl+K
  close: 'Escape',
  navigate_up: 'ArrowUp',
  navigate_down: 'ArrowDown',
  select: 'Enter'
}

// ─── Search Limits ───────────────────────────────────────────────────────────
export const SEARCH_LIMITS = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 250, // ms
  MAX_RESULTS_PER_MODULE: 5
}
