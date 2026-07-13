// ** Next Import
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

// ** View Import
import PolicyManagement from 'src/views/policy/policyManagement'

// Valid tab slugs — each maps to a separate policy section
const VALID_TABS = ['company', 'leave', 'attendance', 'holiday', 'payroll', 'regularisation']

const PolicyTab = () => {
    const router = useRouter()
    const { tab } = router.query
    const [activeTab, setActiveTab] = useState('company')

    useEffect(() => {
        if (!tab) return

        if (!VALID_TABS.includes(tab)) {
            router.replace('/policy/company')
        } else {
            setActiveTab(tab)
        }
    }, [tab, router])

    // Wait for router to be ready before rendering
    if (!router.isReady) return null

    return <PolicyManagement tab={activeTab} />
}

export default PolicyTab