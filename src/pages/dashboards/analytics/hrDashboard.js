// src/pages/dashboards/analytics/hrDashboard.js
// HR Manager Dashboard — Comprehensive view matching Admin Dashboard style
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { fetchHRDashboard } from 'src/store/dashboard/dashboardSlice'
import { updateLeaveStatus } from 'src/store/leaves/leaveSlice'
import { selectUnit } from 'src/store/auth/authSlice'
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
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'

const KPICard = ({ label, value, sub, icon, color, trend, trendUp, onClick }) => {
  const theme = useTheme(); const isDark = theme.palette.mode === 'dark'
  return (
    <Card 
      sx={{ 
        overflow: 'hidden', 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 4
        } : {}
      }}
      onClick={onClick}
    >
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

export default function HRDashboard({ companyId, unitId }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const theme = useTheme(); const isDark = theme.palette.mode === 'dark'
  const unit = useSelector(selectUnit)
  const { data, loading, error } = useSelector(s => s.dashboard)
  const user = useSelector(s => s.auth.user)
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  useEffect(() => { 
    dispatch(fetchHRDashboard({ month, companyId, unitId })) 
  }, [dispatch, month, companyId, unitId])

  const handleLeaveAction = async (id, status) => {
    try {
      await dispatch(updateLeaveStatus({ id, status, remarks: `${status} from dashboard` })).unwrap()
      toast.success(`Leave ${status.toLowerCase()}`)
      dispatch(fetchHRDashboard({ month, companyId, unitId }))
    } catch (e) { 
      toast.error(String(e)) 
    }
  }

  const navigateTo = (path, query = {}) => {
    const queryString = new URLSearchParams(query).toString()
    router.push(queryString ? `${path}?${queryString}` : path)
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
  if (error)   return <Alert severity='error' sx={{ m: 4 }}>{String(error)}</Alert>
  if (!data)   return null

  const users         = data.users        || {}
  const employees     = data.employees    || {}
  const depts         = data.departments  || {}
  const desigs        = data.designations || {}
  const todayAtt      = data.todayAttendance    || {}
  const monthlyAtt    = data.monthlyAttendance  || {}
  const pendLeaves    = data.pendingLeaves      || []
  const holidays      = data.upcomingHolidays   || []
  const recentUsers   = data.recentUsers        || []
  const rolesData     = data.roles              || {}
  const generatedAt   = data.generatedAt        || null

  const KPIS = [
    { 
      label: 'Total Employees', 
      value: employees.total?.toLocaleString('en-IN') || '0', 
      sub: `across ${depts.total ?? 0} departments`, 
      icon: 'tabler:users', 
      color: '#6366f1',
      onClick: () => navigateTo('/employees')
    },
    { 
      label: 'Present Today', 
      value: todayAtt.present || 0, 
      sub: `${todayAtt.attendanceRate || 0}% attendance`, 
      icon: 'tabler:circle-check', 
      color: '#10b981',
      trend: todayAtt.late > 0 ? `${todayAtt.late} late` : null,
      trendUp: true,
      onClick: () => navigateTo('/attendance/team', { dateRangePreset: 'today', filterStatus: 'PRESENT' })
    },
    { 
      label: 'Absent Today', 
      value: todayAtt.absent || 0, 
      sub: `${todayAtt.onLeave || 0} on leave`, 
      icon: 'tabler:circle-x', 
      color: '#ef4444',
      onClick: () => navigateTo('/attendance/team', { dateRangePreset: 'today', filterStatus: 'ABSENT' })
    },
    { 
      label: 'Pending Leaves', 
      value: pendLeaves.length, 
      sub: 'awaiting approval', 
      icon: 'tabler:clock', 
      color: '#f59e0b',
      trend: pendLeaves.length > 5 ? 'Action needed' : null,
      trendUp: false,
      onClick: () => navigateTo('/leaves/requests', { status: 'PENDING' })
    },
    { 
      label: 'Departments', 
      value: depts.total, 
      sub: 'active units', 
      icon: 'tabler:sitemap', 
      color: '#0ea5e9',
      onClick: () => navigateTo('/department')
    },
    { 
      label: 'Job Roles',
      value: desigs.total, 
      sub: 'job roles', 
      icon: 'tabler:badge', 
      color: '#8b5cf6',
      onClick: () => navigateTo('/designations')
    },
    { 
      label: 'Total Users', 
      value: users.total, 
      sub: `${users.active || 0} active`, 
      icon: 'tabler:user-check', 
      color: '#14b8a6',
      onClick: () => navigateTo('/admin-users')
    },
    { 
      label: 'Roles', 
      value: rolesData.total, 
      sub: 'configured', 
      icon: 'tabler:shield', 
      color: '#f97316',
      onClick: () => navigateTo('/roles')
    }
  ]

  return (
    <Box sx={{ p: 5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>
            HR Manager Dashboard
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {unit?.unit_name || 'Unit'} Overview · {user?.name || 'HR Manager'}
            {generatedAt && (
              <Typography component='span' variant='caption' sx={{ ml: 2, color: 'text.disabled' }}>
                Updated: {new Date(generatedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip 
            label={`${rolesData.total || 0} Roles`}
            size='small'
            sx={{ bgcolor: alpha('#f97316', 0.1), color: '#f97316', fontWeight: 700 }}
            icon={<Icon icon='tabler:shield' fontSize={14} />}
          />
          <Chip 
            label={`${employees.total || 0} Employees`} 
            size='small' 
            sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontWeight: 700 }} 
            icon={<Icon icon='tabler:users' fontSize={14} />} 
          />
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map(k => <Grid item xs={6} sm={4} md={3} key={k.label}><KPICard {...k} /></Grid>)}
      </Grid>

      {/* Pending Leave Requests */}
      {pendLeaves.length > 0 && (
        <Card sx={{ mb: 4, cursor: 'pointer' }} onClick={() => navigateTo('/leaves', { tab: 'approval' })}>
          <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Pending Leave Requests</Typography>
            <Chip label={`${pendLeaves.length} pending`} size='small' sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 700 }} />
          </Box>
          {pendLeaves.slice(0, 5).map((l, i) => (
            <Box key={l.id || l._id || i} sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < Math.min(pendLeaves.length, 5) - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
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
                  onClick={(e) => { e.stopPropagation(); handleLeaveAction(l.id || l._id, 'APPROVED'); }}>Approve</Button>
                <Button size='small' variant='outlined' color='error' sx={{ height: 26, fontSize: 10, minWidth: 56 }}
                  onClick={(e) => { e.stopPropagation(); handleLeaveAction(l.id || l._id, 'REJECTED'); }}>Reject</Button>
              </Stack>
            </Box>
          ))}
        </Card>
      )}

      <Grid container spacing={4}>
        {/* Left Column - Recent Users */}
        <Grid item xs={12} md={8}>
          <Stack spacing={4}>
            {/* Recent Users */}
            <Card sx={{ cursor: 'pointer' }} onClick={() => navigateTo('/admin-users')}>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Recent Users</Typography>
                  <Typography variant='caption' color='text.secondary'>Latest team members in your unit</Typography>
                </Box>
                <Icon icon='tabler:chevron-right' fontSize={20} color='text.disabled' />
              </Box>
              {recentUsers.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>No users found</Typography></Box>
              ) : (
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    {recentUsers.slice(0, 5).map(u => (
                      <Box key={u.id || u._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 2, bgcolor: alpha('#6366f1', 0.04) }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#6366f1', 0.15), color: '#6366f1', fontSize: 14, fontWeight: 700 }}>
                            {(u.name || 'U').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>{u.name}</Typography>
                            <Typography variant='caption' color='text.secondary'>{u.email}</Typography>
                          </Box>
                        </Box>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Chip label={u.role} size='small' sx={{ fontSize: 10, height: 22, bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} />
                          <Chip label={u.status} size='small' sx={{ fontSize: 10, height: 22, bgcolor: alpha(u.status === 'ACTIVE' ? '#10b981' : '#ef4444', 0.1), color: u.status === 'ACTIVE' ? '#10b981' : '#ef4444' }} />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Card>

            {/* Monthly Attendance Summary */}
            <Card>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Monthly Attendance Summary</Typography>
                  <Typography variant='caption' color='text.secondary'>Current month statistics</Typography>
                </Box>
                <Chip label={month} size='small' color='primary' variant='outlined' />
              </Box>
              <Box sx={{ px: 4, py: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='h4' sx={{ fontWeight: 800, color: '#10b981' }}>{monthlyAtt.present || 0}</Typography>
                      <Typography variant='caption' color='text.secondary'>Present Days</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='h4' sx={{ fontWeight: 800, color: '#ef4444' }}>{monthlyAtt.absent || 0}</Typography>
                      <Typography variant='caption' color='text.secondary'>Absent Days</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='h4' sx={{ fontWeight: 800, color: '#f59e0b' }}>{monthlyAtt.late || 0}</Typography>
                      <Typography variant='caption' color='text.secondary'>Late</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='h4' sx={{ fontWeight: 800, color: '#6366f1' }}>{monthlyAtt.onLeave || 0}</Typography>
                      <Typography variant='caption' color='text.secondary'>On Leave</Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='caption' sx={{ fontWeight: 600 }}>Attendance Rate</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {monthlyAtt.present && monthlyAtt.present > 0 ? 
                        Math.round((monthlyAtt.present / (monthlyAtt.present + monthlyAtt.absent + monthlyAtt.late)) * 100) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant='determinate' 
                    value={monthlyAtt.present && monthlyAtt.present > 0 ? 
                      Math.round((monthlyAtt.present / (monthlyAtt.present + monthlyAtt.absent + monthlyAtt.late)) * 100) : 0}
                    sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#6366f1', 0.15), '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 4 } }} 
                  />
                </Box>
              </Box>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column - Roles & Holidays */}
        <Grid item xs={12} md={4}>
          <Stack spacing={4}>
            {/* Unit Roles */}
            <Card sx={{ height: '100%' }}>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Unit Roles</Typography>
                <Typography variant='caption' color='text.secondary'>{rolesData.total || 0} roles available</Typography>
              </Box>
              {rolesData.list?.length > 0 ? (
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    {rolesData.list.slice(0, 6).map(r => (
                      <Box key={r.id || r._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.06) }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#f59e0b', 0.15), color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>
                          {(r.name || 'R').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant='body2' sx={{ fontWeight: 600, fontSize: 13 }}>{r.name}</Typography>
                          <Typography variant='caption' color='text.secondary' sx={{ fontSize: 11 }}>
                            {r.slug} · {r.description || 'Unit level'}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>No roles data</Typography></Box>
              )}
            </Card>

            {/* Upcoming Holidays */}
            <Card>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Upcoming Holidays</Typography>
              </Box>
              {holidays.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>No upcoming holidays</Typography></Box>
              ) : holidays.map((h, i) => (
                <Box key={h.id || h._id || i} sx={{ px: 4, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, borderBottom: i < holidays.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
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
    </Box>
  )
}
