// src/pages/units/EditUnitDrawer.js
// Edit existing Business Unit (same structure as AddUnitDrawer)

import { useState, useEffect } from 'react'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import CustomTextField from 'src/@core/components/mui/text-field'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { updateUnit, fetchUnits, selectAllUnits } from 'src/store/unit/unitSlice'
import { fetchLOBs, selectAllLOBs } from 'src/store/lob/lobSlice'
import LocationPicker from 'src/components/LocationPicker'

const Header = styled(Box)(({ theme }) => ({ display: 'flex', alignItems: 'center', padding: theme.spacing(6), justifyContent: 'space-between' }))

const schema = yup.object().shape({
  lob_id: yup.string().required('LOB is required'),
  name: yup.string().required('Unit name is required'),
})

const EditUnitDrawer = ({ open, unitId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [geolocation, setGeolocation] = useState({})
  const [locationSettings, setLocationSettings] = useState({
    geoFencingEnabled: false,
    allowOutsidePunch: false,
    requireExactMatch: false
  })
  
  const dispatch = useDispatch()
  const lobs = useSelector(selectAllLOBs)
  const units = useSelector(selectAllUnits)
  const unit = units.find(u => u._id === unitId)

  // Fetch LOBs when drawer opens
  useEffect(() => {
    if (open) {
      dispatch(fetchLOBs())
    }
  }, [open, dispatch])

  // Prefill when unit data is available
  useEffect(() => {
    if (unit && open) {
      // Prefill geolocation
      setGeolocation(unit.geolocation || {})
      
      // Prefill location settings
      setLocationSettings({
        geoFencingEnabled: unit.locationSettings?.geoFencingEnabled || false,
        allowOutsidePunch: unit.locationSettings?.allowOutsidePunch || false,
        requireExactMatch: unit.locationSettings?.requireExactMatch || false
      })
    }
  }, [unit, open])
  
  const { reset, control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { lob_id: '', name: '', location: '' },
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  // Set form values when unit data loads
  useEffect(() => {
    if (unit) {
      setValue('lob_id', unit.lob_id?._id || unit.lob_id || '')
      setValue('name', unit.name || '')
      setValue('location', unit.location || '')
    }
  }, [unit, setValue])
  
  const onSubmit = async data => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        ...(Object.keys(geolocation).length > 0 && { geolocation }),
        locationSettings
      }
      
      await dispatch(updateUnit({ id: unitId, payload })).unwrap()
      toast.success('Unit updated successfully')
      dispatch(fetchUnits())
      onSuccess?.()
      onClose()
    }
    catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed to update unit')
    }
    finally { setLoading(false) }
  }
  
  const handleClose = () => {
    reset()
    setGeolocation({})
    setLocationSettings({
      geoFencingEnabled: false,
      allowOutsidePunch: false,
      requireExactMatch: false
    })
    onClose()
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={handleClose}
      ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 500, md: 600 }, overflowY: 'auto' } }}>
      <Header>
        <Typography variant='h5'>Edit Unit</Typography>
        <IconButton size='small' onClick={handleClose}><Icon icon='tabler:x' fontSize='1.125rem' /></IconButton>
      </Header>
      <Box component='form' onSubmit={handleSubmit(onSubmit)} sx={{ p: 6 }}>
        <Controller name='lob_id' control={control} render={({ field }) => (
          <CustomTextField {...field} select fullWidth label='LOB' sx={{ mb: 4 }} error={!!errors.lob_id} helperText={errors.lob_id?.message}>
            {lobs.map(l => <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>)}
          </CustomTextField>
        )} />
        <Controller name='name' control={control} render={({ field }) => (
          <CustomTextField {...field} fullWidth label='Unit Name' sx={{ mb: 4 }} error={!!errors.name} helperText={errors.name?.message} />
        )} />
        <Controller name='location' control={control} render={({ field }) => (
          <CustomTextField {...field} fullWidth label='Location Description (optional)' sx={{ mb: 2 }} placeholder='e.g., Mumbai Tech Park' />
        )} />
        
        {/* Geolocation Picker */}
        <LocationPicker value={geolocation} onChange={setGeolocation} />
        
        {/* Location Settings */}
        {geolocation?.latitude && (
          <Box sx={{ mt: 4 }}>
            <Typography variant='subtitle2' sx={{ mb: 2, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              Geofencing Settings
            </Typography>
            <FormControlLabel
              control={<Switch checked={locationSettings.geoFencingEnabled} onChange={(e) => setLocationSettings({...locationSettings, geoFencingEnabled: e.target.checked})} />}
              label='Enable Geo-fencing for Attendance'
            />
            {locationSettings.geoFencingEnabled && (
              <>
                <FormControlLabel
                  control={<Switch checked={locationSettings.allowOutsidePunch} onChange={(e) => setLocationSettings({...locationSettings, allowOutsidePunch: e.target.checked})} />}
                  label='Allow punch outside radius (with warning)'
                />
                <FormControlLabel
                  control={<Switch checked={locationSettings.requireExactMatch} onChange={(e) => setLocationSettings({...locationSettings, requireExactMatch: e.target.checked})} />}
                  label='Strict radius check (block if outside)'
                />
              </>
            )}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 4, mt: 6 }}>
          <Button fullWidth type='submit' variant='contained' disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
          <Button fullWidth variant='tonal' color='secondary' onClick={handleClose}>Cancel</Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default EditUnitDrawer
