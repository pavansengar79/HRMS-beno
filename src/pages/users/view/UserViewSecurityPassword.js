// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import axiosRequest from 'src/utils/AxiosInterceptor'

const UserViewSecurityPassword = ({ employee }) => {
  // ** States
  const current_user = useSelector(state => state.auth.user)
  
  const [values, setValues] = useState({
    currentPassword: '',
    showCurrentPassword: false,
    newPassword: '',
    showNewPassword: false,
    confirmNewPassword: '',
    showConfirmNewPassword: false
  })
  
  const [loading, setLoading] = useState(false)

  // Check if this is the current user's own profile
  const isOwnProfile = current_user?._id === employee?._id || 
                       current_user?.id === employee?._id || 
                       current_user?._id === employee?.userId?._id || 
                       current_user?.id === employee?.userId?._id

  // Handle Password Changes
  const handleCurrentPasswordChange = prop => event => {
    setValues({ ...values, [prop]: event.target.value })
  }
  
  const handleNewPasswordChange = prop => event => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleConfirmNewPasswordChange = prop => event => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleClickShowCurrentPassword = () => {
    setValues({ ...values, showCurrentPassword: !values.showCurrentPassword })
  }
  
  const handleClickShowNewPassword = () => {
    setValues({ ...values, showNewPassword: !values.showNewPassword })
  }

  const handleClickShowConfirmNewPassword = () => {
    setValues({ ...values, showConfirmNewPassword: !values.showConfirmNewPassword })
  }

  // Submit Password Change
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!values.currentPassword) {
      toast.error('Current password is required')
      return
    }
    
    if (values.newPassword !== values.confirmNewPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (values.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(values.newPassword)
    const hasLowerCase = /[a-z]/.test(values.newPassword)
    const hasNumber = /[0-9]/.test(values.newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(values.newPassword)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast.error('Password must contain uppercase, lowercase, number, and special character')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await axiosRequest.post('/api/v1/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      })
      
      toast.success('Password changed successfully. Please login again.')
      
      // Clear form
      setValues({
        currentPassword: '',
        showCurrentPassword: false,
        newPassword: '',
        showNewPassword: false,
        confirmNewPassword: '',
        showConfirmNewPassword: false
      })
      
      // Optionally redirect to login after 2 seconds
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.clear()
          window.location.href = '/auth/login'
        }
      }, 2000)
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Only show security tab if viewing own profile
  if (!isOwnProfile) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <Icon icon='tabler:lock' fontSize={60} sx={{ color: 'text.disabled', mb: 2 }} />
        <Typography variant='h6' sx={{ color: 'text.secondary' }}>
          Security settings are only available for your own profile
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ mb: 6 }}>
      <CardHeader title='Change Password' />
      <CardContent>
        <Alert icon={false} severity='warning' sx={{ mb: 4 }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 500, mb: 1 }}>
            Password Requirements
          </Typography>
          Minimum 8 characters long, at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&* etc.)
        </Alert>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Current Password'
                placeholder='············'
                value={values.currentPassword}
                id='user-view-security-current-password'
                onChange={handleCurrentPasswordChange('currentPassword')}
                type={values.showCurrentPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowCurrentPassword}
                        onMouseDown={e => e.preventDefault()}
                        aria-label='toggle password visibility'
                      >
                        <Icon fontSize='1.25rem' icon={values.showCurrentPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='New Password'
                placeholder='············'
                value={values.newPassword}
                id='user-view-security-new-password'
                onChange={handleNewPasswordChange('newPassword')}
                type={values.showNewPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowNewPassword}
                        onMouseDown={e => e.preventDefault()}
                        aria-label='toggle password visibility'
                      >
                        <Icon fontSize='1.25rem' icon={values.showNewPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                placeholder='············'
                label='Confirm New Password'
                value={values.confirmNewPassword}
                id='user-view-security-confirm-new-password'
                type={values.showConfirmNewPassword ? 'text' : 'password'}
                onChange={handleConfirmNewPasswordChange('confirmNewPassword')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onMouseDown={e => e.preventDefault()}
                        aria-label='toggle password visibility'
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
            </Grid>

            <Grid item xs={12}>
              <Button type='submit' variant='contained' disabled={loading}>
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Box>
  )
}

export default UserViewSecurityPassword
