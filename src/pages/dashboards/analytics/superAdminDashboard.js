// src/pages/dashboards/analytics/superAdminDashboard.js
import { useTheme, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// ─── Hardcoded Data ───────────────────────────────────────────────────────────
const GROWTH_DATA = [
  { month: 'Jul', users: 45, orgs: 1 },  { month: 'Aug', users: 52, orgs: 1 },
  { month: 'Sep', users: 89, orgs: 2 },  { month: 'Oct', users: 97, orgs: 1 },
  { month: 'Nov', users: 143, orgs: 2 }, { month: 'Dec', users: 112, orgs: 1 },
  { month: 'Jan', users: 187, orgs: 3 }, { month: 'Feb', users: 134, orgs: 1 },
  { month: 'Mar', users: 198, orgs: 2 }, { month: 'Apr', users: 215, orgs: 2 },
  { month: 'May', users: 264, orgs: 3 }, { month: 'Jun', users: 247, orgs: 2 },
]
const PLAN_DATA = [
  { name: 'Starter', value: 4, color: '#0ea5e9' },
  { name: 'Teams', value: 5, color: '#6366f1' },
  { name: 'Enterprise', value: 3, color: '#10b981' },
]
const RECENT_ORGS = [
  { name: 'TechNova Solutions', plan: 'Enterprise', users: 342, companies: 4, status: 'Active', since: 'Jan 2025' },
  { name: 'Meridian Corp', plan: 'Teams', users: 124, companies: 2, status: 'Active', since: 'Feb 2025' },
  { name: 'SkyBridge Infra', plan: 'Teams', users: 87, companies: 1, status: 'Active', since: 'Mar 2025' },
  { name: 'Orbit Digital', plan: 'Starter', users: 34, companies: 1, status: 'Trial', since: 'May 2025' },
  { name: 'BlueLeaf Finance', plan: 'Enterprise', users: 218, companies: 3, status: 'Active', since: 'Jun 2024' },
]
const EVENTS = [
  { icon: 'tabler:building-skyscraper', color: '#6366f1', text: 'Meridian Corp activated Enterprise trial', time: '2h ago' },
  { icon: 'tabler:users', color: '#10b981', text: '184 new users onboarded this month', time: '4h ago' },
  { icon: 'tabler:credit-card', color: '#f59e0b', text: 'SkyBridge upgraded to Teams plan', time: '1d ago' },
  { icon: 'tabler:alert-triangle', color: '#ef4444', text: 'High API usage detected on Orbit Digital', time: '2d ago' },
  { icon: 'tabler:check', color: '#10b981', text: 'System maintenance completed — all clear', time: '3d ago' },
]
const STORAGE = [
  { name: 'Database', used: 68, total: 400, color: '#6366f1' },
  { name: 'File Storage', used: 41, total: 500, color: '#0ea5e9' },
  { name: 'Logs', used: 15, total: 100, color: '#f59e0b' },
]

// ─── Shared Components ────────────────────────────────────────────────────────
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

const ChartCard = ({ title, sub, children }) => (
  <Card sx={{ height: '100%' }}>
    <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>{title}</Typography>
      {sub && <Typography variant='caption' color='text.secondary'>{sub}</Typography>}
    </Box>
    <Box sx={{ p: 3 }}>{children}</Box>
  </Card>
)

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

// ─── Main ─────────────────────────────────────────────────────────────────────
const PLAN_COLOR = { Starter: '#0ea5e9', Teams: '#6366f1', Enterprise: '#10b981', Trial: '#f59e0b' }

export default function SuperAdminDashboard() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const KPIS = [
    { label: 'Total Organisations', value: '12', sub: '10 active · 2 trial', icon: 'tabler:building-skyscraper', color: '#6366f1', trend: '+2 QoQ', trendUp: true },
    { label: 'Active Users', value: '2,847', sub: 'across all orgs', icon: 'tabler:users', color: '#0ea5e9', trend: '+184 MTD', trendUp: true },
    { label: 'MRR', value: '₹4.2L', sub: 'monthly recurring revenue', icon: 'tabler:cash', color: '#10b981', trend: '+8.4%', trendUp: true },
    { label: 'System Uptime', value: '99.7%', sub: '2.1 hrs downtime / 30d', icon: 'tabler:server', color: '#f59e0b', trend: 'SLA met', trendUp: true },
    { label: 'Open Tickets', value: '5', sub: '3 critical · 2 low', icon: 'tabler:ticket', color: '#ef4444', trend: '-3 vs last wk', trendUp: true },
    { label: 'Storage Used', value: '124 GB', sub: 'of 1 TB provisioned', icon: 'tabler:database', color: '#8b5cf6', trend: '12.4%', trendUp: null },
  ]

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>Platform Overview</Typography>
          <Typography variant='body2' color='text.secondary'>Super Admin · All Organisations</Typography>
        </Box>
        <Stack direction='row' spacing={1}>
          <Chip icon={<Icon icon='tabler:check' fontSize={14} />} label='All Systems Normal' size='small'
            sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700 }} />
        </Stack>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map(k => <Grid item xs={6} sm={4} md={2} key={k.label}><KPICard {...k} /></Grid>)}
      </Grid>

      {/* Charts row */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <ChartCard title='Platform Growth' sub='New users and organisations per month (12M)'>
            <ResponsiveContainer width='100%' height={230}>
              <AreaChart data={GROWTH_DATA}>
                <defs>
                  <linearGradient id='sgU' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#6366f1' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#6366f1' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='sgO' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#333' : '#f0f0f0'} />
                <XAxis dataKey='month' tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area type='monotone' dataKey='users' name='New Users' stroke='#6366f1' fill='url(#sgU)' strokeWidth={2} dot={false} />
                <Area type='monotone' dataKey='orgs' name='New Orgs' stroke='#10b981' fill='url(#sgO)' strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <ChartCard title='Plan Distribution' sub='Active organisations by plan tier'>
            <ResponsiveContainer width='100%' height={140}>
              <PieChart>
                <Pie data={PLAN_DATA} cx='50%' cy='50%' innerRadius={40} outerRadius={65} paddingAngle={4} dataKey='value'>
                  {PLAN_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} orgs`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {PLAN_DATA.map(p => (
                <Box key={p.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: p.color }} />
                    <Typography variant='caption' sx={{ fontWeight: 600 }}>{p.name}</Typography>
                  </Box>
                  <Typography variant='caption' sx={{ fontWeight: 800 }}>{p.value}</Typography>
                </Box>
              ))}
            </Stack>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Table + Activity + Storage */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Organisations</Typography>
              <Chip label='12 total' size='small' color='primary' variant='outlined' />
            </Box>
            {RECENT_ORGS.map((org, i) => (
              <Box key={org.name} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < RECENT_ORGS.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(PLAN_COLOR[org.plan] || '#6366f1', 0.12), color: PLAN_COLOR[org.plan] || '#6366f1', fontSize: 14, fontWeight: 800 }}>
                    {org.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{org.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{org.companies} compan{org.companies !== 1 ? 'ies' : 'y'} · {org.users} users · since {org.since}</Typography>
                  </Box>
                </Box>
                <Stack direction='row' spacing={1}>
                  <Chip label={org.plan} size='small' sx={{ fontSize: 11, fontWeight: 700, bgcolor: alpha(PLAN_COLOR[org.plan] || '#6366f1', 0.1), color: PLAN_COLOR[org.plan] || '#6366f1' }} />
                  <Chip label={org.status} size='small' sx={{ fontSize: 11, fontWeight: 700, bgcolor: alpha(org.status === 'Active' ? '#10b981' : '#f59e0b', 0.1), color: org.status === 'Active' ? '#10b981' : '#f59e0b' }} />
                </Stack>
              </Box>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={4}>
            {/* Events */}
            <Card>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Platform Events</Typography>
              </Box>
              <Box sx={{ px: 3, py: 1 }}>
                {EVENTS.map((ev, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, py: 2, borderBottom: i < EVENTS.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: alpha(ev.color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon icon={ev.icon} fontSize={15} style={{ color: ev.color }} />
                    </Box>
                    <Box>
                      <Typography variant='caption' sx={{ fontWeight: 500, display: 'block', lineHeight: 1.4 }}>{ev.text}</Typography>
                      <Typography variant='caption' color='text.disabled'>{ev.time}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>

            {/* Storage */}
            <Card>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Infrastructure Usage</Typography>
              </Box>
              <Box sx={{ px: 4, py: 3 }}>
                <Stack spacing={3}>
                  {STORAGE.map(s => (
                    <Box key={s.name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography variant='caption' sx={{ fontWeight: 600 }}>{s.name}</Typography>
                        <Typography variant='caption' color='text.secondary'>{s.used} / {s.total} GB</Typography>
                      </Box>
                      <LinearProgress variant='determinate' value={(s.used / s.total) * 100}
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
