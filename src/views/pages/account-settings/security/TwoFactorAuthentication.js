// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Step from '@mui/material/Step'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Stepper from '@mui/material/Stepper'
import StepLabel from '@mui/material/StepLabel'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import CustomTextField from 'src/@core/components/mui/text-field'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { useSelector } from 'react-redux'


// ** Axios (uses interceptor — token auto-attached)

// ─── Styled Components ────────────────────────────────────────────────────────

const CustomCloseButton = styled(IconButton)(({ theme }) => ({
  top: 0,
  right: 0,
  color: 'grey.500',
  position: 'absolute',
  boxShadow: theme.shadows[2],
  transform: 'translate(10px, -10px)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette.background.paper} !important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': { transform: 'translate(7px, -5px)' }
}))

const QRBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  margin: theme.spacing(4, 0)
}))

const BackupCodeGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(2),
  margin: theme.spacing(3, 0)
}))

const BackupCodeItem = styled(Box)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '0.85rem',
  fontWeight: 600,
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.action.hover,
  border: `1px solid ${theme.palette.divider}`,
  textAlign: 'center',
  letterSpacing: '0.05em',
  color: theme.palette.text.primary
}))

const OtpInput = styled(CustomTextField)(({ theme }) => ({
  '& input': {
    textAlign: 'center',
    fontSize: '1.5rem',
    fontFamily: 'monospace',
    letterSpacing: '0.5em',
    fontWeight: 700
  }
}))

// ─── Steps ────────────────────────────────────────────────────────────────────

const ENROL_STEPS = ['Scan QR Code', 'Verify Code', 'Save Backup Codes']

// ─── Disable Dialog ───────────────────────────────────────────────────────────

const DisableMFADialog = ({ open, onClose, onDisabled }) => {
  const [loading, setLoading] = useState(false)
  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { token: '' } })

  const handleDisable = async ({ token }) => {
    setLoading(true)
    try {
      await axiosRequest.post('/api/v1/auth/mfa/disable', { token })
      toast.success('MFA disabled successfully')
      reset()
      onDisabled()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to disable MFA')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog
      fullWidth
      maxWidth='xs'
      open={open}
      onClose={handleClose}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogContent
        sx={{
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(10)} !important`],
          py: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(10)} !important`]
        }}
      >
        <CustomCloseButton onClick={handleClose}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>

        <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'error.light'
            }}
          >
            <Icon icon='tabler:shield-off' fontSize='1.75rem' color='error' />
          </Box>
          <Typography variant='h5'>Disable Two-Factor Auth</Typography>
          <Typography variant='body2' color='text.secondary' textAlign='center'>
            Enter the 6-digit code from your authenticator app to confirm.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(handleDisable)}>
          <Controller
            name='token'
            control={control}
            rules={{
              required: 'Code is required',
              pattern: { value: /^\d{6}$/, message: 'Must be a 6-digit code' }
            }}
            render={({ field }) => (
              <OtpInput
                {...field}
                fullWidth
                label='Authenticator Code'
                placeholder='000000'
                inputProps={{ maxLength: 6 }}
                error={Boolean(errors.token)}
                helperText={errors.token?.message}
                sx={{ mb: 6 }}
              />
            )}
          />

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Button fullWidth variant='tonal' color='secondary' onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button fullWidth variant='contained' color='error' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={20} color='inherit' /> : 'Disable MFA'}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Enrol Dialog ─────────────────────────────────────────────────────────────

const EnrolMFADialog = ({ open, onClose, onEnrolled }) => {
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading]       = useState(false)
  const [qrCode, setQrCode]         = useState(null)
  const [backupCodes, setBackupCodes] = useState([])

  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { token: '' } })

  // Step 0 — fetch QR on dialog open
  const fetchQR = async () => {
    setLoading(true)
    try {
      const res = await axiosRequest.post('/api/v1/auth/mfa/enrol')
      console.log('QR code response:', res.data)
      setQrCode(res.data?.qrCode)
      setActiveStep(0)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to start MFA setup')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  // Called when dialog opens
  const handleEnter = () => {
    reset()
    setActiveStep(0)
    setQrCode(null)
    setBackupCodes([])
    fetchQR()
  }

  // Step 1 — verify OTP
  const handleVerify = async ({ token }) => {
    setLoading(true)
    try {
      const res = await axiosRequest.post('/api/v1/auth/mfa/verify-enrolment', { token })
      const codes = res.data?.data?.backupCodes || []
      setBackupCodes(codes)
      setActiveStep(2)
      toast.success('MFA enabled successfully!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDone = () => {
    onEnrolled()
    onClose()
  }

  const handleClose = () => {
    // Only allow closing from last step or step 0 loading
    if (activeStep === 2 || activeStep === 0) {
      onClose()
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    toast.success('Backup codes copied!')
  }

  return (
    <Dialog
      fullWidth
      maxWidth='sm'
      open={open}
      onClose={handleClose}
      TransitionProps={{ onEntered: handleEnter }}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogContent
        sx={{
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(12)} !important`],
          py: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(10)} !important`]
        }}
      >
        {activeStep === 2 && (
          <CustomCloseButton onClick={handleClose}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
        )}

        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 1 }}>
            {activeStep === 0 && 'Scan QR Code'}
            {activeStep === 1 && 'Verify Your Code'}
            {activeStep === 2 && '🎉 MFA Enabled!'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {activeStep === 0 && 'Open your authenticator app and scan the code below'}
            {activeStep === 1 && 'Enter the 6-digit code shown in your authenticator app'}
            {activeStep === 2 && 'Save your backup codes somewhere safe — they won\'t be shown again'}
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
          {ENROL_STEPS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* ── Step 0: QR Code ── */}
        {activeStep === 0 && (
          <>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <QRBox>
                  {qrCode && (
                    <img
                      src={qrCode}
                      alt='MFA QR Code'
                      style={{ width: 200, height: 200, imageRendering: 'pixelated' }}
                    />
                  )}
                </QRBox>

                <Alert severity='info' sx={{ mb: 6 }}>
                  Use <strong>Google Authenticator</strong>, <strong>Authy</strong>, or any TOTP app to scan this QR code.
                </Alert>

                <Button
                  fullWidth
                  variant='contained'
                  endIcon={<Icon icon='tabler:arrow-right' />}
                  onClick={() => setActiveStep(1)}
                >
                  I've scanned the code
                </Button>
              </>
            )}
          </>
        )}

        {/* ── Step 1: Verify OTP ── */}
        {activeStep === 1 && (
          <form onSubmit={handleSubmit(handleVerify)}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Icon icon='tabler:device-mobile' fontSize='3rem' color='primary' />
            </Box>

            <Controller
              name='token'
              control={control}
              rules={{
                required: 'Code is required',
                pattern: { value: /^\d{6}$/, message: 'Must be a 6-digit code' }
              }}
              render={({ field }) => (
                <OtpInput
                  {...field}
                  fullWidth
                  label='6-digit Code'
                  placeholder='000000'
                  inputProps={{ maxLength: 6 }}
                  error={Boolean(errors.token)}
                  helperText={errors.token?.message}
                  sx={{ mb: 6 }}
                  onChange={e => {
                    // Only allow digits
                    const val = e.target.value.replace(/\D/g, '')
                    field.onChange(val)
                  }}
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 3 }}>
              <Button
                fullWidth
                variant='tonal'
                color='secondary'
                onClick={() => setActiveStep(0)}
                disabled={loading}
                startIcon={<Icon icon='tabler:arrow-left' />}
              >
                Back
              </Button>
              <Button fullWidth variant='contained' type='submit' disabled={loading}>
                {loading ? <CircularProgress size={20} color='inherit' /> : 'Verify & Enable'}
              </Button>
            </Box>
          </form>
        )}

        {/* ── Step 2: Backup Codes ── */}
        {activeStep === 2 && (
          <>
            <Alert severity='warning' sx={{ mb: 4 }}>
              <strong>Save these now.</strong> Each code can only be used once if you lose access to your authenticator app.
            </Alert>

            <BackupCodeGrid>
              {backupCodes.map((code, i) => (
                <BackupCodeItem key={i}>{code}</BackupCodeItem>
              ))}
            </BackupCodeGrid>

            <Button
              fullWidth
              variant='tonal'
              color='secondary'
              startIcon={<Icon icon='tabler:copy' />}
              onClick={copyBackupCodes}
              sx={{ mb: 4 }}
            >
              Copy All Codes
            </Button>

            <Divider sx={{ mb: 4 }} />

            <Button
              fullWidth
              variant='contained'
              onClick={handleDone}
              endIcon={<Icon icon='tabler:check' />}
            >
              Done — I've saved my codes
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Card ────────────────────────────────────────────────────────────────

const TwoFactorAuthenticationCard = () => {
  const user = useSelector(state => state.auth.user)
const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled ?? false)
  const [enrolOpen, setEnrolOpen]   = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)

  const handleToggle = () => {
    if (mfaEnabled) {
      setDisableOpen(true)
    } else {
      setEnrolOpen(true)
    }
  }

  return (
    <>
      <Card>
        <CardHeader title='Two-step verification' />
        <CardContent>
          {/* Status row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Typography variant='h6'>
              Two factor authentication is
            </Typography>
            <Chip
              size='small'
              label={mfaEnabled ? 'Enabled' : 'Disabled'}
              color={mfaEnabled ? 'success' : 'default'}
              icon={<Icon icon={mfaEnabled ? 'tabler:shield-check' : 'tabler:shield-off'} />}
            />
          </Box>

          <Typography sx={{ mb: 6, width: ['100%', '100%', '75%'], color: 'text.secondary' }}>
            Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to log in.{' '}
            <Box
              href='/'
              component='a'
              onClick={e => e.preventDefault()}
              sx={{ textDecoration: 'none', color: 'primary.main' }}
            >
              Learn more.
            </Box>
          </Typography>

          <Button
            variant={mfaEnabled ? 'tonal' : 'contained'}
            color={mfaEnabled ? 'error' : 'primary'}
            startIcon={<Icon icon={mfaEnabled ? 'tabler:shield-off' : 'tabler:shield-check'} />}
            onClick={handleToggle}
          >
            {mfaEnabled ? 'Disable two-factor authentication' : 'Enable two-factor authentication'}
          </Button>
        </CardContent>
      </Card>

      {/* Enrol Flow */}
      <EnrolMFADialog
        open={enrolOpen}
        onClose={() => setEnrolOpen(false)}
        onEnrolled={() => setMfaEnabled(true)}
      />

      {/* Disable Flow */}
      <DisableMFADialog
        open={disableOpen}
        onClose={() => setDisableOpen(false)}
        onDisabled={() => setMfaEnabled(false)}
      />
    </>
  )
}

export default TwoFactorAuthenticationCard