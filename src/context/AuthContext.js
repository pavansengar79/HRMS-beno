import { createContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { setCredentials, clearCredentials, setLoading, setError, rehydrateAuth, selectUser, selectToken, selectIsAuthenticated } from 'src/store/auth/authSlice'
import authConfig from 'src/configs/auth'
import axiosRequest from 'src/utils/AxiosInterceptor'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const STORAGE  = { TOKEN: authConfig.storageTokenKeyName, USER: 'userData', MFA_TOKEN: 'mfaToken' }

const defaultProvider = {
  user: null, token: null, loading: true, isAuthenticated: false,
  login: () => Promise.resolve(), logout: () => Promise.resolve(), verifyMfa: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  const [loading, setLoadingState] = useState(true)
  const router   = useRouter()
  const dispatch = useDispatch()
  const user            = useSelector(selectUser)
  const token           = useSelector(selectToken)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  useEffect(() => {
    const initAuth = () => {
      const storedToken = window.localStorage.getItem(STORAGE.TOKEN)
      const storedUser  = window.localStorage.getItem(STORAGE.USER)
      if (storedToken && storedUser) {
        try { dispatch(rehydrateAuth({ user: JSON.parse(storedUser), token: storedToken })) }
        catch { _clear() }
      }
      setLoadingState(false)
    }
    initAuth()
    const onLogout = () => { dispatch(clearCredentials()); _clear(); router.push('/auth/login') }
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  const _clear = () => {
    window.localStorage.removeItem(STORAGE.TOKEN)
    window.localStorage.removeItem(STORAGE.USER)
    window.localStorage.removeItem(STORAGE.MFA_TOKEN)
  }

  const login = async ({ email, password }, errorCallback) => {
    try {
      dispatch(setLoading(true))
      const res = await axios.post(`${BASE_URL}/api/v1/auth/login`, { email, password })
      const { token, user, subscription, is_first_login, mfaRequired, mfaToken } = res.data?.data || {}

      if (mfaRequired && mfaToken) {
        window.localStorage.setItem(STORAGE.MFA_TOKEN, mfaToken)
        router.push('/auth/two-factor')
        return
      }

      window.localStorage.setItem(STORAGE.TOKEN, token)
      const userToStore = { ...user, subscription }
      window.localStorage.setItem(STORAGE.USER, JSON.stringify(userToStore))
      dispatch(setCredentials({ user: userToStore, token, subscription }))

      if (is_first_login) router.push('/auth/set-password')
      else router.push('/')
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || 'Login failed'))
      if (errorCallback) errorCallback(err?.response?.data?.message || 'Invalid credentials')
    } finally { dispatch(setLoading(false)) }
  }

  const logout = () => { dispatch(clearCredentials()); _clear(); router.push('/auth/login') }

  const verifyMfa = async ({ token: code }, errorCallback) => {
    try {
      const mfaToken = window.localStorage.getItem(STORAGE.MFA_TOKEN)
      const res = await axiosRequest.post('/api/v1/auth/mfa/verify-login', { token: code, mfaToken })
      const { token, user, subscription } = res.data || {}
      window.localStorage.setItem(STORAGE.TOKEN, token)
      window.localStorage.removeItem(STORAGE.MFA_TOKEN)
      const userToStore = { ...user, subscription }
      window.localStorage.setItem(STORAGE.USER, JSON.stringify(userToStore))
      dispatch(setCredentials({ user: userToStore, token, subscription }))
      router.push('/')
    } catch (err) { if (errorCallback) errorCallback(err?.response?.data?.message || 'MFA failed') }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout, verifyMfa }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
