// src/config/permissionPageMap.js
//
// Enterprise Permission-to-Page Mapping
// Single source of truth for page-level access control
//
// Maps permission slugs → accessible pages + UI metadata
// Used by: navigation, route guards, page rendering

export const PERMISSION_PAGE_MAP = {
  // ─────────────────────────────────────────────────────────
  // ADMIN USER MODULE (Org/Company level)
  // ─────────────────────────────────────────────────────────
  'admin_user.read': {
    module: 'admin_user',
    pages: ['/admin-users', '/rolesPermission'],
    actions: ['view_admin_user', 'export_admin_user'],
    ui: {
      sidebar: {
        title: 'Admin Users',
        icon: 'tabler:user-shield',
        badge: null,
        order: 1
      },
      buttons: {
        view: true,
        edit: false,
        delete: false,
        invite: false
      }
    },
    description: 'View admin users and their roles',
    category: 'Administration'
  },

  'admin_user.create': {
    module: 'admin_user',
    pages: ['/admin-users'],
    actions: ['create_admin_user', 'invite_admin_user'],
    ui: {
      buttons: {
        invite: true,
        create: true
      }
    },
    dependencies: ['admin_user.read'],
    description: 'Create and invite admin users',
    category: 'Administration'
  },

  'admin_user.update': {
    module: 'admin_user',
    pages: ['/admin-users'],
    actions: ['edit_admin_user', 'update_admin_user_role'],
    ui: {
      buttons: {
        edit: true
      }
    },
    dependencies: ['admin_user.read'],
    description: 'Edit admin users and update roles',
    category: 'Administration'
  },

  'admin_user.delete': {
    module: 'admin_user',
    pages: ['/admin-users'],
    actions: ['delete_admin_user', 'deactivate_admin_user'],
    ui: {
      buttons: {
        delete: true,
        deactivate: true
      }
    },
    dependencies: ['admin_user.read'],
    description: 'Delete or deactivate admin users',
    category: 'Administration'
  },

  // ─────────────────────────────────────────────────────────
  // COMPANY MODULE (Org level)
  // ─────────────────────────────────────────────────────────
  'company.read': {
    module: 'company',
    pages: ['/company', '/company/[id]/details'],
    actions: ['view_company', 'export_company'],
    ui: {
      sidebar: {
        title: 'Companies',
        icon: 'tabler:building-skyscraper',
        badge: null,
        order: 2
      },
      buttons: {
        view: true,
        edit: false,
        delete: false
      }
    },
    description: 'View company details and structure',
    category: 'Organisation'
  },

  'company.create': {
    module: 'company',
    pages: ['/company'],
    actions: ['create_company'],
    ui: {
      buttons: {
        create: true,
        add: true
      }
    },
    dependencies: ['company.read'],
    description: 'Create new companies',
    category: 'Organisation'
  },

  'company.update': {
    module: 'company',
    pages: ['/company/[id]/details'],
    actions: ['edit_company', 'update_company'],
    ui: {
      buttons: {
        edit: true,
        update: true
      }
    },
    dependencies: ['company.read'],
    description: 'Edit company details',
    category: 'Organisation'
  },

  'company.delete': {
    module: 'company',
    pages: ['/company'],
    actions: ['delete_company', 'archive_company'],
    ui: {
      buttons: {
        delete: true,
        archive: true
      }
    },
    dependencies: ['company.read'],
    description: 'Delete or archive companies',
    category: 'Organisation'
  },

  // ─────────────────────────────────────────────────────────
  // DEPARTMENT MODULE
  // ─────────────────────────────────────────────────────────
  'department.read': {
    module: 'department',
    pages: ['/department'],
    actions: ['view_department', 'export_department'],
    ui: {
      sidebar: {
        title: 'Departments',
        icon: 'tabler:building',
        badge: null,
        order: 2
      },
      buttons: {
        view: true,
        edit: false,
        delete: false
      }
    },
    description: 'View departments',
    category: 'HR Operations'
  },

  'department.create': {
    module: 'department',
    pages: ['/department'],
    actions: ['create_department'],
    ui: {
      buttons: {
        create: true,
        add: true
      }
    },
    dependencies: ['department.read'],
    description: 'Create departments',
    category: 'HR Operations'
  },

  'department.update': {
    module: 'department',
    pages: ['/department'],
    actions: ['edit_department'],
    ui: {
      buttons: {
        edit: true,
        update: true
      }
    },
    dependencies: ['department.read'],
    description: 'Edit departments',
    category: 'HR Operations'
  },

  'department.delete': {
    module: 'department',
    pages: ['/department'],
    actions: ['delete_department'],
    ui: {
      buttons: {
        delete: true
      }
    },
    dependencies: ['department.read'],
    description: 'Delete departments',
    category: 'HR Operations'
  },

  // ─────────────────────────────────────────────────────────
  // DESIGNATION MODULE
  // ─────────────────────────────────────────────────────────
  'designation.read': {
    module: 'designation',
    pages: ['/designation'],
    actions: ['view_designation', 'export_designation'],
    ui: {
      sidebar: {
        title: 'Designations',
        icon: 'tabler:briefcase',
        badge: null,
        order: 3
      },
      buttons: {
        view: true,
        edit: false,
        delete: false
      }
    },
    description: 'View designations',
    category: 'HR Operations'
  },

  'designation.create': {
    module: 'designation',
    pages: ['/designation'],
    actions: ['create_designation'],
    ui: {
      buttons: {
        create: true,
        add: true
      }
    },
    dependencies: ['designation.read'],
    description: 'Create designations',
    category: 'HR Operations'
  },

  'designation.update': {
    module: 'designation',
    pages: ['/designation'],
    actions: ['edit_designation'],
    ui: {
      buttons: {
        edit: true,
        update: true
      }
    },
    dependencies: ['designation.read'],
    description: 'Edit designations',
    category: 'HR Operations'
  },

  'designation.delete': {
    module: 'designation',
    pages: ['/designation'],
    actions: ['delete_designation'],
    ui: {
      buttons: {
        delete: true
      }
    },
    dependencies: ['designation.read'],
    description: 'Delete designations',
    category: 'HR Operations'
  },

  // ─────────────────────────────────────────────────────────
  // UNIT MODULE
  // ─────────────────────────────────────────────────────────
  'unit.read': {
    module: 'unit',
    pages: ['/units'],
    actions: ['view_unit', 'export_unit'],
    ui: {
      sidebar: {
        title: 'Business Units',
        icon: 'tabler:building-community',
        badge: null,
        order: 2
      },
      buttons: {
        view: true,
        edit: false,
        delete: false
      }
    },
    description: 'View business units',
    category: 'Structure'
  },

  'unit.create': {
    module: 'unit',
    pages: ['/units'],
    actions: ['create_unit'],
    ui: {
      buttons: {
        create: true,
        add: true
      }
    },
    dependencies: ['unit.read'],
    description: 'Create business units',
    category: 'Structure'
  },

  'unit.update': {
    module: 'unit',
    pages: ['/units'],
    actions: ['edit_unit'],
    ui: {
      buttons: {
        edit: true,
        update: true
      }
    },
    dependencies: ['unit.read'],
    description: 'Edit business units',
    category: 'Structure'
  },

  'unit.delete': {
    module: 'unit',
    pages: ['/units'],
    actions: ['delete_unit'],
    ui: {
      buttons: {
        delete: true
      }
    },
    dependencies: ['unit.read'],
    description: 'Delete business units',
    category: 'Structure'
  },

  // ─────────────────────────────────────────────────────────
  // SITE MODULE
  // ─────────────────────────────────────────────────────────
  'site.read': {
    module: 'site',
    pages: ['/sites'],
    actions: ['view_site', 'export_site'],
    ui: {
      sidebar: {
        title: 'Sites & Locations',
        icon: 'tabler:map-pin',
        badge: null,
        order: 3
      },
      buttons: {
        view: true,
        edit: false,
        delete: false
      }
    },
    description: 'View sites and locations',
    category: 'Structure'
  },

  'site.create': {
    module: 'site',
    pages: ['/sites'],
    actions: ['create_site'],
    ui: {
      buttons: {
        create: true,
        add: true
      }
    },
    dependencies: ['site.read'],
    description: 'Create sites',
    category: 'Structure'
  },

  'site.update': {
    module: 'site',
    pages: ['/sites'],
    actions: ['edit_site'],
    ui: {
      buttons: {
        edit: true,
        update: true
      }
    },
    dependencies: ['site.read'],
    description: 'Edit sites',
    category: 'Structure'
  },

  'site.delete': {
    module: 'site',
    pages: ['/sites'],
    actions: ['delete_site'],
    ui: {
      buttons: {
        delete: true
      }
    },
    dependencies: ['site.read'],
    description: 'Delete sites',
    category: 'Structure'
  },

  // ─────────────────────────────────────────────────────────
  // EMPLOYEE MODULE
  // ─────────────────────────────────────────────────────────
  'employee.read': {
    module: 'employee',
    pages: [
      '/users',
      '/users/view/[id]',
      '/department',
      '/designation'
    ],
    actions: ['view_employee', 'export_employee'],
    ui: {
      sidebar: {
        title: 'Employees',
        icon: 'tabler:users',
        badge: null,
        order: 1
      },
      buttons: {
        view: true,
        edit: false,
        delete: false,
        invite: false
      }
    },
    description: 'View employee profiles and organizational structure',
    category: 'HR Operations'
  },

  'employee.create': {
    module: 'employee',
    pages: ['/users', '/users/bulk-import'],
    actions: ['create_employee', 'import_employee', 'invite_user'],
    ui: {
      buttons: {
        invite: true,
        bulk_import: true
      }
    },
    dependencies: ['employee.read'],
    description: 'Create employees and send invitations',
    category: 'HR Operations'
  },

  'employee.update': {
    module: 'employee',
    pages: ['/users/view/[id]'],
    actions: ['edit_employee', 'approve_employee'],
    ui: {
      buttons: {
        edit: true,
        approve: true
      }
    },
    dependencies: ['employee.read'],
    description: 'Edit employee details and approve accounts',
    category: 'HR Operations'
  },

  'employee.delete': {
    module: 'employee',
    actions: ['delete_employee', 'deactivate_employee'],
    ui: {
      buttons: {
        delete: true,
        deactivate: true
      }
    },
    dependencies: ['employee.read'],
    description: 'Delete or deactivate employee records',
    category: 'HR Operations'
  },

  // ─────────────────────────────────────────────────────────
  // ATTENDANCE MODULE
  // ─────────────────────────────────────────────────────────
  'attendance.read': {
    module: 'attendance',
    pages: [
      '/attendance/my',
      '/attendance/team',
      '/attendance'
    ],
    actions: ['view_attendance', 'export_attendance'],
    ui: {
      sidebar: {
        title: 'Attendance',
        icon: 'tabler:clock-check',
        badge: 'Live',
        badgeColor: 'success',
        order: 4
      },
      tabs: ['my', 'team'],
      buttons: {
        view: true,
        export: true,
        regularize: false
      }
    },
    description: 'View attendance records and reports',
    category: 'HR Operations'
  },

  'attendance.create': {
    module: 'attendance',
    actions: ['punch_in', 'punch_out', 'mark_attendance'],
    ui: {
      buttons: {
        punch_in: true
      }
    },
    dependencies: ['attendance.read'],
    description: 'Mark attendance (punch in/out)',
    category: 'HR Operations'
  },

  'attendance.update': {
    module: 'attendance',
    pages: ['/attendance/team'],
    actions: ['regularize_attendance', 'edit_attendance'],
    ui: {
      tabs: ['team'],
      buttons: {
        regularize: true,
        edit: true
      }
    },
    dependencies: ['attendance.read'],
    description: 'Regularize and edit attendance records',
    category: 'HR Operations'
  },

  'attendance.approve': {
    module: 'attendance',
    pages: ['/attendance/team'],
    actions: ['approve_regularisation', 'reject_regularisation'],
    ui: {
      buttons: {
        approve: true,
        reject: true
      }
    },
    dependencies: ['attendance.read'],
    description: 'Approve attendance regularization requests',
    category: 'HR Operations'
  },

  // ─────────────────────────────────────────────────────────
  // LEAVE MODULE
  // ─────────────────────────────────────────────────────────
  'leave.read': {
    module: 'leave',
    pages: ['/leaves', '/leaves/approvals'],
    actions: ['view_leave', 'view_balance'],
    ui: {
      sidebar: {
        title: 'Leaves',
        icon: 'tabler:calendar-user',
        badge: 'New',
        badgeColor: 'error',
        order: 5
      },
      tabs: ['my', 'approvals'],
      buttons: {
        view: true
      }
    },
    description: 'View leave requests and balances',
    category: 'HR Operations'
  },

  'leave.create': {
    module: 'leave',
    pages: ['/leaves'],
    actions: ['apply_leave', 'cancel_leave'],
    ui: {
      buttons: {
        apply: true
      }
    },
    dependencies: ['leave.read'],
    description: 'Apply for leave',
    category: 'HR Operations'
  },

  'leave.update': {
    module: 'leave',
    actions: ['edit_leave', 'cancel_leave'],
    ui: {
      buttons: {
        edit: true,
        cancel: true
      }
    },
    dependencies: ['leave.read'],
    description: 'Edit or cancel leave requests',
    category: 'HR Operations'
  },

  'leave.approve': {
    module: 'leave',
    pages: ['/leaves/approvals'],
    actions: ['approve_leave', 'reject_leave'],
    ui: {
      tabs: ['approvals'],
      buttons: {
        approve: true,
        reject: true
      }
    },
    dependencies: ['leave.read'],
    description: 'Approve or reject leave requests',
    category: 'HR Operations'
  },

  // ─────────────────────────────────────────────────────────
  // PAYROLL MODULE
  // ─────────────────────────────────────────────────────────
  'payroll.read': {
    module: 'payroll',
    pages: [
      '/payroll/my',
      '/payroll/history',
      '/payroll/investment-declarations'
    ],
    actions: ['view_payslip', 'download_payslip', 'view_history'],
    ui: {
      sidebar: {
        title: 'Payroll',
        icon: 'tabler:cash',
        badge: null,
        order: 6
      },
      tabs: ['my', 'history', 'investment-declarations'],
      buttons: {
        view: true,
        download: true
      }
    },
    description: 'View payslips and payroll history',
    category: 'Payroll'
  },

  'payroll.run': {
    module: 'payroll',
    pages: ['/payroll/run'],
    actions: ['execute_payroll', 'approve_payroll'],
    ui: {
      sidebar: {
        badge: 'RUN',
        badgeColor: 'warning'
      },
      tabs: ['run'],
      buttons: {
        run: true,
        approve: true
      }
    },
    dependencies: ['attendance.read', 'leave.read', 'payrollPolicy.read'],
    description: 'Execute monthly payroll process',
    category: 'Payroll'
  },

  'payroll.create': {
    module: 'payroll',
    pages: ['/payroll/salary-register'],
    actions: ['create_salary_structure', 'add_bonus', 'add_deduction'],
    ui: {
      tabs: ['salary-register'],
      buttons: {
        add_salary: true,
        add_bonus: true,
        add_deduction: true
      }
    },
    dependencies: ['payroll.read'],
    description: 'Create salary structures and adjustments',
    category: 'Payroll'
  },

  'payroll.update': {
    module: 'payroll',
    pages: ['/payroll/salary-register'],
    actions: ['edit_salary_structure', 'adjust_bonus', 'hold_payment'],
    ui: {
      buttons: {
        edit_salary: true,
        hold_payment: true
      }
    },
    dependencies: ['payroll.read'],
    description: 'Modify payroll data',
    category: 'Payroll'
  },

  // ─────────────────────────────────────────────────────────
  // SHIFT MODULE
  // ─────────────────────────────────────────────────────────
  'shift.read': {
    module: 'shift',
    pages: ['/shift', '/shift/[id]'],
    actions: ['view_shift', 'export_shift'],
    ui: {
      sidebar: {
        title: 'Shifts',
        icon: 'tabler:clock',
        badge: null,
        order: 8
      },
      buttons: {
        view: true,
        export: true
      }
    },
    description: 'View shifts and rosters',
    category: 'HR Operations'
  },

  'shift.create': {
    module: 'shift',
    pages: ['/shift'],
    actions: ['create_shift', 'assign_roster'],
    ui: {
      buttons: {
        create: true,
        assign_roster: true
      }
    },
    dependencies: ['shift.read'],
    description: 'Create shifts and assign rosters',
    category: 'HR Operations'
  },

  'shift.update': {
    module: 'shift',
    pages: ['/shift/[id]'],
    actions: ['edit_shift', 'swap_shift'],
    ui: {
      buttons: {
        edit: true,
        swap: true
      }
    },
    dependencies: ['shift.read'],
    description: 'Edit shifts and swap assignments',
    category: 'HR Operations'
  },

  'shift.delete': {
    module: 'shift',
    actions: ['delete_shift', 'remove_roster'],
    ui: {
      buttons: {
        delete: true
      }
    },
    dependencies: ['shift.read'],
    description: 'Delete shifts and remove rosters',
    category: 'HR Operations'
  },

  // ─────────────────────────────────────────────────────────
  // HOLIDAY MODULE
  // ─────────────────────────────────────────────────────────
  'holiday.read': {
    module: 'holiday',
    pages: ['/holidays'],
    actions: ['view_holiday'],
    ui: {
      sidebar: {
        title: 'Holidays',
        icon: 'tabler:calendar-event',
        badge: null,
        order: 7
      },
      buttons: {
        view: true
      }
    },
    description: 'View holiday calendar',
    category: 'HR Operations'
  },

  'holiday.create': {
    module: 'holiday',
    pages: ['/holidays'],
    actions: ['create_holiday'],
    ui: {
      buttons: {
        add: true
      }
    },
    dependencies: ['holiday.read'],
    description: 'Create holidays',
    category: 'HR Operations'
  },

  'holiday.update': {
    module: 'holiday',
    actions: ['edit_holiday'],
    ui: {
      buttons: {
        edit: true
      }
    },
    dependencies: ['holiday.read'],
    description: 'Edit holiday details',
    category: 'HR Operations'
  },

  'holiday.delete': {
    module: 'holiday',
    actions: ['delete_holiday'],
    ui: {
      buttons: {
        delete: true
      }
    },
    dependencies: ['holiday.read'],
    description: 'Delete holidays',
    category: 'HR Operations'
  },

  // ─────────────────────────────────────────────────────────
  // ROLE MODULE
  // ─────────────────────────────────────────────────────────
  'role.read': {
    module: 'role',
    pages: ['/admin/access-control'],
    actions: ['view_role', 'view_permissions'],
    ui: {
      sidebar: {
        title: 'Access Control',
        icon: 'tabler:lock',
        badge: null,
        order: 10
      },
      buttons: {
        view: true
      }
    },
    description: 'View roles and permissions',
    category: 'Administration'
  },

  'role.create': {
    module: 'role',
    pages: ['/admin/access-control'],
    actions: ['create_role', 'assign_permissions'],
    ui: {
      buttons: {
        create: true
      }
    },
    dependencies: ['role.read'],
    description: 'Create roles and assign permissions',
    category: 'Administration'
  },

  'role.update': {
    module: 'role',
    pages: ['/admin/access-control'],
    actions: ['edit_role', 'modify_permissions'],
    ui: {
      buttons: {
        edit: true
      }
    },
    dependencies: ['role.read'],
    description: 'Edit roles and modify permissions',
    category: 'Administration'
  },

  'role.delete': {
    module: 'role',
    actions: ['delete_role'],
    ui: {
      buttons: {
        delete: true
      }
    },
    dependencies: ['role.read'],
    description: 'Delete roles',
    category: 'Administration'
  },

  // ─────────────────────────────────────────────────────────
  // BIOMETRIC MODULE
  // ─────────────────────────────────────────────────────────
  'biometric.read': {
    module: 'biometric',
    pages: ['/biometric'],
    actions: ['view_biometric_config', 'view_devices', 'view_sync_logs'],
    ui: {
      sidebar: {
        title: 'Biometric',
        icon: 'tabler:fingerprint',
        badge: null,
        order: 8
      },
      buttons: {
        view: true
      }
    },
    description: 'View biometric device configuration',
    category: 'HR Operations'
  },

  'biometric.create': {
    module: 'biometric',
    pages: ['/biometric'],
    actions: ['add_device', 'push_employee_to_device'],
    ui: {
      buttons: {
        add: true,
        push: true
      }
    },
    dependencies: ['biometric.read'],
    description: 'Add biometric devices and push employees',
    category: 'HR Operations'
  },

  'biometric.update': {
    module: 'biometric',
    pages: ['/biometric'],
    actions: ['edit_biometric_config', 'test_connection', 'sync_attendance'],
    ui: {
      buttons: {
        edit: true,
        sync: true,
        test: true
      }
    },
    dependencies: ['biometric.read'],
    description: 'Edit config, test connection, sync attendance',
    category: 'HR Operations'
  },

  'biometric.delete': {
    module: 'biometric',
    pages: ['/biometric'],
    actions: ['remove_device'],
    ui: {
      buttons: {
        delete: true
      }
    },
    dependencies: ['biometric.read'],
    description: 'Remove biometric devices',
    category: 'HR Operations'
  }
};

// ─────────────────────────────────────────────────────────
// ROLE DEFAULT PAGES
// ─────────────────────────────────────────────────────────

export const ROLE_DEFAULT_PAGES = {
  'employee': ['/dashboards/analytics', '/attendance/my', '/leaves', '/payroll/my'],
  'manager': ['/dashboards/analytics', '/attendance/team', '/leaves/approvals', '/payroll/my'],
  'hr_manager': ['/dashboards/analytics', '/users', '/attendance/team', '/leaves/approvals', '/payroll/run'],
  'unit_admin': ['/dashboards/analytics', '/users', '/attendance/team', '/leaves/approvals', '/payroll/run', '/shift', '/policy'],
  'company_admin': ['/dashboards/analytics', '/users', '/company/view/[id]', '/admin/access-control'],
  'company_hr_manager': ['/dashboards/analytics', '/users', '/attendance', '/leaves', '/payroll'],
  'org_admin': ['/dashboards/analytics', '/company', '/admin/access-control'],
  'org_auditor': ['/dashboards/analytics', '/charts/recharts'],
  'super_admin': ['/dashboards/analytics']
};

// ─────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────

/**
 * Get all accessible pages for a permission array
 */
export const getAccessiblePages = (permissions) => {
  if (!permissions || !Array.isArray(permissions)) return [];
  
  const pages = new Set();
  
  permissions.forEach(permSlug => {
    const config = PERMISSION_PAGE_MAP[permSlug];
    if (config?.pages) {
      config.pages.forEach(page => pages.add(page));
    }
  });
  
  return Array.from(pages);
};

/**
 * Check if user can access a specific page
 */
export const canAccessPage = (permissions, pagePath) => {
  if (!permissions || !Array.isArray(permissions)) return false;
  
  return permissions.some(permSlug => {
    const config = PERMISSION_PAGE_MAP[permSlug];
    return config?.pages?.some(page => {
      // Handle dynamic routes like /users/view/[id]
      const regex = new RegExp('^' + page.replace(/\[.*?\]/g, '.*') + '$');
      return regex.test(pagePath);
    });
  });
};

/**
 * Check if user can perform a specific action
 */
export const canPerformAction = (permissions, action) => {
  if (!permissions || !Array.isArray(permissions)) return false;
  
  return permissions.some(permSlug => {
    const config = PERMISSION_PAGE_MAP[permSlug];
    return config?.actions?.includes(action);
  });
};

/**
 * Get UI metadata for a permission
 */
export const getPermissionUI = (permissionSlug) => {
  return PERMISSION_PAGE_MAP[permissionSlug]?.ui || {};
};

/**
 * Get sidebar config for module permissions
 */
export const getSidebarConfig = (permissions) => {
  const sidebarItems = [];
  const modules = new Map();
  
  permissions.forEach(permSlug => {
    const config = PERMISSION_PAGE_MAP[permSlug];
    if (config?.ui?.sidebar) {
      const mod = config.module;
      if (!modules.has(mod)) {
        modules.set(mod, {
          ...config.ui.sidebar,
          permission: permSlug,
          pages: config.pages || []
        });
      } else {
        // Merge pages from multiple permissions of same module
        const existing = modules.get(mod);
        existing.pages = [...new Set([...existing.pages, ...(config.pages || [])])];
      }
    }
  });
  
  // Sort by order
  const sorted = Array.from(modules.values()).sort((a, b) => 
    (a.order || 99) - (b.order || 99)
  );
  
  sorted.forEach(item => {
    sidebarItems.push({
      title: item.title,
      icon: item.icon,
      path: item.pages[0] || '#',
      badgeContent: item.badge,
      badgeColor: item.badgeColor
    });
  });
  
  return sidebarItems;
};

/**
 * Get available buttons for a page
 */
export const getPageButtons = (permissions, pagePath) => {
  const buttons = {
    view: false,
    create: false,
    edit: false,
    delete: false,
    approve: false,
    export: false
  };
  
  permissions.forEach(permSlug => {
    const config = PERMISSION_PAGE_MAP[permSlug];
    if (config?.pages?.some(page => {
      const regex = new RegExp('^' + page.replace(/\[.*?\]/g, '.*') + '$');
      return regex.test(pagePath);
    })) {
      Object.assign(buttons, config.ui?.buttons || {});
    }
  });
  
  return buttons;
};
