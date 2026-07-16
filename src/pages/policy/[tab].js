// src/views/policy/HierarchicalPolicyPage.js
//
// Used ONLY by the catch-all hierarchical route
// (/org/[orgId]/company/[companyId]/unit/[unitId]/[module].js) when
// module === 'policy'.
//
// The flat `src/pages/policy/index.js` + `[tab].js` pages hardcode
// `router.push('/policy/...')` for tab switching, which — when reused
// inside the hierarchical route — was wiping out the org/company/unit
// segments from the URL entirely (real Next.js navigation, not just a
// param).
//
// This wrapper keeps tab state as a `?tab=` query param appended to the
// SAME hierarchical pathname via shallow routing, so the URL stays
// `/org/:orgId/company/:companyId/unit/:unitId/policy?tab=leave` instead
// of collapsing to `/policy/leave`.

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