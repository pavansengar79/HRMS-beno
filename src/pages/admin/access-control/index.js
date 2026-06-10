// src/pages/admin/access-control/index.js
// Access Control — Roles, Privileges, Module Access Matrix
// Visible to: org_admin, company_admin
// Wired to: GET/POST/PUT/DELETE /roles, GET /roles/assignable-permissions, PUT /roles/:id/modules

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { selectRoleSlug } from 'src/store/auth/authSlice'
import { selectSelectedCompanyId, selectSelectedUnitId } from 'src/store/hierarchy/hierarchySlice'
import axiosRequest from 'src/utils/AxiosInterceptor'

// Auto-generate a URL-safe slug from a display name
const toSlug = name =>
  name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableContainer from '@mui/material/TableContainer'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import CircularProgress from '@mui/material/CircularProgress'
// import FormControlLabel from '@mui/material/FormControlLabel'
import toast from 'react-hot-toast'

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_MODULES = ['hrms', 'crm', 'sales', 'bd', 'admin', 'organisation']

const MODULE_LABELS = {
  hrms: 'HRMS', crm: 'CRM', sales: 'Sales', bd: 'BD',
  admin: 'System Admin', organisation: 'Organisation',
}

const PRIV_CATEGORY_COLOR = {
  'HR Operations': 'success',
  'Payroll':       'warning',
  'Organisation':  'info',
  'Configuration': 'primary',
  'Self-Service':  'success',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const userClassColor = cls => ({
  Administrative: 'info', Privilege: 'warning', 'General User': 'secondary', General: 'secondary',
}[cls] || 'secondary')

// ─── Role Detail Modal ─────────────────────────────────────────────────────────

const RoleDetailModal = ({ open, role, onClose, onEdit }) => {
  if (!role) return null
  const permissions = role.permissions || []
  const modules     = role.modules     || []
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='h6'>{role.name} — Role Detail</Typography>
        <IconButton size='small' onClick={onClose}><Icon icon='tabler:x' /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction='row' spacing={2} alignItems='center' mb={3}>
          <CustomChip rounded skin='light' label={role.userClass || role.level || 'Role'} color={userClassColor(role.userClass)} size='small' />
          <Typography variant='body2' color='text.secondary'>{role.holderCount ?? role.holders ?? 0} users hold this role</Typography>
        </Stack>
        <Typography variant='overline' color='text.secondary' display='block' mb={1}>Modules accessible</Typography>
        <Stack direction='row' flexWrap='wrap' gap={1} mb={3}>
          {modules.length > 0
            ? modules.map(m => <CustomChip key={m} rounded skin='light' label={MODULE_LABELS[m] || m} color='success' size='small' />)
            : <Typography variant='caption' color='text.disabled'>No modules assigned</Typography>}
        </Stack>
        <Typography variant='overline' color='text.secondary' display='block' mb={1}>Privileges assigned</Typography>
        <Stack spacing={0.75} sx={{ maxHeight: 220, overflowY: 'auto' }}>
          {permissions.length > 0
            ? permissions.map(p => (
                <Box key={p._id || p} sx={{ px: 2, py: 0.75, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant='caption' sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.label || p.name || p}</Typography>
                  {p.frRef && <Typography variant='caption' color='text.disabled' sx={{ ml: 1 }}>{p.frRef}</Typography>}
                </Box>
              ))
            : <Typography variant='caption' color='text.disabled'>No privileges assigned</Typography>}
        </Stack>
        {role.description && <Alert severity='info' sx={{ mt: 3 }}>{role.description}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={onClose}>Close</Button>
        {!role.isSystem && <Button variant='contained' onClick={() => { onClose(); onEdit(role) }}>Edit Role</Button>}
      </DialogActions>
    </Dialog>
  )
}

// ─── Module Matrix Modal ───────────────────────────────────────────────────────

const ModuleMatrixModal = ({ open, role, onClose, onSaved }) => {
  const [selected, setSelected] = useState([])
  const [saving, setSaving]     = useState(false)
  useEffect(() => { if (role) setSelected(role.modules || []) }, [role])
  if (!role) return null
  const toggle = m => setSelected(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  const handleSave = async () => {
    setSaving(true)
    try {
      await axiosRequest.put(`/api/v1/roles/${role._id}/modules`, { modules: selected })
      toast.success('Module access updated')
      onSaved(); onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update modules')
    } finally { setSaving(false) }
  }
  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='h6'>Edit Modules — {role.name}</Typography>
        <IconButton size='small' onClick={onClose}><Icon icon='tabler:x' /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 2 }}>Select which modules this role can access</Typography>
        <Stack spacing={1}>
          {ALL_MODULES.map(m => (
            <FormControlLabel key={m}
              control={<Checkbox checked={selected.includes(m)} onChange={() => toggle(m)} size='small' />}
              label={<Typography variant='body2'>{MODULE_LABELS[m]}</Typography>} />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant='contained' onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={16} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Create / Edit Role Modal ──────────────────────────────────────────────────

const RoleFormModal = ({ open, editRole, permissions, onClose, onSaved, defaultLevel }) => {
  const isEdit = Boolean(editRole)
  const [form, setForm] = useState({ name: '', level: defaultLevel || 'unit', description: '', selectedPermissions: [] })
  const [saving, setSaving] = useState(false)
  // When defaultLevel is locked from context, the dropdown is hidden
  const levelLocked = Boolean(defaultLevel)
  useEffect(() => {
    if (editRole) {
      setForm({ name: editRole.name || '', level: editRole.level || defaultLevel || 'unit', description: editRole.description || '',
                selectedPermissions: (editRole.permissions || []).map(p => p._id || p) })
    } else {
      setForm({ name: '', level: defaultLevel || 'unit', description: '', selectedPermissions: [] })
    }
  }, [editRole, open, defaultLevel])
  const togglePerm = id => setForm(prev => ({
    ...prev,
    selectedPermissions: prev.selectedPermissions.includes(id)
      ? prev.selectedPermissions.filter(x => x !== id) : [...prev.selectedPermissions, id],
  }))
  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Role name is required'); return }
    setSaving(true)
    try {
      const payload = {
        name:        form.name.trim(),
        slug:        toSlug(form.name),
        level:       form.level,
        description: form.description.trim(),
        permissions: form.selectedPermissions,
      }
      if (isEdit) {
        await axiosRequest.put(`/api/v1/roles/${editRole._id}`, payload)
        toast.success('Role updated')
      } else {
        await axiosRequest.post('/api/v1/roles', payload)
        toast.success(`Role "${form.name}" created`)
      }
      onSaved(); onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || (isEdit ? 'Update failed' : 'Create failed'))
    } finally { setSaving(false) }
  }
  // Group permissions by category
  const grouped = {}
  ;(permissions || []).forEach(p => { const c = p.category || 'General'; if (!grouped[c]) grouped[c] = []; grouped[c].push(p) })
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth component='form' onSubmit={handleSubmit}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='h6'>{isEdit ? 'Edit Role' : 'Create Custom Role'}</Typography>
        <IconButton size='small' onClick={onClose} type='button'><Icon icon='tabler:x' /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <CustomTextField fullWidth label='Role Name' placeholder='e.g. Finance Manager'
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </Grid>
          <Grid item xs={12} sm={6}>
            {levelLocked ? (
              <CustomTextField fullWidth label='Level' value={form.level} disabled
                helperText='Auto-set from your current context' />
            ) : (
              <CustomTextField fullWidth select label='Level' value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                <MenuItem value='unit'>Unit</MenuItem>
                <MenuItem value='company'>Company</MenuItem>
                <MenuItem value='org'>Organisation</MenuItem>
              </CustomTextField>
            )}
          </Grid>
          <Grid item xs={12}>
            <CustomTextField fullWidth label='Description' placeholder='Brief description of this role'
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </Grid>
        </Grid>
        <Typography variant='overline' color='text.secondary' display='block' mb={1}>Assign Permissions</Typography>
        {permissions.length === 0
          ? <Typography variant='caption' color='text.disabled'>No assignable permissions loaded</Typography>
          : Object.entries(grouped).map(([cat, perms]) => (
              <Box key={cat} sx={{ mb: 2 }}>
                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', mb: 1 }}>{cat}</Typography>
                <Stack spacing={0.5}>
                  {perms.map(p => (
                    <Box key={p._id} sx={{ px: 2, py: 0.5, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox size='small' checked={form.selectedPermissions.includes(p._id)} onChange={() => togglePerm(p._id)} />
                      <Box>
                        <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 600, lineHeight: 1.3 }}>{p.label || p.name}</Typography>
                        {p.frRef && <Typography variant='caption' color='text.disabled'>{p.frRef}</Typography>}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))
        }
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={onClose} type='button' disabled={saving}>Cancel</Button>
        <Button variant='contained' type='submit' disabled={saving}>
          {saving ? <CircularProgress size={16} /> : isEdit ? 'Save Changes' : 'Create Role'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const AccessControlPage = () => {
  const [roles,       setRoles]       = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [activeTab,   setActiveTab]   = useState(null)

  // Determine level context from Redux so Create Role auto-selects the right level
  const roleSlug         = useSelector(selectRoleSlug)
  const selectedCompanyId = useSelector(selectSelectedCompanyId)
  const selectedUnitId    = useSelector(selectSelectedUnitId)

  // Derive which level is active: unit > company > org
  const contextLevel = selectedUnitId
    ? 'unit'
    : selectedCompanyId
      ? 'company'
      : (roleSlug === 'unit_admin' || roleSlug === 'hr_manager')
        ? 'unit'
        : (roleSlug === 'company_admin' || roleSlug === 'company_hr_manager')
          ? 'company'
          : null // org_admin / super_admin — let user choose

  // modal states
  const [detailOpen,   setDetailOpen]   = useState(false)
  const [formOpen,     setFormOpen]     = useState(false)
  const [matrixOpen,   setMatrixOpen]   = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [editRole,     setEditRole]     = useState(null)
  const [matrixRole,   setMatrixRole]   = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [rolesRes, permsRes] = await Promise.all([
        axiosRequest.get('/api/v1/roles'),
        axiosRequest.get('/api/v1/roles/assignable-permissions').catch(() => ({ data: [] })),
      ])
      const rolesData = Array.isArray(rolesRes?.data) ? rolesRes.data : rolesRes?.data?.roles || []
      const permsData = Array.isArray(permsRes?.data) ? permsRes.data : permsRes?.data?.permissions || []
      setRoles(rolesData)
      setPermissions(permsData)
      if (permsData.length > 0) {
        const cats = [...new Set(permsData.map(p => p.category).filter(Boolean))]
        setActiveTab(t => t || cats[0] || 'General')
      }
    } catch (err) {
      toast.error('Failed to load roles')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleDelete = async role => {
    const count = role.holderCount ?? role.holders ?? 0
    if (count > 0) { toast.error(`Cannot delete — ${count} users hold this role`); return }
    try {
      await axiosRequest.delete(`/api/v1/roles/${role._id}`)
      toast.success(`${role.name} deleted`)
      loadData()
    } catch (err) { toast.error(err?.response?.data?.message || 'Delete failed') }
  }

  const filteredRoles = roles.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.level?.toLowerCase().includes(search.toLowerCase())
  )
  const customRoles  = roles.filter(r => !r.isSystem)
  const totalHolders = roles.reduce((s, r) => s + (r.holderCount || 0), 0)

  const permsByCategory = {}
  permissions.forEach(p => { const c = p.category || 'General'; if (!permsByCategory[c]) permsByCategory[c] = []; permsByCategory[c].push(p) })
  const privCategories = Object.keys(permsByCategory)

  return (
    <Grid container spacing={6}>
      {/* ── Stats ── */}
      <Grid item xs={12}>
        <Grid container spacing={4}>
          {[
            { icon: 'tabler:lock',   value: roles.length,       label: 'Total Roles',    sub: `${customRoles.length} custom`, color: 'primary' },
            { icon: 'tabler:users',  value: totalHolders,       label: 'Users Assigned', sub: 'across all roles',             color: 'success' },
            { icon: 'tabler:pencil', value: customRoles.length, label: 'Custom Roles',   sub: 'created by admin',             color: 'warning' },
            { icon: 'tabler:key',    value: permissions.length, label: 'Permissions',    sub: 'assignable to custom roles',   color: 'info' },
          ].map(stat => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card sx={{ p: 4 }}>
                <Box sx={{ p: 2, bgcolor: `${stat.color}.light`, borderRadius: 1.5, display: 'inline-flex', mb: 2 }}>
                  <Icon icon={stat.icon} fontSize={22} />
                </Box>
                <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: -0.5 }}>{loading ? '—' : stat.value}</Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>{stat.label}</Typography>
                <Typography variant='caption' color='text.disabled' sx={{ display: 'block' }}>{stat.sub}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* ── Roles Table ── */}
      <Grid item xs={12}>
        <Card>
          <Box sx={{ p: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>All Roles</Typography>
              <Typography variant='body2' color='text.secondary'>{loading ? 'Loading…' : `${roles.length} roles · ${totalHolders} users assigned`}</Typography>
            </Box>
            <Stack direction='row' spacing={2}>
              <CustomTextField size='small' placeholder='Search roles…' value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <Icon icon='tabler:search' style={{ marginRight: 8, opacity: 0.5 }} /> }} />
              <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={() => { setEditRole(null); setFormOpen(true) }}>Create Role</Button>
            </Stack>
          </Box>
          <Alert severity='info' sx={{ mx: 5, mb: 3 }}>
            <strong>Administrative Palette:</strong> System-level role management lives here. Parent role is the ceiling — a child role can never exceed parent privileges.
          </Alert>
          <Divider sx={{ m: '0 !important' }} />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Role Name</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell align='center'>Holders</TableCell>
                    <TableCell>Modules</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRoles.map(role => {
                    const holders  = role.holderCount ?? role.holders ?? 0
                    const isSystem = role.isSystem || false
                    const mods     = (role.modules || []).map(m => MODULE_LABELS[m] || m).join(' · ') || '—'
                    return (
                      <TableRow key={role._id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }}>{role.name}</Typography>
                          {role.description && <Typography variant='caption' color='text.secondary'>{role.description}</Typography>}
                        </TableCell>
                        <TableCell>
                          <CustomChip rounded skin='light' label={role.userClass || role.level || '—'} size='small' color={userClassColor(role.userClass)} />
                        </TableCell>
                        <TableCell align='center'><Typography sx={{ fontWeight: 700 }}>{holders}</Typography></TableCell>
                        <TableCell><Typography variant='body2' color='text.secondary' noWrap sx={{ maxWidth: 220 }}>{mods}</Typography></TableCell>
                        <TableCell>
                          <CustomChip rounded skin='light' label={isSystem ? 'System' : 'Custom'} size='small' color={isSystem ? 'primary' : 'secondary'} />
                        </TableCell>
                        <TableCell align='center'>
                          <Stack direction='row' spacing={0.5} justifyContent='center'>
                            <Tooltip title='View Details'>
                              <IconButton size='small' onClick={() => { setSelectedRole(role); setDetailOpen(true) }}>
                                <Icon icon='tabler:eye' fontSize={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Edit Module Access'>
                              <IconButton size='small' onClick={() => { setMatrixRole(role); setMatrixOpen(true) }}>
                                <Icon icon='tabler:layout-grid' fontSize={16} />
                              </IconButton>
                            </Tooltip>
                            {!isSystem && (
                              <>
                                <Tooltip title='Edit Role'>
                                  <IconButton size='small' onClick={() => { setEditRole(role); setFormOpen(true) }}>
                                    <Icon icon='tabler:pencil' fontSize={16} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={holders > 0 ? `Cannot delete — ${holders} users` : 'Delete Role'}>
                                  <span>
                                    <IconButton size='small' color='error' disabled={holders > 0} onClick={() => handleDelete(role)}>
                                      <Icon icon='tabler:trash' fontSize={16} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredRoles.length === 0 && (
                    <TableRow><TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                      <Typography color='text.secondary'>No roles found</Typography>
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Grid>

      {/* ── Module Access Matrix ── */}
      <Grid item xs={12}>
        <Card>
          <Box sx={{ p: 5, pb: 3 }}>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>Module Access Matrix</Typography>
            <Typography variant='body2' color='text.secondary'>Which roles can access which modules · click the grid icon on any role to edit</Typography>
          </Box>
          <Divider sx={{ m: '0 !important' }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  {ALL_MODULES.map(m => <TableCell key={m} align='center'>{MODULE_LABELS[m]}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map(role => (
                  <TableRow key={role._id} hover>
                    <TableCell><Typography sx={{ fontWeight: 600 }}>{role.name}</Typography></TableCell>
                    {ALL_MODULES.map(m => {
                      const has = (role.modules || []).includes(m)
                      return (
                        <TableCell key={m} align='center'>
                          <CustomChip rounded skin='light' label={has ? 'Full access' : '—'} size='small' color={has ? 'success' : 'secondary'} />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>

      {/* ── Privilege Master List ── */}
      <Grid item xs={12}>
        <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>Privilege Master List</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>All available system permissions from the API, grouped by category</Typography>
        {privCategories.length > 0 && (
          <>
            <Stack direction='row' spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              {privCategories.map(cat => (
                <Chip key={cat} label={cat} size='small'
                  variant={activeTab === cat ? 'filled' : 'outlined'}
                  color={activeTab === cat ? 'primary' : 'default'}
                  onClick={() => setActiveTab(cat)} />
              ))}
            </Stack>
            <Card>
              <Box sx={{ p: 4, pb: 3 }}><Typography variant='subtitle1' sx={{ fontWeight: 700 }}>{activeTab}</Typography></Box>
              <Divider sx={{ m: '0 !important' }} />
              <Stack spacing={0}>
                {(permsByCategory[activeTab] || []).map((priv, i, arr) => (
                  <Box key={priv._id} sx={{ px: 4, py: 2.5, borderBottom: i < arr.length - 1 ? '1px solid' : 'none', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                    <Stack direction='row' spacing={1} alignItems='center' mb={0.5}>
                      <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 700, color: `${PRIV_CATEGORY_COLOR[activeTab] || 'primary'}.main` }}>
                        {priv.label || priv.name}
                      </Typography>
                      {priv.frRef && <Chip label={priv.frRef} size='small' variant='outlined' sx={{ height: 18, fontSize: 10, fontFamily: 'monospace' }} />}
                    </Stack>
                    {priv.description && <Typography variant='caption' color='text.secondary'>{priv.description}</Typography>}
                  </Box>
                ))}
              </Stack>
            </Card>
          </>
        )}
        {!loading && permissions.length === 0 && (
          <Card sx={{ p: 4 }}><Typography color='text.secondary' align='center'>No assignable permissions found</Typography></Card>
        )}
      </Grid>

      {/* ── Modals ── */}
      <RoleDetailModal open={detailOpen} role={selectedRole} onClose={() => setDetailOpen(false)}
        onEdit={role => { setEditRole(role); setFormOpen(true) }} />
      <RoleFormModal open={formOpen} editRole={editRole} permissions={permissions}
        onClose={() => setFormOpen(false)} onSaved={loadData} defaultLevel={contextLevel} />
      <ModuleMatrixModal open={matrixOpen} role={matrixRole}
        onClose={() => setMatrixOpen(false)} onSaved={loadData} />
    </Grid>
  )
}

export default AccessControlPage
