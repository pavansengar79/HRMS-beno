// src/utils/AxiosInterceptor.js
// SSR-safe: No direct store import at module level.
// Token is read from localStorage (client-only).
// Redux is cleared via a custom event that AuthContext listens to.

import axios from 'axios'
import authConfig from 'src/configs/auth'

const axiosRequest = axios.create({
  baseURL: 'https://2c6q0jsk-3000.inc1.devtunnels.ms/'
  // baseURL: 'https://prod-connect-api.jktyre.co.in'
  // baseURL: 'http://localhost:3000'
})

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Reads the token from localStorage on every request.
// authConfig.storageTokenKeyName is the primary key (e.g. "accessToken").
// Falls back to the literal string 'accessToken' if the config key is missing.
// ─────────────────────────────────────────────────────────────────────────────
axiosRequest.interceptors.request.use(
  config => {
    // localStorage is only available on client — safe here because
    // actual API requests are never made during SSR
    if (typeof window !== 'undefined') {
      // Use authConfig key first, fall back to 'accessToken'
      const tokenKey = authConfig.storageTokenKeyName || 'accessToken'
      const token    = window.localStorage.getItem(tokenKey)
console.log('AxiosInterceptor: Attaching token from localStorage  →', token)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  error => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Unwraps response.data so callers receive the API payload directly.
// Handles 401 (expired / invalid token) with full logout + redirect.
// ─────────────────────────────────────────────────────────────────────────────
axiosRequest.interceptors.response.use(
  response => {
    // Return response.data directly — callers get { success, data, message }
    // without needing to do response.data themselves
    return response.data
  },
  error => {
    const status  = error?.response?.status
    const message = error?.response?.data?.message

    if (status === 401 || message === 'Token invalid or expired') {
      if (typeof window !== 'undefined') {
        const tokenKey = authConfig.storageTokenKeyName || 'accessToken'

        // 1. Clear all auth-related storage
        window.localStorage.removeItem('userData')
        window.localStorage.removeItem(tokenKey)
        window.sessionStorage.removeItem('userData')
        window.sessionStorage.removeItem(tokenKey)

        // 2. Fire a custom event — AuthContext listens to this and
        //    dispatches clearCredentials() to Redux from inside React tree
        //    (avoids importing store directly at module level → fixes SSR crash)
        window.dispatchEvent(new Event('auth:logout'))

        // 3. Redirect to login
        window.location.replace('/auth/login')
      }

      return Promise.reject(message || 'Session expired. Please login again.')
    }

    // 403 — forbidden, reject but don't logout
    if (status === 403) {
      return Promise.reject(message || 'You do not have permission to perform this action.')
    }

    // All other errors — reject with the API message or raw error
    return Promise.reject(message || error)
  }
)

export default axiosRequest