// src/pages/dashboards/analytics/managerDashboard.js
// Manager Dashboard — Team overview, pending approvals, attendance insights
// Manager is also an employee — can apply leave, mark attendance, view payslips

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Icon from 'src/@core/components/icon'
import { fetchUnitDashboard } from 'src/store/dashboard/dashboardSlice'
import { selectUser } from 'src/store/auth/authSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Helpers ────────────────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'warning'
    case 'approved': return 'success'
    case 'rejected': return 'error'
    case 'present': return 'success'
    case 'absent': return 'error'
    case 'late': return 'warning'
    case 'on_leave': return 'info'
    case 'wfh': return 'primary'
    default: return 'default'
  }
}

// ─── Manager Dashboard Component ─────────────────────────────────────────
export default function ManagerDashboard() {
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector(selectUser)
  const [teamLeaves, setTeamLeaves] = useState([])
  const [teamAttendance, setTeamAttendance] = useState([])
  const [myLeaves, setMyLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch team data using manager dashboard API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Use the manager dashboard API endpoint
        const month = new Date().toISOString().slice(0, 7)
        const res = await axiosRequest.get(`/api/v1/dashboard/manager?month=${month}`)
        
        if (res?.success && res?.data) {
          const data = res.data
          
          // Set pending leaves from team
          setTeamLeaves(data.pendingLeaves || [])
          
          // Set team attendance for today's records
          setTeamAttendance(data.todayAttendance?.records || [])
          
          // Set manager's own recent leaves (would need separate call)
          // For now, we'll leave this empty or get from employee dashboard
          setMyLeaves([])
        }
        
        setError(null)
      } catch (err) {
        console.error('Failed to load manager dashboard:', err)
        setError(err?.response?.data?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchData()
  }, [user])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress size={48} />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error' sx={{ m: 4 }}>{error}</Alert>
  }

  // Stats
  const pendingApprovals = teamLeaves.filter(l => l.status === 'PENDING').length
  const teamOnLeave = teamAttendance.filter(a => a.status === 'ON_LEAVE').length
  const teamPresent = teamAttendance.filter(a => ['PRESENT', 'LATE', 'WFH'].includes(a.status)).length
  const teamAbsent = teamAttendance.filter(a => a.status === 'ABSENT').length

  return (
    <Box sx={{ p: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant='h4' sx={{ mb: 1 }}>
          Manager Dashboard
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Welcome back, {user?.name || 'Manager'}! Here's your team overview.
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'warning.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Pending Approvals</Typography>
                  <Typography variant='h4' fontWeight={700}>{pendingApprovals}</Typography>
                </Box>
                <Icon icon='tabler:clock-check' fontSize={40} color='#FF8C00' />
              </Box>
              <Button
                size='small'
                variant='text'
                sx={{ mt: 2, p: 0 }}
                onClick={() => router.push('/leaves')}
              >
                View All →
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Team Present</Typography>
                  <Typography variant='h4' fontWeight={700}>{teamPresent}</Typography>
                </Box>
                <Icon icon='tabler:users' fontSize={40} color='#28c76f' />
              </Box>
              <Button
                size='small'
                variant='text'
                sx={{ mt: 2, p: 0 }}
                onClick={() => router.push('/attendance')}
              >
                View Attendance →
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'info.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Team on Leave</Typography>
                  <Typography variant='h4' fontWeight={700}>{teamOnLeave}</Typography>
                </Box>
                <Icon icon='tabler:beach' fontSize={40} color='#00cfe8' />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'error.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Team Absent</Typography>
                  <Typography variant='h4' fontWeight={700}>{teamAbsent}</Typography>
                </Box>
                <Icon icon='tabler:user-x' fontSize={40} color='#ea5455' />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Pending Leave Approvals */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader
              title='Pending Leave Approvals'
              action={
                <Button
                  size='small'
                  variant='tonal'
                  startIcon={<Icon icon='tabler:eye' />}
                  onClick={() => router.push('/leaves')}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              {teamLeaves.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Icon icon='tabler:inbox' fontSize={48} color='#b0b0b0' />
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                    No pending approvals at this time
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {teamLeaves.slice(0, 5).map((leave) => (
                    <Box
                      key={leave._id}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: theme => `1px solid ${theme.palette.divider}`,
                        '&:hover': { backgroundColor: '#f9f9f9', cursor: 'pointer' }
                      }}
                      onClick={() => router.push(`/leaves?highlight=${leave._id}`)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: '#e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Typography variant='body2' fontWeight={700}>
                              {leave.employeeId?.name?.charAt(0) || '?'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant='body2' fontWeight={600}>
                              {leave.employeeId?.name || 'Employee'}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {leave.leaveTypeId?.name || 'Leave'} • {leave.totalDays} day(s)
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip
                            label={leave.status}
                            size='small'
                            color={getStatusColor(leave.status)}
                            variant='tonal'
                          />
                          <Typography variant='caption' display='block' color='text.secondary' sx={{ mt: 0.5 }}>
                            {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions & Personal Info */}
        <Grid item xs={12} lg={4}>
          {/* Quick Actions */}
          <Card sx={{ mb: 4 }}>
            <CardHeader title='Quick Actions' />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  fullWidth
                  variant='tonal'
                  startIcon={<Icon icon='tabler:clock' />}
                  onClick={() => router.push('/attendance')}
                >
                  Mark Attendance
                </Button>
                <Button
                  fullWidth
                  variant='tonal'
                  startIcon={<Icon icon='tabler:calendar-plus' />}
                  onClick={() => router.push('/calendar?action=apply-leave')}
                >
                  Apply Leave
                </Button>
                <Button
                  fullWidth
                  variant='tonal'
                  startIcon={<Icon icon='tabler:file-invoice' />}
                  onClick={() => router.push('/payroll')}
                >
                  View Payslips
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* My Recent Leaves */}
          <Card>
            <CardHeader
              title='My Recent Leaves'
              action={
                <Button
                  size='small'
                  variant='text'
                  onClick={() => router.push('/leaves')}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              {myLeaves.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>
                  No recent leave requests
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {myLeaves.map((leave) => (
                    <Box key={leave._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant='body2' fontWeight={600}>
                          {leave.leaveTypeId?.name || 'Leave'}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {formatDate(leave.startDate)}
                        </Typography>
                      </Box>
                      <Chip
                        label={leave.status}
                        size='small'
                        color={getStatusColor(leave.status)}
                        variant='tonal'
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
