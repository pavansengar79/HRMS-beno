

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'

// ** MUI Lab
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Styled Timeline ──────────────────────────────────────────────────────────
const Timeline = styled(MuiTimeline)({
  padding: 0,
  '& .MuiTimelineItem-root:before': { display: 'none' },
})

// ─── Action config map ────────────────────────────────────────────────────────
// Add new action types here as the product grows — no other file needs changing.
const ACTION_CONFIG = {
  PLAN_OVERRIDE: {
    label:  'Plan Override',
    color:  'warning',
    icon:   'tabler:refresh-alert',
    renderDetails: d => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Chip label={d.from || '—'} size='small' color='secondary' variant='tonal' />
        <Icon icon='tabler:arrow-right' fontSize={14} />
        <Chip label={d.to   || '—'} size='small' color='primary'   variant='tonal' />
        {d.reason && (
          <Typography variant='caption' sx={{ color: 'text.secondary', ml: 0.5 }}>
            · {d.reason}
          </Typography>
        )}
      </Box>
    ),
  },
  TENANT_CREATED: {
    label:  'Tenant Created',
    color:  'success',
    icon:   'tabler:building-plus',
    renderDetails: d => (
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        {d.companyName || d.email || '—'}
      </Typography>
    ),
  },
  TENANT_SUSPENDED: {
    label:  'Tenant Suspended',
    color:  'error',
    icon:   'tabler:building-off',
    renderDetails: d => (
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        Reason: {d.reason || '—'}
      </Typography>
    ),
  },
  TENANT_DELETED: {
    label:  'Tenant Deleted',
    color:  'error',
    icon:   'tabler:trash',
    renderDetails: d => (
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        {d.reason || '—'}
      </Typography>
    ),
  },
  USER_IMPERSONATED: {
    label:  'User Impersonated',
    color:  'info',
    icon:   'tabler:user-check',
    renderDetails: d => (
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        Impersonated: {d.targetEmail || d.targetUser || '—'}
      </Typography>
    ),
  },
  SETTINGS_CHANGED: {
    label:  'Settings Changed',
    color:  'primary',
    icon:   'tabler:settings',
    renderDetails: d => (
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        {d.field ? `${d.field}: ${d.from} → ${d.to}` : JSON.stringify(d)}
      </Typography>
    ),
  },
  // Fallback for unknown future actions
  _DEFAULT: {
    label:  'Action',
    color:  'secondary',
    icon:   'tabler:activity',
    renderDetails: d => (
      <Typography variant='caption' sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
        {JSON.stringify(d)}
      </Typography>
    ),
  },
}

const ALL_ACTION_TYPES = Object.keys(ACTION_CONFIG).filter(k => k !== '_DEFAULT')

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getConfig = action => ACTION_CONFIG[action] || ACTION_CONFIG._DEFAULT

const formatDate = iso => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

const relativeTime = iso => {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return formatDate(iso)
}

// ─── Single Log Item ──────────────────────────────────────────────────────────

const LogItem = ({ log, isLast }) => {
  const config    = getConfig(log.action)
  const company   = log.targetTenantId?.companyName || '—'
  const actor     = log.actorEmail || log.actor?.email || 'System'

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot color={config.color} sx={{ p: 1 }}>
          <Icon icon={config.icon} fontSize={16} />
        </TimelineDot>
        {!isLast && <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent sx={{ mb: isLast ? 0 : 4, pb: 0 }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant='body1' sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {config.label}
            </Typography>
            <Chip
              label={log.action}
              size='small'
              sx={{
                height: 18, fontSize: '0.65rem',
                fontFamily: 'monospace',
                bgcolor: 'action.hover',
                color: 'text.secondary',
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          </Box>
          <Tooltip title={formatDate(log.createdAt)} placement='top'>
            <Typography variant='caption' sx={{ color: 'text.disabled', flexShrink: 0, cursor: 'default' }}>
              {relativeTime(log.createdAt)}
            </Typography>
          </Tooltip>
        </Box>

        {/* Target company */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <Icon icon='tabler:building' fontSize={14} color='text.disabled' />
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {company}
          </Typography>
        </Box>

        {/* Dynamic details */}
        {log.details && Object.keys(log.details).length > 0 && (
          <Box sx={{ mb: 1 }}>
            {config.renderDetails(log.details)}
          </Box>
        )}

        {/* Footer: actor + IP */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Icon icon='tabler:user-circle' fontSize={14} />
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {actor}
            </Typography>
          </Box>
          {log.ipAddress && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Icon icon='tabler:map-pin' fontSize={14} />
              <Typography variant='caption' sx={{ color: 'text.disabled', fontFamily: 'monospace' }}>
                {log.ipAddress}
              </Typography>
            </Box>
          )}
        </Box>
      </TimelineContent>
    </TimelineItem>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const AuditLogTimeline = () => {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [filter,  setFilter]  = useState('')   // action type filter

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = filter ? { action: filter } : {}
      const { data } = await axiosRequest.get('/api/v1/super-admin/audit-log', { params })
      console.log('Fetched audit logs:', data)
      setLogs(data ?? [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Icon icon='tabler:shield-check' fontSize={20} />
            Audit Log
          </Box>
        }
        subheader={`${logs.length} event${logs.length !== 1 ? 's' : ''}${filter ? ` · ${filter}` : ''}`}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Action type filter */}
            <CustomTextField
              select size='small'
              value={filter}
              onChange={e => setFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value=''>All actions</MenuItem>
              <Divider />
              {ALL_ACTION_TYPES.map(type => (
                <MenuItem key={type} value={type} sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {getConfig(type).label}
                </MenuItem>
              ))}
            </CustomTextField>

            {/* Refresh */}
            <Tooltip title='Refresh'>
              <Box
                onClick={fetchLogs}
                sx={{ cursor: 'pointer', color: 'text.disabled', display: 'flex', alignItems: 'center', '&:hover': { color: 'primary.main' } }}
              >
                <Icon icon='tabler:refresh' fontSize={18} />
              </Box>
            </Tooltip>
          </Box>
        }
      />

      <Divider />

      <CardContent sx={{ pt: 4 }}>
        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, flexDirection: 'column', gap: 2 }}>
            <CircularProgress size={28} />
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>Loading audit logs…</Typography>
          </Box>
        )}

        {/* Error */}
        {!loading && error && (
          <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>
        )}

        {/* Empty */}
        {!loading && !error && logs.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 2 }}>
            <Icon icon='tabler:shield-off' fontSize={40} />
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              No audit logs found{filter ? ` for action "${filter}"` : ''}.
            </Typography>
          </Box>
        )}

        {/* Timeline */}
        {!loading && !error && logs.length > 0 && (
          <Timeline>
            {logs.map((log, idx) => (
              <LogItem
                key={log._id}
                log={log}
                isLast={idx === logs.length - 1}
              />
            ))}
          </Timeline>
        )}
      </CardContent>
    </Card>
  )
}

export default AuditLogTimeline