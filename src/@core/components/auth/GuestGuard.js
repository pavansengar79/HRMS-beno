// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useAuth } from 'src/hooks/useAuth'

const GuestGuard = props => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!router.isReady || auth.loading) {
      return
    }
    if (auth.isAuthenticated) {
      router.replace('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.route, auth.loading, auth.isAuthenticated])
  if (auth.loading || auth.isAuthenticated) {
    return fallback
  }

  return <>{children}</>
}

export default GuestGuard
