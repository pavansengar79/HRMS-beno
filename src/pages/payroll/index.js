// src/views/payroll/PayrollDashboard.jsx
import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Drawer from '@mui/material/Drawer'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAvatar from 'src/@core/components/mui/avatar'

import { fetchAllEmployees } from 'src/store/employee/employeeSlice'
import { runPayrollSingle, runPayrollAll } from 'src/store/payroll/payrollSlice'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = n => {
  if (n == null) return '—'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

const fmtFull = n => {
  if (n == null) return '—'
  return '₹' + (Math.round(n * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const fmtDate = s =>
  s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const empInitials = name =>
  (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

const MONTH_OPTIONS = [
  { label: 'May 2026',  value: '2026-05' },
  { label: 'Apr 2026',  value: '2026-04' },
  { label: 'Mar 2026',  value: '2026-03' },
  { label: 'Feb 2026',  value: '2026-02' },
  { label: 'Jan 2026',  value: '2026-01' },
]

// ─── Attendance Chip ──────────────────────────────────────────────────────────

const AttChip = ({ label, value, color = 'default' }) => {
  if (!value && value !== 0) return null
  return (
    <Chip
      size='small'
      variant='tonal'
      color={color}
      label={`${label}: ${value}`}
      sx={{ fontSize: '0.7rem' }}
    />
  )
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

const DetailRow = ({ label, value, valueColor, bold }) => (
  <TableRow>
    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', py: 0.75, pl: 0, border: 'none', width: '55%' }}>
      {label}
    </TableCell>
    <TableCell sx={{
      fontSize: '0.8rem', py: 0.75, pr: 0, border: 'none',
      textAlign: 'right',
      fontWeight: bold ? 600 : 400,
      color: valueColor || 'text.primary'
    }}>
      {value}
    </TableCell>
  </TableRow>
)

// ─── Summary Metric Card ──────────────────────────────────────────────────────

const MetricCard = ({ title, value, sub, icon, iconColor }) => (
  <Card variant='outlined'>
    <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, py: '12px !important', px: 3 }}>
      <Box sx={{
        width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
        bgcolor: `${iconColor}.lighter` || 'action.hover',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon icon={icon} fontSize='1.2rem' color={iconColor} />
      </Box>
      <Box>
        <Typography variant='caption' color='text.secondary'>{title}</Typography>
        <Typography variant='h5' sx={{ mt: 0.25 }}>{value}</Typography>
        {sub && <Typography variant='caption' color='text.secondary'>{sub}</Typography>}
      </Box>
    </CardContent>
  </Card>
)

// ─── Payslip Drawer ───────────────────────────────────────────────────────────

const PayslipDrawer = ({ open, onClose, data }) => {
  if (!data) return null
  const p = data

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 560 } } }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 5, py: 4, borderBottom: t => `1px solid ${t.palette.divider}`
      }}>
        <Typography variant='h6'>Payslip</Typography>
        <IconButton size='small' onClick={onClose}><Icon icon='tabler:x' /></IconButton>
      </Box>

      <Box sx={{ px: 5, py: 4, overflow: 'auto', flex: 1 }}>

        {/* Employee banner */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 3, mb: 5,
          p: 3, borderRadius: 2, bgcolor: 'action.hover'
        }}>
          <CustomAvatar skin='light' color='primary' sx={{ width: 46, height: 46, fontSize: '1rem' }}>
            {empInitials(p.employee?.name)}
          </CustomAvatar>
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={600}>{p.employee?.name}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {p.employee?.employeeId} · {p.employee?.email}
            </Typography>
            <Typography variant='caption' color='text.secondary' display='block'>
              {p.employee?.employmentType?.replace('_', ' ')} · Policy: {p.payrollPolicyName}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant='caption' color='text.secondary'>Pay period</Typography>
            <Typography variant='body2' fontWeight={600}>{p.month}</Typography>
            <Typography variant='caption' color='text.secondary'>{fmtDate(p.generatedAt)}</Typography>
          </Box>
        </Box>

        {/* Net salary highlight */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          p: 3, mb: 5, borderRadius: 2,
          bgcolor: 'success.lighter', border: t => `1px solid ${t.palette.success.light}`
        }}>
          <Box>
            <Typography variant='caption' color='text.secondary'>Net salary</Typography>
            <Typography variant='h4' color='success.main'>{fmtFull(p.netSalary)}</Typography>
            <Typography variant='caption' color='text.secondary'>{p.currency || 'INR'}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant='caption' color='text.secondary'>Employer contributions</Typography>
            {p.employerContributions?.pfEmployer ? (
              <Typography variant='body2'>PF: {fmtFull(p.employerContributions.pfEmployer)}</Typography>
            ) : null}
            {p.employerContributions?.esiEmployer ? (
              <Typography variant='body2'>ESI: {fmtFull(p.employerContributions.esiEmployer)}</Typography>
            ) : null}
          </Box>
        </Box>

        {/* Earnings & Deductions */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Typography variant='overline' color='text.secondary' display='block' sx={{ mb: 1 }}>Earnings</Typography>
            <Table size='small'>
              <TableBody>
                <DetailRow label='Basic salary'       value={fmtFull(p.earnings?.basic)} />
                <DetailRow label='HRA'                value={fmtFull(p.earnings?.hra)} />
                <DetailRow label='Travel allowance'   value={fmtFull(p.earnings?.travelAllowance)} />
                {p.earnings?.medicalAllowance  ? <DetailRow label='Medical allowance'  value={fmtFull(p.earnings.medicalAllowance)} /> : null}
                {p.earnings?.specialAllowance  ? <DetailRow label='Special allowance'  value={fmtFull(p.earnings.specialAllowance)} /> : null}
                {p.earnings?.overtimeAmount    ? <DetailRow label='Overtime'           value={fmtFull(p.earnings.overtimeAmount)} /> : null}
                <DetailRow label='Gross salary' value={fmtFull(p.earnings?.grossSalary)} valueColor='success.main' bold />
              </TableBody>
            </Table>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='overline' color='text.secondary' display='block' sx={{ mb: 1 }}>Deductions</Typography>
            <Table size='small'>
              <TableBody>
                <DetailRow label='PF (employee)'  value={fmtFull(p.deductions?.pfEmployee)}  valueColor='error.main' />
                <DetailRow label='ESI (employee)' value={fmtFull(p.deductions?.esiEmployee)} valueColor='error.main' />
                <DetailRow label='TDS'            value={fmtFull(p.deductions?.tds)}         valueColor='error.main' />
                {p.deductions?.lop ? <DetailRow label='LOP deduction' value={fmtFull(p.deductions.lop)} valueColor='error.main' /> : null}
                <DetailRow label='Total deducted' value={fmtFull(p.deductions?.total)} valueColor='error.main' bold />
              </TableBody>
            </Table>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        {/* Attendance */}
        <Typography variant='overline' color='text.secondary' display='block' sx={{ mb: 2 }}>Attendance</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
          <AttChip label='Present'     value={p.attendance?.present}     color='success' />
          <AttChip label='Absent'      value={p.attendance?.absent}      color='error' />
          <AttChip label='Half day'    value={p.attendance?.halfDay}      color='warning' />
          <AttChip label='On leave'    value={p.attendance?.onLeave}      color='info' />
          <AttChip label='Holiday'     value={p.attendance?.holiday} />
          <AttChip label='Weekend'     value={p.attendance?.weekend} />
          <AttChip label='Late'        value={p.attendance?.lateCount}    color='warning' />
          <AttChip label='WFH'         value={p.attendance?.wfh}         color='info' />
          <AttChip label='Payable days' value={p.attendance?.payableDays} color='primary' />
          <AttChip label='Work days'   value={p.attendance?.workDaysInMonth} />
        </Box>

        {/* LOP */}
        {p.lop?.lopDays > 0 && (
          <>
            <Typography variant='overline' color='text.secondary' display='block' sx={{ mb: 1 }}>Loss of pay</Typography>
            <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
              <Box><Typography variant='caption' color='text.secondary'>LOP days</Typography><Typography variant='body2' fontWeight={600}>{p.lop.lopDays}</Typography></Box>
              <Box><Typography variant='caption' color='text.secondary'>Actual LOP</Typography><Typography variant='body2' fontWeight={600}>{p.lop.actualLopDays}</Typography></Box>
              <Box><Typography variant='caption' color='text.secondary'>LOP deduction</Typography><Typography variant='body2' fontWeight={600} color='error.main'>{fmtFull(p.lop.lopDeduction)}</Typography></Box>
            </Box>
          </>
        )}

      </Box>
    </Drawer>
  )
}

// ─── Employee Result Card ─────────────────────────────────────────────────────

const EmpResultCard = ({ result, index, onViewPayslip }) => {
  const r = result
  return (
    <Card variant='outlined' sx={{ mb: 3 }}>
      <CardContent sx={{ py: '12px !important', px: 3 }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CustomAvatar skin='light' color='primary' sx={{ width: 38, height: 38, fontSize: '0.85rem' }}>
            {empInitials(r.employee?.name)}
          </CustomAvatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2' fontWeight={600}>{r.employee?.name}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {r.employee?.employeeId} · {r.employee?.employmentType?.replace('_', ' ')} · {r.payrollPolicyName}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant='h6' color='success.main'>{fmtFull(r.netSalary)}</Typography>
            <Typography variant='caption' color='text.secondary'>net salary</Typography>
          </Box>
          <Tooltip title='View full payslip'>
            <IconButton size='small' onClick={() => onViewPayslip(r)}>
              <Icon icon='tabler:eye' fontSize='1rem' />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Earnings + Deductions */}
        <Grid container spacing={4}>
          <Grid item xs={12} sm={5}>
            <Typography variant='overline' color='text.secondary' sx={{ fontSize: '0.65rem' }}>Earnings</Typography>
            <Table size='small'>
              <TableBody>
                <DetailRow label='Basic'          value={fmtFull(r.earnings?.basic)} />
                <DetailRow label='HRA'            value={fmtFull(r.earnings?.hra)} />
                <DetailRow label='Travel'         value={fmtFull(r.earnings?.travelAllowance)} />
                {r.earnings?.overtimeAmount ? <DetailRow label='Overtime' value={fmtFull(r.earnings.overtimeAmount)} /> : null}
                <DetailRow label='Gross' value={fmtFull(r.earnings?.grossSalary)} valueColor='success.main' bold />
              </TableBody>
            </Table>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Typography variant='overline' color='text.secondary' sx={{ fontSize: '0.65rem' }}>Deductions</Typography>
            <Table size='small'>
              <TableBody>
                <DetailRow label='PF'  value={fmtFull(r.deductions?.pfEmployee)}  valueColor='error.main' />
                <DetailRow label='ESI' value={fmtFull(r.deductions?.esiEmployee)} valueColor='error.main' />
                <DetailRow label='TDS' value={fmtFull(r.deductions?.tds)}         valueColor='error.main' />
                <DetailRow label='Total deducted' value={fmtFull(r.deductions?.total)} valueColor='error.main' bold />
              </TableBody>
            </Table>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant='overline' color='text.secondary' sx={{ fontSize: '0.65rem' }}>Attendance</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
              <Typography variant='caption'>Present: <strong>{r.attendance?.present ?? 0}</strong></Typography>
              <Typography variant='caption'>Payable: <strong>{r.attendance?.payableDays ?? 0}d</strong></Typography>
              <Typography variant='caption'>LOP: <strong>{r.lop?.lopDays ?? 0}d</strong></Typography>
              {r.attendance?.lateCount ? <Typography variant='caption'>Late: <strong>{r.attendance.lateCount}</strong></Typography> : null}
            </Box>
          </Grid>
        </Grid>

        {/* Employer contributions */}
        {(r.employerContributions?.pfEmployer || r.employerContributions?.esiEmployer) ? (
          <Box sx={{ mt: 2, pt: 2, borderTop: t => `1px solid ${t.palette.divider}`, display: 'flex', gap: 4 }}>
            <Typography variant='caption' color='text.secondary'>Employer contributions:</Typography>
            {r.employerContributions?.pfEmployer  ? <Typography variant='caption'>PF: <strong>{fmtFull(r.employerContributions.pfEmployer)}</strong></Typography>  : null}
            {r.employerContributions?.esiEmployer ? <Typography variant='caption'>ESI: <strong>{fmtFull(r.employerContributions.esiEmployer)}</strong></Typography> : null}
          </Box>
        ) : null}
      </CardContent>
    </Card>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const PayrollDashboard = () => {
  const dispatch = useDispatch()

  const [tab,         setTab]         = useState('run')
  const [month,       setMonth]       = useState('2026-05')
  const [selectedEmp, setSelectedEmp] = useState('')   // '' = all
  const [running,     setRunning]     = useState(false)
  const [runResult,   setRunResult]   = useState(null)  // { results[], errors[], summary } or single result
  const [runError,    setRunError]    = useState(null)
  const [payslipData, setPayslipData] = useState(null)  // drawer
  const [drawerOpen,  setDrawerOpen]  = useState(false)

  // Employees from Redux
  const { list: employees = [], loading: empLoading } = useSelector(state => state.employee)

  useEffect(() => {
    dispatch(fetchAllEmployees())
  }, [dispatch])

  // ── Run payroll ─────────────────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    setRunning(true)
    setRunError(null)
    setRunResult(null)
    try {
      let res
      if (selectedEmp) {
        res = await dispatch(runPayrollSingle({ empId: selectedEmp, month })).unwrap()
        // Single: wrap into same shape as bulk for unified rendering
        setRunResult({
          results: [res?.data ?? res],
          errors:  [],
          summary: {
            totalEmployees: 1,
            processed:      1,
            failed:         0,
            totalGross:     res?.data?.earnings?.grossSalary ?? res?.earnings?.grossSalary ?? 0,
            totalNet:       res?.data?.netSalary            ?? res?.netSalary ?? 0,
            totalPF:        res?.data?.deductions?.pfEmployee ?? 0,
            totalESI:       res?.data?.deductions?.esiEmployee ?? 0,
            totalTDS:       res?.data?.deductions?.tds ?? 0,
            month,
          }
        })
      } else {
        res = await dispatch(runPayrollAll({ month })).unwrap()
        setRunResult(res?.data ?? res)
      }
      toast.success('Payroll processed successfully')
      setTab('results')
    } catch (err) {
      setRunError(typeof err === 'string' ? err : err?.message || 'Payroll run failed')
      toast.error(typeof err === 'string' ? err : 'Payroll run failed')
    } finally {
      setRunning(false)
    }
  }, [dispatch, selectedEmp, month])

  // ── View payslip ────────────────────────────────────────────────────────────
  const openPayslip = useCallback(result => {
    setPayslipData(result)
    setDrawerOpen(true)
  }, [])

  // ── Derived metrics ─────────────────────────────────────────────────────────
  const summary = runResult?.summary || {}

  return (
    <>
      <Grid container spacing={6}>

        {/* ── Metric cards (show after run) ─────────────── */}
        {runResult && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title='Employees processed'
                value={`${summary.processed ?? 0} / ${summary.totalEmployees ?? 0}`}
                sub={summary.failed ? `${summary.failed} failed` : 'All successful'}
                icon='tabler:users'
                iconColor='primary'
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title='Total gross'
                value={fmt(summary.totalGross)}
                sub='Before deductions'
                icon='tabler:wallet'
                iconColor='info'
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title='Total net payout'
                value={fmt(summary.totalNet)}
                sub='After all deductions'
                icon='tabler:cash'
                iconColor='success'
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title='Total deductions'
                value={fmt((summary.totalGross ?? 0) - (summary.totalNet ?? 0))}
                sub={`PF ₹${Math.round(summary.totalPF ?? 0).toLocaleString('en-IN')} · TDS ₹${Math.round(summary.totalTDS ?? 0).toLocaleString('en-IN')}`}
                icon='tabler:minus'
                iconColor='warning'
              />
            </Grid>
          </>
        )}

        {/* ── Tabs ──────────────────────────────────────── */}
        <Grid item xs={12}>
          <Card>
            <TabContext value={tab}>
              <CardHeader
                title='Payroll management'
                sx={{ pb: 0 }}
                action={
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={(_, v) => setTab(v)}>
                      <Tab label='Run payroll' value='run' />
                      <Tab label='Results'     value='results' disabled={!runResult} />
                    </TabList>
                  </Box>
                }
              />

              {/* ── Run tab ─────────────────────────────── */}
              <TabPanel value='run' sx={{ pt: 0 }}>
                <CardContent>

                  {/* Controls */}
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-end', mb: 5 }}>
                    <CustomTextField
                      select
                      label='Pay month'
                      value={month}
                      onChange={e => setMonth(e.target.value)}
                      // sx={{ minWidth: 160 }}
                    >
                      {MONTH_OPTIONS.map(o => (
                        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                      ))}
                    </CustomTextField>

                    <CustomTextField
                      select
                      label='Employee'
                      value={selectedEmp}
                      onChange={e => setSelectedEmp(e.target.value)}
                      // sx={{ minWidth: 240 }}
                    >
                      <MenuItem value=''>All employees (tenant-wide)</MenuItem>
                      {employees.map(e => (
                        <MenuItem key={e._id} value={e._id}>
                          {e.name} ({e.employeeId})
                        </MenuItem>
                      ))}
                    </CustomTextField>

                    <Button
                      variant='contained'
                      onClick={handleRun}
                      disabled={running || empLoading}
                      startIcon={running
                        ? <CircularProgress size={16} color='inherit' />
                        : <Icon icon='tabler:player-play' />
                      }
                    >
                      {running ? 'Processing...' : 'Run payroll'}
                    </Button>
                  </Box>

                  {/* Error */}
                  {runError && (
                    <Alert severity='error' sx={{ mb: 4 }} onClose={() => setRunError(null)}>
                      {runError}
                    </Alert>
                  )}

                  {/* Employee list */}
                  <Typography variant='overline' color='text.secondary' display='block' sx={{ mb: 2 }}>
                    Active employees
                  </Typography>

                  {empLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    employees.map((emp, i) => (
                      <Box
                        key={emp._id}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 3,
                          py: 2.5, px: 2,
                          borderBottom: i < employees.length - 1 ? t => `1px solid ${t.palette.divider}` : 'none',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          transition: 'background .15s'
                        }}
                        onClick={() => setSelectedEmp(emp._id)}
                      >
                        <CustomAvatar skin='light' color='primary' sx={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                          {empInitials(emp.name)}
                        </CustomAvatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant='body2' fontWeight={500}>{emp.name}</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {emp.employeeId} · {emp.department?.name || emp.departmentId?.name || '—'}
                          </Typography>
                        </Box>
                        <Chip
                          size='small'
                          variant='tonal'
                          label={(emp.employmentType || '').replace('_', ' ')}
                          color='default'
                          sx={{ fontSize: '0.7rem' }}
                        />
                        {selectedEmp === emp._id && (
                          <Chip size='small' color='primary' variant='tonal' label='Selected' sx={{ fontSize: '0.7rem' }} />
                        )}
                        <Icon icon='tabler:chevron-right' fontSize='1rem' color='text.secondary' />
                      </Box>
                    ))
                  )}
                </CardContent>
              </TabPanel>

              {/* ── Results tab ─────────────────────────── */}
              <TabPanel value='results' sx={{ pt: 0 }}>
                <CardContent>

                  {!runResult ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                      <Icon icon='tabler:player-play' fontSize='2.5rem' color='text.secondary' />
                      <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                        Run payroll first to see results.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {/* Progress bar */}
                      <Box sx={{ mb: 5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant='body2'>
                            Processed {summary.processed} of {summary.totalEmployees} employees
                          </Typography>
                          {summary.failed > 0 && (
                            <Chip size='small' color='error' variant='tonal' label={`${summary.failed} failed`} />
                          )}
                        </Box>
                        <LinearProgress
                          variant='determinate'
                          value={summary.totalEmployees ? (summary.processed / summary.totalEmployees) * 100 : 0}
                          color='success'
                          sx={{ borderRadius: 1, height: 6 }}
                        />
                      </Box>

                      {/* Results */}
                      {(runResult.results || []).map((r, i) => (
                        <EmpResultCard
                          key={r.employee?.id || i}
                          result={r}
                          index={i}
                          onViewPayslip={openPayslip}
                        />
                      ))}

                      {/* Errors */}
                      {runResult.errors?.length > 0 && (
                        <Alert severity='error' sx={{ mt: 2 }}>
                          <Typography variant='body2' fontWeight={600} sx={{ mb: 1 }}>
                            {runResult.errors.length} employee(s) failed
                          </Typography>
                          {runResult.errors.map((e, i) => (
                            <Typography key={i} variant='caption' display='block'>
                              {e.employee?.name || e.employeeId || 'Unknown'}: {e.error || e.message || JSON.stringify(e)}
                            </Typography>
                          ))}
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </TabPanel>
            </TabContext>
          </Card>
        </Grid>
      </Grid>

      {/* Payslip Drawer */}
      <PayslipDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={payslipData}
      />
    </>
  )
}

export default PayrollDashboard