// src/pages/dashboards/analytics/company/[companyId].js
//
// Route: /dashboards/analytics/company/:companyId
// Breadcrumb: Dashboard → Company
//
// At this route EVERYONE sees the company-level dashboard regardless of role.
// The org_admin arrives here by clicking a company — they should see
// CompanyDashboard, NOT OrganisationDashboard.

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedCompany } from 'src/store/hierarchy/hierarchySlice'
import { selectRoleSlug } from 'src/store/auth/authSlice'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import CompanyDashboard from '../companyAdminDashboard'

// Every role that reaches /dashboards/analytics/company/[id] sees company-scoped data.
const DASH_MAP = {
  org_admin:          CompanyDashboard,
  org_head:           CompanyDashboard,
  org_auditor:        CompanyDashboard,
  company_admin:      CompanyDashboard,
  company_hr_manager: CompanyDashboard,
}

const CompanyDashboardPage = () => {
  const router     = useRouter()
  const dispatch   = useDispatch()
  const roleSlug   = useSelector(selectRoleSlug)
  const { companyId } = router.query

  // Stamp the Redux context so sidebar and sticky-context pages stay in company scope
  useEffect(() => {
    if (companyId) dispatch(setSelectedCompany(companyId))
    return () => { /* keep context sticky — don't clear on unmount */ }
  }, [companyId, dispatch])

  if (!router.isReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const Dashboard = DASH_MAP[roleSlug] || CompanyDashboard
  return <Dashboard companyId={companyId} />
}

// Allow all authenticated roles that may reach company level
CompanyDashboardPage.acl = { action: 'read', subject: 'dashboard' }

export default CompanyDashboardPage
