'use client'
import { useEffect, useState } from 'react'
import {
  Box, Card, Typography, Grid, Avatar, Button, CircularProgress,
  Alert, Chip, useTheme, alpha, LinearProgress,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useSelector } from 'react-redux'
import { selectUser, selectRole } from 'src/store/auth/authSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { useRouter } from 'next/router'

const SCard = styled(Card)(({ theme }) => ({
  borderRadius: 12, border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.palette.mode === 'dark' ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(15,23,42,0.07)',
  height: '100%', background: theme.palette.background.paper,
}))

const leaveStatusColors = {
  PENDING:      { bg: '#fffbeb', color: '#d97706' },
  APPROVED:     { bg: '#f0fdf4', color: '#16a34a' },
  REJECTED:     { bg: '#fef2f2', color: '#dc2626' },
  UNDER_REVIEW: { bg: '#eff6ff', color: '#2563eb' },
}

export default function EmployeeDashboard() {
  const theme   = useTheme(); const router = useRouter()
  const user    = useSelector(selectUser)
  const role    = useSelector(selectRole)
  const primary = theme.palette.primary.main
  const textSec = theme.palette.text.secondary
  const divider = theme.palette.divider
  const isDark  = theme.palette.mode === 'dark'

  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [punching, setPunching] = useState(false)

  useEffect(() => {
    const month = new Date().toISOString().slice(0, 7)
    axiosRequest.get(`/api/v1/dashboard/employee?month=${month}`)
      .then(res => setData(res.data))
      .catch(err => setError(typeof err === 'string' ? err : 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const handlePunch = async () => {
    setPunching(true)
    try {
      const today = data?.today
      if (!today?.hasPunchedIn || today?.hasPunchedOut) {
        await axiosRequest.post('/api/v1/attendance/me/punch-in', {})
      } else {
        await axiosRequest.post('/api/v1/attendance/me/punch-out', {})
      }
      const month = new Date().toISOString().slice(0, 7)
      const res = await axiosRequest.get(`/api/v1/dashboard/employee?month=${month}`)
      setData(res.data)
    } catch (err) { console.error(err) }
    finally { setPunching(false) }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>
  if (error)   return <Box sx={{ p: 4 }}><Alert severity='error'>{error}</Alert></Box>

  const now          = new Date()
  const today        = data?.today          || {}
  const att          = data?.attendance     || {}
  const balances     = data?.leaveBalances  || []
  const recentLeaves = data?.recentLeaves   || []
  const holidays     = data?.upcomingHolidays || []
  const emp          = data?.employee       || {}

  const isPunchedIn  = today.hasPunchedIn && !today.hasPunchedOut
  const isPunchedOut = today.hasPunchedOut

  return (
    <Box sx={{ px: 3, py: 3, minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800 }}>
            Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening'}, {emp.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there'} 👋
          </Typography>
          <Typography sx={{ fontSize: 12, color: textSec, mt: 0.3 }}>
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {emp.department ? ` · ${emp.department}` : ''}
          </Typography>
        </Box>
        <Chip label={role || 'Employee'} size='small'
          sx={{ bgcolor: alpha(primary, 0.1), color: primary, fontWeight: 700, fontSize: 12 }} />
      </Box>

      <Grid container spacing={2}>
        {/* Punch In/Out */}
        <Grid item xs={12} md={4}>
          <SCard sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 2,
              bgcolor: isPunchedIn ? alpha('#10b981', 0.12) : isPunchedOut ? alpha('#6366f1', 0.12) : alpha(primary, 0.08),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{ fontSize: 32 }}>{isPunchedOut ? '✅' : isPunchedIn ? '🟢' : '⏰'}</Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.5 }}>
              {isPunchedOut ? 'Day Complete' : isPunchedIn ? 'Punched In' : 'Not Punched In'}
            </Typography>
            {today.checkIn && (
              <Typography sx={{ fontSize: 12, color: textSec }}>
                In: {new Date(today.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            )}
            {today.checkOut && (
              <Typography sx={{ fontSize: 12, color: textSec }}>
                Out: {new Date(today.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            )}
            {today.workingHours > 0 && (
              <Typography sx={{ fontSize: 11, color: textSec, mt: 0.5 }}>
                {today.workingHours}h worked
              </Typography>
            )}
            {!isPunchedOut && (
              <Button fullWidth variant='contained' sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                color={isPunchedIn ? 'error' : 'primary'} onClick={handlePunch} disabled={punching}>
                {punching ? 'Please wait...' : isPunchedIn ? 'Punch Out' : 'Punch In'}
              </Button>
            )}
            {today.status && (
              <Chip label={today.status} size='small' sx={{ mt: 1.5 }}
                color={today.status === 'PRESENT' || today.status === 'WFH' ? 'success' : today.status === 'LATE' ? 'warning' : 'default'} />
            )}
          </SCard>
        </Grid>

        {/* Monthly attendance */}
        <Grid item xs={12} md={8}>
          <SCard>
            <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: `1px solid ${divider}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>This Month — {data?.month}</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Grid container spacing={1.5}>
                {[
                  { label: 'Present',    value: att.present  || 0, color: '#10b981' },
                  { label: 'Absent',     value: att.absent   || 0, color: '#ef4444' },
                  { label: 'Late',       value: att.late     || 0, color: '#f59e0b' },
                  { label: 'On Leave',   value: att.onLeave  || 0, color: '#8b5cf6' },
                  { label: 'WFH',        value: att.wfh      || 0, color: '#0ea5e9' },
                  { label: 'Half Day',   value: att.halfDay  || 0, color: '#6366f1' },
                ].map((s, i) => (
                  <Grid item xs={4} key={i}>
                    <Box sx={{ p: 1.5, borderRadius: 2, textAlign: 'center', bgcolor: alpha(s.color, isDark ? 0.08 : 0.05), border: `1px solid ${alpha(s.color, 0.2)}` }}>
                      <Typography sx={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</Typography>
                      <Typography sx={{ fontSize: 10, color: textSec, fontWeight: 600 }}>{s.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {att.totalWorkingHours > 0 && (
                <Typography sx={{ fontSize: 12, color: textSec, mt: 2 }}>
                  Total working hours: <strong>{att.totalWorkingHours}h</strong>
                  {att.totalOvertimeHours > 0 && ` · Overtime: ${att.totalOvertimeHours}h`}
                </Typography>
              )}
            </Box>
          </SCard>
        </Grid>

        {/* Leave Balance */}
        <Grid item xs={12} md={6}>
          <SCard>
            <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${divider}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Leave Balance</Typography>
              <Button size='small' sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }} onClick={() => router.push('/my-leaves')}>Apply Leave →</Button>
            </Box>
            <Box sx={{ p: 2 }}>
              {balances.length === 0 ? (
                <Typography color='text.secondary' sx={{ fontSize: 12, textAlign: 'center', py: 3 }}>No leave balance found</Typography>
              ) : (
                <Grid container spacing={1.5}>
                  {balances.map((b, i) => (
                    <Grid item xs={6} key={i}>
                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(primary, isDark ? 0.06 : 0.04), border: `1px solid ${divider}` }}>
                        <Typography sx={{ fontSize: 11, color: textSec, fontWeight: 600, mb: 0.5 }}>{b.leaveType || 'Leave'}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                          <Typography sx={{ fontSize: 22, fontWeight: 800, color: primary }}>{b.remaining ?? 0}</Typography>
                          <Typography sx={{ fontSize: 11, color: textSec }}>/ {b.totalAllocated ?? 0}</Typography>
                        </Box>
                        <LinearProgress variant='determinate'
                          value={b.totalAllocated > 0 ? Math.min(100, ((b.remaining ?? 0) / b.totalAllocated) * 100) : 0}
                          sx={{ mt: 1, height: 4, borderRadius: 10, bgcolor: alpha(primary, 0.12), '& .MuiLinearProgress-bar': { bgcolor: primary } }} />
                        <Typography sx={{ fontSize: 10, color: textSec, mt: 0.5 }}>Used: {b.used ?? 0}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </SCard>
        </Grid>

        {/* Recent Leaves + Holidays */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2} direction='column'>
            <Grid item>
              <SCard>
                <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${divider}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>My Leaves</Typography>
                  <Button size='small' sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }} onClick={() => router.push('/my-leaves')}>All →</Button>
                </Box>
                <Box sx={{ p: 2 }}>
                  {recentLeaves.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color='text.secondary' sx={{ fontSize: 12 }}>No leave requests yet</Typography>
                      <Button variant='contained' size='small' sx={{ mt: 1.5 }} onClick={() => router.push('/my-leaves')}>Apply Leave</Button>
                    </Box>
                  ) : recentLeaves.slice(0, 3).map((l, i) => {
                    const sc = leaveStatusColors[l.status] || { bg: '#f1f5f9', color: '#64748b' }
                    return (
                      <Box key={l.id || i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.2, borderBottom: i < 2 ? `1px solid ${divider}` : 'none' }}>
                        <Box sx={{ minWidth: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(primary, 0.08), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 800, color: primary, lineHeight: 1 }}>{new Date(l.startDate).getDate()}</Typography>
                          <Typography sx={{ fontSize: 8, color: primary, fontWeight: 600 }}>{new Date(l.startDate).toLocaleString('en-IN', { month: 'short' }).toUpperCase()}</Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{l.leaveType?.name || 'Leave'}</Typography>
                          <Typography sx={{ fontSize: 10, color: textSec }}>{l.totalDays || 1} day(s)</Typography>
                        </Box>
                        <Chip label={l.status} size='small' sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: 10 }} />
                      </Box>
                    )
                  })}
                </Box>
              </SCard>
            </Grid>

            <Grid item>
              <SCard>
                <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: `1px solid ${divider}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Upcoming Holidays</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  {holidays.length === 0
                    ? <Typography color='text.secondary' sx={{ fontSize: 12, textAlign: 'center', py: 2 }}>No upcoming holidays</Typography>
                    : holidays.slice(0, 3).map((h, i) => (
                      <Box key={h.id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, borderBottom: i < 2 ? `1px solid ${divider}` : 'none' }}>
                        <Box sx={{ minWidth: 36, height: 36, borderRadius: 1.5, bgcolor: alpha('#f59e0b', 0.12), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#b45309', lineHeight: 1 }}>{new Date(h.date).getDate()}</Typography>
                          <Typography sx={{ fontSize: 8, color: '#b45309', fontWeight: 600 }}>{new Date(h.date).toLocaleString('en-IN', { month: 'short' }).toUpperCase()}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{h.name}</Typography>
                          <Typography sx={{ fontSize: 10, color: textSec }}>{h.type || 'Holiday'}</Typography>
                        </Box>
                      </Box>
                    ))
                  }
                </Box>
              </SCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}
