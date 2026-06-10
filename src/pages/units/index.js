// src/pages/units/index.js
// Business Units page — includes LOB management at top.
// User flow: first create LOBs, then create Business Units (LOB is required for BU).

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
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import { DataGrid } from '@mui/x-data-grid'
import { alpha } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUnits, deleteUnit, selectAllUnits, selectUnitLoading } from 'src/store/unit/unitSlice'
import { fetchLOBs, createLOB, deleteLOB, updateLOB, selectAllLOBs, selectLOBLoading } from 'src/store/lob/lobSlice'
import toast from 'react-hot-toast'
import AddUnitDrawer from './AddUnitDrawer'

// ─── Unit row options ──────────────────────────────────────────────────────────
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
  { flex: 0.2, minWidth: 180, field: 'name', headerName: 'Unit Name',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha('#6366f1', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon icon='tabler:building-community' fontSize={16} style={{ color: '#6366f1' }} />
        </Box>
        <Typography sx={{ fontWeight: 600 }}>{row.name}</Typography>
      </Box>
    )
  },
  { flex: 0.18, minWidth: 150, field: 'lob_id', headerName: 'Line of Business',
    renderCell: ({ row }) => row.lob_id?.name
      ? <Chip label={row.lob_id.name} size='small' sx={{ bgcolor: alpha('#0ea5e9', 0.1), color: '#0ea5e9', fontWeight: 600, fontSize: 11 }} />
      : <Typography color='text.disabled' variant='caption'>—</Typography>
  },
  { flex: 0.18, minWidth: 150, field: 'company_id', headerName: 'Company',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{row.company_id?.company_name || '—'}</Typography>
  },
  { flex: 0.12, minWidth: 110, field: 'location', headerName: 'Location',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{row.location || '—'}</Typography>
  },
  { flex: 0.1, minWidth: 90, field: 'status', headerName: 'Status',
    renderCell: ({ row }) => <CustomChip rounded skin='light' size='small' label={row.status || 'Active'} color={row.status === 'Active' ? 'success' : 'secondary'} />
  },
  { flex: 0.08, minWidth: 80, sortable: false, field: 'actions', headerName: 'Actions', renderCell: ({ row }) => <RowOptions id={row._id} /> }
]

// ─── LOB Management section ───────────────────────────────────────────────────
const LOBSection = () => {
  const dispatch    = useDispatch()
  const lobs        = useSelector(selectAllLOBs)
  const lobLoading  = useSelector(selectLOBLoading)
  const [input, setInput] = useState('')
  const [editLob, setEditLob] = useState(null) // { _id, name }
  const [editName, setEditName] = useState('')

  useEffect(() => { dispatch(fetchLOBs()) }, [dispatch])

  const handleAdd = async () => {
    const v = input.trim()
    if (!v) return
    if (lobs.some(l => l.name?.toLowerCase() === v.toLowerCase())) { toast.error('LOB already exists'); return }
    try {
      await dispatch(createLOB({ name: v })).unwrap()
      toast.success(`"${v}" added`)
      setInput('')
    } catch (err) { toast.error(typeof err === 'string' ? err : err?.message || 'Failed') }
  }

  const handleDelete = async id => {
    try { await dispatch(deleteLOB(id)).unwrap(); toast.success('LOB removed') }
    catch (err) { toast.error(typeof err === 'string' ? err : 'Failed to remove — LOB may be in use') }
  }

  const handleEditSave = async () => {
    if (!editName.trim() || !editLob) return
    try {
      await dispatch(updateLOB({ id: editLob._id, payload: { name: editName.trim() } })).unwrap()
      toast.success('LOB renamed'); setEditLob(null)
    } catch (err) { toast.error(typeof err === 'string' ? err : 'Rename failed') }
  }

  return (
    <Card sx={{ mb: 4 }}>
      <Box sx={{ px: 5, py: 3.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Stack direction='row' alignItems='center' spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha('#10b981', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon icon='tabler:git-branch' fontSize={18} style={{ color: '#10b981' }} />
            </Box>
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 700, lineHeight: 1 }}>Lines of Business (LOBs)</Typography>
              <Typography variant='caption' color='text.secondary'>Step 1 — Define LOBs before creating Business Units</Typography>
            </Box>
          </Stack>
        </Box>
        <Chip label={`${lobs.length} LOBs`} size='small' color='primary' variant='outlined' />
      </Box>

      <Box sx={{ px: 5, py: 4 }}>
        <Alert severity='info' icon={<Icon icon='tabler:info-circle' />} sx={{ mb: 3 }}>
          <Typography variant='caption'>
            <strong>Each Business Unit must belong to a Line of Business.</strong> Create your LOBs here first, then use them when creating units below. LOBs represent major operating divisions (e.g. Technology, Products, Operations).
          </Typography>
        </Alert>

        {/* LOB tags */}
        <Stack direction='row' flexWrap='wrap' gap={1.5} sx={{ mb: 3, minHeight: 40 }}>
          {lobs.length === 0 && !lobLoading && (
            <Typography variant='caption' color='text.disabled' sx={{ py: 1 }}>No LOBs yet — add your first one below</Typography>
          )}
          {lobs.map(lob => (
            <Chip
              key={lob._id}
              label={lob.name}
              color='primary'
              variant='outlined'
              sx={{ fontWeight: 600, fontSize: 13 }}
              onDelete={() => handleDelete(lob._id)}
              onClick={() => { setEditLob(lob); setEditName(lob.name) }}
            />
          ))}
        </Stack>

        {/* Add new LOB */}
        <Stack direction='row' spacing={2} alignItems='center'>
          <CustomTextField
            size='small' placeholder='Enter LOB name (e.g. Technology, Products…)' value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
            sx={{ flex: 1, maxWidth: 360 }}
            InputProps={{ startAdornment: <InputAdornment position='start'><Icon icon='tabler:plus' fontSize={16} /></InputAdornment> }}
          />
          <Button variant='contained' size='small' onClick={handleAdd} disabled={!input.trim() || lobLoading}>
            Add LOB
          </Button>
        </Stack>

        {lobs.length > 0 && (
          <Typography variant='caption' color='text.disabled' sx={{ display: 'block', mt: 1.5 }}>
            Click a LOB chip to rename it · Delete removes it (only if no units are assigned)
          </Typography>
        )}
      </Box>

      {/* Rename dialog */}
      <Dialog open={!!editLob} onClose={() => setEditLob(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Rename LOB</DialogTitle>
        <DialogContent>
          <CustomTextField
            fullWidth autoFocus label='New Name' value={editName} size='small' sx={{ mt: 1 }}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleEditSave() }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant='outlined' color='secondary' onClick={() => setEditLob(null)}>Cancel</Button>
          <Button variant='contained' onClick={handleEditSave} disabled={!editName.trim()}>Save</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const UnitsPage = () => {
  const [search, setSearch]   = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const dispatch = useDispatch()
  const units    = useSelector(selectAllUnits)
  const loading  = useSelector(selectUnitLoading)

  useEffect(() => { dispatch(fetchUnits()) }, [dispatch])

  const filteredRows = units.filter(row =>
    !search ||
    row.name?.toLowerCase().includes(search.toLowerCase()) ||
    row.location?.toLowerCase().includes(search.toLowerCase()) ||
    row.lob_id?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800 }}>Business Units</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
            Step 1: Create LOBs · Step 2: Create Business Units
          </Typography>
        </Box>
      </Box>

      {/* LOB Management — always shown first */}
      <LOBSection />

      {/* Units table */}
      <Card>
        <Box sx={{ px: 5, py: 3.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha('#6366f1', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon icon='tabler:building-community' fontSize={18} style={{ color: '#6366f1' }} />
            </Box>
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 700, lineHeight: 1 }}>Business Units</Typography>
              <Typography variant='caption' color='text.secondary'>Step 2 — Create units under your LOBs</Typography>
            </Box>
          </Box>
          <Stack direction='row' spacing={2} alignItems='center'>
            <CustomTextField value={search} placeholder='Search units, LOB, location…' size='small' sx={{ width: 240 }}
              onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position='start'><Icon icon='tabler:search' fontSize={16} /></InputAdornment> }} />
            <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={() => setAddOpen(true)}>
              Add Unit
            </Button>
          </Stack>
        </Box>
        <DataGrid
          autoHeight rowHeight={62} loading={loading} rows={filteredRows} columns={columns}
          getRowId={row => row._id} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
          rowCount={filteredRows.length}
          sx={{ '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' } }}
        />
      </Card>

      <AddUnitDrawer open={addOpen} toggle={() => setAddOpen(p => !p)} />
    </Box>
  )
}

export default UnitsPage
