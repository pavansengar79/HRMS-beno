// src/pages/customers/index.js
// REAL API — GET /api/v1/super-admin/tenants
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAllCustomers, updateTenantStatus,
  selectAllCustomers, selectCustomerTotal, selectCustomerLoading
} from 'src/store/customer/customerSlice'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { alpha } from '@mui/material/styles'

import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import AddCustomerDrawer from './AddCustomerDrawer'

// Add Dialog components
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'

const STATUS_MAP = {
  Active:    { color: '#10b981', label: 'Active'    },
  Pending:   { color: '#f59e0b', label: 'Pending'   },
  Suspended: { color: '#ef4444', label: 'Suspended' },
  Inactive:  { color: '#94a3b8', label: 'Inactive'  },
  Trial:     { color: '#3b82f6', label: 'Trial'     },
  ACTIVE:    { color: '#10b981', label: 'Active'    },
  PENDING:   { color: '#f59e0b', label: 'Pending'   },
  SUSPENDED: { color: '#ef4444', label: 'Suspended' },
  INACTIVE:  { color: '#94a3b8', label: 'Inactive'  },
}

const fmtDate = s =>
  s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function CustomersPage() {
  const dispatch  = useDispatch()
  const customers = useSelector(selectAllCustomers)
  const total     = useSelector(selectCustomerTotal)
  const loading   = useSelector(selectCustomerLoading)

  const [page,    setPage]    = useState(0)
  const [limit,   setLimit]   = useState(20)
  const [search,  setSearch]  = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null })
  const [approvingCustomerIds, setApprovingCustomerIds] = useState([])
  const approvalLocks = useRef(new Set())

  useEffect(() => {
    dispatch(fetchAllCustomers({ page: page + 1, limit, search, status: statusFilter }))
  }, [dispatch, page, limit, search, statusFilter])

  const handleStatusChange = async (customerId, newStatus) => {
    try {
      await dispatch(updateTenantStatus({ id: customerId, status: newStatus })).unwrap()
      toast.success(`Customer status updated to ${newStatus}`)
      dispatch(fetchAllCustomers({ page: page + 1, limit, search, status: statusFilter }))
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to update status')
    }
  }

  const handleApproveCustomer = async (customer) => {
    const customerId = customer.id || customer._id

    if (!customerId || approvalLocks.current.has(customerId)) return

    approvalLocks.current.add(customerId)
    setApprovingCustomerIds(currentIds => [...currentIds, customerId])

    try {
      const res = await axiosRequest.post(`/api/v1/super-admin/customers/${customerId}/approve`)
      if (res?.success) {
        toast.success(res.data?.message || 'Customer approved! Credentials sent to work email.', { duration: 6000 })
        dispatch(fetchAllCustomers({ page: page + 1, limit, search }))
      } else {
        toast.error(res?.message || 'Failed to approve customer')
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to approve customer')
    } finally {
      approvalLocks.current.delete(customerId)
      setApprovingCustomerIds(currentIds => currentIds.filter(id => id !== customerId))
    }
  }

  const handleRowClick = async (customer) => {
    try {
      // Fetch full tenant details from API using axiosRequest
      const data = await axiosRequest.get(`/api/v1/super-admin/tenants/${customer.id || customer._id}`)
      setDetailDialog({ open: true, data: data.data || data })
    } catch (err) {
      console.error('Failed to fetch tenant details:', err)
      toast.error('Failed to load details')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          {/* ── Header ── */}
          <Box sx={{ px: 5, py: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>Customers</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CustomTextField
                size='small' placeholder='Search customers...' value={search}
                onChange={e => { setSearch(e.target.value); setPage(0) }}
                sx={{ minWidth: 220 }}
              />
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <Select
                  value={statusFilter}
                  displayEmpty
                  onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
                  inputProps={{ 'aria-label': 'Status filter' }}
                  sx={{ height: 40 }}
                >
                  <MenuItem value=''>All Status</MenuItem>
                  <MenuItem value='Pending'>Pending</MenuItem>
                  <MenuItem value='Active'>Active</MenuItem>
                  <MenuItem value='Suspended'>Suspended</MenuItem>
                </Select>
              </FormControl>
              <Button variant='contained' startIcon={<Icon icon='tabler:plus' />}
                onClick={() => setDrawerOpen(true)}>
                Add Customer
              </Button>
            </Box>
          </Box>

          <Divider />
          {loading && <LinearProgress />}

          {/* ── Table ── */}
          <Table>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-root': { py: 2, fontWeight: 700, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase' } }}>
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant='body2' color='text.secondary'>No customers found</Typography>
                  </TableCell>
                </TableRow>
              ) : customers.map(c => {
                const sc   = STATUS_MAP[c.status] || STATUS_MAP['Inactive']
                const businessName = c.contactName || c.name || 'Unknown'
                const isActive = c.status === 'Active' || c.status === 'ACTIVE'
                return (
                  <TableRow 
                    key={c._id} 
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleRowClick(c)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: alpha('#6366f1', 0.12), color: '#6366f1', fontSize: 13, fontWeight: 800 }}>
                          {businessName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>{businessName}</Typography>
                          {/* {c.contactName && (
                            <Typography variant='caption' color='text.secondary'>
                              {c.contactName || c.contact_name}
                            </Typography>
                          )} */}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{c.contact_email || c.email || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{c.contact_phone || c.phone || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='caption' sx={{ fontWeight: 600, color: '#6366f1' }}>
                        {c.plan_name || c.plan || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={sc.label} size='small'
                        sx={{ fontWeight: 700, fontSize: 11, bgcolor: alpha(sc.color, 0.1), color: sc.color, border: 'none' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{fmtDate(c.joinedAt || c.createdAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {c.status === 'Pending' || c.status === 'PENDING' ? (
                          <Button size='small' variant='contained' color='success'
                            sx={{ height: 28, fontSize: 11, minWidth: 74 }}
                            disabled={approvingCustomerIds.includes(c.id || c._id)}
                            onClick={e => { e.stopPropagation(); handleApproveCustomer(c) }}>
                            Approve
                          </Button>
                        ) : (
                          <FormControl size='small' sx={{ minWidth: 120 }}>
                            <Select
                              value={c.status}
                              displayEmpty
                              onChange={e => { e.stopPropagation(); handleStatusChange(c._id || c.id, e.target.value) }}
                              onClick={e => e.stopPropagation()}
                              sx={{ height: 28, fontSize: 11 }}
                            >
                              <MenuItem value='Active'>Active</MenuItem>
                              <MenuItem value='Inactive'>Inactive</MenuItem>
                              <MenuItem value='Suspended'>Suspended</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <TablePagination
            component='div'
            count={total}
            page={page}
            rowsPerPage={limit}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={e => { setLimit(parseInt(e.target.value)); setPage(0) }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Card>
      </Grid>

      <AddCustomerDrawer open={drawerOpen} toggle={() => setDrawerOpen(v => !v)} />

      {/* ── Detail Dialog ── */}
      <Dialog 
        open={detailDialog.open} 
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {detailDialog.data?.name || 'Customer Details'}
        </DialogTitle>
        <DialogContent>
          {detailDialog.data && (
            <Box>
              {/* ── Basic Info ───────────────────── */}
              <Typography variant='h6' sx={{ mb: 2, fontWeight: 700 }}>Customer Information</Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Business Name</Typography>
                  <Typography variant='body2'>{detailDialog.data.name || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Contact Name</Typography>
                  <Typography variant='body2'>{detailDialog.data.contactName || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Email</Typography>
                  <Typography variant='body2'>{detailDialog.data.email || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Phone</Typography>
                  <Typography variant='body2'>{detailDialog.data.phone || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Joined</Typography>
                  <Typography variant='body2'>{fmtDate(detailDialog.data.joinedAt)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>	Status</Typography>
                  <Chip 
                    label={detailDialog.data.status} 
                    size='small'
                    sx={{ fontWeight: 700, fontSize: 11 }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ── Usage Stats ───────────────────── */}
              <Typography variant='h6' sx={{ mb: 2, fontWeight: 700 }}>Usage Statistics</Typography>
              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Card sx={{ p: 3, bgcolor: alpha('#10b981', 0.05) }}>
                    <Typography variant='h4' sx={{ color: '#10b981', fontWeight: 800 }}>
                      {detailDialog.data.usage?.totalEmployees || 0}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>Total Employees</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ p: 3, bgcolor: alpha('#6366f1', 0.05) }}>
                    <Typography variant='h4' sx={{ color: '#6366f1', fontWeight: 800 }}>
                      {detailDialog.data.usage?.totalUsers || 0}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>Total Administrative Users</Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* ── User Breakdown by Level ───────────────────── */}
              <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 700 }}>Administrative Users by Level</Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={4}>
                  <Box sx={{ p: 2, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                    <Typography variant='h5' sx={{ color: '#f59e0b', fontWeight: 700 }}>
                      {detailDialog.data.usage?.adminCounts?.org || 0}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>Org Admins</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 2, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                    <Typography variant='h5' sx={{ color: '#6366f1', fontWeight: 700 }}>
                      {detailDialog.data.usage?.adminCounts?.company || 0}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>Company Admins</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 2, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                    <Typography variant='h5' sx={{ color: '#10b981', fontWeight: 700 }}>
                      {detailDialog.data.usage?.adminCounts?.unit || 0}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>Unit Admins</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* ── Detailed User Lists ───────────────────── */}
              <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 700 }}>User Details</Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {/* Org Level Users */}
                {detailDialog.data.usage?.usersByLevel?.org?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
                      Organization Admins
                    </Typography>
                    <List dense>
                      {detailDialog.data.usage.usersByLevel.org.map(user => (
                        <ListItem key={user.id}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 28, height: 28 }}>{user.name?.charAt(0)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={user.name}
                            secondary={`${user.email} • ${user.role}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Company Level Users */}
                {detailDialog.data.usage?.usersByLevel?.company?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
                      Company Admins
                    </Typography>
                    <List dense>
                      {detailDialog.data.usage.usersByLevel.company.map(user => (
                        <ListItem key={user.id}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 28, height: 28 }}>{user.name?.charAt(0)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={user.name}
                            secondary={`${user.email} • ${user.role}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Unit Level Users */}
                {detailDialog.data.usage?.usersByLevel?.unit?.length > 0 && (
                  <Box>
                    <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
                      Unit Admins
                    </Typography>
                    <List dense>
                      {detailDialog.data.usage.usersByLevel.unit.map(user => (
                        <ListItem key={user.id}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 28, height: 28 }}>{user.name?.charAt(0)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={user.name}
                            secondary={`${user.email} • ${user.role}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {!detailDialog.data.usage?.usersByLevel?.org?.length && 
                 !detailDialog.data.usage?.usersByLevel?.company?.length && 
                 !detailDialog.data.usage?.usersByLevel?.unit?.length && (
                  <Typography variant='body2' color='text.secondary' align='center'>
                    No administrative users found
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  )
}
