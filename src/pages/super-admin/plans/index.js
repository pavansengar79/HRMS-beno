// src/pages/super-admin/plans/index.js
// Super Admin Plans - Rich Card Layout (Pricing Page Style)
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'
import { alpha } from '@mui/material/styles'

import Icon from 'src/@core/components/icon'
import AddPlanDrawer from './AddPlanDrawer'
import EditPlanDrawer from './EditPlanDrawer'
import axiosRequest from 'src/utils/AxiosInterceptor'

const STATUS_COLORS = {
  Active: { bg: alpha('#10b981', 0.15), color: '#10b981' },
  Draft: { bg: alpha('#f59e0b', 0.15), color: '#f59e0b' },
  Deprecated: { bg: alpha('#ef4444', 0.15), color: '#ef4444' }
}

const PACKAGE_COLORS = {
  professionals: { gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', badge: '#6366f1' },
  teams: { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', badge: '#8b5cf6' },
  enterprise: { gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', badge: '#ec4899' }
}

const STRUCTURE_LABELS = {
  unit: 'Unit Level',
  company: 'Company Level',
  enterprise: 'Enterprise Level'
}

const FEATURE_LABELS = {
  shift_roster: 'Shift Roster',
  bulk_import_export: 'Bulk Import/Export',
  leave_encashment: 'Leave Encashment',
  sandwich_rule: 'Sandwich Rule',
  leave_liability_report: 'Leave Liability Report',
  custom_roles: 'Custom Roles',
  horizontal_delegation: 'Horizontal Delegation',
  delegation_approval_flow: 'Delegation Approval Flow',
  payslip_pdf_download: 'Payslip PDF Download',
  saml_sso: 'SAML SSO',
  ip_allowlisting: 'IP Allowlisting',
  session_activity_log: 'Session Activity Log',
  biometric_integration: 'Biometric Integration',
  bu_site_structure: 'BU Site Structure',
  bu_independent_payroll: 'BU Independent Payroll',
  advanced_reports: 'Advanced Reports',
  feature_gate_matrix: 'Feature Gate Matrix'
}

const fmtPrice = price => price ? `₹${price.toLocaleString('en-IN')}` : 'Custom'

export default function PlansManagement() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)

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

  const handleEdit = plan => {
    setSelectedPlan(plan)
    setEditDrawerOpen(true)
  }

  const handleDeleteClick = plan => {
    setPlanToDelete(plan)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!planToDelete) return
    try {
      await axiosRequest.delete(`/api/v1/plans/${planToDelete._id}`)
      toast.success('Plan deleted successfully')
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
      fetchPlans()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to delete plan')
    }
  }

  const handleToggleStatus = async plan => {
    const newStatus = plan.status === 'Active' ? 'Draft' : 'Active'
    try {
      await axiosRequest.put(`/api/v1/plans/${plan._id}`, { status: newStatus })
      toast.success(`Plan ${newStatus === 'Active' ? 'activated' : 'deactivated'}`)
      fetchPlans()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const activePlans = plans.filter(p => p.status === 'Active' && p.is_public && !p.is_deleted)
  const otherPlans = plans.filter(p => p.status !== 'Active' || !p.is_public)

  return (
    <Box sx={{ p: 5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
            Subscription Plans
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage platform plans, modules, and feature gates
          </Typography>
        </Box>
        <Button
          variant='contained'
          size='large'
          startIcon={<Icon icon='tabler:plus' />}
          onClick={() => setAddDrawerOpen(true)}
          sx={{ px: 4, py: 1.5 }}
        >
          Create Plan
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 4, borderRadius: 1 }} />}

      {/* Active Plans - Pricing Card Style */}
      <Grid container spacing={6} sx={{ mb: 8 }}>
        {activePlans.map(plan => (
          <Grid item xs={12} md={6} lg={4} key={plan._id}>
            <Card
              sx={{
                position: 'relative',
                overflow: 'visible',
                borderRadius: 4,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.16)'
                }
              }}
            >
              {/* Package Type Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -16,
                  left: 24,
                  background: PACKAGE_COLORS[plan.package_type]?.gradient || PACKAGE_COLORS.professionals.gradient,
                  color: 'white',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                {plan.package_type}
              </Box>

              {/* Plan Header with Gradient */}
              <Box
                sx={{
                  background: PACKAGE_COLORS[plan.package_type]?.gradient || PACKAGE_COLORS.professionals.gradient,
                  color: 'white',
                  pt: 8,
                  pb: 6,
                  px: 5,
                  textAlign: 'center'
                }}
              >
                <Typography variant='h4' sx={{ fontWeight: 700, mb: 2 }}>
                  {plan.name}
                </Typography>
                
                <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
                  {plan.price_monthly ? (
                    <>
                      {fmtPrice(plan.price_monthly)}
                      <Typography component='span' variant='body2' sx={{ opacity: 0.8, ml: 1 }}>
                        /month
                      </Typography>
                    </>
                  ) : (
                    'Custom Pricing'
                  )}
                </Typography>

                {plan.price_annual && (
                  <Typography variant='body2' sx={{ opacity: 0.9, mb: 2 }}>
                    or {fmtPrice(plan.price_annual)}/year
                  </Typography>
                )}

                {plan.seat_limit && (
                  <Chip
                    label={`Up to ${plan.seat_limit} seats`}
                    size='small'
                    sx={{
                      mt: 1,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>

              {/* Plan Body */}
              <Box sx={{ p: 5 }}>
                {/* Structure Level */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Icon icon='tabler:building-community' fontSize={20} sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant='body2' color='text.secondary'>
                    {STRUCTURE_LABELS[plan.structure_level] || plan.structure_level}
                  </Typography>
                </Box>

                {/* Status & Visibility */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label={plan.status}
                    size='small'
                    sx={{
                      bgcolor: STATUS_COLORS[plan.status]?.bg || STATUS_COLORS.Active.bg,
                      color: STATUS_COLORS[plan.status]?.color || STATUS_COLORS.Active.color,
                      fontWeight: 600
                    }}
                  />
                  {plan.is_custom && (
                    <Chip label='Custom' size='small' sx={{ bgcolor: 'warning.light', color: 'warning.dark' }} />
                  )}
                  {plan.is_public && (
                    <Chip label='Public' size='small' sx={{ bgcolor: 'success.light', color: 'success.dark' }} />
                  )}
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Modules */}
                <Typography variant='overline' sx={{ color: 'text.secondary', fontWeight: 600, mb: 2, display: 'block' }}>
                  Included Modules ({plan.modules?.length || 0})
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  {plan.modules?.slice(0, 4).map(mod => (
                    <Box key={mod._id} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Icon icon='tabler:check' fontSize={18} sx={{ mr: 2, color: 'success.main' }} />
                      <Typography variant='body2'>{mod.name}</Typography>
                    </Box>
                  ))}
                  {plan.modules?.length > 4 && (
                    <Typography variant='body2' color='primary.main' sx={{ mt: 1, fontWeight: 600 }}>
                      +{plan.modules.length - 4} more modules
                    </Typography>
                  )}
                </Box>

                {/* Features */}
                {plan.features?.length > 0 && (
                  <>
                    <Typography variant='overline' sx={{ color: 'text.secondary', fontWeight: 600, mb: 2, display: 'block' }}>
                      Features ({plan.features.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                      {plan.features.slice(0, 6).map(feature => (
                        <Chip
                          key={feature}
                          label={FEATURE_LABELS[feature] || feature}
                          size='small'
                          variant='outlined'
                          sx={{ fontSize: 11 }}
                        />
                      ))}
                      {plan.features.length > 6 && (
                        <Chip
                          label={`+${plan.features.length - 6} more`}
                          size='small'
                          variant='outlined'
                          color='primary'
                          sx={{ fontSize: 11 }}
                        />
                      )}
                    </Box>
                  </>
                )}

                <Divider sx={{ mb: 4 }} />

                {/* Version & Dates */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, color: 'text.secondary' }}>
                  <Typography variant='caption'>v{plan.version || 1}</Typography>
                  <Typography variant='caption'>
                    Updated: {new Date(plan.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </Typography>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant='contained'
                    fullWidth
                    size='large'
                    startIcon={<Icon icon='tabler:edit' />}
                    onClick={() => handleEdit(plan)}
                    sx={{
                      background: PACKAGE_COLORS[plan.package_type]?.gradient || PACKAGE_COLORS.professionals.gradient,
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    Edit Plan
                  </Button>
                  <IconButton
                    onClick={() => handleToggleStatus(plan)}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <Icon icon={plan.status === 'Active' ? 'tabler:power' : 'tabler:power-off'} />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(plan)}
                    sx={{ border: '1px solid', borderColor: 'error.light', color: 'error.main' }}
                  >
                    <Icon icon='tabler:trash' />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Draft/Internal Plans */}
      {otherPlans.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography variant='h6' sx={{ mb: 4, color: 'text.secondary', fontWeight: 600 }}>
            Draft & Internal Plans
          </Typography>
          <Grid container spacing={4}>
            {otherPlans.map(plan => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={plan._id}>
                <Card sx={{ p: 4, opacity: 0.7, transition: '0.3s', '&:hover': { opacity: 1, boxShadow: 4 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant='h6' sx={{ fontWeight: 600 }}>{plan.name}</Typography>
                    <Chip
                      label={plan.status}
                      size='small'
                      sx={{
                        bgcolor: STATUS_COLORS[plan.status]?.bg,
                        color: STATUS_COLORS[plan.status]?.color
                      }}
                    />
                  </Box>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    {plan.is_public ? 'Public' : 'Internal'} • {plan.modules?.length || 0} modules • {plan.features?.length || 0} features
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size='small'
                      variant='outlined'
                      startIcon={<Icon icon='tabler:edit' />}
                      onClick={() => handleEdit(plan)}
                    >
                      Edit
                    </Button>
                    <Button
                      size='small'
                      color='error'
                      onClick={() => handleDeleteClick(plan)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Drawers */}
      <AddPlanDrawer open={addDrawerOpen} toggle={() => setAddDrawerOpen(!addDrawerOpen)} onSuccess={fetchPlans} />
      <EditPlanDrawer
        open={editDrawerOpen}
        toggle={() => setEditDrawerOpen(!editDrawerOpen)}
        plan={selectedPlan}
        onSuccess={fetchPlans}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth='sm'>
        <DialogTitle sx={{ pb: 2 }}>Delete Plan</DialogTitle>
        <DialogContent>
          <Typography variant='body1' sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>"{planToDelete?.name}"</strong>?
          </Typography>
          <Typography variant='body2' color='error.main'>
            ⚠️ This action cannot be undone. Plans with active subscriptions cannot be deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color='inherit'>
            Cancel
          </Button>
          <Button variant='contained' color='error' onClick={handleConfirmDelete}>
            Delete Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
