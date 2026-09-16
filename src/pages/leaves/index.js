import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import LeaveManagement from 'src/views/leavemanagement/leaveManagement'

const VALID_TABS = [ 'types','initialize','requests', 'approval', 'balance',]

const getRequestsPath = query => {
  const { orgId, companyId, unitId } = query

  return orgId && companyId && unitId
    ? `/org/${orgId}/company/${companyId}/unit/${unitId}/leaves?tab=requests`
    : '/leaves/requests'
}

const LeaveTab = () => {
  const router = useRouter()
  const { tab } = router.query
  const [activeTab, setActiveTab] = useState('requests')

  useEffect(() => {
    if (!tab) return
    if (!VALID_TABS.includes(tab)) {
      router.replace(getRequestsPath(router.query))
    } else {
      setActiveTab(tab)
    }
  }, [tab, router])

  if (!router.isReady) return null

  return <LeaveManagement tab={activeTab} />
}

export default LeaveTab