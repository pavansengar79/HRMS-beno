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

const KPI = ({ label, value, color, sub }) => {
  const theme = useTheme(); const isDark = theme.palette.mode === 'dark'
  return (
    <SCard sx={{ p: 2.5, bgcolor: alpha(color, isDark ? 0.07 : 0.04) }}>
      <Typography sx={{ fontSize: 10, color: theme.palette.text.secondary, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', mb: 1 }}>{label}</Typography>
      <Typography sx={{ fontSize: 30, fontWeight: 800, color, letterSpacing: '-1px', lineHeight: 1 }}>{value ?? '—'}</Typography>
      <Typography sx={{ fontSize: 11, color: theme.palette.text.secondary, mt: 0.75 }}>{sub}</Typography>
    </SCard>
  )
}

export default function CompanyAdminDashboard() {
  const theme   = useTheme(); const router = useRouter()
  const primary = theme.palette.primary.main
  const textSec = theme.palette.text.secondary
  const divider = theme.palette.divider
  const isDark  = theme.palette.mode === 'dark'

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    axiosRequest.get('/api/v1/dashboard/company')
      .then(res => setData(res.data))
      .catch(err => setError(typeof err === 'string' ? err : 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>
  if (error)   return <Box sx={{ p: 4 }}><Alert severity='error'>{error}</Alert></Box>

  const kpis = [
    { label: 'Units',       value: data?.units?.total,       color: primary,   sub: 'business units' },
    { label: 'LOBs',        value: data?.lobs?.total,        color: '#0ea5e9', sub: 'lines of business' },
    { label: 'Users',       value: data?.users?.total,       color: '#8b5cf6', sub: 'registered users' },
    { label: 'Departments', value: data?.departments?.total, color: '#f59e0b', sub: 'across all units' },
  ]

  const recentUsers    = data?.recentUsers    || []
  const recentUnits    = data?.recentUnits    || []
  const upcomingHols   = data?.upcomingHolidays || []

  return (
    <Box sx={{ px: 3, py: 3, minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800 }}>Company Dashboard</Typography>
          <Typography sx={{ fontSize: 12, color: textSec, mt: 0.3 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant='tonal' size='small' sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }} onClick={() => router.push('/lob')}>+ LOB</Button>
          <Button variant='contained' size='small' sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }} onClick={() => router.push('/units')}>+ Unit</Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k, i) => <Grid item xs={6} md={3} key={i}><KPI {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={2}>
        {/* Units */}
        <Grid item xs={12} md={7}>
          <SCard>
            <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${divider}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Recent Units</Typography>
              <Button size='small' sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }} onClick={() => router.push('/units')}>View all →</Button>
            </Box>
            {recentUnits.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color='text.secondary'>No units yet.</Typography>
                <Button variant='contained' size='small' sx={{ mt: 2 }} onClick={() => router.push('/units')}>Add Unit</Button>
              </Box>
            ) : (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      {['UNIT', 'LOB', 'LOCATION', 'STATUS'].map(h => (
                        <TableCell key={h} sx={{ color: textSec, fontSize: 10, fontWeight: 700, py: 1, px: 2, bgcolor: alpha(primary, 0.03) }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentUnits.map((u, i) => (
                      <TableRow key={u.id || i} sx={{ '&:hover': { bgcolor: alpha(primary, 0.03) } }}>
                        <TableCell sx={{ py: 1.4, px: 2, borderBottom: 'none' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(primary, 0.12), color: primary, fontSize: 11, fontWeight: 800 }}>
                              {(u.name || 'U').charAt(0)}
                            </Avatar>
                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{u.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', color: textSec, fontSize: 12, px: 2 }}>{u.lob || '—'}</TableCell>
                        <TableCell sx={{ borderBottom: 'none', color: textSec, fontSize: 12, px: 2 }}>{u.location || '—'}</TableCell>
                        <TableCell sx={{ borderBottom: 'none', px: 2 }}>
                          <Chip label={u.status || 'Active'} size='small'
                            sx={{ fontSize: 10, fontWeight: 600, color: '#16a34a', bgcolor: isDark ? 'rgba(74,222,128,0.12)' : '#f0fdf4' }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SCard>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={5}>
          <Grid container spacing={2} direction='column'>
            {/* Recent Users */}
            <Grid item>
              <SCard>
                <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${divider}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Recent Users</Typography>
                  <Button size='small' sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }} onClick={() => router.push('/users')}>All →</Button>
                </Box>
                <Box sx={{ p: 2 }}>
                  {recentUsers.length === 0
                    ? <Typography color='text.secondary' sx={{ fontSize: 12, textAlign: 'center', py: 2 }}>No users yet</Typography>
                    : recentUsers.map((u, i) => (
                      <Box key={u.id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, borderBottom: i < recentUsers.length - 1 ? `1px solid ${divider}` : 'none' }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: alpha(primary, 0.12), color: primary, fontSize: 11, fontWeight: 800 }}>
                          {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || '—'}</Typography>
                          <Typography sx={{ fontSize: 11, color: textSec }}>{u.role || '—'}</Typography>
                        </Box>
                        <Chip label={u.status || 'ACTIVE'} size='small'
                          sx={{ fontSize: 10, fontWeight: 600, color: '#16a34a', bgcolor: isDark ? 'rgba(74,222,128,0.12)' : '#f0fdf4' }} />
                      </Box>
                    ))
                  }
                </Box>
              </SCard>
            </Grid>

            {/* Upcoming Holidays */}
            <Grid item>
              <SCard>
                <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${divider}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Upcoming Holidays</Typography>
                  <Button size='small' sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }} onClick={() => router.push('/holidays')}>Manage →</Button>
                </Box>
                <Box sx={{ p: 2 }}>
                  {upcomingHols.length === 0
                    ? <Typography color='text.secondary' sx={{ fontSize: 12, textAlign: 'center', py: 2 }}>No upcoming holidays</Typography>
                    : upcomingHols.map((h, i) => (
                      <Box key={h.id || i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.2, borderBottom: i < upcomingHols.length - 1 ? `1px solid ${divider}` : 'none' }}>
                        <Box sx={{ minWidth: 40, height: 40, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.12), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#b45309', lineHeight: 1 }}>{new Date(h.date).getDate()}</Typography>
                          <Typography sx={{ fontSize: 8, color: '#b45309', fontWeight: 600 }}>{new Date(h.date).toLocaleString('en-IN', { month: 'short' }).toUpperCase()}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{h.name}</Typography>
                          <Typography sx={{ fontSize: 11, color: textSec }}>{h.type || 'Holiday'}</Typography>
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
