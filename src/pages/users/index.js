// src/pages/users/index.jsx

// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import Select from '@mui/material/Select'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Bulk Operations
import BulkImportDialog from 'src/components/bulk/BulkImportDialog'
import BulkExportButton from 'src/components/bulk/BulkExportButton'

// ** Redux
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAllEmployees,
  deleteEmployee,
  selectEmployeeList,
  selectEmployeeLoading,
} from 'src/store/employee/employeeSlice'
import { selectPermissions, selectRoleSlug } from 'src/store/auth/authSlice'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import { getInitials } from 'src/@core/utils/get-initials'

// ** Table Components
import TableHeader from 'src/views/apps/user/list/TableHeader'
import AddEmployeeDrawer from 'src/views/apps/user/list/AddUserDrawer'
import axiosRequest from 'src/utils/AxiosInterceptor'
import ComposePopup from 'src/views/apps/email/ComposePopup'
import UnitContextBanner from 'src/@core/components/CustomComponents/UnitContextBanner'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  ACTIVE:      'success',
  INACTIVE:    'secondary',
  TERMINATED:  'error',
  ON_LEAVE:    'warning',
  DEACTIVATED: 'error',
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE',      label: 'Active' },
  { value: 'INACTIVE',    label: 'Inactive' },
  { value: 'TERMINATED',  label: 'Terminated' },
  // { value: 'DEACTIVATED', label: 'Deactivated' },
]

const EMPLOYMENT_TYPE_COLOR = {
  FULL_TIME: 'primary',
  PART_TIME: 'info',
  CONTRACT:  'warning',
  INTERN:    'secondary',
}

// ─────────────────────────────────────────────────────────────────────────────
// Avatar renderer
// ─────────────────────────────────────────────────────────────────────────────
const renderAvatar = row => (
  <CustomAvatar
    skin='light'
    color='primary'
    sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
  >
    {getInitials(row.name || 'NA')}
  </CustomAvatar>
)

// ─────────────────────────────────────────────────────────────────────────────
// RolePickerDialog
//
// Opened when admin selects ACTIVE from the status dropdown OR clicks Approve.
//
// Logic:
//   • employee has a role → show it as a read-only chip, Activate button calls
//     activate-login directly (role already assigned)
//   • employee has NO role → show role Select; admin must pick before activating
// ─────────────────────────────────────────────────────────────────────────────
const RolePickerDialog = ({ open, employee, onClose, onSuccess }) => {
  const [roles, setRoles]               = useState([])
  const [selectedRole, setSelectedRole] = useState('')
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [activating, setActivating]     = useState(false)
  const [error, setError]               = useState('')

  // Resolve existing role — API may return roleId (string), role._id, or role (string)
  const existingRoleId = employee?.roleId || employee?.role?._id || (typeof employee?.role === 'string' ? employee.role : null)

  useEffect(() => {
    if (!open) return
    setError('')
    setActivating(false)
    setLoadingRoles(true)

    axiosRequest.get('/api/v1/roles/')
      .then(res => {
        if (res?.success && Array.isArray(res.data)) {
          setRoles(res.data)
          // Pre-select existing role if present
          if (existingRoleId) setSelectedRole(existingRoleId)
        } else {
          setError('Failed to load roles.')
        }
      })
      .catch(err => {
        setError(err?.response?.data?.message || 'Network error fetching roles.')
      })
      .finally(() => setLoadingRoles(false))
  }, [open])   // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    if (activating) return
    setSelectedRole('')
    setError('')
    setRoles([])
    onClose()
  }

  const handleActivate = async () => {
    const roleToUse = selectedRole || existingRoleId
    if (!roleToUse) { setError('Please select a role.'); return }

    setActivating(true)
    setError('')
    try {
      await axiosRequest.post(
        `/api/v1/employees/${employee._id}/activate-login`,
        { roleId: roleToUse }
      )
      onSuccess(employee._id)  // parent updates local status → ACTIVE
      handleClose()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to activate. Please try again.')
    } finally {
      setActivating(false)
    }
  }

  const existingRoleName = roles.find(r => r._id === existingRoleId)?.name || existingRoleId

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <DialogTitle
        component='div'
        sx={{
          textAlign: 'center',
          pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(10)} !important`],
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(12)} !important`],
        }}
      >
        <Typography variant='h5'>Activate Employee Login</Typography>
        <Typography color='text.secondary' sx={{ mt: 1.5, fontSize: '0.875rem' }}>
          {existingRoleId
            ? <>Role <strong>{existingRoleName}</strong> is already assigned. Click Activate to set status to Active.</>
            : <>No role assigned yet. Select a role to assign and activate <strong>{employee?.name}</strong>.</>
          }
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(12)} !important`] }}>
        {loadingRoles ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : existingRoleId ? (
          // Role already assigned — show read-only chip, no re-pick needed
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Typography variant='body2' color='text.secondary'>Assigned Role:</Typography>
            <CustomChip rounded skin='light' size='small' label={existingRoleName} color='primary' />
          </Box>
        ) : (
          // No role — must select one
          <CustomTextField
            select fullWidth
            label='Select Role'
            value={selectedRole}
            onChange={e => { setSelectedRole(e.target.value); setError('') }}
            SelectProps={{ value: selectedRole, onChange: e => { setSelectedRole(e.target.value); setError('') } }}
            sx={{ mt: 2 }}
            error={Boolean(error)}
            helperText={error || ' '}
          >
            <MenuItem value=''>— Select a role —</MenuItem>
            {roles.map(role => (
              <MenuItem key={role._id} value={role._id}>
                {role.name}
                {role.isSystem && (
                  <CustomChip rounded skin='light' size='small' label='System' color='info'
                    sx={{ ml: 2, pointerEvents: 'none' }} />
                )}
              </MenuItem>
            ))}
          </CustomTextField>
        )}
        {/* API error in the role-already-assigned branch */}
        {existingRoleId && error && (
          <Typography color='error' variant='caption' sx={{ mt: 1, display: 'block' }}>{error}</Typography>
        )}
      </DialogContent>

      <DialogActions sx={{
        justifyContent: 'center', gap: 3,
        pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(10)} !important`],
      }}>
        <Button
          variant='contained'
          color='success'
          disabled={activating || loadingRoles || (!existingRoleId && !selectedRole)}
          startIcon={activating ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:user-check' />}
          onClick={handleActivate}
        >
          {activating ? 'Activating…' : 'Activate'}
        </Button>
        <Button variant='tonal' color='secondary' onClick={handleClose} disabled={activating}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StatusCell
//
// canChangeStatus = false → read-only CustomChip (for non-admin users)
// canChangeStatus = true  → inline borderless Select dropdown
//   • Selecting ACTIVE  → calls onRequestActivate(row) → opens RolePickerDialog
//   • Selecting anything else → direct PATCH /employees/:id/status
// ─────────────────────────────────────────────────────────────────────────────
const StatusCell = ({ row, canChangeStatus, onStatusChange, onRequestActivate }) => {
  const [updating, setUpdating] = useState(false)

  const handleChange = async e => {
    const newStatus = e.target.value
    if (newStatus === row.status) return

    if (newStatus === 'ACTIVE') {
      // Delegate to parent — opens RolePickerDialog to ensure role is set
      onRequestActivate(row)
      return
    }

    // All other statuses — direct PATCH
    setUpdating(true)
    try {
      await axiosRequest.patch(`/api/v1/employees/${row._id}/status`, { status: newStatus })
      onStatusChange(row._id, newStatus)
    } catch (err) {
      console.error('Status update failed:', err?.response?.data?.message || err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (!canChangeStatus) {
    return (
      <CustomChip
        rounded skin='light' size='small'
        label={row.status || 'ACTIVE'}
        color={STATUS_COLOR[row.status] || 'success'}
        sx={{ textTransform: 'capitalize' }}
      />
    )
  }

  const textColor = {
    ACTIVE:      'success.main',
    INACTIVE:    'text.secondary',
    TERMINATED:  'error.main',
    DEACTIVATED: 'error.main',
    ON_LEAVE:    'warning.main',
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {updating && (
        <CircularProgress size={14}
          sx={{ position: 'absolute', left: 8, zIndex: 1, pointerEvents: 'none' }} />
      )}
      <Select
        size='small'
        value={row.status || 'ACTIVE'}
        onChange={handleChange}
        disabled={updating}
        sx={{
          fontSize: '0.75rem',
          height: 28,
          pl: updating ? 2.5 : 0,
          color: textColor[row.status] || 'success.main',
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '& .MuiSelect-icon': { fontSize: '1rem' },
        }}
      >
        {STATUS_OPTIONS.map(opt => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.8rem' }}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm Delete Dialog
// ─────────────────────────────────────────────────────────────────────────────
const ConfirmDeleteDialog = ({ open, employeeName, onConfirm, onCancel, deleting }) => (
  <Dialog open={open} onClose={onCancel} maxWidth='xs' fullWidth>
    <DialogTitle
      component='div'
      sx={{
        textAlign: 'center',
        pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
        px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
      }}
    >
      <Typography variant='h4'>Delete Employee</Typography>
      <Typography color='text.secondary' sx={{ mt: 2 }}>
        Are you sure you want to delete <strong>{employeeName}</strong>? This cannot be undone.
      </Typography>
    </DialogTitle>
    <DialogActions sx={{
      justifyContent: 'center', gap: 3,
      pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
    }}>
      <Button variant='contained' color='error' disabled={deleting}
        startIcon={deleting ? <CircularProgress size={16} color='inherit' /> : null}
        onClick={onConfirm}>
        {deleting ? 'Deleting…' : 'Delete'}
      </Button>
      <Button variant='tonal' color='secondary' onClick={onCancel} disabled={deleting}>
        Cancel
      </Button>
    </DialogActions>
  </Dialog>
)

// ─────────────────────────────────────────────────────────────────────────────
// Row Actions Menu
// Approve button: canApprove (tenant_admin + employee.update) + not already ACTIVE
// ─────────────────────────────────────────────────────────────────────────────
const RowOptions = ({ row, canEdit, canDelete, canApprove, onEdit, onDelete, onApprove }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleOpen  = e => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  return (
    <>
      <IconButton size='small' onClick={handleOpen}>
        <Icon icon='tabler:dots-vertical' />
      </IconButton>
      <Menu
        keepMounted anchorEl={anchorEl} open={open} onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        <MenuItem component={Link} href={`/users/${row._id}/details`} onClick={handleClose} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:eye' fontSize={20} />
          View
        </MenuItem>

        {canEdit && (
          <MenuItem onClick={() => { handleClose(); onEdit(row) }} sx={{ '& svg': { mr: 2 } }}>
            <Icon icon='tabler:edit' fontSize={20} />
            Edit
          </MenuItem>
        )}

        {/* Approve: only for tenant_admin, only when not already ACTIVE */}
        {canApprove && row?.status !== 'ACTIVE' && (
          <MenuItem onClick={() => { handleClose(); onApprove(row) }} sx={{ '& svg': { mr: 2 }, color: 'success.main' }}>
            <Icon icon='tabler:user-check' fontSize={20} />
            Approve
          </MenuItem>
        )}

        {canDelete && (
          <MenuItem onClick={() => { handleClose(); onDelete(row) }} sx={{ '& svg': { mr: 2 }, color: 'error.main' }}>
            <Icon icon='tabler:trash' fontSize={20} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Build columns
// ─────────────────────────────────────────────────────────────────────────────
const buildColumns = (canEdit, canDelete, canApprove, canChangeStatus, onEdit, onDelete, onApprove, onStatusChange, onRequestActivate) => [
  {
    flex: 0.25, minWidth: 260, field: 'name', headerName: 'Employee',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {renderAvatar(row)}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
          <Typography noWrap component={Link} href={`/users/${row._id}/details`}
            sx={{ fontWeight: 500, textDecoration: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
            {row.name}
          </Typography>
          <Typography noWrap variant='body2' sx={{ color: 'text.disabled' }}>{row.email}</Typography>
        </Box>
      </Box>
    )
  },
  {
    flex: 0.1, minWidth: 110, field: 'employeeId', headerName: 'Emp ID',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary' }}>{row.employeeId || '—'}</Typography>
    )
  },
  {
    flex: 0.15, minWidth: 140, field: 'departmentId', headerName: 'Department',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}> <CustomChip rounded skin='light' size='small'
        label={(row.departmentId.name || '—')}
        color={EMPLOYMENT_TYPE_COLOR[row.employmentType] || 'primary'}
        sx={{ textTransform: 'capitalize' }} /></Typography>
    )
  },
  
  {
    flex: 0.15, minWidth: 140, field: 'designationId', headerName: 'Designation',
    renderCell: ({ row }) => (
      <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
        {row.designationId?.name || row.designation?.name || '—'}
      </Typography>
    )
  },
  {
    flex: 0.18, minWidth: 160, field: 'reportingManagerId', headerName: 'Reporting Manager',
    renderCell: ({ row }) => (
      <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
        {row.reportingManagerId?.name || row.reportingManager?.name || '—'}
      </Typography>
    )
  },
  {
    flex: 0.13, minWidth: 120, field: 'phone', headerName: 'Phone',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.phone || '—'}</Typography>
    )
  },
  {
    flex: 0.12, minWidth: 130, field: 'employmentType', headerName: 'Type',
    renderCell: ({ row }) => (
      <CustomChip rounded skin='light' size='small'
        label={(row.employmentType || '—').replace('_', ' ')}
        color={EMPLOYMENT_TYPE_COLOR[row.employmentType] || 'primary'}
        sx={{ textTransform: 'capitalize' }} />
    )
  },
  {
    flex: 0.14, minWidth: 140, field: 'status', headerName: 'Status',
    renderCell: ({ row }) => (
      <StatusCell
        row={row}
        canChangeStatus={canChangeStatus}
        onStatusChange={onStatusChange}
        onRequestActivate={onRequestActivate}
      />
    )
  },
  {
    flex: 0.08, minWidth: 80, sortable: false, field: 'actions', headerName: 'Actions',
    renderCell: ({ row }) => (
      <RowOptions row={row} canEdit={canEdit} canDelete={canDelete} canApprove={canApprove}
        onEdit={onEdit} onDelete={onDelete} onApprove={onApprove} />
    )
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeList
// ─────────────────────────────────────────────────────────────────────────────
const EmployeeList = () => {
  const dispatch    = useDispatch()
  const router      = useRouter()
  const employees   = useSelector(selectEmployeeList)
  const loading     = useSelector(selectEmployeeLoading)
  const permissions = useSelector(selectPermissions)
  const userRole    = useSelector(selectRoleSlug) ?? ''

  const canCreate       = permissions.includes('employee.create') && (userRole === 'unit_admin' || userRole === 'hr_manager')
  const canEdit         = permissions.includes('employee.update') && (userRole === 'unit_admin' || userRole === 'hr_manager')
  const canDelete       = permissions.includes('employee.delete')
  const canApprove      = canEdit && userRole === 'unit_admin'
  const canChangeStatus = canEdit

  const [search, setSearch]               = useState('')
  const [typeFilter, setTypeFilter]       = useState('')
  const [statusFilter, setStatusFilter]   = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  // Local copy of employees so status changes reflect instantly without refetch
  const [localEmployees, setLocalEmployees] = useState([])

  const [drawerOpen, setDrawerOpen]           = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [deleteTarget, setDeleteTarget]       = useState(null)
  const [deleting, setDeleting]               = useState(false)

  // activateTarget — shared by both Approve button & status dropdown → ACTIVE
  const [activateTarget, setActivateTarget] = useState(null)

  useEffect(() => { dispatch(fetchAllEmployees()) }, [dispatch])

  // Keep local state in sync with redux
  useEffect(() => { setLocalEmployees(employees) }, [employees])

  // Non-ACTIVE status changes update local state immediately (optimistic)
  const handleStatusChange = useCallback((employeeId, newStatus) => {
    setLocalEmployees(prev =>
      prev.map(emp => emp._id === employeeId ? { ...emp, status: newStatus } : emp)
    )
  }, [])

  // Called by RolePickerDialog on success — mark row ACTIVE locally + close dialog
  const handleActivateSuccess = useCallback(employeeId => {
    setActivateTarget(null)
    setLocalEmployees(prev =>
      prev.map(emp => emp._id === employeeId ? { ...emp, status: 'ACTIVE' } : emp)
    )
  }, [])

  const filteredRows = localEmployees.filter(row => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      row.name?.toLowerCase().includes(q) ||
      row.email?.toLowerCase().includes(q) ||
      row.employeeId?.toLowerCase().includes(q) ||
      row.phone?.includes(search)
    const matchType   = !typeFilter   || row.employmentType === typeFilter
    const matchStatus = !statusFilter || row.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const handleFilter      = useCallback(val => setSearch(val), [])
  const handleOpenAdd     = () => { setEditingEmployee(null); setDrawerOpen(true) }
  const handleOpenEdit    = useCallback(row => { setEditingEmployee(row); setDrawerOpen(true) }, [])
  const handleCloseDrawer = () => { setDrawerOpen(false); setEditingEmployee(null) }
  const handleOpenDelete  = useCallback(row => setDeleteTarget(row), [])

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await dispatch(deleteEmployee(deleteTarget._id))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = buildColumns(
    canEdit, canDelete, canApprove, canChangeStatus,
    handleOpenEdit, handleOpenDelete,
    row => setActivateTarget(row),   // Approve button in RowOptions → same dialog
    handleStatusChange,
    row => setActivateTarget(row),   // Status dropdown → ACTIVE → same dialog
  )

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Search Filters' action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              {canCreate && (
                <>
                  <Button
                    variant='outlined'
                    startIcon={<Icon icon='mdi:file-excel' />}
                    onClick={() => router.push('/users/bulk-import')}
                  >
                    Bulk Import
                  </Button>
                  <BulkImportDialog
                    entityType='employees'
                    onImportComplete={() => dispatch(fetchAllEmployees())}
                  />
                </>
              )}
              <BulkExportButton
                entityType='employees'
                data={filteredRows}
                filename='employees-export'
              />
            </Box>
          } />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item sm={4} xs={12}>
                <CustomTextField select fullWidth
                  SelectProps={{ value: typeFilter, displayEmpty: true, onChange: e => setTypeFilter(e.target.value) }}
                  defaultValue=''>
                  <MenuItem value=''>Select Employment Type</MenuItem>
                  <MenuItem value='FULL_TIME'>Full Time</MenuItem>
                  <MenuItem value='PART_TIME'>Part Time</MenuItem>
                  <MenuItem value='CONTRACT'>Contract</MenuItem>
                  <MenuItem value='INTERN'>Intern</MenuItem>
                </CustomTextField>
              </Grid>
              <Grid item sm={4} xs={12}>
                <CustomTextField select fullWidth
                  SelectProps={{ value: statusFilter, displayEmpty: true, onChange: e => setStatusFilter(e.target.value) }}
                  defaultValue=''>
                  <MenuItem value=''>Select Status</MenuItem>
                  <MenuItem value='ACTIVE'>Active</MenuItem>
                  <MenuItem value='INACTIVE'>Inactive</MenuItem>
                  <MenuItem value='TERMINATED'>Terminated</MenuItem>
                  <MenuItem value='DEACTIVATED'>Deactivated</MenuItem>
                  <MenuItem value='ON_LEAVE'>On Leave</MenuItem>
                </CustomTextField>
              </Grid>
            </Grid>
          </CardContent>

          <Divider sx={{ m: '0 !important' }} />

<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 6, py: 3 }}>
  {canCreate && <TableHeader value={search} handleFilter={handleFilter} toggle={canCreate ? handleOpenAdd : undefined} onInviteSuccess={() => dispatch(fetchAllEmployees())} />}
</Box>
         

          <DataGrid
            autoHeight rowHeight={62} loading={loading}
            rows={filteredRows} columns={columns}
            getRowId={row => row._id} disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
          />
        </Card>
      </Grid>

      {(canCreate || canEdit) && (
        <AddEmployeeDrawer
          open={drawerOpen} toggle={handleCloseDrawer}
          editingEmployee={editingEmployee}
          onSuccess={() => { handleCloseDrawer(); dispatch(fetchAllEmployees()) }}
        />
      )}

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        employeeName={deleteTarget?.name ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
        deleting={deleting}
      />

      {/*
        RolePickerDialog — single dialog for BOTH entry points:
          1. Approve button in RowOptions (canApprove users)
          2. Status dropdown selecting ACTIVE (canChangeStatus users)
        Both set activateTarget, which controls open state.
      */}
      {canChangeStatus && (
        <RolePickerDialog
          open={Boolean(activateTarget)}
          employee={activateTarget}
          onClose={() => setActivateTarget(null)}
          onSuccess={handleActivateSuccess}
        />
      )}
    </Grid>
  )
}

export default EmployeeList
