// src/pages/audit-logs/index.js
// Enterprise Audit Logs Page - Admin Only Access
// STRICY ROLE CHECK: org_admin, company_admin, unit_admin, SUPER_ADMIN

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

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
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { DataGrid } from '@mui/x-data-grid'

import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
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
  const user = useSelector(selectUser)
  const roleSlug = useSelector(selectRoleSlug)

  // State
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 })

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
  }, [paginationModel, moduleFilter, actionFilter, fromDate, toDate, orgFilter, companyFilter, unitFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // ── Handle Filter Change ─────────────────────────────────────────────────
  const handleFilterChange = () => {
    setPaginationModel(prev => ({ ...prev, page: 0 }))
    fetchLogs()
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

  // ─── Columns for DataGrid ───────────────────────────────────────────────────
  const columns = [
    {
      flex: 0.22,
      minWidth: 200,
      field: 'action',
      headerName: 'Action',
      renderCell: ({ row }) => {
        const config = ACTION_CONFIG[row.action] || { label: row.action, color: 'default', icon: 'tabler:circle' }
        const actorData = row.actor?.userId
        const name = row.actor?.name || actorData?.name || 'System'
        const role = row.actor?.role || actorData?.role || ''
        const companyName = row.company_id?.name || row.actor?.companyName || ''
        const unitName = row.unit_id?.name || row.actor?.unitName || ''
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                fontSize: '0.8rem', 
                bgcolor: 'primary.main',
                border: '2px solid',
                borderColor: 'primary.light'
              }}
            >
              {getInitials(name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Icon icon={config.icon} fontSize={16} color={config.color} />
                <Typography variant='body2' fontWeight={600} noWrap sx={{ fontSize: '0.875rem' }}>
                  {config.label}
                </Typography>
              </Box>
              <Typography variant='caption' color='text.secondary' noWrap sx={{ display: 'block' }}>
                {name} • {role}
              </Typography>
              {(companyName || unitName) && (
                <Typography variant='caption' color='primary.main' noWrap sx={{ display: 'block', fontSize: '0.7rem' }}>
                  {companyName}{unitName ? ` → ${unitName}` : ''}
                </Typography>
              )}
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 180,
      field: 'target',
      headerName: 'Target',
      renderCell: ({ row }) => {
        const targetName = row.target?.name || row.target?.employeeId || 'Unknown'
        const targetType = row.target?.type || ''

        return (
          <Box>
            <Typography variant='body2' fontWeight={500} noWrap>{targetName}</Typography>
            <Typography variant='caption' color='text.secondary'>{targetType}</Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'scope',
      headerName: 'Scope',
      renderCell: ({ row }) => {
        const unit = row.unit_id?.name
        const company = row.company_id?.name
        const org = row.org_id?.name

        return (
          <Tooltip
            title={
              <Box sx={{ p: 1 }}>
                {org && <Typography variant='caption'>Org: {org}</Typography>}
                {company && <Typography variant='caption' display='block'>Company: {company}</Typography>}
                {unit && <Typography variant='caption' display='block'>Unit: {unit}</Typography>}
              </Box>
            }
          >
            <Box>
              {unit ? (
                <Chip size='small' label={`Unit: ${unit}`} color='primary' variant='outlined' />
              ) : company ? (
                <Chip size='small' label={`Company: ${company}`} color='secondary' variant='outlined' />
              ) : (
                <Chip size='small' label={`Org: ${org}`} color='default' variant='outlined' />
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
        if (!row.changes || Object.keys(row.changes).length === 0) return null

        const changeCount = Object.keys(row.changes).length
        return (
          <Tooltip
            title={
              <Box sx={{ p: 1 }}>
                {Object.entries(row.changes).map(([field, val]) => (
                  <Box key={field} sx={{ mb: 0.5 }}>
                    <Typography variant='caption' fontWeight={600}>{field}:</Typography>
                    <Typography variant='caption' display='block'>
                      {JSON.stringify(val.from)} → {JSON.stringify(val.to)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            }
          >
            <Button size='small' variant='text' color='info'>
              <Icon icon='tabler:eye' fontSize={16} /> {changeCount}
            </Button>
          </Tooltip>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: 80,
      field: 'ip',
      headerName: 'IP Address',
      renderCell: ({ row }) => (
        <Tooltip title={row.metadata?.userAgent || 'Unknown browser'}>
          <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>
            {row.metadata?.ip || '—'}
          </Typography>
        </Tooltip>
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
                <Icon icon='tabler:file-text' fontSize={24} />
                <Box>
                  <Typography variant='h5'>Audit Logs</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Comprehensive system activity tracker (Admin Only)
                  </Typography>
                </Box>
              </Box>
            }
            action={
              <Chip
                label={`${total} total records`}
                color='primary'
                sx={{ fontWeight: 600 }}
              />
            }
          />
          <CardContent>
            {/* Filters */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', mb: 4 }}>
              <Grid container spacing={3} alignItems='center'>
                <Grid item xs={12} sm={6} md={3}>
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
                <Grid item xs={12} sm={6} md={3}>
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
                <Grid item xs={12} sm={6} md={2}>
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
                <Grid item xs={12} sm={6} md={2}>
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
                    {companies
                      .filter((c) => !orgFilter || c.org_id?._id === orgFilter || c.org_id === orgFilter)
                      .map((company) => (
                        <MenuItem key={company._id} value={company._id}>
                          {company.name}
                        </MenuItem>
                      ))}
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
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
                    {units
                      .filter((u) => {
                        if (!companyFilter) return true
                        return u.company_id?._id === companyFilter || u.company_id === companyFilter
                      })
                      .map((unit) => (
                        <MenuItem key={unit._id} value={unit._id}>
                          {unit.name}
                        </MenuItem>
                      ))}
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <CustomTextField
                    type='date'
                    fullWidth
                    size='small'
                    label='From Date'
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <CustomTextField
                    type='date'
                    fullWidth
                    size='small'
                    label='To Date'
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant='contained'
                    color='primary'
                    onClick={handleFilterChange}
                    disabled={loading}
                  >
                    Search
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Data Grid */}
            <DataGrid
              autoHeight
              rows={logs}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading}
              rowCount={total}
              paginationMode='server'
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 20, 50, 100]}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': { py: 2 },
                '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' }
              }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AuditLogsPage
