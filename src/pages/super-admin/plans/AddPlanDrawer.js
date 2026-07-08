// src/pages/super-admin/plans/AddPlanDrawer.js
// POST /api/v1/plans
import { useEffect } from 'react'
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
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'

import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import axiosRequest from 'src/utils/AxiosInterceptor'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between',
}))

const AVAILABLE_FEATURES = [
  { key: 'employee', label: 'Employee Management' },
  { key: 'attendance', label: 'Attendance Tracking' },
  { key: 'leave', label: 'Leave Management' },
  { key: 'payroll', label: 'Payroll Processing' },
  { key: 'shift', label: 'Shift Management' },
  { key: 'roster', label: 'Roster Scheduling' },
  { key: 'delegation', label: 'Delegation' },
  { key: 'holiday', label: 'Holiday Calendar' },
  { key: 'regularisation', label: 'Regularisation' },
  { key: 'recruitment', label: 'Recruitment' },
  { key: 'performance', label: 'Performance Review' },
  { key: 'training', label: 'Training' }
]

const defaultValues = {
  name: '',
  description: '',
  features: ['employee', 'attendance', 'leave', 'payroll'],
  seatLimit: 10,
  price: 0,
  billingCycle: 'monthly',
  trialDays: 14,
  status: 'draft'
}

export default function AddPlanDrawer({ open, toggle, onSuccess }) {
  const { control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({ defaultValues })

  const selectedFeatures = watch('features', [])

  const handleFeatureToggle = (featureKey) => {
    const currentFeatures = selectedFeatures || []
    if (currentFeatures.includes(featureKey)) {
      setValue('features', currentFeatures.filter(f => f !== featureKey))
    } else {
      setValue('features', [...currentFeatures, featureKey])
    }
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        features: data.features,
        price: Number(data.price),
        seatLimit: Number(data.seatLimit),
        trialDays: Number(data.trialDays)
      }
      await axiosRequest.post('/api/v1/plans', payload)
      toast.success('Plan created successfully!')
      reset()
      toggle()
      if (onSuccess) onSuccess()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to create plan')
    }
  }

  const handleClose = () => {
    reset()
    toggle()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 520 } } }}
    >
      <Header>
        <Typography variant='h5' sx={{ fontWeight: 700 }}>Create Subscription Plan</Typography>
        <IconButton size='small' onClick={handleClose} sx={{ borderRadius: 1, color: 'text.primary', backgroundColor: 'action.selected' }}>
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>

      <Box sx={{ p: 6 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Alert severity='info' sx={{ fontSize: 12 }}>
              Define features and limits. Features can be modified after plan creation.
            </Alert>

            <Controller name='name' control={control}
              rules={{ required: 'Plan name is required' }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Plan Name *'
                  placeholder='e.g., Starter, Teams, Enterprise'
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )} />

            <Controller name='description' control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  label='Description'
                  placeholder='Plan features and benefits...'
                />
              )} />

            <Box>
              <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>Features Included *</Typography>
              <Grid container spacing={2}>
                {AVAILABLE_FEATURES.map(feature => (
                  <Grid item xs={6} key={feature.key}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedFeatures?.includes(feature.key) || false}
                          onChange={() => handleFeatureToggle(feature.key)}
                          size='small'
                        />
                      }
                      label={<Typography variant='body2'>{feature.label}</Typography>}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Grid container spacing={4}>
              <Grid item xs={6}>
                <Controller name='seatLimit' control={control}
                  rules={{ required: 'Seat limit required', min: { value: 1, message: 'Minimum 1 seat' } }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Seat Limit *'
                      error={!!errors.seatLimit}
                      helperText={errors.seatLimit?.message}
                    />
                  )} />
              </Grid>
              <Grid item xs={6}>
                <Controller name='price' control={control}
                  rules={{ min: { value: 0, message: 'Price cannot be negative' } }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Price (₹/month)'
                      error={!!errors.price}
                      helperText={errors.price?.message}
                    />
                  )} />
              </Grid>
            </Grid>

            <Grid container spacing={4}>
              <Grid item xs={6}>
                <Controller name='billingCycle' control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      select
                      label='Billing Cycle'
                    >
                      <MenuItem value='monthly'>Monthly</MenuItem>
                      <MenuItem value='quarterly'>Quarterly</MenuItem>
                      <MenuItem value='yearly'>Yearly</MenuItem>
                    </CustomTextField>
                  )} />
              </Grid>
              <Grid item xs={6}>
                <Controller name='trialDays' control={control}
                  rules={{ min: { value: 0, message: 'Cannot be negative' } }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Trial Days'
                      error={!!errors.trialDays}
                      helperText={errors.trialDays?.message}
                    />
                  )} />
              </Grid>
            </Grid>

            <Controller name='status' control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth select label='Status'>
                  <MenuItem value='draft'>Draft</MenuItem>
                  <MenuItem value='active'>Active</MenuItem>
                  <MenuItem value='inactive'>Inactive</MenuItem>
                </CustomTextField>
              )} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button variant='outlined' onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant='contained' type='submit' disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} /> : null}>
                Create Plan
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}
