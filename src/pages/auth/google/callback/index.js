// // src/pages/auth/google/callback.jsx
// //
// // CHANGES from your version:
// //   1. Case 0 mein onboarding check add kiya — agar backend ?onboarding=false bhi bheje
// //   2. Case 0 mein /auth/register-company redirect added (was missing)
// //   3. me endpoint URL fix — leading slash missing tha

// import { useEffect, useMemo, useState } from 'react'
// import { useRouter } from 'next/router'
// import { useDispatch } from 'react-redux'

// import Box from '@mui/material/Box'
// import Button from '@mui/material/Button'
// import CircularProgress from '@mui/material/CircularProgress'
// import Typography from '@mui/material/Typography'

// import BlankLayout from 'src/@core/layouts/BlankLayout'
// import authConfig from 'src/configs/auth'
// import { setCredentials } from 'src/store/auth/authSlice'

// const BACKEND_BASE_URL = 'https://2c6q0jsk-3000.inc1.devtunnels.ms'

// const GoogleCallbackPage = () => {
//   const router   = useRouter()
//   const dispatch = useDispatch()

//   const [error, setError] = useState(null)

//   const returnUrl = useMemo(() => {
//     const q = router.query?.returnUrl
//     return typeof q === 'string' ? q : null
//   }, [router.query])

//   useEffect(() => {
//     if (!router.isReady) return

//     const run = async () => {
//       try {
//         const tokenKey = authConfig.storageTokenKeyName || 'accessToken'

//         // ── Case 0: backend ne ?token=xxx bheja (user string nahi hai) ──────
//         // Backend sirf token bhejta hai → hum /me se user fetch karte hain
//         if (typeof router.query?.token === 'string' && typeof router.query?.user !== 'string') {
//           const token      = router.query.token
//           const onboarding = typeof router.query?.onboarding === 'string'
//             ? JSON.parse(router.query.onboarding)
//             : undefined

//           window.localStorage.setItem(tokenKey, token)

//           // /me endpoint se user fetch karo
//           // FIX: leading slash ensure karo
//           const meEndpoint = authConfig.meEndpoint?.startsWith('/')
//             ? authConfig.meEndpoint
//             : `/${authConfig.meEndpoint || 'api/v1/auth/me'}`

//           const meUrl = `${BACKEND_BASE_URL}${meEndpoint}`

          
//           const meRes  = await fetch(meUrl, {
//             method: 'GET',
//             headers: { Authorization: `Bearer ${token}` }
//           })
//           const meJson = await meRes.json().catch(() => null)

//           const user = meJson?.data?.user || meJson?.user || meJson?.data
//           if (!meRes.ok || !user) {
//             throw new Error(meJson?.message || 'Google login succeeded but fetching user failed')
//           }

//           window.localStorage.setItem('userData', JSON.stringify(user))
//           dispatch(setCredentials({ user, token }))

//           // ── FIX: onboarding check yahan bhi ────────────────────────────
//           // Agar backend ne onboarding param bheja
//           if (onboarding?.isComplete === false) {
//             router.replace('/auth/register-company')
//           } else if (user?.onboarding?.isComplete === false) {
//             // Ya /me response mein onboarding field ho
//             router.replace('/auth/register-company')
//           } else {
//             router.replace(returnUrl && returnUrl !== '/auth/google/callback' ? returnUrl : '/dashboards/analytics')
//           }
//           return
//         }

//         // ── Case A: backend ne ?token=xxx&user=yyy bheja ─────────────────
//         if (typeof router.query?.token === 'string' && typeof router.query?.user === 'string') {
//           const token      = router.query.token
//           const user       = JSON.parse(router.query.user)
//           const onboarding = typeof router.query?.onboarding === 'string'
//             ? JSON.parse(router.query.onboarding)
//             : undefined

//           window.localStorage.setItem(tokenKey, token)
//           window.localStorage.setItem('userData', JSON.stringify(user))
//           dispatch(setCredentials({ user, token }))

//           if (onboarding?.isComplete === false) {
//             router.replace('/auth/register-company')
//           } else {
//             router.replace(returnUrl && returnUrl !== '/auth/google/callback' ? returnUrl : '/dashboards/analytics')
//           }
//           return
//         }

//         // ── Case B: ?code=xxx — Google ne code bheja, backend se exchange karo
//         const queryString = router.asPath.includes('?') ? router.asPath.split('?')[1] : ''
//         const url = `${BACKEND_BASE_URL}/api/v1/auth/google/callback${queryString ? `?${queryString}` : ''}`

//         const res  = await fetch(url, { method: 'GET' })
//         const json = await res.json()

//         if (!res.ok || !json?.success) {
//           throw new Error(json?.message || 'Google login failed')
//         }

//         const token      = json?.data?.token
//         const user       = json?.data?.user
//         const onboarding = json?.data?.onboarding

//         if (!token || !user) {
//           throw new Error('Missing token or user in response')
//         }

//         window.localStorage.setItem(tokenKey, token)
//         window.localStorage.setItem('userData', JSON.stringify(user))
//         dispatch(setCredentials({ user, token }))

//         if (onboarding?.isComplete === false) {
//           router.replace('/auth/register-company')
//         } else {
//           router.replace(returnUrl && returnUrl !== '/auth/google/callback' ? returnUrl : '/dashboards/analytics')
//         }

//       } catch (e) {
//         setError(e?.message || 'Something went wrong during Google login')
//       }
//     }

//     run()
//   }, [dispatch, returnUrl, router])

//   return (
//     <Box sx={{
//       minHeight: '100vh',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       flexDirection: 'column',
//       gap: 3,
//       p: 6
//     }}>
//       {!error ? (
//         <>
//           <CircularProgress />
//           <Typography variant='h6'>Finishing Google sign-in…</Typography>
//         </>
//       ) : (
//         <>
//           <Typography variant='h6' color='error'>{error}</Typography>
//           <Button variant='contained' onClick={() => router.replace('/auth/login')}>
//             Back to login
//           </Button>
//         </>
//       )}
//     </Box>
//   )
// }

// GoogleCallbackPage.getLayout  = page => <BlankLayout>{page}</BlankLayout>
// GoogleCallbackPage.guestGuard = true

// export default GoogleCallbackPage




// src/pages/auth/google/callback.jsx
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

const BACKEND_BASE_URL = 'https://s0380lsz-3000.inc1.devtunnels.ms/'

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

        // ── Case 0: backend ne ?token=xxx bheja (user string nahi hai) ──────
        if (typeof router.query?.token === 'string' && typeof router.query?.user !== 'string') {
         const token = router.query.token

         // ✅ New user — company registration pe bhejo
         if (router.query?.isNewUser === 'true') {
            window.localStorage.setItem('tempToken', token)
            router.replace('/auth/register-company')
            return
         }

         // ✅ Existing user — flat params se onboarding check karo
         const isOnboardingComplete = router.query?.isOnboardingComplete === 'true'

         window.localStorage.setItem(tokenKey, token)

         // /me se user fetch karo
         const meUrl = `${BACKEND_BASE_URL}/api/v1/auth/me`
         const meRes = await fetch(meUrl, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
         })
         const meJson = await meRes.json().catch(() => null)
         const user = meJson?.data?.user || meJson?.user || meJson?.data

         if (!meRes.ok || !user) {
            throw new Error(meJson?.message || 'Google login succeeded but fetching user failed')
         }

         window.localStorage.setItem('userData', JSON.stringify(user))
         dispatch(setCredentials({ user, token }))

         // ✅ Onboarding check — flat param se
         if (!isOnboardingComplete) {
            router.replace('/auth/register-company')
         } else {
            router.replace(
             returnUrl && returnUrl !== '/auth/google/callback'
                ? returnUrl
                : '/dashboards/analytics'
            )
         }
         return
        }

        // ── Case A: backend ne ?token=xxx&user=yyy bheja ─────────────────
        if (typeof router.query?.token === 'string' && typeof router.query?.user === 'string') {
         const token = router.query.token
         const user = JSON.parse(router.query.user)
         const isOnboardingComplete = router.query?.isOnboardingComplete === 'true'

         window.localStorage.setItem(tokenKey, token)
         window.localStorage.setItem('userData', JSON.stringify(user))
         dispatch(setCredentials({ user, token }))

         if (!isOnboardingComplete) {
            router.replace('/auth/register-company')
         } else {
            router.replace(
             returnUrl && returnUrl !== '/auth/google/callback'
                ? returnUrl
                : '/dashboards/analytics'
            )
         }
         return
        }

        // ── Case B: fallback — ?code=xxx Google ne bheja ─────────────────
        const queryString = router.asPath.includes('?')
         ? router.asPath.split('?')[1]
         : ''
        const url = `${BACKEND_BASE_URL}/api/v1/auth/google/callback${queryString ? `?${queryString}` : ''}`

        const res = await fetch(url, { method: 'GET' })
        const json = await res.json()

        if (!res.ok || !json?.success) {
         throw new Error(json?.message || 'Google login failed')
        }

        const token     = json?.data?.token
        const user     = json?.data?.user
        const isOnboardingComplete = json?.data?.onboarding?.isComplete ?? true

        if (!token || !user) {
         throw new Error('Missing token or user in response')
        }

        window.localStorage.setItem(tokenKey, token)
        window.localStorage.setItem('userData', JSON.stringify(user))
        dispatch(setCredentials({ user, token }))

        if (!isOnboardingComplete) {
         router.replace('/auth/register-company')
        } else {
         router.replace(
            returnUrl && returnUrl !== '/auth/google/callback'
             ? returnUrl
             : '/dashboards/analytics'
         )
        }

     } catch (e) {
        setError(e?.message || 'Something went wrong during Google login')
     }
    }

    run()
}, [dispatch, returnUrl, router])

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
GoogleCallbackPage.guestGuard = true

export default GoogleCallbackPage