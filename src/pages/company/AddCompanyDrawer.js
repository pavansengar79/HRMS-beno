import { useState } from 'react'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import CustomTextField from 'src/@core/components/mui/text-field'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { createCompany, fetchAllCompanies } from 'src/store/company/companySlice'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex', alignItems: 'center', padding: theme.spacing(6), justifyContent: 'space-between'
}))

const schema = yup.object().shape({
  company_name:  yup.string().required('Company name is required'),
  company_email: yup.string().email('Enter valid email').required('Company email is required'),
  company_phone: yup.string().required('Phone is required'),
  admin_name:    yup.string().required('Admin name is required'),
  admin_email:   yup.string().email('Enter valid email').required('Admin email is required'),
  admin_phone:   yup.string(),
})

const AddCompanyDrawer = ({ open, toggle }) => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const { reset, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { company_name: '', company_email: '', company_phone: '', admin_name: '', admin_email: '', admin_phone: '' },
    mode: 'onChange', resolver: yupResolver(schema)
  })

  const onSubmit = async data => {
    setLoading(true)
    try {
      await dispatch(createCompany(data)).unwrap()
      toast.success('Company created! Admin credentials sent via email.')
      dispatch(fetchAllCompanies())
      toggle(); reset()
    } catch (err) { toast.error(err || 'Failed to create company') }
    finally { setLoading(false) }
  }

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={() => { toggle(); reset() }}
      ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}>
      <Header>
        <Typography variant='h5'>Add Company</Typography>
        <IconButton size='small' onClick={() => { toggle(); reset() }}><Icon icon='tabler:x' fontSize='1.125rem' /></IconButton>
      </Header>
      <Box component='form' onSubmit={handleSubmit(onSubmit)} sx={{ p: 6 }}>
        <Typography variant='subtitle2' sx={{ mb: 2, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.75rem' }}>Company Details</Typography>
        <Controller name='company_name' control={control} render={({ field }) => (
          <CustomTextField {...field} fullWidth label='Company Name' sx={{ mb: 4 }} error={!!errors.company_name} helperText={errors.company_name?.message} />
        )} />
        <Controller name='company_email' control={control} render={({ field }) => (
          <CustomTextField {...field} fullWidth label='Company Email' sx={{ mb: 4 }} error={!!errors.company_email} helperText={errors.company_email?.message} />
        )} />
        <Controller name='company_phone' control={control} render={({ field }) => (
          <CustomTextField {...field} fullWidth label='Company Phone' sx={{ mb: 4 }} error={!!errors.company_phone} helperText={errors.company_phone?.message} />
        )} />
        <Typography variant='subtitle2' sx={{ mb: 2, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.75rem' }}>Admin Details</Typography>
        <Controller name='admin_name' control={control} render={({ field }) => (
          <CustomTextField {...field} fullWidth label='Admin Full Name' sx={{ mb: 4 }} error={!!errors.admin_name} helperText={errors.admin_name?.message} />
        )} />
        <Controller name='admin_email' control={control} render={({ field }) => (
          <CustomTextField {...field} fullWidth label='Admin Email' sx={{ mb: 4 }} error={!!errors.admin_email} helperText={errors.admin_email?.message} />
        )} />
        <Controller name='admin_phone' control={control} render={({ field }) => (
          <CustomTextField {...field} fullWidth label='Admin Phone (optional)' sx={{ mb: 4 }} />
        )} />
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Button fullWidth type='submit' variant='contained' disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Create'}
          </Button>
          <Button fullWidth variant='tonal' color='secondary' onClick={() => { toggle(); reset() }}>Cancel</Button>
        </Box>
      </Box>
    </Drawer>
  )
}
export default AddCompanyDrawer
