// AcceptInviteV2.js (Converted from ResetPassword)

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

// MUI
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'

// Custom
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// Toast
import toast from 'react-hot-toast'
import axios from 'axios'
import axiosRequest from 'src/utils/AxiosInterceptor'

// Styled (same as your file)
const ResetPasswordIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 650,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12)
}))

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: { maxWidth: 450 }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  color: `${theme.palette.primary.main} !important`
}))

const AcceptInviteV2 = () => {
  const router = useRouter()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const [loading, setLoading] = useState(false)

  const [values, setValues] = useState({
    newPassword: '',
    confirmNewPassword: '',
    showNewPassword: false,
    showConfirmNewPassword: false
  })

  const [errors, setErrors] = useState({})

  // ── Handlers ─────────────────────────────
  const handleChange = key => e => {
    setValues({ ...values, [key]: e.target.value })
  }

  const togglePassword = key => {
    setValues(v => ({ ...v, [key]: !v[key] }))
  }

  // ── Validation ───────────────────────────
  const validate = () => {
    let err = {}

    if (!values.newPassword) err.newPassword = 'Password required'
    else if (values.newPassword.length < 6)
      err.newPassword = 'Min 6 characters required'

    if (values.confirmNewPassword !== values.newPassword)
      err.confirmNewPassword = 'Passwords do not match'

    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Submit ───────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return

    const { token } = router.query

    if (!token) {
      toast.error('Invalid invite link')
      return
    }

    setLoading(true)

    try {
      const res = await axiosRequest.post(
        `/api/v1/auth/accept-invite`,
        {
          token,
          password: values.newPassword
        }
      )

      toast.success(res.data?.message || 'Account created successfully 🎉')

      setTimeout(() => {
        router.push('/auth/login')
      }, 1500)

    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      {!hidden && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'customColors.bodyBg',
            m: 8,
            borderRadius: 2
          }}
        >
          <ResetPasswordIllustration
            alt='illustration'
            src={`/images/pages/auth-v2-reset-password-illustration-${theme.palette.mode}.png`}
          />
          <FooterIllustrationsV2 />
        </Box>
      )}

      <RightWrapper>
        <Box sx={{ p: [6, 12], display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <img src='/OneBLogo.svg' width={82} />

            <Box sx={{ my: 6 }}>
              <Typography variant='h4'>Set Your Password 🔐</Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Create a password to activate your account
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              {/* Password */}
              <CustomTextField
                fullWidth
                label='Password'
                type={values.showNewPassword ? 'text' : 'password'}
                value={values.newPassword}
                onChange={handleChange('newPassword')}
                error={!!errors.newPassword}
                helperText={errors.newPassword}
                sx={{ mb: 4 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => togglePassword('showNewPassword')}>
                        <Icon icon={values.showNewPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Confirm */}
              <CustomTextField
                fullWidth
                label='Confirm Password'
                type={values.showConfirmNewPassword ? 'text' : 'password'}
                value={values.confirmNewPassword}
                onChange={handleChange('confirmNewPassword')}
                error={!!errors.confirmNewPassword}
                helperText={errors.confirmNewPassword}
                sx={{ mb: 4 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => togglePassword('showConfirmNewPassword')}>
                        <Icon icon={values.showConfirmNewPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                fullWidth
                type='submit'
                variant='contained'
                disabled={loading}
                startIcon={loading && <CircularProgress size={18} />}
              >
                {loading ? 'Creating Account...' : 'Activate Account'}
              </Button>

              <Typography sx={{ mt: 4, textAlign: 'center' }}>
                <LinkStyled href='/auth/login'>
                  <Icon icon='tabler:chevron-left' />
                  Back to login
                </LinkStyled>
              </Typography>
            </form>
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}

AcceptInviteV2.getLayout = page => <BlankLayout>{page}</BlankLayout>
AcceptInviteV2.guestGuard = true

export default AcceptInviteV2