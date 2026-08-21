// src/pages/auth/mfa-challenge/index.js
// MFA Challenge page — shown AFTER password login if MFA is enabled
// Submits OTP to /api/v1/auth/mfa/challenge
// Receives full JWT token on success

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
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
import authConfig from 'src/configs/auth'
import { rehydrateAuth } from 'src/store/auth/authSlice'

// ── Styled ──────────────────────────────────────────────────────────────────
const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: { maxWidth: 450 },
  [theme.breakpoints.up('lg')]: { maxWidth: 600 },
  [theme.breakpoints.up('xl')]: { maxWidth: 750 }
}))

const schema = yup.object().shape({
  otp: yup
    .string()
    .length(6, 'OTP must be 6 digits')
    .matches(/^[0-9]+$/, 'OTP must contain only numbers')
    .required('OTP is required')
})

const MFAChallengePage = () => {
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const dispatch = useDispatch()
  const router = useRouter()
  const theme = useTheme()
  const { mfaToken, email } = router.query

  // Countdown timer for resend
  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: { otp: '' },
    mode: 'onTouched',
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    // If no mfaToken, redirect to login
    if (!mfaToken && router.isReady) {
      toast.error('Invalid MFA session. Please login again.', { id: 'mfa-no-token' })
      router.replace('/auth/login')
    }
  }, [mfaToken, router])

  const onSubmit = async data => {
    setSubmitting(true)

    try {
      const res = await axiosRequest.post('/api/v1/auth/mfa/challenge', {
        mfaToken: mfaToken,
        token: data.otp.trim()
      })

      if (res?.success) {
        const { token, user } = res.data

        // Persist auth
        const tokenKey = authConfig.storageTokenKeyName || 'accessToken'
        window.localStorage.setItem(tokenKey, token)
        window.localStorage.setItem('userData', JSON.stringify(user))

        // Update Redux state immediately
        dispatch(rehydrateAuth({ user, token }))

        toast.success('MFA verified successfully!', { id: 'mfa-success' })

        // Check if first login
        if (user.is_first_login) {
          router.replace('/auth/set-password')
        } else {
          router.replace('/')
        }
      } else {
        reset({ otp: '' })
        const errorMsg = res?.message || 'Verification failed. Please try again.'
        toast.error(errorMsg, { duration: 5000, id: 'mfa-error' })
      }
    } catch (err) {
      reset({ otp: '' })

      let errorMsg = 'Invalid OTP. Please try again.'
      if (typeof err === 'string') {
        errorMsg = err
      } else if (err?.response?.data?.message) {
        errorMsg = err.response.data.message
      } else if (err?.message) {
        errorMsg = err.message
      }

      toast.error(errorMsg, { duration: 5000, id: 'mfa-error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUseBackupCode = () => {
    // Prompt user to enter backup code instead
    const backupCode = prompt('Enter your 8-character backup code:')
    if (backupCode && backupCode.trim()) {
      // Submit backup code as OTP (backend handles both)
      handleSubmit({ otp: backupCode.trim() })()
    }
  }

  const handleResendOTP = async () => {
    // This would typically regenerate the MFA token
    // For now, just show info message
    toast('Your authenticator app generates a new code every 30 seconds.', {
      icon: 'ℹ️',
      duration: 4000,
      id: 'resend-info'
    })
    setCountdown(30)
  }

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      {!router.isReady ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <RightWrapper
            sx={{ borderRight: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
          >
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'background.default',
                padding: { xs: 4, md: 8 }
              }}
            >
              <Card sx={{ maxWidth: 450, width: '100%' }}>
                <CardContent sx={{ padding: theme => theme.spacing(8) }}>
                  <Box sx={{ mb: 8, textAlign: 'center' }}>
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                      <Icon icon='mdi:shield-check' fontSize='3rem' color={theme.palette.primary.main} />
                    </Box>
                    <Typography variant='h5' sx={{ mb: 2, fontWeight: 600 }}>
                      Two-Factor Authentication
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Enter the 6-digit code from your authenticator app
                    </Typography>
                    {email && (
                      <Typography variant='caption' color='text.disabled' sx={{ mt: 1, display: 'block' }}>
                        {email}
                      </Typography>
                    )}
                  </Box>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Controller
                      name='otp'
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          type='text'
                          label='One-Time Password'
                          placeholder='Enter 6-digit code'
                          error={Boolean(errors.otp)}
                          helperText={errors.otp?.message}
                          inputProps={{
                            maxLength: 6,
                            style: { textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.5rem' }
                          }}
                          disabled={submitting}
                          autoFocus
                        />
                      )}
                    />

                    <Button
                      fullWidth
                      size='large'
                      type='submit'
                      variant='contained'
                      sx={{ mb: 4, mt: 6 }}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 2 }} />
                          Verifying...
                        </>
                      ) : (
                        'Verify'
                      )}
                    </Button>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button fullWidth size='small' variant='text' onClick={handleUseBackupCode} disabled={submitting}>
                        Use backup code instead
                      </Button>

                      <Typography variant='body2' color='text.secondary' align='center'>
                        Lost access to your authenticator?{' '}
                        <Typography
                          component='span'
                          variant='body2'
                          sx={{ color: 'primary.main', cursor: 'pointer' }}
                          onClick={() => router.push('/auth/login')}
                        >
                          Login with different account
                        </Typography>
                      </Typography>
                    </Box>
                  </form>
                </CardContent>
              </Card>
            </Box>
          </RightWrapper>

          <FooterIllustrationsV2 />
        </>
      )}
    </Box>
  )
}

MFAChallengePage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default MFAChallengePage
