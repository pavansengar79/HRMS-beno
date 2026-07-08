// src/views/leavemanagement/leaveApproval.js
import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Snackbar from '@mui/material/Snackbar'
import { DataGrid } from '@mui/x-data-grid'

import Icon from 'src/@core/components/icon'

import { fetchPendingApprovals, fetchLeaveById, updateLeaveStatus } from 'src/store/leaves/leaveSlice'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  pending:   'warning',
  approved:  'success',
  rejected:  'error',
  cancelled: 'default',
}

const fmt = date => date
  ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—'

const LeaveStatusChip = ({ status = '' }) => (
  <Chip
    size='small'
    label={status.charAt(0).toUpperCase() + status.slice(1)}
    color={STATUS_COLOR[status.toLowerCase()] || 'default'}
    variant='tonal'
  />
)

// ─── Detail Row ───────────────────────────────────────────────────────────────

const DetailRow = ({ label, children }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 1.5 }}>
    <Typography variant='body2' color='text.secondary' sx={{ minWidth: 140 }}>{label}</Typography>
    <Box sx={{ textAlign: 'right' }}>{children}</Box>
  </Box>
)

// ─── Leave Detail Drawer (read-only) ─────────────────────────────────────────

const LeaveDetailDrawer = ({ open, onClose, leaveId }) => {
  const dispatch = useDispatch()
  const { leaveDetail: leave, leaveDetailLoading } = useSelector(state => state.leaves)

  useEffect(() => {
    if (open && leaveId) dispatch(fetchLeaveById(leaveId))
  }, [open, leaveId, dispatch])

  return (
    <Drawer open={open} anchor='right' onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 5, py: 4, borderBottom: theme => `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant='h6'>Leave Request Detail</Typography>
        <IconButton onClick={onClose} size='small'><Icon icon='tabler:x' /></IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ px: 5, py: 4, flex: 1, overflow: 'auto' }}>
        {leaveDetailLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : !leave ? (
          <Alert severity='error'>Failed to load leave details.</Alert>
        ) : (
          <>
            {/* Status banner */}
            <Box sx={{ mb: 4, p: 3, borderRadius: 2, backgroundColor: 'action.hover', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{
                width: 42, height: 42, borderRadius: 1.5, flexShrink: 0,
                backgroundColor: leave.leaveTypeId?.colorCode || '#6B7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Typography variant='caption' fontWeight={700} color='white' fontSize='0.65rem'>
                  {leave.leaveTypeId?.code || '?'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>{leave.leaveTypeId?.name || '—'}</Typography>
                <Typography variant='caption' color='text.secondary'>{leave.duration}</Typography>
              </Box>
              <LeaveStatusChip status={leave.status?.toLowerCase()} />
            </Box>

            {/* Employee */}
            <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 1 }}>Employee</Typography>
            <Box sx={{ mb: 3, p: 3, borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}>
              <Typography fontWeight={600}>{leave.employeeId?.name || '—'}</Typography>
              <Typography variant='caption' color='text.secondary'>{leave.employeeId?.employeeId}</Typography>
            </Box>

            {/* Leave Details */}
            <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 1 }}>Leave Details</Typography>
            <Card variant='outlined' sx={{ mb: 3 }}>
              <CardContent sx={{ py: '8px !important', px: 3 }}>
                <DetailRow label='From'><Typography variant='body2'>{fmt(leave.startDate)}</Typography></DetailRow>
                <Divider />
                <DetailRow label='To'><Typography variant='body2'>{fmt(leave.endDate)}</Typography></DetailRow>
                <Divider />
                <DetailRow label='Total Days'>
                  <Chip label={`${leave.totalDays} day(s)`} size='small' color='primary' variant='tonal' />
                </DetailRow>
                <Divider />
                <DetailRow label='Half Day'>
                  <Typography variant='body2'>{leave.isHalfDay ? `Yes${leave.session ? ` (${leave.session})` : ''}` : 'No'}</Typography>
                </DetailRow>
                <Divider />
                <DetailRow label='Reason'>
                  <Typography variant='body2' sx={{ maxWidth: 220, textAlign: 'right' }}>{leave.reason}</Typography>
                </DetailRow>
                <Divider />
                <DetailRow label='Applied On'>
                  <Typography variant='body2'>{fmt(leave.createdAt)}</Typography>
                </DetailRow>
              </CardContent>
            </Card>

            {/* Approval History */}
            {leave.approvalHistory?.length > 0 && (
              <>
                <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 1 }}>Approval History</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  {leave.approvalHistory.map((h, i) => (
                    <Box key={i} sx={{ p: 3, borderRadius: 2, border: theme => `1px solid ${theme.palette.divider}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant='body2' fontWeight={600}>{h.approverName || h.approverId}</Typography>
                        <LeaveStatusChip status={h.status?.toLowerCase()} />
                      </Box>
                      {h.comment && <Typography variant='caption' color='text.secondary'>{h.comment}</Typography>}
                      <Typography variant='caption' color='text.disabled' sx={{ display: 'block', mt: 0.5 }}>{fmt(h.actionAt)}</Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </>
        )}
      </Box>
      {/* No footer actions — read-only */}
    </Drawer>
  )
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

const TabLeaveApproval = () => {
  const dispatch = useDispatch()

  // Detail drawer state
  const [detailOpen,    setDetailOpen]    = useState(false)
  const [detailLeaveId, setDetailLeaveId] = useState(null)

  // Action dialog state
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionLeaveId,    setActionLeaveId]    = useState(null)
  const [actionType,       setActionType]        = useState('') // 'approve' or 'reject'
  const [remarks,          setRemarks]           = useState('')
  const [snackbar,         setSnackbar]          = useState({ open: false, message: '', severity: 'success' })

  const { pendingApprovalsRows: rows, pendingApprovalsLoading: loading, pendingApprovalsError: error, actionLoading } =
    useSelector(state => state.leaves)

  useEffect(() => {
    console.log('[TabLeaveApproval] Dispatching fetchPendingApprovals')
    dispatch(fetchPendingApprovals())
  }, [dispatch])

  // Debug output
  useEffect(() => {
    console.log('[TabLeaveApproval] State:', { rows, loading, error, rowCount: rows?.length })
  }, [rows, loading, error])

  const openDetail = (id) => { setDetailLeaveId(id); setDetailOpen(true) }

  const handleAction = (id, type) => {
    setActionLeaveId(id)
    setActionType(type)
    setRemarks('')
    setActionDialogOpen(true)
  }

  const submitAction = async () => {
    if (!actionLeaveId || !actionType) return

    try {
      const status = actionType === 'approve' ? 'APPROVED' : 'REJECTED'
      await dispatch(updateLeaveStatus({ id: actionLeaveId, status, remarks })).unwrap()
      setSnackbar({ open: true, message: `Leave request ${actionType}d successfully`, severity: 'success' })
      setActionDialogOpen(false)
      dispatch(fetchPendingApprovals()) // Refresh list
    } catch (err) {
      setSnackbar({ open: true, message: err || 'Failed to update status', severity: 'error' })
    }
  }

  const columns = [
    {
      field: '_id', headerName: '#', width: 80,
      renderCell: params => (
        <Typography variant='body2' color='text.secondary'>
          {String(params.row._id).slice(-6).toUpperCase()}
        </Typography>
      )
    },
    {
      field: 'employee', headerName: 'Employee', flex: 1.2,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant='body2' fontWeight={600}>
            {row.employeeId?.name || '—'}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {row.employeeId?.employeeId || ''}
          </Typography>
        </Box>
      )
    },
    {
      field: 'leaveType', headerName: 'Type', flex: 1,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.leaveTypeId?.colorCode || '#6B7280', flexShrink: 0 }} />
          <Typography variant='body2'>{row.leaveTypeId?.name || '—'}</Typography>
        </Box>
      )
    },
    {
      field: 'startDate', headerName: 'From', flex: 1,
      renderCell: ({ row }) => fmt(row.startDate)
    },
    {
      field: 'endDate', headerName: 'To', flex: 1,
      renderCell: ({ row }) => fmt(row.endDate)
    },
    {
      field: 'totalDays', headerName: 'Days', width: 80,
      renderCell: ({ row }) => <Chip label={`${row.totalDays}d`} size='small' variant='tonal' color='primary' />
    },
    {
      field: 'l1Status', headerName: 'L1 Status', width: 110,
      renderCell: ({ row }) => <LeaveStatusChip status={row.l1Status?.toLowerCase()} />
    },
    {
      field: 'l2Status', headerName: 'L2 Status', width: 110,
      renderCell: ({ row }) => <LeaveStatusChip status={row.l2Status?.toLowerCase()} />
    },
    {
      field: 'actions', headerName: 'Actions', width: 200, sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title='View Detail'>
            <IconButton size='small' onClick={() => openDetail(row._id)}>
              <Icon icon='tabler:eye' fontSize='1.1rem' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Approve'>
            <IconButton size='small' color='success' onClick={() => handleAction(row._id, 'approve')}>
              <Icon icon='tabler:check' fontSize='1.1rem' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Reject'>
            <IconButton size='small' color='error' onClick={() => handleAction(row._id, 'reject')}>
              <Icon icon='tabler:x' fontSize='1.1rem' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    },
  ]

  return (
    <>
      <Card>
        <CardHeader 
          title='Pending Leave Approvals' 
          subheader='Leave requests awaiting your approval'
        />
        <CardContent>
          {error && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
          ) : rows && rows.length > 0 ? (
            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              getRowId={row => row._id}
              paginationModel={{ page: 0, pageSize: 10 }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
            />
          ) : (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Icon icon='tabler:inbox' fontSize='3rem' color='text.disabled' />
              <Typography variant='body1' color='text.secondary' sx={{ mt: 2 }}>
                No pending approvals
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <LeaveDetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        leaveId={detailLeaveId}
      />

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Remarks (Optional)'
            fullWidth
            multiline
            rows={3}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder='Add any comments or reasoning...'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={submitAction} 
            variant='contained' 
            color={actionType === 'approve' ? 'success' : 'error'}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default TabLeaveApproval