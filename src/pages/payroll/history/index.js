// src/pages/payroll/history/index.js
// REAL API — GET /api/v1/payroll-policies/history
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import LinearProgress from '@mui/material/LinearProgress'
import { DataGrid } from '@mui/x-data-grid'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import MenuItem from '@mui/material/MenuItem'
import Icon from 'src/@core/components/icon'
import TableHeader from 'src/views/apps/user/list/TableHeader'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'
import PayrollTabs from '../PayrollTabs'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { selectRoleSlug } from 'src/store/auth/authSlice'

// Backend history rows are documented as containing gross/net/PF/ESI/TDS
// totals per month, but exact key names weren't visible in this pass —
// these getters check a couple of likely variants so the columns still
// populate once you confirm the real key names against the API response.
const num = (row, ...keys) => {
  for (const k of keys) {
    if (row?.[k] != null) return row[k]
  }
  return null
}

// ─── Status Color Map ───────────────────────────────────────────────────────
const historyStatusObj = {
  PAID:      'success',
  PUBLISHED: 'info',
  DRAFT:     'warning'
}

// ─── Year Options ─────────────────────────────────────────────────────────────
const YEAR_OPTIONS = ['2026', '2025', '2024']

// ---------------------------------------------------------------------------
// Payroll History Page — REAL API
// ---------------------------------------------------------------------------
const PayrollHistory = () => {
  const router = useRouter()
  const roleSlug = useSelector(selectRoleSlug)
  const [history, setHistory]         = useState([])
  const [loading, setLoading]         = useState(false)
  const [total, setTotal]             = useState(0)
  const [year, setYear]               = useState(String(new Date().getFullYear()))
  const [page, setPage]               = useState(0)
  const [pageSize, setPageSize]       = useState(10)
  const [filterQ, setFilterQ]         = useState('')

  // ── Fetch payroll history ─────────────────────────────────────────────────────
  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await axiosRequest.get(`/api/v1/payroll-policies/history`, {
        params: {
          year,
          page: page + 1,
          limit: pageSize
        }
      })
      setHistory(res?.data?.history || [])
      setTotal(res?.data?.pagination?.total || 0)
    } catch (err) {
      console.error('Failed to fetch payroll history:', err)
      toast.error(err?.message || 'Failed to load payroll history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (roleSlug === 'employee') router.replace('/payroll/my')
  }, [roleSlug, router])

  useEffect(() => {
    fetchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, page, pageSize])

  // ── Filter client-side (simple) ──────────────────────────────────────────────
  const filtered = filterQ
    ? history.filter(r => r.month?.toLowerCase().includes(filterQ.toLowerCase()))
    : history

  // ── Download report (future: PDF/Excel) ───────────────────────────────────────
  const downloadReport = async (monthYear) => {
    toast.success(`Downloading report for ${monthYear}...`)
    // TODO: Real implementation when backend endpoint ready
    // await axiosRequest.get(`/api/v1/payroll-policies/history/${monthYear}/report`, { responseType: 'blob' })
  }

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns = [
    {
      flex: 0.25,
      minWidth: 180,
      field: 'month',
      headerName: 'Month',
      renderCell: ({ row }) => (
        <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {row.month}
        </Typography>
      )
    },
    {
      flex: 0.15,
      minWidth: 140,
      field: 'totalEmployees',
      headerName: 'Total Employees',
      renderCell: ({ row }) => (
        <Typography noWrap sx={{ color: 'text.secondary' }}>
          {row.totalEmployees}
        </Typography>
      )
    },
    {
      flex: 0.18,
      minWidth: 160,
      field: 'totalAmount',
      headerName: 'Total Payroll',
      renderCell: ({ row }) => (
        <Typography noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>
          ₹{row.totalAmount?.toLocaleString() || '0'}
        </Typography>
      )
    },
    {
      flex: 0.14,
      minWidth: 130,
      field: 'totalGross',
      headerName: 'Gross',
      renderCell: ({ row }) => {
        const v = num(row, 'totalGross', 'gross', 'grossSalary')
        return <Typography noWrap sx={{ color: 'text.secondary' }}>{v != null ? `₹${Number(v).toLocaleString()}` : '—'}</Typography>
      }
    },
    {
      flex: 0.14,
      minWidth: 130,
      field: 'totalNet',
      headerName: 'Net',
      renderCell: ({ row }) => {
        const v = num(row, 'totalNet', 'net', 'netSalary')
        return <Typography noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>{v != null ? `₹${Number(v).toLocaleString()}` : '—'}</Typography>
      }
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'totalPF',
      headerName: 'PF',
      renderCell: ({ row }) => {
        const v = num(row, 'totalPF', 'pf')
        return <Typography noWrap variant='body2'>{v != null ? `₹${Number(v).toLocaleString()}` : '—'}</Typography>
      }
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'totalESI',
      headerName: 'ESI',
      renderCell: ({ row }) => {
        const v = num(row, 'totalESI', 'esi')
        return <Typography noWrap variant='body2'>{v != null ? `₹${Number(v).toLocaleString()}` : '—'}</Typography>
      }
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'totalTDS',
      headerName: 'TDS',
      renderCell: ({ row }) => {
        const v = num(row, 'totalTDS', 'tds')
        return <Typography noWrap variant='body2'>{v != null ? `₹${Number(v).toLocaleString()}` : '—'}</Typography>
      }
    },
    {
      flex: 0.12,
      minWidth: 110,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => (
        <CustomChip
          rounded
          skin='light'
          size='small'
          label={row.status}
          color={historyStatusObj[row.status] ?? 'default'}
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      flex: 0.18,
      minWidth: 160,
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size='small' title='View Details' sx={{ color: 'text.secondary' }}>
            <Icon icon='tabler:eye' fontSize={20} />
          </IconButton>
          <IconButton 
            size='small' 
            title='Download Report' 
            sx={{ color: 'text.secondary' }}
            onClick={() => downloadReport(row.month)}
          >
            <Icon icon='tabler:download' fontSize={20} />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <PayrollTabs activeTab='history'>
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Payroll History' subheader='Past payroll records and reports' />
          <Divider sx={{ m: '0 !important' }} />
          
          <Box sx={{ display: 'flex', gap: 2, px: 4, py: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <TableHeader 
              value={filterQ} 
              handleFilter={(v) => setFilterQ(v)} 
              toggle={() => {}} 
            />
            <CustomTextField 
              select 
              value={year} 
              onChange={e => {
                setYear(e.target.value)
                setPage(0) // Reset to first page
              }} 
              size='small' 
              sx={{ minWidth: 120 }}
            >
              {YEAR_OPTIONS.map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </CustomTextField>
          </Box>

          {loading && <LinearProgress />}
          
          <DataGrid
            autoHeight
            rowHeight={62}
            rows={filtered.map((r, idx) => ({ ...r, id: r.id || idx + 1 }))}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page)
              setPageSize(model.pageSize)
            }}
            rowCount={total}
            paginationMode="server"
            loading={loading}
          />
        </Card>
      </Grid>
    </Grid>
    </PayrollTabs>
  )
}

export default PayrollHistory
