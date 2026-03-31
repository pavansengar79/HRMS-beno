// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Redux
import { useDispatch } from 'react-redux'
import { addCustomer } from 'src/store/customer/customerSlice'

// ─── Header ──────────────────────────────────
const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

// ─── Validation ───────────────────────────────
const schema = yup.object().shape({
  customerName:  yup.string().required('Customer name is required'),
  customerEmail: yup.string().email('Must be a valid email').required('Email is required'),
  customerPhone: yup.string().required('Phone is required'),
  subdomain:     yup
    .string()
    .matches(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens')
    .required('Subdomain is required'),
  addressLine1:  yup.string().required('Address is required'),
  addressLine2:  yup.string(),
  city:          yup.string().required('City is required'),
  stateProvince: yup.string().required('State / Province is required'),
  zipPostalCode: yup.string().required('Zip / Postal Code is required')
})

const defaultValues = {
  customerName:  '',
  customerEmail: '',
  customerPhone: '',
  subdomain:     '',
  addressLine1:  '',
  addressLine2:  '',
  city:          '',
  stateProvince: '',
  zipPostalCode: ''
}

// ─── Component ────────────────────────────────
const AddCustomerDrawer = ({ open, toggle }) => {
  const dispatch = useDispatch()

  const [plan,     setPlan]     = useState('')
  const [country,  setCountry]  = useState('')
  const [timezone, setTimezone] = useState('')

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const onSubmit = data => {
    // Dispatch to local slice — API call will be wired here later
    dispatch(addCustomer({
      ...data,
      plan:     plan     || 'FREE',
      country:  country  || '',
      timezone: timezone || ''
    }))
    handleClose()
  }

  const handleClose = () => {
    setPlan('')
    setCountry('')
    setTimezone('')
    toggle()
    reset()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Header>
        <Typography variant='h5'>Add Customer</Typography>
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{
            p: '0.438rem',
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>

      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* ── Customer Identity ─────────────── */}
          <Typography variant='subtitle2' sx={{ mb: 3, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Customer Identity
          </Typography>

          <Controller
            name='customerName'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Customer Name'
                onChange={onChange}
                placeholder='Acme Corporation'
                error={Boolean(errors.customerName)}
                {...(errors.customerName && { helperText: errors.customerName.message })}
              />
            )}
          />

          <Controller
            name='customerEmail'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Email'
                onChange={onChange}
                placeholder='admin@acme.com'
                error={Boolean(errors.customerEmail)}
                {...(errors.customerEmail && { helperText: errors.customerEmail.message })}
              />
            )}
          />

          <Controller
            name='customerPhone'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Phone'
                onChange={onChange}
                placeholder='+91 98765 43210'
                error={Boolean(errors.customerPhone)}
                {...(errors.customerPhone && { helperText: errors.customerPhone.message })}
              />
            )}
          />

          {/* ── Subscription Plan ─────────────── */}
          <Typography variant='subtitle2' sx={{ mb: 3, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Subscription Plan
          </Typography>

          <CustomTextField
            select
            fullWidth
            value={plan}
            sx={{ mb: 4 }}
            label='Plan'
            onChange={e => setPlan(e.target.value)}
            SelectProps={{ value: plan, onChange: e => setPlan(e.target.value) }}
          >
            <MenuItem value=''>Select Plan</MenuItem>
            <MenuItem value='FREE'>Free</MenuItem>
            <MenuItem value='GROWTH'>Growth</MenuItem>
            <MenuItem value='ENTERPRISE'>Enterprise</MenuItem>
          </CustomTextField>

          {/* ── Tenant Setup ──────────────────── */}
          <Typography variant='subtitle2' sx={{ mb: 3, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Tenant Setup
          </Typography>

          <Controller
            name='subdomain'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Subdomain'
                onChange={onChange}
                placeholder='acme'
                error={Boolean(errors.subdomain)}
                helperText={errors.subdomain ? errors.subdomain.message : 'e.g. acme → acme.1b.app'}
              />
            )}
          />

          {/* ── Address ───────────────────────── */}
          <Typography variant='subtitle2' sx={{ mb: 3, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Address
          </Typography>

          <Controller
            name='addressLine1'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Address Line 1'
                onChange={onChange}
                placeholder='123 Main Street'
                error={Boolean(errors.addressLine1)}
                {...(errors.addressLine1 && { helperText: errors.addressLine1.message })}
              />
            )}
          />

          <Controller
            name='addressLine2'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Address Line 2'
                onChange={onChange}
                placeholder='Floor 4, Block B'
              />
            )}
          />

          <Controller
            name='city'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='City'
                onChange={onChange}
                placeholder='Mumbai'
                error={Boolean(errors.city)}
                {...(errors.city && { helperText: errors.city.message })}
              />
            )}
          />

          <Controller
            name='stateProvince'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='State / Province'
                onChange={onChange}
                placeholder='Maharashtra'
                error={Boolean(errors.stateProvince)}
                {...(errors.stateProvince && { helperText: errors.stateProvince.message })}
              />
            )}
          />

          <CustomTextField
            select
            fullWidth
            value={country}
            sx={{ mb: 4 }}
            label='Country'
            onChange={e => setCountry(e.target.value)}
            SelectProps={{ value: country, onChange: e => setCountry(e.target.value) }}
          >
            <MenuItem value=''>Select Country</MenuItem>
            <MenuItem value='India'>India</MenuItem>
            <MenuItem value='USA'>United States</MenuItem>
            <MenuItem value='Canada'>Canada</MenuItem>
            <MenuItem value='UK'>United Kingdom</MenuItem>
            <MenuItem value='Australia'>Australia</MenuItem>
            <MenuItem value='Germany'>Germany</MenuItem>
            <MenuItem value='France'>France</MenuItem>
            <MenuItem value='Japan'>Japan</MenuItem>
            <MenuItem value='Brazil'>Brazil</MenuItem>
            <MenuItem value='Mexico'>Mexico</MenuItem>
          </CustomTextField>

          <Controller
            name='zipPostalCode'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Zip / Postal Code'
                onChange={onChange}
                placeholder='400001'
                error={Boolean(errors.zipPostalCode)}
                {...(errors.zipPostalCode && { helperText: errors.zipPostalCode.message })}
              />
            )}
          />

          {/* ── Localisation ──────────────────── */}
          <CustomTextField
            select
            fullWidth
            value={timezone}
            sx={{ mb: 6 }}
            label='Timezone'
            onChange={e => setTimezone(e.target.value)}
            SelectProps={{ value: timezone, onChange: e => setTimezone(e.target.value) }}
          >
            <MenuItem value=''>Select Timezone</MenuItem>
            <MenuItem value='UTC+5.5'>UTC+05:30 (IST)</MenuItem>
            <MenuItem value='UTC+0'>UTC+00:00 (GMT)</MenuItem>
            <MenuItem value='UTC-8'>UTC-08:00 (PST)</MenuItem>
            <MenuItem value='UTC-7'>UTC-07:00 (MST)</MenuItem>
            <MenuItem value='UTC-6'>UTC-06:00 (CST)</MenuItem>
            <MenuItem value='UTC-5'>UTC-05:00 (EST)</MenuItem>
            <MenuItem value='UTC+1'>UTC+01:00</MenuItem>
            <MenuItem value='UTC+2'>UTC+02:00</MenuItem>
            <MenuItem value='UTC+3'>UTC+03:00</MenuItem>
            <MenuItem value='UTC+4'>UTC+04:00</MenuItem>
            <MenuItem value='UTC+5'>UTC+05:00</MenuItem>
            <MenuItem value='UTC+6'>UTC+06:00</MenuItem>
            <MenuItem value='UTC+7'>UTC+07:00</MenuItem>
            <MenuItem value='UTC+8'>UTC+08:00</MenuItem>
            <MenuItem value='UTC+9'>UTC+09:00</MenuItem>
            <MenuItem value='UTC+10'>UTC+10:00</MenuItem>
            <MenuItem value='UTC+12'>UTC+12:00</MenuItem>
          </CustomTextField>

          {/* ── Actions ───────────────────────── */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button type='submit' variant='contained' sx={{ mr: 3 }}>
              Submit
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleClose}>
              Cancel
            </Button>
          </Box>

        </form>
      </Box>
    </Drawer>
  )
}

export default AddCustomerDrawer