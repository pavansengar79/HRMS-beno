// src/pages/dashboards/analytics/customRoleDashboard.js
// Dashboard for custom roles - shows available modules as quick action cards
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { selectPermissions } from 'src/store/auth/authSlice'
import { useTheme, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Icon from 'src/@core/components/icon'

// Module configuration with icons, colors, and actions
const MODULE_CONFIG = {
  company: {
    icon: 'tabler:building-skyscraper',
    color: '#6366f1',
    label: 'Companies',
    description: 'Manage organization companies',
    path: '/company',
    actions: ['company.read', 'company.create', 'company.update']
  },
  admin_user: {
    icon: 'tabler:user-shield',
    color: '#8b5cf6',
    label: 'Admin Users',
    description: 'Manage admin users',
    path: '/admin-users',
    actions: ['admin_user.read', 'admin_user.create']
  },
  employee: {
    icon: 'tabler:users',
    color: '#10b981',
    label: 'Employees',
    description: 'Manage employees and workforce',
    path: '/users',
    actions: ['employee.read', 'employee.create', 'employee.update']
  },
  department: {
    icon: 'tabler:building',
    color: '#f59e0b',
    label: 'Departments',
    description: 'Manage departments',
    path: '/department',
    actions: ['department.read', 'department.create']
  },
  designation: {
    icon: 'tabler:briefcase',
    color: '#ec4899',
    label: 'Designations',
    description: 'Manage designations',
    path: '/designation',
    actions: ['designation.read', 'designation.create']
  },
  attendance: {
    icon: 'tabler:clock-check',
    color: '#06b6d4',
    label: 'Attendance',
    description: 'Track and manage attendance',
    path: '/attendance',
    actions: ['attendance.read', 'attendance.create', 'attendance.update']
  },
  leave: {
    icon: 'tabler:calendar-user',
    color: '#f97316',
    label: 'Leaves',
    description: 'Manage leave requests and balances',
    path: '/leaves',
    actions: ['leave.read', 'leave.create']
  },
  leavePolicy: {
    icon: 'tabler:calendar-off',
    color: '#14b8a6',
    label: 'Leave Policy',
    description: 'Configure leave policies',
    path: '/policy?tab=leave',
    actions: ['leavePolicy.read', 'leavePolicy.create']
  },
  attendancePolicy: {
    icon: 'tabler:clock',
    color: '#0ea5e9',
    label: 'Attendance Policy',
    description: 'Configure attendance policies',
    path: '/policy?tab=attendance',
    actions: ['attendancePolicy.read', 'attendancePolicy.create']
  },
  payroll: {
    icon: 'tabler:cash',
    color: '#84cc16',
    label: 'Payroll',
    description: 'Manage payroll processing',
    path: '/payroll',
    actions: ['payroll.read', 'payroll.create']
  },
  payrollPolicy: {
    icon: 'tabler:cash-banknote',
    color: '#22c55e',
    label: 'Payroll Policy',
    description: 'Configure payroll policies',
    path: '/policy?tab=payroll',
    actions: ['payrollPolicy.read', 'payrollPolicy.create']
  },
  holiday: {
    icon: 'tabler:calendar-event',
    color: '#a855f7',
    label: 'Holidays',
    description: 'Manage holiday calendar',
    path: '/holidays',
    actions: ['holiday.read', 'holiday.create']
  },
  shift: {
    icon: 'tabler:clock',
    color: '#64748b',
    label: 'Shifts',
    description: 'Manage shift schedules',
    path: '/shift',
    actions: ['shift.read', 'shift.create']
  },
  unit: {
    icon: 'tabler:building-community',
    color: '#0284c7',
    label: 'Units',
    description: 'Manage business units',
    path: '/units',
    actions: ['unit.read', 'unit.create']
  },
  role: {
    icon: 'tabler:lock',
    color: '#7c3aed',
    label: 'Access Control',
    description: 'Manage roles and permissions',
    path: '/admin/access-control',
    actions: ['role.read', 'role.create']
  },
  delegation: {
    icon: 'tabler:users-plus',
    color: '#db2777',
    label: 'Delegation',
    description: 'Manage permission delegation',
    path: '/delegation',
    actions: ['delegation.read', 'delegation.create']
  }
}

const QuickActionCard = ({ module, permissions }) => {
  const router = useRouter()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  
  const { icon, color, label, description, path, actions } = module
  
  // Check if user has any permission for this module
  const hasAccess = actions.some(action => permissions.includes(action))
  
  if (!hasAccess) return null
  
  const availableActions = actions.filter(action => permissions.includes(action))
  const canCreate = permissions.some(p => p.includes('.create') || p.includes('.update'))
  
  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, isDark ? 0.15 : 0.05)} 0%, transparent 70%)`,
        border: '1px solid',
        borderColor: alpha(color, 0.2),
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.4),
        }
      }}
    >
      <CardContent sx={{ p: theme => theme.spacing(3, 3, 2.5) }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha(color, 0.15),
              color: color
            }}
          >
            <Icon icon={icon} fontSize={24} />
          </Avatar>
          <Chip
            label={`${availableActions.length} action${availableActions.length > 1 ? 's' : ''}`}
            size='small'
            sx={{
              fontSize: 10,
              height: 20,
              fontWeight: 600,
              bgcolor: alpha(color, 0.1),
              color: color
            }}
          />
        </Box>
        
        <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          {description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            variant='contained'
            size='small'
            startIcon={<Icon icon='tabler:eye' />}
            onClick={() => router.push(path)}
            sx={{
              flex: 1,
              bgcolor: color,
              '&:hover': { bgcolor: color, opacity: 0.9 }
            }}
          >
            View
          </Button>
          {canCreate && (
            <Button
              variant='outlined'
              size='small'
              startIcon={<Icon icon='tabler:plus' />}
              onClick={() => router.push(`${path}?action=create`)}
              sx={{
                flex: 1,
                borderColor: alpha(color, 0.3),
                color: color,
                '&:hover': { borderColor: color, bgcolor: alpha(color, 0.1) }
              }}
            >
              Add New
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

const CustomRoleDashboard = () => {
  const theme = useTheme()
  const permissions = useSelector(selectPermissions) || []
  const router = useRouter()
  
  // Get available modules based on permissions
  const availableModules = useMemo(() => {
    const modules = []
    Object.entries(MODULE_CONFIG).forEach(([key, config]) => {
      const hasAccess = config.actions.some(action => permissions.includes(action))
      if (hasAccess) {
        modules.push({ key, ...config })
      }
    })
    return modules
  }, [permissions])
  
  if (availableModules.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 8 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 4,
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.warning.main, 0.08)
          }}
        >
          <Icon icon='tabler:lock-access' fontSize={40} style={{ color: theme.palette.warning.main }} />
        </Avatar>
        <Typography variant='h5' sx={{ fontWeight: 700, mb: 2 }}>
          No Modules Available
        </Typography>
        <Typography variant='body2' sx={{ color: 'text.secondary', mb: 4 }}>
          Your role doesn't have any module permissions assigned. Please contact your administrator to get access.
        </Typography>
        <Button
          variant='outlined'
          startIcon={<Icon icon='tabler:logout' />}
          onClick={() => router.push('/logout')}
        >
          Sign Out
        </Button>
      </Box>
    )
  }
  
  return (
    <Box sx={{ p: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1 }}>
          Your Dashboard
        </Typography>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          Quick access to modules you have permission for
        </Typography>
        <Chip
          label={`${permissions.length} permissions active`}
          size='small'
          color='primary'
          sx={{ mt: 2 }}
        />
      </Box>
      
      {/* Module Grid */}
      <Grid container spacing={4}>
        {availableModules.map(module => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={module.key}>
            <QuickActionCard module={module} permissions={permissions} />
          </Grid>
        ))}
      </Grid>
      
      {/* Stats summary */}
      <Card sx={{ mt: 6, p: 4, bgcolor: theme => alpha(theme.palette.primary.main, 0.05) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <Icon icon='tabler:shield-check' />
          </Avatar>
          <Box>
            <Typography variant='body1' sx={{ fontWeight: 600 }}>
              Custom Role Dashboard
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              You have access to {availableModules.length} module{availableModules.length > 1 ? 's' : ''}. Contact your admin for additional access.
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}

export default CustomRoleDashboard
