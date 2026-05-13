// src/context/AuthContext.jsx

import { createContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'

// NOTE: Login uses plain axios (no token needed yet).
// All other API calls use axiosInstance (auto-attaches token).
import axios from 'axios'

import {
  setCredentials,
  clearCredentials,
  setLoading,
  setError,
  rehydrateAuth,
  selectUser,
  selectToken,
  selectIsAuthenticated
} from 'src/store/auth/authSlice'

import authConfig from 'src/configs/auth'
import axiosRequest from 'src/utils/AxiosInterceptor'

const BACKEND_BASE_URL = 'https://s0380lsz-3000.inc1.devtunnels.ms'

// ─── Storage Keys ─────────────────────────────
const STORAGE = {
  TOKEN:     authConfig.storageTokenKeyName, // 'accessToken'
  USER:      'userData',
  MFA_TOKEN: 'mfaToken'
}

// ─── Context Defaults ─────────────────────────
const defaultProvider = {
  user:            null,
  token:           null,
  loading:         true,
  isAuthenticated: false,
  login:           () => Promise.resolve(),
  logout:          () => Promise.resolve(),
  verifyMfa:       () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

// ─── Provider ─────────────────────────────────
const AuthProvider = ({ children }) => {
  const [loading, setLoadingState] = useState(true)

  const router   = useRouter()
  const dispatch = useDispatch()

  const user            = useSelector(selectUser)
  const token           = useSelector(selectToken)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // ── On app init: re-hydrate Redux from localStorage ───────
  useEffect(() => {
    const initAuth = () => {
      const storedToken = window.localStorage.getItem(STORAGE.TOKEN)
      const storedUser  = window.localStorage.getItem(STORAGE.USER)

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          dispatch(rehydrateAuth({ user: parsedUser, token: storedToken }))
        } catch {
          _clearStorage()
        }
      }

      setLoadingState(false)
    }

    initAuth()

    // Listen for 401 logout event fired by AxiosInterceptor
    const handleForceLogout = () => {
      dispatch(clearCredentials())
    }

    window.addEventListener('auth:logout', handleForceLogout)

    return () => {
      window.removeEventListener('auth:logout', handleForceLogout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Login ─────────────────────────────────────────────────
  const handleLogin = async (params, errorCallback) => {
    dispatch(setLoading(true))

    try {
      const { data } = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/auth/login`,
        { email: params.email, password: params.password },
        { headers: { 'Content-Type': 'application/json' } }
      )

      const { token, mfaToken, user } = data?.data ?? data

      // ── MFA required ──────────────────────────────────────
      if (mfaToken) {
        window.localStorage.setItem(STORAGE.MFA_TOKEN, mfaToken)
        router.push('/auth/two-factor')
        return
      }

      // ── Normal login (no MFA) ─────────────────────────────
      _persistSession({ token, user, rememberMe: params.rememberMe })
      dispatch(setCredentials({ user, token }))

      const returnUrl   = router.query.returnUrl
      const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/dashboards/analytics'
      router.replace(redirectURL)

    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please check your credentials.'

      dispatch(setError(message))
      if (errorCallback) errorCallback(message)
    }
  }

  // ── Verify MFA (called from two-factor page) ──────────────
  const handleVerifyMfa = async (otpToken, errorCallback) => {
    const mfaToken = window.localStorage.getItem(STORAGE.MFA_TOKEN)

    if (!mfaToken) {
      const msg = 'Session expired. Please login again.'
      if (errorCallback) errorCallback(msg)
      router.push('/auth/login')
      return
    }

    dispatch(setLoading(true))

    try {
      const { data } = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/auth/mfa/challenge`,
        { mfaToken, token: otpToken },
        { headers: { 'Content-Type': 'application/json' } }
      )

      const { token } = data?.data ?? data

      // Fetch full user profile with the real token
      const meRes = await axios.get(`${BACKEND_BASE_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const user = meRes.data?.data?.user || meRes.data?.user || meRes.data?.data

      // Clean up mfaToken — no longer needed
      window.localStorage.removeItem(STORAGE.MFA_TOKEN)

      // Persist & set Redux (default rememberMe: true after MFA)
      _persistSession({ token, user, rememberMe: true })
      dispatch(setCredentials({ user, token }))

      router.replace('/dashboards/analytics')

    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Invalid code. Please try again.'

      dispatch(setError(message))
      if (errorCallback) errorCallback(message)
    }
  }

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    dispatch(clearCredentials())
    _clearStorage()
    router.push('/auth/login')
  }

  // ── Helpers ───────────────────────────────────────────────
  const _persistSession = ({ token, user, rememberMe }) => {
    if (rememberMe) {
      window.localStorage.setItem(STORAGE.TOKEN, token)
      window.localStorage.setItem(STORAGE.USER, JSON.stringify(user))
    } else {
      window.sessionStorage.setItem(STORAGE.TOKEN, token)
      window.sessionStorage.setItem(STORAGE.USER, JSON.stringify(user))
    }
  }

  const _clearStorage = () => {
    window.localStorage.removeItem(STORAGE.TOKEN)
    window.localStorage.removeItem(STORAGE.USER)
    window.localStorage.removeItem(STORAGE.MFA_TOKEN)
    window.sessionStorage.removeItem(STORAGE.TOKEN)
    window.sessionStorage.removeItem(STORAGE.USER)
  }

  // ── Context Value ─────────────────────────────────────────
  const values = {
    user,
    token,
    isAuthenticated,
    loading,
    login:      handleLogin,
    logout:     handleLogout,
    verifyMfa:  handleVerifyMfa,

    // Legacy compat
    setUser:    () => {},
    setLoading: setLoadingState
  }

  return (
    <AuthContext.Provider value={values}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }