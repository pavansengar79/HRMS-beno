// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Utils
import { generatePayslipPdf } from 'src/utils/payslipPdfGenerator'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  '2026-07', '2026-06', '2026-05', '2026-04',
  '2026-03', '2026-02', '2026-01',
  '2025-12', '2025-11', '2025-10'
]

const STATUS_CONFIG = {
  DRAFT: { color: 'default', icon: 'tabler:file-description', label: 'Draft' },
  RUNNING: { color: 'warning', icon: 'tabler:loader', label: 'Processing...' },
  COMPLETED: { color: 'success', icon: 'tabler:circle-check', label: 'Completed' },
  FAILED: { color: 'error', icon: 'tabler:circle-x', label: 'Failed' }
}

// ─── Payslip Detail Dialog ────────────────────────────────────────────────────

const PayslipDetailDialog = ({ open, onClose, payslip }) => {
  if (!payslip) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h6'>Payslip - {payslip.employee_name}</Typography>
          <Chip label={payslip.month} color='primary' size='small' />
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Employee Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Typography variant='body2' color='text.secondary'>Employee ID</Typography>
              <Typography variant='body1'>{payslip.employee_id}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='body2' color='text.secondary'>Employee Name</Typography>
              <Typography variant='body1'>{payslip.employee_name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='body2' color='text.secondary'>Department</Typography>
              <Typography variant='body1'>{payslip.department || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='body2' color='text.secondary'>Designation</Typography>
              <Typography variant='body1'>{payslip.designation || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Earnings & Deductions */}
        <Grid container spacing={4}>
          {/* Earnings */}
          <Grid item xs={12} md={6}>
            <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
              Earnings
            </Typography>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableBody>
                  {payslip.earnings && Object.entries(payslip.earnings).map(([key, value]) => {
                    if (key === 'totalEarnings' || !value) return null
                    return (
                      <TableRow key={key}>
                        <TableCell sx={{ textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </TableCell>
                        <TableCell align='right'>₹{(value || 0).toLocaleString()}</TableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell><strong>Total Earnings</strong></TableCell>
                    <TableCell align='right'>
                      <strong>₹{(payslip.earnings?.totalEarnings || payslip.grossSalary || 0).toLocaleString()}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Deductions */}
          <Grid item xs={12} md={6}>
            <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
              Deductions
            </Typography>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableBody>
                  {payslip.deductions && Object.entries(payslip.deductions).map(([key, value]) => {
                    if (key === 'totalDeductions' || !value) return null
                    return (
                      <TableRow key={key}>
                        <TableCell sx={{ textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </TableCell>
                        <TableCell align='right'>₹{(value || 0).toLocaleString()}</TableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell><strong>Total Deductions</strong></TableCell>
                    <TableCell align='right'>
                      <strong>₹{(payslip.deductions?.totalDeductions || 0).toLocaleString()}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>

        {/* Tax Breakdown (Enterprise Feature) */}
        {payslip.taxBreakdown && (
          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
              Tax Calculation Breakdown <Chip size='small' label={payslip.taxRegime?.toUpperCase() || 'NEW'} color='primary' />
            </Typography>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableBody>
                  <TableRow>
                    <TableCell>Taxable Income</TableCell>
                    <TableCell align='right'>₹{(payslip.taxBreakdown.taxableIncome || 0).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Gross Tax</TableCell>
                    <TableCell align='right'>₹{(payslip.taxBreakdown.grossTax || 0).toLocaleString()}</TableCell>
                  </TableRow>
                  {payslip.taxBreakdown.rebate87A > 0 && (
                    <TableRow>
                      <TableCell>Rebate 87A</TableCell>
                      <TableCell align='right'>- ₹{(payslip.taxBreakdown.rebate87A || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  {payslip.taxBreakdown.surcharge > 0 && (
                    <TableRow>
                      <TableCell>Surcharge</TableCell>
                      <TableCell align='right'>₹{(payslip.taxBreakdown.surcharge || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell>Health & Education Cess (4%)</TableCell>
                    <TableCell align='right'>₹{(payslip.taxBreakdown.cess || 0).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell><strong>Total Tax (Annual)</strong></TableCell>
                    <TableCell align='right'>
                      <strong>₹{(payslip.taxBreakdown.totalTax || 0).toLocaleString()}</strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TDS (Monthly)</TableCell>
                    <TableCell align='right'>
                      <Typography variant='body1' color='primary' fontWeight={600}>
                        ₹{(payslip.deductions?.tds || payslip.taxBreakdown.monthlyTDS || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* YTD (Enterprise Feature) */}
        {payslip.ytd && (
          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
              Year-to-Date (YTD) Summary
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TableContainer component={Paper} variant='outlined'>
                  <Table size='small'>
                    <TableBody>
                      <TableRow>
                        <TableCell>YTD Earnings</TableCell>
                        <TableCell align='right'>₹{(payslip.ytd.earnings?.totalEarnings || 0).toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>YTD Deductions</TableCell>
                        <TableCell align='right'>₹{(payslip.ytd.deductions?.totalDeductions || 0).toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>YTD TDS</TableCell>
                        <TableCell align='right'>₹{(payslip.ytd.deductions?.tds || 0).toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Net Salary */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.main', borderRadius: 1, color: 'white' }}>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Typography variant='body2'>Net Salary</Typography>
              <Typography variant='h5' fontWeight={600}>
                ₹{(payslip.netSalary || 0).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='body2'>Payment Mode</Typography>
              <Typography variant='h6'>Bank Transfer</Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 6, py: 3 }}>
        <Button variant='outlined' onClick={onClose}>Close</Button>
        <Button 
          variant='contained' 
          color='primary' 
          startIcon={<Icon icon='tabler:download' />}
          onClick={() => {
            // Build complete payslip data structure for PDF
            const pdfData = {
              ...selectedPayslip,
              employee_id: selectedPayslip?.employee_id?._id || selectedPayslip?.employee_id,
              employeeName: selectedPayslip?.employee_id?.name || selectedPayslip?.employeeName,
              employeeId: selectedPayslip?.employee_id?.employeeId || selectedPayslip?.employeeId,
              designation: selectedPayslip?.employee_id?.designation?.title || selectedPayslip?.designation,
              departmentName: selectedPayslip?.employee_id?.department?.name || selectedPayslip?.departmentName,
              basic: selectedPayslip?.earnings?.basic || 0,
              hra: selectedPayslip?.earnings?.hra || 0,
              conveyance: selectedPayslip?.earnings?.conveyance || 0,
              medical: selectedPayslip?.earnings?.medical || 0,
              specialAllowance: selectedPayslip?.earnings?.specialAllowance || 0,
              lta: selectedPayslip?.earnings?.lta || 0,
              grossEarnings: Object.values(selectedPayslip?.earnings || {}).reduce((a, b) => a + b, 0),
              pf: selectedPayslip?.deductions?.pf || selectedPayslip?.deductions?.providentFund || 0,
              esi: selectedPayslip?.deductions?.esi || 0,
              professionalTax: selectedPayslip?.deductions?.professionalTax || selectedPayslip?.deductions?.pt || 0,
              tds: selectedPayslip?.deductions?.tds || 0,
              grossDeductions: Object.values(selectedPayslip?.deductions || {}).reduce((a, b) => a + b, 0),
              netSalary: selectedPayslip?.netSalary || 0,
              month: selectedPayslip?.month,
              year: selectedPayslip?.year,
              payDays: selectedPayslip?.payDays || 30
            }
            generatePayslipPdf(pdfData)
          }}
        >
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

const PayrollRun = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-07')
  const [runStatus, setRunStatus] = useState('idle') // idle, running, completed, failed
  const [payslips, setPayslips] = useState([])
  const [selectedPayslip, setSelectedPayslip] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [calculating, setCalculating] = useState(false)

  const { user } = useSelector(state => state.auth)

  const handleRunPayroll = async () => {
    setRunStatus('running')
    setCalculating(true)
    try {
      const res = await axiosRequest.post('/api/v1/payroll-policies/run', {
        month: selectedMonth
      })
      
      if (res?.success) {
        toast.success('Payroll run completed successfully')
        setPayslips(res.data.payslips || [])
        setRunStatus('completed')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payroll run failed')
      setRunStatus('failed')
    } finally {
      setCalculating(false)
    }
  }

  const handleViewPayslip = (payslip) => {
    setSelectedPayslip(payslip)
    setDialogOpen(true)
  }

  const calculateTotals = () => {
    if (!payslips.length) return { totalGross: 0, totalNet: 0, totalTDS: 0, totalPT: 0 }
    
    return payslips.reduce((acc, slip) => ({
      totalGross: acc.totalGross + (slip.grossSalary || 0),
      totalNet: acc.totalNet + (slip.netSalary || 0),
      totalTDS: acc.totalTDS + (slip.deductions?.tds || 0),
      totalPT: acc.totalPT + (slip.deductions?.professionalTax || 0)
    }), { totalGross: 0, totalNet: 0, totalTDS: 0, totalPT: 0 })
  }

  const totals = calculateTotals()

  return (
    <Card>
      <CardHeader
        title='Run Payroll'
        subheader='Process monthly payroll with enterprise-grade PT, TDS, and YTD calculations'
        action={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <CustomTextField
              select
              size='small'
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              sx={{ width: 150 }}
            >
              {MONTHS.map(month => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </CustomTextField>
            <Button
              variant='contained'
              color='primary'
              onClick={handleRunPayroll}
              disabled={runStatus === 'running'}
              startIcon={runStatus === 'running' ? <CircularProgress size={20} color='inherit' /> : <Icon icon='tabler:player-play' />}
            >
              {runStatus === 'running' ? 'Processing...' : 'Run Payroll'}
            </Button>
          </Box>
        }
      />
      <Divider />
      <CardContent>
        {/* Summary Cards */}
        {payslips.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 3, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant='body2' color='white'>Total Employees</Typography>
                  <Typography variant='h3' color='white' fontWeight={600}>
                    {payslips.length}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 3, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant='body2' color='white'>Total Gross Salary</Typography>
                  <Typography variant='h4' color='white' fontWeight={600}>
                    ₹{totals.totalGross.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 3, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant='body2' color='white'>Total TDS</Typography>
                  <Typography variant='h4' color='white' fontWeight={600}>
                    ₹{totals.totalTDS.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 3, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant='body2' color='white'>Total PT</Typography>
                  <Typography variant='h4' color='white' fontWeight={600}>
                    ₹{totals.totalPT.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Payslips Table */}
        {payslips.length > 0 ? (
          <TableContainer component={Paper} variant='outlined'>
            <Table>
              <TableBody>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell><strong>Employee</strong></TableCell>
                  <TableCell align='right'><strong>Gross</strong></TableCell>
                  <TableCell align='right'><strong>PF</strong></TableCell>
                  <TableCell align='right'><strong>TDS</strong></TableCell>
                  <TableCell align='right'><strong>PT</strong></TableCell>
                  <TableCell align='right'><strong>Net Salary</strong></TableCell>
                  <TableCell><strong>Tax Regime</strong></TableCell>
                  <TableCell align='center'><strong>Actions</strong></TableCell>
                </TableRow>
                {payslips.map((slip, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>
                      <Box>
                        <Typography variant='body2' fontWeight={500}>{slip.employee_name}</Typography>
                        <Typography variant='caption' color='text.secondary'>{slip.employee_id}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align='right'>₹{(slip.grossSalary || 0).toLocaleString()}</TableCell>
                    <TableCell align='right'>₹{(slip.deductions?.pf || 0).toLocaleString()}</TableCell>
                    <TableCell align='right'>₹{(slip.deductions?.tds || 0).toLocaleString()}</TableCell>
                    <TableCell align='right'>₹{(slip.deductions?.professionalTax || 0).toLocaleString()}</TableCell>
                    <TableCell align='right'>
                      <Typography variant='body2' fontWeight={600} color='primary'>
                        ₹{(slip.netSalary || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size='small'
                        label={slip.taxRegime?.toUpperCase() || 'NEW'}
                        color={slip.taxRegime === 'old' ? 'secondary' : 'primary'}
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell align='center'>
                      <IconButton size='small' onClick={() => handleViewPayslip(slip)}>
                        <Icon icon='tabler:eye' fontSize={20} />
                      </IconButton>
                      <IconButton size='small'>
                        <Icon icon='tabler:download' fontSize={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
            <Icon icon='tabler:file-invoice' fontSize={80} color='text.disabled' />
            <Typography variant='h6' sx={{ mt: 2 }} color='text.secondary'>
              No payroll data
            </Typography>
            <Typography variant='body2' color='text.disabled'>
              Select month and run payroll to generate payslips
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Payslip Detail Dialog */}
      <PayslipDetailDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        payslip={selectedPayslip}
      />
    </Card>
  )
}

export default PayrollRun
