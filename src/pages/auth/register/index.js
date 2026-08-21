// src/pages/auth/register/index.js
// Public signup page.
// Fetches real plans from: GET /api/v1/plans/public
// Submits to:              POST /api/v1/tenant/register
// On success: redirects to /auth/login
// Backend emails temp password → user logs in → is_first_login=true → /auth/set-password

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import useMediaQuery from '@mui/material/useMediaQuery'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Popover from '@mui/material/Popover'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import { styled, useTheme } from '@mui/material/styles'

import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'

import axiosRequest from 'src/utils/AxiosInterceptor'

const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 600,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12),
  [theme.breakpoints.down(1540)]: { maxHeight: 550 },
  [theme.breakpoints.down('lg')]:  { maxHeight: 500 }
}))

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  overflowY: 'auto',
  [theme.breakpoints.up('md')]: { maxWidth: 500 },
  [theme.breakpoints.up('lg')]: { maxWidth: 620 }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: `${theme.palette.primary.main} !important`
}))

const PLAN_COLORS = { professionals: '#10B981', teams: '#3B82F6', enterprise: '#F59E0B' }
const PLAN_ICONS  = { professionals: 'tabler:rocket', teams: 'tabler:building-store', enterprise: 'tabler:building-skyscraper' }

// ── Module slug → icon map ────────────────────────────────────────────────────
const MODULE_ICONS = {
  employee:     'tabler:user',
  attendance:   'tabler:clock-check',
  leave:        'tabler:calendar-off',
  payroll:      'tabler:cash',
  organisation: 'tabler:building-community',
  auth:         'tabler:shield-lock',
}

// ── Plan modules popover ──────────────────────────────────────────────────────
const PlanModulesPopover = ({ anchorEl, plan, onClose }) => {
  const open = Boolean(anchorEl)
  if (!plan) return null
  const color = PLAN_COLORS[plan.package_type] || '#6366F1'
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      onClick={e => e.stopPropagation()}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        elevation: 4,
        sx: { mt: 1, borderRadius: 2.5, width: 320, overflow: 'hidden' }
      }}
    >
      {/* Header */}
      <Box sx={{ px: 3, py: 2, bgcolor: `${color}12`, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>{plan.name} — Included Modules</Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          {plan.modules?.length ?? 0} modules · {plan.seat_limit ? `up to ${plan.seat_limit} seats` : 'Unlimited seats'}
        </Typography>
      </Box>

      {/* Module list */}
      <Box sx={{ py: 1.5, maxHeight: 340, overflowY: 'auto' }}>
        {(plan.modules || []).map((mod, i) => (
          <Box key={mod._id || i}>
            <Box sx={{ px: 3, py: 1.25, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{
                mt: 0.25, width: 28, height: 28, borderRadius: 1, flexShrink: 0,
                bgcolor: `${color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon icon={MODULE_ICONS[mod.slug] || 'tabler:puzzle'} fontSize='0.875rem'
                  style={{ color }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
                  <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    {mod.name}
                  </Typography>
                  <Chip
                    label={mod.slug}
                    size='small'
                    sx={{
                      height: 16, fontSize: '0.65rem', fontFamily: 'monospace',
                      bgcolor: `${color}18`, color, fontWeight: 600,
                      '& .MuiChip-label': { px: 0.75 },
                    }}
                  />
                </Box>
                <Typography variant='caption' sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                  {mod.description}
                </Typography>
              </Box>
            </Box>
            {i < (plan.modules?.length ?? 0) - 1 && <Divider sx={{ mx: 3 }} />}
          </Box>
        ))}
      </Box>
    </Popover>
  )
}

const schema = yup.object().shape({
  contact_name:   yup.string().min(2, 'At least 2 characters').required('Your name is required'),
  contact_email:  yup.string().email('Enter a valid email').required('Contact email is required'),
  work_email:     yup.string().email('Enter a valid work email').when('same_email', {
    is: false,
    then: schema => schema.required('Work email is required'),
    otherwise: schema => schema.notRequired()
  }),
  same_email:     yup.boolean().default(true),
  org_name:      yup.string().min(2, 'At least 2 characters').required('Organization name is required'),
  contact_phone:  yup.string().matches(/^[6-9]\d{9}$/, '10-digit Indian mobile number').required('Phone is required'),
  plan_id:        yup.string().required('Please select a plan'),
})

const RegisterPage = () => {
  const [submitting, setSubmitting]     = useState(false)
  const [plans, setPlans]               = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [infoAnchor, setInfoAnchor]     = useState(null)   // { el, plan }
  const [sameEmail, setSameEmail]       = useState(true)  // Toggle state

  const theme  = useTheme()
  const router = useRouter()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { 
      contact_name: '', 
      contact_email: '', 
      work_email: '',
      same_email: true,
      org_name: '',
      contact_phone: '', 
      plan_id: '' 
    },
    mode: 'onTouched',
    resolver: yupResolver(schema)
  })

  // Watch same_email toggle
  const sameEmailValue = watch('same_email')

  useEffect(() => {
    axiosRequest.get('/api/v1/plans/public')
      .then(res => {
        if (res?.success && Array.isArray(res.data)) {
          // Filter: only show plans where is_custom is true
          const customPlans = res.data.filter(p => p.is_custom === false)
          setPlans(customPlans)
          if (customPlans.length > 0) {
            // Default: select first custom plan
            setValue('plan_id', customPlans[0]._id)
            setSelectedPlan(customPlans[0])
          }
        }
      })
      .catch(() => toast.error('Could not load plans. Please refresh.'))
      .finally(() => setPlansLoading(false))
  }, [setValue])

  const handlePlanSelect = plan => {
    setValue('plan_id', plan._id, { shouldValidate: true })
    setSelectedPlan(plan)
  }

  const onSubmit = async data => {
    try {
      setSubmitting(true)
      const payload = {
        plan_id:       data.plan_id,
        business_name: data.contact_name.trim(),  // Your Name → Customer's business_name
        contact_name:  data.org_name.trim(),      // Organization Name → Customer's contact_name
        contact_email: data.contact_email.trim().toLowerCase(),
        contact_phone: data.contact_phone.trim(),
        same_email:    data.same_email,
        work_email:    data.same_email ? undefined : data.work_email?.trim().toLowerCase(),
        org_name:      data.org_name.trim(),  // Organization name for the Organization
      }
      
      // NEW ENDPOINT: Public registration with pending approval
      const res = await axiosRequest.post('/api/v1/super-admin/register', payload)

      if (res?.success) {
        toast.success(
          res.data?.message || 'Registration submitted! You will receive login credentials after approval.',
          { duration: 10000 }
        )
        router.replace('/auth/login')
      } else {
        toast.error(res?.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleLogin = () => {
    if (typeof window === 'undefined') return
    const oauthUrl = new URL(`https://pulmonary-leggings-hurt.ngrok-free.dev/api/v1/auth/google`)
    oauthUrl.searchParams.set('returnUrl', `${window.location.origin}/auth/google/callback`)
    window.location.href = oauthUrl.toString()
  }

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      {!hidden && (
        <Box sx={{
          flex: 1, display: 'flex', position: 'relative', alignItems: 'center',
          borderRadius: '20px', justifyContent: 'center',
          backgroundColor: 'customColors.bodyBg',
          margin: t => t.spacing(8, 0, 8, 8)
        }}>
          <RegisterIllustration
            alt='register-illustration'
            src={`/images/pages/auth-v2-register-illustration-${theme.palette.mode}.png`}
          />
          <FooterIllustrationsV2 />
        </Box>
      )}

      <RightWrapper>
        <Box sx={{ p: [6, 10], minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 440 }}>

            {/* Logo */}
            <svg width={34} viewBox='0 0 32 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path fillRule='evenodd' clipRule='evenodd' fill={theme.palette.primary.main}
                d='M0.00172773 0V6.85398C0.00172773 6.85398 -0.133178 9.01207 1.98092 10.8388L13.6912 21.9964L19.7809 21.9181L18.8042 9.88248L16.4951 7.17289L9.23799 0H0.00172773Z' />
              <path fill='#161616' opacity={0.06} fillRule='evenodd' clipRule='evenodd'
                d='M7.69824 16.4364L12.5199 3.23696L16.5541 7.25596L7.69824 16.4364Z' />
              <path fill='#161616' opacity={0.06} fillRule='evenodd' clipRule='evenodd'
                d='M8.07751 15.9175L13.9419 4.63989L16.5849 7.28475L8.07751 15.9175Z' />
              <path fillRule='evenodd' clipRule='evenodd' fill={theme.palette.primary.main}
                d='M7.77295 16.3566L23.6563 0H32V6.88383C32 6.88383 31.8262 9.17836 30.6591 10.4057L19.7824 22H13.6938L7.77295 16.3566Z' />
            </svg>

            <Box sx={{ my: 5 }}>
              <Typography variant='h3' sx={{ mb: 1 }}>Start your free trial 🚀</Typography>
              <Typography sx={{ color: 'text.secondary' }}>Set up your HR platform in under 2 minutes</Typography>
            </Box>

            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>

              {/* ── Plan selection ── */}
              <Typography variant='body2' sx={{ fontWeight: 700, mb: 1.5 }}>
                Choose a plan <span style={{ color: 'red' }}>*</span>
              </Typography>

              {plansLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3, mb: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: errors.plan_id ? 1 : 4 }}>
                  {plans.map(plan => {
                    const color      = PLAN_COLORS[plan.package_type] || theme.palette.primary.main
                    const icon       = PLAN_ICONS[plan.package_type]  || 'tabler:package'
                    const isSelected = selectedPlan?._id === plan._id

                    return (
                      <Paper
                        key={plan._id}
                        elevation={0}
                        onClick={() => handlePlanSelect(plan)}
                        sx={{
                          p: 1.75, cursor: 'pointer',
                          border: '2px solid',
                          borderColor: isSelected ? color : 'divider',
                          borderRadius: 2,
                          bgcolor: isSelected ? `${color}0D` : 'background.paper',
                          display: 'flex', alignItems: 'center', gap: 2,
                          transition: 'all 0.15s ease',
                          '&:hover': { borderColor: color }
                        }}
                      >
                        <Box sx={{
                          width: 34, height: 34, borderRadius: 1.5, flexShrink: 0,
                          bgcolor: isSelected ? `${color}20` : 'action.hover',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Icon icon={icon} fontSize='1rem'
                            style={{ color: isSelected ? color : 'var(--mui-palette-text-secondary)' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant='body2' sx={{ fontWeight: 700 }}>{plan.name}</Typography>
                          <Typography variant='caption' sx={{ color: 'text.secondary', lineHeight: 1 }}>
                            {plan.structure_level} · {plan.seat_limit ? `up to ${plan.seat_limit} employees` : 'unlimited'}
                          </Typography>
                        </Box>
                        <Typography variant='body2' sx={{ fontWeight: 700, flexShrink: 0,
                          color: isSelected ? color : 'text.secondary' }}>
                          {plan.price_monthly ? `₹${plan.price_monthly}/mo` : 'Custom'}
                        </Typography>

                        {/* Info icon — shows module popover, stops plan-select click */}
                        <IconButton
                          size='small'
                          onClick={e => { e.stopPropagation(); setInfoAnchor({ el: e.currentTarget, plan }) }}
                          sx={{ color: isSelected ? color : 'text.disabled', p: 0.5, flexShrink: 0 }}
                        >
                          <Icon icon='tabler:info-circle' fontSize='1rem' />
                        </IconButton>
                      </Paper>
                    )
                  })}
                </Box>
              )}

              {errors.plan_id && (
                <Typography variant='caption' color='error' sx={{ display: 'block', mb: 3 }}>
                  {errors.plan_id.message}
                </Typography>
              )}

              {/* Plan modules popover */}
              <PlanModulesPopover
                anchorEl={infoAnchor?.el ?? null}
                plan={infoAnchor?.plan ?? null}
                onClose={() => setInfoAnchor(null)}
              />

              {/* Contact Name */}
              <Controller name='contact_name' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth autoFocus
                    label={<span>Your Name <span style={{ color: 'red' }}>*</span></span>}
                    placeholder='Ratan Tata'
                    sx={{ display: 'flex', mb: 4 }}
                    error={Boolean(errors.contact_name)}
                    helperText={errors.contact_name?.message || 'You will be the Org Admin'}
                    disabled={submitting} />
                )}
              />

              {/* Contact Email */}
              <Controller name='contact_email' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='email'
                    label={<span>Contact Email <span style={{ color: 'red' }}>*</span></span>}
                    placeholder='you@personal.com'
                    sx={{ display: 'flex', mb: 2 }}
                    error={Boolean(errors.contact_email)}
                    helperText={errors.contact_email?.message || 'Your personal email for account updates'}
                    disabled={submitting}
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

              {/* Same Email Toggle */}
              <Controller name='same_email' control={control}
                render={({ field }) => (
                  <Paper 
                    elevation={0}
                    onClick={() => field.onChange(!field.value)}
                    sx={{ 
                      p: 2, 
                      mb: 3, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Icon icon={field.value ? 'tabler:link' : 'tabler:unlink'} fontSize='1.25rem' />
                      <Box>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {field.value ? 'Same email for credentials' : 'Different email for credentials'}
                        </Typography>
                        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                          {field.value 
                            ? 'Login credentials will be sent to your contact email' 
                            : 'Login credentials will be sent to organization email'
                          }
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        bgcolor: field.value ? 'primary.main' : 'action.disabled',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        px: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          bgcolor: '#fff',
                          transform: field.value ? 'translateX(20px)' : 'translateX(0)',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </Box>
                  </Paper>
                )}
              />

              {/* Work Email - Only shown when same_email is false */}
              {!sameEmailValue && (
                <Controller name='work_email' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='email'
                      label={<span>Organization Email <span style={{ color: 'red' }}>*</span></span>}
                      placeholder='you@company.com'
                      sx={{ display: 'flex', mb: 3 }}
                      error={Boolean(errors.work_email)}
                      helperText={errors.work_email?.message || 'Credentials will be sent to this email after approval'}
                      disabled={submitting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Icon icon='tabler:building' fontSize='1.25rem' />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              )}

              {/* Organization Name */}
              <Controller name='org_name' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth
                    label={<span>Organization Name <span style={{ color: 'red' }}>*</span></span>}
                    placeholder='Acme Technologies Pvt Ltd'
                    sx={{ display: 'flex', mb: 4 }}
                    error={Boolean(errors.org_name)}
                    helperText={errors.org_name?.message || 'Your organization name'}
                    disabled={submitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Icon icon='tabler:building-community' fontSize='1.25rem' />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />

              {/* Phone */}
              <Controller name='contact_phone' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth
                    label={<span>Phone Number <span style={{ color: 'red' }}>*</span></span>}
                    placeholder='9876543210'
                    sx={{ display: 'flex', mb: 4 }}
                    error={Boolean(errors.contact_phone)} helperText={errors.contact_phone?.message}
                    disabled={submitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>+91</Typography>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />

              {/* Trial notice */}
              <Alert severity='info' icon={<Icon icon='tabler:clock' />} sx={{ mb: 4, borderRadius: 2 }}>
                <Typography variant='caption' sx={{ fontWeight: 600 }}>Registration requires Super Admin approval.</Typography>
                {' '}
                <Typography variant='caption'>
                  Submit your details and our team will review your application. You&apos;ll receive login credentials within 24-48 hours.
                </Typography>
              </Alert>

              {/* Submit */}
              <Button fullWidth type='submit' variant='contained'
                disabled={submitting || plansLoading}
                sx={{ mb: 4, py: 1.5 }}
                startIcon={submitting ? <CircularProgress size={16} color='inherit' /> : null}
              >
                {submitting ? 'Submitting…' : 'Submit Registration Request'}
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', mb: 4 }}>
                <Typography sx={{ color: 'text.secondary', mr: 2 }}>Already have an account?</Typography>
                <Typography component={LinkStyled} href='/auth/login'>Sign in</Typography>
              </Box>

              <Button fullWidth variant='outlined' onClick={handleGoogleLogin}
                startIcon={<Icon icon='mdi:google' />} disabled={submitting}>
                Continue with Google
              </Button>

            </form>
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}

RegisterPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
RegisterPage.guestGuard = true

export default RegisterPage
