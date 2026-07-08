// src/pages/payroll/index.js
// "Salary Register" (Admin/HR) tab — GET /api/v1/payslips with enterprise-grade
// multi-select, bulk actions, and all backend fields displayed like HRMS Enterprise.
import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Checkbox from '@mui/material/Checkbox'
import Toolbar from '@mui/material/Toolbar'
import Menu from '@mui/material/Menu'
import Fade from '@mui/material/Fade'
import { alpha } from '@mui/material/styles'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'

import { selectRoleSlug } from 'src/store/auth/authSlice'
import { fetchAllEmployees } from 'src/store/employee/employeeSlice'
import { publishPayslip, markPayslipPaid } from 'src/store/payroll/payrollSlice'

import PayrollTabs from './PayrollTabs'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = n => n == null ? '—' : '₹' + Math.round(n).toLocaleString('en-IN')
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const STATUS_CONFIG = {
  DRAFT:     { color: '#8b5cf6', label: 'Draft',     icon: 'tabler:file-description' },
  PUBLISHED: { color: '#10b981', label: 'Published', icon: 'tabler:circle-check' },
  PAID:      { color: '#0ea5e9', label: 'Paid',      icon: 'tabler:cash' },
}

const STATUS_OPTIONS = ['ALL', 'DRAFT', 'PUBLISHED', 'PAID']

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ label: MONTH_NAMES[i], value: String(i + 1) }))
const YEAR_OPTIONS = (() => {
  const now = new Date().getFullYear()
  return [now, now - 1, now - 2].map(String)
})()

const DetailRow = ({ label, value, valueColor, bold }) => (
  <TableRow>
    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', py: 0.75, pl: 0, border: 'none', width: '55%' }}>{label}</TableCell>
    <TableCell sx={{ fontSize: '0.8rem', py: 0.75, pr: 0, border: 'none', textAlign: 'right', fontWeight: bold ? 600 : 400, color: valueColor || 'text.primary' }}>{value}</TableCell>
  </TableRow>
)

// ─── Main Page ────────────────────────────────────────────────────────────────
const SalaryRegister = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const roleSlug = useSelector(selectRoleSlug)
  const { allEmployees = [] } = useSelector(s => s.employee || {})

  // Employees don't manage payroll — send them to their own payslips instead.
  useEffect(() => {
    if (roleSlug === 'employee') router.replace('/payroll/my')
  }, [roleSlug, router])

  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [status, setStatus] = useState('ALL')
  const [employeeId, setEmployeeId] = useState('')
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(20)

  const [payslips, setPayslips] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [payslipDetail, setPayslipDetail] = useState(null)

  // Multi-select state
  const [selected, setSelected] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [bulkActionAnchor, setBulkActionAnchor] = useState(null)

  useEffect(() => {
    dispatch(fetchAllEmployees({}))
  }, [dispatch])

  const fetchPayslips = useCallback(async () => {
    setLoading(true)
    try {
      // Ensure numeric month and year
      const monthNum = parseInt(String(month), 10) || 1
      const yearNum = parseInt(String(year), 10) || new Date().getFullYear()
      
      const params = { 
        month: monthNum, 
        year: yearNum, 
        page: page + 1, 
        limit 
      }
      
      if (status !== 'ALL') params.status = status
      if (employeeId) params.employee = employeeId

      const body = await axiosRequest.get('/api/v1/payslips', { params })
      const d = body?.data ?? body
      setPayslips(d?.payslips ?? d?.data ?? [])
      setTotal(d?.pagination?.total ?? d?.total ?? 0)
    } catch (err) {
      console.error('Failed to fetch payslips:', err)
      toast.error('Failed to load payslips')
    } finally {
      setLoading(false)
    }
  }, [month, year, status, employeeId, page, limit])

  useEffect(() => {
    fetchPayslips()
  }, [fetchPayslips])

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleViewDetail = async (payslip) => {
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const body = await axiosRequest.get(`/api/v1/payslips/${payslip._id}`)
      setPayslipDetail(body?.data ?? body)
    } catch (err) {
      toast.error('Failed to load payslip details')
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const downloadPayslipPdf = async (payslipId, label) => {
    try {
      const response = await axiosRequest.get(`/api/v1/payslips/${payslipId}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `payslip_${label}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Payslip downloaded')
    } catch (err) {
      toast.error('Failed to download payslip')
    }
  }

  const handlePublish = async (id) => {
    setActionLoading(`pub-${id}`)
    try {
      await dispatch(publishPayslip(id)).unwrap()
      toast.success('Payslip published & email sent')
      fetchPayslips()
    } catch (e) { toast.error(String(e)) }
    finally { setActionLoading(null) }
  }

  const handleMarkPaid = async (id) => {
    setActionLoading(`paid-${id}`)
    try {
      await dispatch(markPayslipPaid({ id, paymentMode: 'BANK_TRANSFER' })).unwrap()
      toast.success('Marked as paid')
      fetchPayslips()
    } catch (e) { toast.error(String(e)) }
    finally { setActionLoading(null) }
  }

  const handleDelete = async (id) => {
    setActionLoading(`del-${id}`)
    try {
      await axiosRequest.delete(`/api/v1/payslips/${id}`)
      toast.success('Draft payslip deleted')
      fetchPayslips()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Only DRAFT payslips can be deleted')
    } finally {
      setActionLoading(null)
    }
  }

  // ── Multi-Select Handlers ─────────────────────────────────────────
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = payslips.map(p => p._id)
      setSelected(newSelected)
      setSelectAll(true)
    } else {
      setSelected([])
      setSelectAll(false)
    }
  }

  const handleSelectOne = (id) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    setSelected(newSelected)
    setSelectAll(newSelected.length === payslips.length)
  }

  const isSelected = (id) => selected.indexOf(id) !== -1

  const handleBulkActionClick = (event) => {
    setBulkActionAnchor(event.currentTarget)
  }

  const handleBulkActionClose = () => {
    setBulkActionAnchor(null)
  }

  const handleBulkPublish = async () => {
    if (selected.length === 0) {
      toast.error('Please select payslips to publish')
      return
    }
    
    setActionLoading('bulk-publish')
    try {
      await axiosRequest.patch('/api/v1/payslips/publish-all', {
        month: Number(month),
        year: Number(year),
        ids: selected
      })
      toast.success(`${selected.length} payslips published successfully`)
      setSelected([])
      setSelectAll(false)
      fetchPayslips()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to publish payslips')
    } finally {
      setActionLoading(null)
      handleBulkActionClose()
    }
  }

  const handleBulkMarkPaid = async () => {
    if (selected.length === 0) {
      toast.error('Please select payslips to mark as paid')
      return
    }
    
    setActionLoading('bulk-paid')
    try {
      // Mark all selected payslips as paid
      const promises = selected.map(id => 
        axiosRequest.patch(`/api/v1/payslips/${id}/mark-paid`, {
          paymentMode: 'BANK_TRANSFER',
          paymentDate: new Date().toISOString().split('T')[0]
        })
      )
      await Promise.all(promises)
      toast.success(`${selected.length} payslips marked as paid`)
      setSelected([])
      setSelectAll(false)
      fetchPayslips()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to mark payslips as paid')
    } finally {
      setActionLoading(null)
      handleBulkActionClose()
    }
  }

  const handleBulkDelete = async () => {
    if (selected.length === 0) {
      toast.error('Please select payslips to delete')
      return
    }
    
    if (!confirm(`Are you sure you want to delete ${selected.length} DRAFT payslips?`)) {
      return
    }
    
    setActionLoading('bulk-delete')
    try {
      const promises = selected.map(id => 
        axiosRequest.delete(`/api/v1/payslips/${id}`)
      )
      await Promise.all(promises)
      toast.success(`${selected.length} draft payslips deleted`)
      setSelected([])
      setSelectAll(false)
      fetchPayslips()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete payslips')
    } finally {
      setActionLoading(null)
      handleBulkActionClose()
    }
  }

  const draftCount = payslips.filter(p => p.status === 'DRAFT').length
  const publishedCount = payslips.filter(p => p.status === 'PUBLISHED').length
  const paidCount = payslips.filter(p => p.status === 'PAID').length

  return (
    <PayrollTabs activeTab='salary-register'>
      {/* Header + Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>Salary Register</Typography>
          <Typography variant='body2' color='text.secondary'>Enterprise payslips management with bulk actions</Typography>
        </Box>
        <Stack direction='row' spacing={2} flexWrap='wrap'>
          <CustomTextField select value={month} onChange={e => { setMonth(e.target.value); setPage(0) }} size='small' sx={{ minWidth: 130 }}>
            {MONTH_OPTIONS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
          </CustomTextField>
          <CustomTextField select value={year} onChange={e => { setYear(e.target.value); setPage(0) }} size='small' sx={{ minWidth: 100 }}>
            {YEAR_OPTIONS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </CustomTextField>
          <CustomTextField select value={status} onChange={e => { setStatus(e.target.value); setPage(0) }} size='small' sx={{ minWidth: 130 }}>
            {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</MenuItem>)}
          </CustomTextField>
          <CustomTextField select value={employeeId} onChange={e => { setEmployeeId(e.target.value); setPage(0) }} size='small' sx={{ minWidth: 180 }} displayEmpty>
            <MenuItem value=''>All Employees</MenuItem>
            {allEmployees.map(emp => (
              <MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>
            ))}
          </CustomTextField>
        </Stack>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Payslips', value: total, color: '#6366f1', icon: 'tabler:file-invoice' },
          { label: 'Draft', value: draftCount, color: '#8b5cf6', icon: 'tabler:file-description' },
          { label: 'Published', value: publishedCount, color: '#10b981', icon: 'tabler:circle-check' },
          { label: 'Paid', value: paidCount, color: '#0ea5e9', icon: 'tabler:cash' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card variant='outlined'>
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

      {/* Payslips Table with Multi-Select */}
      <Card>
        {/* Bulk Action Toolbar */}
        {selected.length > 0 && (
          <Toolbar
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              bgcolor: theme => alpha(theme.palette.primary.main, 0.08),
              borderBottom: theme => `1px solid ${theme.palette.divider}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < payslips.length}
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                  {selected.length} selected
                </Typography>
              </Box>
              <Stack direction='row' spacing={1}>
                <Button
                  size='small'
                  variant='outlined'
                  color='success'
                  startIcon={<Icon icon='tabler:send' />}
                  onClick={handleBulkPublish}
                  disabled={actionLoading === 'bulk-publish'}
                >
                  {actionLoading === 'bulk-publish' ? <CircularProgress size={16} /> : 'Publish Selected'}
                </Button>
                <Button
                  size='small'
                  variant='outlined'
                  color='primary'
                  startIcon={<Icon icon='tabler:cash' />}
                  onClick={handleBulkMarkPaid}
                  disabled={actionLoading === 'bulk-paid'}
                >
                  {actionLoading === 'bulk-paid' ? <CircularProgress size={16} /> : 'Mark Paid'}
                </Button>
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<Icon icon='tabler:trash' />}
                  onClick={handleBulkDelete}
                  disabled={actionLoading === 'bulk-delete'}
                >
                  {actionLoading === 'bulk-delete' ? <CircularProgress size={16} /> : 'Delete'}
                </Button>
                <Button
                  size='small'
                  variant='text'
                  onClick={() => { setSelected([]); setSelectAll(false) }}
                >
                  Clear
                </Button>
              </Stack>
            </Box>
          </Toolbar>
        )}

        <CardHeader
          title={<Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Payslips — {MONTH_NAMES[Number(month) - 1]} {year}</Typography>}
          action={
            <Typography variant='caption' color='text.secondary'>
              Showing {payslips.length} of {total}
            </Typography>
          }
        />
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding='checkbox' sx={{ width: 50 }}>
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < payslips.length}
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </TableCell>
              {['Employee', 'Gross', 'Net', 'PF', 'ESI', 'TDS', 'LOP Days', 'Status', 'Actions'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {payslips.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={10} sx={{ textAlign: 'center', py: 6 }}>
                  <Icon icon='tabler:file-off' fontSize={40} style={{ color: '#94a3b8', display: 'block', margin: '0 auto 8px' }} />
                  <Typography variant='body2' color='text.secondary'>No payslips found for these filters</Typography>
                </TableCell>
              </TableRow>
            ) : payslips.map(p => {
              const sc = STATUS_CONFIG[p.status] || {}
              const emp = p.employee_id || p.employeeId || {}
              const d = p.deductions || {}
              const isItemSelected = isSelected(p._id)
              
              return (
                <TableRow 
                  key={p._id} 
                  hover
                  selected={isItemSelected}
                  sx={{ 
                    bgcolor: isItemSelected ? theme => alpha(theme.palette.primary.main, 0.04) : 'inherit'
                  }}
                >
                  <TableCell padding='checkbox'>
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleSelectOne(p._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontSize: 11, fontWeight: 800 }}>
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
                  <TableCell><Typography variant='body2'>{fmt(d.pf)}</Typography></TableCell>
                  <TableCell><Typography variant='body2'>{fmt(d.esi)}</Typography></TableCell>
                  <TableCell><Typography variant='body2'>{fmt(d.tds)}</Typography></TableCell>
                  <TableCell><Typography variant='body2'>{p.lopDays ?? 0}d</Typography></TableCell>
                  <TableCell>
                    <Chip label={sc.label || p.status} size='small' sx={{ fontWeight: 700, fontSize: 11, bgcolor: alpha(sc.color || '#6366f1', 0.1), color: sc.color || '#6366f1' }} />
                  </TableCell>
                  <TableCell>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <Tooltip title='View Details'>
                        <IconButton size='small' onClick={() => handleViewDetail(p)}>
                          <Icon icon='tabler:eye' fontSize={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Download PDF'>
                        <IconButton size='small' onClick={() => downloadPayslipPdf(p._id, `${MONTH_NAMES[(p.month || 1) - 1]}_${p.year}`)}>
                          <Icon icon='mdi:download' fontSize={18} />
                        </IconButton>
                      </Tooltip>
                      {p.status === 'DRAFT' && (
                        <>
                          <Tooltip title='Publish'>
                            <IconButton size='small' color='success' disabled={actionLoading === `pub-${p._id}`} onClick={() => handlePublish(p._id)}>
                              {actionLoading === `pub-${p._id}` ? <CircularProgress size={16} /> : <Icon icon='tabler:send' fontSize={18} />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Delete Draft'>
                            <IconButton size='small' color='error' disabled={actionLoading === `del-${p._id}`} onClick={() => handleDelete(p._id)}>
                              {actionLoading === `del-${p._id}` ? <CircularProgress size={16} /> : <Icon icon='tabler:trash' fontSize={18} />}
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {p.status === 'PUBLISHED' && (
                        <Tooltip title='Mark as Paid'>
                          <IconButton size='small' color='primary' disabled={actionLoading === `paid-${p._id}`} onClick={() => handleMarkPaid(p._id)}>
                            {actionLoading === `paid-${p._id}` ? <CircularProgress size={16} /> : <Icon icon='tabler:cash' fontSize={18} />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <TablePagination
          component='div'
          count={total}
          page={page}
          rowsPerPage={limit}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={e => { setLimit(parseInt(e.target.value)); setPage(0) }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Card>

      {/* Payslip Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setPayslipDetail(null) }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Payslip Details
          <IconButton onClick={() => { setDetailOpen(false); setPayslipDetail(null) }}>
            <Icon icon='tabler:x' />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : payslipDetail ? (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Employee</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>{payslipDetail.employee_id?.name || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Period</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {MONTH_NAMES[(payslipDetail.month || 1) - 1]} {payslipDetail.year}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>Earnings</Typography>
              <Table size='small'>
                <TableBody>
                  <DetailRow label='Basic' value={fmt(payslipDetail.earnings?.basic)} />
                  <DetailRow label='HRA' value={fmt(payslipDetail.earnings?.hra)} />
                  <DetailRow label='Travel Allowance' value={fmt(payslipDetail.earnings?.travelAllowance)} />
                  <DetailRow label='Medical Allowance' value={fmt(payslipDetail.earnings?.medicalAllowance)} />
                  <DetailRow label='Special Allowance' value={fmt(payslipDetail.earnings?.specialAllowance)} />
                  {payslipDetail.earnings?.overtime > 0 && <DetailRow label='Overtime' value={fmt(payslipDetail.earnings.overtime)} />}
                  {payslipDetail.earnings?.bonus > 0 && <DetailRow label='Bonus' value={fmt(payslipDetail.earnings.bonus)} />}
                  {payslipDetail.earnings?.arrears > 0 && <DetailRow label='Arrears' value={fmt(payslipDetail.earnings.arrears)} />}
                  <DetailRow label='Gross Salary' value={fmt(payslipDetail.grossSalary)} bold />
                </TableBody>
              </Table>

              <Typography variant='subtitle2' sx={{ mt: 3, mb: 1, fontWeight: 700 }}>Deductions</Typography>
              <Table size='small'>
                <TableBody>
                  <DetailRow label='PF' value={fmt(payslipDetail.deductions?.pf)} valueColor='error.main' />
                  <DetailRow label='ESI' value={fmt(payslipDetail.deductions?.esi)} valueColor='error.main' />
                  <DetailRow label='TDS' value={fmt(payslipDetail.deductions?.tds)} valueColor='error.main' />
                  <DetailRow label='Professional Tax' value={fmt(payslipDetail.deductions?.professionalTax)} valueColor='error.main' />
                  {(payslipDetail.lopDays || 0) > 0 && (
                    <DetailRow label={`LOP (${payslipDetail.lopDays} days)`} value={fmt(payslipDetail.deductions?.lop)} valueColor='error.main' />
                  )}
                  {payslipDetail.deductions?.advance > 0 && <DetailRow label='Advance' value={fmt(payslipDetail.deductions.advance)} valueColor='error.main' />}
                  {payslipDetail.deductions?.other > 0 && <DetailRow label='Other' value={fmt(payslipDetail.deductions.other)} valueColor='error.main' />}
                  <DetailRow label='Gross After LOP' value={fmt(payslipDetail.grossAfterLOP)} bold />
                </TableBody>
              </Table>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, p: 2, borderRadius: 1, bgcolor: alpha('#10b981', 0.1) }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>Net Salary</Typography>
                <Typography variant='h6' sx={{ fontWeight: 800, color: '#10b981' }}>{fmt(payslipDetail.netSalary)}</Typography>
              </Box>

              <Typography variant='subtitle2' sx={{ mt: 3, mb: 1, fontWeight: 700 }}>Attendance</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant='caption' color='text.secondary'>Working Days</Typography>
                  <Typography variant='body2'>{payslipDetail.totalWorkingDays ?? '—'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant='caption' color='text.secondary'>Days Present</Typography>
                  <Typography variant='body2'>{payslipDetail.daysPresent ?? '—'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant='caption' color='text.secondary'>Overtime Hours</Typography>
                  <Typography variant='body2'>{payslipDetail.overtimeHours ?? 0}</Typography>
                </Grid>
              </Grid>
            </>
          ) : (
            <Typography color='text.secondary'>No data available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {payslipDetail && (
            <Button
              startIcon={<Icon icon='mdi:download' />}
              onClick={() => downloadPayslipPdf(payslipDetail._id, `${MONTH_NAMES[(payslipDetail.month || 1) - 1]}_${payslipDetail.year}`)}
            >
              Download PDF
            </Button>
          )}
          <Button variant='contained' onClick={() => { setDetailOpen(false); setPayslipDetail(null) }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </PayrollTabs>
  )
}

export default SalaryRegister
