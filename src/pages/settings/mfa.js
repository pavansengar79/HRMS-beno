// src/pages/settings/mfa.js
// MFA Management Settings Page — View status, generate new backup codes, disable MFA

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/Input'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import { styled } from '@mui/material/styles'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'
import authConfig from 'src/configs/auth'

// ─── Styled ────────────────────────────────────────────────────────────────

const MFAStatusCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1]
}))

// ─── Main Component ────────────────────────────────────────────────────────

const MFAManagementPage = () => {
  const router = useRouter()
  const [mfaStatus, setMfaStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState(null) // 'disable' or 'regenerate'
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [newBackupCodes, setNewBackupCodes] = useState(null)

  useEffect(() => {
    fetchMFAStatus()
  }, [])

  const fetchMFAStatus = async () => {
    setLoading(true)
    try {
      const res = await axiosRequest.get('/api/v1/auth/mfa/status')
      setMfaStatus(res?.data || res)
    } catch (err) {
      toast.error('Failed to fetch MFA status')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = type => {
    setDialogType(type)
    setDialogOpen(true)
    setToken('')
    setPassword('')
    setNewBackupCodes(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setDialogType(null)
    setToken('')
    setPassword('')
    setNewBackupCodes(null)
  }

  const handleDisableMFA = async () => {
    if (!token || !password) {
      toast.error('Please enter both OTP and password')
      return
    }

    setSubmitting(true)
    try {
      const res = await axiosRequest.post('/api/v1/auth/mfa/disable', { token, password })
      if (res?.success) {
        toast.success('MFA disabled successfully')
        handleCloseDialog()
        fetchMFAStatus()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to disable MFA')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegenerateCodes = async () => {
    if (!token) {
      toast.error('Please enter OTP to regenerate backup codes')
      return
    }

    setSubmitting(true)
    try {
      const res = await axiosRequest.post('/api/v1/auth/mfa/backup-codes/regenerate', { token })
      if (res?.success && res?.data?.backupCodes) {
        setNewBackupCodes(res.data.backupCodes)
        toast.success('New backup codes generated')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to regenerate backup codes')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyCodes = () => {
    if (newBackupCodes) {
      navigator.clipboard.writeText(newBackupCodes.join('\n'))
      toast.success('Backup codes copied to clipboard')
    }
  }

  const handleDownloadCodes = () => {
    if (!newBackupCodes) return
    const content = `Beno HRMS - MFA Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${newBackupCodes.join('\n')}\n\nImportant: Keep these codes safe. Each code can only be used once.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mfa-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 6 }}>
      <Typography variant='h4' sx={{ mb: 6 }}>
        Two-Factor Authentication
      </Typography>

      {mfaStatus?.enabled ? (
        // MFA Enabled View
        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
            <MFAStatusCard>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon='mdi:shield-check' color='success' fontSize={28} />
                    <Typography variant='h6'>Two-Factor Authentication is Enabled</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Box sx={{ mb: 4 }}>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    Your account is protected with TOTP-based two-factor authentication.
                  </Typography>
                  
                  {mfaStatus.enrolledAt && (
                    <Typography variant='body2' color='text.secondary'>
                      Enabled on: {new Date(mfaStatus.enrolledAt).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>

                <Button 
                  variant='outlined' 
                  color='primary'
                  startIcon={<Icon icon='mdi:refresh' />}
                  onClick={() => handleOpenDialog('regenerate')}
                  sx={{ mr: 2 }}
                >
                  Regenerate Backup Codes
                </Button>

                <Button 
                  variant='outlined' 
                  color='error'
                  startIcon={<Icon icon='mdi:shield-off' />}
                  onClick={() => handleOpenDialog('disable')}
                >
                  Disable MFA
                </Button>
              </CardContent>
            </MFAStatusCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <MFAStatusCard>
              <CardHeader title='Backup Codes' />
              <CardContent>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  Recovery codes can be used to access your account if you lose your authenticator device.
                </Typography>
                {mfaStatus.remainingBackupCodes !== undefined && (
                  <Typography variant='h3' color='primary'>
                    {mfaStatus.remainingBackupCodes}
                  </Typography>
                )}
                <Typography variant='body2' color='text.secondary'>
                  backup codes remaining
                </Typography>
              </CardContent>
            </MFAStatusCard>
          </Grid>
        </Grid>
      ) : (
        // MFA Not Enabled View
        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
            <MFAStatusCard>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon='mdi:shield-alert' color='warning' fontSize={28} />
                    <Typography variant='h6'>Two-Factor Authentication is Not Enabled</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Alert severity='info' sx={{ mb: 4 }}>
                  <Typography variant='subtitle2'>Enhance your account security</Typography>
                  <Typography variant='body2'>
                    Two-factor authentication adds an extra layer of protection. Even if someone knows your password, they won't be able to access your account without a verification code.
                  </Typography>
                </Alert>

                <Button 
                  variant='contained' 
                  color='primary'
                  size='large'
                  startIcon={<Icon icon='mdi:shield-lock' />}
                  onClick={() => router.push('/auth/mfa-setup')}
                >
                  Enable Two-Factor Authentication
                </Button>
              </CardContent>
            </MFAStatusCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <MFAStatusCard>
              <CardHeader title='How It Works' />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label='1' size='small' color='primary' />
                    <Typography variant='body2'>Scan QR code with authenticator app</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label='2' size='small' color='primary' />
                    <Typography variant='body2'>Enter 6-digit code from app</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label='3' size='small' color='primary' />
                    <Typography variant='body2'>Save backup codes securely</Typography>
                  </Box>
                </Box>
              </CardContent>
            </MFAStatusCard>
          </Grid>
        </Grid>
      )}

      {/* Dialogs */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>
          {dialogType === 'disable' ? 'Disable Two-Factor Authentication' : 'Regenerate Backup Codes'}
        </DialogTitle>
        <DialogContent>
          {newBackupCodes ? (
            <Box>
              <Alert severity='warning' sx={{ mb: 3 }}>
                Save these new backup codes now. Your old codes are no longer valid.
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
                {newBackupCodes.map((code, index) => (
                  <Chip 
                    key={index}
                    label={code}
                    sx={{ fontFamily: 'monospace', justifyContent: 'flex-start' }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button startIcon={<Icon icon='mdi:content-copy' />} onClick={handleCopyCodes}>
                  Copy All
                </Button>
                <Button startIcon={<Icon icon='mdi:download' />} onClick={handleDownloadCodes}>
                  Download
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <DialogContentText sx={{ mb: 3 }}>
                {dialogType === 'disable' 
                  ? 'To disable two-factor authentication, please enter your current password and a verification code from your authenticator app.'
                  : 'Enter a verification code from your authenticator app to generate new backup codes. Your old backup codes will become invalid.'}
              </DialogContentText>

              <TextField
                autoFocus
                margin='dense'
                label='6-digit verification code'
                type='text'
                fullWidth
                variant='outlined'
                value={token}
                onChange={e => setToken(e.target.value)}
                inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.3em' } }}
                sx={{ mb: 2 }}
              />

              {dialogType === 'disable' && (
                <TextField
                  margin='dense'
                  label='Your password'
                  type='password'
                  fullWidth
                  variant='outlined'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            {newBackupCodes ? 'Done' : 'Cancel'}
          </Button>
          {!newBackupCodes && (
            <Button 
              onClick={dialogType === 'disable' ? handleDisableMFA : handleRegenerateCodes}
              variant='contained'
              color={dialogType === 'disable' ? 'error' : 'primary'}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Processing...' : 'Confirm'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MFAManagementPage
