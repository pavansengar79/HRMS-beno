// src/pages/dashboards/analytics/employeeDashboard.js
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
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const ATT_LAST2W = [
  { day: 'May 26', hrs: 8.5 }, { day: 'May 27', hrs: 9.0 }, { day: 'May 28', hrs: 7.5 },
  { day: 'May 29', hrs: 8.0 }, { day: 'May 30', hrs: 8.5 }, { day: 'Jun 2', hrs: 9.0 },
  { day: 'Jun 3', hrs: 8.5 }, { day: 'Jun 4', hrs: 8.0 }, { day: 'Jun 5', hrs: 9.5 },
  { day: 'Jun 8', hrs: 8.0 }, { day: 'Jun 9', hrs: 7.5 },
]
const LEAVE_BALANCE = [
  { type: 'Casual', balance: 4, total: 12, color: '#6366f1' },
  { type: 'Sick', balance: 6, total: 12, color: '#ef4444' },
  { type: 'Earned', balance: 14, total: 24, color: '#10b981' },
  { type: 'Comp-Off', balance: 2, total: 2, color: '#f59e0b' },
]
const LEAVE_HISTORY = [
  { type: 'Earned Leave', dates: 'Apr 14–18', days: 5, status: 'Approved' },
  { type: 'Sick Leave', dates: 'Mar 3', days: 1, status: 'Approved' },
  { type: 'Casual Leave', dates: 'Feb 10', days: 1, status: 'Approved' },
]
const UPCOMING_HOLIDAYS = [
  { name: 'Eid Al-Adha', date: 'Jun 17 (Tue)', optional: true },
  { name: 'Independence Day', date: 'Aug 15 (Fri)', optional: false },
  { name: 'Ganesh Chaturthi', date: 'Aug 27 (Wed)', optional: false },
]
const PAYSLIPS = [
  { month: 'May 2025', gross: '₹92,400', net: '₹78,340', status: 'Ready' },
  { month: 'Apr 2025', gross: '₹92,400', net: '₹78,340', status: 'Ready' },
  { month: 'Mar 2025', gross: '₹90,000', net: '₹76,200', status: 'Ready' },
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
      {payload.map((p, i) => <Typography key={i} variant='caption' sx={{ display: 'block', color: p.color }}>{p.name}: <strong>{p.value}h</strong></Typography>)}
    </Box>
  )
}

export default function EmployeeDashboard() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const KPIS = [
    { label: 'Days Present (Jun)', value: '9/9', sub: 'Full attendance streak', icon: 'tabler:circle-check', color: '#10b981', trend: '100%', trendUp: true },
    { label: 'Leave Balance', value: '26d', sub: 'across all types', icon: 'tabler:calendar-check', color: '#6366f1', trend: '7d used YTD', trendUp: null },
    { label: 'Next Payday', value: 'Jun 30', sub: 'Est. ₹78,340 net', icon: 'tabler:wallet', color: '#0ea5e9', trend: '21 days', trendUp: null },
    { label: "Today's Shift", value: 'General', sub: '09:00 – 18:00', icon: 'tabler:clock', color: '#8b5cf6', trend: 'In office', trendUp: null },
    { label: 'Pending Regularisation', value: '0', sub: 'all up to date', icon: 'tabler:clock-check', color: '#f59e0b', trend: 'All clear', trendUp: true },
    { label: 'YTD Earnings', value: '₹5.6L', sub: '6 months processed', icon: 'tabler:cash', color: '#ef4444', trend: 'On track', trendUp: true },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>My Workspace</Typography>
          <Typography variant='body2' color='text.secondary'>Arjun Mehta · Senior Developer · Backend · Engineering Unit</Typography>
        </Box>
        <Chip icon={<Icon icon='tabler:flame' fontSize={14} />} label='9-day streak!' size='small' sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 700 }} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map(k => <Grid item xs={6} sm={4} md={2} key={k.label}><KPICard {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>My Hours — Last 2 Weeks</Typography>
              <Typography variant='caption' color='text.secondary'>Daily working hours (standard: 8 hrs)</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <ResponsiveContainer width='100%' height={220}>
                <BarChart data={ATT_LAST2W} barCategoryGap='35%'>
                  <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#333' : '#f0f0f0'} vertical={false} />
                  <XAxis dataKey='day' tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 11]} />
                  <Tooltip content={<CTooltip />} />
                  <Bar dataKey='hrs' name='Hours worked' fill='#6366f1' radius={[5, 5, 0, 0]}
                    label={false}
                    maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Leave Balance</Typography>
              <Typography variant='caption' color='text.secondary'>Available vs used</Typography>
            </Box>
            <Box sx={{ px: 4, py: 3 }}>
              {LEAVE_BALANCE.map(l => (
                <Box key={l.type} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant='caption' sx={{ fontWeight: 700 }}>{l.type}</Typography>
                    <Typography variant='caption' sx={{ fontWeight: 800, color: l.color }}>{l.balance}d left</Typography>
                  </Box>
                  <LinearProgress variant='determinate' value={(l.balance / l.total) * 100}
                    sx={{ height: 8, borderRadius: 4, bgcolor: alpha(l.color, 0.12), '& .MuiLinearProgress-bar': { bgcolor: l.color, borderRadius: 4 } }} />
                  <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 0.5 }}>{l.total - l.balance}d used of {l.total}d total</Typography>
                </Box>
              ))}
              <Button variant='outlined' fullWidth size='small' startIcon={<Icon icon='tabler:plus' />} sx={{ mt: 1 }}>
                Apply for Leave
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Recent Payslips</Typography>
            </Box>
            {PAYSLIPS.map((p, i) => (
              <Box key={p.month} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < PAYSLIPS.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha('#0ea5e9', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon='tabler:file-invoice' fontSize={18} style={{ color: '#0ea5e9' }} />
                  </Box>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{p.month}</Typography>
                    <Typography variant='caption' color='text.secondary'>Gross: {p.gross} · Net: {p.net}</Typography>
                  </Box>
                </Box>
                <Button size='small' variant='outlined' startIcon={<Icon icon='tabler:download' fontSize={13} />} sx={{ height: 26, fontSize: 10 }}>PDF</Button>
              </Box>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Leave History</Typography>
            </Box>
            {LEAVE_HISTORY.map((l, i) => (
              <Box key={i} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < LEAVE_HISTORY.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: alpha('#6366f1', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon='tabler:calendar-user' fontSize={15} style={{ color: '#6366f1' }} />
                  </Box>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{l.type}</Typography>
                    <Typography variant='caption' color='text.secondary'>{l.dates} · {l.days}d</Typography>
                  </Box>
                </Box>
                <Chip label={l.status} size='small' sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700, fontSize: 11 }} />
              </Box>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Upcoming Holidays</Typography>
            </Box>
            <Box sx={{ px: 3, py: 2 }}>
              {UPCOMING_HOLIDAYS.map((h, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, borderBottom: i < UPCOMING_HOLIDAYS.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(h.optional ? '#f59e0b' : '#10b981', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon='tabler:calendar-event' fontSize={17} style={{ color: h.optional ? '#f59e0b' : '#10b981' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{h.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{h.date}</Typography>
                  </Box>
                  {h.optional && <Chip label='Optional' size='small' sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 700, fontSize: 10 }} />}
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
