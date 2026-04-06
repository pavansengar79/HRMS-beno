// src/pages/auth/two-factor.jsx

// ** React Imports
import { useContext, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'

// ** Third Party Imports
import Cleave from 'cleave.js/react'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// ** Custom Styled Component
import CleaveWrapper from 'src/@core/styles/libs/react-cleave'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Auth Context
import { AuthContext } from 'src/context/AuthContext'

// ** Styles
import 'cleave.js/dist/addons/cleave-phone.us'

// ─── Styled Components ────────────────────────────────────────────────────────

const TwoStepsIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 650,
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

const CleaveInput = styled(Cleave)(({ theme }) => ({
  maxWidth: 48,
  textAlign: 'center',
  height: '48px !important',
  fontSize: '150% !important',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '&:not(:last-child)': { marginRight: theme.spacing(2) },
  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
    margin: 0,
    WebkitAppearance: 'none'
  }
}))

// ─── Default Values ───────────────────────────────────────────────────────────

const defaultValues = {
  val1: '',
  val2: '',
  val3: '',
  val4: '',
  val5: '',
  val6: ''
}

// ─── Component ────────────────────────────────────────────────────────────────

const TwoFactorPage = () => {
  const [isBackspace, setIsBackspace] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [errorMsg, setErrorMsg]       = useState('')

  const theme  = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const { verifyMfa } = useContext(AuthContext)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ defaultValues })

  const errorsArray = Object.keys(errors)

  // ── Input navigation ──────────────────────────────────────
  const handleChange = (event, onChange) => {
    if (!isBackspace) {
      onChange(event)
      const form  = event.target.form
      const index = [...form].indexOf(event.target)
      if (form[index].value?.length) {
        form.elements[index + 1]?.focus()
      }
      event.preventDefault()
    }
  }

  const handleKeyDown = event => {
    if (event.key === 'Backspace') {
      setIsBackspace(true)
      const form  = event.target.form
      const index = [...form].indexOf(event.target)
      if (index >= 1 && !form[index].value?.length) {
        form.elements[index - 1].focus()
      }
    } else {
      setIsBackspace(false)
    }
  }

  // ── Submit ────────────────────────────────────────────────
  const onSubmit = async values => {
    const otpToken = Object.values(values).join('')

    if (otpToken.length < 6) {
      setErrorMsg('Please enter a valid 6-digit code')
      return
    }

    setErrorMsg('')
    setLoading(true)

    await verifyMfa(otpToken, errMsg => {
      setErrorMsg(errMsg)
      toast.error(errMsg)
      reset()   // clear inputs on failure so user can re-enter
    })

    setLoading(false)
  }

  // ── Render 6 OTP inputs ───────────────────────────────────
  const renderInputs = () =>
    Object.keys(defaultValues).map((val, index) => (
      <Controller
        key={val}
        name={val}
        control={control}
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => (
          <Box
            type='tel'
            value={value}
            autoFocus={index === 0}
            component={CleaveInput}
            onKeyDown={handleKeyDown}
            onChange={event => handleChange(event, onChange)}
            options={{ blocks: [1], numeral: true, numeralPositiveOnly: true }}
            sx={{ [theme.breakpoints.down('sm')]: { px: `${theme.spacing(2)} !important` } }}
          />
        )}
      />
    ))

  // ─── Render ───────────────────────────────────────────────
  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      {!hidden && (
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
          <TwoStepsIllustration
            alt='two-steps-illustration'
            src={`/images/pages/auth-v2-two-steps-illustration-${theme.palette.mode}.png`}
          />
          <FooterIllustrationsV2 />
        </Box>
      )}

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
              <path fillRule='evenodd' clipRule='evenodd' fill={theme.palette.primary.main}
                d='M0.00172773 0V6.85398C0.00172773 6.85398 -0.133178 9.01207 1.98092 10.8388L13.6912 21.9964L19.7809 21.9181L18.8042 9.88248L16.4951 7.17289L9.23799 0H0.00172773Z' />
              <path fill='#161616' opacity={0.06} fillRule='evenodd' clipRule='evenodd'
                d='M7.69824 16.4364L12.5199 3.23696L16.5541 7.25596L7.69824 16.4364Z' />
              <path fill='#161616' opacity={0.06} fillRule='evenodd' clipRule='evenodd'
                d='M8.07751 15.9175L13.9419 4.63989L16.5849 7.28475L8.07751 15.9175Z' />
              <path fillRule='evenodd' clipRule='evenodd' fill={theme.palette.primary.main}
                d='M7.77295 16.3566L23.6563 0H32V6.88383C32 6.88383 31.8262 9.17836 30.6591 10.4057L19.7824 22H13.6938L7.77295 16.3566Z' />
            </svg>

            {/* Header */}
            <Box sx={{ my: 6 }}>
              <Typography variant='h3' sx={{ mb: 1.5 }}>
                Two-Step Verification 🔐
              </Typography>
              <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>
                Open your authenticator app and enter the 6-digit code for your account.
              </Typography>
            </Box>

            <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Type your 6-digit security code
            </Typography>

            {/* OTP Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <CleaveWrapper
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  ...((errorsArray.length || errorMsg) && {
                    '& .invalid:focus': {
                      borderColor: theme => `${theme.palette.error.main} !important`,
                      boxShadow:   theme => `0 1px 3px 0 ${hexToRGBA(theme.palette.error.main, 0.4)}`
                    }
                  })
                }}
              >
                {renderInputs()}
              </CleaveWrapper>

              {/* Validation error */}
              {(errorsArray.length > 0 || errorMsg) && (
                <FormHelperText sx={{ color: 'error.main', fontSize: theme => theme.typography.body2.fontSize }}>
                  {errorMsg || 'Please enter a valid OTP'}
                </FormHelperText>
              )}

              <Button
                fullWidth
                type='submit'
                variant='contained'
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading
                  ? <CircularProgress size={22} color='inherit' />
                  : 'Verify My Account'
                }
              </Button>
            </form>

            {/* Back to login */}
            <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: 'text.secondary' }}>Lost access to your app?</Typography>
              <Typography
                component={LinkStyled}
                href='/auth/login'
                sx={{ ml: 1 }}
              >
                Back to login
              </Typography>
            </Box>
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}

TwoFactorPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
TwoFactorPage.guestGuard = true

export default TwoFactorPage