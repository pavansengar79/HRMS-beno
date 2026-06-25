// src/pages/customers/AddCustomerDrawer.js
// POST /api/v1/super-admin/customers
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'

import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'

import {
  createCustomer,
  fetchPublicPlans,
  fetchAllCustomers,
  selectPlans,
  selectPlansLoading,
  selectCreateLoading,
} from 'src/store/customer/customerSlice'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between',
}))

const defaultValues = {
  business_name: '',
  contact_name:  '',
  contact_email: '',
  contact_phone: '',
  plan_id:       '',
  country:       'India',
  industry:      '',
}

export default function AddCustomerDrawer({ open, toggle }) {
  const dispatch     = useDispatch()
  const plans        = useSelector(selectPlans)
  const plansLoading = useSelector(selectPlansLoading)
  const submitting   = useSelector(selectCreateLoading)

  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues })

  useEffect(() => {
    if (open && plans.length === 0) dispatch(fetchPublicPlans())
  }, [open])

  const onSubmit = async data => {
    try {
      await dispatch(createCustomer(data)).unwrap()
      toast.success('Customer created! Login credentials sent via email.')
      reset()
      toggle()
      dispatch(fetchAllCustomers({}))
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to create customer')
    }
  }

  const handleClose = () => { reset(); toggle() }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 420 } } }}
    >
      <Header>
        <Typography variant='h5' sx={{ fontWeight: 700 }}>Add Customer</Typography>
        <IconButton size='small' onClick={handleClose}
          sx={{ borderRadius: 1, color: 'text.primary', backgroundColor: 'action.selected' }}>
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>

      <Box sx={{ p: 6 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>

            <Controller name='business_name' control={control}
              rules={{ required: 'Business name is required' }}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth label='Business Name *'
                  error={!!errors.business_name} helperText={errors.business_name?.message} />
              )} />

            <Controller name='contact_name' control={control}
              rules={{ required: 'Contact name is required' }}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth label='Contact Person *'
                  error={!!errors.contact_name} helperText={errors.contact_name?.message} />
              )} />

            <Controller name='contact_email' control={control}
              rules={{ required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } }}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth label='Contact Email *' type='email'
                  error={!!errors.contact_email} helperText={errors.contact_email?.message} />
              )} />

            <Controller name='contact_phone' control={control}
              rules={{ required: 'Phone is required' }}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth label='Contact Phone *'
                  error={!!errors.contact_phone} helperText={errors.contact_phone?.message} />
              )} />

            <Controller name='plan_id' control={control}
              rules={{ required: 'Please select a plan' }}
              render={({ field }) => (
                <CustomTextField {...field} select fullWidth label='Plan *'
                  error={!!errors.plan_id} helperText={errors.plan_id?.message}
                  disabled={plansLoading}>
                  {plansLoading
                    ? <MenuItem value=''>Loading...</MenuItem>
                    : plans.map(p => (
                        <MenuItem key={p._id} value={p._id}>
                          {p.name} {p.price_monthly ? `— ₹${p.price_monthly}/mo` : ''}
                        </MenuItem>
                      ))}
                </CustomTextField>
              )} />

            <Controller name='industry' control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth label='Industry' />
              )} />

            <Controller name='country' control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth label='Country' />
              )} />

            <Box sx={{ display: 'flex', gap: 4, pt: 2 }}>
              <Button fullWidth variant='contained' type='submit' disabled={submitting}>
                {submitting ? <CircularProgress size={20} color='inherit' /> : 'Create Customer'}
              </Button>
              <Button fullWidth variant='tonal' color='secondary' onClick={handleClose}>
                Cancel
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}
