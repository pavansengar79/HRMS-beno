const navigation = () => {
  return [
    {
      title: 'Dashboard',
      icon: 'mdi:view-dashboard-outline',
      path: '/dashboards/analytics',
      action: 'read',
      subject: 'dashboard'
    },

    {
      title: 'Company',
      icon: 'mdi:domain',
      path: '/company',
      action: 'read',
      subject: 'employees'
    },

    {
      title: 'Departments',
      icon: 'mdi:office-building-outline',
      path: '/department',
      action: 'read',
      subject: 'departments'
    },

    {
      title: 'Employees',
      icon: 'mdi:account-group-outline',
      path: '/users',
      action: 'read',
      subject: 'employees'
    },


    {
      title: 'Permission',
      icon: 'mdi:key-outline',
      path: '/rolesPermission',
      action: 'read',
      subject: 'permissions'
    },

    {
      title: 'Attendance',
      icon: 'mdi:clock-check-outline',
      path: '/attendance',
      action: 'read',
      subject: 'attendance'
    },

    {
      title: 'Leaves',
      icon: 'mdi:calendar-account-outline',
      path: '/leaves',
      action: 'read',
      subject: 'leaves'
    },

    {
      title: 'Payrolls',
      icon: 'mdi:cash-multiple',
      path: '/payroll',
      action: 'manage',
      subject: 'payrolls'
    },

    {
      title: 'Holidays',
      icon: 'mdi:calendar-star',
      path: '/holidays',
      action: 'read',
      subject: 'holidays'
    },

    {
      title: 'Settings',
      icon: 'mdi:cog-outline',
      path: '/settings',
      action: 'read',
      subject: 'settings'
    }
  ]
}

export default navigation