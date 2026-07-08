// src/pages/dashboards/OrgAdminDashboard.js
// REAL API — GET /api/v1/dashboard/org
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Icon from 'src/@core/components/icon'
import { fetchOrgDashboard } from 'src/store/dashboard/dashboardSlice'

const KPICard = ({ label, value, sub, icon, color, trend }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Card sx={{ overflow: 'hidden', height: '100%' }}>
      <Box sx={{ px: 3, pt: 3, pb: 2.5, background: `linear-gradient(135deg, ${alpha(color, isDark ? 0.18 : 0.07)} 0%, transparent 70%)` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: alpha(color, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon={icon} fontSize={22} style={{ color }} />
          </Box>
          {trend && (
            <Chip label={trend} size='small' sx={{ fontSize: 10, height: 20, fontWeight: 700, bgcolor: alpha('#10b981', 0.12), color: '#10b981' }} />
          )}
        </Box>
        <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px' }}>{value ?? '—'}</Typography>
        <Typography variant='caption' sx={{ display: 'block', mt: 0.5, fontWeight: 600, color: 'text.secondary' }}>{label}</Typography>
        {sub && <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25 }}>{sub}</Typography>}
      </Box>
    </Card>
  )
}

export default function OrgAdminDashboard() {
  const dispatch = useDispatch()
  const theme = useTheme()
  const { orgDashboard, loading, error } = useSelector(s => s.dashboard)

  useEffect(() => {
    dispatch(fetchOrgDashboard())
  }, [dispatch])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
  if (error) return <Alert severity='error' sx={{ m: 4 }}>{String(error)}</Alert>
  if (!orgDashboard) return null

  const companies = orgDashboard.companies || {}
  const employees = orgDashboard.employees || {}
  const users = orgDashboard.users || {}
  const subscription = orgDashboard.subscription || {}

  const KPIS = [
    {
      label: 'Total Companies',
      value: companies.total,
      sub: `${companies.active ?? 0} active`,
      icon: 'tabler:building-bank',
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
      label: 'Active Users',
      value: users.active,
      sub: 'across all companies',
      icon: 'tabler:user-check',
      color: '#0ea5e9'
    },
    {
      label: 'Pending Approvals',
      value: orgDashboard.pendingApprovals || 0,
      sub: 'leave + regularisation',
      icon: 'tabler:clock-check',
      color: '#f59e0b'
    }
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>Organisation Overview</Typography>
          <Typography variant='body2' color='text.secondary'>Org Admin · All Companies</Typography>
        </Box>
        {subscription.status && (
          <Chip
            label={subscription.status}
            size='small'
            sx={{ fontWeight: 700, bgcolor: alpha(subscription.status === 'ACTIVE' ? '#10b981' : '#f59e0b', 0.1), color: subscription.status === 'ACTIVE' ? '#10b981' : '#f59e0b' }}
          />
        )}
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map((kpi, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <KPICard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Additional Org-specific widgets can be added here */}
    </Box>
  )
}
