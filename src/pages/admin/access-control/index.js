// src/pages/admin/access-control/index.js
// Access Control — Roles, Privileges, Module Access Matrix
// Visible to: org_admin, company_admin
// Wired to: GET/POST/PUT/DELETE /roles, GET /roles/assignable-permissions, PUT /roles/:id/modules

import { useState, useEffect, useCallback } from 'react'
import React from 'react'
import { useSelector } from 'react-redux'
import { selectRoleSlug, selectPermissions, selectLevel } from 'src/store/auth/authSlice'
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
import InputAdornment from '@mui/material/InputAdornment'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import CircularProgress from '@mui/material/CircularProgress'
import toast from 'react-hot-toast'

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_MODULES = ['hrms', 'crm', 'sales', 'bd', 'admin', 'organisation']

// Permission constants
const CAN_VIEW_ACCESS_CONTROL = ['role.read']
const CAN_CREATE_ROLE = 'role.create'
const CAN_UPDATE_ROLE = 'role.update'
const CAN_DELETE_ROLE = 'role.delete'

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

// Backend permission objects look like:
//   { _id, name: "department.create", module: "department", scope: [...], slug: "department.create" }
// There is NO separate `action` field — the action is the part after the
// last "." in name/slug. Deriving it here instead of trusting a p.action
// field (which never exists) is what makes the Create/Edit Role table
// actually populate instead of everything silently collapsing into "read".
const getAction = p => {
  const raw = p?.name || p?.slug || ''
  const parts = raw.split('.')
  return (parts.length > 1 ? parts[parts.length - 1] : 'read').toLowerCase()
}

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

// ─── Constants for Permission Matrix ───────────────────────────────────────

const PERMISSION_DEPENDENCIES = {
  'payroll.run': ['attendance.read', 'leave.read', 'payrollPolicy.read'],
  'payroll.create': ['attendance.read', 'payrollPolicy.read'],
  'leave.approve': ['attendance.read', 'leave.read'],
  'attendance.approve': ['attendance.read'],
  'payrollPolicy.update': ['payrollPolicy.read', 'attendancePolicy.read'],
  'attendancePolicy.update': ['attendancePolicy.read', 'attendance.read'],
  'leavePolicy.update': ['leavePolicy.read', 'leave.read'],
}

const ACTION_ORDER = ['create', 'read', 'update', 'delete', 'approve', 'run']

const ACTION_COLORS = {
  create: 'success',
  read: 'info',
  update: 'warning',
  delete: 'error',
  approve: 'primary',
  run: 'secondary'
}

const ACTION_LABELS = {
  create: 'Add',
  read: 'View',
  update: 'Edit',
  delete: 'Delete',
  approve: 'Approve',
  run: 'Execute'
}

const MODULE_ICONS = {
  employee: 'tabler:users',
  payroll: 'tabler:credit-card',
  attendance: 'tabler:calendar-check',
  leave: 'tabler:calendar-off',
  shift: 'tabler:clock',
  roster: 'tabler:list-check',
  holiday: 'tabler:calendar-event',
  designation: 'tabler:badge',
  department: 'tabler:building',
  company: 'tabler:building-skyscraper',
  organisation: 'tabler:building-skyscraper',
  unit: 'tabler:building-community',
  user: 'tabler:user-cog',
  role: 'tabler:shield',
  permission: 'tabler:key',
  settings: 'tabler:settings',
  dashboard: 'tabler:dashboard',
  report: 'tabler:chart-bar',
  leavePolicy: 'tabler:calendar-off',
  attendancePolicy: 'tabler:calendar-check',
  payrollPolicy: 'tabler:credit-card',
  subscription: 'tabler:crown',
  plan: 'tabler:layout-grid',
  delegation: 'tabler:user-share',
  notification: 'tabler:bell',
  auditLog: 'tabler:history',
}

// ─── Module Matrix Modal ───────────────────────────────────────────────────────
// This modal now uses the EXACT same UI as the Create Role modal
// with auto-prefilled permissions based on the role's current state

const ModuleMatrixModal = ({ open, role, onClose, onSaved, allPermissions }) => {
  const [form, setForm] = useState({
    name: '',
    level: 'unit',
    description: '',
    selectedPermissions: []
  })
  const [saving, setSaving] = useState(false)
  const [permSearch, setPermSearch] = useState('')

  // Initialize form with role data when modal opens
  useEffect(() => {
    if (role && open) {
      const permIds = (role.permissions || []).map(p => p._id || p)
      setForm({
        name: role.name || '',
        level: role.level || 'unit',
        description: role.description || '',
        selectedPermissions: permIds
      })
    }
  }, [role, open])

  // Find permission by slug or _id
  const findPermBySlug = slug =>
    allPermissions.find(p => p.slug === slug || p._id === slug || p.name === slug)

  // Get all dependencies recursively
  const getAllDependencies = permSlug => {
    const deps = PERMISSION_DEPENDENCIES[permSlug] || []
    const allDeps = [...deps]
    deps.forEach(d => {
      const childDeps = getAllDependencies(d)
      childDeps.forEach(cd => {
        if (!allDeps.includes(cd)) allDeps.push(cd)
      })
    })
    return allDeps
  }

  // Toggle parent → auto-select children with dependency tracking
  const togglePerm = id => {
    const perm = allPermissions.find(p => p._id === id || p.slug === id)
    if (!perm) return

    const permSlug = perm.slug || perm.name
    const isSelected = form.selectedPermissions.includes(id)

    if (isSelected) {
      setForm(prev => ({
        ...prev,
        selectedPermissions: prev.selectedPermissions.filter(x => x !== id)
      }))
    } else {
      const deps = getAllDependencies(permSlug)
      const depIds = deps.map(d => {
        const depPerm = findPermBySlug(d)
        return depPerm?._id
      }).filter(Boolean)

      setForm(prev => {
        const newSelected = [...new Set([...prev.selectedPermissions, id, ...depIds])]
        return { ...prev, selectedPermissions: newSelected }
      })
    }
  }

  const handleSave = async () => {
    if (!role) return
    setSaving(true)
    try {
      await axiosRequest.put(`/api/v1/roles/${role._id}`, {
        permissions: form.selectedPermissions
      })
      toast.success('Role permissions updated')
      onSaved(); onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update role')
    } finally { setSaving(false) }
  }

  // Early return AFTER all hooks
  if (!role) return null

  // Filter permissions based on role's level
  const LEVEL_HIERARCHY = {
    org: ['org', 'company', 'unit'],
    company: ['company', 'unit'],
    unit: ['unit']
  }

  const filteredPermissions = (allPermissions || []).filter(p => {
    if (!p.scope || p.scope.length === 0) return true
    const allowedScopes = LEVEL_HIERARCHY[form.level] || [form.level]
    return p.scope.some(s => allowedScopes.includes(s))
  })

  // Group permissions by MODULE — one row per module
  const permGroups = {}
  const searchTerm = permSearch.toLowerCase()

  ;(filteredPermissions || []).forEach(p => {
    const permModule = p.module || 'general'
    if (!permGroups[permModule]) {
      permGroups[permModule] = []
    }
    if (!searchTerm ||
        permModule.toLowerCase().includes(searchTerm) ||
        (p.label || '').toLowerCase().includes(searchTerm) ||
        (p.name || '').toLowerCase().includes(searchTerm) ||
        (p.slug || '').toLowerCase().includes(searchTerm)) {
      permGroups[permModule].push(p)
    }
  })

  // Sort modules alphabetically
  const sortedModules = Object.keys(permGroups).sort()

  // Columns are derived from actual data
  const usedActions = ACTION_ORDER.filter(action =>
    sortedModules.some(moduleName => permGroups[moduleName].some(p => getAction(p) === action))
  )

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='h6'>Edit Permissions — {role.name}</Typography>
        <IconButton size='small' onClick={onClose}><Icon icon='tabler:x' /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <CustomTextField
              size='small'
              fullWidth
              label='Role Name'
              value={form.name}
              disabled
            />
          </Grid>
          <Grid item xs={4}>
            <CustomTextField
              size='small'
              fullWidth
              label='Level'
              value={form.level}
              disabled
            />
          </Grid>
          <Grid item xs={4}>
            <CustomTextField
              size='small'
              fullWidth
              label='Description'
              value={form.description}
              disabled
            />
          </Grid>
        </Grid>

        <Typography variant='overline' color='text.secondary' display='block' mb={1}>
          Module Permissions
        </Typography>

        <TextField
          size="small"
          placeholder="Search permissions..."
          value={permSearch}
          onChange={(e) => setPermSearch(e.target.value)}
          sx={{ mb: 2, width: '300px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon='tabler:search' fontSize={18} />
              </InputAdornment>
            )
          }}
        />

        {sortedModules.length === 0 ? (
          <Typography variant='caption' color='text.disabled'>No assignable permissions for this level</Typography>
        ) : (
          <Box sx={{ maxHeight: 500, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: 200 }}>Module</TableCell>
                    {usedActions.map(action => (
                      <TableCell key={action} align="center" sx={{ fontWeight: 600, width: 70 }}>
                        {ACTION_LABELS[action] || action}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedModules.map(moduleName => {
                    const perms = permGroups[moduleName]

                    const actionMap = {}
                    perms.forEach(p => {
                      actionMap[getAction(p)] = p
                    })

                    return (
                      <TableRow key={moduleName} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Icon icon={MODULE_ICONS[moduleName] || MODULE_ICONS[moduleName.toLowerCase()] || 'tabler:folder'} fontSize={16} />
                            <Typography variant="body2" fontWeight={600}>
                              {moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}
                            </Typography>
                          </Box>
                        </TableCell>

                        {usedActions.map(action => {
                          const perm = actionMap[action]

                          if (!perm) {
                            return (
                              <TableCell key={action} align="center">
                                <Typography variant="caption" color="text.disabled">—</Typography>
                              </TableCell>
                            )
                          }

                          const permId = perm._id || perm.id
                          const isSelected = form.selectedPermissions.includes(permId)

                          return (
                            <TableCell key={action} align="center" sx={{ py: 0.5 }}>
                              <Tooltip
                                title={
                                  <Box>
                                    <Typography variant="caption" fontWeight={600}>{perm.label || perm.name || perm.slug}</Typography>
                                    <br />
                                    <Typography variant="caption" color="text.secondary">{perm.slug}</Typography>
                                  </Box>
                                }
                                arrow
                              >
                                <Checkbox
                                  size="small"
                                  checked={isSelected}
                                  onChange={() => togglePerm(permId)}
                                  color={ACTION_COLORS[action] || 'primary'}
                                />
                              </Tooltip>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant='contained' onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={16} /> : 'Save Changes'}
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
  const [permSearch, setPermSearch] = useState('')
  const levelLocked = Boolean(defaultLevel)

  useEffect(() => {
    if (editRole) {
      const permIds = (editRole.permissions || []).map(p => p._id || p)
      setForm({ name: editRole.name || '', level: editRole.level || defaultLevel || 'unit', description: editRole.description || '',
                selectedPermissions: permIds })
    } else {
      setForm({ name: '', level: defaultLevel || 'unit', description: '', selectedPermissions: [] })
    }
  }, [editRole, open, defaultLevel])

  const LEVEL_HIERARCHY = {
    org: ['org', 'company', 'unit'],
    company: ['company', 'unit'],
    unit: ['unit']
  }

  const filteredPermissions = (permissions || []).filter(p => {
    if (!p.scope || p.scope.length === 0) return true
    const allowedScopes = LEVEL_HIERARCHY[form.level] || [form.level]
    return p.scope.some(s => allowedScopes.includes(s))
  })

  const findPermBySlug = slug =>
    permissions.find(p => p.slug === slug || p._id === slug || p.name === slug)

  const getAllDependencies = permSlug => {
    const deps = PERMISSION_DEPENDENCIES[permSlug] || []
    const allDeps = [...deps]
    deps.forEach(d => {
      const childDeps = getAllDependencies(d)
      childDeps.forEach(cd => {
        if (!allDeps.includes(cd)) allDeps.push(cd)
      })
    })
    return allDeps
  }

  const togglePerm = id => {
    const perm = permissions.find(p => p._id === id || p.slug === id)
    if (!perm) return

    const permSlug = perm.slug || perm.name
    const isSelected = form.selectedPermissions.includes(id)

    if (isSelected) {
      setForm(prev => ({
        ...prev,
        selectedPermissions: prev.selectedPermissions.filter(x => x !== id)
      }))
    } else {
      const deps = getAllDependencies(permSlug)
      const depIds = deps.map(d => {
        const depPerm = findPermBySlug(d)
        return depPerm?._id
      }).filter(Boolean)

      setForm(prev => {
        const newSelected = [...new Set([...prev.selectedPermissions, id, ...depIds])]
        return { ...prev, selectedPermissions: newSelected }
      })
    }
  }

  const handleLevelChange = newLevel => {
    setForm(prev => ({ ...prev, level: newLevel, selectedPermissions: [] }))
  }

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

  const permGroups = {}
  const searchTerm = permSearch.toLowerCase()

  ;(filteredPermissions || []).forEach(p => {
    const permModule = p.module || 'general'
    if (!permGroups[permModule]) {
      permGroups[permModule] = []
    }
    if (!searchTerm ||
        permModule.toLowerCase().includes(searchTerm) ||
        (p.label || '').toLowerCase().includes(searchTerm) ||
        (p.name || '').toLowerCase().includes(searchTerm) ||
        (p.slug || '').toLowerCase().includes(searchTerm)) {
      permGroups[permModule].push(p)
    }
  })

  const sortedModules = Object.keys(permGroups).sort()

  const usedActions = ACTION_ORDER.filter(action =>
    sortedModules.some(moduleName => permGroups[moduleName].some(p => getAction(p) === action))
  )

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth component='form' onSubmit={handleSubmit}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='h6'>{isEdit ? 'Edit Role' : 'Create Custom Role'}</Typography>
        <IconButton size='small' onClick={onClose} type='button'><Icon icon='tabler:x' /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <CustomTextField
              size='small'
              fullWidth
              label='Role Name'
              placeholder='e.g. Finance Manager'
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </Grid>
          <Grid item xs={4}>
            {levelLocked ? (
              <CustomTextField
                size='small'
                fullWidth
                label='Level'
                value={form.level}
                disabled
              />
            ) : (
              <CustomTextField
                size='small'
                fullWidth
                select
                label='Level'
                value={form.level}
                onChange={e => handleLevelChange(e.target.value)}
              >
                <MenuItem value='unit'>Unit</MenuItem>
                <MenuItem value='company'>Company</MenuItem>
                <MenuItem value='org'>Organisation</MenuItem>
              </CustomTextField>
            )}
          </Grid>
          <Grid item xs={4}>
            <CustomTextField
              size='small'
              fullWidth
              label='Description'
              placeholder='Brief description'
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </Grid>
        </Grid>
        <Typography variant='overline' color='text.secondary' display='block' mb={1}>
          Assign Permissions
        </Typography>

        <TextField
          size="small"
          placeholder="Search permissions..."
          value={permSearch}
          onChange={(e) => setPermSearch(e.target.value)}
          sx={{ mb: 2, width: '300px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon='tabler:search' fontSize={18} />
              </InputAdornment>
            )
          }}
        />

        {sortedModules.length === 0 ? (
          <Typography variant='caption' color='text.disabled'>No assignable permissions for this level</Typography>
        ) : (
          <Box sx={{ maxHeight: 500, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: 200 }}>Module</TableCell>
                    {usedActions.map(action => (
                      <TableCell key={action} align="center" sx={{ fontWeight: 600, width: 70 }}>
                        {ACTION_LABELS[action] || action}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedModules.map(moduleName => {
                    const perms = permGroups[moduleName]

                    const actionMap = {}
                    perms.forEach(p => {
                      actionMap[getAction(p)] = p
                    })

                    return (
                      <TableRow key={moduleName} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Icon icon={MODULE_ICONS[moduleName] || MODULE_ICONS[moduleName.toLowerCase()] || 'tabler:folder'} fontSize={16} />
                            <Typography variant="body2" fontWeight={600}>
                              {moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}
                            </Typography>
                          </Box>
                        </TableCell>

                        {usedActions.map(action => {
                          const perm = actionMap[action]

                          if (!perm) {
                            return (
                              <TableCell key={action} align="center">
                                <Typography variant="caption" color="text.disabled">—</Typography>
                              </TableCell>
                            )
                          }

                          const permId = perm._id || perm.id
                          const isSelected = form.selectedPermissions.includes(permId)

                          return (
                            <TableCell key={action} align="center" sx={{ py: 0.5 }}>
                              <Tooltip
                                title={
                                  <Box>
                                    <Typography variant="caption" fontWeight={600}>{perm.label || perm.name || perm.slug}</Typography>
                                    <br />
                                    <Typography variant="caption" color="text.secondary">{perm.slug}</Typography>
                                  </Box>
                                }
                                arrow
                              >
                                <Checkbox
                                  size="small"
                                  checked={isSelected}
                                  onChange={() => togglePerm(permId)}
                                  color={ACTION_COLORS[action] || 'primary'}
                                />
                              </Tooltip>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
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

  const roleSlug         = useSelector(selectRoleSlug)
  const userPermissions  = useSelector(selectPermissions)
  const userLevel        = useSelector(selectLevel)
  const selectedCompanyId = useSelector(selectSelectedCompanyId)
  const selectedUnitId    = useSelector(selectSelectedUnitId)

  // Permission checks
  const canView = CAN_VIEW_ACCESS_CONTROL.some(p => userPermissions.includes(p))
  const canCreate = userPermissions.includes(CAN_CREATE_ROLE)
  const canUpdate = userPermissions.includes(CAN_UPDATE_ROLE)
  const canDelete = userPermissions.includes(CAN_DELETE_ROLE)

  const contextLevel = selectedUnitId
    ? 'unit'
    : selectedCompanyId
      ? 'company'
      : (roleSlug === 'unit_admin' || roleSlug === 'hr_manager')
        ? 'unit'
        : (roleSlug === 'company_admin' || roleSlug === 'company_hr_manager')
          ? 'company'
          : null

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
        const cats = [...new Set(permsData.map(p => p.category || (p.module ? p.module.charAt(0).toUpperCase() + p.module.slice(1) : null)).filter(Boolean))]
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
  permissions.forEach(p => {
    const c = p.category || (p.module ? p.module.charAt(0).toUpperCase() + p.module.slice(1) : 'General')
    if (!permsByCategory[c]) permsByCategory[c] = []
    permsByCategory[c].push(p)
  })
  const privCategories = Object.keys(permsByCategory).sort()

  // Access denied if user doesn't have role.read permission
  if (!canView) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card sx={{ p: 8, textAlign: 'center' }}>
            <Icon icon='tabler:lock' fontSize={64} color='error' />
            <Typography variant='h5' sx={{ mt: 4 }}>Access Denied</Typography>
            <Typography color='text.secondary' sx={{ mt: 2 }}>You don't have permission to view Access Control</Typography>
            <Typography variant='caption' color='text.disabled' sx={{ mt: 1, display: 'block' }}>Required: role.read permission</Typography>
          </Card>
        </Grid>
      </Grid>
    )
  }

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
              {canCreate && <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={() => { setEditRole(null); setFormOpen(true) }}>Create Role</Button>}
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
                            {canUpdate && <Tooltip title='Edit Permissions'>
                              <IconButton size='small' onClick={() => { setMatrixRole(role); setMatrixOpen(true) }}>
                                <Icon icon='tabler:layout-grid' fontSize={16} />
                              </IconButton>
                            </Tooltip>}
                            {!isSystem && canUpdate && (
                              <Tooltip title='Edit Role'>
                                <IconButton size='small' onClick={() => { setEditRole(role); setFormOpen(true) }}>
                                  <Icon icon='tabler:pencil' fontSize={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {!isSystem && canDelete && (
                              <Tooltip title={holders > 0 ? `Cannot delete — ${holders} users` : 'Delete Role'}>
                                <span>
                                  <IconButton size='small' color='error' disabled={holders > 0} onClick={() => handleDelete(role)}>
                                    <Icon icon='tabler:trash' fontSize={16} />
                                  </IconButton>
                                </span>
                              </Tooltip>
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
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>All available system permissions from the API, grouped by module</Typography>
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
        onClose={() => setMatrixOpen(false)} onSaved={loadData} allPermissions={permissions} />
    </Grid>
  )
}

export default AccessControlPage
