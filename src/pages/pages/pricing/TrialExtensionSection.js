// src/pages/pages/pricing/TrialExtensionSection.js
import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'
import TrialExtensionRequestDialog from './TrialExtensionRequestDialog'
import TrialExtensionHistory from './TrialExtensionHistory'

const MAX_TOTAL_EXTENSION_DAYS = 30

export default function TrialExtensionSection({ currentPlan, orgAdmin }) {
  const theme = useTheme()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (orgAdmin) {
      loadRequests()
    }
  }, [orgAdmin])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const res = await axiosRequest.get('/api/v1/subscriptions/trial-extension/my-requests')
      setRequests(res?.data || [])
    } catch (err) {
      console.error('Failed to load extension requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async (data) => {
    try {
      setSubmitting(true)
      await axiosRequest.post('/api/v1/subscriptions/trial-extension/request', data)
      toast.success('Extension request submitted successfully!')
      setRequestDialogOpen(false)
      await loadRequests()
    } catch (err) {
      const msg =
        typeof err === 'string'
          ? err
          : err?.response?.data?.message || err?.message || 'Failed to submit request'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!orgAdmin) return null

  const isTrial =
    currentPlan?.status?.toLowerCase() === 'trial' || currentPlan?.status?.toLowerCase() === 'trialing'
  if (!isTrial) return null

  const pendingRequest = requests.find((r) => r.status === 'Pending')
  const approvedDays = requests
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + r.requested_days, 0)
  const daysRemaining = MAX_TOTAL_EXTENSION_DAYS - approvedDays

  if (loading) {
    return (
      <Card variant='outlined' sx={{ mt: 6, p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Card>
    )
  }

  return (
    <>
      <Card variant='outlined' sx={{ mt: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant='h6' fontWeight={700}>
                Need More Time?
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Request additional trial days to explore all features
              </Typography>
            </Box>
            {pendingRequest ? (
              <Chip
                label='Request Pending'
                color='warning'
                icon={<Icon icon='tabler:clock' />}
                sx={{ fontWeight: 700 }}
              />
            ) : (
              <Button
                variant='contained'
                startIcon={<Icon icon='tabler:plus' />}
                onClick={() => setRequestDialogOpen(true)}
                disabled={daysRemaining <= 0}
              >
                Request Extension
              </Button>
            )}
          </Box>

          {pendingRequest ? (
            <Alert severity='warning' icon={<Icon icon='tabler:info-circle' />} sx={{ mt: 2 }}>
              You have a pending request for <strong>{pendingRequest.requested_days}</strong> additional days.
              Submitted on {new Date(pendingRequest.requested_at).toLocaleDateString('en-IN')}. Our team will review
              it shortly.
            </Alert>
          ) : (
            <Alert severity='info' icon={<Icon icon='tabler:clock' />}>
              You can request up to <strong>{daysRemaining}</strong> more trial days (max {MAX_TOTAL_EXTENSION_DAYS}{' '}
              total).
            </Alert>
          )}

          {approvedDays > 0 && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant='caption' color='text.secondary'>
                Total extension approved: <strong>{approvedDays}</strong> days
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {requests.length > 0 && <TrialExtensionHistory requests={requests} />}

      <TrialExtensionRequestDialog
        open={requestDialogOpen}
        onClose={() => setRequestDialogOpen(false)}
        onSubmit={handleSubmitRequest}
        loading={submitting}
        daysRemaining={daysRemaining}
      />
    </>
  )
}
