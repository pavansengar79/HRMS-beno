// src/views/policy/PolicyVersionHistoryDialog.js
// Dialog to display policy version history with detailed view
import { useState, useEffect } from 'react'
import { useTheme, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Icon from 'src/@core/components/icon'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import axiosRequest from 'src/utils/AxiosInterceptor'

const ACTION_CONFIG = {
  CREATE:   { color: '#0ea5e9', icon: 'tabler:file-plus',      label: 'Created',    bgColor: alpha('#0ea5e9', 0.1) },
  UPDATE:   { color: '#f59e0b', icon: 'tabler:edit',           label: 'Updated',    bgColor: alpha('#f59e0b', 0.1) },
  ACTIVATE: { color: '#10b981', icon: 'tabler:circle-check',   label: 'Activated',  bgColor: alpha('#10b981', 0.1) },
  ARCHIVE:  { color: '#ef4444', icon: 'tabler:archive',         label: 'Archived',   bgColor: alpha('#ef4444', 0.1) }
}

const fmtDate = (s) =>
  s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const fmtTime = (s) =>
  s ? new Date(s).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

export default function PolicyVersionHistoryDialog({ open, onClose, policyId, policyType, policyName }) {
  const theme = useTheme()
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || !policyType || !policyId) return

    const fetchVersions = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await axiosRequest.get(`/api/v1/policy-versions/${policyType}/${policyId}`)
        setVersions(res?.data || [])
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Failed to fetch version history')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchVersions()
  }, [policyType, policyId, open])

  const handleClose = () => {
    setVersions([])
    setError(null)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: { minHeight: 400, maxHeight: 700 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            Version History
          </Typography>
          {policyName && (
            <Typography variant='caption' color='text.secondary'>
              {policyName}
            </Typography>
          )}
        </Box>
        <IconButton size='small' onClick={handleClose} sx={{ borderRadius: 1 }}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 2 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}

        {!loading && !error && versions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Icon icon='tabler:file-description' fontSize={48} style={{ color: theme.palette.text.disabled, marginBottom: 8 }} />
            <Typography variant='body2' color='text.secondary'>
              No version history available
            </Typography>
          </Box>
        )}

        {!loading && !error && versions.length > 0 && (
          <Timeline position='alternate'>
            {versions.map((version, index) => {
              const actionConfig = ACTION_CONFIG[version.action] || ACTION_CONFIG.UPDATE
              const isLatest = index === 0

              return (
                <TimelineItem key={version._id || index}>
                  <TimelineOppositeContent sx={{ m: 'auto 0' }}>
                    <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                      {fmtDate(version.createdAt)}
                    </Typography>
                    <Typography variant='caption' display='block' color='text.disabled' sx={{ fontSize: 11 }}>
                      {fmtTime(version.createdAt)}
                    </Typography>
                  </TimelineOppositeContent>

                  <TimelineSeparator>
                    <TimelineDot
                      sx={{
                        boxShadow: 0,
                        animation: 'none',
                        bgcolor: actionConfig.bgColor,
                        color: actionConfig.color
                      }}
                    >
                      <Icon icon={actionConfig.icon} fontSize={18} />
                    </TimelineDot>
                    {index < versions.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>

                  <TimelineContent sx={{ py: 0.5, px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={actionConfig.label}
                        size='small'
                        sx={{
                          fontSize: 10,
                          height: 20,
                          fontWeight: 700,
                          bgcolor: actionConfig.bgColor,
                          color: actionConfig.color,
                          border: 'none'
                        }}
                      />
                      {isLatest && (
                        <Chip
                          label='LATEST'
                          size='small'
                          color='primary'
                          sx={{ fontSize: 9, height: 18, fontWeight: 700 }}
                        />
                      )}
                      {version.version && (
                        <Typography variant='overline' sx={{ fontSize: 10, color: 'text.disabled' }}>
                          v{version.version}
                        </Typography>
                      )}
                    </Box>

                    <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                      {version.performedBy?.name || version.performedBy?.email || 'Unknown User'}
                    </Typography>

                    {version.changeNote && (
                      <Box sx={{ mb: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant='caption' sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          "{version.changeNote}"
                        </Typography>
                      </Box>
                    )}

                    {version.changes && version.changes.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant='caption' color='text.disabled' sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                          Modified fields:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {version.changes.map((change, i) => (
                            <Chip
                              key={i}
                              label={change.field}
                              size='small'
                              variant='outlined'
                              sx={{ fontSize: 10, height: 18 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </TimelineContent>
                </TimelineItem>
              )
            })}
          </Timeline>
        )}
      </DialogContent>

      <Divider />

      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='caption' color='text.disabled'>
          {versions.length} version{versions.length !== 1 ? 's' : ''} recorded
        </Typography>
        <IconButton size='small' onClick={handleClose} sx={{ borderRadius: 1 }}>
          <Typography variant='caption' sx={{ mr: 0.5 }}>Close</Typography>
          <Icon icon='tabler:chevron-right' fontSize='1rem' />
        </IconButton>
      </Box>
    </Dialog>
  )
}
