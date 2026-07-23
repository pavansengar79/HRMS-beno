// src/views/leavemanagement/TabLeaveRequests.jsx
import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Drawer from '@mui/material/Drawer'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import Avatar from '@mui/material/Avatar'
import { DataGrid } from '@mui/x-data-grid'

import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAvatar from 'src/@core/components/mui/avatar'

import {
  fetchMyLeaves,
  applyLeave,
  fetchLeaveTypes,
  updateLeaveStatus,
  fetchMyBalance,
} from 'src/store/leaves/leaveSlice'
import { selectPermissions, selectRoleSlug } from 'src/store/auth/authSlice'
import { getAvatarUrl, getInitials } from 'src/utils/employeeAvatar'

const fmtDate = date => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getLeaveTypeLabel = row => {
  const leaveType = row.leaveTypeId || row.leaveType
  if (!leaveType) return '—'
  return typeof leaveType === 'string' ? leaveType : leaveType.name || leaveType.code || '—'
}

const getLeaveTypeColor = row => row.leaveTypeId?.colorCode || row.leaveType?.colorCode || '#6B7280'

const getTotalDays = row => row.totalDays ?? row.days ?? row.duration ?? '—'

const getReason = row => row.reason || row.leaveReason || row.description || '—'

// ─── Status Chip ──────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  pending:   'warning',
  approved:  'success',
  rejected:  'error',
  cancelled: 'default',
}

const LeaveStatusChip = ({ status = '' }) => (
  <Chip
    size='small'
    label={status.charAt(0).toUpperCase() + status.slice(1)}
    color={STATUS_COLOR[status.toLowerCase()] || 'default'}
    variant='tonal'
  />
)

// ─── Action Dialog (Approve / Reject) ────────────────────────────────────────

const ActionDialog = ({ open, onClose, onConfirm, action, loading }) => {
  const [comment, setComment] = useState('')

  const handleConfirm = () => { onConfirm(comment); setComment('') }
  const handleClose   = () => { setComment(''); onClose() }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='h6'>{action === 'APPROVED' ? 'Approve Leave' : 'Reject Leave'}</Typography>
        <IconButton onClick={handleClose} size='small'><Icon icon='tabler:x' /></IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth multiline rows={3}
          label='Comment (optional)'
          placeholder={action === 'APPROVED' ? 'e.g. Approved. Enjoy your leave.' : 'e.g. Team unavailable during this period.'}
          value={comment}
          onChange={e => setComment(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 4, gap: 2 }}>
        <Button variant='tonal' color='secondary' onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          variant='contained'
          color={action === 'APPROVED' ? 'success' : 'error'}
          onClick={handleConfirm}
          disabled={loading}
          startIcon={loading
            ? <CircularProgress size={16} color='inherit' />
            : <Icon icon={action === 'APPROVED' ? 'tabler:check' : 'tabler:x'} />
          }
        >
          {loading ? 'Processing...' : action === 'APPROVED' ? 'Approve' : 'Reject'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Apply Leave Drawer ───────────────────────────────────────────────────────

const ApplyLeaveDrawer = ({ open, toggle, onSuccess, leaveTypes }) => {
  const dispatch = useDispatch()
  const [saving, setSaving] = useState(false)
  const [form, setForm]     = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' })
  const [errors, setErrors] = useState({})

  const handleChange = field => e => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.leaveTypeId)     errs.leaveTypeId = 'Select a leave type'
    if (!form.startDate)       errs.startDate   = 'Start date is required'
    if (!form.endDate)         errs.endDate     = 'End date is required'
    if (!form.reason.trim())   errs.reason      = 'Reason is required'
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      errs.endDate = 'End date cannot be before start date'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      await dispatch(applyLeave(form)).unwrap()
      toast.success('Leave applied successfully')
      setForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' })
      toggle()
      onSuccess?.()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to apply leave')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' })
    setErrors({})
    toggle()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 460 } } }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 5, py: 4, borderBottom: theme => `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant='h6'>Apply Leave</Typography>
        <IconButton onClick={handleClose} size='small'><Icon icon='tabler:x' /></IconButton>
      </Box>

      <Box sx={{ px: 5, py: 4, display: 'flex', flexDirection: 'column', gap: 5, overflow: 'auto', flex: 1 }}>
        <CustomTextField
          select
          fullWidth
          label='Leave Type *'
          value={form.leaveTypeId}
          onChange={handleChange('leaveTypeId')}
          error={!!errors.leaveTypeId}
          helperText={errors.leaveTypeId}
        >
          {leaveTypes.map(lt => (
            <MenuItem key={lt._id} value={lt._id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 10, height: 10, borderRadius: '50%',
                  bgcolor: lt.colorCode || '#6B7280', flexShrink: 0
                }} />
                {lt.name} ({lt.code})
              </Box>
            </MenuItem>
          ))}
        </CustomTextField>

        <Grid container spacing={4}>
          <Grid item xs={6}>
            <CustomTextField
              fullWidth
              type='date'
              label='Start Date *'
              value={form.startDate}
              onChange={handleChange('startDate')}
              error={!!errors.startDate}
              helperText={errors.startDate}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField
              fullWidth
              type='date'
              label='End Date *'
              value={form.endDate}
              onChange={handleChange('endDate')}
              error={!!errors.endDate}
              helperText={errors.endDate}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <CustomTextField
          fullWidth
          multiline
          rows={4}
          label='Reason *'
          placeholder='Enter reason for leave...'
          value={form.reason}
          onChange={handleChange('reason')}
          error={!!errors.reason}
          helperText={errors.reason}
        />
      </Box>

      <Box sx={{
        px: 5, py: 4, display: 'flex', gap: 3, justifyContent: 'flex-end',
        borderTop: theme => `1px solid ${theme.palette.divider}`
      }}>
        <Button variant='tonal' color='secondary' onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}
        >
          {saving ? 'Submitting...' : 'Submit'}
        </Button>
      </Box>
    </Drawer>
  )
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

const TabLeaveRequests = () => {
  const dispatch = useDispatch()
  const [drawerOpen, setDrawerOpen]           = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  // Action dialog state
  const [dialogOpen,   setDialogOpen]   = useState(false)
  const [dialogAction, setDialogAction] = useState('APPROVED')
  const [selectedId,   setSelectedId]   = useState(null)

  const { leavesRows: rows, leavesTotal: total, loading, actionLoading } = useSelector(state => state.leaves)
  const leaveTypes  = useSelector(state => state.leaves.balancedLeaveTypes) || []

  const permissions = useSelector(selectPermissions) || []
  const roleSlug    = useSelector(selectRoleSlug)    || ''

  // HR manager check — same logic as TabLeaveApproval
  const isHrManager = roleSlug === 'hr_manager' || permissions.includes('leave.update')

  console.log("leaveTypes",leaveTypes)

  const loadLeaves = useCallback(() => {
    dispatch(fetchMyLeaves({ page: paginationModel.page + 1, limit: paginationModel.pageSize }))
  }, [dispatch, paginationModel])

  useEffect(() => { loadLeaves() }, [loadLeaves])

  useEffect(() => {
    if (!leaveTypes.length) dispatch(fetchMyBalance())
  }, [dispatch, leaveTypes.length])

  const openAction = (id, action) => {
    setSelectedId(id)
    setDialogAction(action)
    setDialogOpen(true)
  }

  const handleConfirm = async (comment) => {
    try {
      await dispatch(updateLeaveStatus({ id: selectedId, status: dialogAction, remarks: comment })).unwrap()
      toast.success(`Leave ${dialogAction === 'APPROVED' ? 'approved' : 'rejected'} successfully`)
      setDialogOpen(false)
      loadLeaves()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Action failed')
    }
  }

  const columns = [
    // {
    //   field: '_id',
    //   headerName: '#',
    //   width: 80,
    //   renderCell: params => (
    //     <Typography variant='body2' color='text.secondary'>
    //       {String(params.row._id).slice(-6).toUpperCase()}
    //     </Typography>
    //   )
    // },
    {
      field: 'employeeId',
      headerName: 'Employee',
      flex: 1.5,
      renderCell: ({ row }) => {
        const emp = row.employeeId
        if (!emp) return <Typography variant='body2'>—</Typography>
        const avatarUrl = getAvatarUrl(emp)
        const initials = getInitials(emp.name)
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {avatarUrl ? (
              <Avatar src={avatarUrl} alt={emp.name} sx={{ width: 32, height: 32 }} />
            ) : (
              <CustomAvatar skin='light' color='primary' sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                {initials}
              </CustomAvatar>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant='body2' fontWeight={600} noWrap>{emp.name || '—'}</Typography>
              <Typography variant='caption' color='text.secondary' noWrap>{emp.employeeId || ''}</Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      field: 'leaveType',
      headerName: 'Type',
      flex: 1,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 8, height: 8, borderRadius: '50%',
            bgcolor: getLeaveTypeColor(row), flexShrink: 0
          }} />
          <Typography variant='body2'>{getLeaveTypeLabel(row)}</Typography>
        </Box>
      )
    },
    {
      field: 'startDate',
      headerName: 'From',
      flex: 1,
      renderCell: ({ row }) => (
        <Typography variant='body2'>{fmtDate(row.startDate || row.fromDate)}</Typography>
      )
    },
    {
      field: 'endDate',
      headerName: 'To',
      flex: 1,
      renderCell: ({ row }) => (
        <Typography variant='body2'>{fmtDate(row.endDate || row.toDate)}</Typography>
      )
    },
    {
      field: 'totalDays',
      headerName: 'Days',
      width: 80,
      renderCell: ({ row }) => (
        <Chip label={`${getTotalDays(row)}d`} size='small' variant='tonal' color='primary' />
      )
    },
    // {
    //   field: 'l1Status',
    //   headerName: 'L1 Status',
    //   width: 110,
    //   renderCell: ({ row }) => {
    //     const status = (row.l1Status || '').toLowerCase()
    //     if (!status || status === 'null') return <Chip label='—' size='small' variant='outlined' />
    //     return <LeaveStatusChip status={status} />
    //   }
    // },
    // {
    //   field: 'l2Status',
    //   headerName: 'L2 Status',
    //   width: 110,
    //   renderCell: ({ row }) => {
    //     const status = (row.l2Status || '').toLowerCase()
    //     if (!status || status === 'null') return <Chip label='—' size='small' variant='outlined' />
    //     return <LeaveStatusChip status={status} />
    //   }
    // },
    {
      field: 'status',
      headerName: 'Final Status',
      flex: 1,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <LeaveStatusChip status={(row.status || row.state || '').toString().toLowerCase()} />
          {row.isActionable && (
            <Chip 
              label='Actionable' 
              size='small' 
              color='warning' 
              variant='outlined'
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          )}
        </Box>
      )
    },
    {
      field: 'approvals',
      headerName: 'Approval History',
      flex: 1.2,
      renderCell: ({ row }) => {
        const history = row.approvalHistory || []
        if (history.length === 0) return <Typography variant='caption' color='text.disabled'>No approvals</Typography>
        
        return (
          <Tooltip 
            title={
              <Box sx={{ p: 1 }}>
                {history.map((h, i) => (
                  <Box key={i} sx={{ mb: i < history.length - 1 ? 1 : 0 }}>
                    <Typography variant='caption' fontWeight={600}>
                      L{h.level}: {h.approverName}
                    </Typography>
                    <Typography variant='caption' display='block' color='text.secondary'>
                      {h.action} • {h.comment || 'No comment'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon='tabler:history' fontSize='1rem' />
              <Typography variant='caption'>
                {history.length} step{history.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          </Tooltip>
        )
      }
    },
    {
      field: 'reason',
      headerName: 'Reason',
      flex: 1.2,
      renderCell: ({ row }) => (
        <Tooltip title={getReason(row)}>
          <Typography variant='body2' noWrap sx={{ maxWidth: 150 }}>{getReason(row)}</Typography>
        </Tooltip>
      )
    },
    // ── HR-only actions column ─────────────────
    ...(isHrManager ? [{
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: ({ row }) => {
        // FIXED: Allow approval for both PENDING and UNDER_REVIEW status
        const status = (row.status || row.state || '').toString().toLowerCase()
        const canApprove = status === 'pending' || status === 'under_review'
        if (!canApprove) return null
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title='Approve'>
              <IconButton size='small' color='success' onClick={() => openAction(row._id, 'APPROVED')}>
                <Icon icon='tabler:check' fontSize='1.1rem' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Reject'>
              <IconButton size='small' color='error' onClick={() => openAction(row._id, 'REJECTED')}>
                <Icon icon='tabler:x' fontSize='1.1rem' />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    }] : []),
  ]

  return (
    <>
      <Card>
        <CardHeader
          title='My Leave Requests'
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
            getRowId={row => row._id ?? row.id}
            loading={loading}
            rowCount={total}
            paginationMode='server'
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      <ApplyLeaveDrawer
        open={drawerOpen}
        toggle={() => setDrawerOpen(prev => !prev)}
        onSuccess={loadLeaves}
        leaveTypes={leaveTypes}
      />

      <ActionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirm}
        action={dialogAction}
        loading={actionLoading}
      />
    </>
  )
}

export default TabLeaveRequests