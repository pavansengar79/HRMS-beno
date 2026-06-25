// src/pages/customers/index.js
// REAL API — GET /api/v1/super-admin/tenants
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAllCustomers, updateTenantStatus,
  selectAllCustomers, selectCustomerTotal, selectCustomerLoading
} from 'src/store/customer/customerSlice'
import toast from 'react-hot-toast'

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
import { alpha } from '@mui/material/styles'

import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import AddCustomerDrawer from './AddCustomerDrawer'

const STATUS_MAP = {
  Active:    { color: '#10b981', label: 'Active'    },
  Suspended: { color: '#ef4444', label: 'Suspended' },
  Inactive:  { color: '#94a3b8', label: 'Inactive'  },
  Trial:     { color: '#f59e0b', label: 'Trial'     },
  ACTIVE:    { color: '#10b981', label: 'Active'    },
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
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchAllCustomers({ page: page + 1, limit, search }))
  }, [dispatch, page, limit, search])

  const handleStatusToggle = async (c) => {
    const newStatus = (c.status === 'Active' || c.status === 'ACTIVE') ? 'SUSPENDED' : 'ACTIVE'
    try {
      await dispatch(updateTenantStatus({ id: c._id, status: newStatus })).unwrap()
      toast.success(`Customer ${newStatus === 'SUSPENDED' ? 'suspended' : 'activated'}`)
      dispatch(fetchAllCustomers({ page: page + 1, limit, search }))
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to update status')
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
                <TableCell>Created</TableCell>
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
                const name = c.business_name || c.contact_name || c.name || 'Unknown'
                const isActive = c.status === 'Active' || c.status === 'ACTIVE'
                return (
                  <TableRow key={c._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: alpha('#6366f1', 0.12), color: '#6366f1', fontSize: 13, fontWeight: 800 }}>
                          {name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>{name}</Typography>
                          {c.contact_name && c.business_name && (
                            <Typography variant='caption' color='text.secondary'>{c.contact_name}</Typography>
                          )}
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
                      <Typography variant='body2'>{fmtDate(c.createdAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Button size='small' variant='outlined'
                        color={isActive ? 'error' : 'success'}
                        sx={{ height: 28, fontSize: 11, minWidth: 74 }}
                        onClick={() => handleStatusToggle(c)}>
                        {isActive ? 'Suspend' : 'Activate'}
                      </Button>
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
    </Grid>
  )
}
