// src/pages/pages/pricing/TrialExtensionHistory.js
import { Box, Typography, Chip, Paper } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'

const STATUS_COLORS = {
  Pending: { bg: '#FFF7ED', color: '#EA580C' },
  Approved: { bg: '#ECFDF5', color: '#059669' },
  Rejected: { bg: '#FEF2F2', color: '#DC2626' }
}

export default function TrialExtensionHistory({ requests }) {
  const theme = useTheme()

  if (!requests || requests.length === 0) {
    return null
  }

  return (
    <Paper variant='outlined' sx={{ p: 4, mt: 6 }}>
      <Typography variant='h6' fontWeight={700} sx={{ mb: 4 }}>
        Extension Request History
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {requests.map((req) => (
          <Box
            key={req._id}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant='subtitle2' fontWeight={600}>
                  {req.requested_days} days requested
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {new Date(req.requested_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
              <Chip
                label={req.status}
                size='small'
                sx={{
                  bgcolor: STATUS_COLORS[req.status]?.bg,
                  color: STATUS_COLORS[req.status]?.color,
                  fontWeight: 700
                }}
              />
            </Box>

            {req.reason && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='caption' color='text.secondary'>
                  Reason:
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {req.reason}
                </Typography>
              </Box>
            )}

            {req.review_note && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant='caption' color='text.secondary'>
                  Admin Note:
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  {req.review_note}
                </Typography>
              </Box>
            )}

            {req.reviewed_by && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon='tabler:user' fontSize='0.9rem' color='text.secondary' />
                <Typography variant='caption' color='text.secondary'>
                  Reviewed by {req.reviewed_by?.name || 'Admin'} •{' '}
                  {req.reviewed_at ? new Date(req.reviewed_at).toLocaleDateString('en-IN') : '-'}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  )
}
