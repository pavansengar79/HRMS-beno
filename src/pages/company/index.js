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

// ─── Plan chip color map — updated to match API ──
const planColorMap = {
  TRIAL:      'warning',
  BASIC:      'primary',
  STANDARD:   'info',
  ENTERPRISE: 'error'
}

// ─── Avatar from company name initials ───────
const renderAvatar = row => (
  <CustomAvatar
    skin='light'
    color='primary'
    sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500, fontSize: theme => theme.typography.body1.fontSize }}
  >
    {getInitials(row.companyName && row.companyName !== '—' ? row.companyName : 'NA')}
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
          href={`/company/${id}/details/account`}
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

// ─── DataGrid Columns — mapped to tenants API response ───
const columns = [
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
            href={`/company/${row.id}/details/account`}
            sx={{
              fontWeight: 500,
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            {row.companyName && row.companyName !== '—' ? row.companyName : 'Unnamed'}
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
    flex: 0.1,
    minWidth: 90,
    field: 'employeeCount',
    headerName: 'Employees',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary', textAlign: 'center', width: '100%' }}>
        {row.employeeCount ?? 0}
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
    flex: 0.14,
    minWidth: 130,
    field: 'signupDate',
    headerName: 'Signed Up',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>
        {row.signupDate
          ? new Date(row.signupDate).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric'
            })
          : '—'}
      </Typography>
    )
  },
  {
    flex: 0.14,
    minWidth: 130,
    field: 'trialEndsAt',
    headerName: 'Trial Ends',
    renderCell: ({ row }) => (
      <Typography
        noWrap
        sx={{ color: row.isTrialExpired ? 'error.main' : 'text.secondary' }}
      >
        {row.trialEndsAt
          ? new Date(row.trialEndsAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric'
            })
          : '—'}
      </Typography>
    )
  },
  {
    flex: 0.12,
    minWidth: 120,
    field: 'isOnboardingComplete',
    headerName: 'Onboarded',
    renderCell: ({ row }) => (
      <CustomChip
        rounded
        skin='light'
        size='small'
        label={row.isOnboardingComplete ? 'Complete' : 'Pending'}
        color={row.isOnboardingComplete ? 'success' : 'warning'}
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
    flex: 0.08,
    minWidth: 80,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }) => <RowOptions id={row.id} />
  }
]

// ─── Main Component ───────────────────────────
const Company = () => {
  const [value, setValue]                     = useState('')
  const [statusFilter, setStatusFilter]       = useState('')
  const [planFilter, setPlanFilter]           = useState('')
  const [onboardingFilter, setOnboardingFilter] = useState('')
  const [addCompanyOpen, setAddCompanyOpen]   = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const dispatch  = useDispatch()
  const companies = useSelector(selectAllCompanies)
  const total     = useSelector(selectCompanyTotal)
  const loading   = useSelector(selectCompanyLoading)

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchAllCompanies())
  }, [dispatch])

  // Client-side filter — search, status, plan, onboarding
  const filteredRows = companies.filter(row => {
    const matchSearch =
      !value ||
      row.companyName?.toLowerCase().includes(value.toLowerCase()) ||
      row.companyEmail?.toLowerCase().includes(value.toLowerCase())

    const matchStatus     = !statusFilter     || row.status === statusFilter
    const matchPlan       = !planFilter       || row.plan   === planFilter
    const matchOnboarding =
      onboardingFilter === ''
        ? true
        : onboardingFilter === 'complete'
        ? row.isOnboardingComplete === true
        : row.isOnboardingComplete === false

    return matchSearch && matchStatus && matchPlan && matchOnboarding
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
              <MenuItem value='TRIAL'>Trial</MenuItem>
              <MenuItem value='BASIC'>Basic</MenuItem>
              <MenuItem value='STANDARD'>Standard</MenuItem>
              <MenuItem value='ENTERPRISE'>Enterprise</MenuItem>
            </CustomTextField>

            <CustomTextField
              select
              value={onboardingFilter}
              label='Onboarding'
              sx={{ minWidth: 160 }}
              onChange={e => setOnboardingFilter(e.target.value)}
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='complete'>Complete</MenuItem>
              <MenuItem value='pending'>Pending</MenuItem>
            </CustomTextField>
          </Box>

          <Divider sx={{ m: '0 !important' }} />

          {/* <TableHeader
            value={value}
            handleFilter={handleFilter}
            toggle={toggleDrawer}
          /> */}

          <DataGrid
            autoHeight
            rowHeight={62}
            loading={loading}
            rows={filteredRows}
            columns={columns}
            getRowId={row => row.id}         // MongoDB document uses id
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