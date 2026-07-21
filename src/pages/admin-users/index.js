// src/pages/admin-users/index.js
// Administrative Users page — org / company / unit admins
// Shows users from GET /api/v1/users (admin-scoped by JWT on backend)
// Actions: Invite (POST /users/invite), Edit (PUT /users/:id), Delete (DELETE /users/:id)

import { useState, useEffect, useCallback } from 'react'

// ** MUI
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Menu from '@mui/material/Menu'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import { DataGrid } from '@mui/x-data-grid'

// ** Icons + Custom
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import { getInitials } from 'src/@core/utils/get-initials'

// ** Redux
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAdminUsers,
  deleteAdminUser,
  selectAdminUserList,
  selectAdminUserLoading,
} from 'src/store/adminUsers/adminUsersSlice'
import { selectPermissions, selectRoleSlug } from 'src/store/auth/authSlice'

// ** Drawers
import AdminInviteDrawer from 'src/views/apps/adminUsers/AdminInviteDrawer'
import AdminEditDrawer   from 'src/views/apps/adminUsers/AdminEditDrawer'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  ACTIVE:   'success',
  INACTIVE: 'secondary',
  BLOCKED:  'error',
}

const ROLES_THAT_CAN_MANAGE = ['org_admin', 'company_admin', 'unit_admin', 'hr_manager', 'company_hr_manager']

// ─────────────────────────────────────────────────────────────────────────────
// Row options menu
// ─────────────────────────────────────────────────────────────────────────────
const RowOptions = ({ user, canEdit, canDelete, onEdit, onDelete }) => {
  const [anchor, setAnchor] = useState(null)
  const open = Boolean(anchor)

  return (
    <>
      <IconButton size='small' onClick={e => setAnchor(e.currentTarget)}>
        <Icon icon='tabler:dots-vertical' fontSize={18} />
      </IconButton>
      <Menu open={open} anchorEl={anchor} onClose={() => setAnchor(null)}>
        {canEdit && (
          <MenuItem onClick={() => { setAnchor(null); onEdit(user) }}>
            <Icon icon='tabler:pencil' fontSize={18} style={{ marginRight: 8 }} />
            Edit
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem onClick={() => { setAnchor(null); onDelete(user) }} sx={{ color: 'error.main' }}>
            <Icon icon='tabler:trash' fontSize={18} style={{ marginRight: 8 }} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm Delete Dialog
// ─────────────────────────────────────────────────────────────────────────────
const DeleteDialog = ({ open, userName, onConfirm, onCancel, deleting }) => (
  <Dialog open={open} onClose={onCancel} maxWidth='xs' fullWidth>
    <DialogTitle component='div' sx={{ textAlign: 'center', pt: 8 }}>
      <Typography variant='h5'>Delete User</Typography>
      <Typography color='text.secondary' sx={{ mt: 1 }}>
        Are you sure you want to delete <strong>{userName}</strong>? This action cannot be undone.
      </Typography>
    </DialogTitle>
    <DialogActions sx={{ justifyContent: 'center', pb: 8, gap: 2 }}>
      <Button variant='contained' color='error' disabled={deleting}
        startIcon={deleting ? <CircularProgress size={16} color='inherit' /> : null}
        onClick={onConfirm}
      >
        {deleting ? 'Deleting…' : 'Delete'}
      </Button>
      <Button variant='tonal' color='secondary' onClick={onCancel} disabled={deleting}>Cancel</Button>
    </DialogActions>
  </Dialog>
)

// ─────────────────────────────────────────────────────────────────────────────
// AdminUserList
// ─────────────────────────────────────────────────────────────────────────────
const AdminUserList = () => {
  const dispatch    = useDispatch()
  const users       = useSelector(selectAdminUserList)
  const loading     = useSelector(selectAdminUserLoading)
  const permissions = useSelector(selectPermissions)
  const userRole    = useSelector(selectRoleSlug) ?? ''

  const canCreate = permissions.includes('admin_user.create') || ROLES_THAT_CAN_MANAGE.includes(userRole)
  const canEdit   = permissions.includes('admin_user.update') || ROLES_THAT_CAN_MANAGE.includes(userRole)
  const canDelete = permissions.includes('admin_user.delete') || ROLES_THAT_CAN_MANAGE.includes(userRole)

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search,          setSearch]          = useState('')
  const [statusFilter,    setStatusFilter]    = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  // ── Drawer state ──────────────────────────────────────────────────────────
  const [inviteOpen,    setInviteOpen]    = useState(false)
  const [editTarget,    setEditTarget]    = useState(null)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleting,      setDeleting]      = useState(false)

  // ── Local users list (for optimistic updates after edit) ─────────────────
  const [localUsers, setLocalUsers] = useState([])

  const load = useCallback(() => {
    dispatch(fetchAdminUsers({
      page:   paginationModel.page + 1,
      limit:  paginationModel.pageSize,
      search,
      status: statusFilter,
    }))
  }, [dispatch, paginationModel, search, statusFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setLocalUsers(users) }, [users])

  // ── SECURITY: Role Level Hierarchy ──
  const LEVEL_FOR_SLUG = {
    org_admin: 'org',
    company_admin: 'company',
    company_hr_manager: 'company',
    unit_admin: 'unit',
    hr_manager: 'unit',
  };
  
  const userLevel = LEVEL_FOR_SLUG[userRole] ?? 'unit';
  const hierarchy = { org: 1, company: 2, unit: 3 };
  const currentUserLevelOrder = hierarchy[userLevel] || 3;

  // Determine visible levels based on current user
  const getVisibleLevels = (level) => {
    if (level === 'org') {
      return ['org', 'company']; // org_admin sees org + company
    }
    return [level]; // others see only their level
  };
  
  const visibleLevels = getVisibleLevels(userLevel);

  // ── Filtered rows - role level filtering ──
  const filteredRows = localUsers.filter(u => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || u.status === statusFilter
    
    // SECURITY: Role level filter - based on hierarchy rules
    const userRoleLevel = u.roleId?.level || u.role?.level || 'unit';
    const matchLevel = visibleLevels.includes(userRoleLevel);
    
    return matchSearch && matchStatus && matchLevel
  })

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await dispatch(deleteAdminUser(deleteTarget._id)).unwrap()
      setDeleteTarget(null)
    } catch {
      // toast handled inside thunk
    } finally {
      setDeleting(false)
    }
  }

  const handleEditSuccess = updatedData => {
    if (updatedData) {
      setLocalUsers(prev => prev.map(u => u._id === updatedData._id ? { ...u, ...updatedData } : u))
    } else {
      load()
    }
  }

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = [
    {
      flex: 0.25, minWidth: 220, field: 'name', headerName: 'User',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CustomAvatar skin='light' color='primary' sx={{ width: 36, height: 36, fontSize: '0.875rem' }}>
            {getInitials(row.name || row.email || 'U')}
          </CustomAvatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              {row.name || '—'}
            </Typography>
            <Typography noWrap variant='caption' sx={{ color: 'text.disabled' }}>
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      flex: 0.2, minWidth: 160, field: 'role', headerName: 'Role',
      renderCell: ({ row }) => (
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {row.roleId?.name || row.role?.name || '—'}
        </Typography>
      ),
    },
    {
      flex: 0.15, minWidth: 120, field: 'level', headerName: 'Level',
      renderCell: ({ row }) => {
        const level = row.roleId?.level || row.role?.level
        return level ? (
          <Chip label={level} size='small' variant='tonal'
            color={level === 'org' ? 'primary' : level === 'company' ? 'info' : 'warning'}
            sx={{ textTransform: 'capitalize', fontWeight: 500 }}
          />
        ) : <Typography variant='body2' sx={{ color: 'text.disabled' }}>—</Typography>
      },
    },
    {
      flex: 0.15, minWidth: 110, field: 'status', headerName: 'Status',
      renderCell: ({ row }) => (
        <CustomChip
          rounded skin='light' size='small'
          label={row.status || 'ACTIVE'}
          color={STATUS_COLOR[row.status] || 'secondary'}
        />
      ),
    },
    {
      flex: 0.15, minWidth: 120, field: 'createdAt', headerName: 'Joined',
      renderCell: ({ row }) => (
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
        </Typography>
      ),
    },
    {
      flex: 0.1, minWidth: 80, field: 'actions', headerName: 'Actions', sortable: false,
      renderCell: ({ row }) => {
        const rowLevel = row.roleId?.level || row.role?.level || 'unit';
        const canEditThisRow = canEdit && visibleLevels.includes(rowLevel);
        const canDeleteThisRow = canDelete && visibleLevels.includes(rowLevel) && row.roleId?.isSystem !== true;
        
        return (
          <RowOptions
            user={row}
            canEdit={canEditThisRow}
            canDelete={canDeleteThisRow}
            onEdit={u => setEditTarget(u)}
            onDelete={u => setDeleteTarget(u)}
          />
        );
      },
    },
  ]

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          {/* ── Card header ─────────────────────────────────────────────── */}
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Icon icon='tabler:shield-lock' fontSize={22} />
                Administrative Users
              </Box>
            }
            subheader='Manage admin accounts across org, company, and unit levels'
          />

          <Divider />

          {/* ── Toolbar ─────────────────────────────────────────────────── */}
          <Box sx={{
            px: 5, py: 3, display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 2,
          }}>
            {/* Left: search + status filter */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <CustomTextField
                size='small' placeholder='Search name or email…'
                value={search} onChange={e => setSearch(e.target.value)}
                sx={{ width: 240 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='tabler:search' fontSize={18} />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position='end'>
                      <IconButton size='small' onClick={() => setSearch('')}>
                        <Icon icon='tabler:x' fontSize={14} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
              <CustomTextField
                select size='small'
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                sx={{ width: 160 }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value=''>All Statuses</MenuItem>
                <MenuItem value='ACTIVE'>Active</MenuItem>
                <MenuItem value='INACTIVE'>Inactive</MenuItem>
                <MenuItem value='BLOCKED'>Blocked</MenuItem>
              </CustomTextField>
            </Box>

            {/* Right: invite button */}
            {canCreate && (
              <Button
                variant='contained'
                startIcon={<Icon icon='tabler:user-plus' />}
                onClick={() => setInviteOpen(true)}
              >
                Invite User
              </Button>
            )}
          </Box>

          <Divider />

          {/* ── DataGrid ────────────────────────────────────────────────── */}
          <DataGrid
            autoHeight
            rowHeight={62}
            loading={loading}
            rows={filteredRows}
            columns={columns}
            getRowId={row => row._id}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sx={{ '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' } }}
          />
        </Card>
      </Grid>

      {/* ── Invite Drawer ───────────────────────────────────────────────── */}
      <AdminInviteDrawer
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={() => { setInviteOpen(false); load() }}
      />

      {/* ── Edit Drawer ─────────────────────────────────────────────────── */}
      <AdminEditDrawer
        open={Boolean(editTarget)}
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
      />

      {/* ── Delete Dialog ───────────────────────────────────────────────── */}
      <DeleteDialog
        open={Boolean(deleteTarget)}
        userName={deleteTarget?.name || deleteTarget?.email || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDeleteTarget(null)}
        deleting={deleting}
      />
    </Grid>
  )
}

export default AdminUserList
