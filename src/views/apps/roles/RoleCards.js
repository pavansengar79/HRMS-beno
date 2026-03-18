// ** React Imports
import { useEffect, useState, useCallback, useMemo } from 'react'

// ** Next Import
import Link from 'next/link'

// ** Redux
import { useSelector } from 'react-redux'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Dialog from '@mui/material/Dialog'
import Tooltip from '@mui/material/Tooltip'
import Checkbox from '@mui/material/Checkbox'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import DialogTitle from '@mui/material/DialogTitle'
import AvatarGroup from '@mui/material/AvatarGroup'
import CardContent from '@mui/material/CardContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import TableContainer from '@mui/material/TableContainer'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import toast from 'react-hot-toast'

// ✅ Interceptor
import axiosRequest from 'src/utils/AxiosInterceptor'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const groupByModule = permissions => {
  const map = {}
  permissions.forEach(p => {
    if (!map[p.module]) map[p.module] = []
    map[p.module].push(p)
  })
  return map
}

const cap = str => str.charAt(0).toUpperCase() + str.slice(1)

// ---------------------------------------------------------------------------
// Confirm Delete Dialog
// ---------------------------------------------------------------------------
const ConfirmDialog = ({ open, roleName, onConfirm, onCancel, deleting }) => (
  <Dialog open={open} onClose={onCancel} maxWidth='xs' fullWidth>
    <DialogTitle
      component='div'
      sx={{
        textAlign: 'center',
        pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
      }}
    >
      <Typography variant='h3'>Delete Role</Typography>
      <Typography color='text.secondary'>Are you sure you want to delete <strong>{roleName}</strong>?</Typography>
    </DialogTitle>
    <DialogActions
      sx={{
        display: 'flex',
        justifyContent: 'center',
        pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
      }}
    >
      <Box className='demo-space-x'>
        <Button
          variant='contained' color='error' disabled={deleting}
          startIcon={deleting ? <CircularProgress size={16} color='inherit' /> : null}
          onClick={onConfirm}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
        <Button color='secondary' variant='tonal' onClick={onCancel} disabled={deleting}>
          Cancel
        </Button>
      </Box>
    </DialogActions>
  </Dialog>
)

// ---------------------------------------------------------------------------
// RolesCards
// ---------------------------------------------------------------------------
const RolesCards = () => {
  const userRole = useSelector(
    state => state.auth?.user?.role?.slug ?? state.auth?.userData?.role?.slug ?? ''
  )
  const isTenantAdmin = userRole === 'tenant_admin'

  // ── Data state ────────────────────────────────────────────────────────────
  const [roles, setRoles]               = useState([])
  const [permissions, setPermissions]   = useState([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [loadingPerms, setLoadingPerms] = useState(true)

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [open, setOpen]                           = useState(false)
  const [dialogTitle, setDialogTitle]             = useState('Add')
  const [dialogMode, setDialogMode]               = useState('add')
  const [editingRole, setEditingRole]             = useState(null)
  const [roleName, setRoleName]                   = useState('')
  const [roleNameError, setRoleNameError]         = useState('')
  const [selectedCheckbox, setSelectedCheckbox]   = useState([])
  const [isIndeterminateCheckbox, setIsIndeterminateCheckbox] = useState(false)
  const [submitting, setSubmitting]               = useState(false)

  // ── Delete confirm state ───────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  // ── Derived ───────────────────────────────────────────────────────────────
  const groupedPerms = useMemo(() => groupByModule(permissions), [permissions])

  const modules = useMemo(() =>
    Object.keys(groupedPerms)
      .filter(module => isTenantAdmin ? true : module.toLowerCase() !== 'company')
      .sort(),
    [groupedPerms, isTenantAdmin]
  )

  // ── FIX 1: visiblePerms — only permissions whose module is shown in the table
  const visiblePerms = useMemo(
    () => modules.flatMap(mod => groupedPerms[mod] || []),
    [modules, groupedPerms]
  )

  // ── FIX 1 (cont): totalPerms based on visible only, not full permissions array
  const totalPerms = visiblePerms.length

  const isViewOnly = dialogMode === 'view'

  // ── Indeterminate — keyed to visiblePerms count ───────────────────────────
  useEffect(() => {
    const visibleSelected = selectedCheckbox.filter(id =>
      visiblePerms.some(p => p._id === id)
    ).length

    if (visibleSelected > 0 && visibleSelected < totalPerms) {
      setIsIndeterminateCheckbox(true)
    } else {
      setIsIndeterminateCheckbox(false)
    }
  }, [selectedCheckbox, visiblePerms, totalPerms])

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    try {
      setLoadingRoles(true)
      const res = await axiosRequest.get('/api/v1/roles/')
      if (res?.success && Array.isArray(res.data)) setRoles(res.data)
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to load roles')
    } finally {
      setLoadingRoles(false)
    }
  }, [])

  const fetchPermissions = useCallback(async () => {
    try {
      setLoadingPerms(true)
      const res = await axiosRequest.get('/api/v1/permissions/')
      if (res?.success && Array.isArray(res.data)) setPermissions(res.data)
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to load permissions')
    } finally {
      setLoadingPerms(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [fetchRoles, fetchPermissions])

  // ── Dialog open helpers ───────────────────────────────────────────────────
  const handleClickOpen = () => setOpen(true)

  const handleClose = () => {
    if (submitting) return
    setOpen(false)
    setSelectedCheckbox([])
    setIsIndeterminateCheckbox(false)
    setRoleName('')
    setRoleNameError('')
    setEditingRole(null)
    setDialogMode('add')
  }

  const openAdd = () => {
    setDialogMode('add')
    setDialogTitle('Add')
    setEditingRole(null)
    setRoleName('')
    setRoleNameError('')
    setSelectedCheckbox([])
    handleClickOpen()
  }

  const openEdit = role => {
    setDialogMode('edit')
    setDialogTitle('Edit')
    setEditingRole(role)
    setRoleName(role.name)
    setRoleNameError('')
    const existingIds = role.permissions.map(p => (typeof p === 'object' ? p._id : p))
    setSelectedCheckbox(existingIds)
    handleClickOpen()
  }

  const openView = role => {
    setDialogMode('view')
    setDialogTitle('View')
    setEditingRole(role)
    setRoleName(role.name)
    setRoleNameError('')
    const existingIds = role.permissions.map(p => (typeof p === 'object' ? p._id : p))
    setSelectedCheckbox(existingIds)
    handleClickOpen()
  }

  // ── Permission toggle ─────────────────────────────────────────────────────
  const togglePermission = id => {
    if (isViewOnly) return
    const arr = [...selectedCheckbox]
    if (arr.includes(id)) {
      arr.splice(arr.indexOf(id), 1)
      setSelectedCheckbox(arr)
    } else {
      setSelectedCheckbox([...arr, id])
    }
  }

  // ── FIX 2: Select All uses visiblePerms only ──────────────────────────────
const handleSelectAllCheckbox = () => {
  if (isViewOnly) return
  const allSelected = visiblePerms.every(p => selectedCheckbox.includes(p._id))
  if (allSelected) {
    setSelectedCheckbox([])                          // all selected → deselect all
  } else {
    setSelectedCheckbox(visiblePerms.map(p => p._id)) // some or none → select all
  }
}
  

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    if (!roleName.trim()) { setRoleNameError('Role name is required'); return false }
    if (roleName.trim().length < 2) { setRoleNameError('Role name must be at least 2 characters'); return false }
    setRoleNameError('')
    return true
  }

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validate()) return
    try {
      setSubmitting(true)
      const res = await axiosRequest.post('/api/v1/roles/create/roles', {
        name:        roleName.trim(),
        slug:        roleName.trim().toLowerCase().replace(/\s+/g, '_'),
        description: `${roleName.trim()} role`,
        permissions: selectedCheckbox
      })
      if (res?.success) {
        toast.success(`Role "${roleName.trim()}" created successfully`)
        handleClose()
        fetchRoles()
      } else {
        toast.error(res?.message || 'Failed to create role')
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Update ────────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!validate()) return
    try {
      setSubmitting(true)
      const res = await axiosRequest.put(`/api/v1/roles/${editingRole._id}`, {
        name:        roleName.trim(),
        slug:        editingRole.slug,
        description: editingRole.description,
        permissions: selectedCheckbox
      })
      if (res?.success) {
        toast.success(`Role "${roleName.trim()}" updated successfully`)
        handleClose()
        fetchRoles()
      } else {
        toast.error(res?.message || 'Failed to update role')
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      const res = await axiosRequest.delete(`/api/v1/roles/${deleteTarget._id}`)
      if (res?.success) {
        toast.success(`Role "${deleteTarget.name}" deleted`)
        setDeleteTarget(null)
        fetchRoles()
      } else {
        toast.error(res?.message || 'Failed to delete role')
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Something went wrong')
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmit = () => {
    if (dialogMode === 'add')  handleCreate()
    if (dialogMode === 'edit') handleUpdate()
  }

  const canEdit   = role => isTenantAdmin && !role.isSystem
  const canDelete = role => isTenantAdmin && !role.isSystem

  // ── Render cards ──────────────────────────────────────────────────────────
  const renderCards = () => {
    if (loadingRoles) {
      return (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        </Grid>
      )
    }

    return roles.map(role => (
      <Grid item xs={12} sm={6} lg={4} key={role._id}>
        <Card>
          <CardContent>
            <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: 'text.secondary' }}>
                {`Total ${role.permissions?.length ?? 0} permissions`}  {isTenantAdmin.toString()}
              </Typography>
              <AvatarGroup
                max={4}
                className='pull-up'
                sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: theme => theme.typography.body2.fontSize } }}
              >
                {Array.from({ length: Math.min(role.permissions?.length ?? 0, 4) }).map((_, i) => (
                  <Avatar key={i} alt={role.name} src={`/images/avatars/${i + 1}.png`} />
                ))}
              </AvatarGroup>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                <Typography variant='h4' sx={{ mb: 1 }}>
                  {role.name}
                  {role.isSystem && (
                    <Chip
                      label='System' size='small' color='primary' variant='tonal'
                      sx={{ ml: 2, height: 20, fontSize: '0.7rem', verticalAlign: 'middle' }}
                    />
                  )}
                </Typography>
                <Typography
                  href='/'
                  component={Link}
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                  onClick={e => {
                    e.preventDefault()
                    if (role.isSystem) { openView(role) }
                    else if (canEdit(role)) { openEdit(role) }
                  }}
                >
                  {role.isSystem ? 'View Role' : 'Edit Role'}
                </Typography>
              </Box>

              {canDelete(role) ? (
                <Tooltip title='Delete role' placement='top'>
                  <IconButton size='small' sx={{ color: 'text.disabled' }} onClick={() => setDeleteTarget(role)}>
                    <Icon icon='tabler:trash' />
                  </IconButton>
                </Tooltip>
              ) : (
                <IconButton size='small' sx={{ color: 'text.disabled' }}>
                  <Icon icon='tabler:copy' />
                </IconButton>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))
  }

  return (
    <>
      <Grid container spacing={6} className='match-height'>
        {renderCards()}

        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ cursor: 'pointer' }} onClick={openAdd}>
            <Grid container sx={{ height: '100%' }}>
              <Grid item xs={5}>
                <Box sx={{ height: '100%', minHeight: 140, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <img height={122} alt='add-role' src='/images/pages/add-new-role-illustration.png' />
                </Box>
              </Grid>
              <Grid item xs={7}>
                <CardContent sx={{ pl: 0, height: '100%' }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Button variant='contained' sx={{ mb: 3, whiteSpace: 'nowrap' }} onClick={openAdd}>
                      Add New Role
                    </Button>
                    <Typography sx={{ color: 'text.secondary' }}>Add role, if it doesn't exist.</Typography>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Dialog fullWidth maxWidth='md' scroll='body' onClose={handleClose} open={open}>
        <DialogTitle
          component='div'
          sx={{
            textAlign: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Typography variant='h3'>{`${dialogTitle} Role`}</Typography>
          <Typography color='text.secondary'>
            {isViewOnly ? 'System role permissions (read-only)' : 'Set Role Permissions'}
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(5)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
          }}
        >
          <Box sx={{ my: 4 }}>
            <FormControl fullWidth>
              <CustomTextField
                fullWidth
                label='Role Name'
                placeholder='Enter Role Name'
                value={roleName}
                onChange={e => {
                  if (isViewOnly) return
                  setRoleName(e.target.value)
                  if (e.target.value.trim()) setRoleNameError('')
                }}
                error={Boolean(roleNameError)}
                helperText={roleNameError}
                disabled={submitting || isViewOnly}
                InputProps={{ readOnly: isViewOnly }}
              />
            </FormControl>
          </Box>

          <Typography variant='h4'>Role Permissions</Typography>

          {loadingPerms ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pl: '0 !important' }}>
                      <Box
                        sx={{
                          display: 'flex', whiteSpace: 'nowrap', alignItems: 'center',
                          textTransform: 'capitalize', '& svg': { ml: 1, cursor: 'pointer' },
                          color: theme => theme.palette.text.secondary,
                          fontSize: theme => theme.typography.h6.fontSize
                        }}
                      >
                        Administrator Access
                        <Tooltip placement='top' title='Allows a full access to the system'>
                          <Box sx={{ display: 'flex' }}>
                            <Icon icon='tabler:info-circle' fontSize='1.25rem' />
                          </Box>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell colSpan={3}>
                      <FormControlLabel
                        label='Select All'
                        sx={{ '& .MuiTypography-root': { textTransform: 'capitalize', color: 'text.secondary' } }}
                        control={
                          <Checkbox
                            size='small'
                            onChange={handleSelectAllCheckbox}
                            indeterminate={isIndeterminateCheckbox}
                            // ── FIX 3: checked based on visiblePerms.every(), not count ──
                            checked={
                              totalPerms > 0 &&
                              visiblePerms.every(p => selectedCheckbox.includes(p._id))
                            }
                            disabled={submitting || isViewOnly}
                          />
                        }
                      />
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {modules.map(module => {
                    const modulePerms = groupedPerms[module]
                    return (
                      <TableRow key={module} sx={{ '& .MuiTableCell-root:first-of-type': { pl: '0 !important' } }}>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', fontSize: theme => theme.typography.h6.fontSize }}>
                          {cap(module)}
                        </TableCell>
                        {modulePerms.map(perm => {
                          const action = perm.name.split('.')[1] ?? perm.name
                          return (
                            <TableCell key={perm._id}>
                              <FormControlLabel
                                label={cap(action)}
                                sx={{ '& .MuiTypography-root': { color: 'text.secondary' } }}
                                control={
                                  <Checkbox
                                    size='small'
                                    id={perm._id}
                                    checked={selectedCheckbox.includes(perm._id)}
                                    onChange={() => togglePermission(perm._id)}
                                    disabled={submitting || isViewOnly}
                                  />
                                }
                              />
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            display: 'flex', justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Box className='demo-space-x'>
            {!isViewOnly && (
              <Button
                type='submit' variant='contained' disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} color='inherit' /> : null}
                onClick={handleSubmit}
              >
                {submitting ? (dialogMode === 'add' ? 'Creating…' : 'Saving…') : 'Submit'}
              </Button>
            )}
            <Button color='secondary' variant='tonal' onClick={handleClose} disabled={submitting}>
              {isViewOnly ? 'Close' : 'Cancel'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        roleName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
        deleting={deleting}
      />
    </>
  )
}

export default RolesCards