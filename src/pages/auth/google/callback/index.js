import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import authConfig from 'src/configs/auth'
import { setCredentials } from 'src/store/auth/authSlice'

const BACKEND_BASE_URL = 'https://2c6q0jsk-3000.inc1.devtunnels.ms'

const GoogleCallbackPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()

  const [error, setError] = useState(null)

  const returnUrl = useMemo(() => {
    const q = router.query?.returnUrl
    return typeof q === 'string' ? q : null
  }, [router.query])

  useEffect(() => {
    if (!router.isReady) return

    const run = async () => {
      try {
        const tokenKey = authConfig.storageTokenKeyName || 'accessToken'

        // Case A: backend redirected to frontend with token+user already present
        if (typeof router.query?.token === 'string' && typeof router.query?.user === 'string') {
          const token = router.query.token
          const user = JSON.parse(router.query.user)
          const onboarding =
            typeof router.query?.onboarding === 'string' ? JSON.parse(router.query.onboarding) : undefined

          window.localStorage.setItem(tokenKey, token)
          window.localStorage.setItem('userData', JSON.stringify(user))
          dispatch(setCredentials({ user, token }))

          if (onboarding && onboarding?.isComplete === false) {
            router.replace('/auth/register-company')
          } else {
            router.replace(returnUrl && returnUrl !== '/' ? returnUrl : '/dashboards/analytics')
          }

          return
        }

        // Case B: frontend received `code` (Google redirect URI points here) → exchange via backend callback
        const queryString = router.asPath.includes('?') ? router.asPath.split('?')[1] : ''
        const url = `${BACKEND_BASE_URL}/api/v1/auth/google/callback${queryString ? `?${queryString}` : ''}`

        const res = await fetch(url, { method: 'GET', credentials: 'include' })
        const json = await res.json()

        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Google login failed')
        }

        const token = json?.data?.token
        const user = json?.data?.user
        const onboarding = json?.data?.onboarding

        if (!token || !user) {
          throw new Error('Missing token or user in response')
        }

        window.localStorage.setItem(tokenKey, token)
        window.localStorage.setItem('userData', JSON.stringify(user))
        dispatch(setCredentials({ user, token }))

        if (onboarding?.isComplete === false) {
          router.replace('/auth/register-company')
        } else {
          router.replace(returnUrl && returnUrl !== '/' ? returnUrl : '/dashboards/analytics')
        }
      } catch (e) {
        setError(e?.message || 'Something went wrong during Google login')
      }
    }

    run()
  }, [dispatch, returnUrl, router])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 3,
        p: 6
      }}
    >
      {!error ? (
        <>
          <CircularProgress />
          <Typography variant='h6'>Finishing Google sign-in…</Typography>
        </>
      ) : (
        <>
          <Typography variant='h6' color='error'>
            {error}
          </Typography>
          <Button variant='contained' onClick={() => router.replace('/auth/login')}>
            Back to login
          </Button>
        </>
      )}
    </Box>
  )
}

GoogleCallbackPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
GoogleCallbackPage.guestGuard = true

export default GoogleCallbackPage

