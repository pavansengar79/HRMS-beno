import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Menu from '@mui/material/Menu'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllCompanies, deleteCompany, selectAllCompanies, selectCompanyLoading } from 'src/store/company/companySlice'
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import { getInitials } from 'src/@core/utils/get-initials'
import AddCompanyDrawer from './AddCompanyDrawer'
import toast from 'react-hot-toast'

const statusColorMap = { Active: 'success', Inactive: 'secondary', ACTIVE: 'success', INACTIVE: 'secondary' }

const RowOptions = ({ id }) => {
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const handleDelete = async () => {
    try { await dispatch(deleteCompany(id)).unwrap(); toast.success('Company deleted') }
    catch (err) { toast.error(typeof err === 'string' ? err : err?.message || 'Delete failed') }
    setAnchorEl(null)
  }
  return (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}><Icon icon='tabler:dots-vertical' /></IconButton>
      <Menu keepMounted anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ style: { minWidth: '8rem' } }}>
        <MenuItem component={Link} href={`/company/${id}/details/account`} onClick={() => setAnchorEl(null)} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:eye' fontSize={20} />View
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:trash' fontSize={20} />Delete
        </MenuItem>
      </Menu>
    </>
  )
}

const columns = [
  { flex: 0.25, minWidth: 240, field: 'company_name', headerName: 'Company',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CustomAvatar skin='light' color='primary' sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500 }}>
          {getInitials(row.company_name || 'NA')}
        </CustomAvatar>
        <Box>
          <Typography noWrap component={Link} href={`/company/${row._id}/details/account`}
            sx={{ fontWeight: 500, textDecoration: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
            {row.company_name || 'Unnamed'}
          </Typography>
          <Typography noWrap variant='body2' sx={{ color: 'text.disabled' }}>{row.company_email}</Typography>
        </Box>
      </Box>
    )
  },
  { flex: 0.12, minWidth: 100, field: 'company_code', headerName: 'Code',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.75rem' }}>{row.company_code}</Typography> },
  { flex: 0.15, minWidth: 130, field: 'company_phone', headerName: 'Phone',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.company_phone || '—'}</Typography> },
  { flex: 0.1, minWidth: 100, field: 'status', headerName: 'Status',
    renderCell: ({ row }) => <CustomChip rounded skin='light' size='small' label={row.status || 'Active'} color={statusColorMap[row.status] || 'success'} /> },
  { flex: 0.12, minWidth: 110, field: 'createdAt', headerName: 'Created',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>
      {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
    </Typography> },
  { flex: 0.08, minWidth: 80, sortable: false, field: 'actions', headerName: 'Actions', renderCell: ({ row }) => <RowOptions id={row._id} /> }
]

const Company = () => {
  const [search, setSearch]               = useState('')
  const [addOpen, setAddOpen]             = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const dispatch  = useDispatch()
  const companies = useSelector(selectAllCompanies)
  const loading   = useSelector(selectCompanyLoading)

  useEffect(() => { dispatch(fetchAllCompanies()) }, [dispatch])

  const filteredRows = companies.filter(row =>
    !search || row.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    row.company_email?.toLowerCase().includes(search.toLowerCase()) ||
    row.company_code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ p: 5, display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <CustomTextField value={search} placeholder='Search company...' sx={{ minWidth: 200 }}
              onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <Icon icon='tabler:search' style={{ marginRight: 8, opacity: 0.5 }} /> }} />
            <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={() => setAddOpen(true)}>Add Company</Button>
          </Box>
          <Divider sx={{ m: '0 !important' }} />
          <DataGrid autoHeight rowHeight={62} loading={loading} rows={filteredRows} columns={columns}
            getRowId={row => row._id} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} rowCount={filteredRows.length} />
        </Card>
      </Grid>
      <AddCompanyDrawer open={addOpen} toggle={() => setAddOpen(p => !p)} />
    </Grid>
  )
}
export default Company
