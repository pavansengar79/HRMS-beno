import axios from 'axios'
import authConfig from 'src/configs/auth'
import { useAuth } from 'src/hooks/useAuth'

const axiosRequest = axios.create({
  // baseURL: 'https://dev-connect-api.jktyre.co.in'
  baseURL: 'https://prod-connect-api.jktyre.co.in'

  // baseURL: 'https://8pl8ttwr-5000.inc1.devtunnels.ms/'
  // baseURL: 'http://localhost:5000'
})

axiosRequest.interceptors.response.use(
  response => {
    console.log('Response=======>', response)

    return response.data
  },
  error => {
    console.log('Error=======>', error.response)
    if (error?.response) {
      if (error.response?.status === 401 || error.response?.data?.message === 'Token invalid or expired') {
        window.localStorage.removeItem('userData')
        window.localStorage.removeItem(authConfig.storageTokenKeyName)
        // window.location.replace('/login')
      } else {
        console.log('===>', error?.response?.data?.message)

        return new Promise((resolve, reject) => {
          reject(error?.response?.data?.message)
        })
      }
    }

    return Promise.reject(error)
  }
)

axiosRequest.interceptors.request.use(
  async config => {
    const token = await window.localStorage.getItem(
      authConfig.storageTokenKeyName,
      window.localStorage.getItem(authConfig.storageTokenKeyName)
    )

    console.log('Token Interceptor', token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },

  error => {
    return Promise.reject(error)
  }
)

export default axiosRequest
