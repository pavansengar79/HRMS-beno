// ** React Imports
import { useEffect, useState } from 'react'

// ** Redux
import { useDispatch, useSelector } from 'react-redux'

// ** MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Components
import LeaveStatusChip from './leaveStatusChip'
import ApplyLeaveDrawer from './applyleaveDrawer'
import { selectPermissions, selectRoleSlug } from 'src/store/auth/authSlice'
import { fetchMyLeaves } from 'src/store/leaves/leaveSlice'

// ** API Actions (you need to create these)
// import { fetchMyLeaves, approveLeave } from 'src/store/leave'



const TabLeaveRequests = () => {
  const dispatch = useDispatch()

  const [drawerOpen, setDrawerOpen] = useState(false)

  // ✅ Redux state
  const { data: leaveData, loading, error } = useSelector(state => state.leaves)
  console.log("leaveData", leaveData)


  const total = leaveData?.data?.total || 0



  const permissions = useSelector(selectPermissions) || []
  const userRole = useSelector(selectRoleSlug) || ''

  const rows = leaveData?.data?.data || []

  // ✅ Fetch API
  useEffect(() => {
    dispatch(fetchMyLeaves({ page: 1, limit: 10 }))
  }, [dispatch])


  // ✅ Permission check
  const canApproveLeave = row => {
    return row.isActionable && permissions.includes('leave.update')
  }

  // ✅ Approve handler
  // const handleApprove = id => {
  //   dispatch(approveLeave(id)).then(() => {
  //     dispatch(fetchMyLeaves({ page: 1, limit: 10 }))
  //   })
  // }




  const columns = [
    {
      field: '_id',
      headerName: '#',
      width: 80,
      renderCell: params => params.row.id || params.row._id
    },
    {
      field: 'leaveType',
      headerName: 'Type',
      flex: 1,
      renderCell: ({ row }) => (
        <span style={{ color: row.leaveTypeId?.colorCode }}>
          {row.leaveTypeId?.name}
        </span>
      )
    },
    {
      field: 'from',
      headerName: 'From',
      flex: 1,
      renderCell: ({ row }) =>
        new Date(row.startDate).toLocaleDateString()
    },
    {
      field: 'to',
      headerName: 'To',
      flex: 1,
      renderCell: ({ row }) =>
        new Date(row.endDate).toLocaleDateString()
    },
    {
      field: 'days',
      headerName: 'Days',
      width: 100,
      renderCell: ({ row }) => row.totalDays
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: ({ row }) => (
        <LeaveStatusChip status={row.status.toLowerCase()} />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: ({ row }) => {
        if (!canApproveLeave(row)) return null

        return (
          <Button
            size='small'
            variant='contained'
            onClick={() => handleApprove(row._id)}
          >
            Approve
          </Button>
        )
      }
    }
  ]

  return (
    <>
      <Card>
        <CardHeader
          title='All Leave Requests'
          action={
            <Button
              variant='contained'
              startIcon={<Icon icon='tabler:plus' />}
              onClick={() => setDrawerOpen(true)}
            >
              Apply Leave
            </Button>
          }
        />

        <CardContent>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            getRowId={row => row._id} // ✅ important
            loading={loading}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } }
            }}
          // disableRowSelectionOnClick

          />
        </CardContent>
      </Card>

      {/* Apply Leave Drawer */}
      <ApplyLeaveDrawer
        open={drawerOpen}
        toggle={() => setDrawerOpen(prev => !prev)}
        onSuccess={() => {
          dispatch(fetchMyLeaves({ page: 1, limit: 10 }))
        }}
      />
    </>
  )
}

export default TabLeaveRequests