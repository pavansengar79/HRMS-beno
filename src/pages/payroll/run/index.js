// src/pages/payroll/run/index.js
// REAL API — POST /api/v1/payroll-policies/run + GET /api/v1/payslips
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { runPayrollAll, runPayrollSingle, fetchAllPayslips, publishPayslip, publishAllPayslips, markPayslipPaid } from 'src/store/payroll/payrollSlice'
import { fetchAllEmployees } from 'src/store/employee/employeeSlice'
import toast from 'react-hot-toast'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { alpha, useTheme } from '@mui/material/styles'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import { useRouter } from 'next/router'
import { selectRoleSlug } from 'src/store/auth/authSlice'
import PayrollTabs from '../PayrollTabs'

const fmt = n => n == null ? '—' : '₹' + Math.round(n).toLocaleString('en-IN')
const fmtDate = s => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const STATUS_CONFIG = {
  DRAFT:     { color: '#8b5cf6', label: 'Draft'     },
  PUBLISHED: { color: '#10b981', label: 'Published' },
  PAID:      { color: '#0ea5e9', label: 'Paid'      },
}

const MONTH_OPTIONS = (() => {
  const opts = []; const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    opts.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return opts
})()

export default function RunPayroll() {
  const dispatch = useDispatch()
  const router = useRouter()
  const roleSlug = useSelector(selectRoleSlug)
  const theme = useTheme(); const isDark = theme.palette.mode === 'dark'
  const { payslips, payslipsTotal, payslipsLoading, runLoading, lastResult } = useSelector(s => s.payroll)
  const { allEmployees } = useSelector(s => s.employee)

  const now = new Date()
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  const [actionLoading, setActionLoading] = useState(null)

  // Employees can't run payroll — bounce them to their own payslips.
  useEffect(() => {
    if (roleSlug === 'employee') router.replace('/payroll/my')
  }, [roleSlug, router])

  useEffect(() => {
    dispatch(fetchAllEmployees({}))
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchAllPayslips({ month }))
  }, [dispatch, month])

  const handleRunAll = async () => {
    try {
      const res = await dispatch(runPayrollAll({ month })).unwrap()
      const s = res?.data?.summary ?? res?.summary ?? {}
      toast.success(`Payroll run complete. Processed: ${s.processed ?? 0}, Failed: ${s.failed ?? 0}`)
      dispatch(fetchAllPayslips({ month }))
    } catch (e) { toast.error(String(e)) }
  }

  const handleRunSingle = async (empId, empName) => {
    setActionLoading(`run-${empId}`)
    try {
      await dispatch(runPayrollSingle({ empId, month })).unwrap()
      toast.success(`Payroll run for ${empName}`)
      dispatch(fetchAllPayslips({ month }))
    } catch (e) { toast.error(String(e)) }
    finally { setActionLoading(null) }
  }

  const handlePublish = async (id) => {
    setActionLoading(`pub-${id}`)
    try {
      await dispatch(publishPayslip(id)).unwrap()
      toast.success('Payslip published & email sent')
    } catch (e) { toast.error(String(e)) }
    finally { setActionLoading(null) }
  }

  const handlePublishAll = async () => {
    try {
      await dispatch(publishAllPayslips()).unwrap()
      toast.success('All payslips published')
      dispatch(fetchAllPayslips({ month }))
    } catch (e) { toast.error(String(e)) }
  }

  const handleMarkPaid = async (id) => {
    setActionLoading(`paid-${id}`)
    try {
      await dispatch(markPayslipPaid({ id, paymentMode: 'BANK_TRANSFER' })).unwrap()
      toast.success('Marked as paid')
    } catch (e) { toast.error(String(e)) }
    finally { setActionLoading(null) }
  }

  const draftPayslips     = payslips.filter(p => p.status === 'DRAFT')
  const publishedPayslips = payslips.filter(p => p.status === 'PUBLISHED')

  return (
    <PayrollTabs activeTab='run-payroll'>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>Run Payroll</Typography>
          <Typography variant='body2' color='text.secondary'>Process payroll for all employees</Typography>
        </Box>
        <CustomTextField select value={month} onChange={e => setMonth(e.target.value)} size='small' sx={{ minWidth: 160 }}>
          {MONTH_OPTIONS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
        </CustomTextField>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Employees', value: allEmployees?.length ?? 0, icon: 'tabler:users', color: '#6366f1' },
          { label: 'Payslips Generated', value: payslips.length, icon: 'tabler:file-invoice', color: '#10b981' },
          { label: 'Draft', value: draftPayslips.length, icon: 'tabler:file-description', color: '#8b5cf6' },
          { label: 'Published', value: publishedPayslips.length, icon: 'tabler:circle-check', color: '#0ea5e9' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card>
              <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(s.color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon icon={s.icon} fontSize={20} style={{ color: s.color }} />
                </Box>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 800, lineHeight: 1 }}>{s.value}</Typography>
                  <Typography variant='caption' color='text.secondary'>{s.label}</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action Bar */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction='row' spacing={2} flexWrap='wrap'>
            <Button variant='contained' startIcon={runLoading ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:player-play' />}
              onClick={handleRunAll} disabled={runLoading}>
              Run Payroll for {month}
            </Button>
            {draftPayslips.length > 0 && (
              <Button variant='outlined' color='success' startIcon={<Icon icon='tabler:send' />} onClick={handlePublishAll}>
                Publish All ({draftPayslips.length})
              </Button>
            )}
          </Stack>
          {lastResult && (
            <Alert severity='success' sx={{ mt: 2 }}>
              Processed: {lastResult?.summary?.processed ?? 0} · Failed: {lastResult?.summary?.failed ?? 0}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payslips Table */}
      <Card>
        <CardHeader
          title={<Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Payslips — {month}</Typography>}
          subheader={<Typography variant='caption' color='text.secondary'>{payslipsTotal} total payslips</Typography>}
        />
        {payslipsLoading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              {['Employee', 'Gross Salary', 'Net Salary', 'LOP Days', 'PF', 'ESI', 'Status', 'Actions'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {payslips.length === 0 && !payslipsLoading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6 }}>
                  <Icon icon='tabler:file-off' fontSize={40} style={{ color: '#94a3b8', display: 'block', margin: '0 auto 8px' }} />
                  <Typography variant='body2' color='text.secondary'>No payslips for {month}. Run payroll to generate.</Typography>
                </TableCell>
              </TableRow>
            ) : payslips.map(p => {
              const sc = STATUS_CONFIG[p.status] || {}
              const emp = p.employee_id || p.employeeId || {}
              const d = p.deductions || {}
              return (
                <TableRow key={p._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontSize: 12, fontWeight: 800 }}>
                        {(emp.name || '?').charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>{emp.name || 'Unknown'}</Typography>
                        <Typography variant='caption' color='text.secondary'>{emp.employeeId}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant='body2' sx={{ fontWeight: 600 }}>{fmt(p.grossSalary)}</Typography></TableCell>
                  <TableCell><Typography variant='body2' sx={{ fontWeight: 700, color: '#10b981' }}>{fmt(p.netSalary)}</Typography></TableCell>
                  <TableCell><Typography variant='body2'>{p.lopDays ?? 0}d</Typography></TableCell>
                  <TableCell><Typography variant='body2'>{fmt(d.pf)}</Typography></TableCell>
                  <TableCell><Typography variant='body2'>{fmt(d.esi)}</Typography></TableCell>
                  <TableCell>
                    <Chip label={sc.label || p.status} size='small' sx={{ fontWeight: 700, fontSize: 11, bgcolor: alpha(sc.color || '#8b5cf6', 0.1), color: sc.color || '#8b5cf6' }} />
                  </TableCell>
                  <TableCell>
                    <Stack direction='row' spacing={1}>
                      {p.status === 'DRAFT' && (
                        <Button size='small' variant='outlined' color='success' sx={{ height: 26, fontSize: 10 }}
                          disabled={actionLoading === `pub-${p._id}`}
                          onClick={() => handlePublish(p._id)}>
                          {actionLoading === `pub-${p._id}` ? <CircularProgress size={12} /> : 'Publish'}
                        </Button>
                      )}
                      {p.status === 'PUBLISHED' && (
                        <Button size='small' variant='outlined' color='primary' sx={{ height: 26, fontSize: 10 }}
                          disabled={actionLoading === `paid-${p._id}`}
                          onClick={() => handleMarkPaid(p._id)}>
                          {actionLoading === `paid-${p._id}` ? <CircularProgress size={12} /> : 'Mark Paid'}
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </PayrollTabs>
  )
}
