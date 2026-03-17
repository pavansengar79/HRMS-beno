// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Menu from '@mui/material/Menu'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Redux
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAllCompanies,
  deleteCompany,
  selectAllCompanies,
  selectCompanyTotal,
  selectCompanyLoading
} from 'src/store/company/companySlice'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Utils
import { getInitials } from 'src/@core/utils/get-initials'

// ** Table Components
import TableHeader from 'src/views/apps/user/list/TableHeader'
import AddCompanyDrawer from './AddCompanyDrawer'


// ─── Status chip color map ────────────────────
const statusColorMap = {
  ACTIVE:   'success',
  INACTIVE: 'secondary',
  PENDING:  'warning'
}

// ─── Plan chip color map ──────────────────────
const planColorMap = {
  BASIC:      'primary',
  STANDARD:   'info',
  ENTERPRISE: 'warning'
}

// ─── Avatar from company name initials ───────
const renderAvatar = row => (
  <CustomAvatar
    skin='light'
    color='primary'
    sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
  >
    {getInitials(row.companyName || 'NA')}
  </CustomAvatar>
)

// ─── Row Actions Menu ─────────────────────────
const RowOptions = ({ id }) => {
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleOpen  = e => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleDelete = () => {
    dispatch(deleteCompany(id))
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
          href={`/apps/company/view/${id}`}
          onClick={handleClose}
          sx={{ '& svg': { mr: 2 } }}
        >
          <Icon icon='tabler:eye' fontSize={20} />
          View
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:edit' fontSize={20} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:trash' fontSize={20} />
          Delete
        </MenuItem>
      </Menu>
    </>
  )
}

// ─── DataGrid Columns ─────────────────────────
// Mapped to actual API response fields
const columns = [
  {
    flex: 0.05,
    minWidth: 120,
    field: 'tenantCode',
    headerName: 'Code',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary' }}>
        {row.tenantCode}
      </Typography>
    )
  },
  {
    flex: 0.25,
    minWidth: 250,
    field: 'companyName',
    headerName: 'Company',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {renderAvatar(row)}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            noWrap
            component={Link}
            href={`/apps/company/view/${row._id}`}
            sx={{
              fontWeight: 500,
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            {row.companyName}
          </Typography>
          <Typography noWrap variant='body2' sx={{ color: 'text.disabled' }}>
            {row.companyEmail}
          </Typography>
        </Box>
      </Box>
    )
  },
  {
    flex: 0.15,
    minWidth: 140,
    field: 'companyPhone',
    headerName: 'Phone',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>
        {row.companyPhone}
      </Typography>
    )
  },
  {
    flex: 0.12,
    minWidth: 110,
    field: 'plan',
    headerName: 'Plan',
    renderCell: ({ row }) => (
      <CustomChip
        rounded
        skin='light'
        size='small'
        label={row.plan}
        color={planColorMap[row.plan] || 'primary'}
        sx={{ textTransform: 'capitalize' }}
      />
    )
  },
  {
    flex: 0.12,
    minWidth: 120,
    field: 'subdomain',
    headerName: 'Subdomain',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>
        {row.subdomain}
      </Typography>
    )
  },
  {
    flex: 0.12,
    minWidth: 100,
    field: 'status',
    headerName: 'Status',
    renderCell: ({ row }) => (
      <CustomChip
        rounded
        skin='light'
        size='small'
        label={row.status}
        color={statusColorMap[row.status] || 'secondary'}
        sx={{ textTransform: 'capitalize' }}
      />
    )
  },
  {
    flex: 0.1,
    minWidth: 100,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }) => <RowOptions id={row._id} />
  }
]

// ─── Main Component ───────────────────────────
const Company = () => {
  const [value, setValue]                   = useState('')
  const [statusFilter, setStatusFilter]     = useState('')
  const [planFilter, setPlanFilter]         = useState('')
  const [addCompanyOpen, setAddCompanyOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const dispatch  = useDispatch()
  const companies = useSelector(selectAllCompanies)
  const total     = useSelector(selectCompanyTotal)
  const loading   = useSelector(selectCompanyLoading)


  

  // Fetch on mount and when filters change
  useEffect(() => {
    dispatch(fetchAllCompanies())
  }, [dispatch])

  // Client-side filter by search value, status, plan
  const filteredRows = companies.filter(row => {
    const matchSearch =
      !value ||
      row.companyName?.toLowerCase().includes(value.toLowerCase()) ||
      row.companyEmail?.toLowerCase().includes(value.toLowerCase()) ||
      row.tenantCode?.toLowerCase().includes(value.toLowerCase())

    const matchStatus = !statusFilter || row.status === statusFilter
    const matchPlan   = !planFilter   || row.plan   === planFilter

    return matchSearch && matchStatus && matchPlan
  })

  const handleFilter = useCallback(val => setValue(val), [])

  const toggleDrawer = () => setAddCompanyOpen(prev => !prev)

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        
        <Card>
          {/* Filters */}
          <Box sx={{ p: 5, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <CustomTextField
              select
              value={statusFilter}
              label='Status'
              sx={{ minWidth: 150 }}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='ACTIVE'>Active</MenuItem>
              <MenuItem value='INACTIVE'>Inactive</MenuItem>
              <MenuItem value='PENDING'>Pending</MenuItem>
            </CustomTextField>

            <CustomTextField
              select
              value={planFilter}
              label='Plan'
              sx={{ minWidth: 150 }}
              onChange={e => setPlanFilter(e.target.value)}
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='BASIC'>Basic</MenuItem>
              <MenuItem value='STANDARD'>Standard</MenuItem>
              <MenuItem value='ENTERPRISE'>Enterprise</MenuItem>
            </CustomTextField>
          </Box>

          <Divider sx={{ m: '0 !important' }} />



          <TableHeader
            value={value}
            handleFilter={handleFilter}
            toggle={toggleDrawer}
          />

          <DataGrid
            autoHeight
            rowHeight={62}
            loading={loading}
            rows={filteredRows}
            columns={columns}
            getRowId={row => row._id}        // API uses _id not id
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={filteredRows.length}
          />
        </Card>
      </Grid>

      <AddCompanyDrawer open={addCompanyOpen} toggle={toggleDrawer} />
    </Grid>
  )
}

export default Company