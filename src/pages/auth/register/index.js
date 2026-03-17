// ** React Imports
import { useState } from 'react'

// ** Next Import
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Components
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'

// ** Interceptor — attaches token + handles 401 automatically
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Auth config (storageTokenKeyName)
import authConfig from 'src/configs/auth'

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------
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
  [theme.breakpoints.up('md')]: { maxWidth: 450 },
  [theme.breakpoints.up('lg')]: { maxWidth: 600 },
  [theme.breakpoints.up('xl')]: { maxWidth: 750 }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: `${theme.palette.primary.main} !important`
}))

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(1.75),
  '& .MuiFormControlLabel-label': {
    color: theme.palette.text.secondary
  }
}))

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const schema = yup.object().shape({
  companyName: yup
    .string()
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .required('Company name is required'),

  companyEmail: yup
    .string()
    .email('Enter a valid email address')
    .required('Email is required'),

  companyPhone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number')
    .required('Phone number is required'),

  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)')
    .required('Password is required'),

  agreeToTerms: yup
    .boolean()
    .oneOf([true], 'You must agree to the privacy policy & terms')
    .required()
})

const defaultValues = {
  companyName:  '',
  companyEmail: '',
  companyPhone: '',
  password:     '',
  agreeToTerms: false
}

// ---------------------------------------------------------------------------
// RegisterV2
// ---------------------------------------------------------------------------
const RegisterV2 = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting]     = useState(false)

  const theme    = useTheme()
  const router   = useRouter()
  const { settings } = useSettings()

  const { skin }   = settings
  const hidden     = useMediaQuery(theme.breakpoints.down('md'))
  const imageSource = skin === 'bordered'
    ? 'auth-v2-register-illustration-bordered'
    : 'auth-v2-register-illustration'

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onTouched',
    resolver: yupResolver(schema)
  })

  // ---------------------------------------------------------------------------
  // Submit — POST /api/v1/tenant/register
  // No token needed for registration (public endpoint).
  // After success: store token + userData, then check onboarding.isComplete:
  //   false → redirect to /auth/register-company  (onboarding screen)
  //   true  → redirect to home / dashboard
  // ---------------------------------------------------------------------------
  const onSubmit = async data => {
    try {
      setSubmitting(true)

      // axiosRequest returns response.data directly (interceptor unwraps it)
      const res = await axiosRequest.post('/api/v1/tenant/register', {
        companyName:  data.companyName.trim(),
        companyEmail: data.companyEmail.trim().toLowerCase(),
        companyPhone: data.companyPhone.trim(),
        password:     data.password
      })

      if (res?.success) {
        const { token, user, onboarding } = res.data

        // Persist token using the same key the interceptor reads
        const tokenKey = authConfig.storageTokenKeyName || 'accessToken'
        window.localStorage.setItem(tokenKey, token)
        window.localStorage.setItem('userData', JSON.stringify(user))

        toast.success(res.message || 'Account created successfully!')

        // Check onboarding status — redirect accordingly
        if (!onboarding?.isComplete) {
          // Onboarding not complete — send to company onboarding screen
          router.replace('/auth/register-company')
        } else {
          // Onboarding complete — send to dashboard / home
          router.replace('/')
        }
      } else {
        toast.error(res?.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      // Interceptor rejects with a plain message string for non-401 errors
      toast.error(typeof err === 'string' ? err : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      {!hidden ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
            borderRadius: '20px',
            justifyContent: 'center',
            backgroundColor: 'customColors.bodyBg',
            margin: theme => theme.spacing(8, 0, 8, 8)
          }}
        >
          <RegisterIllustration
            alt='register-illustration'
            src={`/images/pages/${imageSource}-${theme.palette.mode}.png`}
          />
          <FooterIllustrationsV2 />
        </Box>
      ) : null}

      <RightWrapper>
        <Box
          sx={{
            p: [6, 12],
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            {/* Logo */}
            <svg width={34} viewBox='0 0 32 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                fill={theme.palette.primary.main}
                d='M0.00172773 0V6.85398C0.00172773 6.85398 -0.133178 9.01207 1.98092 10.8388L13.6912 21.9964L19.7809 21.9181L18.8042 9.88248L16.4951 7.17289L9.23799 0H0.00172773Z'
              />
              <path fill='#161616' opacity={0.06} fillRule='evenodd' clipRule='evenodd'
                d='M7.69824 16.4364L12.5199 3.23696L16.5541 7.25596L7.69824 16.4364Z'
              />
              <path fill='#161616' opacity={0.06} fillRule='evenodd' clipRule='evenodd'
                d='M8.07751 15.9175L13.9419 4.63989L16.5849 7.28475L8.07751 15.9175Z'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                fill={theme.palette.primary.main}
                d='M7.77295 16.3566L23.6563 0H32V6.88383C32 6.88383 31.8262 9.17836 30.6591 10.4057L19.7824 22H13.6938L7.77295 16.3566Z'
              />
            </svg>

            <Box sx={{ my: 6 }}>
              <Typography variant='h3' sx={{ mb: 1.5 }}>
                Adventure starts here 🚀
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Make your app management easy and fun!
              </Typography>
            </Box>

            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>

              {/* Company Name */}
              <Controller
                name='companyName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    autoFocus
                    label='Name'
                    placeholder='Ram'
                    sx={{ display: 'flex', mb: 4 }}
                    error={Boolean(errors.companyName)}
                    helperText={errors.companyName?.message}
                    disabled={submitting}
                  />
                )}
              />

              {/* Company Email */}
              <Controller
                name='companyEmail'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='email'
                    label=' Email'
                    placeholder='ram@company.com'
                    sx={{ display: 'flex', mb: 4 }}
                    error={Boolean(errors.companyEmail)}
                    helperText={errors.companyEmail?.message}
                    disabled={submitting}
                  />
                )}
              />

              {/* Phone Number */}
              <Controller
                name='companyPhone'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Phone Number'
                    placeholder='9876543210'
                    sx={{ display: 'flex', mb: 4 }}
                    error={Boolean(errors.companyPhone)}
                    helperText={errors.companyPhone?.message}
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

              {/* Password */}
              <Controller
                name='password'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Password'
                    placeholder='············'
                    type={showPassword ? 'text' : 'password'}
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                    disabled={submitting}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={() => setShowPassword(prev => !prev)}
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle password visibility'
                          >
                            <Icon
                              fontSize='1.25rem'
                              icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'}
                            />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />

              {/* Agree to terms */}
              <Controller
                name='agreeToTerms'
                control={control}
                render={({ field }) => (
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          disabled={submitting}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <Typography sx={{ color: 'text.secondary' }}>I agree to</Typography>
                          <Typography
                            component={LinkStyled}
                            href='/pages/misc/terms'
                            sx={{ ml: 1 }}
                          >
                            privacy policy & terms
                          </Typography>
                        </Box>
                      }
                    />
                    {errors.agreeToTerms && (
                      <Typography variant='caption' color='error' sx={{ display: 'block', mt: -1, mb: 2, ml: 1 }}>
                        {errors.agreeToTerms.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />

              {/* Submit */}
              <Button
                fullWidth
                type='submit'
                variant='contained'
                disabled={submitting}
                sx={{ mb: 4 }}
                startIcon={submitting ? <CircularProgress size={16} color='inherit' /> : null}
              >
                {submitting ? 'Creating account…' : 'Sign up'}
              </Button>

              {/* Already have account */}
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Typography sx={{ color: 'text.secondary', mr: 2 }}>Already have an account?</Typography>
                <Typography
                  component={LinkStyled}
                  href='/pages/auth/login-v2'
                  sx={{ fontSize: theme.typography.body1.fontSize }}
                >
                  Sign in instead
                </Typography>
              </Box>

              <Divider
                sx={{
                  color: 'text.disabled',
                  '& .MuiDivider-wrapper': { px: 6 },
                  fontSize: theme.typography.body2.fontSize,
                  my: theme => `${theme.spacing(6)} !important`
                }}
              >
                or
              </Divider>

              {/* Social icons */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton href='/' component={Link} sx={{ color: '#497ce2' }} onClick={e => e.preventDefault()}>
                  <Icon icon='mdi:facebook' />
                </IconButton>
                <IconButton href='/' component={Link} sx={{ color: '#1da1f2' }} onClick={e => e.preventDefault()}>
                  <Icon icon='mdi:twitter' />
                </IconButton>
                <IconButton
                  href='/'
                  component={Link}
                  onClick={e => e.preventDefault()}
                  sx={{ color: theme => (theme.palette.mode === 'light' ? '#272727' : 'grey.300') }}
                >
                  <Icon icon='mdi:github' />
                </IconButton>
                <IconButton href='/' component={Link} sx={{ color: '#db4437' }} onClick={e => e.preventDefault()}>
                  <Icon icon='mdi:google' />
                </IconButton>
              </Box>

            </form>
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}

RegisterV2.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default RegisterV2