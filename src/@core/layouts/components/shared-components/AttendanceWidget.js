// src/@core/layouts/components/shared-components/AttendanceWidget.js
import React, { useState, useEffect, Fragment } from 'react'
import { Box, Button, Typography, CircularProgress, Drawer, Avatar, AvatarGroup, Tooltip, IconButton, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip } from '@mui/material'
import { Icon } from '@iconify/react'
import { styled } from '@mui/material/styles'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─────────────────────────────────────────────────────────────────────────────
// Styled Components
// ─────────────────────────────────────────────────────────────────────────────
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Widget Component
// ─────────────────────────────────────────────────────────────────────────────
const AttendanceWidget = ({ canMarkAttendance }) => {
  const [attendance, setAttendance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isWFH, setIsWFH] = useState(false)
  const [clockedInEmployees, setClockedInEmployees] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  // Punch Out Dialog State
  const [punchOutDialog, setPunchOutDialog] = useState(false)
  const [punchOutReason, setPunchOutReason] = useState('')
  const [punchOutReasonError, setPunchOutReasonError] = useState('')
  
  // Location State
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [locationAccuracy, setLocationAccuracy] = useState(null)

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch Today's Attendance Status
  // ─────────────────────────────────────────────────────────────────────────────
  const fetchAttendance = async () => {
    try {
      const res = await axiosRequest.get('/api/v1/attendance/me/today')
      // API returns: { success, data: { attendance: { checkIn, checkInLocation, isPunchedIn, ... } } }
      const attData = res.data?.attendance || res.data || null
      setAttendance(attData)
      
      // Calculate elapsed time from check-in
      if (attData?.checkIn) {
        const diff = Math.floor((new Date() - new Date(attData.checkIn)) / 1000)
        setElapsedTime(diff > 0 ? diff : 0)
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch Clocked-In Employees
  // ─────────────────────────────────────────────────────────────────────────────
  const fetchClockedInEmployees = async () => {
    try {
      const res = await axiosRequest.get('/api/v1/attendance/clocked-in')
      setClockedInEmployees(res.data?.employees || [])
    } catch (error) {
      console.error('Failed to fetch clocked-in employees:', error)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Current Location
  // ─────────────────────────────────────────────────────────────────────────────
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          setCurrentLocation(location)
          setLocationAccuracy(position.coords.accuracy)
          setLocationError('')
          resolve(location)
        },
        (error) => {
          let errorMsg = 'Failed to get location'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location permission denied. Please enable location access.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location information unavailable.'
              break
            case error.TIMEOUT:
              errorMsg = 'Location request timed out.'
              break
          }
          setLocationError(errorMsg)
          reject(new Error(errorMsg))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (canMarkAttendance) {
      fetchAttendance()
      fetchClockedInEmployees()
    }
  }, [canMarkAttendance])

  // ── Timer Effect: Update every second when punched in
  useEffect(() => {
    let interval
    if (attendance?.isPunchedIn) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [attendance?.isPunchedIn])

  // ─────────────────────────────────────────────────────────────────────────────
  // Format Time (HH:MM:SS)
  // ─────────────────────────────────────────────────────────────────────────────
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const formatPunchInTime = (checkInTime) => {
    if (!checkInTime) return 'N/A'
    const date = new Date(checkInTime)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const handlePunchIn = async () => {
    setLoading(true)
    try {
      let locationData = null

      // Get location if not WFH
      if (!isWFH) {
        try {
          const location = await getCurrentLocation()
          locationData = {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy
          }
        } catch (locError) {
          toast.error(locError.message || 'Failed to get location. Please enable location access.')
          setLoading(false)
          return
        }
      }

      const payload = {
        isWFH,
        ...(locationData && { geolocation: locationData })
      }

      const res = await axiosRequest.post('/api/v1/attendance/me/punch-in', payload)
      toast.success(isWFH ? 'Punched in (WFH) successfully!' : 'Punched in successfully!')
      setIsWFH(false)
      fetchAttendance()
      fetchClockedInEmployees()
      setDrawerOpen(false)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to punch in')
    } finally {
      setLoading(false)
    }
  }

  const handlePunchOutClick = () => {
    setPunchOutDialog(true)
  }

  const handlePunchOutConfirm = async () => {
    if (!punchOutReason.trim()) {
      setPunchOutReasonError('Please provide a reason for punch out')
      return
    }

    setLoading(true)
    try {
      const res = await axiosRequest.post('/api/v1/attendance/me/punch-out', {
        remarks: punchOutReason.trim()
      })
      toast.success('Punched out successfully!')
      setPunchOutDialog(false)
      setPunchOutReason('')
      setPunchOutReasonError('')
      fetchAttendance()
      fetchClockedInEmployees()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to punch out')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDrawer = () => {
    if (!attendance?.isPunchedIn) {
      setDrawerOpen(!drawerOpen)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  if (!canMarkAttendance) return null

  return (
    <Fragment>
      {/* ── Mini Widget (shown when not punched in) ──────────────────────────────── */}
      {!attendance?.isPunchedIn ? (
        <Box sx={{ px: 6, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
              Attendance
            </Typography>
            <Chip label='Not Punched In' size='small' color='warning' variant='tonal' />
          </Box>
          <Button
            fullWidth
            variant='contained'
            color='success'
            size='small'
            onClick={handleToggleDrawer}
            startIcon={<Icon icon='tabler:login' />}
          >
            Punch In
          </Button>
        </Box>
      ) : (
        /* ── Compact View (when punched in) ──────────────────────────────── */
        <Box sx={{ px: 6, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          {/* Timer Display */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              Working Time
            </Typography>
            <Typography variant='h6' color='primary.main' sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
              {formatTime(elapsedTime)}
            </Typography>
          </Box>
          
          {/* Location/Geofence Status */}
          {attendance?.checkInLocation && !attendance?.isWFH && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1.5,
              p: 1,
              borderRadius: 1,
              backgroundColor: attendance.checkInLocation.isValid ? 'success.light' : 'warning.light'
            }}>
              <Icon 
                icon={attendance.checkInLocation.isValid ? 'tabler:map-pin-check' : 'tabler:alert-triangle'} 
                style={{ fontSize: 16, color: attendance.checkInLocation.isValid ? '#22C55E' : '#F59E0B' }} 
              />
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                {attendance.checkInLocation.distance !== null && attendance.checkInLocation.distance !== undefined
                  ? `${attendance.checkInLocation.distance}m from office${attendance.checkInLocation.isValid ? ' ✓' : ' ⚠'}
                  `
                  : 'Location captured'}
              </Typography>
              {attendance.checkInLocation.source === 'gps' && (
                <Chip label='GPS' size='small' color='success' sx={{ height: 18, fontSize: '0.65rem' }} />
              )}
              {attendance.checkInLocation.source === 'unit_default' && (
                <Chip label='Office' size='small' color='default' sx={{ height: 18, fontSize: '0.65rem' }} />
              )}
            </Box>
          )}
          
          <Button
            fullWidth
            variant='contained'
            color='error'
            size='small'
            onClick={handlePunchOutClick}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Icon icon='tabler:logout' />}
          >
            {loading ? 'Punching Out...' : 'Punch Out'}
          </Button>
        </Box>
      )}

      {/* ── Clocked-In Employees Preview ──────────────────────────────── */}
      {clockedInEmployees.length > 0 && (
        <Box sx={{ px: 6, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
            Currently Clocked In ({clockedInEmployees.length})
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <AvatarGroup
              max={4}
              className='pull-up'
              sx={{
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  fontSize: theme => theme.typography.body2.fontSize,
                  cursor: 'pointer'
                },
              }}
            >
              {clockedInEmployees.map(emp => (
                <Tooltip key={emp.attendanceId} title={`${emp.name} - ${formatPunchInTime(emp.checkIn)}`} arrow>
                  <Avatar
                    alt={emp.name}
                    src={emp.profilePhoto}
                    sx={{ 
                      backgroundColor: 'primary.main',
                      border: emp.isWFH ? '2px solid #0EA5E9' : '2px solid #22C55E'
                    }}
                  >
                    {emp.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>
        </Box>
      )}

      {/* ── Attendance Drawer ──────────────────────────────────────────────── */}
      <Drawer
        anchor='right'
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, p: 4 }
        }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Mark Attendance
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <Icon icon='tabler:x' />
          </IconButton>
        </Box>

        {!attendance?.isPunchedIn ? (
          /* ── Punch In Section ──────────────────────────────── */
          <Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              Mark your attendance for today
            </Typography>

            {/* WFH Checkbox */}
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isWFH}
                    onChange={(e) => setIsWFH(e.target.checked)}
                    disabled={loading}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='body2'>Work from Home</Typography>
                    <Icon icon='tabler:home' style={{ fontSize: 16, color: '#0EA5E9' }} />
                  </Box>
                }
              />
            </Box>

            {/* Location Info */}
            {!isWFH && (
              <Box sx={{ mb: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Icon icon='tabler:map-pin' style={{ color: '#22C55E' }} />
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    Location Tracking Required
                  </Typography>
                </Box>
                <Typography variant='caption' color='text.secondary'>
                  Your location will be captured for attendance validation
                </Typography>
                {locationError && (
                  <Typography variant='caption' color='error.main' sx={{ display: 'block', mt: 1 }}>
                    {locationError}
                  </Typography>
                )}
              </Box>
            )}

            <Button
              fullWidth
              variant='contained'
              color='success'
              size='large'
              onClick={handlePunchIn}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Icon icon='tabler:login' />}
              sx={{ mb: 3 }}
            >
              {loading ? 'Punching In...' : 'Punch In'}
            </Button>

            {/* Clocked In List */}
            {clockedInEmployees.length > 0 && (
              <Box>
                <Typography variant='body2' sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                  Clocked In Today ({clockedInEmployees.length})
                </Typography>
                {clockedInEmployees.map(emp => (
                  <Box
                    key={emp.attendanceId}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      mb: 1,
                      backgroundColor: 'background.paper',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Avatar
                      src={emp.profilePhoto}
                      sx={{ width: 40, height: 40, backgroundColor: 'primary.main' }}
                    >
                      {emp.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {emp.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {emp.designation} • {formatPunchInTime(emp.checkIn)}
                      </Typography>
                    </Box>
                    {emp.isWFH && (
                      <Chip label='WFH' size='small' color='info' />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ) : (
          /* ── Already Punched In ──────────────────────────────── */
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  animation: 'pulse 2s infinite'
                }}
              >
                <Icon icon='tabler:check' style={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
                {formatTime(elapsedTime)}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Working since {formatPunchInTime(attendance?.checkIn)}
              </Typography>
              {attendance?.isWFH && (
                <Chip label='Working from Home' color='info' size='small' sx={{ mt: 1 }} />
              )}
            </Box>

            {/* Location Details Card */}
            {attendance?.checkInLocation && !attendance?.isWFH && (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: attendance.checkInLocation.isValid ? 'success.main' : 'warning.main'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon 
                      icon={attendance.checkInLocation.isValid ? 'tabler:map-pin-check' : 'tabler:alert-triangle'} 
                      style={{ fontSize: 20, color: attendance.checkInLocation.isValid ? '#22C55E' : '#F59E0B' }} 
                    />
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      Location Status
                    </Typography>
                  </Box>
                  <Chip 
                    label={attendance.checkInLocation.isValid ? 'Valid' : 'Warning'} 
                    size='small' 
                    color={attendance.checkInLocation.isValid ? 'success' : 'warning'}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {attendance.checkInLocation.distance !== null && attendance.checkInLocation.distance !== undefined && (
                    <Typography variant='caption' color='text.secondary'>
                      📍 Distance from office: {attendance.checkInLocation.distance}m
                    </Typography>
                  )}
                  {attendance.checkInLocation.accuracy && (
                    <Typography variant='caption' color='text.secondary'>
                      🎯 GPS Accuracy: {Math.round(attendance.checkInLocation.accuracy)}m
                    </Typography>
                  )}
                  <Typography variant='caption' color='text.secondary'>
                    📱 Source: {attendance.checkInLocation.source === 'gps' ? 'Device GPS' : attendance.checkInLocation.source === 'unit_default' ? 'Office Location' : attendance.checkInLocation.source}
                  </Typography>
                </Box>
              </Box>
            )}

            <Button
              fullWidth
              variant='contained'
              color='error'
              size='large'
              onClick={handlePunchOutClick}
              disabled={loading}
              startIcon={<Icon icon='tabler:logout' />}
            >
              Punch Out
            </Button>
          </Box>
        )}
      </Drawer>

      {/* ── Punch Out Dialog ──────────────────────────────────────────────── */}
      <Dialog open={punchOutDialog} onClose={() => setPunchOutDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            Punch Out
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Please provide a reason for punching out
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label='Reason for punch out'
            placeholder='e.g., End of work day, Going for meeting, etc.'
            value={punchOutReason}
            onChange={(e) => {
              setPunchOutReason(e.target.value)
              if (e.target.value.trim()) setPunchOutReasonError('')
            }}
            error={Boolean(punchOutReasonError)}
            helperText={punchOutReasonError}
            disabled={loading}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            color='secondary'
            variant='tonal'
            onClick={() => {
              setPunchOutDialog(false)
              setPunchOutReason('')
              setPunchOutReasonError('')
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handlePunchOutConfirm}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Icon icon='tabler:logout' />}
          >
            {loading ? 'Punching Out...' : 'Confirm Punch Out'}
          </Button>
        </DialogActions>
      </Dialog>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </Fragment>
  )
}

export default AttendanceWidget
