// src/pages/attendance/myAttendance.js
//
// ─────────────────────────────────────────────────────────────────────────────
// My Attendance Page — Employee self-service attendance view
// ─────────────────────────────────────────────────────────────────────────────
// Access: All authenticated users (employee, manager, hr_manager, etc.)
// Endpoints:
//   GET  /api/v1/attendance/me?month=YYYY-MM
//   GET  /api/v1/attendance/me/summary?month=YYYY-MM
//   GET  /api/v1/attendance/me/today
//   POST /api/v1/attendance/me/punch-in
//   POST /api/v1/attendance/me/punch-out
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
  MenuItem
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
import { selectUser } from 'src/store/auth/authSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'
import AttendanceDrawer from 'src/pages/attendance/attendanceDrawer'
import AttendanceTabs from 'src/pages/attendance/AttendanceTabs'

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

const todayISO = () => new Date().toISOString().slice(0, 10)

const monthOf = (dateStr) => {
  if (!dateStr) {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }
  return dateStr.slice(0, 7)
}

// ─────────────────────────────────────────────────────────────────────────────
// Monthly Summary Cards
// ─────────────────────────────────────────────────────────────────────────────

const MonthlySummaryCards = ({ summary, loading }) => {
  const items = [
    { key: 'present',           label: 'Present',     icon: 'tabler:circle-check',      color: 'success'   },
    { key: 'absent',            label: 'Absent',      icon: 'tabler:circle-x',          color: 'error'     },
    { key: 'late',              label: 'Late',        icon: 'tabler:clock-exclamation', color: 'warning'   },
    { key: 'halfDay',           label: 'Half Day',    icon: 'tabler:clock-half',        color: 'info'      },
    { key: 'onLeave',           label: 'On Leave',    icon: 'tabler:calendar-off',      color: 'primary'   },
    { key: 'totalWorkingHours',  label: 'Working Hrs', icon: 'tabler:clock',             color: 'secondary' },
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

// ─────────────────────────────────────────────────────────────────────────────
// My Attendance Columns
// ─────────────────────────────────────────────────────────────────────────────

const buildMyAttendanceColumns = () => [
  {
    flex: 0.2, minWidth: 200, field: 'date', headerName: 'Date',
    renderCell: ({ row }) => {
      // Show employee profile if available (for consistency with team view)
      const emp = row.employeeId
      const dateStr = row.date
        ? new Date(row.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
        : '—'
      
      if (!emp) {
        return <Typography noWrap sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{dateStr}</Typography>
      }
      
      const initials = (emp.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      const hasPhoto = emp.profilePhoto && emp.profilePhoto.trim() !== ''
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {hasPhoto ? (
            <CustomAvatar src={emp.profilePhoto} alt={emp.name} sx={{ width: 34, height: 34 }} />
          ) : (
            <CustomAvatar skin='light' color='primary' sx={{ width: 34, height: 34, fontSize: '0.875rem' }}>
              {initials}
            </CustomAvatar>
          )}
          <Typography noWrap sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{dateStr}</Typography>
        </Box>
      )
    },
  },
  {
    flex: 0.15, minWidth: 110, field: 'checkIn', headerName: 'Punch In',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: row.checkIn ? 'success.main' : 'text.disabled', fontWeight: row.checkIn ? 600 : 400, fontSize: '0.875rem' }}>
        {row.checkIn
          ? new Date(row.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
          : '—'}
      </Typography>
    ),
  },
  {
    flex: 0.15, minWidth: 110, field: 'checkOut', headerName: 'Punch Out',
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
    flex: 0.13, minWidth: 110, field: 'status', headerName: 'Status',
    renderCell: ({ row }) => (
      <CustomChip rounded skin='light' size='small'
        label={STATUS_LABEL[row.status] || row.status || '—'}
        color={STATUS_COLOR[row.status] || 'default'}
        sx={{ textTransform: 'capitalize' }}
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

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MyAttendance() {
  const user = useSelector(selectUser)
  const router = useRouter()

  // State
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [filterStatus, setFilterStatus] = useState('')
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [rowCount, setRowCount] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // ── Fetch attendance list ─────────────────────────────────────────────────
  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('month', filterMonth)
      if (filterStatus) params.set('status', filterStatus)

      const res = await axiosRequest.get(`/api/v1/attendance/me?${params.toString()}`)

      if (res?.success) {
        const records = res.data?.records ?? res.data?.attendance ?? res.data ?? []
        let normalized = Array.isArray(records)
          ? records.map((r, i) => ({ ...r, id: r._id || i }))
          : []

        setRows(normalized)
        setRowCount(normalized.length)
      }
    } catch (err) {
      toast.error('Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }, [filterMonth, filterStatus])

  // ── Fetch monthly summary ─────────────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true)
    try {
      const res = await axiosRequest.get(`/api/v1/attendance/me/summary?month=${filterMonth}`)
      if (res?.success) setSummary(res.data?.summary ?? res.data)
    } catch {
      // Non-critical — summary cards show —
    } finally {
      setSummaryLoading(false)
    }
  }, [filterMonth])

  // Fetch on mount and when filters change
  useEffect(() => { 
    fetchAttendance()
  }, [fetchAttendance])
  
  useEffect(() => { 
    fetchSummary()
  }, [fetchSummary])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePunchSuccess = () => {
    fetchAttendance()
    fetchSummary()
  }

  const columns = buildMyAttendanceColumns()

  // Today's record for banner
  const todayRow = rows.find(r => {
    if (!r.date) return false
    return new Date(r.date).toDateString() === new Date().toDateString()
  })

  return (
    <AttendanceTabs activeTab='my-attendance'>
      <Grid container spacing={5}>
        {/* ── Summary Cards ─────────────────────────────────────────── */}
        <Grid item xs={12}>
          <MonthlySummaryCards summary={summary} loading={summaryLoading} />
        </Grid>

      {/* ── Main Table Card ─────────────────────────────────────── */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='My Attendance'
            subheader='Your attendance history and punch-in/out records'
            action={
              <Button
                variant='contained'
                startIcon={<Icon icon='tabler:clock' />}
                onClick={() => setDrawerOpen(true)}
              >
                Mark Attendance
              </Button>
            }
          />
          <CardContent>
            {/* ── Filters ───────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap', mb: 4 }}>
              <CustomTextField
                type='month'
                size='small'
                label='Month'
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                sx={{ minWidth: 180 }}
                InputLabelProps={{ shrink: true }}
              />

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
                  <MenuItem key={val} value={val}>{label}</MenuItem>
                ))}
              </CustomTextField>

              <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
                {rowCount} record{rowCount !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* ── Today's Status Banner ──────────────────────────── */}
            {todayRow && (
              <Box sx={{ mb: 2 }}>
                <Alert
                  severity={todayRow.status === 'PRESENT' || todayRow.status === 'WFH' ? 'success' : todayRow.status === 'ABSENT' ? 'error' : 'warning'}
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
              </Box>
            )}

            {/* ── DataGrid ────────────────────────────────────────── */}
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

      {/* ── Attendance Drawer ─────────────────────────────────────── */}
      <AttendanceDrawer
        open={drawerOpen}
        toggle={() => setDrawerOpen(prev => !prev)}
        roleSlug={user?.roleSlug || 'employee'}
        onSuccess={handlePunchSuccess}
      />
    </Grid>
    </AttendanceTabs>
  )
}
