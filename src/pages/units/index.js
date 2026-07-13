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
import CircularProgress from '@mui/material/CircularProgress'
import { DataGrid } from '@mui/x-data-grid'
import { alpha } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUnits, deleteUnit, selectAllUnits, selectUnitLoading } from 'src/store/unit/unitSlice'
import { fetchLOBs, createLOB, deleteLOB, updateLOB, selectAllLOBs, selectLOBLoading } from 'src/store/lob/lobSlice'
import toast from 'react-hot-toast'
import AddUnitDrawer from './AddUnitDrawer'
import EditUnitDrawer from './EditUnitDrawer'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { selectCompanyId, selectRoleSlug } from 'src/store/auth/authSlice'

// ─── Assign Responsible Person Dialog ──────────────────────────────────────────────────────────
const AssignResponsibleDialog = ({ open, onClose, unit, onSuccess }) => {
  const userCompanyId = useSelector(selectCompanyId)
  const userRoleSlug = useSelector(selectRoleSlug)
  
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', roleId: '' })

  useEffect(() => {
    if (!open) return
    const fetchRoles = async () => {
      setLoading(true)
      try {
        // Fetch unit-level roles (unit_admin, hr_manager)
        const res = await axiosRequest.get('/api/v1/roles/')
        const allRoles = res?.data || []
        // Filter to only unit-level roles
        const unitRoles = allRoles.filter(r => r.level === 'unit' || r.slug === 'unit_admin' || r.slug === 'hr_manager')
        setRoles(unitRoles)
        // Auto-select unit_admin if available
        const unitAdminRole = unitRoles.find(r => r.slug === 'unit_admin')
        if (unitAdminRole) {
          setFormData(p => ({ ...p, roleId: unitAdminRole._id }))
        }
      } catch (err) {
        toast.error('Failed to load roles')
      } finally {
        setLoading(false)
      }
    }
    fetchRoles()
  }, [open])

  const handleChange = (field) => (e) => {
    setFormData(p => ({ ...p, [field]: e.target.value }))
  }

  const handleAssign = async () => {
    if (!formData.name.trim()) { toast.error('Name is required'); return }
    if (!formData.email.trim()) { toast.error('Email is required'); return }
    if (!formData.roleId) { toast.error('Role is required'); return }
    
    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        roleId: formData.roleId,
        unit_id: unit._id
      }
      
      // If current user is org_admin, they need to specify company_id
      // If current user is company_admin, company_id comes from their token
      if (userRoleSlug === 'org_admin') {
        payload.company_id = unit.company_id?._id || unit.company_id
      }
      
      await axiosRequest.post('/api/v1/users/invite', payload)
      toast.success('Responsible person invited successfully')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to invite user')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setFormData({ name: '', email: '', roleId: '' })
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Assign Responsible Person</DialogTitle>
      <DialogContent>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Invite a new admin for <strong>{unit?.name}</strong>. Credentials will be emailed to them.
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>
        ) : (
          <Stack spacing={3}>
            <CustomTextField
              fullWidth label='Admin Name'
              value={formData.name} onChange={handleChange('name')}
              placeholder='Enter admin name'
            />
            <CustomTextField
              fullWidth label='Admin Email'
              type='email'
              value={formData.email} onChange={handleChange('email')}
              placeholder='admin@company.com'
            />
            <CustomTextField
              select fullWidth label='Assign Role'
              value={formData.roleId} onChange={handleChange('roleId')}
            >
              {roles.length === 0 ? (
                <MenuItem disabled>No unit-level roles available</MenuItem>
              ) : (
                roles.map(r => (
                  <MenuItem key={r._id} value={r._id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>{r.name}</Typography>
                      {r.level && (
                        <Typography variant='caption' sx={{ color: 'text.disabled', textTransform: 'capitalize' }}>
                          {r.level} level
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))
              )}
            </CustomTextField>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant='outlined' color='secondary' onClick={handleClose}>Cancel</Button>
        <Button variant='contained' onClick={handleAssign} disabled={saving || loading}>
          {saving ? <CircularProgress size={20} /> : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Unit Actions Cell ──────────────────────────────────────────────────────────
const UnitActionsCell = ({ row, onEdit, onAssign, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  return (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}><Icon icon='tabler:dots-vertical' /></IconButton>
      <Menu keepMounted anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ style: { minWidth: '8rem' } }}>
        <MenuItem onClick={() => { setAnchorEl(null); onEdit?.(row._id) }} sx={{ '& svg': { mr: 2 } }}><Icon icon='tabler:pencil' fontSize={20} />Edit</MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onAssign?.(row._id) }} sx={{ '& svg': { mr: 2 } }}><Icon icon='tabler:user-plus' fontSize={20} />Assign Responsible</MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onDelete?.(row._id) }} sx={{ '& svg': { mr: 2 }, color: 'error.main' }}><Icon icon='tabler:trash' fontSize={20} />Delete</MenuItem>
      </Menu>
    </>
  )
}

const getColumns = (handleEdit, handleAssign, handleDelete) => [
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
  { 
    flex: 0.2, 
    minWidth: 180, 
    field: 'admin', 
    headerName: 'Responsible Person',
    renderCell: ({ row }) => {
      if (row.admin && row.admin.name) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CustomAvatar skin='light' color='success' sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>
              {getInitials(row.admin.name)}
            </CustomAvatar>
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
                {row.admin.name}
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                {row.admin.email}
              </Typography>
            </Box>
          </Box>
        )
      }
      return (
        <Typography variant='body2' sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
          Not assigned
        </Typography>
      )
    }
  },
  { flex: 0.12, minWidth: 110, field: 'location', headerName: 'Location',
    renderCell: ({ row }) => {
      const hasGeo = row.geolocation?.latitude && row.geolocation?.longitude
      const radius = row.geolocation?.radiusMeters || 200
      
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            {row.location || '—'}
          </Typography>
          {hasGeo && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Icon icon='tabler:map-pin' fontSize={12} style={{ color: '#10b981' }} />
              <Typography variant='caption' sx={{ color: 'success.main', fontSize: 11 }}>
                {row.geolocation.latitude.toFixed(4)}, {row.geolocation.longitude.toFixed(4)}
              </Typography>
              <Chip 
                label={`±${radius}m`}
                size='small'
                sx={{ 
                  height: 18, 
                  fontSize: 10, 
                  bgcolor: 'success.light', 
                  color: 'success.dark',
                  '& .MuiChip-label': { px: 0.5 }
                }}
              />
            </Box>
          )}
        </Box>
      )
    }
  },
  { flex: 0.1, minWidth: 90, field: 'status', headerName: 'Status',
    renderCell: ({ row }) => <CustomChip rounded skin='light' size='small' label={row.status || 'Active'} color={row.status === 'Active' ? 'success' : 'secondary'} />
  },
  { flex: 0.08, minWidth: 80, sortable: false, field: 'actions', headerName: 'Actions', 
    renderCell: ({ row }) => <UnitActionsCell row={row} onEdit={handleEdit} onAssign={handleAssign} onDelete={handleDelete} />
  }
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
  const [editOpen, setEditOpen] = useState(false)
  const [editUnitId, setEditUnitId] = useState(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignUnitId, setAssignUnitId] = useState(null)
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

  const handleEdit = (id) => {
    setEditUnitId(id)
    setEditOpen(true)
  }

  const handleAssign = (id) => {
    setAssignUnitId(id)
    setAssignOpen(true)
  }

  const handleDelete = async (id) => {
    try { await dispatch(deleteUnit(id)).unwrap(); toast.success('Unit deleted') }
    catch (err) { toast.error(typeof err === 'string' ? err : err?.message || 'Failed') }
  }

  const handleAssignSuccess = () => {
    dispatch(fetchUnits())
  }

  const assignUnit = units.find(u => u._id === assignUnitId)
  const columns = getColumns(handleEdit, handleAssign, handleDelete)

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
      <EditUnitDrawer open={editOpen} unitId={editUnitId} onClose={() => { setEditOpen(false); setEditUnitId(null) }} onSuccess={() => dispatch(fetchUnits())} />
      <AssignResponsibleDialog open={assignOpen} unit={assignUnit} onClose={() => { setAssignOpen(false); setAssignUnitId(null) }} onSuccess={handleAssignSuccess} />
    </Box>
  )
}

export default UnitsPage
