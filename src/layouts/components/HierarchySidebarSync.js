// src/layouts/components/HierarchySidebarSync.js
// Syncs selectedCompany / selectedUnit Redux state from URL changes.
// The sidebar itself is NOW route-driven (reads router.query directly),
// so this component only needs to set the Redux sticky-context for
// pages that carry no URL params (e.g. /admin/access-control while
// the user is scoped to a company/unit — the context should persist).

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import {
  setSelectedUnit,
  setSelectedCompany,
  clearHierarchySelection,
  selectAllHierarchyUnits,
  selectAllHierarchyCompanies,
} from 'src/store/hierarchy/hierarchySlice'

// Top-level list pages — clear any scoped context when landing here.
// IMPORTANT: exact matches only — /company/[id]/... must NOT clear context.
const CONTEXT_RESET_PATHS = ['/company', '/admin-users', '/organisation']

const HierarchySidebarSync = () => {
  const router    = useRouter()
  const dispatch  = useDispatch()
  const units     = useSelector(selectAllHierarchyUnits)
  const companies = useSelector(selectAllHierarchyCompanies)

  useEffect(() => {
    const {
      id:        routeId,
      unit:      unitQueryParam,
      company:   companyQueryParam,
      unitId:    pathUnitId,
      companyId: pathCompanyId,
    } = router.query || {}

    const pathname = router.pathname || ''

    if (pathUnitId && pathCompanyId) {
      // Path-based unit route: /dashboards/analytics/company/[companyId]/unit/[unitId]
      dispatch(setSelectedUnit({ companyId: pathCompanyId, unitId: pathUnitId }))
    } else if (pathCompanyId) {
      // Path-based company route: /dashboards/analytics/company/[companyId]
      dispatch(setSelectedCompany(pathCompanyId))
    } else if (pathname === '/dashboards/analytics' && !companyQueryParam && !unitQueryParam) {
      // Org-level dashboard — user is at the top, clear any scoped context.
      // This fires when the "← All Companies" back button is used.
      dispatch(clearHierarchySelection())
    } else if (pathname.startsWith('/company/[id]') && routeId) {
      // Company detail route: /company/[id]/[details]/[tab]
      dispatch(setSelectedCompany(routeId))
    } else if (unitQueryParam && units.length > 0) {
      // Flat route with unit query: /department?unit=xxx
      const unit = units.find(u => u._id === unitQueryParam)
      if (unit) {
        const cId = unit.company_id || unit.company?._id || unit.company
        dispatch(setSelectedUnit({ companyId: cId, unitId: unitQueryParam }))
      }
    } else if (companyQueryParam && companies.length > 0) {
      // Company-scoped page: /holidays?company=xxx
      dispatch(setSelectedCompany(companyQueryParam))
    } else if (CONTEXT_RESET_PATHS.includes(pathname)) {
      // Top-level list pages — reset so sidebar shows full org view
      dispatch(clearHierarchySelection())
    }
    // All other pages: keep current context (sticky — e.g. /admin/access-control
    // while user is scoped to a company keeps showing company-scoped sidebar)
  }, [router.query, router.pathname, units, companies, dispatch])

  return null
}

export default HierarchySidebarSync

