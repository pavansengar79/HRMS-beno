// src/pages/dashboards/analytics/superAdminDashboard.js
// REAL API — GET /api/v1/dashboard/super-admin
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSuperAdminDashboard } from 'src/store/dashboard/dashboardSlice'
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
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const KPICard = ({ label, value, sub, icon, color, trend, trendUp }) => {
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
            <Chip label={trend} size='small' sx={{ fontSize: 10, height: 20, fontWeight: 700,
              bgcolor: alpha(trendUp !== false ? '#10b981' : '#ef4444', 0.12),
              color: trendUp !== false ? '#10b981' : '#ef4444' }} />
          )}
        </Box>
        <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px' }}>{value ?? '—'}</Typography>
        <Typography variant='caption' sx={{ display: 'block', mt: 0.5, fontWeight: 600, color: 'text.secondary' }}>{label}</Typography>
        {sub && <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25 }}>{sub}</Typography>}
      </Box>
    </Card>
  )
}

const CTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, boxShadow: 4 }}>
      <Typography variant='caption' sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} variant='caption' sx={{ display: 'block', color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </Typography>
      ))}
    </Box>
  )
}

const PLAN_COLOR = { Starter: '#0ea5e9', Teams: '#6366f1', Enterprise: '#10b981', Trial: '#f59e0b' }

export default function SuperAdminDashboard() {
  const dispatch = useDispatch()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { data, loading, error } = useSelector(s => s.dashboard)

  useEffect(() => { dispatch(fetchSuperAdminDashboard()) }, [dispatch])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
  if (error)   return <Alert severity='error' sx={{ m: 4 }}>{String(error)}</Alert>
  if (!data)   return null

  const customers = data.customers || {}
  const users     = data.users     || {}
  const plans     = data.plans     || []
  const recent    = data.recentCustomers || []
  const activity  = data.recentActivity || []

  const KPIS = [
    { label: 'Total Customers',  value: customers.total,        sub: `${customers.active ?? 0} active · ${customers.suspended ?? 0} suspended`, icon: 'tabler:building-skyscraper', color: '#6366f1', trend: `+${customers.newThisMonth ?? 0} MTD`, trendUp: true },
    { label: 'Active Users',     value: users.active?.toLocaleString('en-IN'), sub: 'across all orgs', icon: 'tabler:users', color: '#0ea5e9' },
    { label: 'Total Plans',      value: plans.length,           sub: 'available plans', icon: 'tabler:layout-grid', color: '#10b981' },
  ]

  const pieData = plans.map(p => ({ name: p.name, value: p.orgCount || 0, color: PLAN_COLOR[p.name] || '#8b5cf6' }))

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>Platform Overview</Typography>
          <Typography variant='body2' color='text.secondary'>Super Admin · All Customers</Typography>
        </Box>
        <Chip icon={<Icon icon='tabler:check' fontSize={14} />} label='All Systems Normal' size='small'
          sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700 }} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map(k => <Grid item xs={6} sm={4} md={4} key={k.label}><KPICard {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Recent Customers</Typography>
              <Chip label={`${customers.total ?? 0} total`} size='small' color='primary' variant='outlined' />
            </Box>
            {recent.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>No customers yet</Typography></Box>
            ) : recent.map((c, i) => (
              <Box key={c.id} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < recent.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#6366f1', 0.12), color: '#6366f1', fontSize: 14, fontWeight: 800 }}>
                    {(c.name || '?').charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{c.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{c.email}</Typography>
                  </Box>
                </Box>
                <Chip label={c.status} size='small' sx={{ fontSize: 11, fontWeight: 700,
                  bgcolor: alpha(c.status === 'Active' ? '#10b981' : '#f59e0b', 0.1),
                  color: c.status === 'Active' ? '#10b981' : '#f59e0b' }} />
              </Box>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={4}>
            <Card>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Plan Distribution</Typography>
                <Typography variant='caption' color='text.secondary'>Active orgs by plan</Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                {pieData.length > 0 && (
                  <ResponsiveContainer width='100%' height={120}>
                    <PieChart>
                      <Pie data={pieData} cx='50%' cy='50%' innerRadius={35} outerRadius={55} paddingAngle={4} dataKey='value'>
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} orgs`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {plans.map(p => (
                    <Box key={p.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PLAN_COLOR[p.name] || '#8b5cf6' }} />
                        <Typography variant='caption' sx={{ fontWeight: 600 }}>{p.name}</Typography>
                      </Box>
                      <Typography variant='caption' sx={{ fontWeight: 800 }}>{p.orgCount ?? 0}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Card>

            <Card>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Recent Activity</Typography>
              </Box>
              <Box sx={{ px: 3, py: 1 }}>
                {activity.length === 0 ? (
                  <Box sx={{ py: 3, textAlign: 'center' }}><Typography variant='caption' color='text.secondary'>No activity yet</Typography></Box>
                ) : activity.slice(0, 5).map((a, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, py: 2, borderBottom: i < activity.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: alpha('#6366f1', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon icon='tabler:activity' fontSize={13} style={{ color: '#6366f1' }} />
                    </Box>
                    <Box>
                      <Typography variant='caption' sx={{ fontWeight: 500, display: 'block', lineHeight: 1.4 }}>{a.action}</Typography>
                      <Typography variant='caption' color='text.disabled'>{a.actor}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
