import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import { DataGrid } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomChip from 'src/@core/components/mui/chip'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { fetchMyRegularizations, raiseRegularization, cancelRegularization } from 'src/store/attendanceRegularization/regularizationSlice'

// ─── Constants ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING: { color: 'warning', label: 'Pending L1' },
  L1_APPROVED: { color: 'info', label: 'L1 Approved' },
  L2_APPROVED: { color: 'success', label: 'Approved' },
  REJECTED: { color: 'error', label: 'Rejected' },
  CANCELLED: { color: 'secondary', label: 'Cancelled' }
}

const REG_TYPE_LABELS = {
  MISSED_PUNCH_IN: 'Missed Punch In',
  MISSED_PUNCH_OUT: 'Missed Punch Out',
  BOTH_MISSED: 'Both Missed',
  WRONG_TIME: 'Time Correction',
  WFH_CORRECTION: 'WFH Correction',
  STATUS_CORRECTION: 'Status Correction'
}

const REQUESTED_STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'HALF_DAY', label: 'Half Day' },
  { value: 'WFH', label: 'Work From Home' },
  { value: 'ON_LEAVE', label: 'On Leave' }
]

// ─── Form Schema ────────────────────────────────────────────────────────────

const schema = yup.object().shape({
  date: yup.string().required('Date is required'),
  regularizationType: yup.string().required('Type is required'),
  requestedStatus: yup.string().required('Status is required'),
  requestedCheckIn: yup.string().when('regularizationType', {
    is: val => ['MISSED_PUNCH_IN', 'BOTH_MISSED', 'WRONG_TIME'].includes(val),
    then: schema => schema.required('Check-in time is required')
  }),
  requestedCheckOut: yup.string().when('regularizationType', {
    is: val => ['MISSED_PUNCH_OUT', 'BOTH_MISSED', 'WRONG_TIME'].includes(val),
    then: schema => schema.required('Check-out time is required')
  }),
  reason: yup.string().required('Reason is required').min(10, 'Reason must be at least 10 characters'),
  leaveTypeId: yup.string().when('requestedStatus', {
    is: 'ON_LEAVE',
    then: schema => schema.required('Leave type is required when requesting leave')
  })
})

// ─── Main Component ──────────────────────────────────────────────────────────

const RegularizationPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { myRequests, loading } = useSelector(state => state.regularization || { myRequests: [] })
  const [rows, setRows] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(null)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [leaveTypes, setLeaveTypes] = useState([])
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)

  const {
    reset,
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      date: '',
      regularizationType: 'MISSED_PUNCH_IN',
      requestedStatus: 'PRESENT',
      requestedCheckIn: '09:00',
      requestedCheckOut: '18:00',
      reason: '',
      leaveTypeId: ''
    },
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const regularizationType = watch('regularizationType')
  const requestedStatus = watch('requestedStatus')

  // Fetch leave types on mount
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await axiosRequest.get('/api/v1/leave-types')
        if (response?.data) {
          setLeaveTypes(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch leave types:', error)
      }
    }
    fetchLeaveTypes()
  }, [])

  useEffect(() => {
    const params = {}
    if (filterStatus) params.status = filterStatus
    if (filterMonth) params.month = filterMonth
    dispatch(fetchMyRegularizations(params))
  }, [dispatch, filterStatus, filterMonth])

  useEffect(() => {
    setRows(Array.isArray(myRequests) ? myRequests : [])
  }, [myRequests])

  const handleDialogOpen = () => {
    reset({
      date: new Date().toISOString().split('T')[0],
      regularizationType: 'MISSED_PUNCH_IN',
      requestedStatus: 'PRESENT',
      requestedCheckIn: '09:00',
      requestedCheckOut: '18:00',
      reason: '',
      leaveTypeId: ''
    })
    setAttachments([])
    setDialogOpen(true)
  }

  const handleFileUpload = async event => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async file => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'hrms_uploads')

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: 'POST',
            body: formData
          }
        )
        const data = await response.json()
        return data.secure_url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setAttachments(prev => [...prev, ...uploadedUrls])
      toast.success(`${uploadedUrls.length} file(s) uploaded`)
    } catch (error) {
      toast.error('File upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeAttachment = index => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async data => {
    try {
      const dateStr = data.date
      const payload = {
        date: dateStr,
        regularizationType: data.regularizationType,
        requestedStatus: data.requestedStatus,
        reason: data.reason,
        attachments
      }

      // Build ISO datetime strings for requested times
      if (['MISSED_PUNCH_IN', 'BOTH_MISSED', 'WRONG_TIME'].includes(data.regularizationType)) {
        payload.requestedCheckIn = new Date(`${dateStr}T${data.requestedCheckIn}`).toISOString()
      }
      if (['MISSED_PUNCH_OUT', 'BOTH_MISSED', 'WRONG_TIME'].includes(data.regularizationType)) {
        payload.requestedCheckOut = new Date(`${dateStr}T${data.requestedCheckOut}`).toISOString()
      }

      // Add leave type if requesting leave
      if (data.requestedStatus === 'ON_LEAVE' && data.leaveTypeId) {
        payload.leaveTypeId = data.leaveTypeId
      }

      await dispatch(raiseRegularization(payload)).unwrap()
      toast.success('Regularization request submitted')
      setDialogOpen(false)
      setAttachments([])
      dispatch(fetchMyRegularizations({ status: filterStatus, month: filterMonth }))
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed to submit request')
    }
  }

  const handleCancel = async () => {
    if (!cancelDialog) return
    try {
      await dispatch(cancelRegularization(cancelDialog._id)).unwrap()
      toast.success('Request cancelled')
      setCancelDialog(null)
      dispatch(fetchMyRegularizations())
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to cancel')
    }
  }

  const columns = [
    {
      flex: 0.12,
      minWidth: 100,
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
      flex: 0.15,
      minWidth: 120,
      field: 'requestedCheckIn',
      headerName: 'Check In',
      renderCell: ({ row }) => (
        <Typography variant='body2'>
          {row.requestedCheckIn ? new Date(row.requestedCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        </Typography>
      )
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'requestedCheckOut',
      headerName: 'Check Out',
      renderCell: ({ row }) => (
        <Typography variant='body2'>
          {row.requestedCheckOut ? new Date(row.requestedCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        </Typography>
      )
    },
    {
      flex: 0.12,
      minWidth: 110,
      field: 'approvalStatus',
      headerName: 'Approval',
      renderCell: ({ row }) => {
        const config = STATUS_CONFIG[row.approvalStatus] || STATUS_CONFIG.PENDING
        return (
          <CustomChip
            size='small'
            skin='light'
            label={config.label}
            color={config.color}
          />
        )
      }
    },
    {
      flex: 0.15,
      minWidth: 130,
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: ({ row }) => (
        row.approvalStatus === 'PENDING' ? (
          <Button
            size='small'
            variant='outlined'
            color='error'
            onClick={() => setCancelDialog(row)}
            startIcon={<Icon icon='tabler:x' />}
          >
            Cancel
          </Button>
        ) : null
      )
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='My Regularization Requests'
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
                  <MenuItem value='APPROVED'>Approved</MenuItem>
                  <MenuItem value='REJECTED'>Rejected</MenuItem>
                  <MenuItem value='CANCELLED'>Cancelled</MenuItem>
                </CustomTextField>
                
                <CustomTextField
                  type='month'
                  size='small'
                  label='Month'
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  sx={{ width: 150 }}
                  InputLabelProps={{ shrink: true }}
                />
                
                <Button
                  variant='contained'
                  startIcon={<Icon icon='tabler:plus' />}
                  onClick={handleDialogOpen}
                >
                  Request Regularization
                </Button>
              </Box>
            }
          />
          <Divider />
          <CardContent>
            <Box sx={{ mb: 4 }}>
              <Typography variant='caption' color='text.secondary'>
                Submit regularisation requests for missed punch-in/out, time corrections, or other attendance adjustments.
                Requests follow L1 → L2 approval flow as configured in company settings.
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

      {/* Add Request Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Raise Regularization Request</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='date'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='date'
                      label='Date'
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.date}
                      helperText={errors.date?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='regularizationType'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      select
                      label='Regularization Type'
                      error={!!errors.regularizationType}
                      helperText={errors.regularizationType?.message}
                    >
                      {Object.entries(REG_TYPE_LABELS).map(([value, label]) => (
                        <MenuItem key={value} value={value}>{label}</MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='requestedStatus'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      select
                      label='Requested Status'
                      error={!!errors.requestedStatus}
                      helperText={errors.requestedStatus?.message}
                    >
                      {REQUESTED_STATUS_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
              
              {/* Leave Type Selection - Show when requesting ON_LEAVE */}
              {requestedStatus === 'ON_LEAVE' && (
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='leaveTypeId'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        select
                        label='Leave Type'
                        error={!!errors.leaveTypeId}
                        helperText={errors.leaveTypeId?.message || 'Select leave type for this request'}
                      >
                        {leaveTypes.map(lt => (
                          <MenuItem key={lt._id} value={lt._id}>{lt.name}</MenuItem>
                        ))}
                      </CustomTextField>
                    )}
                  />
                </Grid>
              )}
              
              {/* Check In Time */}
              {['MISSED_PUNCH_IN', 'BOTH_MISSED', 'WRONG_TIME'].includes(regularizationType) && (
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='requestedCheckIn'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='time'
                        label='Requested Check In'
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.requestedCheckIn}
                        helperText={errors.requestedCheckIn?.message}
                      />
                    )}
                  />
                </Grid>
              )}
              
              {/* Check Out Time */}
              {['MISSED_PUNCH_OUT', 'BOTH_MISSED', 'WRONG_TIME'].includes(regularizationType) && (
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='requestedCheckOut'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='time'
                        label='Requested Check Out'
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.requestedCheckOut}
                        helperText={errors.requestedCheckOut?.message}
                      />
                    )}
                  />
                </Grid>
              )}
              
              {/* Reason */}
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
                      label='Reason'
                      error={!!errors.reason}
                      helperText={errors.reason?.message || 'Minimum 10 characters'}
                    />
                  )}
                />
              </Grid>
              
              {/* Attachments */}
              <Grid item xs={12}>
                <Typography variant='subtitle2' sx={{ mb: 2 }}>Attachments (Optional)</Typography>
                <Button
                  variant='outlined'
                  component='label'
                  startIcon={<Icon icon='tabler:upload' />}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                  <input
                    type='file'
                    hidden
                    multiple
                    accept='image/*,.pdf,.doc,.docx'
                    onChange={handleFileUpload}
                  />
                </Button>
                
                {attachments.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {attachments.map((url, index) => (
                      <Chip
                        key={index}
                        label={url.split('/').pop().substring(0, 20)}
                        onDelete={() => removeAttachment(index)}
                        color='primary'
                        variant='outlined'
                        icon={<Icon icon='tabler:file' />}
                      />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type='submit' variant='contained' disabled={loading || uploading}>
              Submit Request
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelDialog} onClose={() => setCancelDialog(null)}>
        <DialogTitle>Cancel Request</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this regularization request for {cancelDialog?.date?.split('T')[0]}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(null)}>No, Keep It</Button>
          <Button variant='contained' color='error' onClick={handleCancel}>
            Yes, Cancel Request
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default RegularizationPage
