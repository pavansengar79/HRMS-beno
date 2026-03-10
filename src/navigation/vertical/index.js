const navigation = () => {
  return [
    {
      title: 'Dashboard',
      icon: 'mdi:home',
      path: '/dashboards/analytics',
      action: 'read',
      subject: 'dashboard'
    },

    {
      title: 'Company',
      icon: 'mdi:user',
      path: '/company',
      action: 'read',
      subject: 'employees'
    },
  
    {
      title: 'Employees',
      icon: 'mdi:user',
      path: '/users',
      action: 'read',
      subject: 'employees'
    },
  
   
    {
      title: 'roles',
      icon: 'mdi:user',
      path: '/roles',
      action: 'read',
      subject: 'roles'
    },
     {
      title: 'Permission',
      icon: 'mdi:user',
      path: '/rolesPermission',
      action: 'read',
      subject: 'permissions'
    },
    {
      title: 'Attendance',
      icon: 'mdi:user',
      path: '/attendance',
      action: 'read',
      subject: 'attendance'
    },
    {
      title: 'Leaves',
      icon: 'mdi:user',
      path: '/leaves',
      action: 'read',
      subject: 'leaves'
    },
    {
      title: 'Payrolls',
      icon: 'mdi:user',
      path: '/payrolls',
      action: 'manage',
      subject: 'payrolls'
    },
    {
      title: 'Holidays',
      icon: 'mdi:user',
      path: '/holidays',
      action: 'read',
      subject: 'holidays'
    },
    {
      title: 'Settings',
      icon: 'mdi:user',
      path: '/settings',
      action: 'read',
      subject: 'settings'
    },
   
    
    
  ]
}

export default navigation
