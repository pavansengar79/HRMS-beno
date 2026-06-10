// src/pages/dashboards/analytics/unitDashboard.js
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
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const DAILY_ATT = [
  { day: 'Jun 1', present: 44, absent: 3 }, { day: 'Jun 2', present: 45, absent: 2 },
  { day: 'Jun 3', present: 43, absent: 4 }, { day: 'Jun 4', present: 46, absent: 1 },
  { day: 'Jun 5', present: 45, absent: 2 }, { day: 'Jun 8', present: 42, absent: 5 },
  { day: 'Jun 9', present: 43, absent: 4 }, { day: 'Jun 10', present: 44, absent: 3 },
]
const LEAVE_DIST = [
  { name: 'Casual', value: 8, color: '#6366f1' },
  { name: 'Sick', value: 5, color: '#ef4444' },
  { name: 'Earned', value: 11, color: '#10b981' },
  { name: 'LOP', value: 2, color: '#f59e0b' },
]
const PENDING_LEAVES = [
  { name: 'Ravi Kumar', dept: 'Backend', type: 'Sick Leave', dates: 'Jun 11–12', days: 2, icon: 'R', urgent: true },
  { name: 'Anita Sharma', dept: 'Frontend', type: 'Earned Leave', dates: 'Jun 16–20', days: 5, icon: 'A', urgent: false },
  { name: 'Deepak Nair', dept: 'DevOps', type: 'Casual Leave', dates: 'Jun 13', days: 1, icon: 'D', urgent: false },
]
const REGULARISATIONS = [
  { name: 'Pooja Reddy', dept: 'QA', date: 'Jun 6', issue: 'Missing OUT punch', status: 'Pending' },
  { name: 'Sanjay Verma', dept: 'Backend', date: 'Jun 4', issue: 'Missing IN punch', status: 'Pending' },
  { name: 'Meera Iyer', dept: 'Design', date: 'Jun 3', issue: 'WFH not marked', status: 'Approved' },
]
const DEPT_SUMMARY = [
  { name: 'Backend', employees: 14, present: 12, leaves: 2 },
  { name: 'Frontend', employees: 10, present: 9, leaves: 1 },
  { name: 'DevOps', employees: 7, present: 7, leaves: 0 },
  { name: 'QA', employees: 9, present: 8, leaves: 1 },
  { name: 'Design', employees: 7, present: 7, leaves: 0 },
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

export default function UnitDashboard() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const KPIS = [
    { label: 'My Team', value: '47', sub: '5 departments', icon: 'tabler:users', color: '#6366f1', trend: 'Stable', trendUp: true },
    { label: 'Present Today', value: '43', sub: '4 absent / on leave', icon: 'tabler:clock-check', color: '#10b981', trend: '91.5%', trendUp: true },
    { label: 'On Leave', value: '3', sub: '2 approved today', icon: 'tabler:calendar-off', color: '#f59e0b', trend: 'Normal', trendUp: null },
    { label: 'Pending Leaves', value: '3', sub: 'awaiting approval', icon: 'tabler:calendar-user', color: '#ef4444', trend: 'Review now', trendUp: false },
    { label: 'Regularisations', value: '2', sub: 'pending review', icon: 'tabler:clock-edit', color: '#8b5cf6', trend: 'Due today', trendUp: false },
    { label: 'Payroll — May', value: '₹42.3L', sub: 'fully processed', icon: 'tabler:cash', color: '#0ea5e9', trend: 'On time', trendUp: true },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>Unit Dashboard</Typography>
          <Typography variant='body2' color='text.secondary'>Unit Admin · Engineering — TechNova Solutions</Typography>
        </Box>
        <Stack direction='row' spacing={1}>
          <Chip label='June 2025' size='small' sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontWeight: 700 }} />
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map(k => <Grid item xs={6} sm={4} md={2} key={k.label}><KPICard {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Daily Attendance — June</Typography>
              <Typography variant='caption' color='text.secondary'>Present vs absent per working day</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <ResponsiveContainer width='100%' height={220}>
                <BarChart data={DAILY_ATT} barCategoryGap='35%' barGap={3}>
                  <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#333' : '#f0f0f0'} vertical={false} />
                  <XAxis dataKey='day' tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey='present' name='Present' fill='#10b981' radius={[4, 4, 0, 0]} />
                  <Bar dataKey='absent' name='Absent/Leave' fill='#f87171' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={4} sx={{ height: '100%' }}>
            <Card sx={{ flex: 1 }}>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Leave Distribution</Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <ResponsiveContainer width='100%' height={100}>
                  <PieChart>
                    <Pie data={LEAVE_DIST} cx='50%' cy='50%' innerRadius={28} outerRadius={48} paddingAngle={3} dataKey='value'>
                      {LEAVE_DIST.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} days`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {LEAVE_DIST.map(l => (
                    <Box key={l.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: l.color }} />
                        <Typography variant='caption' sx={{ fontWeight: 500 }}>{l.name}</Typography>
                      </Box>
                      <Typography variant='caption' sx={{ fontWeight: 700 }}>{l.value}d</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Card>

            <Card sx={{ flex: 1 }}>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Departments</Typography>
              </Box>
              <Box sx={{ px: 3, py: 1 }}>
                {DEPT_SUMMARY.map((d, i) => (
                  <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: i < DEPT_SUMMARY.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                    <Typography variant='caption' sx={{ fontWeight: 600 }}>{d.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant='caption' color='text.secondary'>{d.present}/{d.employees}</Typography>
                      <LinearProgress variant='determinate' value={(d.present / d.employees) * 100}
                        sx={{ width: 50, height: 4, borderRadius: 2, bgcolor: alpha('#10b981', 0.15), '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 2 } }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Pending Leave Requests</Typography>
              <Chip label='3 pending' size='small' sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 700 }} />
            </Box>
            {PENDING_LEAVES.map((l, i) => (
              <Box key={l.name} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < PENDING_LEAVES.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 34, height: 34, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontSize: 13, fontWeight: 800 }}>{l.icon}</Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>{l.name}</Typography>
                      {l.urgent && <Chip label='Urgent' size='small' sx={{ height: 16, fontSize: 10, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 700 }} />}
                    </Box>
                    <Typography variant='caption' color='text.secondary'>{l.dept} · {l.type} · {l.dates} ({l.days}d)</Typography>
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

        <Grid item xs={12} md={6}>
          <Card>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Regularisation Requests</Typography>
              <Chip label='2 pending' size='small' sx={{ bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6', fontWeight: 700 }} />
            </Box>
            {REGULARISATIONS.map((r, i) => (
              <Box key={r.name} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < REGULARISATIONS.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: alpha('#8b5cf6', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon='tabler:clock-edit' fontSize={16} style={{ color: '#8b5cf6' }} />
                  </Box>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{r.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{r.dept} · {r.date} · {r.issue}</Typography>
                  </Box>
                </Box>
                <Chip label={r.status} size='small' sx={{ fontWeight: 700, fontSize: 11,
                  bgcolor: alpha(r.status === 'Approved' ? '#10b981' : '#f59e0b', 0.1),
                  color: r.status === 'Approved' ? '#10b981' : '#f59e0b' }} />
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
