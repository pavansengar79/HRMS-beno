import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import { DataGrid } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLOBs, deleteLOB, selectAllLOBs, selectLOBLoading } from 'src/store/lob/lobSlice'
import { fetchAllCompanies } from 'src/store/company/companySlice'
import toast from 'react-hot-toast'
import AddLOBDrawer from './AddLOBDrawer'

const RowOptions = ({ id }) => {
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleDelete = async () => {
    try { await dispatch(deleteLOB(id)).unwrap(); toast.success('LOB deleted') }
    catch (err) { toast.error(typeof err === 'string' ? err : err?.message || 'Failed to delete LOB') }
    setAnchorEl(null)
  }
  return (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}><Icon icon='tabler:dots-vertical' /></IconButton>
      <Menu keepMounted anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ style: { minWidth: '8rem' } }}>
        <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}><Icon icon='tabler:trash' fontSize={20} />Delete</MenuItem>
      </Menu>
    </>
  )
}

const columns = [
  { flex: 0.25, minWidth: 200, field: 'name', headerName: 'LOB Name',
    renderCell: ({ row }) => <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{row.name}</Typography> },
  { flex: 0.22, minWidth: 180, field: 'company', headerName: 'Company',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.company_id?.company_name || '—'}</Typography> },
  { flex: 0.25, minWidth: 200, field: 'description', headerName: 'Description',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.description || '—'}</Typography> },
  { flex: 0.08, minWidth: 80, sortable: false, field: 'actions', headerName: 'Actions', renderCell: ({ row }) => <RowOptions id={row._id} /> }
]

const LOBPage = () => {
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const dispatch = useDispatch()
  const lobs    = useSelector(selectAllLOBs)
  const loading = useSelector(selectLOBLoading)
  useEffect(() => { dispatch(fetchLOBs()); dispatch(fetchAllCompanies()) }, [dispatch])
  const filteredRows = lobs.filter(row => !search || row.name?.toLowerCase().includes(search.toLowerCase()))
  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ p: 5, display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'space-between' }}>
            <CustomTextField value={search} placeholder='Search LOB...' sx={{ minWidth: 200 }} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <Icon icon='tabler:search' style={{ marginRight: 8, opacity: 0.5 }} /> }} />
            <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={() => setAddOpen(true)}>Add LOB</Button>
          </Box>
          <Divider sx={{ m: '0 !important' }} />
          <DataGrid autoHeight rowHeight={62} loading={loading} rows={filteredRows} columns={columns}
            getRowId={row => row._id} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} rowCount={filteredRows.length} />
        </Card>
      </Grid>
      <AddLOBDrawer open={addOpen} toggle={() => setAddOpen(p => !p)} />
    </Grid>
  )
}
export default LOBPage
