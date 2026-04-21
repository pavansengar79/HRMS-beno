// ** Next Import
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import LeaveManagement from 'src/views/leavemanagement/leaveManagement'

// ** Leave Management Main Component

const VALID_TABS = ['policy', 'requests', 'approval', 'types', 'category', 'balance', 'apply']

const LeaveTab = () => {
  const router = useRouter()
  const { tab } = router.query
  const [activeTab, setActiveTab] = useState('requests')

  useEffect(() => {
    if (!tab) return

    if (!VALID_TABS.includes(tab)) {
      router.replace('/leaves/requests')
    } else {
      setActiveTab(tab)
    }
  }, [tab])

  // Wait for router to be ready
  if (!router.isReady) return null

  return <LeaveManagement tab={activeTab} />
}

export default LeaveTab

