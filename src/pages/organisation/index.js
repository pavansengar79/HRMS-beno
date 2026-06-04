import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import axiosRequest from 'src/utils/AxiosInterceptor'

const columns = [
  { flex: 0.25, minWidth: 220, field: 'name', headerName: 'Organisation',
    renderCell: ({ row }) => (
      <Box>
        <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{row.name}</Typography>
        <Typography variant='body2' sx={{ color: 'text.disabled' }}>{row.contact_email}</Typography>
      </Box>
    ) },
  { flex: 0.15, minWidth: 140, field: 'contact_name', headerName: 'Contact',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.contact_name || '—'}</Typography> },
  { flex: 0.12, minWidth: 110, field: 'industry', headerName: 'Industry',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.industry || '—'}</Typography> },
  { flex: 0.12, minWidth: 110, field: 'country', headerName: 'Country',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.country || '—'}</Typography> },
  { flex: 0.12, minWidth: 110, field: 'createdAt', headerName: 'Registered',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>
      {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
    </Typography> },
]

const OrganisationPage = () => {
  const [orgs, setOrgs]       = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch]   = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  useEffect(() => {
    setLoading(true)
    axiosRequest.get('/api/v1/tenant')
      .then(res => setOrgs(res.data || res.tenants || []))
      .catch(() => setOrgs([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredRows = orgs.filter(row =>
    !search || row.name?.toLowerCase().includes(search.toLowerCase()) ||
    row.contact_email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ p: 5, display: 'flex', gap: 4, alignItems: 'center' }}>
            <CustomTextField value={search} placeholder='Search organisations...' sx={{ minWidth: 250 }}
              onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <Icon icon='tabler:search' style={{ marginRight: 8, opacity: 0.5 }} /> }} />
          </Box>
          <Divider sx={{ m: '0 !important' }} />
          <DataGrid autoHeight rowHeight={62} loading={loading} rows={filteredRows} columns={columns}
            getRowId={row => row._id || row.id} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} rowCount={filteredRows.length} />
        </Card>
      </Grid>
    </Grid>
  )
}
export default OrganisationPage
