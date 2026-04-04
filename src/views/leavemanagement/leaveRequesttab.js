// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
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

const mockRows = [
  { id: 1, employee: 'John Doe',   type: 'Annual', from: '2024-07-01', to: '2024-07-05', days: 5, status: 'pending'  },
  { id: 2, employee: 'Jane Smith', type: 'Sick',   from: '2024-07-10', to: '2024-07-11', days: 2, status: 'approved' },
  { id: 3, employee: 'Bob Ray',    type: 'Casual', from: '2024-07-15', to: '2024-07-15', days: 1, status: 'rejected' },
]

const TabLeaveRequests = () => {
  const [rows, setRows]         = useState(mockRows)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const columns = [
    { field: 'id',       headerName: '#',        width: 60  },
    { field: 'employee', headerName: 'Employee',  flex: 1   },
    { field: 'type',     headerName: 'Type',      flex: 1   },
    { field: 'from',     headerName: 'From',      flex: 1   },
    { field: 'to',       headerName: 'To',        flex: 1   },
    { field: 'days',     headerName: 'Days',      width: 80 },
    {
      field: 'status', headerName: 'Status', flex: 1,
      renderCell: ({ row }) => <LeaveStatusChip status={row.status} />
    },
  ]

  return (
    <>
      <Card>
        <CardHeader
          title='All Leave Requests'
          action={
            <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={() => setDrawerOpen(true)}>
              Apply Leave
            </Button>
          }
        />
        <CardContent>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      {/* Reuse the ApplyLeaveDrawer */}
      <ApplyLeaveDrawer
        open={drawerOpen}
        toggle={() => setDrawerOpen(prev => !prev)}
        onSuccess={() => {
          // TODO: refresh rows from API
        }}
      />
    </>
  )
}

export default TabLeaveRequests