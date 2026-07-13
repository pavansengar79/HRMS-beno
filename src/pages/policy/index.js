// ** Next Import
import { useEffect } from 'react'
import { useRouter } from 'next/router'

// Redirect /policies → /policies/company
const PoliciesIndex = () => {
    const router = useRouter()

    useEffect(() => {
        router.replace('/policy/company')
    }, [router])

    return null
}

export default PoliciesIndex