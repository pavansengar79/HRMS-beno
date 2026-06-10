// src/pages/dashboards/analytics/company/[companyId]/unit/[unitId].js
//
// Route: /dashboards/analytics/company/:companyId/unit/:unitId
// Breadcrumb: Dashboard / Company / Unit
//
// Renders the unit-level dashboard.
// Dispatches setSelectedUnit so the sidebar transforms to Level 3.
// Role routing:
//   org_admin / org_head / company_admin / company_hr_manager → UnitDashboard
//   unit_admin / hr_manager / manager                         → UnitDashboard

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedUnit } from 'src/store/hierarchy/hierarchySlice'
import { selectRoleSlug } from 'src/store/auth/authSlice'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import UnitDashboard from '../../../unitDashboard'
import HRDashboard   from '../../../hrDashboard'

const DASH_MAP = {
  unit_admin:         UnitDashboard,
  hr_manager:         HRDashboard,
  manager:            HRDashboard,
  org_admin:          UnitDashboard,
  org_head:           UnitDashboard,
  company_admin:      UnitDashboard,
  company_hr_manager: UnitDashboard,
}

const UnitDashboardPage = () => {
  const router     = useRouter()
  const dispatch   = useDispatch()
  const roleSlug   = useSelector(selectRoleSlug)
  const { companyId, unitId } = router.query

  // Stamp Redux context — sidebar and sticky-context pages stay in unit scope
  useEffect(() => {
    if (companyId && unitId) {
      dispatch(setSelectedUnit({ companyId, unitId }))
    }
    return () => { /* keep context sticky */ }
  }, [companyId, unitId, dispatch])

  if (!router.isReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const Dashboard = DASH_MAP[roleSlug] || UnitDashboard
  return <Dashboard companyId={companyId} unitId={unitId} />
}

UnitDashboardPage.acl = { action: 'read', subject: 'dashboard' }

export default UnitDashboardPage
