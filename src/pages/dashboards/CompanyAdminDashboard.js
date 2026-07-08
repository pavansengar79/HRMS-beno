// src/pages/dashboards/CompanyAdminDashboard.js
// REAL API — GET /api/v1/dashboard/company
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme, alpha } from '@mui/material/styles'
import { useParams } from 'next/navigation'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Icon from 'src/@core/components/icon'
import { fetchCompanyDashboard } from 'src/store/dashboard/dashboardSlice'

const KPICard = ({ label, value, sub, icon, color }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Card sx={{ overflow: 'hidden', height: '100%' }}>
      <Box sx={{ px: 3, pt: 3, pb: 2.5, background: `linear-gradient(135deg, ${alpha(color, isDark ? 0.18 : 0.07)} 0%, transparent 70%)` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: alpha(color, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon={icon} fontSize={22} style={{ color }} />
          </Box>
        </Box>
        <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px' }}>{value ?? '—'}</Typography>
        <Typography variant='caption' sx={{ display: 'block', mt: 0.5, fontWeight: 600, color: 'text.secondary' }}>{label}</Typography>
        {sub && <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25 }}>{sub}</Typography>}
      </Box>
    </Card>
  )
}

export default function CompanyAdminDashboard() {
  const dispatch = useDispatch()
  const theme = useTheme()
  const params = useParams()
  const { companyDashboard, loading, error } = useSelector(s => s.dashboard)

  useEffect(() => {
    const companyId = params?.companyId
    dispatch(fetchCompanyDashboard({ companyId }))
  }, [dispatch, params?.companyId])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
  if (error) return <Alert severity='error' sx={{ m: 4 }}>{String(error)}</Alert>
  if (!companyDashboard) return null

  const units = companyDashboard.units || {}
  const employees = companyDashboard.employees || {}
  const attendance = companyDashboard.attendance || {}
  const payroll = companyDashboard.payroll || {}

  const KPIS = [
    {
      label: 'Business Units',
      value: units.total,
      sub: `${units.active ?? 0} active`,
      icon: 'tabler:building-warehouse',
      color: '#6366f1'
    },
    {
      label: 'Total Employees',
      value: employees.total,
      sub: `${employees.active ?? 0} on payroll`,
      icon: 'tabler:users-group',
      color: '#10b981'
    },
    {
      label: 'Present Today',
      value: attendance.present,
      sub: `${attendance.absent ?? 0} absent`,
      icon: 'tabler:user-check',
      color: '#0ea5e9'
    },
    {
      label: 'Pending Leaves',
      value: companyDashboard.pendingLeaves || 0,
      sub: 'awaiting approval',
      icon: 'tabler:calendar-cancel',
      color: '#f59e0b'
    }
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>Company Overview</Typography>
          <Typography variant='body2' color='text.secondary'>Company Admin · {companyDashboard.companyName}</Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map((kpi, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <KPICard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Company-level widgets: Payroll status, Recent hires, etc. */}
    </Box>
  )
}
