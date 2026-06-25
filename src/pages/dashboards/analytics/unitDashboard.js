// src/pages/dashboards/analytics/unitDashboard.js
// REAL API — GET /api/v1/dashboard/unit?month=YYYY-MM
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUnitDashboard } from 'src/store/dashboard/dashboardSlice'
import { updateLeaveStatus } from 'src/store/leaves/leaveSlice'
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
import toast from 'react-hot-toast'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

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

const MONTH_OPTIONS = (() => {
  const opts = []; const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    opts.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return opts
})()

export default function UnitDashboard() {
  const dispatch = useDispatch()
  const theme = useTheme(); const isDark = theme.palette.mode === 'dark'
  const { data, loading, error } = useSelector(s => s.dashboard)
  const now = new Date()
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

  useEffect(() => { dispatch(fetchUnitDashboard(month)) }, [dispatch, month])

  const handleLeaveAction = async (id, status) => {
    try {
      await dispatch(updateLeaveStatus({ id, status, remarks: `${status} from dashboard` })).unwrap()
      toast.success(`Leave ${status.toLowerCase()}`)
      dispatch(fetchUnitDashboard(month))
    } catch (e) { toast.error(String(e)) }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
  if (error)   return <Alert severity='error' sx={{ m: 4 }}>{String(error)}</Alert>
  if (!data)   return null

  const users       = data.users        || {}
  const employees   = data.employees    || {}
  const depts       = data.departments  || {}
  const desigs      = data.designations || {}
  const todayAtt    = data.todayAttendance    || {}
  const monthlyAtt  = data.monthlyAttendance  || {}
  const pendLeaves  = data.pendingLeaves      || []
  const holidays    = data.upcomingHolidays   || []

  const KPIS = [
    { label: 'Team Size',         value: employees.total ?? users.total, sub: `${depts.total ?? 0} departments`, icon: 'tabler:users', color: '#6366f1', trend: 'Stable', trendUp: true },
    { label: 'Present Today',     value: todayAtt.present, sub: `${todayAtt.absent ?? 0} absent`, icon: 'tabler:clock-check', color: '#10b981', trend: `${todayAtt.attendanceRate ?? 0}%`, trendUp: true },
    { label: 'On Leave Today',    value: todayAtt.onLeave, sub: 'approved leaves', icon: 'tabler:calendar-off', color: '#f59e0b' },
    { label: 'Pending Leaves',    value: data.pendingLeaveCount ?? pendLeaves.length, sub: 'awaiting approval', icon: 'tabler:calendar-user', color: '#ef4444', trend: 'Review now', trendUp: false },
    { label: 'Late Today',        value: todayAtt.late, sub: 'late arrivals', icon: 'tabler:clock-minus', color: '#8b5cf6' },
    { label: 'WFH Today',         value: todayAtt.wfh, sub: 'working from home', icon: 'tabler:home-check', color: '#0ea5e9' },
  ]

  const attChartData = [
    { name: 'Present', value: todayAtt.present ?? 0, color: '#10b981' },
    { name: 'Absent',  value: todayAtt.absent  ?? 0, color: '#ef4444' },
    { name: 'On Leave',value: todayAtt.onLeave  ?? 0, color: '#f59e0b' },
    { name: 'WFH',     value: todayAtt.wfh      ?? 0, color: '#0ea5e9' },
    { name: 'Late',    value: todayAtt.late     ?? 0, color: '#8b5cf6' },
  ].filter(d => d.value > 0)

  const monthBarData = [
    { name: 'Present', value: monthlyAtt.present ?? 0 },
    { name: 'Absent',  value: monthlyAtt.absent  ?? 0 },
    { name: 'Leave',   value: monthlyAtt.onLeave  ?? 0 },
    { name: 'Late',    value: monthlyAtt.late     ?? 0 },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>Unit Dashboard</Typography>
          <Typography variant='body2' color='text.secondary'>Unit Admin · Team Overview</Typography>
        </Box>
        <CustomTextField select value={month} onChange={e => setMonth(e.target.value)} size='small' sx={{ minWidth: 140 }}>
          {MONTH_OPTIONS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
        </CustomTextField>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map(k => <Grid item xs={6} sm={4} md={2} key={k.label}><KPICard {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Monthly Attendance — {month}</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <ResponsiveContainer width='100%' height={220}>
                <BarChart data={monthBarData} barCategoryGap='35%'>
                  <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#333' : '#f0f0f0'} vertical={false} />
                  <XAxis dataKey='name' tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CTooltip />} />
                  <Bar dataKey='value' name='Count' fill='#6366f1' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <Stack direction='row' spacing={3} sx={{ mt: 2, justifyContent: 'center' }}>
                <Typography variant='caption' color='text.secondary'>Total Working Hours: <strong>{monthlyAtt.totalWorkingHours ?? 0}h</strong></Typography>
                <Typography variant='caption' color='text.secondary'>Overtime: <strong>{monthlyAtt.totalOvertimeHours ?? 0}h</strong></Typography>
              </Stack>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={4}>
            <Card>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Today's Attendance</Typography>
                <Typography variant='caption' color='text.secondary'>Attendance rate: <strong>{todayAtt.attendanceRate ?? 0}%</strong></Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                {attChartData.length > 0 ? (
                  <ResponsiveContainer width='100%' height={100}>
                    <PieChart>
                      <Pie data={attChartData} cx='50%' cy='50%' innerRadius={28} outerRadius={48} paddingAngle={3} dataKey='value'>
                        {attChartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v}`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}><Typography variant='body2' color='text.secondary'>No attendance data today</Typography></Box>
                )}
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {attChartData.map(d => (
                    <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.color }} />
                        <Typography variant='caption' sx={{ fontWeight: 500 }}>{d.name}</Typography>
                      </Box>
                      <Typography variant='caption' sx={{ fontWeight: 700 }}>{d.value}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Card>

            <Card>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Upcoming Holidays</Typography>
              </Box>
              {holidays.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>No upcoming holidays</Typography></Box>
              ) : holidays.map((h, i) => (
                <Box key={h.id} sx={{ px: 4, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, borderBottom: i < holidays.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <Icon icon='tabler:calendar-event' fontSize={15} style={{ color: '#10b981' }} />
                  <Box>
                    <Typography variant='caption' sx={{ fontWeight: 600, display: 'block' }}>{h.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Typography>
                  </Box>
                </Box>
              ))}
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Card>
        <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Pending Leave Requests</Typography>
          <Chip label={`${data.pendingLeaveCount ?? pendLeaves.length} pending`} size='small' sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 700 }} />
        </Box>
        {pendLeaves.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>No pending leave requests</Typography></Box>
        ) : pendLeaves.map((l, i) => (
          <Box key={l.id} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < pendLeaves.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontSize: 13, fontWeight: 800 }}>
                {(l.employee?.name || '?').charAt(0)}
              </Avatar>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>{l.employee?.name}</Typography>
                <Typography variant='caption' color='text.secondary'>
                  {l.leaveType?.name} · {new Date(l.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – {new Date(l.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} ({l.totalDays}d)
                </Typography>
              </Box>
            </Box>
            <Stack direction='row' spacing={1}>
              <Button size='small' variant='contained' color='success' sx={{ height: 26, fontSize: 10, minWidth: 56 }}
                onClick={() => handleLeaveAction(l.id, 'APPROVED')}>Approve</Button>
              <Button size='small' variant='outlined' color='error' sx={{ height: 26, fontSize: 10, minWidth: 56 }}
                onClick={() => handleLeaveAction(l.id, 'REJECTED')}>Reject</Button>
            </Stack>
          </Box>
        ))}
      </Card>
    </Box>
  )
}
