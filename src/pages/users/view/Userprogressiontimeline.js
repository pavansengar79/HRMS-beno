// src/views/apps/user/view/UserProgressionTimeline.jsx
// Fetches GET /api/v1/users/:userId/progression and renders as a timeline

import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
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
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Axios

// ─── Styled Timeline ──────────────────────────────────────────────────────────
const Timeline = styled(MuiTimeline)({
  padding: 0,
  '& .MuiTimelineItem-root:before': { display: 'none' },
})

// ─── Change type config ───────────────────────────────────────────────────────
// Maps backend event types to display configuration
const CHANGE_TYPE_CONFIG = {
  EMPLOYEE_JOINED: {
    color: 'success',
    icon: 'tabler:user-plus',
    label: 'Employee Joined',
    showFromTo: false,
  },
  POSITION_UPDATED: {
    color: 'primary',
    icon: 'tabler:briefcase',
    label: 'Position Updated',
    showFromTo: true,
  },
  REPORTING_MANAGER_CHANGED: {
    color: 'info',
    icon: 'tabler-users',
    label: 'Reporting Manager Changed',
    showFromTo: true,
  },
  DEPARTMENT_CHANGED: {
    color: 'warning',
    icon: 'tabler:building-community',
    label: 'Department Transfer',
    showFromTo: true,
  },
  DESIGNATION_CHANGED: {
    color: 'primary',
    icon: 'tabler:badge',
    label: 'Job Role Changed',
    showFromTo: true,
  },
  STATUS_CHANGED: {
    color: 'secondary',
    icon: 'tabler:toggle-left',
    label: 'Status Changed',
    showFromTo: true,
  },
  SALARY_UPDATED: {
    color: 'success',
    icon: 'tabler:currency-dollar',
    label: 'Salary Updated',
    showFromTo: true,
  },
  _default: {
    color: 'secondary',
    icon: 'tabler:activity',
    label: 'Change',
    showFromTo: false,
  },
}

const getConfig = type => CHANGE_TYPE_CONFIG[type] || CHANGE_TYPE_CONFIG._default

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = iso =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '—'

const relativeTime = iso => {
  if (!iso) return ''
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 30) return `${days}d ago`
  return formatDate(iso)
}

const getName = obj => obj?.name || obj?.label || obj?.email || '—'

// ─── Single timeline item ─────────────────────────────────────────────────────
const ProgressionItem = ({ log, isLast }) => {
  const config = getConfig(log.eventType || log.changeType)
  const changedBy = log.changedBy?.email || log.changedBy?.name || log.createdBy?.name || 'System'
  
  // Format the "From → To" values based on event type
  const formatValue = (value, field) => {
    if (!value) return 'None'
    if (typeof value === 'object') {
      return value.name || value.designation_name || value.department_name || value.email || value._id
    }
    return value
  }

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot color={config.color} sx={{ p: 1.25 }}>
          <Icon icon={config.icon} fontSize={16} />
        </TimelineDot>
        {!isLast && <TimelineConnector sx={{ minHeight: 32 }} />}
      </TimelineSeparator>

      <TimelineContent sx={{ mb: isLast ? 0 : 5, pb: 0 }}>

        {/* Header: label + timestamp */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant='body1' sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {config.label}
            </Typography>
            <Chip
              label={log.eventType || log.changeType}
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
          <Tooltip title={formatDate(log.effectiveDate || log.createdAt)} placement='top'>
            <Typography variant='caption' sx={{ color: 'text.disabled', flexShrink: 0, cursor: 'default' }}>
              {relativeTime(log.effectiveDate || log.createdAt)}
            </Typography>
          </Tooltip>
        </Box>

        {/* From → To row */}
        {config.showFromTo && log.changes && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
            mb: 1.5, p: 1.5, borderRadius: 1.5,
            bgcolor: 'action.hover', border: '0.5px solid', borderColor: 'divider',
          }}>
            {/* From */}
            {log.changes.from && (
              <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 80 }}>
                <Typography variant='caption' sx={{ color: 'text.disabled', mb: 0.25 }}>
                  Previous
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {formatValue(log.changes.from)}
                </Typography>
              </Box>
            )}
            
            {/* Arrow */}
            {log.changes.from && log.changes.to && (
              <Box sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center' }}>
                <Icon icon='tabler:arrow-right' fontSize={16} />
              </Box>
            )}
            
            {/* To */}
            {log.changes.to && (
              <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 80 }}>
                <Typography variant='caption' sx={{ color: 'text.disabled', mb: 0.25 }}>
                  New
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 600, color: `${config.color}.main` }}>
                  {formatValue(log.changes.to)}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Note/Description */}
        {(log.note || log.description) && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1.25 }}>
            <Box sx={{ color: 'text.disabled', mt: 0.25, flexShrink: 0 }}>
              <Icon icon='tabler:notes' fontSize={14} />
            </Box>
            <Typography variant='body2' sx={{ color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{log.note || log.description}"
            </Typography>
          </Box>
        )}

        {/* Changed by */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Icon icon='tabler:user-edit' fontSize={13} />
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            Changed by <strong>{changedBy}</strong>
          </Typography>
        </Box>

      </TimelineContent>
    </TimelineItem>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const UserProgressionTimeline = ({ userId }) => {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchProgression = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      // Determine the employee ID from userId
      // userId might be a user object or employee object
      const employeeId = userId.employeeId || userId._id
      const res = await axiosRequest.get(`/api/v1/employees/${employeeId}/timeline`)
      console.log('Timeline API response:', res) // Debug log
      if (res?.success) {
        setLogs(res.data ?? [])
      } else {
        setError(res?.message || 'Failed to load timeline')
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchProgression() }, [fetchProgression])

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Icon icon='tabler:timeline' fontSize={20} />
            Career Progression 
            {/* {JSON.stringify(userId)} */}
          </Box>
        }
        subheader={
          !loading && !error
            ? `${logs.length} event${logs.length !== 1 ? 's' : ''} on record`
            : undefined
        }
        action={
          <Tooltip title='Refresh'>
            <IconButton size='small' onClick={fetchProgression} disabled={loading}>
              <Icon icon='tabler:refresh' fontSize={18} />
            </IconButton>
          </Tooltip>
        }
      />

      <Divider />

      <CardContent sx={{ pt: 4 }}>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 160, flexDirection: 'column', gap: 2 }}>
            <CircularProgress size={28} />
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>Loading progression history…</Typography>
          </Box>
        )}

        {/* Error */}
        {!loading && error && (
          <Alert severity='error'>{error}</Alert>
        )}

        {/* Empty */}
        {!loading && !error && logs.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 160, gap: 2 }}>
            <Icon icon='tabler:mood-empty' fontSize={40} />
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              No progression history recorded yet.
            </Typography>
          </Box>
        )}

        {/* Timeline */}
        {!loading && !error && logs.length > 0 && (
          <Timeline>
            {logs.map((log, idx) => (
              <ProgressionItem
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

export default UserProgressionTimeline