// ** React Imports
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const UserDetailsRedirect = () => {
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (id) {
      router.replace(`/users/${id}/details/account`)
    }
  }, [id, router])

  return null
}

export default UserDetailsRedirect
