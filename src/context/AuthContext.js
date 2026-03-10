// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}
const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      if (storedToken) {
        setLoading(true)
        // Bypassed API call for now
        // await axios
        //   .get(authConfig.meEndpoint, {
        //     headers: {
        //       Authorization: storedToken
        //     }
        //   })
        //   .then(async response => {
        //     setLoading(false)
        //     setUser({ ...response.data.userData })
        //   })
        //   .catch(() => {
        //     localStorage.removeItem('userData')
        //     localStorage.removeItem('refreshToken')
        //     localStorage.removeItem('accessToken')
        //     setUser(null)
        //     setLoading(false)
        //     if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
        //       router.replace('/login')
        //     }
        //   })
        // Instead, set from localStorage
        const storedUser = window.localStorage.getItem('userData')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
        setLoading(false)
      } else {
        setLoading(false)
      }
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = async (params, errorCallback) => {
    console.log('log', params)

    // Hardcoded credentials for bypassing login
    const hardcodedEmail = 'admin@admin.com'
    const hardcodedPassword = 'admin'

    if (params.email === hardcodedEmail && params.password === hardcodedPassword) {
      // Simulate successful login
      let role = 'EMPLOYEE' // default
      if (params.email === 'admin@admin.com') role = 'ADMIN'
      else if (params.email === 'manager@admin.com') role = 'MANAGER'
      else if (params.email === 'hr@admin.com') role = 'HR'
      const mockUser = {
        id: 1,
        email: params.email,
        name: `${role} User`,
        role: role
      }
      params.rememberMe ? window.localStorage.setItem(authConfig.storageTokenKeyName, 'mock-token') : null
      const returnUrl = router.query.returnUrl
      setUser({ ...mockUser })
      params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(mockUser)) : null
      const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/dashboards/analytics'
      console.log('redirect', redirectURL)
      router.replace(redirectURL)
      return
    } else {
      // If not hardcoded, call error callback
      if (errorCallback) errorCallback(new Error('Invalid credentials'))
      return
    }

    // Commented out API call for now
    // let data = {
    //   email: params.email,
    //   password: params.password
    // }
    // try {
    //   const res = await axiosRequest({
    //     url: 'api/admindash/admin/login',
    //     method: 'POST',
    //     data: data
    //   })
    //   console.log('loginres', res)
    //   params.rememberMe ? window.localStorage.setItem(authConfig.storageTokenKeyName, res.token) : null
    //   const returnUrl = router.query.returnUrl
    //   setUser({ ...res.admin })
    //   params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(res.admin)) : null
    //   const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/apps/home/'
    //   console.log('redirect', redirectURL)
    //   router.replace(redirectURL)
    // } catch (error) {
    //   console.log(error)
    //   if (errorCallback) errorCallback(error)
    // }

    // axios
    //   .post(authConfig.loginEndpoint, params)
    //   .then(async response => {
    //     params.rememberMe
    //       ? window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)
    //       : null
    //     const returnUrl = router.query.returnUrl
    //     setUser({ ...response.data.userData })
    //     params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(response.data.userData)) : null
    //     const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
    //     router.replace(redirectURL)
    //   })
    //   .catch(err => {
    //     if (errorCallback) errorCallback(err)
    //   })
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
