// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Redux
import { useSelector } from 'react-redux'
import { selectRoleSlug } from 'src/store/auth/authSlice'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { DataGrid } from '@mui/x-data-grid'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Components
import AttendanceDrawer from './attendanceDrawer'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'

// ** API
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Role Constants ───────────────────────────────────────────────────────────
// Roles from HRMS API Guide:
//   tenant_admin  → full access, can activate/deactivate/archive policies
//   hr_manager    → can create/update employees, manage attendance, run payroll
//   employee      → read-only on own data, can punch in/out

const ROLES = {
  TENANT_ADMIN: 'tenant_admin',
  HR_MANAGER:   'hr_manager',
  EMPLOYEE:     'employee',
}

// ─── Status Constants ─────────────────────────────────────────────────────────
const STATUS_COLOR = {
  PRESENT:  'success',
  ABSENT:   'error',
  LATE:     'warning',
  HALF_DAY: 'info',
  HOLIDAY:  'secondary',
  WEEKEND:  'default',
  LEAVE:    'primary',
  WFH:      'info',
}

const STATUS_LABEL = {
  PRESENT:  'Present',
  ABSENT:   'Absent',
  LATE:     'Late',
  HALF_DAY: 'Half Day',
  HOLIDAY:  'Holiday',
  WEEKEND:  'Weekend',
  LEAVE:    'On Leave',
  WFH:      'WFH',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayISO = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const monthOf = (dateStr) => dateStr?.slice(0, 7) ?? ''

// ─── Regularize Dialog — HR / Admin only ─────────────────────────────────────
// Access: PATCH /api/v1/attendance/:id/regularize  🔒 hr_manager
const RegularizeDialog = ({ open, onClose, record, onSuccess }) => {
  const [saving, setSaving] = useState(false)
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      status:   record?.status || 'PRESENT',
      checkIn:  record?.checkIn  ? new Date(record.checkIn).toISOString().slice(0, 16)  : '',
      checkOut: record?.checkOut ? new Date(record.checkOut).toISOString().slice(0, 16) : '',
      remarks:  '',
    },
  })

  useEffect(() => {
    if (open && record) {
      reset({
        status:   record.status || 'PRESENT',
        checkIn:  record.checkIn  ? new Date(record.checkIn).toISOString().slice(0, 16)  : '',
        checkOut: record.checkOut ? new Date(record.checkOut).toISOString().slice(0, 16) : '',
        remarks:  '',
      })
    }
  }, [open, record])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const payload = {
        status:   data.status,
        checkIn:  data.checkIn  ? new Date(data.checkIn).toISOString()  : null,
        checkOut: data.checkOut ? new Date(data.checkOut).toISOString() : null,
        remarks:  data.remarks,
      }
      // PATCH /api/v1/attendance/:id/regularize  🔒 hr_manager
      // Edge: checkOut before checkIn → 400
      // Edge: missing remarks validated server-side
      const res = await axiosRequest.patch(`/api/v1/attendance/${record._id}/regularize`, payload)
      if (res?.success) {
        toast.success('Attendance regularized successfully')
        onSuccess(res.data)
        onClose()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to regularize')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant='h6'>Regularize Attendance</Typography>
          {record && (
            <Typography variant='caption' color='text.secondary'>
              {record.employeeId?.name || record.employeeName} ·{' '}
              {record.date
                ? new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—'}
            </Typography>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={4} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Controller name='status' control={control}
              render={({ field }) => (
                <CustomTextField {...field} select fullWidth label='Status'>
                  {Object.entries(STATUS_LABEL).map(([val, label]) => (
                    <MenuItem key={val} value={val}>{label}</MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name='checkIn' control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth type='datetime-local' label='Check In'
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name='checkOut' control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth type='datetime-local' label='Check Out'
                  InputLabelProps={{ shrink: true }}
                  helperText='Must be after check-in'
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name='remarks' control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth multiline rows={2} label='Remarks *'
                  placeholder='e.g. Employee forgot to punch in'
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant='contained' onClick={handleSubmit(onSubmit)} disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:edit' />}
        >
          {saving ? 'Saving…' : 'Regularize'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Monthly Summary Cards ────────────────────────────────────────────────────
// Data from: GET /api/v1/attendance/me/summary?month=YYYY-MM  🔒 employee+
// Response shape: { summary: { present, absent, late, halfDay, onLeave, totalWorkingHours } }
const MonthlySummaryCards = ({ summary, loading }) => {
  const items = [
    { key: 'present',           label: 'Present',     icon: 'tabler:circle-check',      color: 'success'   },
    { key: 'absent',            label: 'Absent',      icon: 'tabler:circle-x',          color: 'error'     },
    { key: 'late',              label: 'Late',        icon: 'tabler:clock-exclamation', color: 'warning'   },
    { key: 'halfDay',           label: 'Half Day',    icon: 'tabler:clock-half',        color: 'info'      },
    { key: 'onLeave',           label: 'On Leave',    icon: 'tabler:calendar-off',      color: 'primary'   },
    { key: 'totalWorkingHours', label: 'Working Hrs', icon: 'tabler:clock',             color: 'secondary' },
  ]

  return (
    <Grid container spacing={4} sx={{ mb: 4 }}>
      {items.map(item => (
        <Grid key={item.key} item xs={6} sm={4} md={2}>
          <Box sx={{
            p: 3, borderRadius: 2, textAlign: 'center',
            border: t => `1px solid ${t.palette.divider}`,
            bgcolor: t => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
            transition: 'all 0.15s',
            '&:hover': { boxShadow: 2 },
          }}>
            {loading ? (
              <>
                <Skeleton variant='circular' width={32} height={32} sx={{ mx: 'auto', mb: 1 }} />
                <Skeleton variant='text' width='60%' sx={{ mx: 'auto' }} />
              </>
            ) : (
              <>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '50%', mx: 'auto', mb: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: `${item.color}.main`, opacity: 0.9,
                }}>
                  <Icon icon={item.icon} color='white' fontSize='1.1rem' />
                </Box>
                <Typography variant='h6' fontWeight={700}>
                  {summary?.[item.key] ?? '—'}
                </Typography>
                <Typography variant='caption' color='text.secondary'>{item.label}</Typography>
              </>
            )}
          </Box>
        </Grid>
      ))}
    </Grid>
  )
}

// ─── Employee Summary Dialog ──────────────────────────────────────────────────
// Shows attendance summary for a specific employee for the selected month
const EmployeeSummaryDialog = ({ open, onClose, employee, month, summaryData, loading }) => {
  const items = [
    { key: 'present',            label: 'Present',           icon: 'tabler:circle-check',      color: 'success'   },
    { key: 'absent',             label: 'Absent',            icon: 'tabler:circle-x',          color: 'error'     },
    { key: 'late',               label: 'Late',              icon: 'tabler:clock-exclamation', color: 'warning'   },
    { key: 'halfDay',            label: 'Half Day',          icon: 'tabler:clock-half',        color: 'info'      },
    { key: 'onLeave',            label: 'On Leave',          icon: 'tabler:calendar-off',      color: 'primary'   },
    { key: 'holiday',            label: 'Holiday',           icon: 'tabler:calendar-holiday',  color: 'default'   },
    { key: 'weekend',            label: 'Weekend',           icon: 'tabler:calendar-week',     color: 'default'   },
    { key: 'wfh',                label: 'Work From Home',    icon: 'tabler:home-check',        color: 'info'      },
    { key: 'totalWorkingHours',  label: 'Working Hours',    icon: 'tabler:clock',             color: 'secondary' },
    { key: 'totalOvertimeHours', label: 'Overtime Hours',   icon: 'tabler:timeline-event-ex', color: 'warning'   },
    { key: 'totalLateMinutes',   label: 'Late Minutes',     icon: 'tabler:alert-circle',      color: 'error'     },
  ]

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant='h6'>Attendance Summary</Typography>
          {employee && month && (
            <Typography variant='caption' color='text.secondary'>
              {employee.name} ({employee.employeeId}) · {month}
            </Typography>
          )}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {items.map(item => (
            <Grid key={item.key} item xs={6} sm={4}>
              <Box sx={{
                p: 2.5, borderRadius: 1.5, textAlign: 'center',
                border: t => `1px solid ${t.palette.divider}`,
                bgcolor: t => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                transition: 'all 0.15s',
              }}>
                {loading ? (
                  <>
                    <Skeleton variant='circular' width={28} height={28} sx={{ mx: 'auto', mb: 1 }} />
                    <Skeleton variant='text' width='70%' sx={{ mx: 'auto' }} />
                  </>
                ) : (
                  <>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '50%', mx: 'auto', mb: 0.75,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: `${item.color}.main`, opacity: 0.85,
                    }}>
                      <Icon icon={item.icon} color='white' fontSize='1rem' />
                    </Box>
                    <Typography variant='subtitle2' fontWeight={700}>
                      {summaryData?.[item.key] ?? '—'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>{item.label}</Typography>
                  </>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant='tonal' color='secondary' onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Filter Mode Toggle ───────────────────────────────────────────────────────
const FilterModeToggle = ({ mode, onChange }) => (
  <ToggleButtonGroup
    value={mode}
    exclusive
    onChange={(_, val) => { if (val) onChange(val) }}
    size='small'
    sx={{ height: 40 }}
  >
    <ToggleButton value='month' sx={{ px: 2.5, gap: 1, textTransform: 'none', fontSize: '0.8125rem' }}>
      <Icon icon='tabler:calendar-month' fontSize='1rem' />
      Monthly
    </ToggleButton>
    <ToggleButton value='day' sx={{ px: 2.5, gap: 1, textTransform: 'none', fontSize: '0.8125rem' }}>
      <Icon icon='tabler:calendar-day' fontSize='1rem' />
      Day
    </ToggleButton>
  </ToggleButtonGroup>
)

// ─── Column Builders ──────────────────────────────────────────────────────────
// Admin/HR columns include regularize action
// Employee columns are read-only

const buildAdminColumns = (onRegularize, onEmployeeClick, showDateCol = true) => [
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
          <Tooltip title={`OT: ${row.overtimeHours}h`}>
            <Chip label='OT' size='small' color='success' variant='tonal' sx={{ height: 22, fontSize: '0.65rem' }} />
          </Tooltip>
        )}
      </Box>
    ),
  },
  {
    flex: 0.09, minWidth: 80, field: 'actions', headerName: 'Actions', sortable: false,
    renderCell: ({ row }) => (
      <Tooltip title='Regularize'>
        <IconButton size='small' onClick={() => onRegularize(row)}>
          <Icon icon='tabler:edit' fontSize='1.1rem' />
        </IconButton>
      </Tooltip>
    ),
  },
]

const buildEmployeeColumns = (showDateCol = true) => [
  ...(showDateCol ? [{
    flex: 0.18, minWidth: 140, field: 'date', headerName: 'Date',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
        {row.date
          ? new Date(row.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })
          : '—'}
      </Typography>
    ),
  }] : []),
  {
    flex: 0.16, minWidth: 120, field: 'checkIn', headerName: 'Punch In',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: row.checkIn ? 'success.main' : 'text.disabled', fontWeight: row.checkIn ? 600 : 400 }}>
        {row.checkIn
          ? new Date(row.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
          : '—'}
      </Typography>
    ),
  },
  {
    flex: 0.16, minWidth: 120, field: 'checkOut', headerName: 'Punch Out',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: row.checkOut ? 'info.main' : 'text.disabled', fontWeight: row.checkOut ? 600 : 400 }}>
        {row.checkOut
          ? new Date(row.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
          : '—'}
      </Typography>
    ),
  },
  {
    flex: 0.15, minWidth: 120, field: 'workingHours', headerName: 'Working Hrs',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icon icon='tabler:clock' fontSize={15} style={{ color: '#9CA3AF' }} />
        <Typography noWrap sx={{ color: 'text.secondary' }}>
          {row.workingHoursFormatted || row.workingHours || '—'}
        </Typography>
      </Box>
    ),
  },
  {
    flex: 0.13, minWidth: 110, field: 'status', headerName: 'Status',
    renderCell: ({ row }) => (
      <CustomChip rounded skin='light' size='small'
        label={STATUS_LABEL[row.status] || row.status || '—'}
        color={STATUS_COLOR[row.status] || 'default'}
      />
    ),
  },
  {
    flex: 0.15, minWidth: 130, field: 'flags', headerName: '', sortable: false,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {row.isWFH && <Chip label='WFH' size='small' color='secondary' variant='tonal' sx={{ height: 22, fontSize: '0.65rem' }} />}
        {row.isLate && <Chip label='Late' size='small' color='warning' variant='tonal' sx={{ height: 22, fontSize: '0.65rem' }} />}
        {row.overtimeHours > 0 && <Chip label='OT' size='small' color='success' variant='tonal' sx={{ height: 22, fontSize: '0.65rem' }} />}
      </Box>
    ),
  },
]

// ─── Day Detail Banner ────────────────────────────────────────────────────────
const DayDetailBanner = ({ date, records, loading }) => {
  if (loading) return <Skeleton variant='rounded' height={72} sx={{ mx: 5, mb: 2 }} />
  if (!records.length) return (
    <Box sx={{ px: 5, pb: 2 }}>
      <Alert severity='info' icon={<Icon icon='tabler:calendar-search' />}>
        No attendance records found for{' '}
        <strong>{new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
      </Alert>
    </Box>
  )

  return (
    <Box sx={{ px: 5, pb: 2 }}>
      <Alert severity='success' icon={<Icon icon='tabler:calendar-check' />}>
        Showing <strong>{records.length}</strong> record{records.length !== 1 ? 's' : ''} for{' '}
        <strong>{new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
      </Alert>
    </Box>
  )
}

// ─── Main Attendance Component ────────────────────────────────────────────────
const Attendance = () => {
  const roleSlug = useSelector(selectRoleSlug)

  // ── Role-based access flags ───────────────────────────────────────────────
  // Based on HRMS API Guide role matrix:
  //   tenant_admin — can activate/deactivate policies; has full HR read access
  //   hr_manager   — manages employees, attendance regularization, payroll
  //   employee     — own data only: punch-in/out, own history, own summary
  const isAdminOrHR = roleSlug === ROLES.TENANT_ADMIN || roleSlug === ROLES.HR_MANAGER
  const isEmployee  = roleSlug === ROLES.EMPLOYEE

  // ── Filter mode: 'month' | 'day' ─────────────────────────────────────────
  const [filterMode, setFilterMode] = useState('month')

  // Month filter (YYYY-MM)
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // Day filter (YYYY-MM-DD)
  const [filterDay, setFilterDay] = useState(todayISO)

  const [rows, setRows]                         = useState([])
  const [summary, setSummary]                   = useState(null)
  const [summaryLoading, setSummaryLoading]     = useState(false)
  const [loading, setLoading]                   = useState(false)
  const [filterSearch, setFilterSearch]         = useState('')
  const [filterStatus, setFilterStatus]         = useState('')
  const [paginationModel, setPaginationModel]   = useState({ page: 0, pageSize: 25 })
  const [rowCount, setRowCount]                 = useState(0)
  const [drawerOpen, setDrawerOpen]             = useState(false)
  const [regularizeRecord, setRegularizeRecord] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employeeSummary, setEmployeeSummary]   = useState(null)
  const [employeeSummaryLoading, setEmployeeSummaryLoading] = useState(false)

  // ── Department state — HR/Admin only ─────────────────────────────────────
  // GET /api/v1/departments  🔒 employee+  (all roles can read)
  // Used to populate dept filter dropdown for HR/Admin view
  const [departments, setDepartments]           = useState([])
  const [filterDept, setFilterDept]             = useState('')
  const [deptsLoading, setDeptsLoading]         = useState(false)

  // ── Fetch departments (HR/Admin filter only) ──────────────────────────────
  const fetchDepartments = useCallback(async () => {
    if (!isAdminOrHR) return // employees don't need this filter
    try {
      setDeptsLoading(true)
      // GET /api/v1/departments — available to employee+ per API guide
      const res = await axiosRequest.get('/api/v1/departments')
      if (res?.success && Array.isArray(res.data)) {
        // Deduplicate by name (defensive — backend should already be unique per tenant)
        const seen   = new Set()
        const unique = res.data.filter(d => {
          if (seen.has(d.name)) return false
          seen.add(d.name)
          return true
        })
        setDepartments(unique)
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err)
      // Non-critical: filter just won't show dept options
    } finally {
      setDeptsLoading(false)
    }
  }, [isAdminOrHR])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  // ── Compute active month from current filter ──────────────────────────────
  const activeMonth = filterMode === 'day' ? monthOf(filterDay) : filterMonth

  // ── Fetch attendance list ─────────────────────────────────────────────────
  // HR/Admin:  GET /api/v1/attendance?month=&date=&search=&departmentId=&status=  🔒 hr_manager
  // Employee:  GET /api/v1/attendance/me?month=&date=&status=                     🔒 employee
  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      if (filterMode === 'month') {
        params.set('month', filterMonth)
      } else {
        // Day mode — backend supports `date` param per API guide
        params.set('date', filterDay)
        params.set('month', monthOf(filterDay)) // also send month for scoping
      }

      if (filterSearch)              params.set('search', filterSearch)
      if (filterDept && isAdminOrHR) params.set('departmentId', filterDept) // dept filter — HR/Admin only
      if (filterStatus)              params.set('status', filterStatus)

      // Role-based endpoint selection:
      //   hr_manager / tenant_admin → GET /api/v1/attendance        (all employees)
      //   employee                  → GET /api/v1/attendance/me     (own records only)
      const endpoint = isAdminOrHR
        ? `/api/v1/attendance?${params.toString()}`
        : `/api/v1/attendance/me?${params.toString()}`

      const res = await axiosRequest.get(endpoint)

      if (res?.success) {
        const records = res.data?.records ?? res.data?.attendance ?? res.data ?? []
        let normalized = Array.isArray(records)
          ? records.map((r, i) => ({ ...r, id: r._id || i }))
          : []

        // Client-side day filter as safety net (if backend returns full month)
        if (filterMode === 'day' && filterDay) {
          normalized = normalized.filter(r => {
            if (!r.date) return false
            const recDate = new Date(r.date).toISOString().slice(0, 10)
            return recDate === filterDay
          })
        }

        setRows(normalized)
        setRowCount(res.data?.pagination?.total ?? normalized.length)
      }
    } catch (err) {
      toast.error('Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }, [filterMode, filterMonth, filterDay, filterSearch, filterDept, filterStatus, isAdminOrHR])

  // ── Fetch monthly summary ─────────────────────────────────────────────────
  // GET /api/v1/attendance/me/summary?month=YYYY-MM  🔒 employee+
  // Response: { employee, month, daysInMonth, summary: { present, absent, late, halfDay, onLeave, totalWorkingHours } }
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true)
    try {
      const res = await axiosRequest.get(
        `/api/v1/attendance/me/summary?month=${activeMonth}`
      )
      if (res?.success) setSummary(res.data?.summary ?? res.data)
    } catch {
      // Non-critical — summary cards just show —
    } finally {
      setSummaryLoading(false)
    }
  }, [activeMonth])

  useEffect(() => { fetchAttendance() }, [fetchAttendance])
  useEffect(() => { fetchSummary()    }, [fetchSummary])

  // ── Fetch employee summary ────────────────────────────────────────────────
  // GET /api/v1/attendance/me/summary?month=YYYY-MM  🔒 employee+
  // For HR/Admin: GET /api/v1/attendance/employee/:id/summary?month=YYYY-MM
  const fetchEmployeeSummary = useCallback(async (employee) => {
    if (!employee?.employeeId?.id || !activeMonth) return
    setEmployeeSummaryLoading(true)
    try {
      const endpoint = isAdminOrHR
        ? `/api/v1/attendance/employee/${employee.employeeId.id}/summary?month=${activeMonth}`
        : `/api/v1/attendance/me/summary?month=${activeMonth}`
      
      const res = await axiosRequest.get(endpoint)
      if (res?.success) {
        setEmployeeSummary(res.data?.summary ?? res.data)
      }
    } catch (err) {
      toast.error('Failed to load employee summary')
    } finally {
      setEmployeeSummaryLoading(false)
    }
  }, [activeMonth, isAdminOrHR])

  const handleEmployeeClick = (row) => {
    setSelectedEmployee({
      id: row.employeeId?.id,
      name: row.employeeId?.name || '—',
      employeeId: row.employeeId?.employeeId || '—',
    })
    fetchEmployeeSummary(row)
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRegularizeSuccess = (updated) => {
    setRows(prev => prev.map(r => r._id === updated._id ? { ...updated, id: updated._id } : r))
  }

  const handlePunchSuccess = () => {
    fetchAttendance()
    fetchSummary()
  }

  const handleFilterModeChange = (mode) => {
    setFilterMode(mode)
    setPaginationModel(m => ({ ...m, page: 0 }))
    setFilterSearch('')
    setFilterStatus('')
  }

  // In day mode, hide the date column — redundant
  const showDateCol = filterMode === 'month'

  // Build columns based on role:
  //   HR/Admin → includes Regularize action button (PATCH /attendance/:id/regularize)
  //   Employee → read-only, no action column
  const columns = isAdminOrHR
    ? buildAdminColumns(row => setRegularizeRecord(row), handleEmployeeClick, showDateCol)
    : buildEmployeeColumns(showDateCol)

  // Today's record for employee banner
  const todayRow = rows.find(r => {
    if (!r.date) return false
    return new Date(r.date).toDateString() === new Date().toDateString()
  })

  const selectedDayLabel = filterDay
    ? new Date(filterDay + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const isToday = filterDay === todayISO()

  return (
    <Grid container spacing={5}>

      {/* ── Summary Cards (all roles — own data) ──────────────── */}
      <Grid item xs={12}>
        <MonthlySummaryCards summary={summary} loading={summaryLoading} />
      </Grid>

      {/* ── Main Table Card ───────────────────────────────────── */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Attendance Records'
            subheader={
              filterMode === 'day'
                ? `${isAdminOrHR ? 'All employees' : 'Your attendance'} · ${selectedDayLabel}`
                : isAdminOrHR
                  ? 'All employee attendance · regularize by clicking the edit icon'
                  : 'Your attendance history'
            }
            action={
              // Mark Attendance button — available to all roles
              // Opens AttendanceDrawer which calls:
              //   POST /api/v1/attendance/me/punch-in  🔒 employee
              //   POST /api/v1/attendance/me/punch-out 🔒 employee
              <Button
                variant='contained'
                startIcon={<Icon icon='tabler:clock' />}
                onClick={() => setDrawerOpen(true)}
              >
                Mark Attendance
              </Button>
            }
          />
          <Divider sx={{ m: '0 !important' }} />

          {/* ── Filters ───────────────────────────────────────── */}
          <Box sx={{ px: 5, py: 3, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>

            {/* Mode toggle */}
            <FilterModeToggle mode={filterMode} onChange={handleFilterModeChange} />

            {/* Month picker */}
            {filterMode === 'month' && (
              <CustomTextField
                type='month' label='Month' value={filterMonth} size='small'
                onChange={e => {
                  setFilterMonth(e.target.value)
                  setPaginationModel(m => ({ ...m, page: 0 }))
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160 }}
              />
            )}

            {/* Day picker */}
            {filterMode === 'day' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CustomTextField
                  type='date' label='Select Date' value={filterDay} size='small'
                  onChange={e => {
                    setFilterDay(e.target.value)
                    setPaginationModel(m => ({ ...m, page: 0 }))
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: todayISO() }}
                  sx={{ minWidth: 170 }}
                />
                <Tooltip title='Previous day'>
                  <IconButton size='small' onClick={() => {
                    const d = new Date(filterDay + 'T00:00:00')
                    d.setDate(d.getDate() - 1)
                    setFilterDay(d.toISOString().slice(0, 10))
                  }}>
                    <Icon icon='tabler:chevron-left' fontSize='1rem' />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Today'>
                  <span>
                    <Button
                      size='small' variant={isToday ? 'contained' : 'tonal'}
                      color={isToday ? 'primary' : 'secondary'}
                      onClick={() => setFilterDay(todayISO())}
                      sx={{ minWidth: 60, height: 32, fontSize: '0.75rem' }}
                    >
                      Today
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title='Next day'>
                  <span>
                    <IconButton
                      size='small'
                      disabled={filterDay >= todayISO()}
                      onClick={() => {
                        const d = new Date(filterDay + 'T00:00:00')
                        d.setDate(d.getDate() + 1)
                        const next = d.toISOString().slice(0, 10)
                        if (next <= todayISO()) setFilterDay(next)
                      }}
                    >
                      <Icon icon='tabler:chevron-right' fontSize='1rem' />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            )}

            {/* Search — HR/Admin only */}
            {isAdminOrHR && (
              <CustomTextField
                size='small' placeholder='Search employee…' value={filterSearch}
                onChange={e => {
                  setFilterSearch(e.target.value)
                  setPaginationModel(m => ({ ...m, page: 0 }))
                }}
                sx={{ minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='tabler:search' fontSize='1rem' />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {/* Department filter — HR/Admin only */}
            {/* GET /api/v1/departments — populates this dropdown */}
            {/* Passes departmentId to GET /api/v1/attendance?departmentId= */}
            {isAdminOrHR && (
              <CustomTextField
                select
                size='small'
                label='Department'
                value={filterDept}
                onChange={e => {
                  setFilterDept(e.target.value)
                  setPaginationModel(m => ({ ...m, page: 0 }))
                }}
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

            {/* Status filter — all roles */}
            <CustomTextField
              select size='small' label='Status' value={filterStatus}
              onChange={e => {
                setFilterStatus(e.target.value)
                setPaginationModel(m => ({ ...m, page: 0 }))
              }}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value=''>All Statuses</MenuItem>
              {Object.entries(STATUS_LABEL).map(([val, label]) => (
                <MenuItem key={val} value={val}>{label}</MenuItem>
              ))}
            </CustomTextField>

            <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
              {rowCount} record{rowCount !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* ── Day mode info banner (HR/Admin) ───────────────── */}
          {filterMode === 'day' && isAdminOrHR && (
            <DayDetailBanner date={filterDay} records={rows} loading={loading} />
          )}

          {/* ── Today's punch status banner (employee) ────────── */}
          {isEmployee && filterMode === 'day' && filterDay === todayISO() && (
            <Box sx={{ px: 5, pb: 2 }}>
              {todayRow ? (
                <Alert
                  severity={
                    todayRow.status === 'PRESENT' || todayRow.status === 'WFH'
                      ? 'success'
                      : todayRow.status === 'ABSENT'
                        ? 'error'
                        : 'warning'
                  }
                  icon={<Icon icon={todayRow.checkIn ? 'tabler:clock-check' : 'tabler:clock-x'} />}
                  action={
                    !todayRow.checkOut && todayRow.checkIn && (
                      <Button size='small' color='inherit' onClick={() => setDrawerOpen(true)}>
                        Punch Out
                      </Button>
                    )
                  }
                >
                  Today:{' '}
                  {todayRow.checkIn
                    ? `Punched in at ${new Date(todayRow.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                    : 'Not punched in yet'}
                  {todayRow.checkOut && ` · Out at ${new Date(todayRow.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
                  {(todayRow.workingHoursFormatted || todayRow.workingHours) && ` · ${todayRow.workingHoursFormatted || todayRow.workingHours}`}
                </Alert>
              ) : (
                <Alert
                  severity='info'
                  icon={<Icon icon='tabler:clock' />}
                  action={
                    <Button size='small' color='inherit' onClick={() => setDrawerOpen(true)}>
                      Punch In
                    </Button>
                  }
                >
                  You haven't marked attendance today. Click Punch In to get started.
                </Alert>
              )}
            </Box>
          )}

          {/* ── DataGrid ──────────────────────────────────────── */}
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
        </Card>
      </Grid>

      {/* ── Attendance Drawer — all roles ─────────────────────── */}
      {/* Employee:     POST /api/v1/attendance/me/punch-in  🔒 employee  */}
      {/* Employee:     POST /api/v1/attendance/me/punch-out 🔒 employee  */}
      {/* Today status: GET  /api/v1/attendance/me/today     🔒 employee  */}
      <AttendanceDrawer
        open={drawerOpen}
        toggle={() => setDrawerOpen(prev => !prev)}
        roleSlug={roleSlug}
        onSuccess={handlePunchSuccess}
      />

      {/* ── Regularize Dialog — HR/Admin only ─────────────────── */}
      {/* PATCH /api/v1/attendance/:id/regularize  🔒 hr_manager  */}
      {/* Edge cases handled server-side:                          */}
      {/*   checkOut before checkIn → 400                         */}
      {/*   missing remarks → validation error                    */}
      {isAdminOrHR && (
        <RegularizeDialog
          open={Boolean(regularizeRecord)}
          onClose={() => setRegularizeRecord(null)}
          record={regularizeRecord}
          onSuccess={handleRegularizeSuccess}
        />
      )}

      {/* ── Employee Summary Dialog — HR/Admin only ───────────── */}
      {/* Shows attendance summary for selected employee          */}
      {isAdminOrHR && (
        <EmployeeSummaryDialog
          open={Boolean(selectedEmployee)}
          onClose={() => {
            setSelectedEmployee(null)
            setEmployeeSummary(null)
          }}
          employee={selectedEmployee}
          month={activeMonth}
          summaryData={employeeSummary}
          loading={employeeSummaryLoading}
        />
      )}
    </Grid>
  )
}

export default Attendance