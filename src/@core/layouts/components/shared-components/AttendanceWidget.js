// src/@core/layouts/components/shared-components/AttendanceWidget.js
// Self-contained attendance widget - no drawer needed
import React, { useState, useEffect, Fragment } from 'react'
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Avatar,
  AvatarGroup,
  Tooltip,
  FormControlLabel,
  Checkbox,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  LinearProgress
} from '@mui/material'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { getInitials } from 'src/utils/employeeAvatar'

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Widget - Self-contained, no drawer
// ─────────────────────────────────────────────────────────────────────────────
const AttendanceWidget = ({ canMarkAttendance }) => {
  const [attendance, setAttendance] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isWFH, setIsWFH] = useState(false)
  const [clockedInEmployees, setClockedInEmployees] = useState([])
  const [punchOutDialog, setPunchOutDialog] = useState(false)
  const [punchOutReason, setPunchOutReason] = useState('')
  const [locationError, setLocationError] = useState('')
  const [fetchError, setFetchError] = useState('')

  // ── Fetch attendance status
  // Backend shape (GET /me/today): { success, message, data: { date, employee, attendance, hasPunchedIn, hasPunchedOut, isPunchedIn } }
  // `data.attendance` is null when not punched in yet, and an object when punched in.
  // Kept a flat-object fallback too, in case a caller ever hits an endpoint that returns the record un-nested.
  const fetchAttendance = async () => {
    try {
      setFetchError('')
      const res = await axiosRequest.get('/api/v1/attendance/me/today')
      const data = res?.data || res || {}

      const attData = data.attendance ?? (data._id || data.checkIn ? data : null)
      const isPunchedIn = data.isPunchedIn ?? attData?.isPunchedIn ?? false

      setAttendance(attData ? { ...attData, isPunchedIn } : null)

      if (attData?.checkIn) {
        const diff = Math.floor((new Date() - new Date(attData.checkIn)) / 1000)
        setElapsedTime(diff > 0 ? diff : 0)
      } else {
        setElapsedTime(0)
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
      setFetchError('Could not load attendance status')
    } finally {
      setInitialLoading(false)
    }
  }

  // ── Fetch clocked-in employees
  const fetchClockedInEmployees = async () => {
    try {
      const res = await axiosRequest.get('/api/v1/attendance/clocked-in')
      const data = res?.data || res || {}
      setClockedInEmployees(data.employees || data.data?.employees || [])
    } catch (error) {
      console.error('Failed to fetch clocked-in employees:', error)
    }
  }

  // ── Get GPS location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        pos =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          }),
        err => {
          let msg = 'Failed to get location'
          if (err.code === err.PERMISSION_DENIED) msg = 'Location permission denied'
          reject(new Error(msg))
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    })
  }

  // ── Effects
  useEffect(() => {
    if (canMarkAttendance) {
      fetchAttendance()
      fetchClockedInEmployees()
      const refreshInterval = setInterval(() => {
        fetchAttendance()
        fetchClockedInEmployees()
      }, 30000)
      return () => clearInterval(refreshInterval)
    } else {
      setInitialLoading(false)
    }
  }, [canMarkAttendance])

  // Timer effect - updates every second when punched in
  useEffect(() => {
    let interval
    if (attendance?.isPunchedIn && attendance?.checkIn) {
      interval = setInterval(() => {
        const diff = Math.floor((new Date() - new Date(attendance.checkIn)) / 1000)
        setElapsedTime(diff > 0 ? diff : 0)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [attendance?.isPunchedIn, attendance?.checkIn])

  // ── Format time
  const formatTime = seconds => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const formatPunchInTime = time => {
    if (!time) return 'N/A'
    return new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  // Progress ring % against standard hours (defaults to 8h so the ring still makes sense pre-policy-load)
  const standardSeconds = (attendance?.standardHours || 8) * 3600
  const ringProgress = Math.min((elapsedTime / standardSeconds) * 100, 100)

  // ── Punch In Handler
  const handlePunchIn = async () => {
    setLoading(true)
    setLocationError('')
    try {
      let locationData = null
      if (!isWFH) {
        try {
          locationData = await getCurrentLocation()
        } catch (err) {
          setLocationError(err.message)
          setLoading(false)
          return
        }
      }

      const payload = { isWFH, ...(locationData && { geolocation: locationData }) }
      await axiosRequest.post('/api/v1/attendance/me/punch-in', payload)
      toast.success(isWFH ? 'Punched in (WFH)!' : 'Punched in successfully!')
      setIsWFH(false)
      fetchAttendance()
      fetchClockedInEmployees()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to punch in')
    } finally {
      setLoading(false)
    }
  }

  // ── Punch Out Handler
  const handlePunchOut = async () => {
    setLoading(true)
    try {
      await axiosRequest.post('/api/v1/attendance/me/punch-out', { remarks: punchOutReason.trim() || undefined })
      toast.success('Punched out successfully!')
      setPunchOutDialog(false)
      setPunchOutReason('')
      fetchAttendance()
      fetchClockedInEmployees()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to punch out')
    } finally {
      setLoading(false)
    }
  }

  if (!canMarkAttendance) return null

  // ── Initial loading skeleton (prevents the "blank widget" feel while first fetch resolves)
  if (initialLoading) {
    return (
      <Box sx={{ px: 6, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant='text' width='40%' height={24} />
        <Skeleton variant='rounded' height={72} sx={{ my: 1.5, borderRadius: 2 }} />
        <Skeleton variant='rounded' height={36} sx={{ borderRadius: 1 }} />
      </Box>
    )
  }

  return (
    <Fragment>
      {/* ── Main Widget ──────────────────────────────── */}
      {/* Contained + compact: this widget usually renders inside a narrow profile
          dropdown/menu (~300-340px), so padding stays tight and overflow is clipped
          instead of spilling over neighbouring UI (settings icon, page content, etc). */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        {fetchError && (
          <Typography variant='caption' color='error.main' sx={{ display: 'block', mb: 1.5 }}>
            {fetchError}
          </Typography>
        )}

        {attendance?.isPunchedIn ? (
          /* ── Punched In State ──────────────────────── */
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: 'success.main',
                    animation: 'pulse 2s infinite'
                  }}
                />
                <Typography variant='body1' sx={{ fontWeight: 600, color: 'success.main', fontSize: '0.95rem' }}>
                  Punched In
                </Typography>
              </Box>
              {attendance?.isWFH && <Chip label='WFH' size='small' color='info' sx={{ height: 24, fontWeight: 600 }} />}
            </Box>

            {/* Shift Info */}
            {attendance?.shiftStart && attendance?.shiftEnd && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Icon icon='tabler:clock' style={{ fontSize: 16, color: '#64748B' }} />
                <Typography variant='caption' color='text.secondary'>
                  Shift: {attendance.shiftStart} - {attendance.shiftEnd}
                </Typography>
                {attendance?.isLate && (
                  <Chip label={`Late ${attendance.lateMinutes}m`} size='small' color='warning' sx={{ height: 20, fontSize: '0.65rem', ml: 0.5 }} />
                )}
              </Box>
            )}

            {/* Timer card with progress ring - compact, single row that fits a narrow menu */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.75,
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.05)',
                border: '1px solid',
                borderColor: 'success.main',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                <CircularProgress
                  variant='determinate'
                  value={100}
                  size={44}
                  thickness={3.5}
                  sx={{ color: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') }}
                />
                <CircularProgress
                  variant='determinate'
                  value={ringProgress}
                  size={44}
                  thickness={3.5}
                  color='success'
                  sx={{ position: 'absolute', left: 0 }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon icon='tabler:clock-hour-4' style={{ fontSize: 15, color: '#22C55E' }} />
                </Box>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.3 }}>
                  Working Time
                </Typography>
                <Typography
                  variant='h6'
                  color='success.main'
                  noWrap
                  sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 0.5, lineHeight: 1.3 }}
                >
                  {formatTime(elapsedTime)}
                </Typography>
                <Typography variant='caption' color='text.secondary' noWrap sx={{ display: 'block', lineHeight: 1.3 }}>
                  Punched in at {formatPunchInTime(attendance.checkIn)}
                </Typography>
              </Box>
            </Box>

            {attendance?.checkInLocation && !attendance?.isWFH && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  mb: 1.5,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: 'action.hover',
                  overflow: 'hidden'
                }}
              >
                <Icon
                  icon='tabler:map-pin'
                  style={{ fontSize: 14, flexShrink: 0, color: attendance.checkInLocation.isValid ? '#22C55E' : '#F59E0B' }}
                />
                <Typography variant='caption' color='text.secondary' noWrap sx={{ minWidth: 0 }}>
                  {attendance.checkInLocation.distance ?? 0}m from office
                  {!attendance.checkInLocation.isValid && ' • outside geofence'}
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant='contained'
              color='error'
              size='small'
              onClick={() => setPunchOutDialog(true)}
              disabled={loading}
              startIcon={<Icon icon='tabler:logout' />}
            >
              Punch Out
            </Button>
          </>
        ) : (
          /* ── Not Punched In State ──────────────────────── */
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                Attendance
              </Typography>
              <Chip label='Not Punched In' size='small' color='warning' variant='tonal' />
            </Box>

            <FormControlLabel
              control={<Checkbox checked={isWFH} onChange={e => setIsWFH(e.target.checked)} disabled={loading} size='small' />}
              label={<Typography variant='caption'>Work from Home</Typography>}
              sx={{ mb: 1.5 }}
            />

            {locationError && (
              <Typography variant='caption' color='error.main' sx={{ display: 'block', mb: 1 }}>
                {locationError}
              </Typography>
            )}

            <Button
              fullWidth
              variant='contained'
              color='success'
              size='small'
              onClick={handlePunchIn}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:login' />}
            >
              {loading ? 'Punching In...' : 'Punch In'}
            </Button>
          </>
        )}
      </Box>

      {/* ── Clocked-In Colleagues ──────────────────────────────── */}
      {clockedInEmployees.length > 0 && (
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant='caption' sx={{ mb: 1, fontWeight: 600, color: 'text.secondary', display: 'block' }}>
            Clocked In ({clockedInEmployees.length})
          </Typography>
          <AvatarGroup max={4} sx={{ justifyContent: 'flex-start', '& .MuiAvatar-root': { width: 26, height: 26, fontSize: '0.7rem' } }}>
            {clockedInEmployees.map(emp => (
              <Tooltip key={emp.attendanceId} title={`${emp.name} • ${formatPunchInTime(emp.checkIn)}`} arrow>
                <Avatar
                  alt={emp.name}
                  src={emp.profilePhoto}
                  sx={{
                    backgroundColor: 'primary.main',
                    border: emp.isWFH ? '2px solid #0EA5E9' : '2px solid #22C55E'
                  }}
                >
                  {!emp.profilePhoto && getInitials(emp.name)}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        </Box>
      )}

      {/* ── Punch Out Dialog ──────────────────────────────── */}
      <Dialog open={punchOutDialog} onClose={() => setPunchOutDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Punch Out
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Confirm your punch out
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1.5, borderRadius: 1, backgroundColor: 'action.hover' }}>
            <Icon icon='tabler:clock-hour-4' style={{ fontSize: 18, color: '#22C55E' }} />
            <Typography variant='body2'>
              Worked so far: <strong>{formatTime(elapsedTime)}</strong>
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={2}
            label='Reason (optional)'
            placeholder='End of work day...'
            value={punchOutReason}
            onChange={e => setPunchOutReason(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setPunchOutDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handlePunchOut}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:logout' />}
          >
            {loading ? 'Punching Out...' : 'Punch Out'}
          </Button>
        </DialogActions>
      </Dialog>

      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
          }
          50% {
            transform: scale(1.15);
            box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
          }
        }
      `}</style>
    </Fragment>
  )
}

export default AttendanceWidget