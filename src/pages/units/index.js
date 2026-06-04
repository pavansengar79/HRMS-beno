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
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUnits, deleteUnit, selectAllUnits, selectUnitLoading } from 'src/store/unit/unitSlice'
import toast from 'react-hot-toast'
import AddUnitDrawer from './AddUnitDrawer'

const RowOptions = ({ id }) => {
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const handleDelete = async () => {
    try { await dispatch(deleteUnit(id)).unwrap(); toast.success('Unit deleted') }
    catch (err) { toast.error(typeof err === 'string' ? err : err?.message || 'Failed') }
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
  { flex: 0.2, minWidth: 170, field: 'name', headerName: 'Unit Name',
    renderCell: ({ row }) => <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{row.name}</Typography> },
  { flex: 0.18, minWidth: 150, field: 'lob_id', headerName: 'LOB',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.lob_id?.name || '—'}</Typography> },
  { flex: 0.18, minWidth: 150, field: 'company_id', headerName: 'Company',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.company_id?.company_name || '—'}</Typography> },
  { flex: 0.12, minWidth: 110, field: 'location', headerName: 'Location',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.location || '—'}</Typography> },
  { flex: 0.1, minWidth: 90, field: 'status', headerName: 'Status',
    renderCell: ({ row }) => <CustomChip rounded skin='light' size='small' label={row.status || 'Active'} color={row.status === 'Active' ? 'success' : 'secondary'} /> },
  { flex: 0.08, minWidth: 80, sortable: false, field: 'actions', headerName: 'Actions', renderCell: ({ row }) => <RowOptions id={row._id} /> }
]

const UnitsPage = () => {
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const dispatch = useDispatch()
  const units   = useSelector(selectAllUnits)
  const loading = useSelector(selectUnitLoading)
  useEffect(() => { dispatch(fetchUnits()) }, [dispatch])
  const filteredRows = units.filter(row => !search || row.name?.toLowerCase().includes(search.toLowerCase()) || row.location?.toLowerCase().includes(search.toLowerCase()))
  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ p: 5, display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'space-between' }}>
            <CustomTextField value={search} placeholder='Search units...' sx={{ minWidth: 200 }} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <Icon icon='tabler:search' style={{ marginRight: 8, opacity: 0.5 }} /> }} />
            <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={() => setAddOpen(true)}>Add Unit</Button>
          </Box>
          <Divider sx={{ m: '0 !important' }} />
          <DataGrid autoHeight rowHeight={62} loading={loading} rows={filteredRows} columns={columns}
            getRowId={row => row._id} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} rowCount={filteredRows.length} />
        </Card>
      </Grid>
      <AddUnitDrawer open={addOpen} toggle={() => setAddOpen(p => !p)} />
    </Grid>
  )
}
export default UnitsPage
