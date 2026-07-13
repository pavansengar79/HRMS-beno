// src/components/LocationPicker.js
// Google Maps-based geolocation picker for unit creation/editing

import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Slider from '@mui/material/Slider'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Icon from 'src/@core/components/icon'
import { INDIAN_STATES, CITIES_BY_STATE, getCitiesForState } from 'src/utils/locationConstants'

const LocationPicker = ({ value = {}, onChange }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedState, setSelectedState] = useState(value?.address?.stateCode || '')
  const [cities, setCities] = useState([])

  // Update cities when state changes
  useEffect(() => {
    if (selectedState) {
      setCities(getCitiesForState(selectedState))
    } else {
      setCities([])
    }
  }, [selectedState])

  // Reverse geocode coordinates to address (using Google Maps API if available)
  const reverseGeocode = useCallback(async (lat, lng) => {
    // If Google Maps API is loaded
    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder()
      
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = parseGeocodeResult(results[0])
          onChange({
            ...value,
            address
          })
        }
      })
    }
  }, [value, onChange])

  // Get current location using browser API
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        onChange({
          ...value,
          latitude,
          longitude,
          accuracy
        })
        
        setLoading(false)
        
        // Optional: Reverse geocode to get address
        reverseGeocode(latitude, longitude)
      },
      (err) => {
        setError(`Failed to get location: ${err.message}`)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }, [value, onChange, reverseGeocode])

  // Parse Google Geocode result
  const parseGeocodeResult = (result) => {
    const components = result.address_components
    const getComponent = (type) => 
      components.find(c => c.types.includes(type))?.long_name || ''
    const getComponentShort = (type) => 
      components.find(c => c.types.includes(type))?.short_name || ''

    return {
      formatted: result.formatted_address,
      street: getComponent('route') || getComponent('street_address'),
      city: getComponent('locality') || getComponent('administrative_area_level_3'),
      state: getComponent('administrative_area_level_1'),
      stateCode: getComponentShort('administrative_area_level_1'),
      country: getComponent('country'),
      countryCode: getComponentShort('country'),
      pincode: getComponent('postal_code')
    }
  }

  // Manual address input handlers
  const handleAddressChange = (field) => (e) => {
    onChange({
      ...value,
      address: {
        ...value?.address,
        [field]: e.target.value
      }
    })
  }

  const handleStateChange = (e) => {
    const stateCode = e.target.value
    setSelectedState(stateCode)
    
    const stateObj = INDIAN_STATES.find(s => s.value === stateCode)
    
    onChange({
      ...value,
      address: {
        ...value?.address,
        state: stateObj?.label || '',
        stateCode: stateCode,
        country: 'India',
        countryCode: 'IN'
      }
    })
  }

  const handleRadiusChange = (event, newValue) => {
    onChange({
      ...value,
      radiusMeters: newValue
    })
  }

  const radiusMarks = [
    { value: 50, label: '50m' },
    { value: 100, label: '100m' },
    { value: 200, label: '200m' },
    { value: 500, label: '500m' },
    { value: 1000, label: '1km' }
  ]

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant='subtitle2' sx={{ mb: 2, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.75rem' }}>
        Geolocation (Pick from Map)
      </Typography>

      {/* Get Current Location Button */}
      <Button
        variant='outlined'
        startIcon={loading ? <CircularProgress size={16} /> : <Icon icon='tabler:map-pin' />}
        onClick={getCurrentLocation}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Getting Location...' : 'Get Current Location'}
      </Button>

      {/* Display coordinates */}
      {value?.latitude && value?.longitude && (
        <Alert severity='success' sx={{ mb: 2 }}>
          <Typography variant='body2'>
            📍 Location: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
            {value?.accuracy && ` (±${Math.round(value.accuracy)}m accuracy)`}
          </Typography>
        </Alert>
      )}

      {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}

      {/* Radius slider */}
      {value?.latitude && (
        <Box sx={{ mb: 4, px: 2 }}>
          <Typography variant='body2' fontWeight={500} sx={{ mb: 2 }}>
            Geo-fencing Radius (meters)
          </Typography>
          <Slider
            value={value?.radiusMeters || 200}
            onChange={handleRadiusChange}
            min={50}
            max={1000}
            step={10}
            marks={radiusMarks}
            valueLabelDisplay='auto'
          />
          <Typography variant='caption' color='text.secondary'>
            Employees must be within {value?.radiusMeters || 200}m of this location to punch in
          </Typography>
        </Box>
      )}

      {/* Manual Address Input */}
      <Typography variant='subtitle2' sx={{ mb: 2, mt: 4, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.75rem' }}>
        Address Details
      </Typography>

      <Grid container spacing={3}>
        {/* State selector */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label='State'
            value={selectedState}
            onChange={handleStateChange}
            helperText='Select state'
          >
            {INDIAN_STATES.map(state => (
              <MenuItem key={state.value} value={state.value}>
                {state.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* City selector */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label='City'
            value={value?.address?.city || ''}
            onChange={handleAddressChange('city')}
            helperText={cities.length === 0 ? 'Select state first' : 'Select city'}
            disabled={cities.length === 0}
          >
            {cities.map(city => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Street address */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Street Address'
            value={value?.address?.street || ''}
            onChange={handleAddressChange('street')}
            placeholder='Enter street address'
          />
        </Grid>

        {/* Pincode */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Pincode'
            value={value?.address?.pincode || ''}
            onChange={handleAddressChange('pincode')}
            placeholder='6-digit pincode'
            inputProps={{ maxLength: 6 }}
          />
        </Grid>

        {/* Country */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Country'
            value={value?.address?.country || 'India'}
            onChange={handleAddressChange('country')}
            disabled
          />
        </Grid>
      </Grid>

      {/* Location Preview */}
      {value?.latitude && value?.address?.city && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            <strong>Preview:</strong> {value.address.formatted || `${value.address.street}, ${value.address.city}, ${value.address.state} - ${value.address.pincode}`}
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Chip
              label={`Lat: ${value.latitude.toFixed(4)}`}
              size='small'
              icon={<Icon icon='tabler:map-pin' fontSize='0.75rem' />}
            />
            <Chip
              label={`Lng: ${value.longitude.toFixed(4)}`}
              size='small'
            />
            <Chip
              label={`Radius: ${value.radiusMeters || 200}m`}
              size='small'
              color='primary'
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default LocationPicker

// Note: Add this to your HTML head for Google Maps support:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
