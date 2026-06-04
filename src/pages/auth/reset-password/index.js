// src/pages/auth/reset-password/index.js
// Called from email link: /auth/reset-password?token=xxx
// Calls POST /api/v1/auth/reset-password  { token, password }
// On success → redirect to /auth/login

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import { styled, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'

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
  password: yup.string()
    .min(8, 'At least 8 characters')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm your password')
})

const ResetPasswordPage = () => {
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting]   = useState(false)

  const theme  = useTheme()
  const router = useRouter()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const { token } = router.query

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched',
    resolver: yupResolver(schema)
  })

  const onSubmit = async data => {
    if (!token) {
      toast.error('Reset token is missing. Please use the link from your email.')
      return
    }
    try {
      setSubmitting(true)
      const res = await axiosRequest.post('/api/v1/auth/reset-password', {
        token,
        password: data.password
      })
      if (res?.success) {
        toast.success(res.message || 'Password reset successfully. Please log in.')
        router.replace('/auth/login')
      } else {
        toast.error(res?.message || 'Reset failed. The link may have expired.')
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Reset failed. Please request a new link.')
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
              <Typography variant='h3' sx={{ mb: 1.5 }}>Reset Password 🔒</Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Enter your new password below
              </Typography>
            </Box>

            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
              <Controller name='password' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='New Password'
                    type={showPass ? 'text' : 'password'} placeholder='············'
                    sx={{ display: 'flex', mb: 4 }}
                    error={Boolean(errors.password)} helperText={errors.password?.message}
                    disabled={submitting}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton edge='end' onClick={() => setShowPass(p => !p)} onMouseDown={e => e.preventDefault()}>
                            <Icon fontSize='1.25rem' icon={showPass ? 'tabler:eye' : 'tabler:eye-off'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />

              <Controller name='confirmPassword' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Confirm Password'
                    type={showConfirm ? 'text' : 'password'} placeholder='············'
                    sx={{ display: 'flex', mb: 4 }}
                    error={Boolean(errors.confirmPassword)} helperText={errors.confirmPassword?.message}
                    disabled={submitting}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton edge='end' onClick={() => setShowConfirm(p => !p)} onMouseDown={e => e.preventDefault()}>
                            <Icon fontSize='1.25rem' icon={showConfirm ? 'tabler:eye' : 'tabler:eye-off'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />

              <Button fullWidth type='submit' variant='contained'
                disabled={submitting || !token}
                sx={{ mb: 4, py: 1.5 }}
                startIcon={submitting ? <CircularProgress size={16} color='inherit' /> : null}
              >
                {submitting ? 'Resetting…' : 'Set New Password'}
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography component={LinkStyled} href='/auth/login'
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon='tabler:arrow-left' fontSize='1rem' />
                  Back to login
                </Typography>
              </Box>
            </form>
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}

ResetPasswordPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
ResetPasswordPage.guestGuard = true

export default ResetPasswordPage
