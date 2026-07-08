// src/pages/payroll/my/index.js
// Employee Self-Service Payslip Page
// API: GET /api/v1/payslips/my
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyPayslips } from 'src/store/payroll/payrollSlice'
import { selectUser } from 'src/store/auth/authSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Avatar from '@mui/material/Avatar'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { alpha } from '@mui/material/styles'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import PayrollTabs from '../PayrollTabs'

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = n => n == null ? '—' : '₹' + Math.round(n).toLocaleString('en-IN')
const fmtDate = s => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const STATUS_CONFIG = {
  DRAFT:     { color: '#8b5cf6', bgColor: alpha('#8b5cf6', 0.12), label: 'Draft', icon: 'tabler:file-description' },
  PUBLISHED: { color: '#10b981', bgColor: alpha('#10b981', 0.12), label: 'Published', icon: 'tabler:circle-check' },
  PAID:      { color: '#0ea5e9', bgColor: alpha('#0ea5e9', 0.12), label: 'Paid', icon: 'tabler:cash' },
}

const YEAR_OPTIONS = (() => {
  const now = new Date().getFullYear()
  return [now, now - 1, now - 2].map(String)
})()

// ─── Download PDF ─────────────────────────────────────────────────────────────
const downloadPayslipPdf = async (payslipId, label) => {
  try {
    const response = await axiosRequest.get(`/api/v1/payslips/${payslipId}/pdf`, {
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `payslip_${label}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success('Payslip downloaded successfully')
  } catch (err) {
    console.error('PDF download error:', err)
    toast.error(err?.message || 'Failed to download payslip')
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyPayslips() {
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  
  const { myPayslips = [], myPayslipsLoading, myPayslipsTotal = 0 } = useSelector(s => s.payroll || {})

  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [selectedPayslip, setSelectedPayslip] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [payslipDetail, setPayslipDetail] = useState(null)

  // Fetch payslips on mount and when filters change
  useEffect(() => {
    dispatch(fetchMyPayslips({ year, page: page + 1, limit }))
  }, [dispatch, year, page, limit])

  // Fetch single payslip details
  const handleViewDetail = async (payslip) => {
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const response = await axiosRequest.get(`/api/v1/payslips/${payslip._id}`)
      setPayslipDetail(response?.data || response)
    } catch (err) {
      console.error('Failed to fetch payslip detail:', err)
      toast.error('Failed to load payslip details')
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  // Calculate summary stats
  const publishedCount = myPayslips.filter(p => p.status === 'PUBLISHED').length
  const paidCount = myPayslips.filter(p => p.status === 'PAID').length
  const totalNetSalary = myPayslips.reduce((sum, p) => sum + (p.netSalary || 0), 0)

  return (
    <PayrollTabs activeTab='my-payslips'>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            My Payslips
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            View and download your salary slips
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <CustomTextField 
            select 
            value={year} 
            onChange={e => { setYear(e.target.value); setPage(0) }} 
            size='small' 
            sx={{ minWidth: 120 }}
          >
            {YEAR_OPTIONS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </CustomTextField>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#6366f1', 0.12), color: '#6366f1' }}>
                  <Icon icon='tabler:file-invoice' />
                </Avatar>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 800 }}>{myPayslipsTotal}</Typography>
                  <Typography variant='caption' color='text.secondary'>Total Payslips</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#10b981', 0.12), color: '#10b981' }}>
                  <Icon icon='tabler:circle-check' />
                </Avatar>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 800 }}>{publishedCount}</Typography>
                  <Typography variant='caption' color='text.secondary'>Published</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#0ea5e9', 0.12), color: '#0ea5e9' }}>
                  <Icon icon='tabler:cash' />
                </Avatar>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 800 }}>{paidCount}</Typography>
                  <Typography variant='caption' color='text.secondary'>Paid</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.12), color: '#f59e0b' }}>
                  <Icon icon='tabler:coins' />
                </Avatar>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 800 }}>{fmt(totalNetSalary)}</Typography>
                  <Typography variant='caption' color='text.secondary'>Total Earned</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payslips Table */}
      <Card>
        <CardHeader 
          title={
            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
              Payslips — {year}
            </Typography>
          }
          subheader={
            <Typography variant='caption' color='text.secondary'>
              Only published and paid payslips are visible
            </Typography>
          }
        />
        {myPayslipsLoading && <LinearProgress />}
        
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>Period</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>Gross Salary</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>Deductions</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>Net Salary</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>LOP Days</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }} align='center'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {myPayslips.length === 0 && !myPayslipsLoading ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                  <Icon icon='tabler:file-off' fontSize={48} style={{ color: '#94a3b8', display: 'block', margin: '0 auto 12px' }} />
                  <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
                    No payslips found for {year}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Payslips will appear here once payroll is processed
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              myPayslips.map(p => {
                const sc = STATUS_CONFIG[p.status] || {}
                const monthName = MONTH_NAMES[(p.month || 1) - 1]
                const totalDeductions = (p.deductions?.pf || 0) + (p.deductions?.esi || 0) + (p.deductions?.tds || 0) + (p.deductions?.lop || 0) + (p.deductions?.professionalTax || 0)
                
                return (
                  <TableRow key={p._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>{monthName} {p.year}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {p.totalWorkingDays || 22} working days
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>{fmt(p.grossSalary)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='error.main'>{fmt(totalDeductions)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 700, color: '#10b981' }}>{fmt(p.netSalary)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{p.lopDays ?? 0} days</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={sc.label || p.status} 
                        size='small' 
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: 11, 
                          bgcolor: sc.bgColor, 
                          color: sc.color 
                        }} 
                      />
                    </TableCell>
                    <TableCell align='center'>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title='View Details'>
                          <IconButton size='small' onClick={() => handleViewDetail(p)}>
                            <Icon icon='tabler:eye' fontSize={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Download PDF'>
                          <IconButton 
                            size='small' 
                            onClick={() => downloadPayslipPdf(p._id, `${monthName}_${p.year}`)}
                          >
                            <Icon icon='mdi:download' fontSize={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          component='div'
          count={myPayslipsTotal}
          page={page}
          rowsPerPage={limit}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={e => { setLimit(parseInt(e.target.value)); setPage(0) }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Card>

      {/* Payslip Detail Dialog */}
      {detailOpen && (
        <PayslipDetailDialog 
          open={detailOpen} 
          onClose={() => { setDetailOpen(false); setPayslipDetail(null) }}
          loading={detailLoading}
          payslip={payslipDetail}
          onDownload={() => {
            if (payslipDetail) {
              const monthName = MONTH_NAMES[(payslipDetail.month || 1) - 1]
              downloadPayslipPdf(payslipDetail._id, `${monthName}_${payslipDetail.year}`)
            }
          }}
        />
      )}
    </PayrollTabs>
  )
}

// ─── Payslip Detail Dialog Component ───────────────────────────────────────────
function PayslipDetailDialog({ open, onClose, loading, payslip, onDownload }) {
  if (!open) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        p: 2
      }}
      onClick={onClose}
    >
      <Card 
        sx={{ 
          width: '100%', 
          maxWidth: 600, 
          maxHeight: '90vh', 
          overflow: 'auto' 
        }}
        onClick={e => e.stopPropagation()}
      >
        {loading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <LinearProgress />
            <Typography sx={{ mt: 2 }}>Loading payslip details...</Typography>
          </Box>
        ) : payslip ? (
          <>
            {/* Header */}
            <Box sx={{ 
              p: 3, 
              borderBottom: theme => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant='h6' sx={{ fontWeight: 800 }}>
                  Payslip - {MONTH_NAMES[(payslip.month || 1) - 1]} {payslip.year}
                </Typography>
                <Chip 
                  label={payslip.status} 
                  size='small' 
                  color={payslip.status === 'PAID' ? 'success' : 'primary'}
                  sx={{ mt: 1 }}
                />
              </Box>
              <IconButton onClick={onClose}>
                <Icon icon='tabler:x' />
              </IconButton>
            </Box>

            {/* Employee Info */}
            <Box sx={{ p: 3, bgcolor: 'action.hover' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Employee ID</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {payslip.employee_id?.employeeId || '—'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Name</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {payslip.employee_id?.name || '—'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Earnings */}
            <Box sx={{ p: 3 }}>
              <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 700 }}>Earnings</Typography>
              <Table size='small'>
                <TableBody>
                  <DetailRow label='Basic Salary' value={fmt(payslip.earnings?.basic)} />
                  <DetailRow label='HRA' value={fmt(payslip.earnings?.hra)} />
                  <DetailRow label='Travel Allowance' value={fmt(payslip.earnings?.travelAllowance)} />
                  <DetailRow label='Medical Allowance' value={fmt(payslip.earnings?.medicalAllowance)} />
                  <DetailRow label='Special Allowance' value={fmt(payslip.earnings?.specialAllowance)} />
                  {payslip.earnings?.overtime > 0 && (
                    <DetailRow label='Overtime' value={fmt(payslip.earnings?.overtime)} />
                  )}
                  {payslip.earnings?.bonus > 0 && (
                    <DetailRow label='Bonus' value={fmt(payslip.earnings?.bonus)} />
                  )}
                </TableBody>
              </Table>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                <Typography variant='body2' sx={{ fontWeight: 700 }}>Gross Salary</Typography>
                <Typography variant='body2' sx={{ fontWeight: 700 }}>{fmt(payslip.grossSalary)}</Typography>
              </Box>
            </Box>

            {/* Deductions */}
            <Box sx={{ p: 3, bgcolor: 'action.hover' }}>
              <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 700 }}>Deductions</Typography>
              <Table size='small'>
                <TableBody>
                  <DetailRow label='PF' value={fmt(payslip.deductions?.pf)} valueColor='error.main' />
                  <DetailRow label='ESI' value={fmt(payslip.deductions?.esi)} valueColor='error.main' />
                  <DetailRow label='TDS / Income Tax' value={fmt(payslip.deductions?.tds)} valueColor='error.main' />
                  <DetailRow label='Professional Tax' value={fmt(payslip.deductions?.professionalTax)} valueColor='error.main' />
                  {(payslip.lopDays || 0) > 0 && (
                    <DetailRow label={`LOP (${payslip.lopDays} days)`} value={fmt(payslip.deductions?.lop)} valueColor='error.main' />
                  )}
                </TableBody>
              </Table>
            </Box>

            {/* Net Salary */}
            <Box sx={{ 
              p: 3, 
              bgcolor: theme => alpha('#10b981', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant='h6' sx={{ fontWeight: 800 }}>Net Salary</Typography>
              <Typography variant='h5' sx={{ fontWeight: 800, color: '#10b981' }}>
                {fmt(payslip.netSalary)}
              </Typography>
            </Box>

            {/* Attendance Summary */}
            <Box sx={{ p: 3 }}>
              <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 700 }}>Attendance Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant='caption' color='text.secondary'>Working Days</Typography>
                  <Typography variant='body2'>{payslip.totalWorkingDays || 22}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant='caption' color='text.secondary'>Days Present</Typography>
                  <Typography variant='body2'>{payslip.daysPresent || '—'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant='caption' color='text.secondary'>LOP Days</Typography>
                  <Typography variant='body2'>{payslip.lopDays || 0}</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Actions */}
            <Box sx={{ p: 3, borderTop: theme => `1px solid ${theme.palette.divider}`, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant='outlined' startIcon={<Icon icon='mdi:download' />} onClick={onDownload}>
                Download PDF
              </Button>
              <Button variant='contained' onClick={onClose}>
                Close
              </Button>
            </Box>
          </>
        ) : null}
      </Card>
    </Box>
  )
}

// ─── Detail Row Component ───────────────────────────────────────────────────────
function DetailRow({ label, value, valueColor }) {
  return (
    <TableRow>
      <TableCell sx={{ border: 'none', py: 1, pl: 0, color: 'text.secondary', fontSize: '0.85rem' }}>
        {label}
      </TableCell>
      <TableCell sx={{ border: 'none', py: 1, pr: 0, textAlign: 'right', fontWeight: 600, fontSize: '0.85rem', color: valueColor || 'text.primary' }}>
        {value}
      </TableCell>
    </TableRow>
  )
}
