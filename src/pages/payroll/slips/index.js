// ** React Imports
import { useState, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import Icon from 'src/@core/components/icon'
import TableHeader from 'src/views/apps/user/list/TableHeader'

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

/**
 * Replace with: axios.get(`/api/payrolls/slips/${userId}`)
 */
const MOCK_SLIPS = [
  { id: 1, month: 'March 2026',    grossSalary: 60000, deductions: 3000, netSalary: 57000, status: 'Generated' },
  { id: 2, month: 'February 2026', grossSalary: 60000, deductions: 3000, netSalary: 57000, status: 'Paid'      },
  { id: 3, month: 'January 2026',  grossSalary: 58000, deductions: 2800, netSalary: 55200, status: 'Paid'      },
  { id: 4, month: 'December 2025', grossSalary: 58000, deductions: 2800, netSalary: 55200, status: 'Paid'      },
  { id: 5, month: 'November 2025', grossSalary: 55000, deductions: 2500, netSalary: 52500, status: 'Paid'      },
]

const slipStatusObj = {
  Paid:      'success',
  Generated: 'info',
  Pending:   'warning'
}

/**
 * Simulate payslip download.
 * Replace with: axios.get(`/api/payrolls/slips/${id}/download`, { responseType: 'blob' })
 */
const downloadSlip = id => {
  console.log('Downloading payslip id:', id)
  alert(`Downloading payslip for ${MOCK_SLIPS.find(s => s.id === id)?.month}`)
}

// ---------------------------------------------------------------------------
// Salary Slips Page
// ---------------------------------------------------------------------------
const SalarySlips = () => {
  const [filterQ, setFilterQ]               = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const filtered = filterQ
    ? MOCK_SLIPS.filter(r => r.month.toLowerCase().includes(filterQ.toLowerCase()))
    : MOCK_SLIPS

  const columns = [
    {
      flex: 0.2, minWidth: 180, field: 'month', headerName: 'Month',
      renderCell: ({ row }) => <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary' }}>{row.month}</Typography>
    },
    {
      flex: 0.18, minWidth: 150, field: 'grossSalary', headerName: 'Gross Salary',
      renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>₹{row.grossSalary.toLocaleString()}</Typography>
    },
    {
      flex: 0.15, minWidth: 130, field: 'deductions', headerName: 'Deductions',
      renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>₹{row.deductions.toLocaleString()}</Typography>
    },
    {
      flex: 0.18, minWidth: 150, field: 'netSalary', headerName: 'Net Salary',
      renderCell: ({ row }) => <Typography noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>₹{row.netSalary.toLocaleString()}</Typography>
    },
    {
      flex: 0.12, minWidth: 110, field: 'status', headerName: 'Status',
      renderCell: ({ row }) => (
        <CustomChip rounded skin='light' size='small' label={row.status} color={slipStatusObj[row.status] ?? 'default'} sx={{ textTransform: 'capitalize' }} />
      )
    },
    {
      flex: 0.12, minWidth: 120, field: 'actions', headerName: 'Action', sortable: false,
      renderCell: ({ row }) => (
        <IconButton size='small' title='Download Payslip' onClick={() => downloadSlip(row.id)} sx={{ color: 'text.secondary' }}>
          <Icon icon='tabler:download' fontSize={20} />
        </IconButton>
      )
    }
  ]

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Salary Slips' subheader='Your monthly salary slip records' />
          <Divider sx={{ m: '0 !important' }} />
          <TableHeader value={filterQ} handleFilter={useCallback(v => setFilterQ(v), [])} toggle={() => {}} />
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
    </Grid>
  )
}

export default SalarySlips