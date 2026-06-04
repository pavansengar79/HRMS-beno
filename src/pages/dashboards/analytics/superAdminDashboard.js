'use client'
import { useEffect, useState } from 'react'
import {
  Box, Card, Typography, Grid, Avatar, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress,
  Alert, Chip, useTheme, alpha, LinearProgress,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import axiosRequest from 'src/utils/AxiosInterceptor'

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
      <LinearProgress variant='determinate' value={Math.min(100, Number(value) || 40)}
        sx={{ mt: 1.5, height: 4, borderRadius: 10, bgcolor: alpha(color, 0.15), '& .MuiLinearProgress-bar': { bgcolor: color } }} />
    </SCard>
  )
}

export default function SuperAdminDashboard() {
  const theme   = useTheme()
  const primary = theme.palette.primary.main
  const textSec = theme.palette.text.secondary
  const divider = theme.palette.divider
  const isDark  = theme.palette.mode === 'dark'

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    axiosRequest.get('/api/v1/dashboard/super-admin')
      .then(res => setData(res.data))
      .catch(err => setError(typeof err === 'string' ? err : 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>
  if (error)   return <Box sx={{ p: 4 }}><Alert severity='error'>{error}</Alert></Box>

  const tenants  = data?.recentTenants || []
  const activity = data?.recentActivity || []

  const kpis = [
    { label: 'Total Orgs',     value: data?.customers?.total,        color: primary,   sub: 'registered organisations' },
    { label: 'Active',         value: data?.customers?.active,       color: '#10b981', sub: 'active subscriptions' },
    { label: 'On Trial',       value: data?.customers?.onTrial,      color: '#f59e0b', sub: 'trial period' },
    { label: 'New This Month', value: data?.customers?.newThisMonth, color: '#8b5cf6', sub: 'joined this month' },
  ]

  return (
    <Box sx={{ px: 3, py: 3, minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant='h5' sx={{ fontWeight: 800 }}>Super Admin Dashboard</Typography>
        <Typography sx={{ fontSize: 12, color: textSec, mt: 0.3 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k, i) => <Grid item xs={6} md={3} key={i}><KPI {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={2}>
        {/* Recent Orgs */}
        <Grid item xs={12} md={8}>
          <SCard>
            <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${divider}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Recent Organisations</Typography>
            </Box>
            {tenants.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><Typography color='text.secondary'>No organisations yet</Typography></Box>
            ) : (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      {['ORGANISATION', 'CONTACT', 'STATUS', 'TRIAL', 'JOINED'].map(h => (
                        <TableCell key={h} sx={{ color: textSec, fontSize: 10, fontWeight: 700, py: 1, px: 2, bgcolor: alpha(primary, 0.03) }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tenants.map((t, i) => (
                      <TableRow key={t.id || i} sx={{ '&:hover': { bgcolor: alpha(primary, 0.03) } }}>
                        <TableCell sx={{ py: 1.4, px: 2, borderBottom: 'none' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(primary, 0.12), color: primary, fontSize: 11, fontWeight: 800 }}>
                              {(t.name || 'O').charAt(0)}
                            </Avatar>
                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{t.name || '—'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', color: textSec, fontSize: 11, px: 2 }}>{t.email || '—'}</TableCell>
                        <TableCell sx={{ borderBottom: 'none', px: 2 }}>
                          <Chip label={t.status || 'Active'} size='small'
                            sx={{ fontSize: 10, fontWeight: 600,
                              color:   t.status === 'ACTIVE' ? '#16a34a' : '#d97706',
                              bgcolor: t.status === 'ACTIVE' ? (isDark ? 'rgba(74,222,128,0.12)' : '#f0fdf4') : (isDark ? 'rgba(251,191,36,0.12)' : '#fffbeb') }} />
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', color: textSec, fontSize: 11, px: 2 }}>
                          {t.isTrial ? `Until ${t.trialEndsAt ? new Date(t.trialEndsAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}` : 'Paid'}
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', color: textSec, fontSize: 11, px: 2 }}>
                          {t.joinedAt ? new Date(t.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SCard>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <SCard>
            <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: `1px solid ${divider}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Recent Activity</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {activity.length === 0 ? (
                <Typography color='text.secondary' sx={{ fontSize: 12, textAlign: 'center', py: 3 }}>No recent activity</Typography>
              ) : activity.slice(0, 6).map((a, i) => (
                <Box key={i} sx={{ py: 1.2, borderBottom: i < 5 ? `1px solid ${divider}` : 'none' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{a.action}</Typography>
                  <Typography sx={{ fontSize: 11, color: textSec }}>{a.actor}</Typography>
                  <Typography sx={{ fontSize: 10, color: textSec, mt: 0.2 }}>
                    {a.timestamp ? new Date(a.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </SCard>
        </Grid>
      </Grid>
    </Box>
  )
}
