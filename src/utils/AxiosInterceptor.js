// import axios from 'axios'
// import toast from 'react-hot-toast'
// import authConfig from 'src/configs/auth'

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// const axiosRequest = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     'ngrok-skip-browser-warning': 'true'
//   }
// })

// axiosRequest.interceptors.request.use(
//   config => {
//     config.headers['ngrok-skip-browser-warning'] = 'true'

//     if (typeof window !== 'undefined') {
//       const token = window.localStorage.getItem(
//         authConfig.storageTokenKeyName || 'accessToken'
//       )
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`
//       }
//     }

//     return config
//   },
//   error => Promise.reject(error)
// )

// // ── Guard: prevent firing the redirect more than once ────────────────────────
// let isRedirectingToUpgrade = false

// axiosRequest.interceptors.response.use(
//   response => response.data,
//   error => {
//     const status  = error?.response?.status
//     const data    = error?.response?.data
//     const message = data?.message

//     // ── Show error toast for all API errors ───────────────────────────────────
//     if (message && typeof window !== 'undefined') {
//       toast.error(message)
//     }

//     // ── 401 / token expired ──────────────────────────────────────────────────
//     if (status === 401 || message === 'Token invalid or expired') {
//       if (typeof window !== 'undefined') {
//         const key = authConfig.storageTokenKeyName || 'accessToken'
//         window.localStorage.removeItem('userData')
//         window.localStorage.removeItem(key)
//         window.dispatchEvent(new Event('auth:logout'))
//         window.location.replace('/auth/login')
//       }

//       return Promise.reject(message || 'Session expired')
//     }

//     // ── 403 TRIAL_EXPIRED ────────────────────────────────────────────────────
//     if (status === 403 && data?.code === 'TRIAL_EXPIRED') {
//       if (typeof window !== 'undefined') {
//         // Already mid-redirect — swallow silently
//         if (isRedirectingToUpgrade) return Promise.reject(data)

//         // Already on the pricing page — don't redirect again
//         if (window.location.pathname.startsWith('/pages/pricing')) {
//           return Promise.reject(data)
//         }

//         isRedirectingToUpgrade = true
//         window.location.href =  '/pages/pricing'
//       }

//       return Promise.reject(data)
//     }

//     // ── 403 FEATURE_NOT_IN_PLAN ──────────────────────────────────────────────
//     if (status === 403 && data?.code === 'FEATURE_NOT_IN_PLAN') {
//       if (typeof window !== 'undefined') {
//         toast.error('This feature is not included in your current plan. Contact your admin to upgrade.', {
//           duration: 6000,
//           icon: '⚠️'
//         })
//       }
//       return Promise.reject(data)
//     }

//     return Promise.reject(message || error)
//   }
// )

// export default axiosRequest



// DYANMIC PASS ORG >. COMPANY > UNIT ID IN URL


import axios from 'axios'
import toast from 'react-hot-toast'
import authConfig from 'src/configs/auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const axiosRequest = axios.create({
  baseURL: BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
})

// ── Scope auto-injection ──────────────────────────────────────────────────
// Reads /org/:orgId/company/:companyId/unit/:unitId segments (in any
// combination, any order) from the CURRENT url and appends them as query
// params, so individual thunks/components don't have to manually read the
// route and pass unitId/companyId every time.
//
// Works for both /org/../company/../unit/.. style URLs and one-off patterns
// like /dashboards/analytics/company/:companyId/.
const MONGO_ID = '[a-f0-9]{24}'

const SCOPE_PATTERNS = {
  orgId:     new RegExp(`/org/(${MONGO_ID})`, 'i'),
  companyId: new RegExp(`/company/(${MONGO_ID})`, 'i'),
  unitId:    new RegExp(`/unit/(${MONGO_ID})`, 'i'),
}

const getScopeIdsFromUrl = () => {
  if (typeof window === 'undefined') return {}

  const pathname = window.location.pathname
  const ids = {}

  for (const [key, pattern] of Object.entries(SCOPE_PATTERNS)) {
    const match = pathname.match(pattern)
    if (match) ids[key] = match[1]
  }

  return ids
}

// Don't clobber a value the caller already set — either via axios `params`
// or already baked directly into the request's url query string.
const appendIfAbsent = (config, key, value) => {
  if (!value) return

  if (config.params && config.params[key] !== undefined) return

  if (config.url && new RegExp(`[?&]${key}=`, 'i').test(config.url)) return

  config.params = { ...(config.params || {}), [key]: value }
}

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

      // Auto-scope every request to the org/company/unit currently in the URL,
      // unless the caller already explicitly specified one.
      const { orgId, companyId, unitId } = getScopeIdsFromUrl()
      // appendIfAbsent(config, 'orgId', orgId)
      // appendIfAbsent(config, 'companyId', companyId)
      appendIfAbsent(config, 'unit_id', unitId)
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

    // ── Show error toast for all API errors ───────────────────────────────────
    if (message && typeof window !== 'undefined') {
      toast.error(message)
    }

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

    // ── 403 FEATURE_NOT_IN_PLAN ──────────────────────────────────────────────
    if (status === 403 && data?.code === 'FEATURE_NOT_IN_PLAN') {
      if (typeof window !== 'undefined') {
        toast.error('This feature is not included in your current plan. Contact your admin to upgrade.', {
          duration: 6000,
          icon: '⚠️'
        })
      }
      return Promise.reject(data)
    }

    return Promise.reject(message || error)
  }
)

export default axiosRequest