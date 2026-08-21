// src/pages/organisation/index.js
// Organisation list for Super Admin - shows all tenant organisations
import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import { DataGrid } from '@mui/x-data-grid'
import { alpha } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import axiosRequest from 'src/utils/AxiosInterceptor'
import dayjs from 'dayjs'

const fmtDate = s => s ? dayjs(s).format('DD MMM YYYY') : '—'

const STATUS_COLOR = {
  Active:    '#10b981',
  Pending:   '#f59e0b',
  Suspended: '#ef4444',
  Inactive:  '#94a3b8',
}

// ─── Organisations Columns ────────────────────────────────────────────────────────
const columns = [
  { flex: 0.18, minWidth: 220, field: 'org_name', headerName: 'Organization Name',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar 
          src={row.logo_url} 
          sx={{ width: 38, height: 38, bgcolor: alpha('#6366f1', 0.12), color: '#6366f1', fontWeight: 700, fontSize: 14 }}
        >
          {row.org_name?.charAt(0)?.toUpperCase() || 'O'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{row.org_name}</Typography>
          <Typography variant='caption' sx={{ color: 'text.disabled' }}>{row.contact_email || row.email}</Typography>
        </Box>
      </Box>
    )
  },
  { flex: 0.12, minWidth: 140, field: 'name', headerName: 'Business Name',
    renderCell: ({ row }) => (
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {row.name || '—'}
      </Typography>
    )
  },
  { flex: 0.12, minWidth: 130, field: 'plan', headerName: 'Plan',
    renderCell: ({ row }) => {
      const planDetails = row.planDetails
      if (!planDetails) {
        return <Typography sx={{ color: 'text.disabled' }}>{row.plan}</Typography>
      }

      return (
        <Tooltip 
          title={
            <Box sx={{ p: 1.5, minWidth: 250 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1.5 }}>{planDetails.name}</Typography>
              {[
                { label: 'Package', value: planDetails.package_type || '—' },
                { label: 'Billing', value: planDetails.billing_cycle || '—' },
                { label: 'Seat Limit', value: planDetails.seat_limit || '—' },
              ].map(item => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant='caption' sx={{ color: 'grey.300' }}>{item.label}</Typography>
                  <Typography variant='caption' sx={{ fontWeight: 600, color: 'common.white' }}>{item.value}</Typography>
                </Box>
              ))}
              {planDetails.features && planDetails.features.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant='caption' sx={{ fontWeight: 600, color: 'grey.300', display: 'block', mb: 0.5 }}>Features:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {planDetails.features.map((f, idx) => (
                      <Chip key={idx} label={f} size='small' sx={{ fontSize: 10, height: 18, bgcolor: 'rgba(255,255,255,0.1)', color: 'common.white' }} />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          }
          arrow
          placement='top'
        >
          <Chip 
            label={row.plan}
            size='small'
            icon={<Icon icon='tabler:credit-card' />}
            sx={{ fontWeight: 600, bgcolor: alpha('#6366f1', 0.08), color: '#6366f1', cursor: 'pointer' }}
          />
        </Tooltip>
      )
    }
  },
  { flex: 0.09, minWidth: 110, field: 'industry', headerName: 'Industry',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.industry || '—'}</Typography> },
  { flex: 0.09, minWidth: 100, field: 'country', headerName: 'Country',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.country || '—'}</Typography> },
  { flex: 0.1, minWidth: 100, field: 'status', headerName: 'Status',
    renderCell: ({ row }) => {
      const status = row.org_status || row.status
      const color = STATUS_COLOR[status] || '#94a3b8'
      return (
        <Chip 
          label={status}
          size='small'
          sx={{ fontWeight: 700, fontSize: 11, bgcolor: alpha(color, 0.1), color: color, border: 'none' }}
        />
      )
    }
  },
  { flex: 0.1, minWidth: 120, field: 'joinedAt', headerName: 'Registered',
    renderCell: ({ row }) => (
      <Typography sx={{ color: 'text.secondary' }}>
        {fmtDate(row.joinedAt || row.createdAt)}
      </Typography>
    )
  },
]




// ─── Main Page ────────────────────────────────────────────────────────
const OrganisationPage = () => {
  const [orgs, setOrgs]         = useState([])
  const [loading, setLoading]   = useState(false)
  const [search, setSearch]     = useState('')
  const [total, setTotal]       = useState(0)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 })

  // ── Fetch organisations (with backend search) ──
  const fetchOrgs = useCallback((page, pageSize, searchTerm = '') => {
    setLoading(true)
    
    // Build query params
    const params = new URLSearchParams()
    params.append('page', page + 1)
    params.append('limit', pageSize)
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim())
    }
    
    axiosRequest.get(`/api/v1/super-admin/tenants?${params.toString()}`)
      .then(res => {
        console.log('API Response:', res) // Debug log
        
        // Handle the nested response structure: res.data.tenants
        const tenants = res?.data?.tenants || res?.tenants || res?.data || []
        const pagination = res?.data?.pagination || res?.pagination || {}
        
        if (Array.isArray(tenants)) {
          setOrgs(tenants)
          setTotal(pagination.total || tenants.length)
        } else {
          setOrgs([])
          setTotal(0)
        }
      })
      .catch(err => {
        console.error('Failed to fetch organisations:', err)
        setOrgs([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Fetch on mount and pagination change ──
  useEffect(() => {
    fetchOrgs(paginationModel.page, paginationModel.pageSize, search)
  }, [paginationModel.page, paginationModel.pageSize, fetchOrgs, search])

  // ── Debounced search effect ──
  useEffect(() => {
    // Debounce search - wait 300ms after user stops typing
    const timeoutId = setTimeout(() => {
      if (search !== undefined) {
        setPaginationModel(prev => ({ ...prev, page: 0 })) // Reset to first page
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search])

  // ── Clear search ──
  const handleClearSearch = () => {
    setSearch('')
    setPaginationModel(prev => ({ ...prev, page: 0 }))
  }

  const filteredRows = orgs

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ px: 5, py: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icon icon='tabler:building-skyscraper' fontSize={24} style={{ color: '#6366f1' }} />
              <Typography variant='h5' sx={{ fontWeight: 700 }}>Organisations</Typography>
            </Box>
            <CustomTextField 
              size='small'
              value={search} 
              placeholder='Search by org name, business name, email...' 
              sx={{ minWidth: 350 }}
              onChange={e => setSearch(e.target.value)}
              InputProps={{ 
                startAdornment: <Icon icon='tabler:search' style={{ marginRight: 8, opacity: 0.5 }} />,
                endAdornment: search ? (
                  <Icon 
                    icon='tabler:x' 
                    style={{ cursor: 'pointer', opacity: 0.5 }} 
                    onClick={handleClearSearch}
                  />
                ) : null
              }} 
            />
          </Box>

          <Divider />
          {loading && <LinearProgress />}
          
          <DataGrid
            autoHeight 
            rowHeight={64} 
            loading={loading}
            rows={filteredRows} 
            columns={columns}
            getRowId={row => row.id || row._id}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 20, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={total}
            paginationMode="server"
            slots={{
              noRowsOverlay: () => (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  py: 8
                }}>
                  <Icon icon='tabler:building-off' fontSize='4rem' style={{ opacity: 0.3, marginBottom: 16 }} />
                  <Typography variant='h6' sx={{ color: 'text.secondary', mb: 1 }}>
                    No organisations found
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.disabled', maxWidth: 400, textAlign: 'center' }}>
                    {search 
                      ? `No organisations match "${search}". Try adjusting your search criteria.`
                      : 'No organisations have been added yet. Add your first organisation to get started.'
                    }
                  </Typography>
                </Box>
              )
            }}
            sx={{ px: 5, py: 2, '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

export default OrganisationPage
