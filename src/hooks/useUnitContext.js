// src/hooks/useUnitContext.js
// Returns the active { orgId, companyId, unitId, company, unit }.
//
// Resolution order:
//  1. Dynamic hierarchical route  → router.query (orgId, companyId, unitId all present)
//  2. unit_admin / hr_manager     → JWT-scoped fields on auth.user (unit / company inferred from profile)
//  3. Flat route with Redux ctx   → hierarchy.selectedCompanyId / selectedUnitId

import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { selectRoleSlug, selectUser, selectOrgId } from 'src/store/auth/authSlice'
import {
  selectAllHierarchyCompanies,
  selectAllHierarchyUnits,
  selectSelectedCompanyId,
  selectSelectedUnitId,
} from 'src/store/hierarchy/hierarchySlice'

const useUnitContext = () => {
  const router = useRouter()
  const roleSlug       = useSelector(selectRoleSlug)
  const user           = useSelector(selectUser)
  const authOrgId      = useSelector(selectOrgId)
  const companies      = useSelector(selectAllHierarchyCompanies)
  const units          = useSelector(selectAllHierarchyUnits)
  const reduxCompanyId = useSelector(selectSelectedCompanyId)
  const reduxUnitId    = useSelector(selectSelectedUnitId)

  const {
    orgId:     qOrgId,
    companyId: qCompanyId,
    unitId:    qUnitId,
  } = router.query || {}

  let orgId, companyId, unitId

  if (qOrgId && qCompanyId && qUnitId) {
    // ── Dynamic hierarchical route (/org/[orgId]/company/[companyId]/unit/[unitId]/[module])
    orgId     = qOrgId
    companyId = qCompanyId
    unitId    = qUnitId
  } else if (roleSlug === 'unit_admin' || roleSlug === 'hr_manager') {
    // ── JWT-scoped single-unit user — read from their profile
    unitId    = user?.unit_id     || user?.unit?._id     || null
    companyId = user?.company_id  || user?.company?._id  || null
    orgId     = authOrgId
  } else {
    // ── Flat route; use whatever is selected in the hierarchy Redux slice
    orgId     = authOrgId
    companyId = reduxCompanyId
    unitId    = reduxUnitId
  }

  const company = companyId ? (companies.find(c => c._id === companyId) || null) : null
  const unit    = unitId    ? (units.find(u => u._id === unitId)         || null) : null

  return { orgId, companyId, unitId, company, unit }
}

export default useUnitContext
