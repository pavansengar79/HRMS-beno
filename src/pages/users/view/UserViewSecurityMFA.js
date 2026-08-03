// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useSelector } from 'react-redux'

const UserViewSecurityMFA = ({ employee }) => {
  const current_user = useSelector(state => state.auth.user)
  
  // Check if this is the current user's own profile
  const isOwnProfile = current_user?._id === employee?._id || 
                       current_user?.id === employee?._id || 
                       current_user?._id === employee?.userId?._id || 
                       current_user?.id === employee?.userId?._id
  
  // Get MFA status from user
  const mfaEnabled = employee?.userId?.mfaEnabled || current_user?.mfaEnabled || false
  
  if (!isOwnProfile) {
    return null
  }

  return (
    <Box sx={{ mt: 6 }}>
      <Divider sx={{ mb: 6 }} />
      
      <Typography variant='h6' sx={{ mb: 4 }}>
        Two-Step Verification
      </Typography>
      
      <Alert severity='info' sx={{ mb: 4 }}>
        <AlertTitle>Coming Soon</AlertTitle>
        Two-factor authentication (2FA/MFA) via authenticator apps will be available in a future update.
      </Alert>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 500, color: 'text.primary' }}>
            Authenticator App
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Use an authenticator app (Google Authenticator, Authy, etc.) to get verification codes
          </Typography>
        </Box>
        <Button variant='outlined' disabled>
          {mfaEnabled ? 'Disable' : 'Enable'}
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 500, color: 'text.primary' }}>
            SMS Authentication
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Receive verification codes via SMS
          </Typography>
        </Box>
        <Button variant='outlined' disabled>
          Setup
        </Button>
      </Box>
    </Box>
  )
}

export default UserViewSecurityMFA
