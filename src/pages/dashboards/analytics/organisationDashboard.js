// src/pages/dashboards/analytics/organisationDashboard.js
// REAL API — GET /api/v1/dashboard/org
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrgDashboard } from 'src/store/dashboard/dashboardSlice'
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
const CTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, boxShadow: 4 }}>
      <Typography variant='caption' sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>{label}</Typography>
      {payload.map((p, i) => <Typography key={i} variant='caption' sx={{ display: 'block', color: p.color }}>{p.name}: <strong>{p.value}</strong></Typography>)}
    </Box>
  )
}

const ACTIVITY_ICONS = {
  USER_JOINED: 'tabler:user-plus',
  LEAVE_APPROVED: 'tabler:check',
  LEAVE_REQUESTED: 'tabler:calendar-plus',
  ATTENDANCE_MARKED: 'tabler:clock',
  COMPANY_CREATED: 'tabler:building-plus',
  default: 'tabler:activity'
}

const ACTIVITY_COLORS = {
  USER_JOINED: '#6366f1',
  LEAVE_APPROVED: '#10b981',
  LEAVE_REQUESTED: '#f59e0b',
  ATTENDANCE_MARKED: '#0ea5e9',
  COMPANY_CREATED: '#8b5cf6',
  default: '#94a3b8'
}

export default function OrganisationDashboard() {
  const dispatch = useDispatch()
  const theme = useTheme(); const isDark = theme.palette.mode === 'dark'
  const { data, loading, error } = useSelector(s => s.dashboard)

  useEffect(() => { dispatch(fetchOrgDashboard()) }, [dispatch])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
  if (error)   return <Alert severity='error' sx={{ m: 4 }}>{String(error)}</Alert>
  if (!data)   return null

  const companies = data.companies || {}
  const lobs      = data.lobs      || {}
  const users     = data.users     || {}
  const employees = data.employees || {}
  const roles     = data.roles     || {}
  const pending   = data.pendingActions || {}
  const recent    = data.recentCompanies || []
  const activity  = data.recentActivity || []
  const subscription = data.subscription || {}

  const KPIS = [
    { label: 'Total Employees', value: employees.total?.toLocaleString('en-IN') || '0', sub: `across ${companies.total ?? 0} companies`, icon: 'tabler:users', color: '#6366f1', trend: null },
    { label: 'Companies',       value: companies.total, sub: `${companies.active ?? 0} active`, icon: 'tabler:building-skyscraper', color: '#0ea5e9', trend: `+${companies.newThisMonth ?? 0} MTD`, trendUp: true },
    { label: 'Business Units',  value: lobs.total,      sub: 'across all companies', icon: 'tabler:building-community', color: '#10b981' },
    { label: 'Total Users',     value: users.total,     sub: 'admin + managers', icon: 'tabler:user-check', color: '#8b5cf6' },
  ]

  const barData = recent.map(c => ({ company: c.name?.substring(0, 8), status: c.status === 'Active' ? 1 : 0 }))

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>Organisation Overview</Typography>
          <Typography variant='body2' color='text.secondary'>Org Admin · Multi-company consolidated view</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {subscription.is_trial && (
            <Chip 
              icon={<Icon icon='tabler:clock' fontSize={14} />}
              label={`Trial: ${subscription.days_left || 0} days left`}
              size='small'
              sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 700 }}
            />
          )}
          <Chip label={`${companies.active ?? 0} Companies Active`} size='small' sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700 }} />
        </Box>
      </Box>

      {/* Subscription Card - Show during trial */}
      {subscription.is_trial && (
        <Card sx={{ mb: 4, p: 3, bgcolor: alpha('#f59e0b', isDark ? 0.05 : 0.02), border: `1px solid ${alpha('#f59e0b', 0.2)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.15), color: '#f59e0b', width: 48, height: 48 }}>
                <Icon icon='tabler:rocket' fontSize={24} />
              </Avatar>
              <Box>
                <Typography variant='body1' sx={{ fontWeight: 700 }}>
                  {subscription.plan_name} Trial · {subscription.days_left} days remaining
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Trial ends on {subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant='body2' sx={{ fontWeight: 600, color: '#f59e0b' }}>
                {subscription.structure_level?.charAt(0).toUpperCase() + subscription.structure_level?.slice(1)} Plan
              </Typography>
              <Typography variant='caption' color='text.secondary'>Status: {subscription.status}</Typography>
            </Box>
          </Box>
          <LinearProgress 
            variant='determinate' 
            value={subscription.days_left ? (subscription.days_left / 30) * 100 : 0}
            sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: alpha('#f59e0b', 0.15), '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b', borderRadius: 3 } }}
          />
        </Card>
      )}

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map(k => <Grid item xs={6} sm={3} key={k.label}><KPICard {...k} /></Grid>)}
      </Grid>

      {/* Pending Actions Card */}
      {(pending.leaves > 0 || pending.regularizations > 0) && (
        <Card sx={{ mb: 4, p: 3, bgcolor: alpha('#ef4444', isDark ? 0.05 : 0.02), border: `1px solid ${alpha('#ef4444', 0.2)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha('#ef4444', 0.15), color: '#ef4444' }}>
              <Icon icon='tabler:alert-triangle' fontSize={22} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant='body1' sx={{ fontWeight: 700 }}>Pending Approvals</Typography>
              <Typography variant='caption' color='text.secondary'>Action required on {pending.total} items</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {pending.leaves > 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='h5' sx={{ fontWeight: 800, color: '#ef4444' }}>{pending.leaves}</Typography>
                  <Typography variant='caption' color='text.secondary'>Leave Requests</Typography>
                </Box>
              )}
              {pending.regularizations > 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='h5' sx={{ fontWeight: 800, color: '#f59e0b' }}>{pending.regularizations}</Typography>
                  <Typography variant='caption' color='text.secondary'>Regularizations</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Card>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Company Summary</Typography>
              <Chip label={`${companies.total ?? 0} total`} size='small' color='primary' variant='outlined' />
            </Box>
            {recent.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>No companies yet</Typography></Box>
            ) : recent.map((c, i) => (
              <Box key={c.id} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < recent.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontSize: 14, fontWeight: 800 }}>{(c.name || '?').charAt(0)}</Avatar>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{c.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{c.code} · {c.email}</Typography>
                  </Box>
                </Box>
                <Chip label={c.status} size='small' sx={{ bgcolor: alpha(c.status === 'Active' ? '#10b981' : '#f59e0b', 0.1), color: c.status === 'Active' ? '#10b981' : '#f59e0b', fontWeight: 700 }} />
              </Box>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={4}>
            {/* Recent Activity Card */}
            <Card>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Recent Activity</Typography>
              </Box>
              <Box sx={{ px: 3, py: 1 }}>
                {activity.length === 0 ? (
                  <Box sx={{ py: 3, textAlign: 'center' }}><Typography variant='caption' color='text.secondary'>No recent activity</Typography></Box>
                ) : activity.slice(0, 5).map((a, i) => {
                  const icon = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.default
                  const color = ACTIVITY_COLORS[a.type] || ACTIVITY_COLORS.default
                  return (
                    <Box key={i} sx={{ display: 'flex', gap: 2, py: 2, borderBottom: i < Math.min(activity.length - 1, 4) ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: alpha(color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon icon={icon} fontSize={14} style={{ color }} />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant='caption' sx={{ fontWeight: 600, display: 'block', lineHeight: 1.4 }}>
                          {a.name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                          {a.email}
                        </Typography>
                        <Typography variant='caption' color='text.disabled' sx={{ display: 'block', fontSize: 10 }}>
                          {a.timestamp ? new Date(a.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </Typography>
                      </Box>
                      <Chip label={a.type?.replace('_', ' ')} size='small' sx={{ fontSize: 9, height: 18, textTransform: 'capitalize' }} />
                    </Box>
                  )
                })}
              </Box>
            </Card>

            {/* Stats Summary Card */}
            <Card>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Stats Summary</Typography>
              </Box>
              <Box sx={{ px: 4, py: 3 }}>
                <Stack spacing={3}>
                  {[
                    { label: 'Active Companies', value: companies.active ?? 0, total: companies.total ?? 1, color: '#10b981' },
                    { label: 'Inactive Companies', value: companies.inactive ?? 0, total: companies.total ?? 1, color: '#ef4444' },
                    { label: 'Total Roles', value: roles.total ?? 0, total: roles.total ?? 1, color: '#6366f1' },
                  ].map(s => (
                    <Box key={s.label}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography variant='caption' sx={{ fontWeight: 600 }}>{s.label}</Typography>
                        <Typography variant='caption' color='text.secondary'>{s.value} / {s.total}</Typography>
                      </Box>
                      <LinearProgress variant='determinate' value={s.total > 0 ? (s.value / s.total) * 100 : 0}
                        sx={{ height: 6, borderRadius: 3, bgcolor: alpha(s.color, 0.15), '& .MuiLinearProgress-bar': { bgcolor: s.color, borderRadius: 3 } }} />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
