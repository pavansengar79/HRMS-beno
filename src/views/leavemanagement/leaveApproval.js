// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import LeaveStatusChip from './leaveStatusChip'

// ** Components

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const mockRows = [
  { id: 1, employee: 'John Doe', type: 'Annual', from: '2024-07-01', to: '2024-07-05', days: 5, status: 'pending', reason: 'Family vacation' },
  { id: 2, employee: 'Alice K.', type: 'Sick',   from: '2024-07-08', to: '2024-07-09', days: 2, status: 'pending', reason: 'Fever and cold' },
]

const TabLeaveApproval = () => {
  const [rows, setRows]         = useState(mockRows)
  const [selected, setSelected] = useState(null)
  const [open, setOpen]         = useState(false)

  const handleView = row => {
    setSelected(row)
    setOpen(true)
  }

  const handleAction = (id, action) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: action } : r))
    setOpen(false)
  }

  const columns = [
    { field: 'id',       headerName: '#',       width: 60 },
    { field: 'employee', headerName: 'Employee', flex: 1  },
    { field: 'type',     headerName: 'Type',     flex: 1  },
    { field: 'from',     headerName: 'From',     flex: 1  },
    { field: 'to',       headerName: 'To',       flex: 1  },
    { field: 'days',     headerName: 'Days',     width: 80 },
    {
      field: 'status', headerName: 'Status', flex: 1,
      renderCell: ({ row }) => <LeaveStatusChip status={row.status} />
    },
    {
      field: 'actions', headerName: 'Actions', flex: 1,
      renderCell: ({ row }) => (
        <Button size='small' variant='outlined' onClick={() => handleView(row)}
          startIcon={<Icon icon='tabler:eye' />}>
          Review
        </Button>
      )
    }
  ]

  return (
    <>
      <Card>
        <CardHeader title='Leave Approvals' subheader='Review and action pending leave requests' />
        <CardContent>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      {/* Review Drawer */}
      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <Header>
          <Typography variant='h5'>Review Leave</Typography>
          <IconButton
            size='small'
            onClick={() => setOpen(false)}
            sx={{
              p: '0.438rem', borderRadius: 1,
              color: 'text.primary', backgroundColor: 'action.selected',
              '&:hover': { backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)` }
            }}
          >
            <Icon icon='tabler:x' fontSize='1.125rem' />
          </IconButton>
        </Header>

        {selected && (
          <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
            {[
              { label: 'Employee', value: selected.employee },
              { label: 'Leave Type', value: selected.type },
              { label: 'From',     value: selected.from },
              { label: 'To',       value: selected.to },
              { label: 'Days',     value: selected.days },
              { label: 'Reason',   value: selected.reason },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ mb: 3 }}>
                <Typography variant='caption' color='text.disabled'>{label}</Typography>
                <Typography variant='body1' fontWeight={500}>{value}</Typography>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}

            <Box sx={{ mt: 2 }}>
              <LeaveStatusChip status={selected.status} />
            </Box>

            {selected.status === 'pending' && (
              <Stack direction='row' spacing={3} sx={{ mt: 6 }}>
                <Button
                  fullWidth
                  variant='contained'
                  color='success'
                  startIcon={<Icon icon='tabler:check' />}
                  onClick={() => handleAction(selected.id, 'approved')}
                >
                  Approve
                </Button>
                <Button
                  fullWidth
                  variant='outlined'
                  color='error'
                  startIcon={<Icon icon='tabler:x' />}
                  onClick={() => handleAction(selected.id, 'rejected')}
                >
                  Reject
                </Button>
              </Stack>
            )}
          </Box>
        )}
      </Drawer>
    </>
  )
}

export default TabLeaveApproval