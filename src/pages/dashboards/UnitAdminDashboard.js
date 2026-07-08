// src/pages/dashboards/UnitAdminDashboard.js
// REAL API — GET /api/v1/dashboard/unit?month=YYYY-MM
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme, alpha } from '@mui/material/styles'
import { useParams } from 'next/navigation'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import { fetchUnitDashboard } from 'src/store/dashboard/dashboardSlice'

const KPICard = ({ label, value, sub, icon, color }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Card sx={{ overflow: 'hidden', height: '100%' }}>
      <Box sx={{ px: 3, pt: 3, pb: 2.5, background: `linear-gradient(135deg, ${alpha(color, isDark ? 0.18 : 0.07)} 0%, transparent 70%)` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: alpha(color, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon={icon} fontSize={22} style={{ color }} />
          </Box>
        </Box>
        <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px' }}>{value ?? '—'}</Typography>
        <Typography variant='caption' sx={{ display: 'block', mt: 0.5, fontWeight: 600, color: 'text.secondary' }}>{label}</Typography>
        {sub && <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25 }}>{sub}</Typography>}
      </Box>
    </Card>
  )
}

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const getLast12Months = () => {
  const months = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    months.push({ value, label })
  }
  return months
}

export default function UnitAdminDashboard() {
  const dispatch = useDispatch()
  const theme = useTheme()
  const params = useParams()
  const { unitDashboard, loading, error } = useSelector(s => s.dashboard)

  const [month, setMonth] = useState(getCurrentMonth())
  const months = getLast12Months()

  useEffect(() => {
    const unitId = params?.unitId
    dispatch(fetchUnitDashboard({ unitId, month }))
  }, [dispatch, params?.unitId, month])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
  if (error) return <Alert severity='error' sx={{ m: 4 }}>{String(error)}</Alert>
  if (!unitDashboard) return null

  const employees = unitDashboard.employees || {}
  const attendance = unitDashboard.attendance || {}
  const payroll = unitDashboard.payroll || {}

  const KPIS = [
    {
      label: 'Total Employees',
      value: employees.total,
      sub: `${employees.active ?? 0} active`,
      icon: 'tabler:users-group',
      color: '#6366f1'
    },
    {
      label: 'Present This Month',
      value: attendance.presentDays,
      sub: `${attendance.absentDays ?? 0} absent`,
      icon: 'tabler:user-check',
      color: '#10b981'
    },
    {
      label: 'Late Arrivals',
      value: attendance.lateDays || 0,
      sub: `${attendance.halfDays ?? 0} half days`,
      icon: 'tabler:clock-hour-4',
      color: '#f59e0b'
    },
    {
      label: 'Pending Requests',
      value: (unitDashboard.pendingLeaves || 0) + (unitDashboard.pendingRegularizations || 0),
      sub: 'leaves + regularisations',
      icon: 'tabler:clock-check',
      color: '#ef4444'
    }
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>Unit Overview</Typography>
          <Typography variant='body2' color='text.secondary'>Unit Admin · {unitDashboard.unitName}</Typography>
        </Box>
        <CustomTextField
          select
          size='small'
          value={month}
          onChange={e => setMonth(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {months.map(m => (
            <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
          ))}
        </CustomTextField>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {KPIS.map((kpi, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <KPICard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Unit-level widgets: Shift summary, Department breakdown, etc. */}
    </Box>
  )
}
