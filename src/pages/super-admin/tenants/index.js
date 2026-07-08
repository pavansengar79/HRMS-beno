// src/pages/super-admin/tenants/index.js
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllTenants,
  getTenantById,
  updateTenantStatus,
  clearSuperAdminState
} from 'src/store/superAdmin/superAdminSlice'
import {
  Box, Card, Grid, Typography, Button, Chip, Avatar,
  Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Alert, Tooltip, Switch, FormControlLabel
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  active: 'success',
  trial: 'warning',
  suspended: 'error',
  cancelled: 'default'
}

const TenantsManagement = () => {
  const dispatch = useDispatch()
  const { tenants, selectedTenant, loading, error, success } = useSelector(state => state.superAdmin)
  
  const [viewDialog, setViewDialog] = useState(false)
  const [statusDialog, setStatusDialog] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(getAllTenants())
  }, [dispatch])

  useEffect(() => {
    if (success) {
      toast.success(success)
      dispatch(clearSuperAdminState())
    }
    if (error) {
      toast.error(error)
      dispatch(clearSuperAdminState())
    }
  }, [success, error, dispatch])

  const handleViewTenant = async id => {
    await dispatch(getTenantById(id))
    setSelectedId(id)
    setViewDialog(true)
  }

  const handleStatusChange = async () => {
    if (!selectedId || !newStatus) return
    await dispatch(updateTenantStatus({ id: selectedId, status: newStatus }))
    setStatusDialog(false)
    setSelectedId(null)
    setNewStatus('')
    dispatch(getAllTenants())
  }

  const filteredTenants = tenants.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && tenants.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>Tenants Management</Typography>
          <Typography variant='body2' color='text.secondary'>Super Admin · All Organizations</Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<Icon icon='tabler:refresh' />}
          onClick={() => dispatch(getAllTenants())}
        >
          Refresh
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder='Search tenants by name, email, or status...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Icon icon='tabler:search' style={{ marginRight: 8, color: '#94a3b8' }} />
            }}
          />
        </Box>
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Organization</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Users</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 8 }}>
                  <Typography color='text.secondary'>No tenants found</Typography>
                </TableCell>
              </TableRow>
            ) : filteredTenants.map(tenant => (
              <TableRow key={tenant._id || tenant.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                      {(tenant.name || tenant.org_name || 'O').charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {tenant.name || tenant.org_name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {tenant.email || tenant.contact_email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={tenant.plan_name || tenant.plan?.name || 'N/A'} size='small' variant='outlined' />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={tenant.status || 'active'} 
                    size='small'
                    color={STATUS_COLORS[tenant.status?.toLowerCase()] || 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{tenant.userCount || tenant.users_count || 0}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>
                    {tenant.created_at || tenant.createdAt 
                      ? new Date(tenant.created_at || tenant.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Tooltip title='View Details'>
                    <IconButton size='small' onClick={() => handleViewTenant(tenant._id || tenant.id)}>
                      <Icon icon='tabler:eye' fontSize={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Change Status'>
                    <IconButton 
                      size='small' 
                      onClick={() => {
                        setSelectedId(tenant._id || tenant.id)
                        setNewStatus(tenant.status || 'active')
                        setStatusDialog(true)
                      }}
                    >
                      <Icon icon='tabler:edit' fontSize={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* View Tenant Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Tenant Details</DialogTitle>
        <DialogContent>
          {selectedTenant ? (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Organization Name</Typography>
                  <Typography variant='body1' sx={{ fontWeight: 600 }}>
                    {selectedTenant.name || selectedTenant.org_name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Email</Typography>
                  <Typography variant='body1'>{selectedTenant.email || selectedTenant.contact_email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Plan</Typography>
                  <Typography variant='body1'>{selectedTenant.plan_name || selectedTenant.plan?.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Status</Typography>
                  <Typography variant='body1'>
                    <Chip 
                      label={selectedTenant.status} 
                      size='small'
                      color={STATUS_COLORS[selectedTenant.status?.toLowerCase()] || 'default'}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Users</Typography>
                  <Typography variant='body1'>{selectedTenant.userCount || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary'>Trial Days Left</Typography>
                  <Typography variant='body1'>{selectedTenant.trialDaysLeft || '-'}</Typography>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Change Tenant Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label='Status'
              onChange={e => setNewStatus(e.target.value)}
            >
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='trial'>Trial</MenuItem>
              <MenuItem value='suspended'>Suspended</MenuItem>
              <MenuItem value='cancelled'>Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button variant='contained' onClick={handleStatusChange} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TenantsManagement
