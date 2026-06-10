// src/pages/dashboards/analytics/hrDashboard.js
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
import Divider from '@mui/material/Divider'
import Icon from 'src/@core/components/icon'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const LEAVE_BY_TYPE = [
  { type: 'Casual', MTD: 12, YTD: 94 },
  { type: 'Sick', MTD: 8, YTD: 61 },
  { type: 'Earned', MTD: 18, YTD: 142 },
  { type: 'LOP', MTD: 3, YTD: 24 },
  { type: 'Comp-Off', MTD: 5, YTD: 37 },
]
const WEEKLY_ATT = [
  { week: 'W1 May', rate: 92.1 }, { week: 'W2 May', rate: 91.3 },
  { week: 'W3 May', rate: 93.7 }, { week: 'W4 May', rate: 94.2 },
  { week: 'W1 Jun', rate: 91.5 }, { week: 'W2 Jun', rate: 93.1 },
]
const APPROVAL_QUEUE = [
  { name: 'Arjun Mehta', type: 'Sick Leave', dates: 'Jun 11–12', days: 2, status: 'Pending', urgent: true, dept: 'Backend' },
  { name: 'Priya Singh', type: 'Regularisation', dates: 'Jun 6', days: 1, status: 'Pending', urgent: false, dept: 'Design' },
  { name: 'Kiran Rao', type: 'Earned Leave', dates: 'Jun 16–20', days: 5, status: 'Pending', urgent: false, dept: 'Sales' },
  { name: 'Ravi Kumar', type: 'Comp-Off', dates: 'Jun 13', days: 1, status: 'Pending', urgent: false, dept: 'DevOps' },
]
const UPCOMING = [
  { icon: 'tabler:user-plus', color: '#10b981', text: 'Sneha Patel joining Jun 11 — onboarding needed', type: 'New Joiner' },
  { icon: 'tabler:user-minus', color: '#ef4444', text: 'Mohan Lal last day Jun 30 — exit process started', type: 'Exit' },
  { icon: 'tabler:cash', color: '#6366f1', text: 'Payroll cycle due Jun 30 — 47 employees', type: 'Payroll' },
  { icon: 'tabler:calendar-event', color: '#f59e0b', text: 'Eid Al-Adha — Jun 17 (optional holiday)', type: 'Holiday' },
]
const DEPT_LEAVE = [
  { dept: 'Engineering', balance: 18.2, used: 6.8 },
  { dept: 'Sales', balance: 14.5, used: 9.5 },
  { dept: 'Operations', balance: 22.1, used: 1.9 },
  { dept: 'Corporate', balance: 19.7, used: 4.3 },
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

export default function HRDashboard() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const KPIS = [
    { label: 'Pending Approvals', value: '4', sub: '1 urgent', icon: 'tabler:bell', color: '#ef4444', trend: 'Review now', trendUp: false },
    { label: 'New Joiners (MTD)', value: '3', sub: 'onboarding in progress', icon: 'tabler:user-plus', color: '#10b981', trend: '+3 this month', trendUp: true },
    { label: 'Avg Leave Balance', value: '18.5d', sub: 'across all employees', icon: 'tabler:calendar-check', color: '#6366f1', trend: '6.1d used YTD', trendUp: null },
    { label: 'Absent Today', value: '4', sub: '2 on leave · 2 absent', icon: 'tabler:user-off', color: '#f59e0b', trend: '91.5% present', trendUp: null },
    { label: 'Payroll Pending', value: '0', sub: 'May fully processed', icon: 'tabler:cash', color: '#0ea5e9', trend: 'All done', trendUp: true },
    { label: 'Open Positions', value: '2', sub: 'approvals needed', icon: 'tabler:briefcase', color: '#8b5cf6', trend: 'New this week', trendUp: null },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>HR Operations Dashboard</Typography>
          <Typography variant='body2' color='text.secondary'>HR Manager · Engineering Unit · TechNova Solutions</Typography>
        </Box>
        <Chip label='4 pending actions' size='small' sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 700 }} icon={<Icon icon='tabler:bell' fontSize={14} />} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map(k => <Grid item xs={6} sm={4} md={2} key={k.label}><KPICard {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Leave Requests by Type</Typography>
              <Typography variant='caption' color='text.secondary'>Current month vs YTD</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <ResponsiveContainer width='100%' height={220}>
                <BarChart data={LEAVE_BY_TYPE} barCategoryGap='30%' barGap={4}>
                  <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#333' : '#f0f0f0'} vertical={false} />
                  <XAxis dataKey='type' tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey='MTD' name='This Month' fill='#6366f1' radius={[4, 4, 0, 0]} />
                  <Bar dataKey='YTD' name='YTD Total' fill={isDark ? '#334155' : '#e2e8f0'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={4} sx={{ height: '100%' }}>
            <Card sx={{ flex: 1 }}>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Weekly Attendance Rate</Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <ResponsiveContainer width='100%' height={120}>
                  <LineChart data={WEEKLY_ATT}>
                    <XAxis dataKey='week' tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[88, 97]} />
                    <Tooltip content={<CTooltip />} />
                    <Line type='monotone' dataKey='rate' name='Attendance %' stroke='#10b981' strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Card>

            <Card sx={{ flex: 1 }}>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Leave Balance by Dept</Typography>
              </Box>
              <Box sx={{ px: 4, py: 2 }}>
                {DEPT_LEAVE.map(d => (
                  <Box key={d.dept} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant='caption' sx={{ fontWeight: 600 }}>{d.dept}</Typography>
                      <Typography variant='caption' color='text.secondary'>Avg {d.balance}d left</Typography>
                    </Box>
                    <LinearProgress variant='determinate' value={(d.balance / 24) * 100}
                      sx={{ height: 5, borderRadius: 3, bgcolor: alpha('#6366f1', 0.12), '& .MuiLinearProgress-bar': { bgcolor: '#6366f1', borderRadius: 3 } }} />
                  </Box>
                ))}
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Approval Queue</Typography>
              <Chip label={`${APPROVAL_QUEUE.length} pending`} size='small' sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 700 }} />
            </Box>
            {APPROVAL_QUEUE.map((a, i) => (
              <Box key={a.name} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < APPROVAL_QUEUE.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 34, height: 34, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontSize: 13, fontWeight: 800 }}>{a.name.charAt(0)}</Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>{a.name}</Typography>
                      {a.urgent && <Chip label='Urgent' size='small' sx={{ height: 16, fontSize: 10, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 700 }} />}
                    </Box>
                    <Typography variant='caption' color='text.secondary'>{a.dept} · {a.type} · {a.dates} · {a.days}d</Typography>
                  </Box>
                </Box>
                <Stack direction='row' spacing={1}>
                  <Button size='small' variant='contained' color='success' sx={{ height: 26, fontSize: 10, minWidth: 56 }}>Approve</Button>
                  <Button size='small' variant='outlined' color='error' sx={{ height: 26, fontSize: 10, minWidth: 56 }}>Reject</Button>
                </Stack>
              </Box>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Upcoming Events</Typography>
            </Box>
            <Box sx={{ px: 3, py: 1 }}>
              {UPCOMING.map((u, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, py: 2.5, borderBottom: i < UPCOMING.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(u.color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon icon={u.icon} fontSize={18} style={{ color: u.color }} />
                  </Box>
                  <Box>
                    <Chip label={u.type} size='small' sx={{ height: 18, fontSize: 10, mb: 0.5, bgcolor: alpha(u.color, 0.1), color: u.color, fontWeight: 700 }} />
                    <Typography variant='caption' sx={{ display: 'block', fontWeight: 500, lineHeight: 1.4 }}>{u.text}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
