// src/hooks/useHierarchyContext.js
// A hook that pages can use to know which company/unit context is currently active.
// The unit ID comes from either:
//   1. URL query param ?unit=xxx  (set by sidebar links)
//   2. Redux selected unit (set when user clicks a unit in the tree)
//   3. auth user's own unit_id (for unit_admin / hr_manager)

import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { selectSelectedCompanyId, selectSelectedUnitId, selectSelectedCompany, selectSelectedUnit } from 'src/store/hierarchy/hierarchySlice'
import { selectRoleSlug } from 'src/store/auth/authSlice'

const useHierarchyContext = () => {
  const router              = useRouter()
  const roleSlug            = useSelector(selectRoleSlug)
  const selectedCompanyId   = useSelector(selectSelectedCompanyId)
  const selectedUnitId      = useSelector(selectSelectedUnitId)
  const selectedCompany     = useSelector(selectSelectedCompany)
  const selectedUnit        = useSelector(selectSelectedUnit)

  // URL query params override Redux selection (comes from sidebar link clicks)
  const queryUnitId    = router.query?.unit    || null
  const queryCompanyId = router.query?.company || null

  const activeUnitId    = queryUnitId    || selectedUnitId    || null
  const activeCompanyId = queryCompanyId || selectedCompanyId || null

  return {
    activeUnitId,
    activeCompanyId,
    selectedCompany,
    selectedUnit,
    roleSlug,
    // Convenience: is any context active?
    hasUnitContext:    !!activeUnitId,
    hasCompanyContext: !!activeCompanyId,
  }
}

export default useHierarchyContext
