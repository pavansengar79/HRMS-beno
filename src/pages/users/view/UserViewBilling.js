// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'

// ** Third Party Imports
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'

const UserViewBilling = ({ employee }) => {
  // ** States
  const subscription = useSelector(state => state.auth.subscription)
  const roleSlug = useSelector(state => state.auth.roleSlug)
  
  // Only org_admin can manage billing/upgrade plans
  const canManageBilling = roleSlug === 'org_admin'

  // Get subscription data
  const currentPlan = subscription || {
    plan_name: 'Enterprise',
    status: 'Trial',
    is_trial: true,
    days_left: 2,
    ends_at: '2026-07-28T19:38:58.256Z',
    structure_level: 'enterprise',
    features: [
      'shift_roster',
      'bulk_import_export',
      'leave_encashment',
      'sandwich_rule',
      'leave_liability_report',
      'biometric_integration',
      'payroll_management',
      'multi_unit_support',
      'advanced_analytics',
      'custom_reports',
      'api_access'
    ]
  }

  // Format dates
  const endDate = currentPlan?.ends_at ? dayjs(currentPlan.ends_at).format('DD MMM YYYY') : 'N/A'
  const daysLeft = currentPlan?.days_left || 0

  // Calculate trial progress
  const totalTrialDays = 14 // Assuming 14-day trial
  const trialProgress = ((totalTrialDays - daysLeft) / totalTrialDays) * 100

  // Feature display names
  const featureNames = {
    shift_roster: 'Shift Roster Management',
    bulk_import_export: 'Bulk Import/Export',
    leave_encashment: 'Leave Encashment',
    sandwich_rule: 'Sandwich Rule',
    leave_liability_report: 'Leave Liability Report',
    biometric_integration: 'Biometric Integration',
    payroll_management: 'Payroll Management',
    multi_unit_support: 'Multi-Unit Support',
    advanced_analytics: 'Advanced Analytics',
    custom_reports: 'Custom Reports',
    api_access: 'API Access'
  }

  return (
    <Grid container spacing={6}>
      {/* Current Plan Card */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Current Plan'
            action={canManageBilling ? (
              <Button 
                variant='contained' 
                size='small'
                startIcon={<Icon icon='tabler:arrow-up' />}
                onClick={() => window.open('/pricing', '_blank')}
              >
                Upgrade Plan
              </Button>
            ) : null}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              {/* Plan Overview */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant='h4' sx={{ fontWeight: 600 }}>
                      {currentPlan.plan_name}
                    </Typography>
                    <CustomChip 
                      skin='light' 
                      size='small'
                      color={currentPlan.status === 'Trial' ? 'warning' : 'success'}
                      label={currentPlan.status}
                    />
                  </Box>
                  
                  <Typography variant='body2' sx={{ color: 'text.secondary', mb: 3 }}>
                    {currentPlan.structure_level.charAt(0).toUpperCase() + currentPlan.structure_level.slice(1)} Level
                  </Typography>

                  {/* Status Badge */}
                  {currentPlan.is_trial && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                        Trial Period Remaining
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <LinearProgress 
                          value={trialProgress} 
                          variant='determinate' 
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          color={daysLeft <= 3 ? 'error' : 'primary'}
                        />
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {daysLeft} days
                        </Typography>
                      </Box>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        Trial ends on {endDate}
                      </Typography>
                    </Box>
                  )}

                  {/* Trial Warning */}
                  {currentPlan.is_trial && daysLeft <= 3 && (
                    <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, mb: 2 }}>
                      <Typography variant='body2' sx={{ color: 'warning.main', fontWeight: 500 }}>
                        ⚠️ Your trial is ending soon! Upgrade now to maintain access to all features.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Plan Details */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>Status</Typography>
                    <CustomChip 
                      skin='light' 
                      size='small'
                      color={currentPlan.status === 'Trial' ? 'warning' : 'success'}
                      label={currentPlan.status}
                    />
                  </Box>

                  {/* Structure Level */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>Structure Level</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {currentPlan.structure_level}
                    </Typography>
                  </Box>

                  {/* Trial Status */}
                  {currentPlan.is_trial && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{ color: 'text.secondary' }}>Days Remaining</Typography>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {daysLeft} days
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{ color: 'text.secondary' }}>End Date</Typography>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {endDate}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Grid>

              {/* Features List */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Typography variant='h6' sx={{ mb: 3 }}>
                  Plan Features
                </Typography>
                <Grid container spacing={2}>
                  {currentPlan.features.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Icon icon='tabler:check' fontSize={20} sx={{ color: 'primary.main' }} />
                        <Typography variant='body2'>
                          {featureNames[feature] || feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Method Card - Only for Admins */}
      {canManageBilling && (
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title='Payment Method'
              action={
                <Button 
                  variant='outlined' 
                  size='small'
                  startIcon={<Icon icon='tabler:plus' />}
                >
                  Add Payment Method
                </Button>
              }
            />
          <Divider />
          <CardContent>
            <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
              <Icon icon='tabler:credit-card' fontSize={60} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant='h6' sx={{ mb: 1 }}>
                No Payment Method Added
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary', mb: 3 }}>
                Add a payment method to upgrade your plan and unlock all features
              </Typography>
              <Button variant='contained' startIcon={<Icon icon='tabler:plus' />}>
                Add Payment Method
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      )}
    </Grid>
  )
}

export default UserViewBilling
