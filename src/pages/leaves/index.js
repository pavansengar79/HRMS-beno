import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import LeaveManagement from 'src/views/leavemanagement/leaveManagement'

const VALID_TABS = [ 'types','initialize','requests', 'approval', 'balance',]

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
  }, [tab, router])

  if (!router.isReady) return null

  return <LeaveManagement tab={activeTab} />
}

export default LeaveTab