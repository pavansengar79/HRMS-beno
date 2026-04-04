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

// ─── Storage Keys ─────────────────────────────
const STORAGE = {
  TOKEN: authConfig.storageTokenKeyName,  // 'accessToken'
  USER:  'userData'
}

// ─── Context Defaults ─────────────────────────
const defaultProvider = {
  user:            null,
  token:           null,
  loading:         true,
  isAuthenticated: false,
  login:           () => Promise.resolve(),
  logout:          () => Promise.resolve()
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
          // Corrupted data → clear and force re-login
          _clearStorage()
        }
      }

      setLoadingState(false)
    }

    initAuth()

    // ── Listen for 401 logout event fired by AxiosInterceptor ──
    // AxiosInterceptor cannot import store directly (causes SSR crash),
    // so it fires window event 'auth:logout' and AuthContext clears Redux here.
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
        `https://2c6q0jsk-3000.inc1.devtunnels.ms/api/v1/auth/login`,
        { email: params.email, password: params.password },
        { headers: { 'Content-Type': 'application/json' } }
      )

      const { token, user } = data.data

      // 1. Redux (source of truth)
      dispatch(setCredentials({ user, token }))

      // 2. Persist to localStorage so Redux can re-hydrate on refresh
      //    Store the FULL user object (including role + permissions)
      //    so re-hydration rebuilds permission state correctly
      if (params.rememberMe) {
        window.localStorage.setItem(STORAGE.TOKEN, token)
        window.localStorage.setItem(STORAGE.USER, JSON.stringify(user))
      } else {
        // Session only — cleared when browser tab closes
        window.sessionStorage.setItem(STORAGE.TOKEN, token)
        window.sessionStorage.setItem(STORAGE.USER, JSON.stringify(user))
      }

      // 3. Redirect
      const returnUrl    = router.query.returnUrl
      const redirectURL  = returnUrl && returnUrl !== '/' ? returnUrl : '/dashboards/analytics'
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

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    dispatch(clearCredentials())
    _clearStorage()
    router.push('/auth/login')
  }

  // ── Clear both storages ───────────────────────────────────
  const _clearStorage = () => {
    window.localStorage.removeItem(STORAGE.TOKEN)
    window.localStorage.removeItem(STORAGE.USER)
    window.sessionStorage.removeItem(STORAGE.TOKEN)
    window.sessionStorage.removeItem(STORAGE.USER)
  }

  // ── Context Value ─────────────────────────────────────────
  const values = {
    user,
    token,
    isAuthenticated,
    loading,
    login:   handleLogin,
    logout:  handleLogout,

    // Legacy compat for components using setUser/setLoading from context
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