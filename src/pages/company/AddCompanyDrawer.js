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

const showErrors = (field, valueLen, min) => {
  if (valueLen === 0) {
    return `${field} field is required`
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`
  } else {
    return ''
  }
}

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const schema = yup.object().shape({
  addressLine1: yup.string().required(),
  addressLine2: yup.string(),
  city: yup.string().required(),
  stateProvince: yup.string().required(),
  zipPostalCode: yup.string().required()
})

const defaultValues = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  stateProvince: '',
  zipPostalCode: ''
}

const AddCompanyDrawer = props => {
  // ** Props
  const { open, toggle } = props

  // ** State
  const [country, setCountry] = useState('')
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
    // TODO: Implement API call
    console.log('Company data:', { ...data, country, timezone })
    toggle()
    reset()
    setCountry('')
    setTimezone('')
  }

  const handleClose = () => {
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
        <Typography variant='h5'>Add Company</Typography>
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
          <Controller
            name='addressLine1'
            control={control}
            rules={{ required: true }}
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
                placeholder='Apt 4B'
                error={Boolean(errors.addressLine2)}
                {...(errors.addressLine2 && { helperText: errors.addressLine2.message })}
              />
            )}
          />
          <Controller
            name='city'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='City'
                onChange={onChange}
                placeholder='New York'
                error={Boolean(errors.city)}
                {...(errors.city && { helperText: errors.city.message })}
              />
            )}
          />
          <Controller
            name='stateProvince'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='State / Province'
                onChange={onChange}
                placeholder='NY'
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
            <MenuItem value='USA'>United States</MenuItem>
            <MenuItem value='Canada'>Canada</MenuItem>
            <MenuItem value='UK'>United Kingdom</MenuItem>
            <MenuItem value='Australia'>Australia</MenuItem>
            <MenuItem value='Germany'>Germany</MenuItem>
            <MenuItem value='France'>France</MenuItem>
            <MenuItem value='Japan'>Japan</MenuItem>
            <MenuItem value='India'>India</MenuItem>
            <MenuItem value='Brazil'>Brazil</MenuItem>
            <MenuItem value='Mexico'>Mexico</MenuItem>
          </CustomTextField>
          <Controller
            name='zipPostalCode'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Zip / Postal Code'
                onChange={onChange}
                placeholder='10001'
                error={Boolean(errors.zipPostalCode)}
                {...(errors.zipPostalCode && { helperText: errors.zipPostalCode.message })}
              />
            )}
          />
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
            <MenuItem value='UTC-12'>UTC-12:00</MenuItem>
            <MenuItem value='UTC-11'>UTC-11:00</MenuItem>
            <MenuItem value='UTC-10'>UTC-10:00</MenuItem>
            <MenuItem value='UTC-9'>UTC-09:00</MenuItem>
            <MenuItem value='UTC-8'>UTC-08:00 (PST)</MenuItem>
            <MenuItem value='UTC-7'>UTC-07:00 (MST)</MenuItem>
            <MenuItem value='UTC-6'>UTC-06:00 (CST)</MenuItem>
            <MenuItem value='UTC-5'>UTC-05:00 (EST)</MenuItem>
            <MenuItem value='UTC-4'>UTC-04:00</MenuItem>
            <MenuItem value='UTC-3'>UTC-03:00</MenuItem>
            <MenuItem value='UTC-2'>UTC-02:00</MenuItem>
            <MenuItem value='UTC-1'>UTC-01:00</MenuItem>
            <MenuItem value='UTC+0'>UTC+00:00 (GMT)</MenuItem>
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
            <MenuItem value='UTC+11'>UTC+11:00</MenuItem>
            <MenuItem value='UTC+12'>UTC+12:00</MenuItem>
          </CustomTextField>
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

export default AddCompanyDrawer