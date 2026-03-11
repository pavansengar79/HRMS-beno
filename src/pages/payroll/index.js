// ** React Imports
import { useState, useCallback } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import { DataGrid } from '@mui/x-data-grid'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import TableHeader from 'src/views/apps/user/list/TableHeader'

// ** Utils
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Drawer
import SalaryStructureDrawer from './salaryStructureDrawer'

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------
const MOCK_PAYROLL = [
  { id: 1, employeeName: 'Rahul Sharma',  department: 'Engineering', baseSalary: 50000, allowances: 10000, deductions: 3000, netSalary: 57000, status: 'Paid'      },
  { id: 2, employeeName: 'Priya Singh',   department: 'HR',          baseSalary: 45000, allowances: 8000,  deductions: 2500, netSalary: 50500, status: 'Generated' },
  { id: 3, employeeName: 'Amit Verma',    department: 'Engineering', baseSalary: 60000, allowances: 12000, deductions: 4000, netSalary: 68000, status: 'Pending'   },
  { id: 4, employeeName: 'Sneha Kapoor',  department: 'Design',      baseSalary: 42000, allowances: 7000,  deductions: 2000, netSalary: 47000, status: 'Paid'      },
  { id: 5, employeeName: 'Karan Malhotra',department: 'Sales',       baseSalary: 38000, allowances: 6000,  deductions: 1800, netSalary: 42200, status: 'Pending'   },
]

const payrollStatusObj = {
  Paid:      'success',
  Generated: 'info',
  Pending:   'warning'
}

// ---------------------------------------------------------------------------
// Summary stat card — reuses CardStatisticsProfit pattern
// ---------------------------------------------------------------------------
const StatCard = ({ title, subtitle, value, trend, trendColor, chartColor, series }) => {
  const theme = useTheme()

  const options = {
    chart: { parentHeightOffset: 0, toolbar: { show: false } },
    stroke: { width: 2 },
    tooltip: { enabled: false },
    colors: [hexToRGBA(chartColor || theme.palette.info.main, 1)],
    markers: {
      size: 3.5,
      strokeWidth: 3,
      strokeColors: 'transparent',
      colors: [chartColor || theme.palette.info.main],
      discrete: [{
        size: 5,
        seriesIndex: 0,
        strokeColor: chartColor || theme.palette.info.main,
        fillColor: theme.palette.background.paper,
        dataPointIndex: (series[0]?.data?.length ?? 1) - 1
      }]
    },
    grid: {
      strokeDashArray: 6,
      borderColor: theme.palette.divider,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      padding: { top: -13, left: -4, right: 8, bottom: 2 }
    },
    xaxis: { labels: { show: false }, axisTicks: { show: false }, axisBorder: { show: false } },
    yaxis: { labels: { show: false } }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h5'>{title}</Typography>
        <Typography variant='body2' sx={{ color: 'text.disabled' }}>{subtitle}</Typography>
        <ReactApexcharts type='line' height={97} series={series} options={options} />
        <Box sx={{ gap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='h4'>{value}</Typography>
          {trend && (
            <Typography variant='body2' sx={{ color: trendColor || 'success.main' }}>{trend}</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Payroll Dashboard
// ---------------------------------------------------------------------------
const PayrollDashboard = () => {
  const theme  = useTheme()
  const router = useRouter()

  const [filterQ, setFilterQ]               = useState('')
  const [drawerOpen, setDrawerOpen]         = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const filtered = filterQ
    ? MOCK_PAYROLL.filter(r =>
        r.employeeName.toLowerCase().includes(filterQ.toLowerCase()) ||
        r.department.toLowerCase().includes(filterQ.toLowerCase())
      )
    : MOCK_PAYROLL

  const totalPayout   = MOCK_PAYROLL.reduce((s, r) => s + r.netSalary, 0)
  const pendingCount  = MOCK_PAYROLL.filter(r => r.status === 'Pending').length

  const columns = [
    {
      flex: 0.2, minWidth: 190, field: 'employeeName', headerName: 'Employee Name',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CustomAvatar skin='light' color='primary' sx={{ width: 34, height: 34, fontSize: '0.875rem' }}>
            {row.employeeName.split(' ').map(n => n[0]).join('')}
          </CustomAvatar>
          <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary' }}>{row.employeeName}</Typography>
        </Box>
      )
    },
    { flex: 0.14, minWidth: 130, field: 'department',  headerName: 'Department',   renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>{row.department}</Typography>  },
    { flex: 0.13, minWidth: 120, field: 'baseSalary',  headerName: 'Base Salary',  renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>₹{row.baseSalary.toLocaleString()}</Typography>  },
    { flex: 0.12, minWidth: 110, field: 'allowances',  headerName: 'Allowances',   renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>₹{row.allowances.toLocaleString()}</Typography>   },
    { flex: 0.12, minWidth: 110, field: 'deductions',  headerName: 'Deductions',   renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>₹{row.deductions.toLocaleString()}</Typography>   },
    { flex: 0.13, minWidth: 120, field: 'netSalary',   headerName: 'Net Salary',   renderCell: ({ row }) => <Typography noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>₹{row.netSalary.toLocaleString()}</Typography> },
    {
      flex: 0.1, minWidth: 110, field: 'status', headerName: 'Status',
      renderCell: ({ row }) => (
        <CustomChip rounded skin='light' size='small' label={row.status} color={payrollStatusObj[row.status] ?? 'default'} sx={{ textTransform: 'capitalize' }} />
      )
    }
  ]

  return (
    <Grid container spacing={6.5}>
      {/* Summary Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title='Total Employees'   subtitle='All active'
          value={MOCK_PAYROLL.length} trend='+2 this month'
          chartColor={theme.palette.primary.main}
          series={[{ data: [3, 4, 4, 5, 5, 5] }]}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title='Current Month'   subtitle='March 2026'
          value='₹2.65L' trend='+5.2%'
          chartColor={theme.palette.info.main}
          series={[{ data: [10, 18, 22, 28, 30, 35] }]}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title='Total Payout'   subtitle='This month'
          value={`₹${(totalPayout / 1000).toFixed(1)}k`} trend='+8.35%'
          chartColor={theme.palette.success.main}
          series={[{ data: [5, 12, 20, 28, 32, 40] }]}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title='Pending Payroll'  subtitle='Needs action'
          value={pendingCount} trend='Action needed' trendColor='error.main'
          chartColor={theme.palette.warning.main}
          series={[{ data: [8, 6, 5, 4, 3, 2] }]}
        />
      </Grid>

      {/* Payroll Table */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Payroll Overview' subheader='Current month payroll summary' />
          <Divider sx={{ m: '0 !important' }} />
          <TableHeader value={filterQ} handleFilter={useCallback(v => setFilterQ(v), [])} toggle={() => setDrawerOpen(true)} />
          <DataGrid
            autoHeight rowHeight={62}
            rows={filtered} columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
          />
        </Card>
      </Grid>

      <SalaryStructureDrawer open={drawerOpen} toggle={() => setDrawerOpen(p => !p)} />
    </Grid>
  )
}

export default PayrollDashboard