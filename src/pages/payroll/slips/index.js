// src/pages/payroll/slips/index.js
// REAL API — GET /api/v1/payslips/my (employee) or /api/v1/payslips (HR)
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyPayslips, fetchAllPayslips } from 'src/store/payroll/payrollSlice'
import { selectRoleSlug } from 'src/store/auth/authSlice'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import TablePagination from '@mui/material/TablePagination'
import { alpha } from '@mui/material/styles'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'

const fmt = n => n == null ? '—' : '₹' + Math.round(n).toLocaleString('en-IN')
const fmtDate = s => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const STATUS_CONFIG = {
  DRAFT:     { color: '#8b5cf6', label: 'Draft'     },
  PUBLISHED: { color: '#10b981', label: 'Published' },
  PAID:      { color: '#0ea5e9', label: 'Paid'      },
}

const YEAR_OPTIONS = (() => {
  const now = new Date().getFullYear()
  return [now, now - 1, now - 2].map(String)
})()

export default function SalarySlips() {
  const dispatch = useDispatch()
  const roleSlug = useSelector(selectRoleSlug)
  const isEmployee = roleSlug === 'employee'

  const { myPayslips, myPayslipsLoading, myPayslipsTotal, payslips, payslipsLoading, payslipsTotal } = useSelector(s => s.payroll)

  const [year,  setYear]  = useState(String(new Date().getFullYear()))
  const [page,  setPage]  = useState(0)
  const [limit, setLimit] = useState(20)

  useEffect(() => {
    if (isEmployee) {
      dispatch(fetchMyPayslips({ year, page: page + 1, limit }))
    } else {
      dispatch(fetchAllPayslips({ year, page: page + 1, limit }))
    }
  }, [dispatch, isEmployee, year, page, limit])

  const rows  = isEmployee ? myPayslips  : payslips
  const total = isEmployee ? myPayslipsTotal : payslipsTotal
  const loading = isEmployee ? myPayslipsLoading : payslipsLoading

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800 }}>
            {isEmployee ? 'My Payslips' : 'All Payslips'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {isEmployee ? 'View and download your salary slips' : 'Manage all employee payslips'}
          </Typography>
        </Box>
        <CustomTextField select value={year} onChange={e => { setYear(e.target.value); setPage(0) }} size='small' sx={{ minWidth: 120 }}>
          {YEAR_OPTIONS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </CustomTextField>
      </Box>

      {/* Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Payslips', value: total, color: '#6366f1', icon: 'tabler:file-invoice' },
          { label: 'Published',      value: rows.filter(p => p.status === 'PUBLISHED').length, color: '#10b981', icon: 'tabler:circle-check' },
          { label: 'Paid',           value: rows.filter(p => p.status === 'PAID').length,      color: '#0ea5e9', icon: 'tabler:cash' },
          { label: 'Draft',          value: rows.filter(p => p.status === 'DRAFT').length,     color: '#8b5cf6', icon: 'tabler:file-description' },
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

      <Card>
        <CardHeader title={<Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Payslips — {year}</Typography>} />
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              {(!isEmployee ? ['Employee', 'Month', 'Year'] : ['Month', 'Year']).concat(['Gross', 'Net', 'LOP Days', 'Status']).map(h => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6 }}>
                  <Icon icon='tabler:file-off' fontSize={40} style={{ color: '#94a3b8', display: 'block', margin: '0 auto 8px' }} />
                  <Typography variant='body2' color='text.secondary'>No payslips found for {year}</Typography>
                </TableCell>
              </TableRow>
            ) : rows.map(p => {
              const sc = STATUS_CONFIG[p.status] || {}
              const emp = p.employee_id || p.employeeId || {}
              const monthName = new Date(2024, (p.month || 1) - 1).toLocaleString('en-IN', { month: 'long' })
              return (
                <TableRow key={p._id} hover>
                  {!isEmployee && (
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
                  )}
                  <TableCell><Typography variant='body2'>{monthName}</Typography></TableCell>
                  <TableCell><Typography variant='body2'>{p.year}</Typography></TableCell>
                  <TableCell><Typography variant='body2' sx={{ fontWeight: 600 }}>{fmt(p.grossSalary)}</Typography></TableCell>
                  <TableCell><Typography variant='body2' sx={{ fontWeight: 700, color: '#10b981' }}>{fmt(p.netSalary)}</Typography></TableCell>
                  <TableCell><Typography variant='body2'>{p.lopDays ?? 0}d</Typography></TableCell>
                  <TableCell>
                    <Chip label={sc.label || p.status} size='small' sx={{ fontWeight: 700, fontSize: 11, bgcolor: alpha(sc.color || '#6366f1', 0.1), color: sc.color || '#6366f1' }} />
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
    </Box>
  )
}
