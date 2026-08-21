// src/pages/dashboards/analytics/managerDashboard.js
// Manager Dashboard — Team overview with same UI as HR Dashboard
// Data filtered to only show employees reporting to this manager
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { fetchManagerDashboard } from 'src/store/dashboard/dashboardSlice'
import { updateLeaveStatus } from 'src/store/leaves/leaveSlice'
import { selectUser } from 'src/store/auth/authSlice'
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

export default function ManagerDashboard() {
  const dispatch = useDispatch()
  const router = useRouter()
  const theme = useTheme()
  const user = useSelector(selectUser)
  const { data, loading, error } = useSelector(s => s.dashboard)
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  useEffect(() => { 
    dispatch(fetchManagerDashboard({ month })) 
  }, [dispatch, month])

  const handleLeaveAction = async (id, status) => {
    try {
      await dispatch(updateLeaveStatus({ id, status, remarks: `${status} from dashboard` })).unwrap()
      toast.success(`Leave ${status.toLowerCase()}`)
      dispatch(fetchManagerDashboard({ month }))
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

  // Extract data
  const team          = data?.team || {}
  const today         = data?.todayAttendance || {}
  const monthAtt      = data?.monthAttendance || {}
  const pendingLeaves = data?.pendingLeaves || []
  const recentLeaves  = data?.recentLeaves || []
  const holidays      = data?.holidays || []

  return (
    <Box sx={{ p: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant='h4' sx={{ mb: 1, fontWeight: 800 }}>
          Manager Dashboard
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Team Overview • {team?.total || 0} Members
        </Typography>
      </Box>

      {/* KPI Cards Grid - Same as HR Dashboard */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard label='Total Team Members' value={team?.total || 0} sub='Direct reports' icon='tabler:users-group' color='#8b5cf6' onClick={() => navigateTo('/employees', { view: 'team' })} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard label='Present Today' value={today?.present || 0} sub={`${today?.absent || 0} absent`} icon='tabler:user-check' color='#10b981' trend={`${Math.round((today?.present / Math.max(team?.total || 1, 1)) * 100)}%`} trendUp onClick={() => navigateTo('/attendance', { date: new Date().toISOString().split('T')[0] })} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard label='On Leave' value={today?.onLeave || 0} sub='Approved leaves' icon='tabler:calendar-off' color='#f59e0b' onClick={() => navigateTo('/leaves', { status: 'APPROVED' })} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard label='Late Arrivals' value={today?.late || 0} sub='Today' icon='tabler:clock-pause' color='#6366f1' trend='Today' trendUp={false} onClick={() => navigateTo('/attendance', { status: 'LATE' })} />
        </Grid>
      </Grid>

      {/* Pending Leave Requests - Conditional */}
      {pendingLeaves.length > 0 && (
        <Card sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ mr: 2, width: 36, height: 36, borderRadius: 2, bgcolor: 'warning.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon icon='tabler:clock-check' fontSize={20} color='#f59e0b' />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Pending Leave Approvals</Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>{pendingLeaves.length} request(s) awaiting your review</Typography>
            </Box>
            <Button size='small' variant='outlined' onClick={() => navigateTo('/leaves', { status: 'PENDING' })}>View All</Button>
          </Box>
          <Box sx={{ p: 3 }}>
            {pendingLeaves.slice(0, 3).map((req, i) => (
              <Box key={req.id || i} sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: i < 2 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Avatar sx={{ width: 36, height: 36, mr: 2, bgcolor: 'primary.main', fontSize: 14 }}>{req.employee?.name?.[0] || '?'}</Avatar>
                <Box sx={{ flex: 1, mr: 3 }}>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>{req.employee?.name || 'Employee'}</Typography>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>{req.leaveType?.name || 'Leave'} • {req.totalDays} day(s)</Typography>
                </Box>
                <Box sx={{ mr: 3 }}>
                  <Typography variant='caption' sx={{ display: 'block', color: 'text.disabled' }}>{new Date(req.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Typography>
                  <Typography variant='caption' sx={{ display: 'block', color: 'text.disabled' }}>to {new Date(req.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Typography>
                </Box>
                <Stack direction='row' spacing={1}>
                  <Button size='small' variant='contained' color='success' sx={{ minWidth: 70, fontWeight: 700 }} onClick={() => handleLeaveAction(req.id, 'APPROVED')}>Approve</Button>
                  <Button size='small' variant='outlined' color='error' sx={{ minWidth: 70, fontWeight: 700 }} onClick={() => handleLeaveAction(req.id, 'REJECTED')}>Reject</Button>
                </Stack>
              </Box>
            ))}
          </Box>
        </Card>
      )}

      {/* Monthly Attendance Summary */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 3 }}>Monthly Team Attendance</Typography>
              <Grid container spacing={3}>
                {[
                  { label: 'Present', value: monthAtt?.present || 0, color: '#10b981', icon: 'tabler:user-check' },
                  { label: 'Absent', value: monthAtt?.absent || 0, color: '#ef4444', icon: 'tabler:user-x' },
                  { label: 'Late', value: monthAtt?.late || 0, color: '#f59e0b', icon: 'tabler:clock' },
                  { label: 'On Leave', value: monthAtt?.onLeave || 0, color: '#8b5cf6', icon: 'tabler:calendar-off' }
                ].map((item, i) => (
                  <Grid item xs={6} md={3} key={i}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5 }}>
                          <Icon icon={item.icon} fontSize={16} style={{ color: item.color }} />
                        </Box>
                        <Typography variant='body2' sx={{ color: 'text.secondary' }}>{item.label}</Typography>
                      </Box>
                      <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>{item.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant='caption' sx={{ color: 'text.disabled' }}>Attendance Rate</Typography>
                <Typography variant='caption' sx={{ fontWeight: 700 }}>
                  {Math.round(((monthAtt?.present || 0) + (monthAtt?.late || 0)) / Math.max((monthAtt?.present || 0) + (monthAtt?.absent || 0) + (monthAtt?.late || 0) + (monthAtt?.onLeave || 0), 1) * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={Math.min(Math.round(((monthAtt?.present || 0) + (monthAtt?.late || 0)) / Math.max((monthAtt?.present || 0) + (monthAtt?.absent || 0) + (monthAtt?.late || 0) + (monthAtt?.onLeave || 0), 1) * 100), 100)}
                sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { borderRadius: 4 } }}
              />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 3, pb: 2 }}>
              <Box sx={{ mr: 2, width: 36, height: 36, borderRadius: 2, bgcolor: 'info.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon='tabler:calendar-star' fontSize={20} color='#3b82f6' />
              </Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Team Members</Typography>
            </Box>
            <Box sx={{ px: 3, pb: 3, flex: 1 }}>
              {team?.members?.slice(0, 4).map((member, i) => (
                <Box key={member._id || i} sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 2 }}>{member.name?.[0] || '?'}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{member.name}</Typography>
                    <Typography variant='caption' sx={{ color: 'text.disabled' }}>{member.employeeId}</Typography>
                  </Box>
                </Box>
              ))}
              {(team?.total || 0) > 4 && (
                <Button size='small' variant='text' sx={{ mt: 1, p: 0 }} onClick={() => navigateTo('/employees', { view: 'team' })}>
                  +{(team.total - 4)} more members
                </Button>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Leaves & Upcoming Holidays */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ mr: 2, width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon='tabler:calendar-minus' fontSize={20} color='#6366f1' />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Recent Leaves</Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>Team member leaves</Typography>
              </Box>
              <Button size='small' variant='outlined' onClick={() => navigateTo('/leaves')}>View All</Button>
            </Box>
            {recentLeaves.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant='body2' color='text.secondary'>No recent leaves</Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                {recentLeaves.map((leave, i) => {
                  const startDate = new Date(leave.startDate)
                  const endDate = new Date(leave.endDate)
                  const statusColor = leave.status === 'APPROVED' ? '#10b981' : leave.status === 'REJECTED' ? '#ef4444' : leave.status === 'PENDING' ? '#f59e0b' : '#6366f1'
                  
                  return (
                    <Box key={leave.id || i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, mb: i < recentLeaves.length - 1 ? 2 : 0, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.08) : 'grey.50' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
                          {leave.leaveType?.name || 'Leave'} ({leave.leaveType?.code || ''})
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                            {startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - {endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} . {leave.totalDays}d
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={leave.status} 
                        size='small'
                        sx={{ 
                          fontSize: 10, 
                          height: 22, 
                          fontWeight: 700,
                          bgcolor: alpha(statusColor, 0.12),
                          color: statusColor
                        }}
                      />
                    </Box>
                  )
                })}
              </Box>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ mr: 2, width: 36, height: 36, borderRadius: 2, bgcolor: 'success.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon='tabler:calendar-event' fontSize={20} color='#10b981' />
              </Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Upcoming Holidays</Typography>
            </Box>
            {holidays.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant='body2' color='text.secondary'>No upcoming holidays</Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                {holidays.map((h, i) => (
                  <Box key={h.id || h._id || i} sx={{ display: 'flex', alignItems: 'center', py: 1.5, borderBottom: i < holidays.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'success.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <Icon icon='tabler:gift' fontSize={16} color='#10b981' />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>{h.name}</Typography>
                      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                        {new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
