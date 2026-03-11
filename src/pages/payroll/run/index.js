// ** React Imports
import { useState, useMemo, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import TableHeader from 'src/views/apps/user/list/TableHeader'

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------
const MOCK_EMPLOYEES = [
  { id: 1, name: 'Rahul Sharma',   department: 'Engineering', baseSalary: 50000, allowances: 10000, deductions: 3000 },
  { id: 2, name: 'Priya Singh',    department: 'HR',          baseSalary: 45000, allowances: 8000,  deductions: 2500 },
  { id: 3, name: 'Amit Verma',     department: 'Engineering', baseSalary: 60000, allowances: 12000, deductions: 4000 },
  { id: 4, name: 'Sneha Kapoor',   department: 'Design',      baseSalary: 42000, allowances: 7000,  deductions: 2000 },
  { id: 5, name: 'Karan Malhotra', department: 'Sales',       baseSalary: 38000, allowances: 6000,  deductions: 1800 },
]

const MONTHS = [
  'January 2026', 'February 2026', 'March 2026',
  'April 2026',   'May 2026',      'June 2026',
]

/**
 * Generate payroll for a month.
 * Replace with: axios.post('/api/payrolls/generate', { month, employees })
 */
const postGeneratePayroll = async payload => {
  await new Promise(r => setTimeout(r, 400))
  console.log('Generate payroll:', payload)
  return { success: true }
}

/**
 * Approve payroll for a month.
 * Replace with: axios.post('/api/payrolls/approve', { month })
 */
const postApprovePayroll = async payload => {
  await new Promise(r => setTimeout(r, 400))
  console.log('Approve payroll:', payload)
  return { success: true }
}

// ---------------------------------------------------------------------------
// Run Payroll Page
// ---------------------------------------------------------------------------
const RunPayroll = () => {
  const [selectedMonth, setSelectedMonth] = useState('')
  const [payrollStatus, setPayrollStatus] = useState('Pending')   // Pending | Generated | Approved
  const [filterQ, setFilterQ]             = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  // Rows with computed net salary
  const rows = useMemo(() =>
    MOCK_EMPLOYEES.map(e => ({
      ...e,
      netSalary: e.baseSalary + e.allowances - e.deductions,
      status: payrollStatus
    })),
    [payrollStatus]
  )

  const filtered = filterQ
    ? rows.filter(r => r.name.toLowerCase().includes(filterQ.toLowerCase()))
    : rows

  const handleGenerate = async () => {
    if (!selectedMonth) return
    setActionLoading(true)
    try {
      await postGeneratePayroll({ month: selectedMonth, employees: rows })
      setPayrollStatus('Generated')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      await postApprovePayroll({ month: selectedMonth })
      setPayrollStatus('Approved')
    } finally {
      setActionLoading(false)
    }
  }

  const statusColorMap = { Pending: 'warning', Generated: 'info', Approved: 'success' }

  const columns = [
    {
      flex: 0.22, minWidth: 200, field: 'name', headerName: 'Employee Name',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CustomAvatar skin='light' color='primary' sx={{ width: 34, height: 34, fontSize: '0.875rem' }}>
            {row.name.split(' ').map(n => n[0]).join('')}
          </CustomAvatar>
          <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary' }}>{row.name}</Typography>
        </Box>
      )
    },
    { flex: 0.15, minWidth: 130, field: 'baseSalary',  headerName: 'Base Salary',  renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>₹{row.baseSalary.toLocaleString()}</Typography>  },
    { flex: 0.13, minWidth: 120, field: 'allowances',  headerName: 'Allowances',   renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>₹{row.allowances.toLocaleString()}</Typography>   },
    { flex: 0.13, minWidth: 120, field: 'deductions',  headerName: 'Deductions',   renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>₹{row.deductions.toLocaleString()}</Typography>   },
    { flex: 0.15, minWidth: 130, field: 'netSalary',   headerName: 'Net Salary',   renderCell: ({ row }) => <Typography noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>₹{row.netSalary.toLocaleString()}</Typography> },
    {
      flex: 0.12, minWidth: 110, field: 'status', headerName: 'Status',
      renderCell: ({ row }) => (
        <CustomChip rounded skin='light' size='small' label={row.status} color={statusColorMap[row.status] ?? 'default'} />
      )
    }
  ]

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Run Payroll' subheader='Select a month to generate and approve payroll' />
          <Divider sx={{ m: '0 !important' }} />

          {/* Month selector + action buttons */}
          <CardContent>
            <Grid container spacing={4} alignItems='center'>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  select fullWidth
                  label='Select Month'
                  value={selectedMonth}
                  onChange={e => { setSelectedMonth(e.target.value); setPayrollStatus('Pending') }}
                  SelectProps={{ value: selectedMonth, onChange: e => { setSelectedMonth(e.target.value); setPayrollStatus('Pending') } }}
                >
                  <MenuItem value=''>Select Month</MenuItem>
                  {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Button
                    variant='contained'
                    disabled={!selectedMonth || payrollStatus !== 'Pending' || actionLoading}
                    onClick={handleGenerate}
                  >
                    {actionLoading && payrollStatus === 'Pending' ? 'Generating…' : 'Generate Payroll'}
                  </Button>
                  <Button
                    variant='contained' color='success'
                    disabled={payrollStatus !== 'Generated' || actionLoading}
                    onClick={handleApprove}
                  >
                    {actionLoading && payrollStatus === 'Generated' ? 'Approving…' : 'Approve Payroll'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>

          {selectedMonth && (
            <>
              {/* <TableHeader value={filterQ} handleFilter={useCallback(v => setFilterQ(v), [])} toggle={() => {}} /> */}
              <DataGrid
                autoHeight rowHeight={62}
                rows={filtered} columns={columns}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
              />
            </>
          )}
        </Card>
      </Grid>
    </Grid>
  )
}

export default RunPayroll