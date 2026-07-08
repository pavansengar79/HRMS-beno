// src/views/policy/PolicyVersionHistory.js
// REAL API — GET /api/v1/policy-versions/:policyType/:policyId
// Displays version history for Leave, Attendance, Payroll policies
import { useState, useEffect } from 'react'
import { useTheme, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import axiosRequest from 'src/utils/AxiosInterceptor'

const ACTION_CONFIG = {
  CREATE:   { color: '#0ea5e9', icon: 'tabler:file-plus',      label: 'Created' },
  UPDATE:   { color: '#f59e0b', icon: 'tabler:edit',           label: 'Updated' },
  ACTIVATE: { color: '#10b981', icon: 'tabler:circle-check',   label: 'Activated' },
  ARCHIVE:  { color: '#ef4444', icon: 'tabler:archive',         label: 'Archived' }
}

const fmtDate = (s) =>
  s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const fmtTime = (s) =>
  s ? new Date(s).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

export default function PolicyVersionHistory({ policyType, policyId, policyName }) {
  const theme = useTheme()
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!policyType || !policyId) return

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
  }, [policyType, policyId])

  if (!policyType || !policyId) {
    return (
      <Alert severity='warning' sx={{ m: 4 }}>
        No policy selected. Please select a policy to view version history.
      </Alert>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error' sx={{ m: 4 }}>{error}</Alert>
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader title={`${policyName || 'Policy'} Version History`} />
        <CardContent>
          <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
            No version history available
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title={`${policyName || 'Policy'} Version History`}
        subheader={`${versions.length} version${versions.length !== 1 ? 's' : ''} recorded`}
      />
      <CardContent>
        <Timeline position='alternate'>
          {versions.map((version, index) => {
            const actionConfig = ACTION_CONFIG[version.action] || ACTION_CONFIG.UPDATE
            const isLatest = index === 0

            return (
              <TimelineItem key={version._id || index}>
                <TimelineOppositeContent sx={{ m: 'auto 0' }}>
                  <Typography variant='caption' color='text.secondary'>
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
                      bgcolor: alpha(actionConfig.color, 0.15),
                      color: actionConfig.color
                    }}
                  >
                    <Icon icon={actionConfig.icon} fontSize={18} />
                  </TimelineDot>
                  {index < versions.length - 1 && <TimelineConnector />}
                </TimelineSeparator>

                <TimelineContent sx={{ py: 0.5, px: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip
                      label={actionConfig.label}
                      size='small'
                      sx={{
                        fontSize: 10,
                        height: 20,
                        fontWeight: 700,
                        bgcolor: alpha(actionConfig.color, 0.1),
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

                  <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {version.performedBy?.name || version.performedBy?.email || 'Unknown User'}
                  </Typography>

                  {version.changeNote && (
                    <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
                      "{version.changeNote}"
                    </Typography>
                  )}

                  {version.changes && version.changes.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant='caption' color='text.disabled' sx={{ fontWeight: 600 }}>
                        Modified fields:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
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
      </CardContent>
    </Card>
  )
}
