import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import { DataGrid } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomChip from 'src/@core/components/mui/chip'
import toast from 'react-hot-toast'
import { fetchPendingRegularizations, processRegularization, bulkProcessRegularizations } from 'src/store/attendanceRegularization/regularizationSlice'
import { selectRoleSlug } from 'src/store/auth/authSlice'

// ─── Constants ────────────────────────────────────────────────────────────

const REG_TYPE_LABELS = {
  MISSED_PUNCH_IN: 'Missed Punch In',
  MISSED_PUNCH_OUT: 'Missed Punch Out',
  MISSING_BOTH: 'Missing Both',
  CORRECTION: 'Time Correction',
  EARLY_OUT: 'Early Out',
  LATE_IN: 'Late In'
}

// ─── Main Component ──────────────────────────────────────────────────────────

const RegularizationApprovalsPage = () => {
  const dispatch = useDispatch()
  const { pendingApprovals, loading } = useSelector(state => state.regularization || { pendingApprovals: [] })
  const roleSlug = useSelector(selectRoleSlug)
  const [rows, setRows] = useState([])
  const [actionDialog, setActionDialog] = useState(null)
  const [comment, setComment] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [bulkDialog, setBulkDialog] = useState(false)
  const [bulkAction, setBulkAction] = useState('')
  const [bulkComment, setBulkComment] = useState('')

  useEffect(() => {
    const params = {}
    if (filterStatus) params.status = filterStatus
    dispatch(fetchPendingRegularizations(params))
  }, [dispatch, filterStatus])

  const handleBulkAction = async action => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one request')
      return
    }
    setBulkAction(action)
    setBulkDialog(true)
  }

  const processBulkAction = async () => {
    if (!bulkComment.trim()) {
      toast.error('Please add a comment')
      return
    }
    try {
      await dispatch(bulkProcessRegularizations({
        regularizationIds: selectedRows,
        action: bulkAction,
        comment: bulkComment
      })).unwrap()
      toast.success(`${selectedRows.length} requests ${bulkAction === 'APPROVE' ? 'approved' : 'rejected'}`)
      setBulkDialog(false)
      setBulkComment('')
      setSelectedRows([])
      dispatch(fetchPendingRegularizations({ status: filterStatus }))
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Bulk action failed')
    }
  }

  useEffect(() => {
    setRows(Array.isArray(pendingApprovals) ? pendingApprovals : [])
  }, [pendingApprovals])

  const handleAction = async action => {
    if (!actionDialog) return
    if (!comment.trim()) {
      toast.error('Please add a comment')
      return
    }
    try {
      await dispatch(processRegularization({
        regularizationId: actionDialog._id,
        action,
        comment
      })).unwrap()
      toast.success(`Request ${action === 'APPROVE' ? 'approved' : 'rejected'}`)
      setActionDialog(null)
      setComment('')
      dispatch(fetchPendingRegularizations({ status: filterStatus }))
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Action failed')
    }
  }

  const columns = [
    {
      flex: 0.05,
      minWidth: 50,
      field: 'checkbox',
      headerName: '',
      renderHeader: () => (
        <input
          type='checkbox'
          checked={selectedRows.length === rows.length && rows.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(rows.map(r => r._id))
            } else {
              setSelectedRows([])
            }
          }}
        />
      ),
      renderCell: ({ row }) => (
        <input
          type='checkbox'
          checked={selectedRows.includes(row._id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(prev => [...prev, row._id])
            } else {
              setSelectedRows(prev => prev.filter(id => id !== row._id))
            }
          }}
        />
      )
    },
    {
      flex: 0.18,
      minWidth: 160,
      field: 'employee',
      headerName: 'Employee',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={row.employeeId?.avatar || ''}
            alt={row.employeeId?.name || 'Employee'}
            sx={{ width: 32, height: 32 }}
          >
            {row.employeeId?.name?.charAt(0) || 'E'}
          </Avatar>
          <Box>
            <Typography variant='body2' fontWeight={500}>{row.employeeId?.name || 'Unknown'}</Typography>
            <Typography variant='caption' color='text.secondary'>{row.employeeId?.email || ''}</Typography>
          </Box>
        </Box>
      )
    },
    {
      flex: 0.1,
      minWidth: 90,
      field: 'date',
      headerName: 'Date',
      renderCell: ({ row }) => (
        <Typography variant='body2'>{row.date?.split('T')[0] || '—'}</Typography>
      )
    },
    {
      flex: 0.15,
      minWidth: 130,
      field: 'regularizationType',
      headerName: 'Type',
      renderCell: ({ row }) => (
        <Typography variant='body2'>{REG_TYPE_LABELS[row.regularizationType] || row.regularizationType}</Typography>
      )
    },
    {
      flex: 0.12,
      minWidth: 100,
      field: 'requestedStatus',
      headerName: 'Status',
      renderCell: ({ row }) => (
        <CustomChip
          size='small'
          skin='light'
          label={row.requestedStatus}
          color='primary'
        />
      )
    },
    {
      flex: 0.12,
      minWidth: 100,
      field: 'requestedCheckIn',
      headerName: 'Check In',
      renderCell: ({ row }) => (
        <Typography variant='body2'>
          {row.requestedCheckIn ? new Date(row.requestedCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        </Typography>
      )
    },
    {
      flex: 0.12,
      minWidth: 100,
      field: 'requestedCheckOut',
      headerName: 'Check Out',
      renderCell: ({ row }) => (
        <Typography variant='body2'>
          {row.requestedCheckOut ? new Date(row.requestedCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 180,
      field: 'reason',
      headerName: 'Reason',
      renderCell: ({ row }) => (
        <Typography variant='body2' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.reason || '—'}
        </Typography>
      )
    },
    {
      flex: 0.15,
      minWidth: 130,
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size='small'
            variant='contained'
            color='success'
            onClick={() => setActionDialog({ ...row, action: 'APPROVE' })}
            startIcon={<Icon icon='tabler:check' />}
          >
            Approve
          </Button>
          <Button
            size='small'
            variant='outlined'
            color='error'
            onClick={() => setActionDialog({ ...row, action: 'REJECT' })}
            startIcon={<Icon icon='tabler:x' />}
          >
            Reject
          </Button>
        </Box>
      )
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Pending Regularization Approvals'
            subheader='Review and process attendance regularisation requests from your team members'
            action={
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <CustomTextField
                  select
                  size='small'
                  label='Status'
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{ width: 150 }}
                >
                  <MenuItem value=''>All</MenuItem>
                  <MenuItem value='PENDING'>Pending</MenuItem>
                  <MenuItem value='UNDER_REVIEW'>Under Review</MenuItem>
                  <MenuItem value='APPROVED'>Approved</MenuItem>
                  <MenuItem value='REJECTED'>Rejected</MenuItem>
                </CustomTextField>
                
                {selectedRows.length > 0 && (
                  <>
                    <Button
                      variant='contained'
                      color='success'
                      startIcon={<Icon icon='tabler:check' />}
                      onClick={() => handleBulkAction('APPROVE')}
                    >
                      Bulk Approve ({selectedRows.length})
                    </Button>
                    <Button
                      variant='outlined'
                      color='error'
                      startIcon={<Icon icon='tabler:x' />}
                      onClick={() => handleBulkAction('REJECT')}
                    >
                      Bulk Reject ({selectedRows.length})
                    </Button>
                  </>
                )}
              </Box>
            }
          />
          <Divider />
          <CardContent>
            <Box sx={{ mb: 4 }}>
              <Typography variant='caption' color='text.secondary'>
                {roleSlug === 'manager' 
                  ? 'L1 Approval: Your approval will forward this to HR for final approval.'
                  : 'L2 Approval: Your approval will finalise this regularisation.'}
              </Typography>
            </Box>

            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25]}
              getRowId={row => row._id}
              loading={loading}
              sx={{
                '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.default' },
                '& .MuiDataGrid-cell': { py: 2 }
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Approve/Reject Dialog */}
      <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)} maxWidth='sm' fullWidth>
        <DialogTitle>
          {actionDialog?.action === 'APPROVE' ? 'Approve Request' : 'Reject Request'}
        </DialogTitle>
        <DialogContent>
          {actionDialog && (
            <Box sx={{ pt: 2 }}>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                Request Details
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Employee</Typography>
                  <Typography variant='body2'>{actionDialog.employeeId?.name || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Date</Typography>
                  <Typography variant='body2'>{actionDialog.date?.split('T')[0] || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Type</Typography>
                  <Typography variant='body2'>{REG_TYPE_LABELS[actionDialog.regularizationType] || actionDialog.regularizationType}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Requested Status</Typography>
                  <Typography variant='body2'>{actionDialog.requestedStatus}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='caption' color='text.secondary'>Reason</Typography>
                  <Typography variant='body2'>{actionDialog.reason || '—'}</Typography>
                </Grid>
              </Grid>

              <CustomTextField
                fullWidth
                multiline
                rows={3}
                label='Comment'
                placeholder='Add your comments (required)'
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 6, pb: 4 }}>
          <Button onClick={() => setActionDialog(null)}>Cancel</Button>
          <Button
            variant='contained'
            color={actionDialog?.action === 'APPROVE' ? 'success' : 'error'}
            onClick={() => handleAction(actionDialog?.action)}
            disabled={loading || !comment.trim()}
          >
            {loading ? <CircularProgress size={22} /> : actionDialog?.action === 'APPROVE' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkDialog} onClose={() => setBulkDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          Bulk {bulkAction === 'APPROVE' ? 'Approve' : 'Reject'} {selectedRows.length} Requests
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              You are about to {bulkAction === 'APPROVE' ? 'approve' : 'reject'} {selectedRows.length} regularization requests.
            </Typography>

            <CustomTextField
              fullWidth
              multiline
              rows={3}
              label='Comment'
              placeholder='Add your comments (required)'
              value={bulkComment}
              onChange={e => setBulkComment(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 6, pb: 4 }}>
          <Button onClick={() => setBulkDialog(false)}>Cancel</Button>
          <Button
            variant='contained'
            color={bulkAction === 'APPROVE' ? 'success' : 'error'}
            onClick={processBulkAction}
            disabled={loading || !bulkComment.trim()}
          >
            {loading ? <CircularProgress size={22} /> : `${bulkAction === 'APPROVE' ? 'Approve' : 'Reject'} All`}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default RegularizationApprovalsPage
