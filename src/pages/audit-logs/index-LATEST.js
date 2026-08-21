// src/pages/audit-logs/index.js
// Enterprise Audit Logs Page - Production Level UI
// STRICT ROLE CHECK: org_admin, company_admin, unit_admin, SUPER_ADMIN

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

// MUI Components
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { DataGrid } from '@mui/x-data-grid'
import { useTheme } from '@mui/material/styles'

// Custom Components
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/utils/employeeAvatar'
import { selectUser, selectRoleSlug } from 'src/store/auth/authSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── ADMIN ROLES ────────────────────────────────────────────────────────────
const ADMIN_ROLES = ['SUPER_ADMIN', 'org_admin', 'company_admin', 'unit_admin']

// ─── Action Colors & Labels ──────────────────────────────────────────────────
const ACTION_CONFIG = {
  // Auth
  LOGIN: { label: 'Login', color: 'info', icon: 'tabler:login' },
  LOGOUT: { label: 'Logout', color: 'default', icon: 'tabler:logout' },
  PASSWORD_CHANGED: { label: 'Password Changed', color: 'warning', icon: 'tabler:key' },
  LOGIN_FAILED: { label: 'Login Failed', color: 'error', icon: 'tabler:alert-circle' },
  LOGIN_ACTIVATED: { label: 'Login Activated', color: 'success', icon: 'tabler:user-check' },

  // Employee
  EMPLOYEE_CREATED: { label: 'Employee Created', color: 'success', icon: 'tabler:user-plus' },
  EMPLOYEE_UPDATED: { label: 'Employee Updated', color: 'primary', icon: 'tabler:user-edit' },
  EMPLOYEE_DELETED: { label: 'Employee Deleted', color: 'error', icon: 'tabler:user-minus' },
  SALARY_UPDATED: { label: 'Salary Updated', color: 'warning', icon: 'tabler:currency-dollar' },
  STATUS_CHANGED: { label: 'Status Changed', color: 'info', icon: 'tabler:toggle-left' },
  REPORTING_MANAGER_CHANGED: { label: 'Manager Changed', color: 'info', icon: 'tabler-users' },

  // Leave
  LEAVE_APPLIED: { label: 'Leave Applied', color: 'info', icon: 'tabler:calendar-plus' },
  LEAVE_APPROVED_L1: { label: 'Leave Approved L1', color: 'success', icon: 'tabler:check' },
  LEAVE_APPROVED_L2: { label: 'Leave Approved L2', color: 'success', icon: 'tabler:check' },
  LEAVE_REJECTED: { label: 'Leave Rejected', color: 'error', icon: 'tabler:x' },
  LEAVE_CANCELLED: { label: 'Leave Cancelled', color: 'warning', icon: 'tabler:calendar-x' },

  // Attendance
  PUNCH_IN: { label: 'Punch In', color: 'success', icon: 'tabler:login-2' },
  PUNCH_OUT: { label: 'Punch Out', color: 'info', icon: 'tabler:logout-2' },
  REGULARIZATION_APPLIED: { label: 'Regularization Applied', color: 'info', icon: 'tabler:edit' },
  REGULARIZATION_APPROVED_L1: { label: 'Regularization Approved', color: 'success', icon: 'tabler:check' },

  // Payroll
  PAYROLL_RUN: { label: 'Payroll Run', color: 'primary', icon: 'tabler:calculator' },
  PAYSLIP_PUBLISHED: { label: 'Payslip Published', color: 'success', icon: 'tabler:file-check' },
  PAYSLIP_DELETED: { label: 'Payslip Deleted', color: 'error', icon: 'tabler:file-x' },

  // Shift/Roster
  SHIFT_CREATED: { label: 'Shift Created', color: 'success', icon: 'tabler:clock-plus' },
  SHIFT_UPDATED: { label: 'Shift Updated', color: 'primary', icon: 'tabler:clock-edit' },
  SHIFT_DELETED: { label: 'Shift Deleted', color: 'error', icon: 'tabler:clock-x' },
  ROSTER_ASSIGNED: { label: 'Roster Assigned', color: 'success', icon: 'tabler:calendar-check' },
  ROSTER_REVOKED: { label: 'Roster Revoked', color: 'warning', icon: 'tabler:calendar-cancel' },

  // Role/Permission
  ROLE_CREATED: { label: 'Role Created', color: 'success', icon: 'tabler:shield-plus' },
  ROLE_UPDATED: { label: 'Role Updated', color: 'primary', icon: 'tabler:shield-edit' },
  ROLE_DELETED: { label: 'Role Deleted', color: 'error', icon: 'tabler:shield-x' },
  DELEGATION_CREATED: { label: 'Delegation Created', color: 'success', icon: 'tabler:arrow-forward-right' },
  DELEGATION_REVOKED: { label: 'Delegation Revoked', color: 'warning', icon: 'tabler:arrow-back' },

  // Policy
  ATTENDANCE_POLICY_CREATED: { label: 'Attendance Policy Created', color: 'success', icon: 'tabler:file-plus' },
  ATTENDANCE_POLICY_UPDATED: { label: 'Attendance Policy Updated', color: 'primary', icon: 'tabler:file-edit' },
  ATTENDANCE_POLICY_ACTIVATED: { label: 'Attendance Policy Activated', color: 'success', icon: 'tabler:toggle-right' },
  ATTENDANCE_POLICY_DEACTIVATED: { label: 'Attendance Policy Deactivated', color: 'warning', icon: 'tabler:toggle-left' },
  LEAVE_POLICY_CREATED: { label: 'Leave Policy Created', color: 'success', icon: 'tabler:file-plus' },
  LEAVE_POLICY_UPDATED: { label: 'Leave Policy Updated', color: 'primary', icon: 'tabler:file-edit' },
  PAYROLL_POLICY_CREATED: { label: 'Payroll Policy Created', color: 'success', icon: 'tabler:file-plus' },
  PAYROLL_POLICY_UPDATED: { label: 'Payroll Policy Updated', color: 'primary', icon: 'tabler:file-edit' },

  // Super Admin
  PLAN_OVERRIDE: { label: 'Plan Overridden', color: 'warning', icon: 'tabler:adjustments' },
  TENANT_SUSPEND: { label: 'Tenant Suspended', color: 'error', icon: 'tabler:ban' },
  TENANT_ACTIVATE: { label: 'Tenant Activated', color: 'success', icon: 'tabler:circle-check' },
  TENANT_STATUS_CHANGE: { label: 'Tenant Status Changed', color: 'info', icon: 'tabler:refresh' },
  CUSTOMER_APPROVED: { label: 'Customer Approved', color: 'success', icon: 'tabler:user-check' }
}

const MODULE_CONFIG = {
  auth: { label: 'Authentication', color: 'secondary' },
  employee: { label: 'Employee', color: 'primary' },
  leave: { label: 'Leave', color: 'info' },
  attendance: { label: 'Attendance', color: 'success' },
  payroll: { label: 'Payroll', color: 'warning' },
  shift: { label: 'Shift', color: 'secondary' },
  roster: { label: 'Roster', color: 'info' },
  role: { label: 'Role', color: 'error' },
  delegation: { label: 'Delegation', color: 'warning' },
  policy: { label: 'Policy', color: 'primary' },
  superAdmin: { label: 'Super Admin', color: 'error' }
}

// ─── Date Formatter ─────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// ─── Main Component ─────────────────────────────────────────────────────────
const AuditLogsPage = () => {
  const router = useRouter()
  const theme = useTheme()
  const user = useSelector(selectUser)
  const roleSlug = useSelector(selectRoleSlug)

  // State
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 })
  const [searchQuery, setSearchQuery] = useState('')

  // Filters
  const [moduleFilter, setModuleFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [orgFilter, setOrgFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [unitFilter, setUnitFilter] = useState('')
  
  // Dropdown data from backend
  const [organizations, setOrganizations] = useState([])
  const [companies, setCompanies] = useState([])
  const [units, setUnits] = useState([])

  // Detail View Modal
  const [selectedLog, setSelectedLog] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  // ── Access Control ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!ADMIN_ROLES.includes(roleSlug)) {
      toast.error('Access denied. Only administrators can view audit logs.')
      router.push('/dashboards/analytics')
    }
  }, [roleSlug, router])

  // ── Fetch Logs ───────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', paginationModel.page + 1)
      params.append('limit', paginationModel.pageSize)
      if (moduleFilter) params.append('module', moduleFilter)
      if (actionFilter) params.append('action', actionFilter)
      if (fromDate) params.append('from', fromDate)
      if (toDate) params.append('to', toDate)
      if (orgFilter) params.append('org_id', orgFilter)
      if (companyFilter) params.append('company_id', companyFilter)
      if (unitFilter) params.append('unit_id', unitFilter)
      if (searchQuery) params.append('search', searchQuery)

      const res = await axiosRequest.get(`/api/v1/audit-logs?${params.toString()}`)
      if (res?.success) {
        setLogs(res.data.logs || [])
        setTotal(res.data.total || 0)
        
        // Set dropdown filters from backend response
        if (res.data.dropdownFilters) {
          if (res.data.dropdownFilters.organizations) {
            setOrganizations(res.data.dropdownFilters.organizations)
          }
          if (res.data.dropdownFilters.companies) {
            setCompanies(res.data.dropdownFilters.companies)
          }
          if (res.data.dropdownFilters.units) {
            setUnits(res.data.dropdownFilters.units)
          }
          
          // Auto-select if only one option
          if (res.data.dropdownFilters.organizations?.length === 1 && !orgFilter) {
            setOrgFilter(res.data.dropdownFilters.organizations[0]._id)
          }
          if (res.data.dropdownFilters.companies?.length === 1 && !companyFilter) {
            setCompanyFilter(res.data.dropdownFilters.companies[0]._id)
          }
        }
      }
    } catch (err) {
      console.error('[AuditLogs] Fetch error:', err)
      toast.error(err?.response?.data?.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [paginationModel, moduleFilter, actionFilter, fromDate, toDate, orgFilter, companyFilter, unitFilter, searchQuery])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // ── Handle Filter Change ─────────────────────────────────────────────────
  const handleFilterChange = () => {
    setPaginationModel(prev => ({ ...prev, page: 0 }))
    fetchLogs()
  }

  // ── Clear Filters ────────────────────────────────────────────────────────
  const handleClearFilters = () => {
    setModuleFilter('')
    setActionFilter('')
    setFromDate('')
    setToDate('')
    setOrgFilter('')
    setCompanyFilter('')
    setUnitFilter('')
    setSearchQuery('')
    setPaginationModel({ page: 0, pageSize: 20 })
  }

  // ── Export to CSV ────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (moduleFilter) params.append('module', moduleFilter)
      if (actionFilter) params.append('action', actionFilter)
      if (fromDate) params.append('from', fromDate)
      if (toDate) params.append('to', toDate)
      
      const res = await axiosRequest.get(`/api/v1/audit-logs/export?${params.toString()}`)
      if (res?.success) {
        // Create CSV download
        const csvContent = "data:text/csv;charset=utf-8," + res.data.csv
        const link = document.createElement("a")
        link.setAttribute("href", encodeURI(csvContent))
        link.setAttribute("download", `audit-logs-${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Audit logs exported successfully')
      }
    } catch (err) {
      toast.error('Failed to export audit logs')
    }
  }

  // ─── Get Unique Actions for Filter Dropdown (FILTERED BY MODULE) ─────────
  const getAvailableActions = () => {
    // If module is selected, filter actions by that module
    if (moduleFilter) {
      const moduleActions = {
        auth: ['LOGIN', 'LOGOUT', 'PASSWORD_CHANGED', 'LOGIN_FAILED', 'LOGIN_ACTIVATED'],
        employee: ['EMPLOYEE_CREATED', 'EMPLOYEE_UPDATED', 'EMPLOYEE_DELETED', 'SALARY_UPDATED', 'STATUS_CHANGED', 'REPORTING_MANAGER_CHANGED'],
        leave: ['LEAVE_APPLIED', 'LEAVE_APPROVED_L1', 'LEAVE_APPROVED_L2', 'LEAVE_REJECTED', 'LEAVE_CANCELLED'],
        attendance: ['PUNCH_IN', 'PUNCH_OUT', 'REGULARIZATION_APPLIED', 'REGULARIZATION_APPROVED_L1'],
        payroll: ['PAYROLL_RUN', 'PAYSLIP_PUBLISHED', 'PAYSLIP_DELETED'],
        shift: ['SHIFT_CREATED', 'SHIFT_UPDATED', 'SHIFT_DELETED'],
        roster: ['ROSTER_ASSIGNED', 'ROSTER_REVOKED'],
        role: ['ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED'],
        delegation: ['DELEGATION_CREATED', 'DELEGATION_REVOKED'],
        policy: ['ATTENDANCE_POLICY_CREATED', 'ATTENDANCE_POLICY_UPDATED', 'ATTENDANCE_POLICY_ACTIVATED', 'ATTENDANCE_POLICY_DEACTIVATED', 'LEAVE_POLICY_CREATED', 'LEAVE_POLICY_UPDATED', 'PAYROLL_POLICY_CREATED', 'PAYROLL_POLICY_UPDATED'],
        superAdmin: ['PLAN_OVERRIDE', 'TENANT_SUSPEND', 'TENANT_ACTIVATE', 'TENANT_STATUS_CHANGE', 'CUSTOMER_APPROVED']
      }
      return (moduleActions[moduleFilter] || []).sort()
    }
    // If no module selected, return all actions
    return Object.keys(ACTION_CONFIG).sort()
  }

  // ─── View Details ────────────────────────────────────────────────────────
  const handleViewDetails = (row) => {
    setSelectedLog(row)
    setDetailModalOpen(true)
  }

  // ─── Columns for DataGrid ───────────────────────────────────────────────────
  const columns = [
    {
      flex: 0.15,
      minWidth: 180,
      field: 'timestamp',
      headerName: 'Date & Time',
      renderCell: ({ row }) => (
        <Box>
          <Typography variant='body2' fontWeight={500}>
            {formatDate(row.createdAt)}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {row.metadata?.ip || '—'}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.18,
      minWidth: 200,
      field: 'action',
      headerName: 'Action',
      renderCell: ({ row }) => {
        const config = ACTION_CONFIG[row.action] || { label: row.action, color: 'default', icon: 'tabler:circle' }
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CustomAvatar 
              skin='light' 
              color={config.color}
              sx={{ width: 36, height: 36 }}
            >
              <Icon icon={config.icon} fontSize='1rem' />
            </CustomAvatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant='body2' fontWeight={600} noWrap>
                {config.label}
              </Typography>
              <Typography variant='caption' color='text.secondary' noWrap>
                {row.module}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 220,
      field: 'performedBy',
      headerName: 'Performed By',
      renderCell: ({ row }) => {
        const name = row.actor?.name || 'System'
        const role = row.actor?.role || '—'
        const email = row.actor?.email || ''
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CustomAvatar 
              src={row.actor?.profilePic}
              skin='light'
              color='primary'
              sx={{ width: 34, height: 34, fontSize: '0.875rem' }}
            >
              {getInitials(name)}
            </CustomAvatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>
                {name}
              </Typography>
              <Typography variant='caption' color='text.disabled' noWrap>
                {role}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.18,
      minWidth: 200,
      field: 'target',
      headerName: 'Target',
      renderCell: ({ row }) => {
        const targetName = row.target?.name || row.target?.employeeId || '—'
        const targetType = row.target?.type || ''

        return (
          <Box>
            <Typography variant='body2' fontWeight={500} noWrap>
              {targetName}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {targetType}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.12,
      minWidth: 130,
      field: 'organization',
      headerName: 'Organization',
      renderCell: ({ row }) => {
        const orgName = row.org_id?.name
        const companyName = row.company_id?.name
        const unitName = row.unit_id?.name

        return (
          <Tooltip
            title={
              <Box sx={{ p: 1 }}>
                {orgName && <Typography variant='caption'>Org: {orgName}</Typography>}
                {companyName && <Typography variant='caption' display='block'>Company: {companyName}</Typography>}
                {unitName && <Typography variant='caption' display='block'>Unit: {unitName}</Typography>}
              </Box>
            }
          >
            <Box>
              {unitName ? (
                <Chip size='small' label={unitName} color='primary' variant='outlined' />
              ) : companyName ? (
                <Chip size='small' label={companyName} color='secondary' variant='outlined' />
              ) : orgName ? (
                <Chip size='small' label={orgName} color='default' variant='outlined' />
              ) : (
                <Typography variant='caption' color='text.disabled'>—</Typography>
              )}
            </Box>
          </Tooltip>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'changes',
      headerName: 'Changes',
      renderCell: ({ row }) => {
        if (!row.changes || Object.keys(row.changes).length === 0) return (
          <Typography variant='caption' color='text.disabled'>—</Typography>
        )

        const changeCount = Object.keys(row.changes).length
        
        return (
          <Tooltip
            title={
              <Box sx={{ p: 1, maxWidth: 300 }}>
                {Object.entries(row.changes).map(([field, val]) => (
                  <Box key={field} sx={{ mb: 0.5 }}>
                    <Typography variant='caption' fontWeight={600} color='primary.main'>{field}:</Typography>
                    <Typography variant='caption' display='block' sx={{ fontSize: '0.7rem' }}>
                      {JSON.stringify(val.from)} → {JSON.stringify(val.to)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            }
          >
            <Chip 
              size='small' 
              label={`${changeCount} changes`}
              color='info'
              variant='outlined'
            />
          </Tooltip>
        )
      }
    },
    {
      flex: 0.07,
      minWidth: 80,
      field: 'details',
      headerName: 'Actions',
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title='View Details'>
            <IconButton size='small' onClick={() => handleViewDetails(row)}>
              <Icon icon='tabler:eye' fontSize='1rem' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CustomAvatar skin='light' color='primary' sx={{ width: 44, height: 44 }}>
                  <Icon icon='tabler:file-text' fontSize='1.5rem' />
                </CustomAvatar>
                <Box>
                  <Typography variant='h5' fontWeight={600}>
                    Audit Logs
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Comprehensive system activity tracker (Admin Only)
                  </Typography>
                </Box>
              </Box>
            }
            action={
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip
                  label={`${total} total records`}
                  color='primary'
                  sx={{ fontWeight: 600 }}
                />
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<Icon icon='tabler:download' />}
                  onClick={handleExport}
                >
                  Export CSV
                </Button>
              </Box>
            }
          />
          
          <Divider />
          
          <CardContent>
            {/* Filter Section */}
            <Paper elevation={0} sx={{ p: 4, bgcolor: 'background.default', mb: 4, borderRadius: 2 }}>
              <Grid container spacing={3} alignItems='center'>
                {/* Search */}
                <Grid item xs={12} sm={6} md={3}>
                  <CustomTextField
                    fullWidth
                    size='small'
                    label='Search'
                    placeholder='Search by action, user...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleFilterChange()}
                    InputProps={{
                      startAdornment: <Icon icon='tabler:search' fontSize='1rem' />
                    }}
                  />
                </Grid>

                {/* Module Filter */}
                <Grid item xs={12} sm={6} md={2}>
                  <CustomTextField
                    select
                    fullWidth
                    size='small'
                    label='Module'
                    value={moduleFilter}
                    onChange={(e) => {
                      setModuleFilter(e.target.value)
                      setActionFilter('') // Reset action when module changes
                    }}
                  >
                    <MenuItem value=''>
                      <em>All Modules</em>
                    </MenuItem>
                    {Object.entries(MODULE_CONFIG).map(([key, val]) => (
                      <MenuItem key={key} value={key}>
                        {val.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>

                {/* Action Filter (Filtered by Module) */}
                <Grid item xs={12} sm={6} md={2}>
                  <CustomTextField
                    select
                    fullWidth
                    size='small'
                    label='Action'
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                  >
                    <MenuItem value=''>
                      <em>All Actions</em>
                    </MenuItem>
                    {getAvailableActions().map((action) => (
                      <MenuItem key={action} value={action}>
                        {ACTION_CONFIG[action]?.label || action}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>

                {/* From Date */}
                <Grid item xs={12} sm={6} md={2}>
                  <CustomTextField
                    fullWidth
                    size='small'
                    type='date'
                    label='From Date'
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* To Date */}
                <Grid item xs={12} sm={6} md={2}>
                  <CustomTextField
                    fullWidth
                    size='small'
                    type='date'
                    label='To Date'
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12} sm={6} md={1}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size='small'
                      variant='contained'
                      onClick={handleFilterChange}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      <Icon icon='tabler:filter' fontSize='1rem' />
                    </Button>
                    <Button
                      size='small'
                      variant='outlined'
                      color='secondary'
                      onClick={handleClearFilters}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      <Icon icon='tabler:x' fontSize='1rem' />
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {/* Organization Filters Row */}
              <Grid container spacing={3} alignItems='center' sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <CustomTextField
                    select
                    fullWidth
                    size='small'
                    label='Organization'
                    value={orgFilter}
                    onChange={(e) => {
                      setOrgFilter(e.target.value)
                      setCompanyFilter('')
                      setUnitFilter('')
                    }}
                    disabled={organizations.length === 0}
                  >
                    <MenuItem value=''>
                      <em>All Organizations</em>
                    </MenuItem>
                    {organizations.map((org) => (
                      <MenuItem key={org._id} value={org._id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <CustomTextField
                    select
                    fullWidth
                    size='small'
                    label='Company'
                    value={companyFilter}
                    onChange={(e) => {
                      setCompanyFilter(e.target.value)
                      setUnitFilter('')
                    }}
                    disabled={companies.length === 0}
                  >
                    <MenuItem value=''>
                      <em>All Companies</em>
                    </MenuItem>
                    {companies.map((company) => (
                      <MenuItem key={company._id} value={company._id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <CustomTextField
                    select
                    fullWidth
                    size='small'
                    label='Unit'
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                    disabled={units.length === 0}
                  >
                    <MenuItem value=''>
                      <em>All Units</em>
                    </MenuItem>
                    {units.map((unit) => (
                      <MenuItem key={unit._id} value={unit._id}>
                        {unit.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>
              </Grid>
            </Paper>

            {/* DataGrid */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
              </Box>
            ) : (
              <DataGrid
                autoHeight
                rows={logs}
                columns={columns}
                pageSizeOptions={[20, 50, 100]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                rowCount={total}
                paginationMode='server'
                disableRowSelectionOnClick
                sx={{
                  '& .MuiDataGrid-cell': { borderColor: theme.palette.divider },
                  '& .MuiDataGrid-columnHeaders': { borderColor: theme.palette.divider },
                  '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' }
                }}
              />
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Detail View Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon icon='tabler:file-text' fontSize='1.5rem' />
            <Typography variant='h6'>Audit Log Details</Typography>
          </Box>
          <IconButton onClick={() => setDetailModalOpen(false)}>
            <Icon icon='tabler:x' />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                {/* Action Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Action
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <CustomAvatar 
                      skin='light' 
                      color={ACTION_CONFIG[selectedLog.action]?.color || 'default'}
                      sx={{ width: 40, height: 40 }}
                    >
                      <Icon icon={ACTION_CONFIG[selectedLog.action]?.icon || 'tabler:circle'} />
                    </CustomAvatar>
                    <Box>
                      <Typography variant='body1' fontWeight={600}>
                        {ACTION_CONFIG[selectedLog.action]?.label || selectedLog.action}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Module: {selectedLog.module}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Timestamp */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Date & Time
                  </Typography>
                  <Typography variant='body1' fontWeight={500}>
                    {formatDate(selectedLog.createdAt)}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    IP: {selectedLog.metadata?.ip || '—'}
                  </Typography>
                </Grid>

                {/* Performed By */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Performed By
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <CustomAvatar 
                      src={selectedLog.actor?.profilePic}
                      skin='light'
                      color='primary'
                      sx={{ width: 40, height: 40 }}
                    >
                      {getInitials(selectedLog.actor?.name || 'System')}
                    </CustomAvatar>
                    <Box>
                      <Typography variant='body1' fontWeight={500}>
                        {selectedLog.actor?.name || 'System'}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {selectedLog.actor?.role || '—'}
                      </Typography>
                      <Typography variant='caption' display='block' color='text.disabled'>
                        {selectedLog.actor?.email || '—'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Target */}
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Target
                  </Typography>
                  <Typography variant='body1' fontWeight={500}>
                    {selectedLog.target?.name || selectedLog.target?.employeeId || '—'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Type: {selectedLog.target?.type || '—'}
                  </Typography>
                </Grid>

                {/* Organization Scope */}
                <Grid item xs={12}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Organization Scope
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedLog.org_id?.name && (
                      <Chip size='small' label={`Org: ${selectedLog.org_id.name}`} color='default' />
                    )}
                    {selectedLog.company_id?.name && (
                      <Chip size='small' label={`Company: ${selectedLog.company_id.name}`} color='secondary' />
                    )}
                    {selectedLog.unit_id?.name && (
                      <Chip size='small' label={`Unit: ${selectedLog.unit_id.name}`} color='primary' />
                    )}
                  </Box>
                </Grid>

                {/* Changes */}
                {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                      Changes Made
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      {Object.entries(selectedLog.changes).map(([field, val]) => (
                        <Box key={field} sx={{ mb: 1 }}>
                          <Typography variant='caption' fontWeight={600} color='primary.main'>
                            {field}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip 
                              size='small' 
                              label={JSON.stringify(val.from)} 
                              color='error'
                              variant='outlined'
                              sx={{ fontSize: '0.7rem' }}
                            />
                            <Icon icon='tabler:arrow-right' fontSize='1rem' color='disabled' />
                            <Chip 
                              size='small' 
                              label={JSON.stringify(val.to)} 
                              color='success'
                              variant='outlined'
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                )}

                {/* Metadata */}
                <Grid item xs={12}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Additional Details
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant='caption' color='text.secondary'>User Agent</Typography>
                        <Typography variant='caption' display='block'>
                          {selectedLog.metadata?.userAgent || '—'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant='caption' color='text.secondary'>Login Method</Typography>
                        <Typography variant='caption' display='block'>
                          {selectedLog.metadata?.loginMethod || '—'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default AuditLogsPage
