// src/views/apps/user/view/EmployeeTimeline.jsx
// Employee Career Timeline - Rich visual timeline with tree structure and profile photos
// Fetches GET /api/v1/employees/:id/timeline

import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'

// ** MUI Lab
import Timeline from '@mui/lab/Timeline'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Styled Components ───────────────────────────────────────────────────────
const TimelineItemWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
  },
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = iso => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatTime = iso => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const relativeTime = iso => {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}

// ─── Single Timeline Item ─────────────────────────────────────────────────────
const TimelineEvent = ({ event, isLast }) => {
  const icon = event.icon || 'tabler:activity'
  const color = event.color || 'secondary'

  return (
    <TimelineItem>
      <TimelineOppositeContent
        sx={{ flex: 0.3, pr: 2, pt: 1 }}
        align='right'
        variant='caption'
        color='text.disabled'
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {formatDate(event.effectiveDate)}
          </Typography>
          <Typography variant='caption'>
            {formatTime(event.effectiveDate)}
          </Typography>
        </Box>
      </TimelineOppositeContent>

      <TimelineSeparator>
        <TimelineDot color={color} sx={{ p: 1.5 }}>
          <Icon icon={icon} fontSize={18} />
        </TimelineDot>
        {!isLast && <TimelineConnector sx={{ minHeight: 40 }} />}
      </TimelineSeparator>

      <TimelineContent sx={{ mb: isLast ? 0 : 4, pb: 0 }}>
        <Card sx={{ 
          boxShadow: 2, 
          border: theme => `1px solid ${theme.palette.divider}`,
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent sx={{ p: 2.5 }}>
            {/* Header: Title + Chip */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant='h6' sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  {event.title || 'Update'}
                </Typography>
                <Chip
                  label={event.eventType?.replace(/_/g, ' ')}
                  size='small'
                  variant='outlined'
                  color={color}
                  sx={{
                    height: 22,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}
                />
              </Box>
            </Box>

            {/* Description */}
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
              {event.description || 'Employee record updated'}
            </Typography>

            {/* From → To Section */}
            {(event.fromDesignationId || event.toDesignationId ||
              event.fromDepartmentId || event.toDepartmentId ||
              event.fromReportingManagerId || event.toReportingManagerId ||
              event.fromStatus || event.toStatus) && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: 'action.hover',
                mb: 2,
                flexWrap: 'wrap'
              }}>
                {/* From */}
                {event.fromDesignationId?.name || event.fromDepartmentId?.name || 
                 event.fromReportingManagerId?.name || event.fromStatus ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={event.fromDesignationId?.name || 
                             event.fromDepartmentId?.name ||
                             event.fromReportingManagerId?.name ||
                             event.fromStatus}
                      size='small'
                      variant='outlined'
                      color='default'
                      sx={{ opacity: 0.7 }}
                    />
                    {event.fromReportingManagerId?.profilePhoto && (
                      <Avatar
                        src={event.fromReportingManagerId.profilePhoto}
                        sx={{ width: 24, height: 24 }}
                      />
                    )}
                  </Box>
                ) : null}

                {/* Arrow */}
                <Icon icon='tabler:arrow-right' fontSize={20} sx={{ color: 'text.disabled' }} />

                {/* To */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {event.toReportingManagerId?.profilePhoto && (
                    <Avatar
                      src={event.toReportingManagerId.profilePhoto}
                      sx={{ width: 28, height: 28 }}
                    />
                  )}
                  <Chip
                    label={event.toDesignationId?.name || 
                           event.toDepartmentId?.name ||
                           event.toReportingManagerId?.name ||
                           event.toStatus}
                    size='small'
                    color={color}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
            )}

            {/* Changed By */}
            {event.changedBy && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar
                  src={event.changedBy.profilePhoto}
                  sx={{ width: 24, height: 24 }}
                >
                  {!event.changedBy.profilePhoto && (
                    <Icon icon='tabler:user' fontSize={14} />
                  )}
                </Avatar>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                  Changed by{' '}
                  <Typography component='span' variant='caption' sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {event.changedBy.name || event.changedBy.email || 'System'}
                  </Typography>
                </Typography>
              </Box>
            )}

            {/* Change Reason */}
            {event.changeReason && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 1,
                p: 1.5,
                borderRadius: 1,
                bgcolor: theme => theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'
              }}>
                <Icon icon='tabler:notes' fontSize={14} sx={{ mt: 0.25, color: 'text.disabled' }} />
                <Typography variant='caption' sx={{ color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{event.changeReason}"
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </TimelineContent>
    </TimelineItem>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const EmployeeTimeline = ({ userId, employee }) => {
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTimeline = useCallback(async () => {
    if (!employee?._id) return
    setLoading(true)
    setError(null)
    try {
      const res = await axiosRequest.get(`/api/v1/employees/${employee._id}/timeline`)
      console.log('Employee Timeline API response:', res)
      
      if (res?.success) {
        setTimeline(res.data?.timeline || [])
      } else {
        setError(res?.message || 'Failed to load timeline')
      }
    } catch (e) {
      console.error('Timeline fetch error:', e)
      setError(e.response?.data?.message || 'Failed to load employee timeline')
    } finally {
      setLoading(false)
    }
  }, [employee])

  useEffect(() => {
    fetchTimeline()
  }, [fetchTimeline])

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Icon icon='tabler:timeline-event' fontSize={22} />
            <Typography variant='h6'>Career Timeline</Typography>
          </Box>
        }
        subheader={
          !loading && !error
            ? `${timeline.length} event${timeline.length !== 1 ? 's' : ''} recorded`
            : undefined
        }
        action={
          <IconButton size='small' onClick={fetchTimeline} disabled={loading}>
            <Icon icon='tabler:refresh' fontSize={18} />
          </IconButton>
        }
      />
      <Divider />

      <CardContent sx={{ pt: 4, px: 2 }}>
        {/* Loading Skeletons */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[1, 2, 3].map(i => (
              <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Skeleton variant='circular' width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant='text' width='40%' height={24} />
                  <Skeleton variant='text' width='80%' height={20} />
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Error State */}
        {!loading && error && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: 200, 
            gap: 2 
          }}>
            <Icon icon='tabler:alert-circle' fontSize={48} color='error' />
            <Typography variant='body2' color='text.secondary'>
              {error}
            </Typography>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !error && timeline.length === 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: 200, 
            gap: 2 
          }}>
            <Icon icon='tabler:timeline-off' fontSize={48} />
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              No career events recorded yet
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.disabled', textAlign: 'center' }}>
              Career progression events will appear here when the employee's position, department, or status changes
            </Typography>
          </Box>
        )}

        {/* Timeline */}
        {!loading && !error && timeline.length > 0 && (
          <Timeline position='alternate-left'>
            {timeline.map((event, idx) => (
              <TimelineEvent
                key={event._id || idx}
                event={event}
                isLast={idx === timeline.length - 1}
              />
            ))}
          </Timeline>
        )}
      </CardContent>
    </Card>
  )
}

export default EmployeeTimeline
