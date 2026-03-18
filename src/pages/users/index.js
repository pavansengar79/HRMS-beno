// src/pages/users/index.jsx

// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
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

// ** Redux
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAllEmployees,
  deleteEmployee,
  selectEmployeeList,
  selectEmployeeLoading,
} from 'src/store/employee/employeeSlice'
import { selectPermissions } from 'src/store/auth/authSlice'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import { getInitials } from 'src/@core/utils/get-initials'

// ** Table Components
import TableHeader from 'src/views/apps/user/list/TableHeader'
import AddEmployeeDrawer from 'src/views/apps/user/list/AddUserDrawer'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  ACTIVE:     'success',
  INACTIVE:   'secondary',
  TERMINATED: 'error',
  ON_LEAVE:   'warning',
}

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
    <DialogActions
      sx={{
        justifyContent: 'center',
        gap: 3,
        pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
      }}
    >
      <Button
        variant='contained'
        color='error'
        disabled={deleting}
        startIcon={deleting ? <CircularProgress size={16} color='inherit' /> : null}
        onClick={onConfirm}
      >
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
// onEdit(row)   → opens drawer pre-filled
// onDelete(row) → opens confirm dialog
// ─────────────────────────────────────────────────────────────────────────────
const RowOptions = ({ row, canEdit, canDelete, onEdit, onDelete }) => {
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
        keepMounted
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        {/* View — navigates to detail page */}
        <MenuItem
          component={Link}
          href={`/users/${row._id}/details`}
          onClick={handleClose}
          sx={{ '& svg': { mr: 2 } }}
        >
          <Icon icon='tabler:eye' fontSize={20} />
          View
        </MenuItem>

        {/* Edit — opens drawer, NOT a link */}
        {canEdit && (
          <MenuItem
            onClick={() => { handleClose(); onEdit(row) }}
            sx={{ '& svg': { mr: 2 } }}
          >
            <Icon icon='tabler:edit' fontSize={20} />
            Edit
          </MenuItem>
        )}

        {/* Delete — opens confirm dialog */}
        {canDelete && (
          <MenuItem
            onClick={() => { handleClose(); onDelete(row) }}
            sx={{ '& svg': { mr: 2 }, color: 'error.main' }}
          >
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
const buildColumns = (canEdit, canDelete, onEdit, onDelete) => [
  {
    flex: 0.25,
    minWidth: 260,
    field: 'name',
    headerName: 'Employee',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {renderAvatar(row)}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
          <Typography
            noWrap
            component={Link}
            href={`/users/${row._id}/details`}
            sx={{ fontWeight: 500, textDecoration: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
          >
            {row.name}
          </Typography>
          <Typography noWrap variant='body2' sx={{ color: 'text.disabled' }}>
            {row.email}
          </Typography>
        </Box>
      </Box>
    )
  },
  {
    flex: 0.1,
    minWidth: 110,
    field: 'employeeId',
    headerName: 'Emp ID',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary' }}>
        {row.employeeId || '—'}
      </Typography>
    )
  },
  {
    flex: 0.15,
    minWidth: 140,
    field: 'departmentId',
    headerName: 'Department',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>
        {row.departmentId?.name || '—'}
      </Typography>
    )
  },
  {
    flex: 0.13,
    minWidth: 120,
    field: 'phone',
    headerName: 'Phone',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>
        {row.phone || '—'}
      </Typography>
    )
  },
  {
    flex: 0.12,
    minWidth: 130,
    field: 'employmentType',
    headerName: 'Type',
    renderCell: ({ row }) => (
      <CustomChip
        rounded skin='light' size='small'
        label={(row.employmentType || '—').replace('_', ' ')}
        color={EMPLOYMENT_TYPE_COLOR[row.employmentType] || 'primary'}
        sx={{ textTransform: 'capitalize' }}
      />
    )
  },
  {
    flex: 0.1,
    minWidth: 100,
    field: 'status',
    headerName: 'Status',
    renderCell: ({ row }) => (
      <CustomChip
        rounded skin='light' size='small'
        label={row.status || 'ACTIVE'}
        color={STATUS_COLOR[row.status] || 'success'}
        sx={{ textTransform: 'capitalize' }}
      />
    )
  },
  {
    flex: 0.08,
    minWidth: 80,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }) => (
      <RowOptions
        row={row}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeList
// ─────────────────────────────────────────────────────────────────────────────
const EmployeeList = () => {
  const dispatch    = useDispatch()
  const employees   = useSelector(selectEmployeeList)
  const loading     = useSelector(selectEmployeeLoading)
  const permissions = useSelector(selectPermissions)

  const canCreate = permissions.includes('employee.create')
  const canEdit   = permissions.includes('employee.update')
  const canDelete = permissions.includes('employee.delete')

  const [search, setSearch]             = useState('')
  const [typeFilter, setTypeFilter]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  // Drawer state — null = closed/Add mode, object = Edit mode with pre-filled data
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  useEffect(() => {
    dispatch(fetchAllEmployees())
  }, [dispatch])

  // Client-side filter
  const filteredRows = employees.filter(row => {
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

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFilter = useCallback(val => setSearch(val), [])

  // Add — open drawer empty
  const handleOpenAdd = () => {
    setEditingEmployee(null)
    setDrawerOpen(true)
  }

  // Edit — open drawer with employee data pre-filled
  const handleOpenEdit = useCallback(row => {
    setEditingEmployee(row)
    setDrawerOpen(true)
  }, [])

  // Drawer close
  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setEditingEmployee(null)
  }

  // Delete — open confirm dialog
  const handleOpenDelete = useCallback(row => {
    setDeleteTarget(row)
  }, [])

  // Delete — confirmed
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

  const columns = buildColumns(canEdit, canDelete, handleOpenEdit, handleOpenDelete)

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Search Filters' />
          <CardContent>
            <Grid container spacing={6}>

              <Grid item sm={4} xs={12}>
                <CustomTextField
                  select fullWidth
                  SelectProps={{
                    value: typeFilter,
                    displayEmpty: true,
                    onChange: e => setTypeFilter(e.target.value)
                  }}
                  defaultValue=''
                >
                  <MenuItem value=''>Select Employment Type</MenuItem>
                  <MenuItem value='FULL_TIME'>Full Time</MenuItem>
                  <MenuItem value='PART_TIME'>Part Time</MenuItem>
                  <MenuItem value='CONTRACT'>Contract</MenuItem>
                  <MenuItem value='INTERN'>Intern</MenuItem>
                </CustomTextField>
              </Grid>

              <Grid item sm={4} xs={12}>
                <CustomTextField
                  select fullWidth
                  SelectProps={{
                    value: statusFilter,
                    displayEmpty: true,
                    onChange: e => setStatusFilter(e.target.value)
                  }}
                  defaultValue=''
                >
                  <MenuItem value=''>Select Status</MenuItem>
                  <MenuItem value='ACTIVE'>Active</MenuItem>
                  <MenuItem value='INACTIVE'>Inactive</MenuItem>
                  <MenuItem value='TERMINATED'>Terminated</MenuItem>
                  <MenuItem value='ON_LEAVE'>On Leave</MenuItem>
                </CustomTextField>
              </Grid>

            </Grid>
          </CardContent>

          <Divider sx={{ m: '0 !important' }} />

          <TableHeader
            value={search}
            handleFilter={handleFilter}
            toggle={canCreate ? handleOpenAdd : undefined}
          />

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
          />
        </Card>
      </Grid>

      {/* Add / Edit Drawer — same component, mode determined by editingEmployee */}
      {(canCreate || canEdit) && (
        <AddEmployeeDrawer
          open={drawerOpen}
          toggle={handleCloseDrawer}
          editingEmployee={editingEmployee}
          onSuccess={() => {
            handleCloseDrawer()
            dispatch(fetchAllEmployees())
          }}
        />
      )}

      {/* Delete confirm dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        employeeName={deleteTarget?.name ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
        deleting={deleting}
      />
    </Grid>
  )
}

export default EmployeeList