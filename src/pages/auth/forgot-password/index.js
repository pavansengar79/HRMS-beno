// ** Next Import
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** React Imports
import { useState } from 'react'

// ** MUI Components
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// ** Toast
import toast from 'react-hot-toast'

// ** Axios
import axios from 'axios'

// Styled Components
const ForgotPasswordIllustration = styled('img')(({ theme }) => ({
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
  color: theme.palette.primary.main,
  fontSize: theme.typography.body1.fontSize
}))

const ForgotPassword = () => {
  const theme = useTheme()
  const router = useRouter()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  const validateEmail = value => {
    if (!value) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
    return ''
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const error = validateEmail(email)
    if (error) {
      setEmailError(error)
      return
    }
    setEmailError('')
    setLoading(true)

    try {
      // axios returns the actual response body inside `.data`
      const { data } = await axios.post(
        'https://s0380lsz-3000.inc1.devtunnels.ms/api/v1/auth/forgot-password',
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      )

      console.log('Forgot Password Response →', data)

      toast.success(data?.message || 'Reset link sent! Please check your email.')

      // Redirect to reset-password page after showing the toast
      setTimeout(() => {
        router.push('/auth/login')
      }, 1500)

    } catch (err) {
      // axios throws for non-2xx responses, error body is in err.response.data
      const message = err?.response?.data?.message || 'Something went wrong. Please try again.'
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
          <ForgotPasswordIllustration
            alt='forgot-password-illustration'
            src={`/images/pages/auth-v2-forgot-password-illustration-${theme.palette.mode}.png`}
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
              <Typography sx={{ mb: 1.5, fontWeight: 500, fontSize: '1.625rem', lineHeight: 1.385 }}>
                Forgot Password? 🔒
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Enter your email and we&apos;ll send you instructions to reset your password
              </Typography>
            </Box>

            <form noValidate autoComplete='off' onSubmit={handleSubmit}>
              <CustomTextField
                fullWidth
                autoFocus
                type='email'
                label='Email'
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  if (emailError) setEmailError(validateEmail(e.target.value))
                }}
                error={Boolean(emailError)}
                helperText={emailError}
                sx={{ display: 'flex', mb: 4 }}
                disabled={loading}
              />

              <Button
                fullWidth
                type='submit'
                variant='contained'
                sx={{ mb: 4 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color='inherit' /> : null}
              >
                {loading ? 'Sending...' : 'Send reset link'}
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

ForgotPassword.getLayout = page => <BlankLayout>{page}</BlankLayout>
ForgotPassword.guestGuard = true

export default ForgotPassword