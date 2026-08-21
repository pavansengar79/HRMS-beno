// src/pages/audit-analytics/index.js
// AI-Powered Enterprise Audit Analytics Dashboard
// With Canonical Action Groups and Date Range Filters

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

// MUI Components
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

// Custom Components
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// Store & Utils
import { selectUser, selectRoleSlug } from 'src/store/auth/authSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { formatDistanceToNow, format } from 'date-fns'

// ─── Module Configuration ─────────────────────────────────────────────────────
const MODULE_CONFIG = {
  auth: { label: 'Authentication', color: 'secondary' },
  employee: { label: 'Employee', color: 'primary' },
  leave: { label: 'Leave', color: 'info' },
  attendance: { label: 'Attendance', color: 'success' },
  payroll: { label: 'Payroll', color: 'warning' },
  shift: { label: 'Shift', color: 'secondary' },
  roster: { label: 'Roster', color: 'info' },
  delegation: { label: 'Delegation', color: 'warning' },
  policy: { label: 'Policy', color: 'primary' },
  role: { label: 'Role', color: 'error' },
  superAdmin: { label: 'Super Admin', color: 'error' }
}

const MODULE_ICONS = {
  auth: 'tabler:shield-lock',
  employee: 'tabler:users',
  leave: 'tabler:calendar-x',
  attendance: 'tabler:clock',
  payroll: 'tabler:currency-dollar',
  shift: 'tabler:clock-2',
  roster: 'tabler:calendar-check',
  delegation: 'tabler:arrow-forward-right',
  policy: 'tabler:file-shredder',
  role: 'tabler:shield-check',
  default: 'tabler:activity'
}

const MODULE_COLORS = {
  auth: 'info',
  employee: 'primary',
  leave: 'warning',
  attendance: 'success',
  payroll: 'secondary',
  shift: 'error',
  roster: 'info',
  delegation: 'warning',
  policy: 'primary',
  role: 'secondary',
  default: 'default'
}

// ─── Canonical Action Groups ─────────────────────────────────────────────────
// Actions grouped by canonical name for better filtering
const CANONICAL_ACTION_GROUPS = {
  authentication: {
    label: 'Authentication',
    icon: 'tabler:shield-lock',
    description: 'Login, Logout, Password Management',
    actions: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'LOGIN_ACTIVATED', 'PASSWORD_CHANGED', 'FORGOT_PASSWORD', 'RESET_PASSWORD', 'GOOGLE_CALLBACK']
  },
  employee_management: {
    label: 'Employee Management',
    icon: 'tabler:users',
    description: 'Create, Update, Delete Employees',
    actions: ['EMPLOYEE_CREATED', 'EMPLOYEE_UPDATED', 'EMPLOYEE_DELETED', 'EMPLOYEE_PROFILE_VIEWED', 'EMPLOYEE_PHOTO_UPDATED', 'EMPLOYEE_STATUS_CHANGED']
  },
  leave_management: {
    label: 'Leave Management',
    icon: 'tabler:calendar-x',
    description: 'Leave Applications and Approvals',
    actions: ['LEAVE_APPLIED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_CANCELLED', 'LEAVE_UPDATED', 'LEAVE_BALANCE_CHECKED']
  },
  attendance_management: {
    label: 'Attendance Management',
    icon: 'tabler:clock',
    description: 'Attendance Marking and Syncing',
    actions: ['ATTENDANCE_MARKED', 'ATTENDANCE_UPDATED', 'ATTENDANCE_REGULARIZED', 'ATTENDANCE_EXPORTED', 'ATTENDANCE_SYNCED', 'BIOMETRIC_SYNC']
  },
  role_management: {
    label: 'Role Management',
    icon: 'tabler:shield',
    description: 'Role Creation and Assignment',
    actions: ['ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED', 'ROLE_ASSIGNED', 'ROLE_REVOKED']
  },
  roster_management: {
    label: 'Roster Management',
    icon: 'tabler:calendar-check',
    description: 'Roster Scheduling and Approval',
    actions: ['ROSTER_CREATED', 'ROSTER_UPDATED', 'ROSTER_DELETED', 'ROSTER_BULK_CREATED', 'ROSTER_REVOKED', 'ROSTER_APPROVED', 'ROSTER_REJECTED']
  },
  delegation_management: {
    label: 'Delegation Management',
    icon: 'tabler:arrow-forward-right',
    description: 'Task Delegation Workflow',
    actions: ['DELEGATION_CREATED', 'DELEGATION_UPDATED', 'DELEGATION_CANCELLED', 'DELEGATION_REVOKED', 'DELEGATION_APPROVED', 'DELEGATION_REJECTED']
  },
  policy_management: {
    label: 'Policy Management',
    icon: 'tabler:file-text',
    description: 'Policy Configuration',
    actions: ['POLICY_CREATED', 'POLICY_UPDATED', 'POLICY_DELETED', 'POLICY_ACTIVATED', 'POLICY_DEACTIVATED']
  },
  shift_management: {
    label: 'Shift Management',
    icon: 'tabler:clock-2',
    description: 'Shift Configuration',
    actions: ['SHIFT_CREATED', 'SHIFT_UPDATED', 'SHIFT_DELETED', 'SHIFT_ACTIVATED', 'SHIFT_DEACTIVATED']
  }
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getDefaultFromDate = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
}

const AuditAnalytics = () => {
  const router = useRouter()
  const user = useSelector(selectUser)
  const roleSlug = useSelector(selectRoleSlug)

  // State
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [modules, setModules] = useState([])
  const [actionsByModule, setActionsByModule] = useState([])
  const [stats, setStats] = useState({ totalLogs: 0 })

  // Filters
  const [selectedModule, setSelectedModule] = useState('')
  const [selectedCanonicalAction, setSelectedCanonicalAction] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  
  // Date Range - Default: current month start to today
  const [fromDate, setFromDate] = useState(getDefaultFromDate())
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0])

  // Access Control
  useEffect(() => {
    const ADMIN_ROLES = ['SUPER_ADMIN', 'org_admin', 'company_admin', 'unit_admin']
    if (!ADMIN_ROLES.includes(roleSlug)) {
      toast.error('Access denied. Only administrators can access audit analytics.')
      router.push('/dashboards/analytics')
    }
  }, [roleSlug, router])

  // Fetch metadata on mount
  useEffect(() => {
    fetchMetadata()
    fetchDashboard()
  }, [])

  // Fetch metadata
  const fetchMetadata = async () => {
    try {
      const res = await axiosRequest.get('/api/v1/audit-logs/analytics/metadata')
      if (res?.success) {
        console.log('[AuditAnalytics] Metadata received:', {
          modules: res.data.modules,
          actionsByModule: res.data.actionsByModule,
          sampleModule: res.data.actionsByModule?.[0]
        })
        setModules(res.data.modules || [])
        setActionsByModule(res.data.actionsByModule || [])
      }
    } catch (err) {
      console.error('[AuditAnalytics] Metadata error:', err)
    }
  }

  // Fetch dashboard
  const fetchDashboard = async () => {
    try {
      const res = await axiosRequest.get('/api/v1/audit-logs/analytics/dashboard')
      if (res?.success) {
        setStats(res.data)
      }
    } catch (err) {
      console.error('[AuditAnalytics] Dashboard error:', err)
    }
  }

  // Get canonical action groups for selected module
  const getCanonicalActionGroups = () => {
    if (!selectedModule) {
      return []
    }
    
    // Filter canonical groups that have actions in selected module
    return Object.entries(CANONICAL_ACTION_GROUPS).filter(([_key, group]) => {
      const moduleData = actionsByModule.find(m => m.module === selectedModule)
      if (!moduleData) return false
      // Only show canonical groups that have at least one action in this module
      return group.actions.some(action => moduleData.actions.includes(action))
    })
  }

  // Get actions for selected canonical group AND module
  const getModuleActions = () => {
    // If canonical action selected, return only those actions
    if (selectedCanonicalAction && CANONICAL_ACTION_GROUPS[selectedCanonicalAction]) {
      const canonicalActions = CANONICAL_ACTION_GROUPS[selectedCanonicalAction].actions
      
      // If module is also selected, filter canonical actions by module
      if (selectedModule) {
        const moduleData = actionsByModule.find(m => m.module === selectedModule)
        if (!moduleData) {
          console.warn('[AuditAnalytics] No module data found for:', selectedModule)
          return []
        }
        // Return only canonical actions that exist in this module
        const filtered = canonicalActions.filter(action => moduleData.actions.includes(action))
        console.log('[AuditAnalytics] Canonical actions filtered by module:', {
          module: selectedModule,
          canonicalAction: selectedCanonicalAction,
          canonicalActions,
          moduleActions: moduleData.actions,
          result: filtered
        })
        return filtered
      }
      
      console.log('[AuditAnalytics] Canonical actions (no module filter):', canonicalActions)
      return canonicalActions
    }
    
    // No canonical action selected - filter by module only
    if (!selectedModule) {
      console.log('[AuditAnalytics] No module selected, returning empty')
      return []
    }
    
    const moduleData = actionsByModule.find(m => m.module === selectedModule)
    if (!moduleData) {
      console.warn('[AuditAnalytics] No module data for:', selectedModule)
      return []
    }
    
    console.log('[AuditAnalytics] Module actions:', {
      module: selectedModule,
      actions: moduleData.actions
    })
    return moduleData.actions || []
  }

  // Handle module change - RESET all filters
  const handleModuleChange = (event) => {
    const selectedModuleValue = event.target.value
    setSelectedModule(selectedModuleValue)
    setSelectedCanonicalAction('')
    setSelectedAction('')
  }

  // Handle canonical action change - RESET specific action
  const handleCanonicalActionChange = (event) => {
    const canonicalAction = event.target.value
    setSelectedCanonicalAction(canonicalAction)
    setSelectedAction('')
  }

  // Execute query with date range
  const executeQuery = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('fromDate', fromDate)
      params.append('toDate', toDate)
      if (selectedModule) params.append('module', selectedModule)
      if (selectedCanonicalAction) params.append('canonicalAction', selectedCanonicalAction)
      if (selectedAction) params.append('action', selectedAction)

      const res = await axiosRequest.get(`/api/v1/audit-logs?${params.toString()}`)

      if (res?.success) {
        setResults(res.data.logs || [])
        toast.success(`Found ${res.data.total || 0} logs`)
      }
    } catch (err) {
      console.error('[AuditAnalytics] Query error:', err)
      toast.error(err?.response?.data?.message || 'Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  // Export results
  const handleExport = () => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = window.document.createElement('a')
    link.href = url
    link.download = `audit-logs-${fromDate}-to-${toDate}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Results exported successfully')
  }

  return (
    <Box sx={{ p: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant='h4' fontWeight={700}>
          Audit Log Analytics
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          View and analyze all system audit logs with canonical action grouping
        </Typography>
      </Box>

      {/* Dashboard Stats */}
      {stats && (
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CustomAvatar skin='light' color='primary'>
                    <Icon icon='tabler:database' />
                  </CustomAvatar>
                  <Box>
                    <Typography variant='h5' fontWeight={700}>
                      {stats.totalLogs?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Total Audit Logs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CustomAvatar skin='light' color='success'>
                    <Icon icon='tabler:modules' />
                  </CustomAvatar>
                  <Box>
                    <Typography variant='h5' fontWeight={700}>
                      {modules.length || 0}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Active Modules
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters Card */}
      <Card sx={{ mb: 6, border: '1px solid', borderColor: 'divider' }}>
        <CardHeader title='Filters' />
        <CardContent>
          <Grid container spacing={4}>
            {/* Module Filter */}
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth>
                <Typography variant='caption' color='text.secondary' sx={{ mb: 1 }}>
                  Module
                </Typography>
                <Select
                  value={selectedModule}
                  onChange={handleModuleChange}
                  displayEmpty
                  size='small'
                >
                  <MenuItem value=''>
                    <Typography color='text.secondary'>All Modules</Typography>
                  </MenuItem>
                  {modules.map(module => (
                    <MenuItem key={module} value={module}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon icon={MODULE_ICONS[module] || MODULE_ICONS.default} fontSize={16} />
                        {MODULE_CONFIG[module]?.label || module}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Canonical Action Filter */}
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth>
                <Typography variant='caption' color='text.secondary' sx={{ mb: 1 }}>
                  Action Category
                </Typography>
                <Select
                  value={selectedCanonicalAction}
                  onChange={handleCanonicalActionChange}
                  displayEmpty
                  size='small'
                  disabled={!selectedModule}
                >
                  <MenuItem value=''>
                    <Typography color='text.secondary'>
                      {selectedModule ? 'All Categories' : 'Select Module First'}
                    </Typography>
                  </MenuItem>
                  {getCanonicalActionGroups().map(([key, group]) => (
                    <MenuItem key={key} value={key}>
                      <Tooltip title={group.description} arrow>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Icon icon={group.icon} fontSize={16} />
                          <Typography variant='body2'>{group.label}</Typography>
                        </Box>
                      </Tooltip>
                    </MenuItem>
                  ))}
                </Select>
                {!selectedModule && (
                  <Typography variant='caption' color='text.disabled' sx={{ mt: 0.5 }}>
                    ⬆️ Select module to filter by category
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Specific Action Filter */}
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth>
                <Typography variant='caption' color='text.secondary' sx={{ mb: 1 }}>
                  Specific Action
                </Typography>
                <Select
                  value={selectedAction}
                  onChange={e => setSelectedAction(e.target.value)}
                  displayEmpty
                  size='small'
                  disabled={!selectedCanonicalAction}
                >
                  <MenuItem value=''>
                    <Typography color='text.secondary'>
                      {selectedCanonicalAction ? 'All Actions' : 'Select Category First'}
                    </Typography>
                  </MenuItem>
                  {getModuleActions().map(action => (
                    <MenuItem key={action} value={action}>
                      <Typography variant='body2'>{action}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* From Date */}
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth>
                <Typography variant='caption' color='text.secondary' sx={{ mb: 1 }}>
                  From Date
                </Typography>
                <TextField
                  type='date'
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  size='small'
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
            </Grid>

            {/* To Date */}
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth>
                <Typography variant='caption' color='text.secondary' sx={{ mb: 1 }}>
                  To Date
                </Typography>
                <TextField
                  type='date'
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  size='small'
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
            </Grid>

            {/* Search Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={() => {
                    setSelectedModule('')
                    setSelectedCanonicalAction('')
                    setSelectedAction('')
                    setFromDate(getDefaultFromDate())
                    setToDate(new Date().toISOString().split('T')[0])
                  }}
                >
                  Reset Filters
                </Button>
                <Button
                  variant='contained'
                  onClick={executeQuery}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color='inherit' /> : <Icon icon='tabler:search' />}
                >
                  {loading ? 'Searching...' : 'Search Logs'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Table */}
      {results.length > 0 && (
        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardHeader
            title={`Results (${results.length} logs)`}
            action={
              <Button
                variant='outlined'
                size='small'
                startIcon={<Icon icon='tabler:download' />}
                onClick={handleExport}
              >
                Export JSON
              </Button>
            }
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Admin Profile</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Action Category</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Scope</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((row, idx) => {
                  const userData = row.userId || row.actor || {}
                  const userName = userData?.name || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'System'
                  const userEmail = userData?.email || 'system@hrms.com'
                  const userRole = userData?.role || row.role || 'N/A'
                  const userAvatar = userData?.avatar

                  // Find canonical action group
                  const canonicalGroup = Object.entries(CANONICAL_ACTION_GROUPS).find(([_key, group]) => 
                    group.actions.includes(row.action)
                  )

                  return (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Tooltip title={format(new Date(row.createdAt), 'PPpp')}>
                          <Typography variant='body2' sx={{ whiteSpace: 'nowrap' }}>
                            {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CustomAvatar
                            src={userAvatar}
                            skin='light'
                            color='primary'
                            sx={{ width: 36, height: 36 }}
                          >
                            {getInitials(userName)}
                          </CustomAvatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant='body2' fontWeight={600} noWrap>
                              {userName}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' noWrap>
                              {userEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <CustomChip
                          icon={<Icon icon={MODULE_ICONS[row.module] || MODULE_ICONS.default} />}
                          label={MODULE_CONFIG[row.module]?.label || row.module}
                          size='small'
                          skin='light'
                          color={MODULE_COLORS[row.module] || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {canonicalGroup && (
                          <Tooltip title={canonicalGroup[1].description}>
                            <CustomChip
                              icon={<Icon icon={canonicalGroup[1].icon} />}
                              label={canonicalGroup[1].label}
                              size='small'
                              skin='light'
                              color='secondary'
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>{row.action}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {row.target?.name || row.target?.employeeId || '--'}
                        </Typography>
                        {row.target?.type && (
                          <Typography variant='caption' color='text.secondary'>
                            {row.target.type}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {row.orgId && (
                            <Typography variant='caption' color='text.secondary'>
                              Org: {row.orgId.name || row.orgId}
                            </Typography>
                          )}
                          {row.companyId && (
                            <Typography variant='caption' color='text.secondary'>
                              Company: {row.companyId.name || row.companyId}
                            </Typography>
                          )}
                          {row.unitId && (
                            <Typography variant='caption' color='text.secondary'>
                              Unit: {row.unitId.name || row.unitId}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <Card sx={{ p: 12, textAlign: 'center' }}>
          <Icon icon='tabler:database-off' fontSize={64} color='text.disabled' />
          <Typography variant='h6' sx={{ mt: 4 }}>
            No audit logs found
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Adjust filters and search again
          </Typography>
        </Card>
      )}
    </Box>
  )
}

AuditAnalytics.acl = {
  action: 'read',
  subject: 'audit-analytics'
}

export default AuditAnalytics
