// src/pages/dashboards/analytics/companyAdminDashboard.js
import { useTheme, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const ATT_BY_UNIT = [
  { unit: 'Engineering', present: 38, total: 42, rate: 90 },
  { unit: 'Sales', unit_s: 'Sales', present: 31, total: 34, rate: 91 },
  { unit: 'Operations', present: 27, total: 29, rate: 93 },
  { unit: 'Corporate', present: 22, total: 24, rate: 92 },
  { unit: 'Finance', present: 18, total: 19, rate: 95 },
]
const HIRING_TREND = [
  { month: 'Jan', joined: 8, exited: 2 }, { month: 'Feb', joined: 5, exited: 1 },
  { month: 'Mar', joined: 12, exited: 3 }, { month: 'Apr', joined: 7, exited: 2 },
  { month: 'May', joined: 9, exited: 1 }, { month: 'Jun', joined: 11, exited: 4 },
]
const UNIT_SUMMARY = [
  { name: 'Engineering', employees: 42, present: 38, leaves: 4, payroll: '₹18.4L', status: 'Active' },
  { name: 'Sales', employees: 34, present: 31, leaves: 3, payroll: '₹12.1L', status: 'Active' },
  { name: 'Operations', employees: 29, present: 27, leaves: 0, payroll: '₹9.8L', status: 'Active' },
  { name: 'Corporate', employees: 24, present: 22, leaves: 2, payroll: '₹11.2L', status: 'Active' },
  { name: 'Finance', employees: 19, present: 18, leaves: 1, payroll: '₹7.9L', status: 'Active' },
]
const PENDING_ACTIONS = [
  { type: 'Leave Request', employee: 'Arjun Mehta', detail: 'Sick Leave · Jun 9–10 (2 days)', icon: 'tabler:calendar-user', color: '#f59e0b', urgent: true },
  { type: 'Regularisation', employee: 'Priya Singh', detail: 'Missing punch · Jun 6', icon: 'tabler:clock-check', color: '#6366f1', urgent: false },
  { type: 'Leave Request', employee: 'Kiran Rao', detail: 'Earned Leave · Jun 12–16 (5 days)', icon: 'tabler:calendar-user', color: '#f59e0b', urgent: false },
  { type: 'New Employee', employee: 'Sneha Patel', detail: 'Joining Jun 11 — setup pending', icon: 'tabler:user-plus', color: '#10b981', urgent: true },
]

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
        <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px' }}>{value}</Typography>
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

export default function CompanyAdminDashboard() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const KPIS = [
    { label: 'Total Employees', value: '342', sub: 'across 5 units', icon: 'tabler:users', color: '#6366f1', trend: '+11 MTD', trendUp: true },
    { label: 'Business Units', value: '5', sub: 'all active', icon: 'tabler:building-community', color: '#0ea5e9', trend: 'All active', trendUp: true },
    { label: "Today's Attendance", value: '94.2%', sub: '322 of 342 present', icon: 'tabler:clock-check', color: '#10b981', trend: '+1.2%', trendUp: true },
    { label: 'Payroll — May', value: '₹59.4L', sub: 'fully processed', icon: 'tabler:cash', color: '#8b5cf6', trend: 'On time', trendUp: true },
    { label: 'Open Leaves', value: '14', sub: '7 approved · 7 pending', icon: 'tabler:calendar-user', color: '#f59e0b', trend: '7 pending', trendUp: null },
    { label: 'Pending Actions', value: '4', sub: 'require approval', icon: 'tabler:bell', color: '#ef4444', trend: '1 urgent', trendUp: false },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>Company Dashboard</Typography>
          <Typography variant='body2' color='text.secondary'>Company Admin · All 5 Business Units</Typography>
        </Box>
        <Chip label='Next Payroll: Jun 30' size='small' sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontWeight: 700 }} icon={<Icon icon='tabler:calendar' fontSize={14} />} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map(k => <Grid item xs={6} sm={4} md={2} key={k.label}><KPICard {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Attendance Rate by Unit</Typography>
              <Typography variant='caption' color='text.secondary'>Today's attendance across business units</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              {ATT_BY_UNIT.map(u => (
                <Box key={u.unit} sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant='caption' sx={{ fontWeight: 600 }}>{u.unit}</Typography>
                    <Typography variant='caption' color='text.secondary'>{u.present}/{u.total} · <strong style={{ color: u.rate >= 93 ? '#10b981' : u.rate >= 88 ? '#f59e0b' : '#ef4444' }}>{u.rate}%</strong></Typography>
                  </Box>
                  <LinearProgress variant='determinate' value={u.rate}
                    sx={{ height: 7, borderRadius: 4, bgcolor: alpha(u.rate >= 93 ? '#10b981' : '#f59e0b', 0.15), '& .MuiLinearProgress-bar': { bgcolor: u.rate >= 93 ? '#10b981' : '#f59e0b', borderRadius: 4 } }} />
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Hiring Trend</Typography>
              <Typography variant='caption' color='text.secondary'>Joiners vs exits (last 6 months)</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <ResponsiveContainer width='100%' height={220}>
                <BarChart data={HIRING_TREND} barCategoryGap='35%' barGap={4}>
                  <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#333' : '#f0f0f0'} vertical={false} />
                  <XAxis dataKey='month' tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey='joined' name='Joined' fill='#10b981' radius={[4, 4, 0, 0]} />
                  <Bar dataKey='exited' name='Exited' fill='#ef4444' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Unit Summary</Typography>
              <Chip label='5 Units' size='small' color='primary' variant='outlined' />
            </Box>
            {UNIT_SUMMARY.map((u, i) => (
              <Box key={u.name} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < UNIT_SUMMARY.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#0ea5e9', 0.1), color: '#0ea5e9', fontSize: 13, fontWeight: 800 }}>{u.name.substring(0, 2).toUpperCase()}</Avatar>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{u.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{u.employees} employees · {u.leaves} on leave · {u.payroll}</Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: '#10b981' }}>{u.present}/{u.employees}</Typography>
                  <Typography variant='caption' color='text.secondary'>present</Typography>
                </Box>
              </Box>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Pending Actions</Typography>
            </Box>
            <Box sx={{ px: 3, py: 1 }}>
              {PENDING_ACTIONS.map((a, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, py: 2.5, borderBottom: i < PENDING_ACTIONS.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(a.color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon icon={a.icon} fontSize={18} style={{ color: a.color }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <Typography variant='caption' sx={{ fontWeight: 700 }}>{a.employee}</Typography>
                      {a.urgent && <Chip label='Urgent' size='small' sx={{ fontSize: 10, height: 16, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 700 }} />}
                    </Box>
                    <Typography variant='caption' color='text.secondary'>{a.type} · {a.detail}</Typography>
                  </Box>
                  <Button size='small' variant='outlined' sx={{ height: 28, fontSize: 11, minWidth: 60 }}>Review</Button>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
