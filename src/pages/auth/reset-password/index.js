// ** React Imports
import { useState } from 'react'

// ** Next Import
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Components
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// ** Toast — adjust import path to match your project (react-hot-toast / notistack / etc.)
import toast from 'react-hot-toast'
import axios from 'axios'
import { tokenize } from 'stylis'

// ** Styled Components
const ResetPasswordIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 650,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12),
  [theme.breakpoints.down(1540)]: { maxHeight: 550 },
  [theme.breakpoints.down('lg')]: { maxHeight: 500 }
}))

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: { maxWidth: 450 },
  [theme.breakpoints.up('lg')]: { maxWidth: 600 },
  [theme.breakpoints.up('xl')]: { maxWidth: 750 }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  justifyContent: 'center',
  color: `${theme.palette.primary.main} !important`
}))

const ResetPasswordV2 = () => {
  const router = useRouter()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState({
    newPassword: '',
    showNewPassword: false,
    confirmNewPassword: '',
    showConfirmNewPassword: false
  })
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmNewPassword: ''
  })

  // ── Visibility toggles ──────────────────────────────────────────────────────
  const handleClickShowNewPassword = () =>
    setValues(v => ({ ...v, showNewPassword: !v.showNewPassword }))

  const handleClickShowConfirmNewPassword = () =>
    setValues(v => ({ ...v, showConfirmNewPassword: !v.showConfirmNewPassword }))

  // ── Field change handlers ───────────────────────────────────────────────────
  const handleNewPasswordChange = e => {
    const val = e.target.value
    setValues(v => ({ ...v, newPassword: val }))
    setErrors(err => ({
      ...err,
      newPassword: val.length < 6 ? 'Password must be at least 6 characters' : ''
    }))
  }

  const handleConfirmPasswordChange = e => {
    const val = e.target.value
    setValues(v => ({ ...v, confirmNewPassword: val }))
    setErrors(err => ({
      ...err,
      confirmNewPassword: val !== values.newPassword ? 'Passwords do not match' : ''
    }))
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {}
    if (!values.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (values.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    if (!values.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Please confirm your password'
    } else if (values.newPassword !== values.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
 const handleSubmit = async e => {
  e.preventDefault()
  if (!validate()) return

  const { token } = router.query
  if (!token) {
    toast.error('Reset token is missing. Please request a new password reset link.')
    return
  }

  console.log("resetToken", token)

  setLoading(true)
  try {
    const res = await axios.post(
      `https://s0380lsz-4000.inc1.devtunnels.ms/api/v1/auth/reset-password`,
      { password: values.newPassword, token },
      { headers: { 'Content-Type': 'application/json' } }
    )

    // Axios puts response body in res.data directly — no .json() needed
    toast.success(res.data?.message || 'Password reset successfully!')
    setTimeout(() => {
      router.push('/auth/login')
    }, 1500)

  } catch (err) {
    // Axios throws for non-2xx responses, error body is in err.response.data
    const message = err.response?.data?.message || 'Failed to reset password. Please try again.'
    toast.error(message)
  } finally {
    setLoading(false)
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
          <ResetPasswordIllustration
            alt='reset-password-illustration'
            src={`/images/pages/auth-v2-reset-password-illustration-${theme.palette.mode}.png`}
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
            <img src='/OneBLogo.svg' alt='logo' width={82} height={56.375} />

            <Box sx={{ my: 6 }}>
              <Typography variant='h3' sx={{ mb: 1.5 }}>
                Reset Password 🔒
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Your new password must be different from previously used passwords
              </Typography>
            </Box>

            <form noValidate autoComplete='off' onSubmit={handleSubmit}>
              {/* ── New Password ── */}
              <CustomTextField
                fullWidth
                autoFocus
                label='New Password'
                value={values.newPassword}
                placeholder='············'
                sx={{ display: 'flex', mb: 4 }}
                id='auth-reset-password-v2-new-password'
                onChange={handleNewPasswordChange}
                type={values.showNewPassword ? 'text' : 'password'}
                error={Boolean(errors.newPassword)}
                helperText={errors.newPassword}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowNewPassword}
                        onMouseDown={e => e.preventDefault()}
                        aria-label='toggle new password visibility'
                      >
                        <Icon
                          fontSize='1.25rem'
                          icon={values.showNewPassword ? 'tabler:eye' : 'tabler:eye-off'}
                        />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* ── Confirm Password ── */}
              <CustomTextField
                fullWidth
                label='Confirm Password'
                placeholder='············'
                sx={{ display: 'flex', mb: 4 }}
                value={values.confirmNewPassword}
                id='auth-reset-password-v2-confirm-password'
                type={values.showConfirmNewPassword ? 'text' : 'password'}
                onChange={handleConfirmPasswordChange}
                error={Boolean(errors.confirmNewPassword)}
                helperText={errors.confirmNewPassword}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onMouseDown={e => e.preventDefault()}
                        aria-label='toggle confirm password visibility'
                        onClick={handleClickShowConfirmNewPassword}
                      >
                        <Icon
                          fontSize='1.25rem'
                          icon={values.showConfirmNewPassword ? 'tabler:eye' : 'tabler:eye-off'}
                        />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                fullWidth
                type='submit'
                variant='contained'
                sx={{ mb: 4 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color='inherit' /> : null}
              >
                {loading ? 'Resetting...' : 'Set New Password'}
              </Button>

              <Typography
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { mr: 1 } }}
              >
                <LinkStyled href='/auth/login'>
                  <Icon fontSize='1.25rem' icon='tabler:chevron-left' />
                  <span>Back to login</span>
                </LinkStyled>
              </Typography>
            </form>
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}

ResetPasswordV2.getLayout = page => <BlankLayout>{page}</BlankLayout>
ResetPasswordV2.guestGuard = true

export default ResetPasswordV2