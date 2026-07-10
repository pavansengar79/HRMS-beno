// src/pages/attendance/teamAttendance.js
//
// ─────────────────────────────────────────────────────────────────────────────
// Team Attendance Page — Manager/HR view of team attendance
// ─────────────────────────────────────────────────────────────────────────────
// Access: manager, hr_manager, company_admin
// Endpoints:
//   Manager:     GET /api/v1/attendance/team?month=YYYY-MM
//   HR Manager:  GET /api/v1/attendance?month=YYYY-MM
//   Regularize:  PATCH /api/v1/attendance/:id/regularize (HR only)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Tooltip,
  Alert,
  Skeleton,
  MenuItem,
  InputAdornment
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Icon } from '@iconify/react'
import { useTheme } from '@mui/material/styles'
import toast from 'react-hot-toast'

// Custom components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'

// Store & utils
import { selectUser, selectRoleSlug } from 'src/store/auth/authSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'
import AttendanceTabs from 'src/pages/attendance/AttendanceTabs'

// Dialog components
import { RegularizeDialog, EmployeeSummaryDialog } from 'src/views/attendance/AttendanceDialogs'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  PRESENT:   'success',
  ABSENT:    'error',
  LATE:      'warning',
  HALF_DAY:  'info',
  ON_LEAVE:  'primary',
  HOLIDAY:   'default',
  WEEKEND:   'default',
  WFH:       'secondary'
}

const STATUS_LABEL = {
  PRESENT:   'Present',
  ABSENT:    'Absent',
  LATE:      'Late',
  HALF_DAY:  'Half Day',
  ON_LEAVE:  'On Leave',
  HOLIDAY:   'Holiday',
  WEEKEND:   'Weekend',
  WFH:       'WFH'
}

const ROLES = {
  COMPANY_ADMIN: 'company_admin',
  HR_MANAGER:   'hr_manager',
  MANAGER:      'manager',
  UNIT_ADMIN:   'unit_admin'
}

const todayISO = () => new Date().toISOString().slice(0, 10)

const monthOf = (dateStr) => {
  if (!dateStr) {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }
  return dateStr.slice(0, 7)
}

// ─────────────────────────────────────────────────────────────────────────────
// Team Overview Widget
// ─────────────────────────────────────────────────────────────────────────────

const TeamOverviewWidget = ({ rows, loading }) => {
  const present = rows.filter(r => ['PRESENT', 'LATE', 'WFH'].includes(r.status)).length
  const absent = rows.filter(r => r.status === 'ABSENT').length
  const onLeave = rows.filter(r => r.status === 'ON_LEAVE').length
  const late = rows.filter(r => r.status === 'LATE').length

  if (loading) return <Skeleton variant='rounded' height={80} sx={{ mb: 4 }} />

  return (
    <Alert severity='info' icon={<Icon icon='tabler:users' />} sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <Typography variant='body2'>
          <strong>Team Overview:</strong>
        </Typography>
        <Chip label={`Present: ${present}`} size='small' color='success' variant='tonal' />
        <Chip label={`Late: ${late}`} size='small' color='warning' variant='tonal' />
        <Chip label={`On Leave: ${onLeave}`} size='small' color='primary' variant='tonal' />
        <Chip label={`Absent: ${absent}`} size='small' color='error' variant='tonal' />
      </Box>
    </Alert>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Team Attendance Columns
// ─────────────────────────────────────────────────────────────────────────────

const buildTeamColumns = (onRegularize, onEmployeeClick, showDateCol = true, isHR = false) => [
  {
    flex: 0.22, minWidth: 200, field: 'employeeName', headerName: 'Employee',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
        onClick={() => onEmployeeClick?.(row)}
      >
        <CustomAvatar skin='light' color='primary' sx={{ width: 34, height: 34, fontSize: '0.875rem' }}>
          {(row.employeeId?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </CustomAvatar>
        <Box>
          <Typography noWrap sx={{ fontWeight: 500, fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>
            {row.employeeId?.name || '—'}
          </Typography>
          {row.employeeId?.employeeId && (
            <Typography variant='caption' color='text.secondary'>{row.employeeId.employeeId}</Typography>
          )}
        </Box>
      </Box>
    ),
  },
  ...(showDateCol ? [{
    flex: 0.15, minWidth: 130, field: 'date', headerName: 'Date',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        {row.date
          ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—'}
      </Typography>
    ),
  }] : []),
  {
    flex: 0.13, minWidth: 110, field: 'checkIn', headerName: 'Punch In',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: row.checkIn ? 'success.main' : 'text.disabled', fontWeight: row.checkIn ? 600 : 400, fontSize: '0.875rem' }}>
        {row.checkIn
          ? new Date(row.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
          : '—'}
      </Typography>
    ),
  },
  {
    flex: 0.13, minWidth: 110, field: 'checkOut', headerName: 'Punch Out',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: row.checkOut ? 'info.main' : 'text.disabled', fontWeight: row.checkOut ? 600 : 400, fontSize: '0.875rem' }}>
        {row.checkOut
          ? new Date(row.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
          : '—'}
      </Typography>
    ),
  },
  {
    flex: 0.12, minWidth: 110, field: 'workingHours', headerName: 'Hours',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icon icon='tabler:clock' fontSize={15} style={{ color: '#9CA3AF' }} />
        <Typography noWrap sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          {row.workingHoursFormatted || row.workingHours || '—'}
        </Typography>
      </Box>
    ),
  },
  {
    flex: 0.12, minWidth: 110, field: 'status', headerName: 'Status',
    renderCell: ({ row }) => (
      <CustomChip rounded skin='light' size='small'
        label={STATUS_LABEL[row.status] || row.status || '—'}
        color={STATUS_COLOR[row.status] || 'default'}
        sx={{ textTransform: 'capitalize' }}
      />
    ),
  },
  {
    flex: 0.1, minWidth: 100, field: 'flags', headerName: 'Flags', sortable: false,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {row.isWFH && (
          <Tooltip title='Work From Home'>
            <Chip label='WFH' size='small' color='secondary' variant='tonal' sx={{ height: 22, fontSize: '0.65rem' }} />
          </Tooltip>
        )}
        {row.isLate && (
          <Tooltip title={`Late by ${row.lateMinutes || '—'}min`}>
            <Chip label='Late' size='small' color='warning' variant='tonal' sx={{ height: 22, fontSize: '0.65rem' }} />
          </Tooltip>
        )}
        {row.overtimeHours > 0 && (
          <Tooltip title={`OT: ${row.overtimeHours}h}`}>
            <Chip label='OT' size='small' color='success' variant='tonal' sx={{ height: 22, fontSize: '0.65rem' }} />
          </Tooltip>
        )}
      </Box>
    ),
  },
  ...(isHR ? [{
    flex: 0.08, minWidth: 80, field: 'actions', headerName: '', sortable: false,
    renderCell: ({ row }) => (
      <Tooltip title='Regularize'>
        <Button
          size='small'
          variant='text'
          color='secondary'
          onClick={() => onRegularize(row)}
          sx={{ p: 1, minWidth: 'auto' }}
        >
          <Icon icon='tabler:edit' fontSize={18} />
        </Button>
      </Tooltip>
    ),
  }] : []),
]

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function TeamAttendance() {
  const user = useSelector(selectUser)
  const roleSlug = useSelector(selectRoleSlug)
  const router = useRouter()

  // Role-based access
  const allowedRoles = [ROLES.MANAGER, ROLES.HR_MANAGER, ROLES.COMPANY_ADMIN, ROLES.UNIT_ADMIN]
  const isHR = roleSlug === ROLES.HR_MANAGER || roleSlug === ROLES.COMPANY_ADMIN || roleSlug === ROLES.UNIT_ADMIN

  // State
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSearch, setFilterSearch] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [rowCount, setRowCount] = useState(0)
  const [regularizeRecord, setRegularizeRecord] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employeeSummary, setEmployeeSummary] = useState(null)
  const [employeeSummaryLoading, setEmployeeSummaryLoading] = useState(false)

  // Department state (HR only)
  const [departments, setDepartments] = useState([])
  const [filterDept, setFilterDept] = useState('')
  const [deptsLoading, setDeptsLoading] = useState(false)
  
  // Date range state
  const [dateRangePreset, setDateRangePreset] = useState('thisMonth')
  const [customStartDate, setCustomStartDate] = useState(null)
  const [customEndDate, setCustomEndDate] = useState(null)

  // ── Access check ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!allowedRoles.includes(roleSlug)) {
      toast.error('Access denied. You do not have permission to view team attendance.')
      router.push('/attendance/my')
    }
  }, [roleSlug])

  // ── Fetch departments (HR only) ────────────────────────────────────────────
  const fetchDepartments = useCallback(async () => {
    if (!isHR) return
    try {
      setDeptsLoading(true)
      const res = await axiosRequest.get('/api/v1/departments')
      if (res?.success && Array.isArray(res.data)) {
        setDepartments(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err)
    } finally {
      setDeptsLoading(false)
    }
  }, [isHR])

  useEffect(() => { 
    fetchDepartments()
  }, [isHR])

  // ── Helper: Calculate date range based on preset ────────────────────────────
  const getDateRange = useCallback(() => {
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)
    
    switch (dateRangePreset) {
      case 'today': {
        return { startDate: todayStr, endDate: todayStr }
      }
      case 'yesterday': {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().slice(0, 10)
        return { startDate: yesterdayStr, endDate: yesterdayStr }
      }
      case 'thisMonth': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1)
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return {
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10)
        }
      }
      case 'custom': {
        if (!customStartDate || !customEndDate) return null
        const start = new Date(customStartDate)
        const end = new Date(customEndDate)
        return {
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10)
        }
      }
      default:
        return null
    }
  }, [dateRangePreset, customStartDate, customEndDate])

  // ── Fetch attendance list ─────────────────────────────────────────────────
  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Use date range instead of month
      const dateRange = getDateRange()
      if (dateRange) {
        params.set('startDate', dateRange.startDate)
        params.set('endDate', dateRange.endDate)
      } else {
        // Fallback to month if date range not available
        params.set('month', filterMonth)
      }
      
      if (filterSearch) params.set('search', filterSearch)
      if (filterDept && isHR) params.set('departmentId', filterDept)
      if (filterStatus) params.set('status', filterStatus)

      // Role-based endpoint selection
      const endpoint = isHR
        ? `/api/v1/attendance?${params.toString()}`
        : `/api/v1/attendance/team?${params.toString()}`

      const res = await axiosRequest.get(endpoint)

      if (res?.success) {
        const records = res.data?.records ?? res.data ?? []
        const normalized = Array.isArray(records)
          ? records.map((r, i) => ({ ...r, id: r._id || i }))
          : []

        setRows(normalized)
        setRowCount(res.data?.pagination?.total ?? normalized.length)
      }
    } catch (err) {
      toast.error('Failed to load team attendance')
    } finally {
      setLoading(false)
    }
  }, [filterMonth, filterSearch, filterDept, filterStatus, isHR, getDateRange])

  // Fetch on mount and when filters change
  useEffect(() => { 
    fetchAttendance()
  }, [dateRangePreset, customStartDate, customEndDate, filterSearch, filterDept, filterStatus, isHR])

  // ── Fetch employee summary ────────────────────────────────────────────────
  const fetchEmployeeSummary = useCallback(async (row) => {
    const employeeId = row.employeeId?._id || row.employeeId?.id
    if (!employeeId) {
      console.error('No employee ID found', row)
      return
    }
    
    setEmployeeSummaryLoading(true)
    setEmployeeSummary(null) // Reset before fetching
    
    try {
      // Use appropriate endpoint based on role
      const dateRange = getDateRange()
      let endpoint
      
      if (dateRange) {
        endpoint = isHR 
          ? `/api/v1/attendance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&employeeId=${employeeId}&limit=100`
          : `/api/v1/attendance/team?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&employeeId=${employeeId}&limit=100`
      } else {
        // Fallback to month if date range not available
        endpoint = isHR 
          ? `/api/v1/attendance?month=${filterMonth}&employeeId=${employeeId}&limit=100`
          : `/api/v1/attendance/team?month=${filterMonth}&employeeId=${employeeId}&limit=100`
      }
      
      console.log('Fetching employee summary:', { endpoint, employeeId, dateRange })
      
      const res = await axiosRequest.get(endpoint)
      
      console.log('API Response:', res)
      
      // Backend returns: { success, data: [...records] }
      const records = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      
      console.log('Records found:', records.length, records)
      
      if (records && records.length > 0) {
        // Calculate working days from date range
        const dateRange = getDateRange()
        const today = new Date()
        
        let startDate, endDate
        
        if (dateRange) {
          startDate = new Date(dateRange.startDate)
          endDate = new Date(dateRange.endDate)
        } else {
          // Fallback to month
          const [year, month] = filterMonth.split('-').map(Number)
          startDate = new Date(year, month - 1, 1)
          const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
          endDate = filterMonth === currentMonth
            ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
            : new Date(year, month, 0, 23, 59, 59)
        }
        
        // Count working days (exclude weekends - Sat=6, Sun=0)
        let workingDays = 0
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay()
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {  // Not Sunday(0) or Saturday(6)
            workingDays++
          }
        }
        
        // Count each status from records
        const present = records.filter(r => r.status === 'PRESENT').length
        const late = records.filter(r => r.status === 'LATE').length
        const halfDay = records.filter(r => r.status === 'HALF_DAY').length
        const onLeave = records.filter(r => r.status === 'ON_LEAVE').length
        const holiday = records.filter(r => r.status === 'HOLIDAY').length
        const weekend = records.filter(r => r.status === 'WEEKEND').length
        const wfh = records.filter(r => r.status === 'WFH' || r.isWFH).length
        
        // Calculate absent: working days - days accounted for
        const daysAccounted = present + late + halfDay + onLeave + holiday + wfh
        const absent = Math.max(0, workingDays - daysAccounted)
        
        // Calculate summary from records
        const summary = {
          present,
          absent,
          late,
          halfDay,
          onLeave,
          holiday,
          weekend,
          wfh,
          totalWorkingHours: records.reduce((sum, r) => {
            if (r.workingHours) {
              const hours = parseFloat(r.workingHours) || 0
              return sum + hours
            }
            return sum
          }, 0).toFixed(1),
          totalOvertimeHours: records.reduce((sum, r) => {
            const ot = parseFloat(r.overtimeHours) || 0
            return sum + ot
          }, 0).toFixed(1),
          totalLateMinutes: records.reduce((sum, r) => {
            const late = parseInt(r.lateMinutes) || 0
            return sum + late
          }, 0),
        }
        
        console.log('Calculated summary:', summary, 'Working days:', workingDays, 'Days accounted:', daysAccounted)
        setEmployeeSummary(summary)
      } else {
        console.log('No records found for employee')
        // Calculate working days for empty state
        const dateRange = getDateRange()
        const today = new Date()
        
        let startDate, endDate
        
        if (dateRange) {
          startDate = new Date(dateRange.startDate)
          endDate = new Date(dateRange.endDate)
        } else {
          // Fallback to month
          const [year, month] = filterMonth.split('-').map(Number)
          startDate = new Date(year, month - 1, 1)
          const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
          endDate = filterMonth === currentMonth
            ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
            : new Date(year, month, 0, 23, 59, 59)
        }
        
        let workingDays = 0
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay()
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            workingDays++
          }
        }
        
        // Set default summary - all absent if no records
        setEmployeeSummary({
          present: 0,
          absent: workingDays,  // All working days are absent
          late: 0,
          halfDay: 0,
          onLeave: 0,
          holiday: 0,
          weekend: 0,
          wfh: 0,
          totalWorkingHours: '0.0',
          totalOvertimeHours: '0.0',
          totalLateMinutes: 0,
        })
      }
    } catch (err) {
      console.error('Failed to load employee summary:', err)
      toast.error('Failed to load employee summary')
      setEmployeeSummary(null)
    } finally {
      setEmployeeSummaryLoading(false)
    }
  }, [filterMonth, isHR, getDateRange])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEmployeeClick = (row) => {
    setSelectedEmployee({
      id: row.employeeId?._id || row.employeeId?.id,
      name: row.employeeId?.name || '—',
      employeeId: row.employeeId?.employeeId || '—',
      departmentId: row.employeeId?.departmentId,
    })
    fetchEmployeeSummary(row)
  }

  const handleRegularizeSuccess = (updated) => {
    setRows(prev => prev.map(r => r._id === updated._id ? { ...updated, id: updated._id } : r))
    toast.success('Attendance regularized successfully')
  }

  const columns = buildTeamColumns(
    row => setRegularizeRecord(row),
    handleEmployeeClick,
    true,
    isHR
  )

  if (!allowedRoles.includes(roleSlug)) {
    return null
  }

  return (
    <AttendanceTabs activeTab='team-attendance'>
      <Grid container spacing={5}>
        {/* ── Team Overview Widget ─────────────────────────────────────── */}
        <Grid item xs={12}>
          <TeamOverviewWidget rows={rows} loading={loading} />
        </Grid>

      {/* ── Main Table Card ─────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={isHR ? 'All Employee Attendance' : 'Team Attendance'}
            subheader={
              isHR
                ? 'All employees attendance across the organization · Click edit to regularize'
                : 'Your team members attendance records'
            }
          />
          <CardContent>
            {/* ── Filters ───────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap', mb: 4 }}>
              {/* Date Range Preset */}
              <CustomTextField
                select
                size='small'
                label='Date Range'
                value={dateRangePreset}
                onChange={e => setDateRangePreset(e.target.value)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value='today'>Today</MenuItem>
                <MenuItem value='yesterday'>Yesterday</MenuItem>
                <MenuItem value='thisMonth'>This Month</MenuItem>
                <MenuItem value='custom'>Custom Range</MenuItem>
              </CustomTextField>
              
              {/* Custom Date Range Inputs */}
              {dateRangePreset === 'custom' && (
                <>
                  <CustomTextField
                    type='date'
                    size='small'
                    label='Start Date'
                    value={customStartDate ? new Date(customStartDate).toISOString().slice(0, 10) : ''}
                    onChange={e => setCustomStartDate(new Date(e.target.value))}
                    sx={{ minWidth: 160 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <CustomTextField
                    type='date'
                    size='small'
                    label='End Date'
                    value={customEndDate ? new Date(customEndDate).toISOString().slice(0, 10) : ''}
                    onChange={e => setCustomEndDate(new Date(e.target.value))}
                    sx={{ minWidth: 160 }}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: customStartDate ? new Date(customStartDate).toISOString().slice(0, 10) : undefined }}
                  />
                </>
              )}

              {isHR && (
                <CustomTextField
                  select
                  size='small'
                  label='Department'
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}
                  sx={{ minWidth: 160 }}
                  disabled={deptsLoading}
                  InputProps={deptsLoading ? {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <CircularProgress size={14} sx={{ mr: 1 }} />
                      </InputAdornment>
                    ),
                  } : undefined}
                >
                  <MenuItem value=''>All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept._id} value={dept.id}>
                      {dept.label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}

              {isHR && (
                <CustomTextField
                  size='small'
                  label='Search Employee'
                  value={filterSearch}
                  onChange={e => setFilterSearch(e.target.value)}
                  placeholder='Name or ID'
                  sx={{ minWidth: 200 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Icon icon='tabler:search' fontSize={18} />
                      </InputAdornment>
                    )
                  }}
                />
              )}

              <CustomTextField
                select
                size='small'
                label='Status'
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value=''>All Statuses</MenuItem>
                {Object.entries(STATUS_LABEL).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </CustomTextField>

              <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
                {rowCount} record{rowCount !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* ── DataGrid ────────────────────────────────────────────── */}
            <DataGrid
              autoHeight
              rowHeight={62}
              rows={rows}
              columns={columns}
              loading={loading}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              paginationMode='server'
              rowCount={rowCount}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: t => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  borderRadius: 0,
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: t => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                },
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* ── Regularize Dialog (HR only) ─────────────────────────────── */}
      {isHR && (
        <RegularizeDialog
          open={Boolean(regularizeRecord)}
          onClose={() => setRegularizeRecord(null)}
          record={regularizeRecord}
          onSuccess={handleRegularizeSuccess}
        />
      )}

      {/* ── Employee Summary Dialog ─────────────────────────────────── */}
      <EmployeeSummaryDialog
        open={Boolean(selectedEmployee)}
        onClose={() => {
          setSelectedEmployee(null)
          setEmployeeSummary(null)
        }}
        employee={selectedEmployee}
        month={filterMonth}
        summaryData={employeeSummary}
        loading={employeeSummaryLoading}
      />
    </Grid>
    </AttendanceTabs>
  )
}
