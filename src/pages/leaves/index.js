// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Table Header (existing)

// ** Leave Drawer
import ApplyLeaveDrawer from './applyleaveDrawer'
import TableHeader from './tableHeader'

// ---------------------------------------------------------------------------
// Mock API helper
// ---------------------------------------------------------------------------

/**
 * Replace with: axios.get('/api/leaves', { params: { q, userId, role } })
 */
const fetchLeaves = async ({ q, userId, role }) => {
  const allRows = [
    { id: 1, employeeName: 'Rahul Sharma', userId: 2, leaveType: 'Sick Leave',   fromDate: '2026-03-10', toDate: '2026-03-12', days: 3, reason: 'Fever',           status: 'Pending'  },
    { id: 2, employeeName: 'Priya Mehta',  userId: 3, leaveType: 'Casual Leave', fromDate: '2026-03-05', toDate: '2026-03-06', days: 2, reason: 'Personal work',   status: 'Approved' },
    { id: 3, employeeName: 'Amit Verma',   userId: 4, leaveType: 'Earned Leave', fromDate: '2026-02-20', toDate: '2026-02-25', days: 6, reason: 'Family vacation', status: 'Approved' },
    { id: 4, employeeName: 'Sneha Kapoor', userId: 5, leaveType: 'Unpaid Leave', fromDate: '2026-03-01', toDate: '2026-03-01', days: 1, reason: 'Emergency',       status: 'Rejected' },
    { id: 5, employeeName: 'Rahul Sharma', userId: 2, leaveType: 'Casual Leave', fromDate: '2026-02-14', toDate: '2026-02-14', days: 1, reason: "Valentine's day", status: 'Approved' },
    { id: 6, employeeName: 'Priya Mehta',  userId: 3, leaveType: 'Sick Leave',   fromDate: '2026-01-08', toDate: '2026-01-09', days: 2, reason: 'Cold and flu',    status: 'Approved' },
  ]

  await new Promise(r => setTimeout(r, 350))

  let result = allRows
  if (role === 'EMPLOYEE') result = result.filter(r => r.userId === userId)
  if (q) result = result.filter(r =>
    r.employeeName.toLowerCase().includes(q.toLowerCase()) ||
    r.leaveType.toLowerCase().includes(q.toLowerCase())
  )

  return result
}

// ---------------------------------------------------------------------------
// Status chip colors
// ---------------------------------------------------------------------------
const leaveStatusObj = {
  Pending:  'warning',
  Approved: 'success',
  Rejected: 'error'
}

// ---------------------------------------------------------------------------
// Column builder
// ---------------------------------------------------------------------------
const buildColumns = role => {
  const cols = []

  if (role !== 'EMPLOYEE') {
    cols.push({
      flex: 0.18,
      minWidth: 190,
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
      flex: 0.15, minWidth: 140, field: 'leaveType', headerName: 'Leave Type',
      renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>{row.leaveType}</Typography>
    },
    {
      flex: 0.13, minWidth: 120, field: 'fromDate', headerName: 'From Date',
      renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>{row.fromDate}</Typography>
    },
    {
      flex: 0.13, minWidth: 120, field: 'toDate', headerName: 'To Date',
      renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>{row.toDate}</Typography>
    },
    {
      flex: 0.08, minWidth: 90, field: 'days', headerName: 'Total Days',
      renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>{row.days}</Typography>
    },
    {
      flex: 0.18, minWidth: 180, field: 'reason', headerName: 'Reason',
      renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>{row.reason}</Typography>
    },
    {
      flex: 0.1, minWidth: 110, field: 'status', headerName: 'Status',
      renderCell: ({ row }) => (
        <CustomChip
          rounded skin='light' size='small'
          label={row.status}
          color={leaveStatusObj[row.status] ?? 'default'}
          sx={{ textTransform: 'capitalize' }}
        />
      )
    }
  )

  return cols
}

// ---------------------------------------------------------------------------
// Leave Page
// ---------------------------------------------------------------------------

/**
 * TODO: Replace currentUserRole / currentUserId with real auth values, e.g.:
 *   const { role, id } = useSelector(state => state.auth.user)
 */
const Leave = () => {
  const router          = useRouter()
  const currentUserRole = 'HR'   // 'ADMIN' | 'HR' | 'EMPLOYEE'
  const currentUserId   = 1

  const isAdminOrHR = currentUserRole === 'ADMIN' || currentUserRole === 'HR'

  const [rows, setRows]                       = useState([])
  const [loading, setLoading]                 = useState(false)
  const [filterQ, setFilterQ]                 = useState('')
  const [drawerOpen, setDrawerOpen]           = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const columns = buildColumns(currentUserRole)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchLeaves({ q: filterQ, userId: currentUserId, role: currentUserRole })
      setRows(data)
    } catch (err) {
      console.error('Failed to fetch leaves:', err)
    } finally {
      setLoading(false)
    }
  }, [filterQ])

  useEffect(() => { loadData() }, [loadData])

  // Navigate to /leaves/{userId}/leaveHistory on row click (Admin / HR only)
  const handleRowClick = ({ row }) => {
    if (isAdminOrHR) {
      router.push(`/leaves/${row.userId}/leaveHistory`)
    }
  }

  const handleFilter       = useCallback(val => setFilterQ(val), [])
  const toggleDrawer       = () => setDrawerOpen(prev => !prev)
  const handleLeaveSuccess = () => loadData()

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Leave Management'
            subheader={isAdminOrHR ? 'Click a row to view full leave history for that employee' : 'Your leave records'}
          />
          <Divider sx={{ m: '0 !important' }} />

          <TableHeader value={filterQ} handleFilter={handleFilter} toggle={toggleDrawer} />

          <DataGrid
            autoHeight
            rowHeight={62}
            rows={rows}
            columns={columns}
            loading={loading}
            onRowClick={handleRowClick}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sx={isAdminOrHR ? { '& .MuiDataGrid-row': { cursor: 'pointer' } } : {}}
          />
        </Card>
      </Grid>

      <ApplyLeaveDrawer
        open={drawerOpen}
        toggle={toggleDrawer}
        userId={currentUserId}
        onSuccess={handleLeaveSuccess}
      />
    </Grid>
  )
}

export default Leave