'use client'
import { useEffect, useState } from 'react'
import {
  Box, Card, Typography, Grid, Avatar, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress,
  Alert, LinearProgress, Chip, useTheme, alpha,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { useRouter } from 'next/router'

const SCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
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
      <LinearProgress variant='determinate' value={Math.min(100, Number(value) || 50)}
        sx={{ mt: 1.5, height: 4, borderRadius: 10, bgcolor: alpha(color, 0.15), '& .MuiLinearProgress-bar': { bgcolor: color } }} />
    </SCard>
  )
}

export default function OrganisationDashboard() {
  const theme   = useTheme(); const router = useRouter()
  const primary = theme.palette.primary.main
  const textSec = theme.palette.text.secondary
  const divider = theme.palette.divider
  const isDark  = theme.palette.mode === 'dark'

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    axiosRequest.get('/api/v1/dashboard/org')
      .then(res => setData(res.data))
      .catch(err => setError(typeof err === 'string' ? err : 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>
  if (error)   return <Box sx={{ p: 4 }}><Alert severity='error'>{error}</Alert></Box>

  const companies = data?.recentCompanies || []
  const kpis = [
    { label: 'Total Companies',  value: data?.companies?.total,    color: primary,   sub: 'under this organisation' },
    { label: 'Active Companies', value: data?.companies?.active,   color: '#10b981', sub: 'currently active' },
    { label: 'LOBs',             value: data?.lobs?.total,         color: '#0ea5e9', sub: 'lines of business' },
    { label: 'Total Users',      value: data?.users?.total,        color: '#8b5cf6', sub: 'registered users' },
  ]

  return (
    <Box sx={{ px: 3, py: 3, minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800 }}>Organisation Dashboard</Typography>
          <Typography sx={{ fontSize: 12, color: textSec, mt: 0.3 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        <Button variant='contained' size='small' sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          onClick={() => router.push('/company')}>+ Add Company</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k, i) => <Grid item xs={6} md={3} key={i}><KPI {...k} /></Grid>)}
      </Grid>

      <SCard>
        <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${divider}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Recent Companies</Typography>
          <Button size='small' sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }} onClick={() => router.push('/company')}>View all →</Button>
        </Box>
        {companies.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color='text.secondary'>No companies yet.</Typography>
            <Button variant='contained' size='small' sx={{ mt: 2 }} onClick={() => router.push('/company')}>Add Company</Button>
          </Box>
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  {['COMPANY', 'EMAIL', 'PHONE', 'CODE', 'STATUS', 'CREATED'].map(h => (
                    <TableCell key={h} sx={{ color: textSec, fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', py: 1, px: 2, bgcolor: alpha(primary, 0.03) }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((c, i) => (
                  <TableRow key={c.id || i} sx={{ '&:hover': { bgcolor: alpha(primary, 0.03) } }}>
                    <TableCell sx={{ py: 1.4, px: 2, borderBottom: 'none' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: alpha(primary, 0.12), color: primary, fontSize: 12, fontWeight: 800 }}>
                          {(c.name || 'C').charAt(0)}
                        </Avatar>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{c.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: 'none', color: textSec, fontSize: 12, px: 2 }}>{c.email || '—'}</TableCell>
                    <TableCell sx={{ borderBottom: 'none', color: textSec, fontSize: 12, px: 2 }}>{c.phone || '—'}</TableCell>
                    <TableCell sx={{ borderBottom: 'none', px: 2 }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: textSec }}>{c.code || '—'}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: 'none', px: 2 }}>
                      <Chip label={c.status || 'Active'} size='small'
                        sx={{ fontSize: 11, fontWeight: 600,
                          color:   c.status === 'Active' || c.status === 'ACTIVE' ? '#16a34a' : '#d97706',
                          bgcolor: c.status === 'Active' || c.status === 'ACTIVE' ? (isDark ? 'rgba(74,222,128,0.12)' : '#f0fdf4') : (isDark ? 'rgba(251,191,36,0.12)' : '#fffbeb') }} />
                    </TableCell>
                    <TableCell sx={{ borderBottom: 'none', color: textSec, fontSize: 11, px: 2 }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SCard>
    </Box>
  )
}
