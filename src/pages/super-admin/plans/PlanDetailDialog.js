// src/pages/super-admin/plans/PlanDetailDialog.js
// Rich Plan Details Dialog - Comprehensive view of all plan fields
import { Box, Typography, Chip, Divider, Grid, Card, CardContent, IconButton, Button } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { alpha } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'

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

const PACKAGE_TYPE_COLORS = {
  professionals: { color: '#6366f1', label: 'Professionals' },
  teams: { color: '#8b5cf6', label: 'Teams' },
  enterprise: { color: '#ec4899', label: 'Enterprise' }
}

const STRUCTURE_LEVEL_LABELS = {
  unit: 'Unit Level',
  company: 'Company Level',
  enterprise: 'Enterprise Level'
}

const STATUS_COLORS = {
  Active: { bg: alpha('#10b981', 0.1), color: '#10b981' },
  Draft: { bg: alpha('#f59e0b', 0.1), color: '#f59e0b' },
  Deprecated: { bg: alpha('#ef4444', 0.1), color: '#ef4444' }
}

export default function PlanDetailDialog({ open, onClose, plan }) {
  if (!plan) return null

  const pc = PACKAGE_TYPE_COLORS[plan.package_type] || PACKAGE_TYPE_COLORS.professionals
  const sc = STATUS_COLORS[plan.status] || STATUS_COLORS.Draft

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: alpha(pc.color, 0.12), color: pc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>
            {plan.name?.charAt(0).toUpperCase()}
          </Box>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              {plan.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip
                label={pc.label}
                size='small'
                sx={{ bgcolor: alpha(pc.color, 0.1), color: pc.color, fontWeight: 600, fontSize: 11 }}
              />
              <Chip
                label={plan.status}
                size='small'
                sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: 11 }}
              />
              {plan.is_custom && <Chip label='Custom' size='small' color='warning' sx={{ height: 20, fontSize: 10 }} />}
              {plan.is_public ? (
                <Chip label='Public' size='small' color='success' sx={{ height: 20, fontSize: 10 }} />
              ) : (
                <Chip label='Private' size='small' color='default' sx={{ height: 20, fontSize: 10 }} />
              )}
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <Icon icon='tabler:x' />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Basic Information */}
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='subtitle2' sx={{ mb: 2, textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700 }}>
                Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary' display='block'>Plan ID</Typography>
                  <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: 11 }}>{plan._id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary' display='block'>Version</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>v{plan.version || 1}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary' display='block'>Package Type</Typography>
                  <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>{plan.package_type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='caption' color='text.secondary' display='block'>Structure Level</Typography>
                  <Typography variant='body2'>{STRUCTURE_LEVEL_LABELS[plan.structure_level] || plan.structure_level}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='caption' color='text.secondary' display='block'>Created At</Typography>
                  <Typography variant='body2'>
                    {new Date(plan.createdAt).toLocaleString('en-IN', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Pricing & Limits */}
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='subtitle2' sx={{ mb: 2, textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700 }}>
                Pricing & Limits
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <Box sx={{ p: 2, bgcolor: alpha('#10b981', 0.05), borderRadius: 1 }}>
                    <Typography variant='caption' color='text.secondary' display='block'>Monthly Price</Typography>
                    <Typography variant='h5' sx={{ fontWeight: 700, color: 'primary.main', mt: 1 }}>
                      {plan.price_monthly !== null ? `₹${plan.price_monthly.toLocaleString('en-IN')}` : 'Custom'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 2, bgcolor: alpha('#8b5cf6', 0.05), borderRadius: 1 }}>
                    <Typography variant='caption' color='text.secondary' display='block'>Annual Price</Typography>
                    <Typography variant='h5' sx={{ fontWeight: 700, color: 'primary.main', mt: 1 }}>
                      {plan.price_annual !== null ? `₹${plan.price_annual.toLocaleString('en-IN')}` : 'Custom'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 2, bgcolor: alpha('#f59e0b', 0.05), borderRadius: 1 }}>
                    <Typography variant='caption' color='text.secondary' display='block'>Seat Limit</Typography>
                    <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary', mt: 1 }}>
                      {plan.seat_limit !== null ? plan.seat_limit : '∞'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {plan.seat_limit !== null ? 'seats' : 'Unlimited'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Modules */}
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='subtitle2' sx={{ mb: 2, textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700 }}>
                Modules ({plan.modules?.length || 0})
              </Typography>
              <Grid container spacing={2}>
                {(plan.modules || []).map((module, idx) => (
                  <Grid item xs={6} key={idx}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Icon icon='tabler:box' fontSize={18} color='#6366f1' />
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {module.name}
                        </Typography>
                      </Box>
                      <Typography variant='caption' color='text.secondary' display='block'>
                        {module.description}
                      </Typography>
                      <Chip
                        label={module.slug}
                        size='small'
                        sx={{ mt: 1, fontSize: 10, height: 18, fontFamily: 'monospace' }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Features */}
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='subtitle2' sx={{ mb: 2, textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700 }}>
                Feature Gates ({plan.features?.length || 0})
              </Typography>
              {plan.features && plan.features.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {plan.features.map((feature, idx) => (
                    <Chip
                      key={idx}
                      label={FEATURE_LABELS[feature] || feature}
                      size='small'
                      color='primary'
                      variant='outlined'
                      sx={{ fontSize: 11, fontWeight: 600 }}
                    />
                  ))}
                </Box>
              ) : (
                <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
                  <Icon icon='tabler:info-circle' fontSize={24} color='#94a3b8' />
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                    No feature gates enabled for this plan
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='subtitle2' sx={{ mb: 2, textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700 }}>
                Metadata
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon={plan.is_deleted ? 'tabler:trash' : 'tabler:check'} fontSize={18} color={plan.is_deleted ? '#ef4444' : '#10b981'} />
                    <Typography variant='body2'>
                      {plan.is_deleted ? 'Deleted' : 'Active'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon={plan.is_public ? 'tabler:world' : 'tabler:lock'} fontSize={18} color={plan.is_public ? '#10b981' : '#94a3b8'} />
                    <Typography variant='body2'>
                      {plan.is_public ? 'Public Plan' : 'Private Plan'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon={plan.is_custom ? 'tabler:star' : 'tabler:package'} fontSize={18} color={plan.is_custom ? '#f59e0b' : '#6366f1'} />
                    <Typography variant='body2'>
                      {plan.is_custom ? 'Custom Plan' : 'Standard Plan'}
                    </Typography>
                  </Box>
                </Grid>
                {plan.created_by && (
                  <Grid item xs={12}>
                    <Typography variant='caption' color='text.secondary' display='block'>Created By</Typography>
                    <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: 11 }}>{plan.created_by}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 6, py: 3 }}>
        <Button onClick={onClose} color='secondary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
