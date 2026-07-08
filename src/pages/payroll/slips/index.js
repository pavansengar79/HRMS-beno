// src/pages/payroll/slips/index.js
// SUPERSEDED — this page's functionality now lives in the route-based
// Payroll tabs: /payroll/my (employee self-service) and /payroll
// (All Payslips, admin). Kept as a redirect so any existing links/menu
// items pointing at /payroll/slips still land somewhere useful, instead
// of 404ing.
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { selectRoleSlug } from 'src/store/auth/authSlice'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

export default function SlipsRedirect() {
  const router = useRouter()
  const roleSlug = useSelector(selectRoleSlug)

  useEffect(() => {
    router.replace(roleSlug === 'employee' ? '/payroll/my' : '/payroll')
  }, [roleSlug, router])

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <CircularProgress />
    </Box>
  )
}
