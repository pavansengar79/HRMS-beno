// src/components/Attendance/GeoLocationCapture.js
// Capture geolocation during punch-in/punch-out

import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Icon from 'src/@core/components/icon'

const GeoLocationCapture = ({ onLocationCaptured, disabled = false }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState(null)

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        const locationData = {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date()
        }
        
        setLocation(locationData)
        onLocationCaptured(locationData)
        setLoading(false)
      },
      (err) => {
        // Don't block punch-in if location fails
        console.warn('Location capture failed:', err.message)
        setError(`Could not get location: ${err.message}. Punch-in will continue without location.`)
        setLoading(false)
        // Still call the callback with null to allow punch-in
        onLocationCaptured(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000, // Quick timeout - don't make user wait
        maximumAge: 30000
      }
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Manual capture button */}
      <Button
        variant='outlined'
        size='small'
        startIcon={loading ? <CircularProgress size={16} /> : <Icon icon='tabler:map-pin' />}
        onClick={captureLocation}
        disabled={disabled || loading}
      >
        {loading ? 'Capturing...' : location ? 'Update Location' : 'Capture My Location'}
      </Button>

      {/* Location preview */}
      {location && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon='tabler:check' color='success.main' fontSize='1rem' />
          <Typography variant='caption' color='success.main'>
            Location captured
          </Typography>
          <Chip
            label={`±${Math.round(location.accuracy)}m`}
            size='small'
            variant='tonal'
            color='primary'
          />
        </Box>
      )}

      {/* Error message (non-blocking) */}
      {error && (
        <Alert severity='warning' sx={{ mt: 1, fontSize: '0.75rem' }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}

export default GeoLocationCapture
