// src/pages/dashboards/analytics/organisationDashboard.js
import { useTheme, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import Icon from 'src/@core/components/icon'
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const HC_BY_COMPANY = [
  { company: 'TechNova', employees: 342, units: 4 },
  { company: 'Meridian', employees: 187, units: 2 },
  { company: 'SkyBridge', employees: 94, units: 1 },
  { company: 'BlueLeaf', employees: 218, units: 3 },
]
const HC_TREND = [
  { month: 'Jan', total: 1047 }, { month: 'Feb', total: 1082 },
  { month: 'Mar', total: 1098 }, { month: 'Apr', total: 1130 },
  { month: 'May', total: 1198 }, { month: 'Jun', total: 1247 },
]
const LEAVE_TYPE = [
  { name: 'Casual', value: 34, color: '#6366f1' },
  { name: 'Sick', value: 18, color: '#ef4444' },
  { name: 'Earned', value: 29, color: '#10b981' },
  { name: 'LOP', value: 8, color: '#f59e0b' },
]
const COMPANIES = [
  { name: 'TechNova Solutions', units: 4, employees: 342, compliance: 97, lastPayroll: 'Jun 01', status: 'Active' },
  { name: 'Meridian Corp', units: 2, employees: 187, compliance: 94, lastPayroll: 'Jun 01', status: 'Active' },
  { name: 'SkyBridge Infra', units: 1, employees: 94, compliance: 89, lastPayroll: 'May 31', status: 'Active' },
  { name: 'BlueLeaf Finance', units: 3, employees: 218, compliance: 99, lastPayroll: 'Jun 01', status: 'Active' },
]
const ALERTS = [
  { icon: 'tabler:alert-circle', color: '#ef4444', text: 'SkyBridge compliance at 89% — 3 policies missing', time: '1d ago' },
  { icon: 'tabler:calendar-event', color: '#f59e0b', text: 'Next payroll cycle due June 30 for all companies', time: '3d ago' },
  { icon: 'tabler:users', color: '#10b981', text: '49 new employees onboarded this month', time: '4d ago' },
  { icon: 'tabler:check', color: '#10b981', text: 'Meridian Corp completed ESIC registration', time: '5d ago' },
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
      {payload.map((p, i) => (
        <Typography key={i} variant='caption' sx={{ display: 'block', color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </Typography>
      ))}
    </Box>
  )
}

export default function OrganisationDashboard() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const KPIS = [
    { label: 'Total Employees', value: '1,247', sub: 'across 4 companies', icon: 'tabler:users', color: '#6366f1', trend: '+49 MTD', trendUp: true },
    { label: 'Companies', value: '4', sub: 'all active', icon: 'tabler:building-skyscraper', color: '#0ea5e9', trend: 'All active', trendUp: true },
    { label: 'Business Units', value: '10', sub: '3 companies reporting', icon: 'tabler:building-community', color: '#10b981', trend: '+1 this month', trendUp: true },
    { label: 'Compliance Rate', value: '94%', sub: 'across all entities', icon: 'tabler:shield-check', color: '#8b5cf6', trend: '+2% MoM', trendUp: true },
    { label: 'Active Leaves', value: '89', sub: 'pending + approved', icon: 'tabler:calendar-user', color: '#f59e0b', trend: '23 pending', trendUp: null },
    { label: 'Payroll Processed', value: '₹1.2Cr', sub: 'last cycle (May)', icon: 'tabler:cash', color: '#ef4444', trend: 'On time', trendUp: true },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>Organisation Overview</Typography>
          <Typography variant='body2' color='text.secondary'>Org Admin · Multi-company consolidated view</Typography>
        </Box>
        <Chip label='4 Companies Active' size='small' sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700 }} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map(k => <Grid item xs={6} sm={4} md={2} key={k.label}><KPICard {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Headcount by Company</Typography>
              <Typography variant='caption' color='text.secondary'>Total employees per entity</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <ResponsiveContainer width='100%' height={220}>
                <BarChart data={HC_BY_COMPANY} barCategoryGap='30%'>
                  <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#333' : '#f0f0f0'} vertical={false} />
                  <XAxis dataKey='company' tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CTooltip />} />
                  <Bar dataKey='employees' name='Employees' fill='#6366f1' radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={4} sx={{ height: '100%' }}>
            <Card sx={{ flex: 1 }}>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Headcount Trend</Typography>
                <Typography variant='caption' color='text.secondary'>Total org headcount (6M)</Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <ResponsiveContainer width='100%' height={110}>
                  <AreaChart data={HC_TREND}>
                    <defs>
                      <linearGradient id='ohcG' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey='month' tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip content={<CTooltip />} />
                    <Area type='monotone' dataKey='total' name='Total' stroke='#10b981' fill='url(#ohcG)' strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card>

            <Card sx={{ flex: 1 }}>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Leave Distribution</Typography>
              </Box>
              <Box sx={{ px: 4, py: 2 }}>
                {LEAVE_TYPE.map(lt => (
                  <Box key={lt.name} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant='caption' sx={{ fontWeight: 600 }}>{lt.name}</Typography>
                      <Typography variant='caption' color='text.secondary'>{lt.value}</Typography>
                    </Box>
                    <LinearProgress variant='determinate' value={(lt.value / 89) * 100}
                      sx={{ height: 5, borderRadius: 3, bgcolor: alpha(lt.color, 0.15), '& .MuiLinearProgress-bar': { bgcolor: lt.color, borderRadius: 3 } }} />
                  </Box>
                ))}
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Company Summary</Typography>
            </Box>
            {COMPANIES.map((c, i) => (
              <Box key={c.name} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < COMPANIES.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontSize: 14, fontWeight: 800 }}>{c.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{c.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{c.units} units · {c.employees} employees · Last payroll: {c.lastPayroll}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant='caption' color='text.secondary'>Compliance</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: c.compliance >= 95 ? '#10b981' : c.compliance >= 90 ? '#f59e0b' : '#ef4444' }}>{c.compliance}%</Typography>
                  </Box>
                  <Chip label={c.status} size='small' sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 600 }} />
                </Box>
              </Box>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Alerts &amp; Activity</Typography>
            </Box>
            <Box sx={{ px: 3, py: 1 }}>
              {ALERTS.map((a, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, py: 2, borderBottom: i < ALERTS.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: alpha(a.color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon icon={a.icon} fontSize={15} style={{ color: a.color }} />
                  </Box>
                  <Box>
                    <Typography variant='caption' sx={{ fontWeight: 500, display: 'block', lineHeight: 1.4 }}>{a.text}</Typography>
                    <Typography variant='caption' color='text.disabled'>{a.time}</Typography>
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
