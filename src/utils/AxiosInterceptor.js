import axios from 'axios'
import authConfig from 'src/configs/auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const axiosRequest = axios.create({ baseURL: BASE_URL })

axiosRequest.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem(authConfig.storageTokenKeyName || 'accessToken')
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

axiosRequest.interceptors.response.use(
  response => response.data,
  error => {
    const status  = error?.response?.status
    const message = error?.response?.data?.message
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
    if (status === 403) return Promise.reject(message || 'Permission denied')
    return Promise.reject(message || error)
  }
)

export default axiosRequest
