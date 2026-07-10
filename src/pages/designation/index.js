import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectPermissions } from 'src/store/auth/authSlice'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import Drawer from '@mui/material/Drawer'
import CircularProgress from '@mui/material/CircularProgress'
import { DataGrid } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomChip from 'src/@core/components/mui/chip'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

const Header = styled(Box)(({ theme }) => ({ display: 'flex', alignItems: 'center', padding: theme.spacing(6), justifyContent: 'space-between' }))
const schema = yup.object().shape({ name: yup.string().required('Designation name is required') })

const DesignationPage = () => {
  const permissions = useSelector(selectPermissions) || []
  const canCreate = permissions.includes('designation.create')
  const canEdit = permissions.includes('designation.update')
  const canDelete = permissions.includes('designation.delete')
  
  const [rows, setRows]             = useState([])
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editItem, setEditItem]     = useState(null)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const { reset, control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { name: '' }, mode: 'onChange', resolver: yupResolver(schema)
  })

  const fetchData = () => {
    setLoading(true)
    axiosRequest.get('/api/v1/designations')
      .then(res => setRows(res.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleClose = () => { setDrawerOpen(false); setEditItem(null); reset() }

  const onSubmit = async data => {
    setSubmitting(true)
    try {
      if (editItem) { await axiosRequest.put(`/api/v1/designations/${editItem._id}`, data); toast.success('Updated') }
      else { await axiosRequest.post('/api/v1/designations/create', data); toast.success('Created') }
      fetchData(); handleClose()
    } catch (err) { toast.error(typeof err === 'string' ? err : err?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async id => {
    try { await axiosRequest.delete(`/api/v1/designations/${id}`); toast.success('Deleted'); fetchData() }
    catch (err) { toast.error(typeof err === 'string' ? err : err?.message || 'Failed') }
  }

  const RowOptions = ({ row }) => {
    const [anchorEl, setAnchorEl] = useState(null)
    return (
      <>
        <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}><Icon icon='tabler:dots-vertical' /></IconButton>
        <Menu keepMounted anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ style: { minWidth: '8rem' } }}>
          {canEdit && (
            <MenuItem onClick={() => { setValue('name', row.name); setEditItem(row); setDrawerOpen(true); setAnchorEl(null) }} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='tabler:edit' fontSize={20} />Edit
            </MenuItem>
          )}
          {canDelete && (
            <MenuItem onClick={() => { handleDelete(row._id); setAnchorEl(null) }} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='tabler:trash' fontSize={20} />Delete
            </MenuItem>
          )}
        </Menu>
      </>
    )
  }

  const columns = [
    { flex: 0.35, minWidth: 200, field: 'name', headerName: 'Designation',
      renderCell: ({ row }) => <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{row.name}</Typography> },
    { flex: 0.25, minWidth: 180, field: 'unit_id', headerName: 'Unit',
      renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.unit_id?.name || '—'}</Typography> },
    { flex: 0.12, minWidth: 100, field: 'status', headerName: 'Status',
      renderCell: ({ row }) => <CustomChip rounded skin='light' size='small' label={row.status || 'active'} color={row.status === 'active' ? 'success' : 'secondary'} /> },
    { flex: 0.08, minWidth: 80, sortable: false, field: 'actions', headerName: 'Actions', renderCell: ({ row }) => <RowOptions row={row} /> }
  ]

  const filteredRows = rows.filter(r => !search || r.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ p: 5, display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'space-between' }}>
            <CustomTextField value={search} placeholder='Search designations...' sx={{ minWidth: 200 }} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <Icon icon='tabler:search' style={{ marginRight: 8, opacity: 0.5 }} /> }} />
            {canCreate && (
              <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={() => setDrawerOpen(true)}>Add Designation</Button>
            )}
          </Box>
          <Divider sx={{ m: '0 !important' }} />
          <DataGrid autoHeight rowHeight={62} loading={loading} rows={filteredRows} columns={columns}
            getRowId={row => row._id} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} rowCount={filteredRows.length} />
        </Card>
      </Grid>
      <Drawer open={drawerOpen} anchor='right' variant='temporary' onClose={handleClose}
        ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}>
        <Header>
          <Typography variant='h5'>{editItem ? 'Edit' : 'Add'} Designation</Typography>
          <IconButton size='small' onClick={handleClose}><Icon icon='tabler:x' fontSize='1.125rem' /></IconButton>
        </Header>
        <Box component='form' onSubmit={handleSubmit(onSubmit)} sx={{ p: 6 }}>
          <Controller name='name' control={control} render={({ field }) => (
            <CustomTextField {...field} fullWidth label='Designation Name' sx={{ mb: 4 }} error={!!errors.name} helperText={errors.name?.message} />
          )} />
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Button fullWidth type='submit' variant='contained' disabled={submitting}>{submitting ? <CircularProgress size={20} /> : editItem ? 'Update' : 'Create'}</Button>
            <Button fullWidth variant='tonal' color='secondary' onClick={handleClose}>Cancel</Button>
          </Box>
        </Box>
      </Drawer>
    </Grid>
  )
}
export default DesignationPage
