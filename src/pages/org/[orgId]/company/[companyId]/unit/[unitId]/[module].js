// src/pages/org/[orgId]/company/[companyId]/unit/[unitId]/[module].js
//
// Catch-all dynamic route for unit-scoped HRMS modules.
// URL pattern: /org/:orgId/company/:companyId/unit/:unitId/:module
//
// On mount, stores { companyId, unitId } in the hierarchy Redux slice so that
// - breadcrumbs (AppBarContent) can resolve company/unit names
// - useUnitContext() in any child component returns the correct context
//
// The existing flat page components (src/pages/department, etc.) are reused
// as-is; no page logic is duplicated here.

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import { setSelectedUnit } from 'src/store/hierarchy/hierarchySlice'

// ─── lazy-load each module's page component ──────────────────────────────────
// Using dynamic() so only the requested module's bundle is loaded.
const DepartmentPage  = dynamic(() => import('src/pages/department'),  { loading: () => <Loader /> })
const DesignationPage = dynamic(() => import('src/pages/designation'), { loading: () => <Loader /> })
const EmployeesPage   = dynamic(() => import('src/pages/users'),       { loading: () => <Loader /> })
const AttendancePage  = dynamic(() => import('src/pages/attendance'),  { loading: () => <Loader /> })
const LeavesPage      = dynamic(() => import('src/pages/leaves'),      { loading: () => <Loader /> })
const PayrollPage     = dynamic(() => import('src/pages/payroll'),     { loading: () => <Loader /> })
const PolicyPage = dynamic(() => import('src/views/policy/policyTab'), { loading: () => <Loader /> })
const HolidaysPage    = dynamic(() => import('src/pages/holidays'),    { loading: () => <Loader /> })

const MODULE_MAP = {
  department:  DepartmentPage,
  designation: DesignationPage,
  employees:   EmployeesPage,
  users:       EmployeesPage, // alias for employees
  attendance:  AttendancePage,
  leaves:      LeavesPage,
  payroll:     PayrollPage,
  policy:      PolicyPage,
  holidays:    HolidaysPage,
}

// ─── small loading fallback ───────────────────────────────────────────────────
const Loader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress />
  </Box>
)

// ─── main page ────────────────────────────────────────────────────────────────
const UnitModulePage = () => {
  const router   = useRouter()
  const dispatch = useDispatch()

  const { orgId, companyId, unitId, module: moduleName } = router.query || {}

  // Persist the active company + unit into Redux so breadcrumbs and
  // useUnitContext() on flat routes both resolve the right entity.
  useEffect(() => {
    if (companyId && unitId) {
      dispatch(setSelectedUnit({ companyId, unitId }))
    }
  }, [companyId, unitId, dispatch])

  // Wait until the router has hydrated the query params
  if (!router.isReady) return <Loader />

  const PageComponent = MODULE_MAP[moduleName]

  if (!PageComponent) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='h5' color='text.secondary'>
          Module &quot;{moduleName}&quot; not found
        </Typography>
      </Box>
    )
  }

  return <PageComponent />
}

export default UnitModulePage