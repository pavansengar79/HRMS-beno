// src/pages/overtime/index.js
// Overtime Management & Payroll Integration
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import { alpha } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAvatar from 'src/@core/components/mui/avatar'

import { selectUser, selectRoleSlug, selectCompanyId } from 'src/store/auth/authSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const STATUS_COLORS = {
  PENDING: { color: '#f59e0b', bgColor: alpha('#f59e0b', 0.12) },
  APPROVED: { color: '#10b981', bgColor: alpha('#10b981', 0.12) },
  REJECTED: { color: '#ef4444', bgColor: alpha('#ef4444', 0.12) },
  PAID: { color: '#0ea5e9', bgColor: alpha('#0ea5e9', 0.12) },
}

export default function OvertimeManagement() {
  const router = useRouter()
  const user = useSelector(selectUser)
  const roleSlug = useSelector(selectRoleSlug)
  const companyId = useSelector(selectCompanyId)

  const [loading, setLoading] = useState(true)
  const [overtimeRecords, setOvertimeRecords] = useState([])
  const [summary, setSummary] = useState({
    totalHours: 0,
    totalPay: 0,
    approvedHours: 0,
    pendingHours: 0
  })
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [policy, setPolicy] = useState({ overtimePay: { enabled: false, rateMultiplier: 1.5 } })

  useEffect(() => {
    fetchOvertimeRecords()
    fetchPolicy()
  }, [month, page, limit])

  const fetchOvertimeRecords = async () => {
    setLoading(true)
    try {
      const response = await axiosRequest.get('/api/v1/overtime', {
        params: { month, page: page + 1, limit }
      })
      setOvertimeRecords(response?.data?.records || [])
      setTotal(response?.data?.total || 0)
      if (response?.data?.summary) {
        setSummary(response.data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch overtime:', error)
      toast.error('Failed to load overtime records')
    } finally {
      setLoading(false)
    }
  }

  const fetchPolicy = async () => {
    try {
      const response = await axiosRequest.get('/api/v1/payroll-policies/my')
      setPolicy(response?.data || { overtimePay: { enabled: false } })
    } catch (error) {
      console.error('Failed to fetch policy:', error)
    }
  }

  const handleApprove = async (recordId) => {
    try {
      await axiosRequest.patch(`/api/v1/overtime/${recordId}/approve`)
      toast.success('Overtime approved')
      fetchOvertimeRecords()
    } catch (error) {
      toast.error('Failed to approve overtime')
    }
  }

  const handleReject = async (recordId) => {
    try {
      await axiosRequest.patch(`/api/v1/overtime/${recordId}/reject`)
      toast.success('Overtime rejected')
      fetchOvertimeRecords()
    } catch (error) {
      toast.error('Failed to reject overtime')
    }
  }

  const calculateOvertimePay = (hours, basic) => {
    if (!policy?.overtimePay?.enabled) return 0
    const hourlyRate = (basic || 20000) / 26 / 8
    return hours * (policy.overtimePay.rateMultiplier || 1.5) * hourlyRate
  }

  const empInitials = name => (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const fmtHours = h => `${Number(h || 0).toFixed(2)}h`
  const fmtMoney = n => n == null ? '—' : '₹' + Math.round(n).toLocaleString('en-IN')

  const MONTH_OPTIONS = (() => {
    const opts = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      opts.push({
        label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      })
    }
    return opts
  })()

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800 }}>Overtime Management</Typography>
          <Typography variant='body2' color='text.secondary'>
            {roleSlug === 'employee' ? 'Track your overtime hours and pay' : 'Approve overtime and manage payouts'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <CustomTextField
            select
            size='small'
            value={month}
            onChange={e => { setMonth(e.target.value); setPage(0) }}
            sx={{ minWidth: 160 }}
          >
            {MONTH_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </CustomTextField>
          {roleSlug !== 'employee' && (
            <Button
              variant='contained'
              startIcon={<Icon icon='tabler:plus' />}
              onClick={() => router.push('/overtime/add')}
            >
              Log Overtime
            </Button>
          )}
        </Box>
      </Box>

      {/* Policy Status */}
      {!policy?.overtimePay?.enabled && (
        <Alert severity='warning' sx={{ mb: 4 }}>
          Overtime pay is <strong>disabled</strong> in your payroll policy. Enable it in Payroll Policy settings to compensate employees for overtime work.
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, bgcolor: alpha('#6366f1', 0.08) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CustomAvatar skin='light' color='primary'>
                <Icon icon='tabler:clock' />
              </CustomAvatar>
              <Box>
                <Typography variant='overline' color='text.secondary'>Total Hours</Typography>
                <Typography variant='h5' sx={{ fontWeight: 800 }}>{fmtHours(summary.totalHours)}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, bgcolor: alpha('#10b981', 0.08) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CustomAvatar skin='light' color='success'>
                <Icon icon='tabler:check' />
              </CustomAvatar>
              <Box>
                <Typography variant='overline' color='text.secondary'>Approved</Typography>
                <Typography variant='h5' sx={{ fontWeight: 800, color: 'success.main' }}>
                  {fmtHours(summary.approvedHours)}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, bgcolor: alpha('#f59e0b', 0.08) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CustomAvatar skin='light' color='warning'>
                <Icon icon='tabler:clock-hour-4' />
              </CustomAvatar>
              <Box>
                <Typography variant='overline' color='text.secondary'>Pending Approval</Typography>
                <Typography variant='h5' sx={{ fontWeight: 800, color: 'warning.main' }}>
                  {fmtHours(summary.pendingHours)}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, bgcolor: alpha('#0ea5e9', 0.08) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CustomAvatar skin='light' color='info'>
                <Icon icon='tabler:cash' />
              </CustomAvatar>
              <Box>
                <Typography variant='overline' color='text.secondary'>Total Pay</Typography>
                <Typography variant='h5' sx={{ fontWeight: 800, color: 'info.main' }}>
                  {fmtMoney(summary.totalPay)}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Overtime Records Table */}
      <Card>
        <CardHeader 
          title='Overtime Records'
          subheader={`${total} records for ${MONTHS[new Date(month).getMonth()]}`}
          action={
            roleSlug !== 'employee' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={policy?.overtimePay?.enabled || false}
                    onChange={async (e) => {
                      try {
                        await axiosRequest.patch('/api/v1/payroll-policies/my', {
                          overtimePay: { ...policy.overtimePay, enabled: e.target.checked }
                        })
                        fetchPolicy()
                        toast.success(`Overtime pay ${e.target.checked ? 'enabled' : 'disabled'}`)
                      } catch (error) {
                        toast.error('Failed to update policy')
                      }
                    }}
                  />
                }
                label='Overtime Pay Enabled'
              />
            )
          }
        />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Hours</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Purpose</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align='right'>Eligible Pay</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Status</TableCell>
                {roleSlug !== 'employee' && (
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align='center'>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={roleSlug !== 'employee' ? 7 : 6} sx={{ textAlign: 'center', py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : overtimeRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={roleSlug !== 'employee' ? 7 : 6} sx={{ textAlign: 'center', py: 8 }}>
                    <Icon icon='tabler:clock-off' fontSize={48} style={{ color: '#94a3b8', display: 'block', margin: '0 auto 12px' }} />
                    <Typography variant='body1' color='text.secondary'>No overtime records found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                overtimeRecords.map(record => {
                  const statusConfig = STATUS_COLORS[record.status] || STATUS_COLORS.PENDING
                  const otPay = calculateOvertimePay(record.hours, record.employee?.salary?.basic || record.basic)
                  
                  return (
                    <TableRow key={record._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CustomAvatar skin='light' color='primary' sx={{ width: 32, height: 32 }}>
                            {empInitials(record.employee?.name)}
                          </CustomAvatar>
                          <Box>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>{record.employee?.name}</Typography>
                            <Typography variant='caption' color='text.secondary'>{record.employee?.employeeId}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>{fmtHours(record.hours)}</Typography>
                        {record.startTime && record.endTime && (
                          <Typography variant='caption' color='text.secondary'>
                            {record.startTime} - {record.endTime}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>{record.purpose || '—'}</Typography>
                        {record.project && (
                          <Typography variant='caption' color='text.secondary'>Project: {record.project}</Typography>
                        )}
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2' sx={{ fontWeight: 600, color: policy?.overtimePay?.enabled ? 'success.main' : 'text.disabled' }}>
                          {fmtMoney(policy?.overtimePay?.enabled ? otPay : 0)}
                        </Typography>
                        {policy?.overtimePay?.enabled && (
                          <Typography variant='caption' color='text.secondary'>
                            @{policy.overtimePay.rateMultiplier}x
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={record.status}
                          size='small'
                          sx={{ 
                            fontWeight: 700,
                            bgcolor: statusConfig.bgColor,
                            color: statusConfig.color
                          }}
                        />
                      </TableCell>
                      {roleSlug !== 'employee' && (
                        <TableCell align='center'>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            {record.status === 'PENDING' && (
                              <>
                                <Tooltip title='Approve'>
                                  <IconButton 
                                    size='small' 
                                    color='success'
                                    onClick={() => handleApprove(record._id)}
                                  >
                                    <Icon icon='tabler:check' fontSize={18} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title='Reject'>
                                  <IconButton 
                                    size='small' 
                                    color='error'
                                    onClick={() => handleReject(record._id)}
                                  >
                                    <Icon icon='tabler:x' fontSize={18} />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title='View Details'>
                              <IconButton size='small'>
                                <Icon icon='tabler:eye' fontSize={18} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            component='div'
            count={total}
            page={page}
            rowsPerPage={limit}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={e => { setLimit(parseInt(e.target.value)); setPage(0) }}
            rowsPerPageOptions={[20, 50, 100]}
          />
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card sx={{ mt: 4 }}>
        <CardHeader title='How Overtime Works' />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle2' gutterBottom>Calculation Formula</Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                <strong>Hourly Rate</strong> = Monthly Basic ÷ 26 days ÷ 8 hours<br />
                <strong>Overtime Pay</strong> = Hours × Rate Multiplier × Hourly Rate
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Example: If Basic = ₹20,000, and overtime = 5 hours at 1.5x multiplier:<br />
                Hourly Rate = ₹20,000 ÷ 26 ÷ 8 = ₹96.15/hour<br />
                OT Pay = 5 × 1.5 × ₹96.15 = <strong>₹720</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle2' gutterBottom>Policy Settings</Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                <strong>Rate Multiplier:</strong> {policy?.overtimePay?.rateMultiplier || 1.5}x (standard is 1.5x or 2x)<br />
                <strong>Cap Hours:</strong> {policy?.overtimePay?.capHoursPerMonth || 'No limit'} per month<br />
                <strong>Payable Component:</strong> {policy?.overtimePay?.payableComponent || 'BASIC'}
              </Typography>
              <Button 
                variant='outlined' 
                size='small'
                onClick={() => router.push('/policy?tab=payroll')}
              >
                Configure Policy
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
