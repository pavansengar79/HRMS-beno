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

const leaveStatusColors = {
  PENDING:      { bg: '#fffbeb', color: '#d97706' },
  APPROVED:     { bg: '#f0fdf4', color: '#16a34a' },
  REJECTED:     { bg: '#fef2f2', color: '#dc2626' },
  UNDER_REVIEW: { bg: '#eff6ff', color: '#2563eb' },
}

export default function HRDashboard() {
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

  const att          = data?.todayAttendance  || {}
  const recentUsers  = data?.recentUsers      || []
  const pendingLeaves= data?.pendingLeaves    || []
  const holidays     = data?.upcomingHolidays || []
  const users        = data?.users            || {}

  const kpis = [
    { label: 'Total Users',      value: users.total,           color: primary,   sub: 'in this unit' },
    { label: 'Active Users',     value: users.active,          color: '#10b981', sub: 'currently active' },
    { label: 'Pending Leaves',   value: data?.pendingLeaveCount, color: '#f59e0b', sub: 'awaiting approval' },
    { label: "Today's Present",  value: att.present || 0,      color: '#0ea5e9', sub: `${att.attendanceRate || 0}% attendance rate` },
  ]

  return (
    <Box sx={{ px: 3, py: 3, minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800 }}>HR Dashboard</Typography>
          <Typography sx={{ fontSize: 12, color: textSec, mt: 0.3 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        <Button variant='contained' size='small' sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          onClick={() => router.push('/leaves')}>Review Leaves</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k, i) => (
          <Grid item xs={6} md={3} key={i}>
            <SCard sx={{ p: 2.5, bgcolor: alpha(k.color, isDark ? 0.07 : 0.04) }}>
              <Typography sx={{ fontSize: 10, color: textSec, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', mb: 1 }}>{k.label}</Typography>
              <Typography sx={{ fontSize: 30, fontWeight: 800, color: k.color, letterSpacing: '-1px', lineHeight: 1 }}>{k.value ?? '—'}</Typography>
              <Typography sx={{ fontSize: 11, color: textSec, mt: 0.75 }}>{k.sub}</Typography>
            </SCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {/* Pending Leaves table */}
        <Grid item xs={12} md={7}>
          <SCard>
            <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${divider}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Pending Leave Requests</Typography>
              <Button size='small' sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }} onClick={() => router.push('/leaves')}>View all →</Button>
            </Box>
            {pendingLeaves.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><Typography color='text.secondary'>No pending leaves</Typography></Box>
            ) : (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      {['EMPLOYEE', 'TYPE', 'DAYS', 'APPLIED'].map(h => (
                        <TableCell key={h} sx={{ color: textSec, fontSize: 10, fontWeight: 700, py: 1, px: 2, bgcolor: alpha(primary, 0.03) }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingLeaves.map((l, i) => (
                      <TableRow key={l.id || i} sx={{ '&:hover': { bgcolor: alpha(primary, 0.03) } }}>
                        <TableCell sx={{ py: 1.4, px: 2, borderBottom: 'none' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 26, height: 26, bgcolor: alpha(primary, 0.12), color: primary, fontSize: 10, fontWeight: 800 }}>
                              {(l.employee?.name || 'E').charAt(0)}
                            </Avatar>
                            <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{l.employee?.name || '—'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', color: textSec, fontSize: 12, px: 2 }}>{l.leaveType?.name || '—'}</TableCell>
                        <TableCell sx={{ borderBottom: 'none', color: textSec, fontSize: 12, px: 2 }}>{l.totalDays || 1}</TableCell>
                        <TableCell sx={{ borderBottom: 'none', color: textSec, fontSize: 11, px: 2 }}>
                          {l.appliedOn ? new Date(l.appliedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SCard>
        </Grid>

        {/* Team + Holidays */}
        <Grid item xs={12} md={5}>
          <Grid container spacing={2} direction='column'>
            <Grid item>
              <SCard>
                <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${divider}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Team Members</Typography>
                  <Button size='small' sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }} onClick={() => router.push('/users')}>All →</Button>
                </Box>
                <Box sx={{ p: 2 }}>
                  {recentUsers.length === 0
                    ? <Typography color='text.secondary' sx={{ fontSize: 12, textAlign: 'center', py: 2 }}>No users yet</Typography>
                    : recentUsers.slice(0, 5).map((u, i) => (
                      <Box key={u.id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, borderBottom: i < Math.min(recentUsers.length, 5) - 1 ? `1px solid ${divider}` : 'none' }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(primary, 0.12), color: primary, fontSize: 11, fontWeight: 800 }}>
                          {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{u.name || '—'}</Typography>
                          <Typography sx={{ fontSize: 11, color: textSec }}>{u.role || '—'}</Typography>
                        </Box>
                        <Chip label={u.status || 'ACTIVE'} size='small'
                          sx={{ fontSize: 10, fontWeight: 600,
                            color: u.status === 'ACTIVE' ? '#16a34a' : '#dc2626',
                            bgcolor: u.status === 'ACTIVE' ? (isDark ? 'rgba(74,222,128,0.12)' : '#f0fdf4') : (isDark ? 'rgba(248,113,113,0.12)' : '#fef2f2') }} />
                      </Box>
                    ))
                  }
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
                    : holidays.map((h, i) => (
                      <Box key={h.id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, borderBottom: i < holidays.length - 1 ? `1px solid ${divider}` : 'none' }}>
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
