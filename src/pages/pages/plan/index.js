// src/pages/super-admin/plans/index.jsx
// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import InputAdornment from '@mui/material/InputAdornment'
import { DataGrid } from '@mui/x-data-grid'
import { alpha, useTheme } from '@mui/material/styles'

// ** Redux
import { useSelector } from 'react-redux'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Axios
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Toast
import toast from 'react-hot-toast'

// ─── Constants ────────────────────────────────────────────────────────────────
const PACKAGE_TYPES = ['professionals', 'teams', 'enterprise', 'starter', 'growth', 'pro']

const STRUCTURE_LEVELS = [
  { value: 'unit',       label: 'Unit level' },
  { value: 'company',    label: 'Company level' },
  { value: 'enterprise', label: 'Enterprise level' },
]

const ALL_MODULES = [
  'employee', 'attendance', 'leave', 'payroll', 'organisation',
  'auth', 'recruitment', 'appraisal', 'training', 'expenses',
  'analytics', 'assets', 'helpdesk',
]

const EMPTY_FORM = {
  name:            '',
  package_type:    '',
  structure_level: 'unit',
  price_monthly:   '',
  price_annual:    '',
  seat_limit:      '',
  modules:         ['employee', 'auth'],
  is_active:       true,
}

// ─── Status chip ──────────────────────────────────────────────────────────────
const StatusChip = ({ active }) => (
  <Chip
    size='small'
    label={active ? 'Active' : 'Inactive'}
    color={active ? 'success' : 'default'}
    variant='outlined'
    icon={<Icon icon={active ? 'tabler:check' : 'tabler:x'} fontSize='0.8rem' />}
    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
  />
)

// ─── Plan form dialog (shared for Create + Edit) ──────────────────────────────
const PlanFormDialog = ({ open, plan, onClose, onSaved }) => {
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const isEdit = !!plan?._id

  // Populate form when editing
  useEffect(() => {
    if (plan) {
      setForm({
        name:            plan.name            || '',
        package_type:    plan.package_type    || '',
        structure_level: plan.structure_level || 'unit',
        price_monthly:   plan.price_monthly   ?? '',
        price_annual:    plan.price_annual    ?? '',
        seat_limit:      plan.seat_limit      ?? '',
        modules:         Array.isArray(plan.modules)
          ? plan.modules.map(m => typeof m === 'string' ? m : m.slug || m.name || String(m))
          : ['employee', 'auth'],
        is_active: plan.is_active ?? true,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [plan, open])

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }))
    setErrors(p => ({ ...p, [field]: '' }))
  }

  const toggleModule = (mod) => {
    setForm(p => ({
      ...p,
      modules: p.modules.includes(mod)
        ? p.modules.filter(m => m !== mod)
        : [...p.modules, mod],
    }))
  }

  // Validate
  const validate = () => {
    const e = {}
    if (!form.name.trim())         e.name         = 'Plan name is required.'
    if (!form.package_type.trim()) e.package_type = 'Package type is required.'
    if (!form.structure_level)     e.structure_level = 'Structure level is required.'
    if (form.modules.length === 0) e.modules      = 'Select at least one module.'
    if (form.price_monthly !== '' && isNaN(Number(form.price_monthly)))
      e.price_monthly = 'Must be a number.'
    if (form.price_annual !== '' && isNaN(Number(form.price_annual)))
      e.price_annual = 'Must be a number.'
    if (form.seat_limit !== '' && isNaN(Number(form.seat_limit)))
      e.seat_limit = 'Must be a number.'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    try {
      const payload = {
        name:            form.name.trim(),
        package_type:    form.package_type.trim(),
        structure_level: form.structure_level,
        price_monthly:   form.price_monthly !== '' ? Number(form.price_monthly) : null,
        price_annual:    form.price_annual  !== '' ? Number(form.price_annual)  : null,
        seat_limit:      form.seat_limit    !== '' ? Number(form.seat_limit)    : null,
        modules:         form.modules,
        is_active:       form.is_active,
      }

      if (isEdit) {
        // PUT /api/v1/plans/:id
        await axiosRequest.put(`/api/v1/plans/${plan._id}`, payload)
        toast.success('Plan updated successfully')
      } else {
        // POST /api/v1/plans
        await axiosRequest.post('/api/v1/plans', payload)
        toast.success('Plan created successfully')
      }

      onSaved()
      onClose()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed to save plan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={!saving ? onClose : undefined} maxWidth='md' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon icon={isEdit ? 'tabler:edit' : 'tabler:plus'} />
          <Typography variant='h6' fontWeight={700}>
            {isEdit ? 'Edit plan' : 'Create new plan'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={saving} size='small'>
          <Icon icon='tabler:x' />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 5 }}>
        <Grid container spacing={4}>

          {/* Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label='Plan name *' placeholder='e.g. Enterprise'
              value={form.name} onChange={e => set('name', e.target.value)}
              error={!!errors.name} helperText={errors.name}
            />
          </Grid>

          {/* Package type */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label='Package type *' placeholder='e.g. enterprise'
              value={form.package_type} onChange={e => set('package_type', e.target.value)}
              error={!!errors.package_type} helperText={errors.package_type || 'Unique slug identifier (lowercase)'}
              disabled={isEdit}  // Don't allow changing type after creation
            />
          </Grid>

          {/* Structure level */}
          <Grid item xs={12} sm={6}>
            <TextField
              select fullWidth label='Structure level *'
              value={form.structure_level} onChange={e => set('structure_level', e.target.value)}
              error={!!errors.structure_level} helperText={errors.structure_level}
            >
              {STRUCTURE_LEVELS.map(s => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Seat limit */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label='Seat limit' placeholder='Leave empty for unlimited'
              value={form.seat_limit} onChange={e => set('seat_limit', e.target.value)}
              error={!!errors.seat_limit} helperText={errors.seat_limit || 'Empty = unlimited seats'}
              InputProps={{
                endAdornment: <InputAdornment position='end'>employees</InputAdornment>
              }}
            />
          </Grid>

          {/* Monthly price */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label='Monthly price (₹)' placeholder='Leave empty for custom pricing'
              value={form.price_monthly} onChange={e => set('price_monthly', e.target.value)}
              error={!!errors.price_monthly} helperText={errors.price_monthly || 'Empty = "Contact Sales"'}
              InputProps={{
                startAdornment: <InputAdornment position='start'>₹</InputAdornment>
              }}
            />
          </Grid>

          {/* Annual price */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label='Annual price (₹)' placeholder='Total for the year'
              value={form.price_annual} onChange={e => set('price_annual', e.target.value)}
              error={!!errors.price_annual} helperText={errors.price_annual}
              InputProps={{
                startAdornment: <InputAdornment position='start'>₹</InputAdornment>
              }}
            />
          </Grid>

          {/* Active toggle */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={e => set('is_active', e.target.checked)}
                  color='success'
                />
              }
              label={
                <Box>
                  <Typography variant='body2' fontWeight={600}>
                    {form.is_active ? 'Active' : 'Inactive'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Inactive plans are hidden from public pricing page
                  </Typography>
                </Box>
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Modules */}
          <Grid item xs={12}>
            <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1 }}>
              Modules *
            </Typography>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
              Select which modules are available in this plan
            </Typography>
            {errors.modules && (
              <Typography variant='caption' color='error' sx={{ display: 'block', mb: 2 }}>
                {errors.modules}
              </Typography>
            )}
            <Grid container spacing={2}>
              {ALL_MODULES.map(mod => (
                <Grid item xs={6} sm={4} md={3} key={mod}>
                  <Box
                    onClick={() => toggleModule(mod)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      p: 2.5, borderRadius: 1, cursor: 'pointer',
                      border: theme => `1.5px solid ${
                        form.modules.includes(mod)
                          ? theme.palette.primary.main
                          : theme.palette.divider
                      }`,
                      bgcolor: theme => form.modules.includes(mod)
                        ? alpha(theme.palette.primary.main, 0.06)
                        : 'transparent',
                      transition: 'all 0.15s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: theme => alpha(theme.palette.primary.main, 0.04),
                      }
                    }}
                  >
                    <Checkbox
                      checked={form.modules.includes(mod)}
                      size='small'
                      sx={{ p: 0 }}
                      onClick={e => e.stopPropagation()}
                      onChange={() => toggleModule(mod)}
                    />
                    <Typography variant='body2' sx={{ textTransform: 'capitalize', fontWeight: form.modules.includes(mod) ? 600 : 400 }}>
                      {mod.replace(/_/g, ' ')}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Important note for edit */}
          {isEdit && (
            <Grid item xs={12}>
              <Alert severity='info' icon={<Icon icon='tabler:info-circle' />}>
                Updating this plan does <strong>not</strong> affect existing subscribers.
                They continue on their plan snapshot until they explicitly upgrade.
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 5, py: 3, gap: 2 }}>
        <Button variant='outlined' color='secondary' onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:device-floppy' />}
        >
          {saving ? 'Saving...' : isEdit ? 'Update plan' : 'Create plan'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────
const DeleteDialog = ({ open, plan, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      // DELETE /api/v1/plans/:id
      await axiosRequest.delete(`/api/v1/plans/${plan._id}`)
      toast.success(`Plan "${plan.name}" deleted`)
      onDeleted()
      onClose()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed to delete plan')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onClose={!deleting ? onClose : undefined} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Icon icon='tabler:alert-triangle' color='error' />
        Delete plan
      </DialogTitle>
      <DialogContent>
        <Typography variant='body2' color='text.secondary'>
          Are you sure you want to delete{' '}
          <strong style={{ color: 'inherit' }}>{plan?.name}</strong>?
        </Typography>
        <Alert severity='warning' sx={{ mt: 3 }} icon={<Icon icon='tabler:info-circle' />}>
          This action cannot be undone. Plans with active subscribers cannot be deleted.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 5, pb: 4 }}>
        <Button variant='outlined' color='secondary' onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <Button
          variant='contained'
          color='error'
          onClick={handleDelete}
          disabled={deleting}
          startIcon={deleting ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:trash' />}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Plan detail drawer ───────────────────────────────────────────────────────
const PlanDetailDialog = ({ open, plan, onClose }) => {
  if (!plan) return null
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon icon='tabler:eye' />
          {plan.name}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StatusChip active={plan.is_active} />
          <IconButton onClick={onClose} size='small'><Icon icon='tabler:x' /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {[
            ['Package type',    plan.package_type    || '—'],
            ['Structure level', plan.structure_level || '—'],
            ['Monthly price',   plan.price_monthly != null ? `₹${Number(plan.price_monthly).toLocaleString('en-IN')}` : 'Custom'],
            ['Annual price',    plan.price_annual  != null ? `₹${Number(plan.price_annual).toLocaleString('en-IN')}`  : 'Custom'],
            ['Seat limit',      plan.seat_limit    != null ? `${plan.seat_limit} employees` : 'Unlimited'],
            ['Created',         plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-IN') : '—'],
          ].map(([label, value]) => (
            <Grid item xs={6} key={label}>
              <Typography variant='caption' color='text.secondary'>{label}</Typography>
              <Typography variant='body2' fontWeight={600}>{value}</Typography>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 2 }}>
              Modules ({(plan.modules || []).length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {(plan.modules || []).map(m => {
                const label = typeof m === 'string' ? m : m.name || m.slug || String(m)
                return (
                  <Chip key={label} label={label.replace(/_/g, ' ')} size='small' variant='outlined'
                    sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }} />
                )
              })}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 5, py: 3 }}>
        <Button variant='outlined' color='secondary' onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
const SuperAdminPlansPage = () => {
  const theme = useTheme()

  // Permissions from Redux
  const permissions = useSelector(state => state.auth?.permissions || {})
  const { canCreate = true, canEdit = true, canDelete = true } = permissions?.plans || {}

  // State
  const [plans, setPlans]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Dialog state
  const [formDialog, setFormDialog]     = useState({ open: false, plan: null })   // create / edit
  const [deleteDialog, setDeleteDialog] = useState({ open: false, plan: null })
  const [viewDialog, setViewDialog]     = useState({ open: false, plan: null })

  // ── Fetch all plans (super admin) ─────────────────────────────────────────
  const loadPlans = useCallback(async () => {
    setLoading(true)
    try {
      // GET /api/v1/plans  (super admin — includes inactive)
      const res  = await axiosRequest.get('/api/v1/plans')
      const data = Array.isArray(res) ? res : res?.data || []
      setPlans(data)
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to load plans')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPlans() }, [loadPlans])

  // ── Filtered rows ──────────────────────────────────────────────────────────
  const filtered = plans.filter(p => {
    const matchSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.package_type?.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      statusFilter === 'all'      ? true :
      statusFilter === 'active'   ? p.is_active  :
      statusFilter === 'inactive' ? !p.is_active : true
    return matchSearch && matchStatus
  })

  // ── DataGrid columns ───────────────────────────────────────────────────────
  const columns = [
    {
      field: 'name', headerName: 'Plan name', flex: 1.2, minWidth: 150,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant='body2' fontWeight={600}>{row.name}</Typography>
          <Typography variant='caption' color='text.secondary' sx={{ textTransform: 'capitalize' }}>
            {row.package_type}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'structure_level', headerName: 'Level', flex: 0.8, minWidth: 110,
      renderCell: ({ value }) => (
        <Chip label={value || '—'} size='small' variant='outlined'
          sx={{ fontSize: '0.7rem', textTransform: 'capitalize' }} />
      ),
    },
    {
      field: 'price_monthly', headerName: 'Monthly', flex: 0.8, minWidth: 110,
      renderCell: ({ value }) => (
        <Typography variant='body2' fontWeight={600}>
          {value != null ? `₹${Number(value).toLocaleString('en-IN')}` : 'Custom'}
        </Typography>
      ),
    },
    {
      field: 'price_annual', headerName: 'Annual', flex: 0.8, minWidth: 110,
      renderCell: ({ value }) => (
        <Typography variant='body2'>
          {value != null ? `₹${Number(value).toLocaleString('en-IN')}` : 'Custom'}
        </Typography>
      ),
    },
    {
      field: 'seat_limit', headerName: 'Seats', flex: 0.7, minWidth: 90,
      renderCell: ({ value }) => (
        <Typography variant='body2'>
          {value != null ? value : 'Unlimited'}
        </Typography>
      ),
    },
    {
      field: 'modules', headerName: 'Modules', flex: 1.2, minWidth: 160,
      renderCell: ({ value }) => {
        const mods = Array.isArray(value) ? value : []
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {mods.slice(0, 3).map(m => {
              const label = typeof m === 'string' ? m : m.name || m.slug || ''
              return (
                <Chip key={label} label={label} size='small'
                  sx={{ fontSize: '0.6rem', height: 18, textTransform: 'capitalize' }} />
              )
            })}
            {mods.length > 3 && (
              <Chip label={`+${mods.length - 3}`} size='small'
                sx={{ fontSize: '0.6rem', height: 18, bgcolor: 'action.hover' }} />
            )}
          </Box>
        )
      },
    },
    {
      field: 'is_active', headerName: 'Status', flex: 0.7, minWidth: 100,
      renderCell: ({ value }) => <StatusChip active={value} />,
    },
    {
      field: 'actions', headerName: 'Actions', flex: 0.8, minWidth: 120,
      sortable: false, filterable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {/* View — always visible */}
          <Tooltip title='View details'>
            <IconButton size='small' onClick={() => setViewDialog({ open: true, plan: row })}>
              <Icon icon='tabler:eye' fontSize='1.1rem' />
            </IconButton>
          </Tooltip>

          {/* Edit — permission gated */}
          {canEdit && (
            <Tooltip title='Edit plan'>
              <IconButton size='small' onClick={() => setFormDialog({ open: true, plan: row })}>
                <Icon icon='tabler:edit' fontSize='1.1rem' />
              </IconButton>
            </Tooltip>
          )}

          {/* Delete — permission gated */}
          {canDelete && (
            <Tooltip title='Delete plan'>
              <IconButton size='small' color='error'
                onClick={() => setDeleteDialog({ open: true, plan: row })}>
                <Icon icon='tabler:trash' fontSize='1.1rem' />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ]

  return (
    <Box sx={{ p: { xs: 3, md: 6 } }}>
      {/* ── Page header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
        <Box>
          <Typography variant='h5' fontWeight={700} sx={{ mb: 0.5 }}>
            Plan management
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Create, edit and manage pricing plans. Changes do not affect existing subscribers.
          </Typography>
        </Box>

        {/* Add plan — permission gated */}
        {canCreate && (
          <Button
            variant='contained'
            startIcon={<Icon icon='tabler:plus' />}
            onClick={() => setFormDialog({ open: true, plan: null })}
          >
            Create plan
          </Button>
        )}
      </Box>

      {/* ── Stats row ── */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {[
          { label: 'Total plans',    value: plans.length,                          icon: 'tabler:layout-grid', color: 'primary' },
          { label: 'Active plans',   value: plans.filter(p => p.is_active).length,  icon: 'tabler:check-circle', color: 'success' },
          { label: 'Inactive plans', value: plans.filter(p => !p.is_active).length, icon: 'tabler:circle-off',   color: 'warning' },
        ].map(s => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Card variant='outlined' sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{
                p: 2.5, borderRadius: 1,
                bgcolor: theme => alpha(theme.palette[s.color].main, 0.1),
                color: `${s.color}.main`, display: 'flex',
              }}>
                <Icon icon={s.icon} fontSize='1.5rem' />
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700}>{s.value}</Typography>
                <Typography variant='body2' color='text.secondary'>{s.label}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Filters ── */}
      <Card variant='outlined' sx={{ mb: 4 }}>
        <Box sx={{ p: 4, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size='small'
            placeholder='Search plans...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='tabler:search' fontSize='1rem' />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={() => setSearch('')}>
                    <Icon icon='tabler:x' fontSize='0.9rem' />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          <TextField
            select size='small' label='Status' value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value='all'>All</MenuItem>
            <MenuItem value='active'>Active</MenuItem>
            <MenuItem value='inactive'>Inactive</MenuItem>
          </TextField>

          <Box sx={{ ml: 'auto' }}>
            <Typography variant='caption' color='text.secondary'>
              Showing {filtered.length} of {plans.length} plans
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ── DataGrid ── */}
      <Card variant='outlined'>
        <DataGrid
          autoHeight
          rows={filtered}
          columns={columns}
          getRowId={row => row._id}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' },
            '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
          }}
        />
      </Card>

      {/* ── Dialogs ── */}
      <PlanFormDialog
        open={formDialog.open}
        plan={formDialog.plan}
        onClose={() => setFormDialog({ open: false, plan: null })}
        onSaved={loadPlans}
      />

      <DeleteDialog
        open={deleteDialog.open}
        plan={deleteDialog.plan}
        onClose={() => setDeleteDialog({ open: false, plan: null })}
        onDeleted={loadPlans}
      />

      <PlanDetailDialog
        open={viewDialog.open}
        plan={viewDialog.plan}
        onClose={() => setViewDialog({ open: false, plan: null })}
      />
    </Box>
  )
}

export default SuperAdminPlansPage