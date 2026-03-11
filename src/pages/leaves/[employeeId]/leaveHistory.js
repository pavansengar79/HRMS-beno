// ** React Imports
import { useState, useEffect } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ---------------------------------------------------------------------------
// Mock data store — keyed by userId
// ---------------------------------------------------------------------------

/**
 * Fetch leave history for a specific employee.
 * Replace with: axios.get(`/api/leaves/${employeeId}/history`)
 *
 * Expected response shape:
 * { employeeId, employeeName, leaveHistory: [...] }
 */
const fetchLeaveHistory = async employeeId => {
  const mockStore = {
    '2': {
      employeeId:   '2',
      employeeName: 'Rahul Sharma',
      leaveHistory: [
        { id: 1, leaveType: 'Sick Leave',   fromDate: '2026-03-10', toDate: '2026-03-12', days: 3, status: 'Pending'  },
        { id: 2, leaveType: 'Casual Leave', fromDate: '2026-02-14', toDate: '2026-02-14', days: 1, status: 'Approved' },
        { id: 3, leaveType: 'Earned Leave', fromDate: '2025-12-24', toDate: '2025-12-28', days: 5, status: 'Approved' },
      ]
    },
    '3': {
      employeeId:   '3',
      employeeName: 'Priya Mehta',
      leaveHistory: [
        { id: 1, leaveType: 'Casual Leave', fromDate: '2026-03-05', toDate: '2026-03-06', days: 2, status: 'Approved' },
        { id: 2, leaveType: 'Sick Leave',   fromDate: '2026-01-08', toDate: '2026-01-09', days: 2, status: 'Approved' },
        { id: 3, leaveType: 'Unpaid Leave', fromDate: '2025-11-01', toDate: '2025-11-01', days: 1, status: 'Rejected' },
      ]
    },
    '4': {
      employeeId:   '4',
      employeeName: 'Amit Verma',
      leaveHistory: [
        { id: 1, leaveType: 'Earned Leave', fromDate: '2026-02-20', toDate: '2026-02-25', days: 6, status: 'Approved' },
        { id: 2, leaveType: 'Sick Leave',   fromDate: '2025-10-10', toDate: '2025-10-11', days: 2, status: 'Approved' },
      ]
    },
    '5': {
      employeeId:   '5',
      employeeName: 'Sneha Kapoor',
      leaveHistory: [
        { id: 1, leaveType: 'Unpaid Leave', fromDate: '2026-03-01', toDate: '2026-03-01', days: 1, status: 'Rejected' },
        { id: 2, leaveType: 'Casual Leave', fromDate: '2025-09-15', toDate: '2025-09-16', days: 2, status: 'Approved' },
      ]
    }
  }

  await new Promise(r => setTimeout(r, 350))

  return mockStore[String(employeeId)] ?? {
    employeeId,
    employeeName: 'Unknown Employee',
    leaveHistory: []
  }
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
// Columns — no Employee Name column needed (single employee view)
// ---------------------------------------------------------------------------
const columns = [
  {
    flex: 0.18,
    minWidth: 150,
    field: 'leaveType',
    headerName: 'Leave Type',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.leaveType}</Typography>
    )
  },
  {
    flex: 0.16,
    minWidth: 130,
    field: 'fromDate',
    headerName: 'From Date',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.fromDate}</Typography>
    )
  },
  {
    flex: 0.16,
    minWidth: 130,
    field: 'toDate',
    headerName: 'To Date',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.toDate}</Typography>
    )
  },
  {
    flex: 0.12,
    minWidth: 100,
    field: 'days',
    headerName: 'Total Days',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.days}</Typography>
    )
  },
  {
    flex: 0.14,
    minWidth: 110,
    field: 'status',
    headerName: 'Status',
    renderCell: ({ row }) => (
      <CustomChip
        rounded skin='light' size='small'
        label={row.status}
        color={leaveStatusObj[row.status] ?? 'default'}
        sx={{ textTransform: 'capitalize' }}
      />
    )
  }
]

// ---------------------------------------------------------------------------
// Leave History Page  —  /leaves/[employeeId]/leaveHistory
// ---------------------------------------------------------------------------
const LeaveHistory = () => {
  const router = useRouter()
  const { employeeId } = router.query   // extracted from dynamic segment

  const [record, setRecord]               = useState(null)
  const [loading, setLoading]             = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  useEffect(() => {
    
  if (!router.isReady) return

console.log('Fetching leave history for employeeId:', employeeId)
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchLeaveHistory(employeeId)
        console.log('Fetched leave history:', data)
        setRecord(data)
      } catch (err) {
        console.error('Failed to fetch leave history:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router.isReady ,employeeId])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Back button */}
                <IconButton
                  size='small'
                  component={Link}
                  href='/leaves'
                  sx={{
                    p: '0.438rem',
                    borderRadius: 1,
                    color: 'text.primary',
                    backgroundColor: 'action.selected',
                    '&:hover': {
                      backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
                    }
                  }}
                >
                  <Icon icon='tabler:arrow-left' fontSize='1.125rem' />
                </IconButton>

                {/* Employee avatar + name */}
                {record && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CustomAvatar skin='light' color='primary' sx={{ width: 38, height: 38, fontSize: '0.875rem' }}>
                      {record.employeeName.split(' ').map(n => n[0]).join('')}
                    </CustomAvatar>
                    <Box>
                      <Typography variant='h5' sx={{ lineHeight: 1.2 }}>
                        {record.employeeName}
                      </Typography>
                      <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                        Leave History
                      </Typography>
                    </Box>
                  </Box>
                )}

                {!record && !loading && (
                  <Typography variant='h5'>Leave History</Typography>
                )}
              </Box>
            }
          />
          <Divider sx={{ m: '0 !important' }} />

          <DataGrid
            autoHeight
            rowHeight={62}
            rows={record?.leaveHistory ?? []}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

export default LeaveHistory