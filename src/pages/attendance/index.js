// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Table Header
import AttendanceDrawer from './attendanceDrawer'
import TableHeader from './tableHeader'

// ** Attendance Drawer


// ---------------------------------------------------------------------------
// Mock API helper
// ---------------------------------------------------------------------------

/**
 * Fetch attendance records.
 *   ADMIN / HR  → API returns all employees (no userId filter server-side)
 *   EMPLOYEE    → API returns only their own rows (userId filter server-side)
 *
 * Replace body with: axios.get('/api/attendance', { params: { date, q, userId, role } })
 */
const fetchAttendance = async ({ date, q, userId, role }) => {
  const allRows = [
    { id: 1, employeeName: 'Rahul Sharma', userId: 2, date: '2026-03-11', checkIn: '09:15 AM', checkOut: '06:05 PM', status: 'Present',   hours: '8h 50m' },
    { id: 2, employeeName: 'Priya Mehta',  userId: 3, date: '2026-03-11', checkIn: '09:45 AM', checkOut: '06:00 PM', status: 'Late',      hours: '8h 15m' },
    { id: 3, employeeName: 'Amit Verma',   userId: 4, date: '2026-03-11', checkIn: null,        checkOut: null,        status: 'Absent',    hours: '0h 00m' },
    { id: 4, employeeName: 'Sneha Kapoor', userId: 5, date: '2026-03-10', checkIn: '09:00 AM', checkOut: '01:30 PM', status: 'Half Day',  hours: '4h 30m' },
    { id: 5, employeeName: 'Rahul Sharma', userId: 2, date: '2026-03-10', checkIn: '09:10 AM', checkOut: '06:00 PM', status: 'Present',   hours: '8h 50m' },
    { id: 6, employeeName: 'Priya Mehta',  userId: 3, date: '2026-03-10', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present',   hours: '9h 00m' },
  ]

  await new Promise(r => setTimeout(r, 350))

  let result = allRows

  // Employee sees only their own rows — handled server-side in real API
  if (role === 'EMPLOYEE') result = result.filter(r => r.userId === userId)

  if (date) result = result.filter(r => r.date === date)
  if (q)    result = result.filter(r => r.employeeName.toLowerCase().includes(q.toLowerCase()))

  return result
}

// ---------------------------------------------------------------------------
// Status chip colors
// ---------------------------------------------------------------------------
const attendanceStatusObj = {
  Present:    'success',
  Absent:     'error',
  Late:       'warning',
  'Half Day': 'info',
  Working:    'primary'
}

// ---------------------------------------------------------------------------
// Column builder — hides Employee Name column for EMPLOYEE role
// ---------------------------------------------------------------------------
const buildColumns = role => {
  const cols = []

  if (role !== 'EMPLOYEE') {
    cols.push({
      flex: 0.2,
      minWidth: 200,
      field: 'employeeName',
      headerName: 'Employee Name',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CustomAvatar skin='light' color='primary' sx={{ width: 34, height: 34, fontSize: '0.875rem' }}>
            {row.employeeName.split(' ').map(n => n[0]).join('')}
          </CustomAvatar>
          <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary' }}>
            {row.employeeName}
          </Typography>
        </Box>
      )
    })
  }

  cols.push(
    {
      flex: 0.15,
      minWidth: 130,
      field: 'date',
      headerName: 'Date',
      renderCell: ({ row }) => (
        <Typography noWrap sx={{ color: 'text.secondary' }}>{row.date}</Typography>
      )
    },
    {
      flex: 0.14,
      minWidth: 120,
      field: 'checkIn',
      headerName: 'Check-in',
      renderCell: ({ row }) => (
        <Typography noWrap sx={{ color: 'text.secondary' }}>{row.checkIn ?? '—'}</Typography>
      )
    },
    {
      flex: 0.14,
      minWidth: 120,
      field: 'checkOut',
      headerName: 'Check-out',
      renderCell: ({ row }) => (
        <Typography noWrap sx={{ color: 'text.secondary' }}>{row.checkOut ?? '—'}</Typography>
      )
    },
    {
      flex: 0.13,
      minWidth: 110,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => (
        <CustomChip
          rounded skin='light' size='small'
          label={row.status}
          color={attendanceStatusObj[row.status] ?? 'default'}
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      flex: 0.14,
      minWidth: 130,
      field: 'hours',
      headerName: 'Working Hours',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon='tabler:clock' fontSize={16} />
          <Typography noWrap sx={{ color: 'text.secondary' }}>{row.hours}</Typography>
        </Box>
      )
    }
  )

  return cols
}

// ---------------------------------------------------------------------------
// Main Attendance Page
// ---------------------------------------------------------------------------

/**
 * TODO: Replace currentUserRole / currentUserId with your real auth values, e.g.:
 *   const { role, id } = useSelector(state => state.auth.user)
 */
const Attendance = () => {
  const currentUserRole = 'ADMIN'   // 'ADMIN' | 'HR' | 'EMPLOYEE'
  const currentUserId   = 1

  const [rows, setRows]                       = useState([])
  const [loading, setLoading]                 = useState(false)
  const [filterDate, setFilterDate]           = useState('')
  const [filterQ, setFilterQ]                 = useState('')
  const [drawerOpen, setDrawerOpen]           = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const columns = buildColumns(currentUserRole)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAttendance({ date: filterDate, q: filterQ, userId: currentUserId, role: currentUserRole })
      setRows(data)
    } catch (err) {
      console.error('Failed to fetch attendance:', err)
    } finally {
      setLoading(false)
    }
  }, [filterDate, filterQ])

  useEffect(() => { loadData() }, [loadData])

  const handleFilter  = useCallback(val => setFilterQ(val), [])
  const toggleDrawer  = () => setDrawerOpen(prev => !prev)

  // Refresh table after successful clock-in / clock-out
  const handleAttendanceSuccess = () => loadData()

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Attendance'
            subheader={currentUserRole === 'EMPLOYEE' ? 'Your attendance records' : 'All employee attendance records'}
          />
          <Divider sx={{ m: '0 !important' }} />

          {/* Date filter */}
          <CardContent sx={{ pb: 0 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  type='date'
                  label='Filter by Date'
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </CardContent>

          {/* Search + Clock In button */}
          <TableHeader value={filterQ} handleFilter={handleFilter} toggle={toggleDrawer} />

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
          />
        </Card>
      </Grid>

      <AttendanceDrawer
        open={drawerOpen}
        toggle={toggleDrawer}
        userId={currentUserId}
        onSuccess={handleAttendanceSuccess}
      />
    </Grid>
  )
}

export default Attendance