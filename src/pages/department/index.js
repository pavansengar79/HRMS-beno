// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Redux Imports
import { useSelector } from 'react-redux'

// ** Auth selectors — import directly from authSlice so the path is always correct
import { selectPermissions } from 'src/store/auth/authSlice'

// ** MUI Imports
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Avatar from '@mui/material/Avatar'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import TabContext from '@mui/lab/TabContext'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import { DataGrid } from '@mui/x-data-grid'
import { useTheme } from '@mui/material/styles'

// ✅ Interceptor — attaches Bearer token from localStorage on every request
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Custom Components Import
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Drawer (shared for Add + Edit)
import AddDepartmentDrawer from './departmentDrawer'
import TreeView from '../components/tree-view'
import TreeViewCustomized from 'src/views/components/tree-view/TreeViewCustomized'

// ---------------------------------------------------------------------------
// DataGrid columns
// ---------------------------------------------------------------------------
const columns = [
  {
    flex: 0.2,
    minWidth: 200,
    field: 'name',
    headerName: 'Employee Name',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CustomAvatar skin='light' color='primary' sx={{ width: 34, height: 34, fontSize: '0.875rem' }}>
          {row.name.split(' ').map(n => n[0]).join('')}
        </CustomAvatar>
        <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {row.name}
        </Typography>
      </Box>
    )
  },
  {
    flex: 0.12,
    minWidth: 110,
    field: 'employeeId',
    headerName: 'Employee ID',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.employeeId}</Typography>
    )
  },
  {
    flex: 0.2,
    minWidth: 190,
    field: 'email',
    headerName: 'Email',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.email}</Typography>
    )
  },
  {
    flex: 0.15,
    minWidth: 140,
    field: 'role',
    headerName: 'Role',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.role}</Typography>
    )
  },
  {
    flex: 0.15,
    minWidth: 130,
    field: 'department',
    headerName: 'Department',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.department}</Typography>
    )
  },
  {
    flex: 0.13,
    minWidth: 120,
    field: 'joiningDate',
    headerName: 'Joining Date',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.joiningDate}</Typography>
    )
  }
]

// ---------------------------------------------------------------------------
// Department Tab label — with optional edit / delete icons on the active tab
// ---------------------------------------------------------------------------
const DeptTab = ({ dept, count, isActive, theme, canEdit, canDelete, onEdit, onDelete }) => {
  const RenderAvatar = isActive ? CustomAvatar : Avatar

  return (
    <Box
      sx={{
        px: 3,
        height: 94,
        minWidth: 130,
        borderWidth: 1,
        display: 'flex',
        alignItems: 'center',
        borderRadius: '10px',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        borderStyle: isActive ? 'solid' : 'dashed',
        borderColor: isActive ? theme.palette.primary.main : theme.palette.divider
      }}
    >
      {/* Edit + Delete icons — only on active tab, only if user has permission */}
      {isActive && (canEdit || canDelete) && (
        <Box
          sx={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 0.5 }}
          onClick={e => e.stopPropagation()}
        >
          {canEdit && (
            <Tooltip title='Edit department' placement='top'>
              <IconButton
                size='small'
                sx={{ width: 20, height: 20, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                onClick={e => { e.stopPropagation(); onEdit(dept) }}
              >
                <Icon icon='tabler:pencil' fontSize='0.75rem' />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title='Delete department' placement='top'>
              <IconButton
                size='small'
                sx={{ width: 20, height: 20, color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                onClick={e => { e.stopPropagation(); onDelete(dept) }}
              >
                <Icon icon='tabler:trash' fontSize='0.75rem' />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      <RenderAvatar
        variant='rounded'
        {...(isActive && { skin: 'light' })}
        sx={{ mb: 1, width: 34, height: 34, ...(!isActive && { backgroundColor: 'action.selected' }) }}
      >
        <Icon icon='tabler:building' />
      </RenderAvatar>
      <Typography sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize', fontSize: '0.8rem' }}>
        {dept.name}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
        <Icon icon='tabler:users' fontSize={12} />
        <Typography variant='caption' sx={{ color: 'text.disabled' }}>{count}</Typography>
      </Box>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Employee table per department tab
// ---------------------------------------------------------------------------
const DepartmentEmployeeTable = ({ employees }) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  return (
    <DataGrid
      autoHeight
      rowHeight={62}
      rows={employees}
      columns={columns}
      disableRowSelectionOnClick
      pageSizeOptions={[10, 25, 50]}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
    />
  )
}

// ---------------------------------------------------------------------------
// Confirm Delete Dialog
// ---------------------------------------------------------------------------
const ConfirmDeleteDialog = ({ open, deptName, onConfirm, onCancel, deleting }) => (
  <Dialog open={open} onClose={onCancel} maxWidth='xs' fullWidth>
    <DialogTitle
      component='div'
      sx={{
        textAlign: 'center',
        pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
        px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
      }}
    >
      <Typography variant='h4'>Delete Department</Typography>
      <Typography color='text.secondary' sx={{ mt: 1 }}>
        Are you sure you want to delete <strong>{deptName}</strong>? This action cannot be undone.
      </Typography>
    </DialogTitle>
    <DialogActions
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 3,
        pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
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

// ---------------------------------------------------------------------------
// Department Page
// ---------------------------------------------------------------------------
const DepartmentPage = () => {
  const permissions = useSelector(selectPermissions)
  const canCreate   = permissions.includes('department.create')

  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [refreshKey,  setRefreshKey]  = useState(0)

  return (
    <>
      <TreeViewCustomized
        onAddRoot={canCreate ? () => setDrawerOpen(true) : undefined}
        refreshKey={refreshKey}
      />

      {/* Drawer — opens when "Add Department" button is clicked from the tree view */}
      <AddDepartmentDrawer
        open={drawerOpen}
        toggle={() => setDrawerOpen(false)}
        onSuccess={() => setRefreshKey(k => k + 1)}
        editingDept={null}
      />
    </>
  )
}

export default DepartmentPage