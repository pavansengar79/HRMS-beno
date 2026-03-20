// src/pages/auth/login.jsx

// ** React Imports
import { useState } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Components
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
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

// ** React Hook Form + Yup
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Redux — for API error + loading state
import { useSelector, useDispatch } from 'react-redux'
import { selectAuthLoading, selectAuthError, clearError } from 'src/store/auth/authSlice'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// ─── Styled Components (unchanged from original) ──────────────
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
  '& .MuiFormControlLabel-label': {
    color: theme.palette.text.secondary
  }
}))

// ─── Validation Schema ─────────────────────────────────────────
const schema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
})

const defaultValues = { email: '', password: '' }

// ─── Component ────────────────────────────────────────────────
const LoginPage = () => {
  const [rememberMe,   setRememberMe]   = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const router   = useRouter()
  const auth     = useAuth()
  const theme    = useTheme()
  const dispatch = useDispatch()
  const { settings } = useSettings()

  const hidden   = useMediaQuery(theme.breakpoints.down('md'))
  const { skin } = settings

  const handleGoogleLogin = () => {
    if (typeof window === 'undefined') return

    const returnUrl =
      typeof router.query.returnUrl === 'string' && router.query.returnUrl.trim().length
        ? router.query.returnUrl
        : '/dashboards/analytics'

    const oauthUrl = new URL('https://2c6q0jsk-3000.inc1.devtunnels.ms/api/v1/auth/google')
    oauthUrl.searchParams.set('returnUrl', returnUrl)

    window.location.href = oauthUrl.toString()


   
  }

  // API state from Redux
  const isLoading = useSelector(selectAuthLoading)
  const apiError  = useSelector(selectAuthError)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema)
  })

  const onSubmit = data => {
    dispatch(clearError()) // clear previous error before new attempt
    auth.login(
      { email: data.email, password: data.password, rememberMe },
      errorMessage => console.error('Login failed:', errorMessage)
    )
  }

  const imageSource =
    skin === 'bordered'
      ? 'auth-v2-login-illustration-bordered'
      : 'auth-v2-login-illustration'

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>

      {/* Left illustration — unchanged */}
      {!hidden ? (
        <Box
          sx={{
            flex: 1,
            display: 'grid',
            position: 'relative',
            alignItems: 'center',
            borderRadius: '20px',
            justifyContent: 'center',
            background: `url("/images/pages/${imageSource}-${theme.palette.mode}.png")`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            margin: theme => theme.spacing(8, 0, 8, 8)
          }}
        />
      ) : null}

      <FooterIllustrationsV2 />

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

            <Box sx={{ my: 6 }}>
              <Typography variant='h3' sx={{ mb: 1.5 }}>
                {`Welcome to ${themeConfig.templateName}!`}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Please sign-in to your account and start the adventure
              </Typography>
            </Box>

            {/* API Error — dismissable */}
            {apiError && (
              <Alert
                severity='error'
                sx={{ mb: 4 }}
                onClose={() => dispatch(clearError())}
              >
                {apiError}
              </Alert>
            )}

            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>

              {/* Email */}
              <Box sx={{ mb: 4 }}>
                <Controller
                  name='email'
                  control={control}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <CustomTextField
                      fullWidth
                      autoFocus
                      label='Email'
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      placeholder='hr@company.com'
                      error={Boolean(errors.email)}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Box>

              {/* Password */}
              <Box sx={{ mb: 1.5 }}>
                <Controller
                  name='password'
                  control={control}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      onBlur={onBlur}
                      label='Password'
                      onChange={onChange}
                      id='auth-login-v2-password'
                      placeholder='············'
                      error={Boolean(errors.password)}
                      helperText={errors.password?.message}
                      type={showPassword ? 'text' : 'password'}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => setShowPassword(!showPassword)}
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
              </Box>

              {/* Remember Me + Forgot Password — unchanged layout */}
              <Box
                sx={{
                  mb: 1.75,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <FormControlLabel
                  label='Remember Me'
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                  }
                />
                <Button
                  variant='text'
                  onClick={() => router.push('/auth/forgot-password')}
                >
                  Forgot Password?
                </Button>
              </Box>

              {/* Submit */}
              <Button
                fullWidth
                type='submit'
                variant='contained'
                disabled={isLoading}
                sx={{ mb: 4, my: 2 }}
              >
                {isLoading
                  ? <CircularProgress size={22} color='inherit' />
                  : 'Login'
                }
              </Button>

              <Divider sx={{ my: 4, color: 'text.disabled' }}>or</Divider>

              <Button
                fullWidth
                variant='outlined'
                onClick={handleGoogleLogin}
                startIcon={<Icon icon='mdi:google' />}
              >
                Continue with Google
              </Button>

            </form>
          </Box>
        </Box>
      </RightWrapper>

    </Box>
  )
}

LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
LoginPage.guestGuard = true

export default LoginPage