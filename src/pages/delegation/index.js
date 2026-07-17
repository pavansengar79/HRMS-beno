// src/pages/delegation/index.js
// Delegation Management Dashboard - Complete Implementation
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import {
  Box,
  Card,
  Grid,
  Tab,
  Tabs,
  Typography,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'

import CreateDelegationDialog from './create'
import { 
  fetchMyDelegations, 
  fetchReceivedDelegations,
  revokeDelegation 
} from 'src/store/delegation/delegationSlice'
  TableContainer,
  Avatar,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Divider
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'

import CreateDelegationDialog from './create'

// ─── Status Color Map ───────────────────────────────────────────────────────
const statusColors = {
  ACTIVE: 'success',
  PENDING: 'warning',
  EXPIRED: 'error',
  REVOKED: 'default',
  REJECTED: 'error'
}

const statusLabels = {
  ACTIVE: 'Active',
  PENDING: 'Pending Approval',
  EXPIRED: 'Expired',
  REVOKED: 'Revoked',
  REJECTED: 'Rejected'
}

// ---------------------------------------------------------------------------
// Delegation List Page
// ---------------------------------------------------------------------------
const DelegationPage = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { user } = useSelector(state => state.auth)

  const [activeTab, setActiveTab] = useState(0) // 0 = My Delegations, 1 = Received
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [selectedDelegation, setSelectedDelegation] = useState(null)
  const [revokeReason, setRevokeReason] = useState('')

  // Use existing delegation slice pattern
  const delegationState = useSelector(state => state.delegation || {})
  const {
    myDelegations = [],
    receivedDelegations = [],
    myDelegationsLoading = false,
    receivedLoading = false,
    error
  } = delegationState

  // ── Fetch delegations on mount ──────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchMyDelegations({ page: 1, limit: 20 }))
    dispatch(fetchReceivedDelegations({ page: 1, limit: 20 }))
  }, [dispatch])

  // ── Format date ─────────────────────────────────────────────────────────────
  const fmtDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // ── Current list based on tab ────────────────────────────────────────────────
  const currentList = activeTab === 0 ? myDelegations : receivedDelegations
  const loading = activeTab === 0 ? myDelegationsLoading : receivedLoading

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 4,
            pb: 0
          }}>
            <Box>
              <Typography variant='h5' sx={{ fontWeight: 700 }}>
                Delegation Management
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary', mt: 1 }}>
                Manage your delegated permissions or view received delegations
              </Typography>
            </Box>
            <Button
              variant='contained'
              startIcon={<Icon icon='tabler:plus' />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Delegation
            </Button>
          </Box>

          <Divider sx={{ mt: 3 }} />

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 4, pt: 3 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='tabler:user-share' />
                    My Delegations
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='tabler:user-check' />
                    Received Delegations
                  </Box>
                }
              />
            </Tabs>
          </Box>

          {/* Content */}
          <Box sx={{ p: 4 }}>
            {loading && <LinearProgress sx={{ mb: 3 }} />}

            {currentList.length === 0 && !loading ? (
              <Box sx={{
                textAlign: 'center',
                py: 8,
                color: 'text.secondary'
              }}>
                <Icon icon='tabler:inbox' fontSize={48} />
                <Typography variant='h6' sx={{ mt: 2 }}>
                  No delegations found
                </Typography>
                <Typography variant='body2'>
                  {activeTab === 0
                    ? 'You have not delegated any permissions yet'
                    : 'No active delegations received'}
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{activeTab === 0 ? 'Delegatee' : 'Delegator'}</TableCell>
                      <TableCell>Permissions</TableCell>
                      <TableCell>Valid From</TableCell>
                      <TableCell>Valid Until</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentList.map((delegation) => (
                      <TableRow key={delegation._id || delegation.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{
                              width: 40,
                              height: 40,
                              bgcolor: alpha('#6366f1', 0.1),
                              color: '#6366f1',
                              fontWeight: 600
                            }}>
                              {(activeTab === 0 ? delegation.delegatee?.name : delegation.delegator?.name)?.charAt(0) || '?'}
                            </Avatar>
                            <Box>
                              <Typography variant='body2' fontWeight={600}>
                                {activeTab === 0 
                                  ? (delegation.delegatee?.name || delegation.delegatee?.email || 'Unknown User')
                                  : (delegation.delegator?.name || delegation.delegator?.email || 'Unknown User')
                                }
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {(delegation.permissionSlugs || delegation.permissions || []).slice(0, 3).map(perm => (
                              <Chip 
                                key={perm} 
                                label={perm} 
                                size='small' 
                                variant='outlined'
                              />
                            ))}
                            {(delegation.permissionSlugs || delegation.permissions || []).length > 3 && (
                              <Chip 
                                label={`+${(delegation.permissionSlugs || delegation.permissions || []).length - 3}`} 
                                size='small' 
                                color='primary'
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{fmtDate(delegation.startDate)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{fmtDate(delegation.endDate)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusLabels[delegation.status] || delegation.status || 'ACTIVE'}
                            color={statusColors[delegation.status] || 'success'}
                            size='small'
                          />
                        </TableCell>
                        <TableCell align='right'>
                          <Tooltip title='View Details'>
                            <IconButton size='small'>
                              <Icon icon='tabler:eye' fontSize={18} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Card>
      </Grid>

      {/* Create Delegation Dialog */}
      <CreateDelegationDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => setCreateDialogOpen(false)}
      />
    </Grid>
  )
}

export default DelegationPage
