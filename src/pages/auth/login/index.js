// src/pages/auth/login/index.js
// Login page — POST /api/v1/auth/login
// After success:
//   is_first_login === true  → /auth/set-password
//   is_first_login === false → / (dashboard)
// Stores token in localStorage under authConfig.storageTokenKeyName
// Stores user data + subscription in localStorage as 'userData'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import useMediaQuery from '@mui/material/useMediaQuery'
import CircularProgress from '@mui/material/CircularProgress'
import { styled, useTheme } from '@mui/material/styles'
import MuiDivider from '@mui/material/Divider'

import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'

import axiosRequest from 'src/utils/AxiosInterceptor'
import authConfig from 'src/configs/auth'
import { rehydrateAuth } from 'src/store/auth/authSlice'

// ── Styled ──────────────────────────────────────────────────────────────────
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 680,
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

const schema = yup.object().shape({
  email:    yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(1, 'Password is required').required('Password is required'),
})

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const dispatch = useDispatch()

  const theme  = useTheme()
  const router = useRouter()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
    resolver: yupResolver(schema)
  })

  const onSubmit = async data => {
    // Prevent page refresh - use event.preventDefault
    setSubmitting(true)
    
    try {
      const res = await axiosRequest.post('/api/v1/auth/login', {
        email:    data.email.trim().toLowerCase(),
        password: data.password,
      })

      // ✅ MFA required - redirect to MFA challenge
      if (res?.mfaRequired) {
        toast('Two-factor authentication required', { 
          icon: '🔐',
          id: 'mfa-required' 
        })
        router.replace({
          pathname: '/auth/mfa-challenge',
          query: { mfaToken: res.mfaToken, email: data.email.trim().toLowerCase() }
        })
        return
      }

      if (res?.success) {
        const { token, is_first_login, user, subscription } = res.data

        // Persist auth
        const tokenKey = authConfig.storageTokenKeyName || 'accessToken'
        window.localStorage.setItem(tokenKey, token)
        window.localStorage.setItem('subscriptionData', JSON.stringify(subscription))
        window.localStorage.setItem('userData', JSON.stringify(user))
        
        // ✅ CRITICAL FIX: Update Redux state immediately
        dispatch(rehydrateAuth({ user, token }))

        toast.success('Welcome back!', { id: 'login-success' })

        if (is_first_login) {
          // Must set their own password before accessing the app
          router.replace('/auth/set-password')
        } else {
          router.replace('/')
        }
      } else {
        // Clear fields on failed login
        reset({ email: '', password: '' })
        // Show custom error message (axios interceptor might also show one)
        const errorMsg = res?.message || 'Login failed. Please check your credentials.'
        toast.error(errorMsg, { duration: 5000, id: 'login-error' })
      }
    } catch (err) {
      // Clear fields on error
      reset({ email: '', password: '' })
      
      // Handle different error response formats
      let errorMsg = 'Invalid credentials. Please try again.'
      
      if (typeof err === 'string') {
        errorMsg = err
      } else if (err?.response?.data?.message) {
        errorMsg = err.response.data.message
      } else if (err?.message) {
        errorMsg = err.message
      }
      
      // Show error toast (axios interceptor will also show one, but we ensure visibility)
      toast.error(errorMsg, { duration: 5000, id: 'login-error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleLogin = () => {
    if (typeof window === 'undefined') return
    // Use environment variable for backend URL (works in both dev and prod)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/'
    const apiBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    const oauthUrl = new URL(`${apiBaseUrl}/api/v1/auth/google`)
    oauthUrl.searchParams.set('returnUrl', `${window.location.origin}/auth/google/callback`)
    window.location.href = oauthUrl.toString()
  }

  const handleSSOLogin = async () => {
    const email = prompt('Enter your company email address')
    if (!email) return

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/'
      const apiBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
      
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/sso/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data?.success && data?.authorizationUrl) {
        // Save state for CSRF verification
        if (data?.state) {
          sessionStorage.setItem('sso_state', data.state)
          localStorage.setItem('sso_email', email)
        }
        
        // Open in popup (embedded flow) - stays in app
        const width = 600
        const height = 700
        const left = window.screen.width / 2 - width / 2
        const top = window.screen.height / 2 - height / 2
        
        const popup = window.open(
          data.authorizationUrl,
          'SSOSignIn',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
        )
        
        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          // Popup blocked - fallback to redirect
          toast.error('Popup blocked! Please allow popups or redirecting...')
          setTimeout(() => {
            window.location.href = data.authorizationUrl
          }, 2000)
          return
        }
        
        // Focus the popup
        if (popup.focus) {
          popup.focus()
        }
        
        // Listen for popup close
        const checkClosed = setInterval(() => {
          try {
            if (!popup || popup.closed) {
              clearInterval(checkClosed)
              
              // Check if authentication was successful
              const token = localStorage.getItem('sso_token') || localStorage.getItem('token')
              if (token) {
                toast.success('SSO login successful!')
                // Trigger auth update
                window.dispatchEvent(new Event('storage'))
                // Redirect to dashboard
                setTimeout(() => {
                  router.push('/')
                }, 500)
              }
            }
          } catch (e) {
            // Popup might be in different domain, just clear interval
            clearInterval(checkClosed)
          }
        }, 500)
        
        // Listen for postMessage from popup
        const handleMessage = (event) => {
          if (event.data?.type === 'SSO_SUCCESS') {
            localStorage.setItem('token', event.data.token)
            localStorage.setItem('userEmail', event.data.email)
            toast.success('SSO login successful!')
            router.push('/')
            window.removeEventListener('message', handleMessage)
          }
        }
        window.addEventListener('message', handleMessage)
      } else {
        toast.error(data?.message || 'SSO login failed')
      }
    } catch (error) {
      console.error('SSO login error:', error)
      toast.error('Failed to initiate SSO login')
    }
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
          <LoginIllustration
            alt='login-illustration'
            src={`/images/pages/auth-v2-login-illustration-${theme.palette.mode}.png`}
          />
          <FooterIllustrationsV2 />
        </Box>
      )}

      <RightWrapper>
        <Box sx={{ p: [6, 12], height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 400 }}>

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

            <Box sx={{ my: 6 }}>
              <Typography variant='h3' sx={{ mb: 1.5 }}>Welcome to BenoSupport 👋</Typography>
              <Typography sx={{ color: 'text.secondary' }}>Sign in to your account</Typography>
            </Box>

            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
              <Controller name='email' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth autoFocus type='email' label='Email'
                    placeholder='admin@company.com'
                    sx={{ display: 'flex', mb: 4 }}
                    error={Boolean(errors.email)} helperText={errors.email?.message}
                    disabled={submitting} />
                )}
              />

              <Controller name='password' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='············'
                    error={Boolean(errors.password)} helperText={errors.password?.message}
                    disabled={submitting}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton edge='end' onClick={() => setShowPassword(p => !p)}
                            onMouseDown={e => e.preventDefault()} disabled={submitting}>
                            <Icon fontSize='1.25rem' icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5, mb: 4 }}>

              {/* <Button fullWidth variant='outlined' onClick={handleSSOLogin}
                startIcon={<Icon icon='mdi:domain' />} disabled={submitting}
                sx={{ mt: 2 }}>
                Sign in with SSO (Enterprise)
              </Button> */}
                <Typography component={LinkStyled} href='/auth/forgot-password' sx={{ fontSize: '0.875rem' }}>
                  Forgot password?
                </Typography>
              </Box>

              <Button fullWidth type='submit' variant='contained'
                disabled={submitting}
                sx={{ mb: 4, py: 1.5 }}
                startIcon={submitting ? <CircularProgress size={16} color='inherit' /> : null}
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', mb: 4 }}>
                <Typography sx={{ color: 'text.secondary', mr: 2 }}>New to BenoSupport?</Typography>
                <Typography component={LinkStyled} href='/auth/register'>Create an account</Typography>
              </Box>

              <MuiDivider sx={{ color: 'text.disabled', '& .MuiDivider-wrapper': { px: 6 }, fontSize: 13, my: 4 }}>
                or
              </MuiDivider>

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

LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
LoginPage.guestGuard = true

export default LoginPage
