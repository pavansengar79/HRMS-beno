import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import authConfig from 'src/configs/auth'
import { setCredentials } from 'src/store/auth/authSlice'

// Use environment variable with fallback to localhost backend
const BACKEND_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')

const GoogleCallbackPage = () => {
const router = useRouter()
const dispatch = useDispatch()
const [error, setError] = useState(null)
const started = useRef(false)

useEffect(() => {
    if (!router.isReady || started.current) return
    started.current = true

    const fragment = Object.fromEntries(new URLSearchParams(window.location.hash.slice(1)))
    const query = { ...router.query, ...fragment }
    window.history.replaceState(window.history.state, '', window.location.pathname)

    const run = async () => {
     try {
        const tokenKey = authConfig.storageTokenKeyName || 'accessToken'
        if (query.error) throw new Error(query.error)

        if (query.newUser === 'true' || query.isNewUser === 'true') {
          router.replace({ pathname: '/auth/register', query: { email: query.email || '', name: query.name || '' } })
          return
        }

        if (query.mfaRequired === 'true' && query.mfaToken) {
          router.replace({ pathname: '/auth/mfa-challenge', query: { mfaToken: query.mfaToken, email: query.email || '' } })
          return
        }

        const token = typeof query.token === 'string' ? query.token : null
        if (!token) throw new Error('Missing Google sign-in result')

        const meRes = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const meJson = await meRes.json().catch(() => null)
        const user = meJson?.data?.user || meJson?.user
        if (!meRes.ok || !user) {
          throw new Error(meJson?.message || 'Google sign-in succeeded but loading your profile failed')
        }

        const subscription = meJson?.data?.subscription || null
        const storedUser = { ...user, subscription }
        window.localStorage.setItem(tokenKey, token)
        window.localStorage.setItem('userData', JSON.stringify(storedUser))
        window.localStorage.removeItem('tempToken')
        dispatch(setCredentials({ user: storedUser, token, subscription }))

        const destination = typeof query.returnUrl === 'string' && /^\/(?!\/|auth\/)/.test(query.returnUrl)
          ? query.returnUrl
          : '/dashboards/analytics'
        router.replace(query.isFirstLogin === 'true' || user.is_first_login ? '/auth/set-password' : destination)

     } catch (e) {
        setError(e?.message || 'Something went wrong during Google login')
     }
    }

    run()
}, [dispatch, router])

return (
    <Box sx={{
     minHeight: '100vh',
     display:        'flex',
     alignItems:     'center',
     justifyContent: 'center',
     flexDirection: 'column',
     gap: 3,
     p: 6
    }}>
     {!error ? (
        <>
         <CircularProgress />
         <Typography variant='h6'>Finishing Google sign-in…</Typography>
        </>
     ) : (
        <>
         <Typography variant='h6' color='error'>{error}</Typography>
         <Button variant='contained' onClick={() => router.replace('/auth/login')}>
            Back to login
         </Button>
        </>
     )}
    </Box>
)
}

GoogleCallbackPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
GoogleCallbackPage.guestGuard = false
GoogleCallbackPage.authGuard = false

export default GoogleCallbackPage