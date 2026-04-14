// ** React Imports
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const CompanyDetailsRedirect = () => {
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (id) {
      router.replace(`/company/${id}/details/account`)
    }
  }, [id, router])

  return null
}

export default CompanyDetailsRedirect
