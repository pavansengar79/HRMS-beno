// src/pages/dashboards/analytics/companyAdminDashboard.js
// REAL API — GET /api/v1/dashboard/company
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCompanyDashboard } from 'src/store/dashboard/dashboardSlice'
import { useTheme, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Icon from 'src/@core/components/icon'

const KPICard = ({ label, value, sub, icon, color, trend, trendUp }) => {
  const theme = useTheme(); const isDark = theme.palette.mode === 'dark'
  return (
    <Card sx={{ overflow: 'hidden', height: '100%' }}>
      <Box sx={{ px: 3, pt: 3, pb: 2.5, background: `linear-gradient(135deg, ${alpha(color, isDark ? 0.18 : 0.07)} 0%, transparent 70%)` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: alpha(color, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon={icon} fontSize={22} style={{ color }} />
          </Box>
          {trend && <Chip label={trend} size='small' sx={{ fontSize: 10, height: 20, fontWeight: 700, bgcolor: alpha(trendUp !== false ? '#10b981' : '#ef4444', 0.12), color: trendUp !== false ? '#10b981' : '#ef4444' }} />}
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
  const { data, loading, error } = useSelector(s => s.dashboard)

  useEffect(() => { dispatch(fetchCompanyDashboard()) }, [dispatch])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
  if (error)   return <Alert severity='error' sx={{ m: 4 }}>{String(error)}</Alert>
  if (!data)   return null

  const units        = data.units        || {}
  const lobs         = data.lobs         || {}
  const users        = data.users        || {}
  const depts        = data.departments  || {}
  const desigs       = data.designations || {}
  const employees    = data.employees    || {}
  const recentUnits  = data.recentUnits  || []
  const recentUsers  = data.recentUsers  || []
  const holidays     = data.upcomingHolidays || []

  const KPIS = [
    { label: 'Total Employees', value: employees.total?.toLocaleString('en-IN') || '0', sub: `across ${units.total ?? 0} units`, icon: 'tabler:users', color: '#6366f1' },
    { label: 'Business Units',  value: units.total, sub: `+${units.newThisMonth ?? 0} this month`, icon: 'tabler:building-community', color: '#0ea5e9', trend: `+${units.newThisMonth ?? 0} MTD`, trendUp: true },
    { label: 'Departments',     value: depts.total,  sub: 'across all units', icon: 'tabler:sitemap', color: '#10b981' },
    { label: 'Designations',    value: desigs.total, sub: 'job roles defined', icon: 'tabler:badge', color: '#8b5cf6' },
    { label: 'LOBs',            value: lobs.total,   sub: 'lines of business', icon: 'tabler:layout-grid', color: '#f59e0b' },
    { label: 'Total Users',     value: users.total,  sub: 'admins + managers', icon: 'tabler:user-check', color: '#ef4444' },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>Company Dashboard</Typography>
          <Typography variant='body2' color='text.secondary'>Company Admin · All Business Units</Typography>
        </Box>
        <Chip label={`${units.total ?? 0} Units Active`} size='small' sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontWeight: 700 }} icon={<Icon icon='tabler:building-community' fontSize={14} />} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map(k => <Grid item xs={6} sm={4} md={2} key={k.label}><KPICard {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Unit Summary</Typography>
              <Chip label={`${units.total ?? 0} Units`} size='small' color='primary' variant='outlined' />
            </Box>
            {recentUnits.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>No units yet</Typography></Box>
            ) : recentUnits.map((u, i) => (
              <Box key={u.id} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < recentUnits.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#0ea5e9', 0.1), color: '#0ea5e9', fontSize: 13, fontWeight: 800 }}>{(u.name || '?').substring(0, 2).toUpperCase()}</Avatar>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{u.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{u.lob ? `${u.lob} · ` : ''}{u.location || 'No location'}</Typography>
                  </Box>
                </Box>
                <Chip label={u.status} size='small' sx={{ bgcolor: alpha(u.status === 'Active' ? '#10b981' : '#f59e0b', 0.1), color: u.status === 'Active' ? '#10b981' : '#f59e0b', fontWeight: 700 }} />
              </Box>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={4}>
            <Card>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Recent Users</Typography>
              </Box>
              {recentUsers.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>No users yet</Typography></Box>
              ) : recentUsers.map((u, i) => (
                <Box key={u.id} sx={{ px: 4, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < recentUsers.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6', fontSize: 12, fontWeight: 800 }}>{(u.name || '?').charAt(0)}</Avatar>
                    <Box>
                      <Typography variant='caption' sx={{ fontWeight: 600, display: 'block' }}>{u.name}</Typography>
                      <Typography variant='caption' color='text.secondary'>{u.role || 'No role'}</Typography>
                    </Box>
                  </Box>
                  <Chip label={u.status} size='small' sx={{ fontSize: 10, bgcolor: alpha(u.status === 'ACTIVE' ? '#10b981' : '#ef4444', 0.1), color: u.status === 'ACTIVE' ? '#10b981' : '#ef4444', fontWeight: 700 }} />
                </Box>
              ))}
            </Card>

            <Card>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Upcoming Holidays</Typography>
              </Box>
              {holidays.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>No upcoming holidays</Typography></Box>
              ) : holidays.map((h, i) => (
                <Box key={h.id} sx={{ px: 4, py: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: i < holidays.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: alpha('#10b981', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon icon='tabler:calendar-event' fontSize={15} style={{ color: '#10b981' }} />
                  </Box>
                  <Box>
                    <Typography variant='caption' sx={{ fontWeight: 600, display: 'block' }}>{h.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Typography>
                  </Box>
                </Box>
              ))}
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
