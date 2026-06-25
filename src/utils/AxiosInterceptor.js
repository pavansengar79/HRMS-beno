import axios from 'axios'
import authConfig from 'src/configs/auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const axiosRequest = axios.create({
  baseURL: BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
})

axiosRequest.interceptors.request.use(
  config => {
    config.headers['ngrok-skip-browser-warning'] = 'true'

    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem(
        authConfig.storageTokenKeyName || 'accessToken'
      )
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  error => Promise.reject(error)
)

// ── Guard: prevent firing the redirect more than once ────────────────────────
let isRedirectingToUpgrade = false

axiosRequest.interceptors.response.use(
  response => response.data,
  error => {
    const status  = error?.response?.status
    const data    = error?.response?.data
    const message = data?.message

    // ── 401 / token expired ──────────────────────────────────────────────────
    if (status === 401 || message === 'Token invalid or expired') {
      if (typeof window !== 'undefined') {
        const key = authConfig.storageTokenKeyName || 'accessToken'
        window.localStorage.removeItem('userData')
        window.localStorage.removeItem(key)
        window.dispatchEvent(new Event('auth:logout'))
        window.location.replace('/auth/login')
      }

      return Promise.reject(message || 'Session expired')
    }

    // ── 403 TRIAL_EXPIRED ────────────────────────────────────────────────────
    if (status === 403 && data?.code === 'TRIAL_EXPIRED') {
      if (typeof window !== 'undefined') {
        // Already mid-redirect — swallow silently
        if (isRedirectingToUpgrade) return Promise.reject(data)

        // Already on the pricing page — don't redirect again
        if (window.location.pathname.startsWith('/pages/pricing')) {
          return Promise.reject(data)
        }

        isRedirectingToUpgrade = true
        window.location.href =  '/pages/pricing'
      }

      return Promise.reject(data)
    }

    return Promise.reject(message || error)
  }
)

export default axiosRequest