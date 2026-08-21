// src/pages/auth/mfa-setup/index.js
// MFA Setup Page — User enrolls in TOTP MFA

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'
import axiosRequest from 'src/utils/AxiosInterceptor'
import authConfig from 'src/configs/auth'

// ─── Styled Components ────────────────────────────────────────────────────────

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: { maxWidth: 450 },
  [theme.breakpoints.up('lg')]: { maxWidth: 600 },
  [theme.breakpoints.up('xl')]: { maxWidth: 750 }
}))

const QRCodeImage = styled('img')({
  maxWidth: '100%',
  height: 'auto',
  borderRadius: 8
})

// ─── Steps ───────────────────────────────────────────────────────────────────

const steps = ['Generate QR Code', 'Scan & Verify', 'Save Backup Codes']

// ─── Component ────────────────────────────────────────────────────────────────

const MFASetupPage = () => {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [qrCode, setQRCode] = useState(null)
  const [manualKey, setManualKey] = useState(null)
  const [backupCodes, setBackupCodes] = useState([])
  const [verificationError, setVerificationError] = useState('')

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { token: '' }
  })

  // Check authentication
  useEffect(() => {
    const token = window.localStorage.getItem(authConfig.storageTokenKeyName)
    if (!token) {
      router.replace('/auth/login')
    }
  }, [router])

  // Step 1: Generate QR Code
  const handleGenerateQR = async () => {
    setLoading(true)
    setVerificationError('')
    
    try {
      const res = await axiosRequest.post('/api/v1/auth/mfa/enrol')
      
      if (res?.success && res?.data) {
        setQRCode(res.data.qrCode)
        setManualKey(res.data.secret)
        setActiveStep(1)
        toast.success('QR code generated successfully')
      } else {
        toast.error(res?.message || 'Failed to generate QR code')
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Failed to generate QR code'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify Token
  const handleVerifyToken = async data => {
    setLoading(true)
    setVerificationError('')
    
    if (!data.token || data.token.length !== 6) {
      setVerificationError('Please enter a valid 6-digit code')
      setLoading(false)
      return
    }
    
    try {
      const res = await axiosRequest.post('/api/v1/auth/mfa/verify-enrolment', {
        token: data.token
      })
      
      if (res?.success && res?.data?.backupCodes) {
        setBackupCodes(res.data.backupCodes)
        setActiveStep(2)
        toast.success('MFA enabled successfully!')
      } else {
        setVerificationError(res?.message || 'Invalid code. Please try again.')
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Invalid code. Please try again.'
      setVerificationError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Copy backup codes
  const handleCopyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    toast.success('Backup codes copied to clipboard')
  }

  // Download backup codes
  const handleDownloadCodes = () => {
    const content = `Beno HRMS - MFA Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nImportant: Keep these codes safe. Each code can only be used once.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mfa-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded')
  }

  // Finish setup
  const handleFinish = () => {
    toast.success('MFA setup complete!')
    router.push('/settings/security')
  }

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <RightWrapper sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 500 }}>
            <Card sx={{ zIndex: 1 }}>
              <CardHeader 
                title='Two-Factor Authentication Setup'
                titleTypographyProps={{ variant: 'h5' }}
                subheader='Enhance your account security with TOTP-based two-factor authentication'
                subheaderTypographyProps={{ variant: 'body2', sx: { mt: 1, color: 'text.secondary' } }}
              />
              <CardContent>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map(label => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Step 0: Initial */}
                {activeStep === 0 && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='body1' sx={{ mb: 3 }}>
                      Two-factor authentication adds an extra layer of security to your account.
                      You'll need an authenticator app like Google Authenticator or Authy.
                    </Typography>
                    <Button 
                      variant='contained' 
                      size='large'
                      onClick={handleGenerateQR}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Icon icon='mdi:shield-lock' />}
                    >
                      {loading ? 'Generating...' : 'Generate QR Code'}
                    </Button>
                  </Box>
                )}

                {/* Step 1: QR Code Display */}
                {activeStep === 1 && (
                  <Box>
                    <Typography variant='body1' sx={{ mb: 3 }}>
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                      {qrCode && (
                        <QRCodeImage src={qrCode} alt='MFA QR Code' />
                      )}
                    </Box>

                    <Alert severity='info' sx={{ mb: 3 }}>
                      <Typography variant='body2'>
                        <strong>Can't scan?</strong> Enter this code manually:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={manualKey} 
                          sx={{ fontFamily: 'monospace', fontSize: '1rem', px: 2 }}
                        />
                        <Button
                          size='small'
                          startIcon={<Icon icon='mdi:content-copy' />}
                          onClick={() => {
                            navigator.clipboard.writeText(manualKey)
                            toast.success('Key copied!')
                          }}
                          sx={{ ml: 1 }}
                        >
                          Copy
                        </Button>
                      </Box>
                    </Alert>

                    <Box component='form' onSubmit={handleSubmit(handleVerifyToken)}>
                      <Controller
                        name='token'
                        control={control}
                        rules={{ required: 'Verification code is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label='Enter 6-digit code'
                            placeholder='000000'
                            error={Boolean(errors.token || verificationError)}
                            helperText={errors.token?.message || verificationError || 'Enter the code from your authenticator app'}
                            inputProps={{ 
                              maxLength: 6, 
                              style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' }
                            }}
                            sx={{ mb: 2 }}
                          />
                        )}
                      />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant='outlined'
                          onClick={() => setActiveStep(0)}
                          disabled={loading}
                        >
                          Back
                        </Button>
                        <Button
                          type='submit'
                          variant='contained'
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : null}
                          sx={{ flex: 1 }}
                        >
                          {loading ? 'Verifying...' : 'Verify & Enable'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Step 2: Backup Codes */}
                {activeStep === 2 && (
                  <Box>
                    <Alert severity='warning' sx={{ mb: 3 }}>
                      <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                        Save these backup codes now!
                      </Typography>
                      <Typography variant='body2'>
                        These codes are shown only once. Store them securely - you'll need them if you lose access to your authenticator.
                      </Typography>
                    </Alert>

                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                      gap: 1, 
                      mb: 3,
                      p: 2,
                      bgcolor: 'action.hover',
                      borderRadius: 1
                    }}>
                      {backupCodes.map((code, index) => (
                        <Chip 
                          key={index}
                          label={code}
                          sx={{ fontFamily: 'monospace', justifyContent: 'flex-start' }}
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Button
                        variant='outlined'
                        startIcon={<Icon icon='mdi:content-copy' />}
                        onClick={handleCopyCodes}
                        fullWidth
                      >
                        Copy All
                      </Button>
                      <Button
                        variant='outlined'
                        startIcon={<Icon icon='mdi:download' />}
                        onClick={handleDownloadCodes}
                        fullWidth
                      >
                        Download
                      </Button>
                    </Box>

                    <Button
                      variant='contained'
                      size='large'
                      fullWidth
                      onClick={handleFinish}
                      startIcon={<Icon icon='mdi:check' />}
                    >
                      Done
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </RightWrapper>
      </Box>
      <FooterIllustrationsV2 />
    </Box>
  )
}

MFASetupPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default MFASetupPage
