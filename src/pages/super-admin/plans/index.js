// src/pages/super-admin/plans/index.js
// REAL API — GET /api/v1/plans (Super Admin)
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import { alpha } from '@mui/material/styles'

import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import AddPlanDrawer from './AddPlanDrawer'
import EditPlanDrawer from './EditPlanDrawer'
import axiosRequest from 'src/utils/AxiosInterceptor'

const STATUS_MAP = {
  active:    { color: '#10b981', label: 'Active' },
  inactive:  { color: '#94a3b8', label: 'Inactive' },
  draft:     { color: '#f59e0b', label: 'Draft' },
  archived:  { color: '#ef4444', label: 'Archived' }
}

const FEATURE_LABELS = {
  employee: 'Employee Management',
  attendance: 'Attendance Tracking',
  leave: 'Leave Management',
  payroll: 'Payroll Processing',
  shift: 'Shift Management',
  roster: 'Roster Scheduling',
  delegation: 'Delegation',
  holiday: 'Holiday Calendar',
  regularisation: 'Regularisation',
  recruitment: 'Recruitment',
  performance: 'Performance Review',
  training: 'Training'
}

const fmtDate = s =>
  s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function PlansManagement() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const res = await axiosRequest.get('/api/v1/plans')
      setPlans(res?.data || [])
    } catch (err) {
      toast.error('Failed to fetch plans')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleToggleStatus = async (plan) => {
    const newStatus = plan.status === 'active' ? 'inactive' : 'active'
    try {
      await axiosRequest.put(`/api/v1/plans/${plan._id}`, { status: newStatus })
      toast.success(`Plan ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
      fetchPlans()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to update plan')
    }
  }

  const handleEdit = (plan) => {
    setSelectedPlan(plan)
    setEditDrawerOpen(true)
  }

  const handleDelete = async (plan) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.name}"? This cannot be undone.`)) return
    try {
      await axiosRequest.delete(`/api/v1/plans/${plan._id}`)
      toast.success('Plan deleted')
      fetchPlans()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to delete plan')
    }
  }

  const filteredPlans = plans.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedPlans = filteredPlans.slice(page * limit, (page + 1) * limit)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ px: 5, py: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant='h5' sx={{ fontWeight: 700 }}>Subscription Plans</Typography>
              <Typography variant='body2' color='text.secondary'>Manage platform plans and features</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CustomTextField
                size='small'
                placeholder='Search plans...'
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0) }}
                sx={{ minWidth: 240 }}
              />
              <Button
                variant='contained'
                startIcon={<Icon icon='tabler:plus' />}
                onClick={() => setAddDrawerOpen(true)}
              >
                Create Plan
              </Button>
            </Box>
          </Box>

          <Divider />
          {loading && <LinearProgress />}

          <Table>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-root': { py: 2, fontWeight: 700, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase' } }}>
                <TableCell>Plan</TableCell>
                <TableCell>Features</TableCell>
                <TableCell>Seat Limit</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Organisations</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPlans.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant='body2' color='text.secondary'>No plans found</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedPlans.map(p => {
                const sc = STATUS_MAP[p.status] || STATUS_MAP.inactive
                return (
                  <TableRow key={p._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: alpha('#6366f1', 0.12), color: '#6366f1', fontSize: 13, fontWeight: 800 }}>
                          {p.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>{p.name}</Typography>
                          {p.description && (
                            <Typography variant='caption' color='text.secondary'>{p.description.slice(0, 40)}...</Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(p.features || []).slice(0, 4).map((f, i) => (
                          <Chip key={i} label={FEATURE_LABELS[f] || f} size='small' sx={{ fontSize: 10, height: 20 }} />
                        ))}
                        {p.features?.length > 4 && (
                          <Chip label={`+${p.features.length - 4}`} size='small' color='primary' sx={{ fontSize: 10, height: 20 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{p.seatLimit || 'Unlimited'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {p.price ? `₹${p.price.toLocaleString('en-IN')}/mo` : 'Free'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sc.label}
                        size='small'
                        sx={{ fontWeight: 700, fontSize: 11, bgcolor: alpha(sc.color, 0.1), color: sc.color, border: 'none' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{p.orgCount || 0}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{fmtDate(p.createdAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title='Edit'>
                          <IconButton size='small' onClick={() => handleEdit(p)}>
                            <Icon icon='tabler:edit' fontSize={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={p.status === 'active' ? 'Deactivate' : 'Activate'}>
                          <IconButton size='small' onClick={() => handleToggleStatus(p)}>
                            <Icon icon={p.status === 'active' ? 'tabler:player-pause' : 'tabler:player-play'} fontSize={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete'>
                          <IconButton size='small' color='error' onClick={() => handleDelete(p)}>
                            <Icon icon='tabler:trash' fontSize={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <TablePagination
            component='div'
            count={filteredPlans.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={e => { setLimit(parseInt(e.target.value, 10)); setPage(0) }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Card>
      </Grid>

      <AddPlanDrawer open={addDrawerOpen} toggle={() => setAddDrawerOpen(!addDrawerOpen)} onSuccess={fetchPlans} />
      <EditPlanDrawer open={editDrawerOpen} toggle={() => setEditDrawerOpen(!editDrawerOpen)} plan={selectedPlan} onSuccess={fetchPlans} />
    </Grid>
  )
}
