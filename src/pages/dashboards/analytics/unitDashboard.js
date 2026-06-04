'use client'
import { useEffect, useState } from 'react'
import {
  Box, Card, Typography, Grid, Avatar, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress,
  Alert, Chip, useTheme, alpha,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { useRouter } from 'next/router'

const SCard = styled(Card)(({ theme }) => ({
  borderRadius: 12, border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.palette.mode === 'dark' ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(15,23,42,0.07)',
  height: '100%', background: theme.palette.background.paper,
}))

const KPI = ({ label, value, color, sub, onClick }) => {
  const theme = useTheme(); const isDark = theme.palette.mode === 'dark'
  return (
    <SCard sx={{ p: 2.5, bgcolor: alpha(color, isDark ? 0.07 : 0.04), cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <Typography sx={{ fontSize: 10, color: theme.palette.text.secondary, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', mb: 1 }}>{label}</Typography>
      <Typography sx={{ fontSize: 30, fontWeight: 800, color, letterSpacing: '-1px', lineHeight: 1 }}>{value ?? '—'}</Typography>
      <Typography sx={{ fontSize: 11, color: theme.palette.text.secondary, mt: 0.75 }}>{sub}</Typography>
    </SCard>
  )
}

export default function UnitAdminDashboard() {
  const theme   = useTheme(); const router = useRouter()
  const primary = theme.palette.primary.main
  const textSec = theme.palette.text.secondary
  const divider = theme.palette.divider
  const isDark  = theme.palette.mode === 'dark'

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const month = new Date().toISOString().slice(0, 7)
    axiosRequest.get(`/api/v1/dashboard/unit?month=${month}`)
      .then(res => setData(res.data))
      .catch(err => setError(typeof err === 'string' ? err : 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>
  if (error)   return <Box sx={{ p: 4 }}><Alert severity='error'>{error}</Alert></Box>

  const kpis = [
    { label: 'Users',          value: data?.users?.total,                    color: primary,   sub: 'in this unit',      onClick: () => router.push('/users') },
    { label: 'Departments',    value: data?.departments?.total,              color: '#0ea5e9', sub: 'total departments', onClick: () => router.push('/department') },
    { label: 'Designations',   value: data?.designations?.total,            color: '#8b5cf6', sub: 'job roles',          onClick: () => router.push('/designation') },
    { label: 'Pending Leaves', value: data?.pendingLeaveCount,              color: '#f59e0b', sub: 'awaiting approval',  onClick: () => router.push('/leaves') },
  ]

  const att          = data?.todayAttendance || {}
  const recentUsers  = data?.recentUsers    || []
  const pendingLeaves= data?.pendingLeaves  || []
  const holidays     = data?.upcomingHolidays || []

  return (
    <Box sx={{ px: 3, py: 3, minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800 }}>Unit Dashboard</Typography>
          <Typography sx={{ fontSize: 12, color: textSec, mt: 0.3 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        <Button variant='contained' size='small' sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          onClick={() => router.push('/users')}>+ Invite User</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k, i) => <Grid item xs={6} md={3} key={i}><KPI {...k} /></Grid>)}
      </Grid>

      {/* Today Attendance Summary */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'Present',  value: att.present  || 0, color: '#10b981' },
          { label: 'Absent',   value: att.absent   || 0, color: '#ef4444' },
          { label: 'Late',     value: att.late     || 0, color: '#f59e0b' },
          { label: 'On Leave', value: att.onLeave  || 0, color: '#8b5cf6' },
        ].map((s, i) => (
          <Grid item xs={6} md={3} key={i}>
            <SCard sx={{ p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 10, color: textSec, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today — {s.label}</Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 800, color: s.color, mt: 0.5 }}>{s.value}</Typography>
            </SCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {/* Recent Users */}
        <Grid item xs={12} md={7}>
          <SCard>
            <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${divider}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Team Members</Typography>
              <Button size='small' sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }} onClick={() => router.push('/users')}>View all →</Button>
            </Box>
            {recentUsers.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><Typography color='text.secondary'>No users yet.</Typography></Box>
            ) : (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      {['USER', 'ROLE', 'STATUS'].map(h => (
                        <TableCell key={h} sx={{ color: textSec, fontSize: 10, fontWeight: 700, py: 1, px: 2, bgcolor: alpha(primary, 0.03) }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentUsers.map((u, i) => (
                      <TableRow key={u.id || i} sx={{ '&:hover': { bgcolor: alpha(primary, 0.03) } }}>
                        <TableCell sx={{ py: 1.4, px: 2, borderBottom: 'none' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 30, height: 30, bgcolor: alpha(primary, 0.12), color: primary, fontSize: 11, fontWeight: 800 }}>
                              {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{u.name || '—'}</Typography>
                              <Typography sx={{ fontSize: 11, color: textSec }}>{u.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', px: 2 }}>
                          <Chip label={u.role || '—'} size='small' sx={{ fontSize: 10, fontWeight: 600, bgcolor: alpha(primary, 0.08), color: primary }} />
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', px: 2 }}>
                          <Chip label={u.status || 'ACTIVE'} size='small'
                            sx={{ fontSize: 10, fontWeight: 600,
                              color: u.status === 'ACTIVE' ? '#16a34a' : '#dc2626',
                              bgcolor: u.status === 'ACTIVE' ? (isDark ? 'rgba(74,222,128,0.12)' : '#f0fdf4') : (isDark ? 'rgba(248,113,113,0.12)' : '#fef2f2') }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SCard>
        </Grid>

        {/* Right */}
        <Grid item xs={12} md={5}>
          <Grid container spacing={2} direction='column'>
            {/* Pending Leaves */}
            <Grid item>
              <SCard>
                <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${divider}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Pending Leaves</Typography>
                  <Button size='small' sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }} onClick={() => router.push('/leaves')}>Review →</Button>
                </Box>
                <Box sx={{ p: 2 }}>
                  {pendingLeaves.length === 0
                    ? <Typography color='text.secondary' sx={{ fontSize: 12, textAlign: 'center', py: 2 }}>No pending leaves</Typography>
                    : pendingLeaves.slice(0, 3).map((l, i) => (
                      <Box key={l.id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, borderBottom: i < 2 ? `1px solid ${divider}` : 'none' }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#f59e0b', 0.12), color: '#b45309', fontSize: 11, fontWeight: 800 }}>
                          {(l.employee?.name || 'E').charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{l.employee?.name || 'Employee'}</Typography>
                          <Typography sx={{ fontSize: 10, color: textSec }}>{l.leaveType?.name || 'Leave'} · {l.totalDays || 1} day(s)</Typography>
                        </Box>
                      </Box>
                    ))
                  }
                </Box>
              </SCard>
            </Grid>

            {/* Upcoming Holidays */}
            <Grid item>
              <SCard>
                <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: `1px solid ${divider}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Upcoming Holidays</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  {holidays.length === 0
                    ? <Typography color='text.secondary' sx={{ fontSize: 12, textAlign: 'center', py: 2 }}>No upcoming holidays</Typography>
                    : holidays.map((h, i) => (
                      <Box key={h.id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, borderBottom: i < holidays.length - 1 ? `1px solid ${divider}` : 'none' }}>
                        <Box sx={{ minWidth: 38, height: 38, borderRadius: 1.5, bgcolor: alpha('#f59e0b', 0.12), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
