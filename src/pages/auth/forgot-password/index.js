// src/pages/auth/forgot-password/index.js
// POST /api/v1/auth/forgot-password  { email }
// Always shows "If email exists, link sent" message (security: backend never confirms)

import { useState } from 'react'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'

import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import axiosRequest from 'src/utils/AxiosInterceptor'

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: { maxWidth: 450 },
  [theme.breakpoints.up('lg')]: { maxWidth: 600 }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: `${theme.palette.primary.main} !important`
}))

const schema = yup.object().shape({
  email: yup.string().email('Enter a valid email').required('Email is required')
})

const ForgotPasswordPage = () => {
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent]             = useState(false)

  const theme  = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' },
    mode: 'onTouched',
    resolver: yupResolver(schema)
  })

  const onSubmit = async data => {
    try {
      setSubmitting(true)
      await axiosRequest.post('/api/v1/auth/forgot-password', {
        email: data.email.trim().toLowerCase()
      })
      // Always show success regardless of whether email exists (per backend spec)
      setSent(true)
    } catch {
      // Show success even on error (security: don't reveal if email exists)
      setSent(true)
    } finally {
      setSubmitting(false)
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
          <FooterIllustrationsV2 />
        </Box>
      )}

      <RightWrapper>
        <Box sx={{ p: [6, 12], height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Box sx={{ my: 6 }}>
              <Typography variant='h3' sx={{ mb: 1.5 }}>Forgot Password? 🔑</Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Enter your registered email and we&apos;ll send a reset link
              </Typography>
            </Box>

            {sent ? (
              <Alert severity='success' icon={<Icon icon='tabler:mail-check' />} sx={{ mb: 4, borderRadius: 2 }}>
                <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>Check your email</Typography>
                If an account with that email exists, a reset link has been sent. The link expires in 24 hours.
              </Alert>
            ) : (
              <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
                <Controller name='email' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth autoFocus type='email' label='Email'
                      placeholder='admin@company.com'
                      sx={{ display: 'flex', mb: 4 }}
                      error={Boolean(errors.email)} helperText={errors.email?.message}
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

                <Button fullWidth type='submit' variant='contained'
                  disabled={submitting}
                  sx={{ mb: 4, py: 1.5 }}
                  startIcon={submitting ? <CircularProgress size={16} color='inherit' /> : null}
                >
                  {submitting ? 'Sending…' : 'Send Reset Link'}
                </Button>
              </form>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography component={LinkStyled} href='/auth/login'
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon='tabler:arrow-left' fontSize='1rem' />
                Back to login
              </Typography>
            </Box>
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}

ForgotPasswordPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
ForgotPasswordPage.guestGuard = true

export default ForgotPasswordPage
