// src/pages/pages/admin/TrialExtensionQueue.js
import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  Pending: { bg: '#FFF7ED', color: '#EA580C' },
  Approved: { bg: '#ECFDF5', color: '#059669' },
  Rejected: { bg: '#FEF2F2', color: '#DC2626' }
}

export default function TrialExtensionQueue() {
  const theme = useTheme()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Pending')
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [activeTab])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const res = await axiosRequest.get(`/api/v1/subscriptions/trial-extension/requests?status=${activeTab}`)
      setRequests(res?.data || [])
    } catch (err) {
      console.error('Failed to load requests:', err)
      toast.error('Failed to load extension requests')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (request, action) => {
    setSelectedRequest({ ...request, action })
    setReviewNote('')
    setReviewDialogOpen(true)
  }

  const handleConfirmReview = async () => {
    if (!selectedRequest) return

    try {
      setProcessing(true)
      const endpoint = `/api/v1/subscriptions/trial-extension/requests/${selectedRequest._id}/${selectedRequest.action}`

      await axiosRequest.patch(endpoint, { note: reviewNote })

      toast.success(`Request ${selectedRequest.action} successfully`)
      setReviewDialogOpen(false)
      setSelectedRequest(null)
      setReviewNote('')
      await loadRequests()
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.response?.data?.message || 'Failed to process request'
      toast.error(msg)
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  return (
    <Box sx={{ p: 5 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h4' fontWeight={700} sx={{ mb: 2 }}>
          Trial Extension Requests
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Review and manage trial extension requests from organizations
        </Typography>
      </Box>

      <Card>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label='Pending' value='Pending' icon={<Chip label={requests.length} size='small' />} />
          <Tab label='Approved' value='Approved' />
          <Tab label='Rejected' value='Rejected' />
        </Tabs>

        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : requests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Icon icon='tabler:inbox' fontSize={48} color='text.disabled' />
              <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                No {activeTab.toLowerCase()} requests
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell>Requested By</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant='body2' fontWeight={600}>
                            {req.org_id?.name || 'N/A'}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {req.org_id?.slug}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant='body2'>{req.requested_by?.name || 'N/A'}</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {req.requested_by?.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${req.requested_days} days`} size='small' color='primary' variant='outlined' />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ maxWidth: 200 }}>
                          {req.reason || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption' color='text.secondary'>
                          {formatDate(req.requested_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        {req.status === 'Pending' ? (
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Tooltip title='Approve'>
                              <IconButton
                                size='small'
                                color='success'
                                onClick={() => handleReview(req, 'approve')}
                              >
                                <Icon icon='tabler:check' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Reject'>
                              <IconButton size='small' color='error' onClick={() => handleReview(req, 'reject')}>
                                <Icon icon='tabler:x' />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Chip
                            label={req.status}
                            size='small'
                            sx={{
                              bgcolor: STATUS_COLORS[req.status]?.bg,
                              color: STATUS_COLORS[req.status]?.color,
                              fontWeight: 700
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={processing ? undefined : () => setReviewDialogOpen(false)}>
        <DialogTitle>
          {selectedRequest?.action === 'approve' ? 'Approve Extension Request' : 'Reject Extension Request'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant='subtitle2' color='text.secondary'>
              Organization
            </Typography>
            <Typography variant='body1'>{selectedRequest?.org_id?.name}</Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant='subtitle2' color='text.secondary'>
              Days Requested
            </Typography>
            <Typography variant='body1'>{selectedRequest?.requested_days} days</Typography>
          </Box>

          {selectedRequest?.reason && (
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle2' color='text.secondary'>
                Reason
              </Typography>
              <Typography variant='body2'>{selectedRequest.reason}</Typography>
            </Box>
          )}

          <TextField
            label='Note (Optional)'
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder={
              selectedRequest?.action === 'approve'
                ? 'e.g., Approved — reasonable request'
                : 'e.g., Please upgrade to a paid plan'
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 5, pb: 4 }}>
          <Button onClick={() => setReviewDialogOpen(false)} disabled={processing} variant='outlined'>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReview}
            variant='contained'
            color={selectedRequest?.action === 'approve' ? 'success' : 'error'}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={16} /> : null}
          >
            {processing ? 'Processing...' : selectedRequest?.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
