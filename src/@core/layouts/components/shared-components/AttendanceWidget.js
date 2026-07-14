// src/@core/layouts/components/shared-components/AttendanceWidget.js
// Self-contained attendance widget - no drawer needed
import React, { useState, useEffect, Fragment } from 'react'
import { Box, Button, Typography, CircularProgress, Avatar, AvatarGroup, Tooltip, FormControlLabel, Checkbox, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Widget - Self-contained, no drawer
// ─────────────────────────────────────────────────────────────────────────────
const AttendanceWidget = ({ canMarkAttendance }) => {
  const [attendance, setAttendance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isWFH, setIsWFH] = useState(false)
  const [clockedInEmployees, setClockedInEmployees] = useState([])
  const [punchOutDialog, setPunchOutDialog] = useState(false)
  const [punchOutReason, setPunchOutReason] = useState('')
  const [locationError, setLocationError] = useState('')

  // ── Fetch attendance status
  const fetchAttendance = async () => {
    try {
      const res = await axiosRequest.get('/api/v1/attendance/me/today')
      const attData = res.data?.attendance || res.data || null
      setAttendance(attData)
      if (attData?.checkIn) {
        const diff = Math.floor((new Date() - new Date(attData.checkIn)) / 1000)
        setElapsedTime(diff > 0 ? diff : 0)
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
    }
  }

  // ── Fetch clocked-in employees
  const fetchClockedInEmployees = async () => {
    try {
      const res = await axiosRequest.get('/api/v1/attendance/clocked-in')
      setClockedInEmployees(res.data?.employees || [])
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
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        (err) => {
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
    }
  }, [canMarkAttendance])

  useEffect(() => {
    let interval
    if (attendance?.isPunchedIn) {
      interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [attendance?.isPunchedIn])

  // ── Format time
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const formatPunchInTime = (time) => {
    if (!time) return 'N/A'
    return new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

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
    if (!punchOutReason.trim()) {
      toast.error('Please provide a reason')
      return
    }
    setLoading(true)
    try {
      await axiosRequest.post('/api/v1/attendance/me/punch-out', { remarks: punchOutReason.trim() })
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

  return (
    <Fragment>
      {/* ── Main Widget ──────────────────────────────── */}
      <Box sx={{ px: 6, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        
        {attendance?.isPunchedIn ? (
          /* ── Punched In State ──────────────────────── */
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main', animation: 'pulse 2s infinite' }} />
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'success.main' }}>Punched In</Typography>
              </Box>
              {attendance?.isWFH && <Chip label='WFH' size='small' color='info' sx={{ height: 20 }} />}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant='body2' color='text.secondary'>Working</Typography>
              <Typography variant='h6' color='primary.main' sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatTime(elapsedTime)}</Typography>
            </Box>

            {attendance?.checkInLocation && !attendance?.isWFH && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, p: 1, borderRadius: 1, backgroundColor: 'action.hover' }}>
                <Icon icon='tabler:map-pin' style={{ fontSize: 14, color: attendance.checkInLocation.isValid ? '#22C55E' : '#F59E0B' }} />
                <Typography variant='caption' color='text.secondary'>
                  {attendance.checkInLocation.distance ?? 0}m from office
                </Typography>
              </Box>
            )}

            <Button fullWidth variant='contained' color='error' size='small' onClick={() => setPunchOutDialog(true)} disabled={loading} startIcon={<Icon icon='tabler:logout' />}>
              Punch Out
            </Button>
          </>
        ) : (
          /* ── Not Punched In State ──────────────────────── */
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>Attendance</Typography>
              <Chip label='Not Punched In' size='small' color='warning' variant='tonal' />
            </Box>

            <FormControlLabel
              control={<Checkbox checked={isWFH} onChange={(e) => setIsWFH(e.target.checked)} disabled={loading} size='small' />}
              label={<Typography variant='caption'>Work from Home</Typography>}
              sx={{ mb: 1.5 }}
            />

            {locationError && (
              <Typography variant='caption' color='error.main' sx={{ display: 'block', mb: 1 }}>{locationError}</Typography>
            )}

            <Button fullWidth variant='contained' color='success' size='small' onClick={handlePunchIn} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <Icon icon='tabler:login' />}>
              {loading ? 'Punching In...' : 'Punch In'}
            </Button>
          </>
        )}
      </Box>

      {/* ── Clocked-In Colleagues ──────────────────────────────── */}
      {clockedInEmployees.length > 0 && (
        <Box sx={{ px: 6, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant='caption' sx={{ mb: 1, fontWeight: 600, color: 'text.secondary', display: 'block' }}>
            Clocked In ({clockedInEmployees.length})
          </Typography>
          <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem' } }}>
            {clockedInEmployees.map(emp => (
              <Tooltip key={emp.attendanceId} title={`${emp.name} • ${formatPunchInTime(emp.checkIn)}`} arrow>
                <Avatar alt={emp.name} src={emp.profilePhoto} sx={{ backgroundColor: 'primary.main', border: emp.isWFH ? '2px solid #0EA5E9' : '2px solid #22C55E' }}>
                  {emp.name?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        </Box>
      )}

      {/* ── Punch Out Dialog ──────────────────────────────── */}
      <Dialog open={punchOutDialog} onClose={() => setPunchOutDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>Punch Out</Typography>
          <Typography variant='body2' color='text.secondary'>Confirm your punch out</Typography>
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={2} label='Reason (optional)' placeholder='End of work day...' value={punchOutReason} onChange={(e) => setPunchOutReason(e.target.value)} disabled={loading} sx={{ mt: 1 }} autoFocus />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setPunchOutDialog(false)} disabled={loading}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handlePunchOut} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <Icon icon='tabler:logout' />}>
            {loading ? 'Punching Out...' : 'Punch Out'}
          </Button>
        </DialogActions>
      </Dialog>

      <style jsx global>{`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }`}</style>
    </Fragment>
  )
}

export default AttendanceWidget
