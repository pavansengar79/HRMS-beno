// src/pages/auth/sso/callback.js
// SSO Callback handler - receives token from WorkOS and completes authentication

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import toast from 'react-hot-toast'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import axiosRequest from 'src/utils/AxiosInterceptor'
import authConfig from 'src/configs/auth'
import { rehydrateAuth } from 'src/store/auth/authSlice'

// ─── Styled ────────────────────────────────────────────────────────────────

const StyledBox = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default
}))

// ─── Component ──────────────────────────────────────────────────────────────

const SSOCallbackPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const [error, setError] = useState(null)

  useEffect(() => {
    const { token, isNewUser, error: urlError } = router.query

    if (!router.isReady) return

    if (urlError) {
      setError(urlError)
      toast.error(urlError)
      setTimeout(() => router.replace('/auth/login'), 3000)
      return
    }

    if (!token) {
      setError('No authentication token received')
      setTimeout(() => router.replace('/auth/login'), 3000)
      return
    }

    // Store token
    const tokenKey = authConfig.storageTokenKeyName || 'accessToken'
    window.localStorage.setItem(tokenKey, token)
    window.localStorage.setItem('ssoLogin', 'true')

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const res = await axiosRequest.get('/api/v1/auth/me')
        
        if (res?.success && res?.data) {
          window.localStorage.setItem('userData', JSON.stringify(res.data))
          dispatch(rehydrateAuth({ user: res.data, token }))
          
          toast.success(`Welcome${res.data.name ? `, ${res.data.name}` : ''}!`)
          
          // Redirect based on user status
          if (isNewUser === 'true') {
            toast('Please complete your profile', { icon: '👤' })
            router.replace('/settings/profile')
          } else {
            router.replace('/')
          }
        } else {
          throw new Error('Failed to fetch user data')
        }
      } catch (err) {
        const errorMsg = err?.response?.data?.message || 'SSO login failed'
        setError(errorMsg)
        toast.error(errorMsg)
        setTimeout(() => router.replace('/auth/login'), 2000)
      }
    }

    fetchUserData()
  }, [router, dispatch])

  if (error) {
    return (
      <StyledBox>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 2 }}>
            SSO Login Failed
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {error}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            Redirecting to login page...
          </Typography>
        </Box>
      </StyledBox>
    )
  }

  return (
    <StyledBox>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={48} sx={{ mb: 3 }} />
        <Typography variant='h6'>
          Completing SSO login...
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Please wait while we set up your session
        </Typography>
      </Box>
    </StyledBox>
  )
}

SSOCallbackPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default SSOCallbackPage
