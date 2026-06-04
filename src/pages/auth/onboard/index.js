// src/pages/auth/onboard/index.js
// POST-LOGIN onboarding for users who just registered.
// This is NOT the registration wizard — that happens at /auth/register.
// This page handles: is_first_login=true → set-password step.
// It reads the token already stored in localStorage (from login response).
// Calls: POST /api/v1/auth/set-password  { newPassword }
// On success → re-login required (backend clears is_first_login flag)

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import LinearProgress from '@mui/material/LinearProgress'
import { styled, useTheme } from '@mui/material/styles'

import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import BlankLayout from 'src/@core/layouts/BlankLayout'

import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'

import axiosRequest from 'src/utils/AxiosInterceptor'

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: `${theme.palette.primary.main} !important`
}))

// Password strength helper
const getStrength = pw => {
  let score = 0
  if (pw.length >= 8)       score++
  if (/[A-Z]/.test(pw))     score++
  if (/[0-9]/.test(pw))     score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = ['', 'error', 'warning', 'info', 'success']

const schema = yup.object().shape({
  newPassword: yup.string()
    .min(8, 'At least 8 characters')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
    .required('Confirm your password')
})

const SetPasswordPage = () => {
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [pwValue, setPwValue]         = useState('')

  const theme  = useTheme()
  const router = useRouter()

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onTouched',
    resolver: yupResolver(schema)
  })

  const strength = getStrength(pwValue)

  const onSubmit = async data => {
    try {
      setSubmitting(true)
      const res = await axiosRequest.post('/api/v1/auth/set-password', {
        newPassword: data.newPassword
      })
      if (res?.success) {
        toast.success('Password set! Please log in with your new password.')
        // Clear stored creds so user has to log in fresh
        const authConfig = (await import('src/configs/auth')).default
        const tokenKey   = authConfig.storageTokenKeyName || 'accessToken'
        window.localStorage.removeItem(tokenKey)
        window.localStorage.removeItem('userData')
        router.replace('/auth/login')
      } else {
        toast.error(res?.message || 'Could not set password. Please try again.')
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 3
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 480 }}>

        {/* Logo */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
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
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 4,
            bgcolor: 'background.paper',
          }}
        >
          {/* Top colour bar */}
          <Box sx={{ height: 4, mx: -6, mt: -6, mb: 5, borderRadius: '16px 16px 0 0',
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)` }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant='h4' sx={{ fontWeight: 800, mb: 1 }}>Set Your Password 🔒</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
              This is your first login. Create a secure password to protect your account.
            </Typography>
          </Box>

          <Alert severity='info' icon={<Icon icon='tabler:info-circle' />} sx={{ mb: 4, borderRadius: 2 }}>
            Your temporary password was emailed to you. After setting a new password, you&apos;ll need to log in again.
          </Alert>

          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>

            <Controller name='newPassword' control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth label='New Password'
                  type={showNew ? 'text' : 'password'} placeholder='············'
                  sx={{ display: 'flex', mb: 1 }}
                  error={Boolean(errors.newPassword)} helperText={errors.newPassword?.message}
                  disabled={submitting}
                  onChange={e => { field.onChange(e); setPwValue(e.target.value) }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton edge='end' onClick={() => setShowNew(p => !p)}
                          onMouseDown={e => e.preventDefault()}>
                          <Icon fontSize='1.25rem' icon={showNew ? 'tabler:eye' : 'tabler:eye-off'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />

            {/* Password strength bar */}
            {pwValue.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress
                  variant='determinate'
                  value={(strength / 4) * 100}
                  color={STRENGTH_COLORS[strength]}
                  sx={{ height: 4, borderRadius: 2, mb: 0.5 }}
                />
                <Typography variant='caption' color={`${STRENGTH_COLORS[strength]}.main`}>
                  {STRENGTH_LABELS[strength]}
                </Typography>
              </Box>
            )}

            <Controller name='confirmPassword' control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth label='Confirm Password'
                  type={showConfirm ? 'text' : 'password'} placeholder='············'
                  sx={{ display: 'flex', mb: 5 }}
                  error={Boolean(errors.confirmPassword)} helperText={errors.confirmPassword?.message}
                  disabled={submitting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton edge='end' onClick={() => setShowConfirm(p => !p)}
                          onMouseDown={e => e.preventDefault()}>
                          <Icon fontSize='1.25rem' icon={showConfirm ? 'tabler:eye' : 'tabler:eye-off'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />

            <Button fullWidth type='submit' variant='contained'
              disabled={submitting}
              sx={{ py: 1.5, mb: 3 }}
              startIcon={submitting ? <CircularProgress size={16} color='inherit' /> : null}
            >
              {submitting ? 'Saving password…' : 'Set Password & Continue'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center' }}>
            <Typography component={LinkStyled} href='/auth/login'
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 13 }}>
              <Icon icon='tabler:arrow-left' fontSize='0.875rem' />
              Back to login
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

SetPasswordPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default SetPasswordPage
