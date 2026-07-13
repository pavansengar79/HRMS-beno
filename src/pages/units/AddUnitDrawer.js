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
import { createUnit, fetchUnits } from 'src/store/unit/unitSlice'
import { fetchLOBs, selectAllLOBs } from 'src/store/lob/lobSlice'
import LocationPicker from 'src/components/LocationPicker'

const Header = styled(Box)(({ theme }) => ({ display: 'flex', alignItems: 'center', padding: theme.spacing(6), justifyContent: 'space-between' }))
const schema = yup.object().shape({
  lob_id: yup.string().required('LOB is required'),
  name: yup.string().required('Unit name is required'),
  admin_name: yup.string().required('Admin name is required'),
  admin_email: yup.string().email('Enter valid email').required('Admin email is required'),
})

const AddUnitDrawer = ({ open, toggle }) => {
  const [loading, setLoading] = useState(false)
  const [geolocation, setGeolocation] = useState({})
  const [locationSettings, setLocationSettings] = useState({
    geoFencingEnabled: false,
    allowOutsidePunch: false,
    requireExactMatch: false
  })
  
  const dispatch = useDispatch()
  const lobs = useSelector(selectAllLOBs)
  useEffect(() => { if (open) dispatch(fetchLOBs()) }, [open, dispatch])
  
  const { reset, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { lob_id: '', name: '', location: '', admin_name: '', admin_email: '', admin_phone: '' },
    mode: 'onChange', resolver: yupResolver(schema)
  })
  
  const onSubmit = async data => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        ...(Object.keys(geolocation).length > 0 && { geolocation }),
        locationSettings
      }
      
      await dispatch(createUnit(payload)).unwrap()
      toast.success('Unit created! Admin credentials sent via email.')
      dispatch(fetchUnits())
      toggle()
      reset()
      setGeolocation({})
    }
    catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed')
    }
    finally { setLoading(false) }
  }
  
  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={() => { toggle(); reset() }}
      ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 500, md: 600 }, overflowY: 'auto' } }}>
      <Header>
        <Typography variant='h5'>Add Unit</Typography>
        <IconButton size='small' onClick={() => { toggle(); reset() }}><Icon icon='tabler:x' fontSize='1.125rem' /></IconButton>
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
        
        <Typography variant='subtitle2' sx={{ mb: 2, mt: 4, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.75rem' }}>Unit Admin</Typography>
        <Controller name='admin_name' control={control} render={({ field }) => (
          <CustomTextField {...field} fullWidth label='Admin Name' sx={{ mb: 4 }} error={!!errors.admin_name} helperText={errors.admin_name?.message} />
        )} />
        <Controller name='admin_email' control={control} render={({ field }) => (
          <CustomTextField {...field} fullWidth label='Admin Email' sx={{ mb: 4 }} error={!!errors.admin_email} helperText={errors.admin_email?.message} />
        )} />
        <Controller name='admin_phone' control={control} render={({ field }) => (
          <CustomTextField {...field} fullWidth label='Admin Phone (optional)' sx={{ mb: 4 }} />
        )} />
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Button fullWidth type='submit' variant='contained' disabled={loading}>{loading ? <CircularProgress size={20} /> : 'Create'}</Button>
          <Button fullWidth variant='tonal' color='secondary' onClick={() => { toggle(); reset() }}>Cancel</Button>
        </Box>
      </Box>
    </Drawer>
  )
}
export default AddUnitDrawer
