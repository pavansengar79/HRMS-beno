// src/pages/dashboards/analytics/employeeDashboard.js
// REAL API — GET /api/v1/dashboard/employee?month=YYYY-MM
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEmployeeDashboard } from 'src/store/dashboard/dashboardSlice'
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
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import CustomTextField from 'src/@core/components/mui/text-field'
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

const STATUS_COLOR = { APPROVED: '#10b981', PENDING: '#f59e0b', REJECTED: '#ef4444', UNDER_REVIEW: '#6366f1' }

const MONTH_OPTIONS = (() => {
  const opts = []; const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    opts.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return opts
})()

export default function EmployeeDashboard() {
  const dispatch = useDispatch()
  const theme = useTheme(); const isDark = theme.palette.mode === 'dark'
  const { data, loading, error } = useSelector(s => s.dashboard)
  const now = new Date()
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

  useEffect(() => { dispatch(fetchEmployeeDashboard(month)) }, [dispatch, month])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
  if (error)   return <Alert severity='error' sx={{ m: 4 }}>{String(error)}</Alert>
  if (!data)   return null

  const emp       = data.employee    || {}
  const today     = data.today       || {}
  const att       = data.attendance  || {}
  const balances  = data.leaveBalances || []
  const leaves    = data.recentLeaves  || []
  const holidays  = data.upcomingHolidays || []

  const totalRemaining = balances.reduce((a, b) => a + (b.remaining || 0), 0)
  const totalUsed      = balances.reduce((a, b) => a + (b.used      || 0), 0)

  const KPIS = [
    { label: `Days Present (${month.split('-')[1]})`, value: att.present, sub: `${att.absent ?? 0} absent · ${att.late ?? 0} late`, icon: 'tabler:circle-check', color: '#10b981', trend: att.daysInMonth ? `${Math.round((att.present / att.daysInMonth) * 100)}%` : null, trendUp: true },
    { label: 'Leave Balance',   value: `${totalRemaining}d`, sub: `${totalUsed}d used YTD`, icon: 'tabler:calendar-check', color: '#6366f1' },
    { label: 'Working Hours',   value: `${att.totalWorkingHours ?? 0}h`, sub: `${att.totalOvertimeHours ?? 0}h overtime`, icon: 'tabler:clock', color: '#0ea5e9' },
    { label: 'Today Status',    value: today.status || (today.hasPunchedIn ? 'Punched In' : 'Not Punched'), sub: today.isLate ? `${today.lateMinutes ?? 0} min late` : 'On time', icon: 'tabler:user-check', color: '#8b5cf6', trend: today.isWFH ? 'WFH' : null },
    { label: 'Half Days',       value: att.halfDay ?? 0, sub: 'this month', icon: 'tabler:circle-half', color: '#f59e0b' },
    { label: 'WFH Days',        value: att.wfh ?? 0, sub: 'this month', icon: 'tabler:home-check', color: '#10b981' },
  ]

  const attBarData = [
    { name: 'Present', value: att.present ?? 0 },
    { name: 'Absent',  value: att.absent  ?? 0 },
    { name: 'Late',    value: att.late    ?? 0 },
    { name: 'Leave',   value: att.onLeave ?? 0 },
    { name: 'WFH',     value: att.wfh     ?? 0 },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>My Workspace</Typography>
          <Typography variant='body2' color='text.secondary'>
            {emp.name} · {emp.designation || ''} · {emp.department || ''}
          </Typography>
        </Box>
        <Stack direction='row' spacing={2} alignItems='center'>
          {today.hasPunchedIn && !today.hasPunchedOut && (
            <Chip icon={<Icon icon='tabler:circle-filled' fontSize={10} />} label='Live' size='small'
              sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700 }} />
          )}
          <CustomTextField select value={month} onChange={e => setMonth(e.target.value)} size='small' sx={{ minWidth: 140 }}>
            {MONTH_OPTIONS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </CustomTextField>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map(k => <Grid item xs={6} sm={4} md={2} key={k.label}><KPICard {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Attendance — {month}</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <ResponsiveContainer width='100%' height={220}>
                <BarChart data={attBarData} barCategoryGap='35%'>
                  <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#333' : '#f0f0f0'} vertical={false} />
                  <XAxis dataKey='name' tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CTooltip />} />
                  <Bar dataKey='value' name='Days' fill='#6366f1' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Leave Balance</Typography>
              <Typography variant='caption' color='text.secondary'>Available vs used</Typography>
            </Box>
            <Box sx={{ px: 4, py: 3 }}>
              {balances.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>No leave balance data</Typography>
              ) : balances.map(lb => (
                <Box key={lb.leaveType || lb.code} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant='caption' sx={{ fontWeight: 700 }}>{lb.leaveType} ({lb.code})</Typography>
                    <Typography variant='caption' sx={{ fontWeight: 800, color: lb.color || '#6366f1' }}>{lb.remaining}d left</Typography>
                  </Box>
                  <LinearProgress variant='determinate' value={lb.totalAllocated > 0 ? (lb.remaining / lb.totalAllocated) * 100 : 0}
                    sx={{ height: 8, borderRadius: 4, bgcolor: alpha(lb.color || '#6366f1', 0.12), '& .MuiLinearProgress-bar': { bgcolor: lb.color || '#6366f1', borderRadius: 4 } }} />
                  <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 0.5 }}>{lb.used}d used · {lb.pending}d pending · {lb.totalAllocated}d total</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Recent Leaves</Typography>
            </Box>
            {leaves.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>No leave history</Typography></Box>
            ) : leaves.map((l, i) => (
              <Box key={l.id} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < leaves.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: alpha('#6366f1', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon='tabler:calendar-user' fontSize={15} style={{ color: '#6366f1' }} />
                  </Box>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{l.leaveType?.name} ({l.leaveType?.code})</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {new Date(l.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – {new Date(l.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {l.totalDays}d
                    </Typography>
                  </Box>
                </Box>
                <Chip label={l.status} size='small' sx={{ bgcolor: alpha(STATUS_COLOR[l.status] || '#6366f1', 0.1), color: STATUS_COLOR[l.status] || '#6366f1', fontWeight: 700, fontSize: 11 }} />
              </Box>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Upcoming Holidays</Typography>
            </Box>
            {holidays.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>No upcoming holidays</Typography></Box>
            ) : holidays.map((h, i) => (
              <Box key={h.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, px: 4, borderBottom: i < holidays.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(h.type === 'OPTIONAL' ? '#f59e0b' : '#10b981', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon icon='tabler:calendar-event' fontSize={17} style={{ color: h.type === 'OPTIONAL' ? '#f59e0b' : '#10b981' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>{h.name}</Typography>
                  <Typography variant='caption' color='text.secondary'>{new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Typography>
                </Box>
                {h.type === 'OPTIONAL' && <Chip label='Optional' size='small' sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 700, fontSize: 10 }} />}
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
