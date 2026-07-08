import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Drawer from '@mui/material/Drawer'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Chip from '@mui/material/Chip'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  fetchShiftSwaps,
  raiseSwapRequest,
  respondToSwap,
  approveSwap,
  rejectSwap,
  cancelSwapRequest
} from 'src/store/shift/shiftSwapSlice'
import { fetchAllEmployees } from 'src/store/employee/employeeSlice'
import { selectSelectedUnitId } from 'src/store/hierarchy/hierarchySlice'
import { format, parseISO } from 'date-fns'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const STATUS_CONFIG = {
  PENDING_ACCEPTANCE: { color: 'warning', label: 'Pending Acceptance' },
  PENDING_APPROVAL: { color: 'info', label: 'Pending Approval' },
  APPROVED: { color: 'success', label: 'Approved' },
  REJECTED_BY_B: { color: 'error', label: 'Rejected by Employee' },
  REJECTED_BY_MANAGER: { color: 'error', label: 'Rejected by Manager' },
  CANCELLED: { color: 'default', label: 'Cancelled' },
  EXPIRED: { color: 'default', label: 'Expired' }
}

const schema = yup.object().shape({
  requestedEmployeeId: yup.string().required('Employee is required'),
  swapDate: yup.date().required('Swap date is required').min(new Date(), 'Date must be today or future'),
  reason: yup.string().max(500)
})

const ShiftSwapPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { swapRequests, loading } = useSelector(state => state.shiftSwaps || {})
  const { list: employees } = useSelector(state => state.employee || {})
  const selectedUnitId = useSelector(selectSelectedUnitId)

  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [actionDialog, setActionDialog] = useState(null)
  const [actionComment, setActionComment] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      requestedEmployeeId: '',
      swapDate: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      reason: ''
    },
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    dispatch(fetchShiftSwaps({ unitId: router.query.unit || selectedUnitId }))
    dispatch(fetchAllEmployees({ unitId: router.query.unit || selectedUnitId, limit: 500 }))
  }, [dispatch, router.query.unit, selectedUnitId])

  useEffect(() => {
    setRows(Array.isArray(swapRequests) ? swapRequests : [])
  }, [swapRequests])

  // Filter rows based on search and status
  const filteredRows = rows.filter(row => {
    if (filterStatus !== 'all' && row.status !== filterStatus) return false
    if (!search) return true
    const requesterName = row.requesterEmployeeId?.name || ''
    const requestedName = row.requestedEmployeeId?.name || ''
    return requesterName.toLowerCase().includes(search.toLowerCase()) ||
           requestedName.toLowerCase().includes(search.toLowerCase())
  })

  const onSubmit = async (data) => {
    try {
      const payload = {
        requestedEmployeeId: data.requestedEmployeeId,
        swapDate: new Date(data.swapDate),
        reason: data.reason || '',
        unitId: router.query.unit || selectedUnitId
      }

      await dispatch(raiseSwapRequest(payload)).unwrap()
      toast.success('Swap request raised successfully')
      setDrawerOpen(false)
      reset()
      dispatch(fetchShiftSwaps({ unitId: router.query.unit || selectedUnitId }))
    } catch (error) {
      toast.error(error || 'Failed to raise swap request')
    }
  }

  const handleAction = async () => {
    if (!actionDialog) return

    try {
      const { action, swapId } = actionDialog

      switch (action) {
        case 'accept':
          await dispatch(respondToSwap({ swapId, accept: true, comment: actionComment })).unwrap()
          toast.success('Swap accepted')
          break
        case 'decline':
          await dispatch(respondToSwap({ swapId, accept: false, comment: actionComment })).unwrap()
          toast.success('Swap declined')
          break
        case 'approve':
          await dispatch(approveSwap({ swapId, comment: actionComment })).unwrap()
          toast.success('Swap approved')
          break
        case 'reject':
          await dispatch(rejectSwap({ swapId, comment: actionComment })).unwrap()
          toast.success('Swap rejected')
          break
        case 'cancel':
          await dispatch(cancelSwapRequest({ swapId, comment: actionComment })).unwrap()
          toast.success('Swap cancelled')
          break
      }

      setActionDialog(null)
      setActionComment('')
      dispatch(fetchShiftSwaps({ unitId: router.query.unit || selectedUnitId }))
    } catch (error) {
      toast.error(error || 'Action failed')
    }
  }

  const columns = [
    {
      field: 'requester',
      headerName: 'Requester',
      flex: 1,
      valueGetter: (params) => {
        const emp = params.row.requesterEmployeeId
        return typeof emp === 'object' ? emp?.name || `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim() : emp
      }
    },
    {
      field: 'requested',
      headerName: 'Requested Employee',
      flex: 1,
      valueGetter: (params) => {
        const emp = params.row.requestedEmployeeId
        return typeof emp === 'object' ? emp?.name || `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim() : emp
      }
    },
    {
      field: 'swapDate',
      headerName: 'Swap Date',
      flex: 0.8,
      valueGetter: (params) => {
        const date = params.row.swapDate
        if (!date) return '-'
        try {
          return format(parseISO(date), 'dd MMM yyyy')
        } catch {
          return '-'
        }
      }
    },
    {
      field: 'requesterShift',
      headerName: 'Requester Shift',
      flex: 0.8,
      valueGetter: (params) => params.row.requesterShiftName || '-'
    },
    {
      field: 'requestedShift',
      headerName: 'Requested Shift',
      flex: 0.8,
      valueGetter: (params) => params.row.requestedShiftName || '-'
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      renderCell: (params) => {
        const config = STATUS_CONFIG[params.row.status] || { color: 'default', label: params.row.status }
        return <Chip label={config.label} color={config.color} size='small' />
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const status = params.row.status
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {status === 'PENDING_ACCEPTANCE' && (
              <>
                <IconButton size='small' onClick={() => setActionDialog({ action: 'accept', swapId: params.row._id })}>
                  <Icon icon='mdi:check' fontSize={20} color='success' />
                </IconButton>
                <IconButton size='small' onClick={() => setActionDialog({ action: 'decline', swapId: params.row._id })}>
                  <Icon icon='mdi:close' fontSize={20} color='error' />
                </IconButton>
              </>
            )}
            {status === 'PENDING_APPROVAL' && (
              <>
                <IconButton size='small' onClick={() => setActionDialog({ action: 'approve', swapId: params.row._id })}>
                  <Icon icon='mdi:check-circle' fontSize={20} color='success' />
                </IconButton>
                <IconButton size='small' onClick={() => setActionDialog({ action: 'reject', swapId: params.row._id })}>
                  <Icon icon='mdi:close-circle' fontSize={20} color='error' />
                </IconButton>
              </>
            )}
            {(status === 'PENDING_ACCEPTANCE' || status === 'PENDING_APPROVAL') && (
              <IconButton size='small' onClick={() => setActionDialog({ action: 'cancel', swapId: params.row._id })}>
                <Icon icon='mdi:cancel' fontSize={20} color='warning' />
              </IconButton>
            )}
          </Box>
        )
      }
    }
  ]

  return (
    <Card>
      <Header>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant='h5'>Shift Swap Requests</Typography>
          <CustomTextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search employee...'
            size='small'
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: <Icon icon='mdi:magnify' fontSize={20} style={{ marginRight: 8 }} />
            }}
          />
          <CustomTextField
            select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            size='small'
            sx={{ minWidth: 180 }}
            label='Filter Status'
          >
            <MenuItem value='all'>All Status</MenuItem>
            <MenuItem value='PENDING_ACCEPTANCE'>Pending Acceptance</MenuItem>
            <MenuItem value='PENDING_APPROVAL'>Pending Approval</MenuItem>
            <MenuItem value='APPROVED'>Approved</MenuItem>
            <MenuItem value='REJECTED_BY_B'>Rejected by Employee</MenuItem>
            <MenuItem value='REJECTED_BY_MANAGER'>Rejected by Manager</MenuItem>
            <MenuItem value='CANCELLED'>Cancelled</MenuItem>
          </CustomTextField>
        </Box>
        <Button
          variant='contained'
          startIcon={<Icon icon='mdi:swap-horizontal' />}
          onClick={() => {
            reset({
              requestedEmployeeId: '',
              swapDate: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
              reason: ''
            })
            setDrawerOpen(true)
          }}
        >
          New Swap Request
        </Button>
      </Header>

      <CardContent sx={{ pt: 0 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          sx={{ minHeight: 500 }}
        />
      </CardContent>

      {/* New Request Drawer */}
      <Drawer
        anchor='right'
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: 350, sm: 500 } } }}
      >
        <Box sx={{ p: 6 }}>
          <Typography variant='h6' sx={{ mb: 4 }}>
            Raise Shift Swap Request
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Controller
                  name='requestedEmployeeId'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      label='Employee to Swap With'
                      error={!!errors.requestedEmployeeId}
                      helperText={errors.requestedEmployeeId?.message}
                    >
                      {(employees || []).map(emp => (
                        <MenuItem key={emp._id} value={emp._id}>
                          {emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='swapDate'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='date'
                      label='Swap Date'
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: format(new Date(), 'yyyy-MM-dd') }}
                      error={!!errors.swapDate}
                      helperText={errors.swapDate?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='reason'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      multiline
                      rows={3}
                      label='Reason (Optional)'
                      placeholder='Brief explanation for the swap request'
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', mt: 6 }}>
              <Button variant='tonal' color='secondary' onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' variant='contained' disabled={loading}>
                {loading && <CircularProgress size={16} sx={{ mr: 1 }} />}
                Submit Request
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)} maxWidth='sm' fullWidth>
        <DialogTitle>
          {actionDialog?.action === 'accept' && 'Accept Swap Request'}
          {actionDialog?.action === 'decline' && 'Decline Swap Request'}
          {actionDialog?.action === 'approve' && 'Approve Swap Request'}
          {actionDialog?.action === 'reject' && 'Reject Swap Request'}
          {actionDialog?.action === 'cancel' && 'Cancel Swap Request'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            {actionDialog?.action === 'accept' && 'Are you sure you want to accept this swap request? It will then be sent to your manager for final approval.'}
            {actionDialog?.action === 'decline' && 'Are you sure you want to decline this swap request?'}
            {actionDialog?.action === 'approve' && 'Approve this swap request. Both employees\' rosters will be updated.'}
            {actionDialog?.action === 'reject' && 'Reject this swap request. Please provide a reason.'}
            {actionDialog?.action === 'cancel' && 'Cancel this swap request. This action cannot be undone.'}
          </DialogContentText>
          <CustomTextField
            fullWidth
            multiline
            rows={3}
            label='Comment (Optional)'
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
            placeholder='Add a comment...'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>Cancel</Button>
          <Button
            variant='contained'
            color={actionDialog?.action === 'approve' || actionDialog?.action === 'accept' ? 'primary' : 'error'}
            onClick={handleAction}
            disabled={loading}
          >
            {loading && <CircularProgress size={16} sx={{ mr: 1 }} />}
            {actionDialog?.action === 'accept' && 'Accept'}
            {actionDialog?.action === 'decline' && 'Decline'}
            {actionDialog?.action === 'approve' && 'Approve'}
            {actionDialog?.action === 'reject' && 'Reject'}
            {actionDialog?.action === 'cancel' && 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ShiftSwapPage
