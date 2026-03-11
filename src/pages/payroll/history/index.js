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
 * Replace with: axios.get('/api/payrolls/history')
 */
const MOCK_HISTORY = [
  { id: 1, month: 'February 2026', totalEmployees: 5, totalAmount: 274700, status: 'Paid'      },
  { id: 2, month: 'January 2026',  totalEmployees: 5, totalAmount: 274700, status: 'Paid'      },
  { id: 3, month: 'December 2025', totalEmployees: 4, totalAmount: 220000, status: 'Paid'      },
  { id: 4, month: 'November 2025', totalEmployees: 4, totalAmount: 218000, status: 'Paid'      },
  { id: 5, month: 'March 2026',    totalEmployees: 5, totalAmount: 274700, status: 'Generated' },
]

const historyStatusObj = {
  Paid:      'success',
  Generated: 'info',
  Pending:   'warning'
}

/**
 * Simulate report download.
 * Replace with: axios.get(`/api/payrolls/${id}/report`, { responseType: 'blob' })
 */
const downloadReport = id => {
  console.log('Downloading report for payroll id:', id)
  alert(`Downloading report for ${MOCK_HISTORY.find(h => h.id === id)?.month}`)
}

// ---------------------------------------------------------------------------
// Payroll History Page
// ---------------------------------------------------------------------------
const PayrollHistory = () => {
  const [filterQ, setFilterQ]               = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const filtered = filterQ
    ? MOCK_HISTORY.filter(r => r.month.toLowerCase().includes(filterQ.toLowerCase()))
    : MOCK_HISTORY

  const columns = [
    {
      flex: 0.2, minWidth: 180, field: 'month', headerName: 'Month',
      renderCell: ({ row }) => <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary' }}>{row.month}</Typography>
    },
    {
      flex: 0.15, minWidth: 140, field: 'totalEmployees', headerName: 'Total Employees',
      renderCell: ({ row }) => <Typography noWrap sx={{ color: 'text.secondary' }}>{row.totalEmployees}</Typography>
    },
    {
      flex: 0.18, minWidth: 160, field: 'totalAmount', headerName: 'Total Payroll',
      renderCell: ({ row }) => <Typography noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>₹{row.totalAmount.toLocaleString()}</Typography>
    },
    {
      flex: 0.12, minWidth: 110, field: 'status', headerName: 'Status',
      renderCell: ({ row }) => (
        <CustomChip rounded skin='light' size='small' label={row.status} color={historyStatusObj[row.status] ?? 'default'} sx={{ textTransform: 'capitalize' }} />
      )
    },
    {
      flex: 0.18, minWidth: 160, field: 'actions', headerName: 'Actions', sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size='small' title='View Payroll' sx={{ color: 'text.secondary' }}>
            <Icon icon='tabler:eye' fontSize={20} />
          </IconButton>
          <IconButton size='small' title='Download Report' onClick={() => downloadReport(row.id)} sx={{ color: 'text.secondary' }}>
            <Icon icon='tabler:download' fontSize={20} />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Payroll History' subheader='Past payroll records and reports' />
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

export default PayrollHistory