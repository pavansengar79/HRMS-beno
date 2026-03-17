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
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
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
// Row Actions Menu
// ─────────────────────────────────────────────────────────────────────────────
const RowOptions = ({ id, canEdit, canDelete }) => {
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleOpen  = e => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleDelete = () => {
    dispatch(deleteEmployee(id))
    handleClose()
  }

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
        <MenuItem
          component={Link}
          href={`/users/${id}/details`}
          onClick={handleClose}
          sx={{ '& svg': { mr: 2 } }}
        >
          <Icon icon='tabler:eye' fontSize={20} />
          View
        </MenuItem>

        {canEdit && (
          <MenuItem
            component={Link}
            href={`/users/${id}/details/account`}
            onClick={handleClose}
            sx={{ '& svg': { mr: 2 } }}
          >
            <Icon icon='tabler:edit' fontSize={20} />
            Edit
          </MenuItem>
        )}

        {canDelete && (
          <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 }, color: 'error.main' }}>
            <Icon icon='tabler:trash' fontSize={20} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Columns
//
// API response shape (what each row actually looks like):
// {
//   _id:            "69b8e3dab3b714c091633467"
//   employeeId:     "EMP0001"
//   name:           "Vibhav trivedi"
//   email:          "vibhavtrivedi6@gmail.com"
//   phone:          "8989899982"
//   departmentId:   { _id: "...", name: "ITI" }   ← object, NOT department
//   employmentType: "CONTRACT"
//   joiningDate:    "2026-03-11T00:00:00.000Z"
//   status:         "ACTIVE"
// }
// ─────────────────────────────────────────────────────────────────────────────
const buildColumns = (canEdit, canDelete) => [
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
    // API returns departmentId as an object: { _id, name }
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
    renderCell: ({ row }) => <RowOptions id={row._id} canEdit={canEdit} canDelete={canDelete} />
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeList
// ─────────────────────────────────────────────────────────────────────────────
const EmployeeList = () => {
  const dispatch    = useDispatch()
  const employees   = useSelector(selectEmployeeList)   // always [] by default, never undefined
  const loading     = useSelector(selectEmployeeLoading)
  const permissions = useSelector(selectPermissions)

  const canCreate = permissions.includes('employee.create')
  const canEdit   = permissions.includes('employee.update')
  const canDelete = permissions.includes('employee.delete')

  const [search, setSearch]             = useState('')
  const [typeFilter, setTypeFilter]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [drawerOpen, setDrawerOpen]     = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

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

  const handleFilter = useCallback(val => setSearch(val), [])
  const toggleDrawer = () => setDrawerOpen(prev => !prev)
  const columns      = buildColumns(canEdit, canDelete)

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
            toggle={canCreate ? toggleDrawer : undefined}
          />
{/* {JSON.stringify(filteredRows)} */}
          <DataGrid
            autoHeight
            rowHeight={62}
            loading={loading}
            rows={filteredRows}
            columns={columns}
            getRowId={row => row._id}       // ← use _id not id
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
          />
        </Card>
      </Grid>

      {canCreate && (
        <AddEmployeeDrawer
          open={drawerOpen}
          toggle={toggleDrawer}
          onSuccess={() => dispatch(fetchAllEmployees())}
        />
      )}
    </Grid>
  )
}

export default EmployeeList