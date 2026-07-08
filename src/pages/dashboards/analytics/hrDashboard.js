// src/pages/dashboards/analytics/hrDashboard.js
// HR Manager Dashboard — Calls /api/v1/dashboard/hr endpoint
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'
import { selectUser } from 'src/store/auth/authSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'

export default function HRDashboard() {
  const user = useSelector(selectUser)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const month = new Date().toISOString().slice(0, 7)
        const res = await axiosRequest.get(`/api/v1/dashboard/hr?month=${month}`)
        
        if (res?.success && res?.data) {
          setDashboardData(res.data)
        }
        setError(null)
      } catch (err) {
        console.error('Failed to load HR dashboard:', err)
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

  if (!dashboardData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='h6'>No dashboard data available</Typography>
      </Box>
    )
  }

  const employees = dashboardData.employees || {}
  const todayAtt = dashboardData.todayAttendance || {}
  const pendingLeaves = dashboardData.pendingLeaves || []

  return (
    <Box sx={{ p: 5 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h4' sx={{ mb: 1 }}>
          HR Manager Dashboard
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Welcome back, {user?.name || 'HR Manager'}! Here's your unit overview.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Total Employees</Typography>
                  <Typography variant='h4' fontWeight={700}>
                    {employees.total || 0}
                  </Typography>
                </Box>
                <Icon icon='tabler:users' fontSize={40} color='#7c3aed' />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Present Today</Typography>
                  <Typography variant='h4' fontWeight={700}>
                    {todayAtt.present || 0}
                  </Typography>
                </Box>
                <Icon icon='tabler:circle-check' fontSize={40} color='#10b981' />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'error.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Absent Today</Typography>
                  <Typography variant='h4' fontWeight={700}>
                    {todayAtt.absent || 0}
                  </Typography>
                </Box>
                <Icon icon='tabler:circle-x' fontSize={40} color='#ef4444' />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'warning.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>Pending Leaves</Typography>
                  <Typography variant='h4' fontWeight={700}>
                    {pendingLeaves.length || 0}
                  </Typography>
                </Box>
                <Icon icon='tabler:clock' fontSize={40} color='#f59e0b' />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>Quick Actions</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant='contained' 
                  startIcon={<Icon icon='tabler:users' />}
                  onClick={() => router.push('/users')}
                >
                  Manage Employees
                </Button>
                <Button 
                  variant='contained' 
                  startIcon={<Icon icon='tabler:clock-check' />}
                  onClick={() => router.push('/attendance/team')}
                >
                  Team Attendance
                </Button>
                <Button 
                  variant='contained' 
                  startIcon={<Icon icon='tabler:calendar-user' />}
                  onClick={() => router.push('/leaves')}
                >
                  Leave Approvals
                </Button>
                <Button 
                  variant='contained' 
                  startIcon={<Icon icon='tabler:shield-check' />}
                  onClick={() => router.push('/policy')}
                >
                  Policies
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
