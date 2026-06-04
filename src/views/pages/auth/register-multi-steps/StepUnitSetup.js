// ** React Imports
import { useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** React Hook Form + Yup
import { useForm, Controller, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// ─── Static Options ───────────────────────────
const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–500', '501–1000', '1000+']
const ORG_TYPES = ['Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Sole Proprietorship', 'Trust / NGO', 'Government', 'Other']
const TIMEZONES = ['IST (UTC+5:30)', 'GST (UTC+4)', 'EST (UTC-5)', 'PST (UTC-8)', 'UTC']
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED']
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry', 'Other'
]

// ─── Validation Schema ─────────────────────────
const schema = yup.object().shape({
  companyName: yup.string().required('Company / Business Name is required'),
  location: yup.string().required('City / Location is required'),
  state: yup.string().required('State is required'),
  country: yup.string().required('Country is required'),
  address: yup.string().nullable(),
  companySize: yup.string().required('Company Size is required'),
  orgType: yup.string().required('Organisation Type is required'),
  timezone: yup.string().required(),
  currency: yup.string().required(),
  probationDays: yup.string().nullable(),
  noticePeriodDays: yup.string().nullable()
})

// ─── Component ───────────────────────────────
// Non-enterprise: direct unit setup. Company name = unit name.
// Does NOT ask for leave policy / payroll / working days (those are done inside the app).
const StepUnitSetup = ({ handleNext, handlePrev, plan }) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      companyName: '',
      location: '',
      state: '',
      country: 'India',
      address: '',
      companySize: '',
      orgType: '',
      timezone: 'IST (UTC+5:30)',
      currency: 'INR',
      probationDays: '90',
      noticePeriodDays: '30'
    }
  })

  const companyName = watch('companyName')

  // Auto-sync: unit name = company name for non-enterprise
  const onNext = handleSubmit(data => {
    handleNext({ ...data, unitName: data.companyName })
  })

  return (
    <>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          Set Up Your Unit
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Configure your business location and basic settings
        </Typography>
      </Box>

      <Alert
        severity='info'
        icon={<Icon icon='tabler:info-circle' />}
        sx={{ mb: 5, borderRadius: 2 }}
      >
        Since you are on the <strong>{plan?.charAt(0).toUpperCase()}{plan?.slice(1)}</strong> plan, you will be set up as a <strong>single unit</strong>. Your company name will automatically be used as your unit name. You can configure leave policies, payroll, and working days from the dashboard after setup.
      </Alert>

      <Grid container spacing={5}>

        {/* ── Business Details ── */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Icon icon='tabler:building' fontSize='1.25rem' />
            <Typography variant='h5'>Business Details</Typography>
          </Box>
          <Divider />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name='companyName'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Company / Business Name *'
                placeholder='e.g. Acme Technologies Pvt Ltd'
                error={!!errors.companyName}
                helperText={errors.companyName?.message}
              />
            )}
          />
          {companyName && (
            <Typography variant='caption' sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
              <Icon icon='tabler:check' style={{ marginRight: 4, fontSize: 12, color: 'green' }} />
              Unit name will be set to: <strong>{companyName}</strong>
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='location'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='City / Location *'
                placeholder='e.g. Mumbai'
                error={!!errors.location}
                helperText={errors.location?.message}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex' }}>
                      <Icon icon='tabler:map-pin' fontSize='1.125rem' />
                    </Box>
                  )
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='state'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='State *'
                error={!!errors.state}
                helperText={errors.state?.message}
              >
                {INDIAN_STATES.map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </CustomTextField>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='country'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='Country *'
                error={!!errors.country}
                helperText={errors.country?.message}
              >
                <MenuItem value='India'>India</MenuItem>
                <MenuItem value='United States'>United States</MenuItem>
                <MenuItem value='United Kingdom'>United Kingdom</MenuItem>
                <MenuItem value='UAE'>UAE</MenuItem>
                <MenuItem value='Singapore'>Singapore</MenuItem>
                <MenuItem value='Other'>Other</MenuItem>
              </CustomTextField>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='address'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Full Address (Optional)'
                placeholder='e.g. 123 Business Park, Andheri East'
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            )}
          />
        </Grid>

        {/* ── Organisation Details ── */}
        <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Icon icon='tabler:settings' fontSize='1.25rem' />
            <Typography variant='h5'>Company Details</Typography>
          </Box>
          <Divider />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='companySize'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='Company Size (employees) *'
                error={!!errors.companySize}
                helperText={errors.companySize?.message}
              >
                {COMPANY_SIZES.map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </CustomTextField>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='orgType'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='Company Type *'
                error={!!errors.orgType}
                helperText={errors.orgType?.message}
              >
                {ORG_TYPES.map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </CustomTextField>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='timezone'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='Timezone'
                error={!!errors.timezone}
                helperText={errors.timezone?.message}
              >
                {TIMEZONES.map(tz => (
                  <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                ))}
              </CustomTextField>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='currency'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='Default Currency'
                error={!!errors.currency}
                helperText={errors.currency?.message}
              >
                {CURRENCIES.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </CustomTextField>
            )}
          />
        </Grid>

        {/* ── HR Defaults ── */}
        <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Icon icon='tabler:users' fontSize='1.25rem' />
            <Typography variant='h5'>HR Defaults</Typography>
          </Box>
          <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
            These are basic defaults. Configure detailed leave policies, payroll, and working days from the dashboard.
          </Typography>
          <Divider />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='probationDays'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Probation Period (days)'
                placeholder='90'
                error={!!errors.probationDays}
                helperText={errors.probationDays?.message}
                InputProps={{
                  endAdornment: <Box sx={{ color: 'text.secondary', fontSize: 12, whiteSpace: 'nowrap' }}>days</Box>
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='noticePeriodDays'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Notice Period (days)'
                placeholder='30'
                error={!!errors.noticePeriodDays}
                helperText={errors.noticePeriodDays?.message}
                InputProps={{
                  endAdornment: <Box sx={{ color: 'text.secondary', fontSize: 12, whiteSpace: 'nowrap' }}>days</Box>
                }}
              />
            )}
          />
        </Grid>

        {/* Navigation */}
        <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button color='secondary' variant='tonal' onClick={handlePrev} sx={{ '& svg': { mr: 2 } }}>
              <Icon fontSize='1.125rem' icon='tabler:arrow-left' />
              Previous
            </Button>
            <Button variant='contained' onClick={onNext} sx={{ '& svg': { ml: 2 } }}>
              Next
              <Icon fontSize='1.125rem' icon='tabler:arrow-right' />
            </Button>
          </Box>
        </Grid>

      </Grid>
    </>
  )
}

export default StepUnitSetup
