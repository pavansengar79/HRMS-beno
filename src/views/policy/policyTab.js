// src/views/policy/policyTab.js
//
// Wrapper for hierarchical route (/org/[orgId]/company/[companyId]/unit/[unitId]/policy)
// Uses shallow routing to preserve org/company/unit params when switching tabs.
//
// URL stays: /org/:orgId/company/:companyId/unit/:unitId/policy?tab=leave
// Instead of collapsing to: /policy/leave

import { useRouter } from 'next/router'
import PolicyManagement from 'src/views/policy/policyManagement'

const PolicyTab = () => {
  const router = useRouter()
  const { tab } = router.query

  const handleTabChange = value => {
    router.push(
      { pathname: router.pathname, query: { ...router.query, tab: value } },
      undefined,
      { shallow: true }
    )
  }

  return <PolicyManagement tab={tab || 'company'} onTabChange={handleTabChange} />
}

export default PolicyTab