// ** React Imports
import { useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Radio
import CustomRadioIcons from 'src/@core/components/custom-radio/icons'

// ** React Hook Form + Yup
import { useForm, Controller, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// ─── Plan Definitions ─────────────────────────
export const PLAN_META = {
  basic: {
    label: 'Basic',
    icon: 'tabler:rocket',
    price: '₹0',
    period: '/month',
    desc: 'For freelancers & solo operators',
    isCustom: false,
    isEnterprise: false,
    color: '#6EE7B7',
    badge: null
  },
  standard: {
    label: 'Standard',
    icon: 'tabler:building-store',
    price: '₹2,499',
    period: '/month',
    desc: 'For small to mid-size businesses',
    isCustom: false,
    isEnterprise: false,
    color: '#60A5FA',
    badge: 'Popular'
  },
  professional: {
    label: 'Professional',
    icon: 'tabler:building',
    price: '₹7,999',
    period: '/month',
    desc: 'For growing companies with multi-units',
    isCustom: false,
    isEnterprise: false,
    color: '#A78BFA',
    badge: null
  },
  enterprise: {
    label: 'Enterprise',
    icon: 'tabler:building-skyscraper',
    price: 'Custom',
    period: 'pricing',
    desc: 'For large organisations with multiple companies & LOBs',
    isCustom: true,
    isEnterprise: true,
    color: '#F59E0B',
    badge: 'Custom'
  }
}

const planRadioData = [
  {
    value: 'basic',
    isSelected: false,
    title: <Typography variant='h6' sx={{ mb: 0.5 }}>Basic</Typography>,
    content: (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <Typography variant='caption' sx={{ color: 'text.secondary', textAlign: 'center' }}>Freelancers & solo operators</Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Typography component='sup' sx={{ mt: 1, fontSize: 12, color: 'primary.main' }}>₹</Typography>
          <Typography variant='h4' sx={{ color: 'primary.main', lineHeight: 1 }}>0</Typography>
          <Typography component='sub' sx={{ mb: 0.5, alignSelf: 'flex-end', color: 'text.disabled', fontSize: 11 }}>/mo</Typography>
        </Box>
      </Box>
    )
  },
  {
    value: 'standard',
    isSelected: true,
    title: <Typography variant='h6' sx={{ mb: 0.5 }}>Standard</Typography>,
    content: (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <Typography variant='caption' sx={{ color: 'text.secondary', textAlign: 'center' }}>Small to mid-size businesses</Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Typography component='sup' sx={{ mt: 1, fontSize: 12, color: 'primary.main' }}>₹</Typography>
          <Typography variant='h4' sx={{ color: 'primary.main', lineHeight: 1 }}>2,499</Typography>
          <Typography component='sub' sx={{ mb: 0.5, alignSelf: 'flex-end', color: 'text.disabled', fontSize: 11 }}>/mo</Typography>
        </Box>
      </Box>
    )
  },
  {
    value: 'professional',
    isSelected: false,
    title: <Typography variant='h6' sx={{ mb: 0.5 }}>Professional</Typography>,
    content: (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <Typography variant='caption' sx={{ color: 'text.secondary', textAlign: 'center' }}>Growing multi-unit companies</Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Typography component='sup' sx={{ mt: 1, fontSize: 12, color: 'primary.main' }}>₹</Typography>
          <Typography variant='h4' sx={{ color: 'primary.main', lineHeight: 1 }}>7,999</Typography>
          <Typography component='sub' sx={{ mb: 0.5, alignSelf: 'flex-end', color: 'text.disabled', fontSize: 11 }}>/mo</Typography>
        </Box>
      </Box>
    )
  },
  {
    value: 'enterprise',
    isSelected: false,
    title: <Typography variant='h6' sx={{ mb: 0.5 }}>Enterprise</Typography>,
    content: (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <Typography variant='caption' sx={{ color: 'text.secondary', textAlign: 'center' }}>Organisations & multi-companies</Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Typography variant='h4' sx={{ color: 'info.main', lineHeight: 1 }}>Custom</Typography>
        </Box>
      </Box>
    )
  }
]

// ─── Validation Schema ─────────────────────────
const schema = yup.object().shape({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup
    .string()
    .matches(/^[0-9+\-\s()]{7,15}$/, 'Invalid phone number')
    .required('Phone is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm Password is required'),
  subscriptionPlan: yup.string().required('Please select a plan')
})

// ─── Component ───────────────────────────────
const StepPersonalInfo = ({ handleNext, onFormData, formData }) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: formData?.firstName || '',
      lastName: formData?.lastName || '',
      email: formData?.email || '',
      phone: formData?.phone || '',
      password: '',
      confirmPassword: '',
      subscriptionPlan: formData?.subscriptionPlan || 'standard'
    }
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const subscriptionPlan = useWatch({ control, name: 'subscriptionPlan' })
  const isEnterprise = subscriptionPlan === 'enterprise'

  const onNext = handleSubmit(data => {
    onFormData?.(data)
    handleNext()
  })

  return (
    <>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          Account Setup
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Create your account and choose a plan to get started
        </Typography>
      </Box>

      <Grid container spacing={5}>

        {/* ── Plan Selection ── */}
        <Grid item xs={12}>
          <Typography variant='h5' sx={{ mb: 1 }}>Choose your plan</Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mb: 3 }}>
            Your plan determines how your organisation is structured during onboarding.
          </Typography>
        </Grid>

        {planRadioData.map((item, index) => (
          <CustomRadioIcons
            key={index}
            data={planRadioData[index]}
            selected={subscriptionPlan}
            name='custom-radios-plan'
            gridProps={{ sm: 3, xs: 12 }}
            handleChange={val =>
              setValue('subscriptionPlan', typeof val === 'string' ? val : val.target.value, { shouldValidate: true })
            }
          />
        ))}

        {errors.subscriptionPlan && (
          <Grid item xs={12}>
            <Typography color='error' variant='body2'>{errors.subscriptionPlan.message}</Typography>
          </Grid>
        )}

        {/* Enterprise notice */}
        {isEnterprise && (
          <Grid item xs={12}>
            <Alert
              severity='info'
              icon={<Icon icon='tabler:building-skyscraper' />}
              sx={{ borderRadius: 2,color: 'text.primary' }}
            >
              <strong>Enterprise Plan selected.</strong> You will onboard as an Organisation — you can add multiple companies, Lines of Business and Units under your organisation.
            </Alert>
          </Grid>
        )}

        {/* Non-enterprise notice */}
        {!isEnterprise && (
          <Grid item xs={12}>
            <Alert
              severity='info'
              icon={<Icon icon='tabler:info-circle' />}
              sx={{ borderRadius: 2 ,color: 'text.primary'  }}
            >
              You will be onboarded as a <strong>single unit</strong>. Your company name will also serve as your unit name. This can be expanded later.
            </Alert>
          </Grid>
        )}

        {/* ── Personal Info ── */}
        <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
          <Typography variant='h5' sx={{ mb: 1 }}>Your Information</Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
            This will be your primary admin account
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='firstName'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='First Name'
                placeholder='John'
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='lastName'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Last Name'
                placeholder='Doe'
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='email'
                label='Email Address'
                placeholder='john@company.com'
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='tabler:mail' fontSize='1.25rem' />
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='phone'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Phone Number'
                placeholder='+91 98765 43210'
                error={!!errors.phone}
                helperText={errors.phone?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='tabler:phone' fontSize='1.25rem' />
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='password'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Password'
                placeholder='Min. 8 characters'
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Box
                        component='span'
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ cursor: 'pointer', display: 'flex' }}
                      >
                        <Icon icon={showPassword ? 'tabler:eye-off' : 'tabler:eye'} fontSize='1.25rem' />
                      </Box>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='confirmPassword'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Confirm Password'
                placeholder='Re-enter password'
                type={showConfirm ? 'text' : 'password'}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Box
                        component='span'
                        onClick={() => setShowConfirm(!showConfirm)}
                        sx={{ cursor: 'pointer', display: 'flex' }}
                      >
                        <Icon icon={showConfirm ? 'tabler:eye-off' : 'tabler:eye'} fontSize='1.25rem' />
                      </Box>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
        </Grid>

        {/* Navigation */}
        <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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

export default StepPersonalInfo
