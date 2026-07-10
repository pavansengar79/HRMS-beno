// src/pages/super-admin/plans/EditPlanDrawer.js
// PUT /api/v1/plans/:id
// Complete edit form matching backend schema exactly
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'

import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Switch from '@mui/material/Switch'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { alpha, styled } from '@mui/material/styles'

import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import axiosRequest from 'src/utils/AxiosInterceptor'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between',
}))

const AVAILABLE_MODULES = [
  { _id: '6a44ef75d97f5fdfeaf1d57e', slug: 'employee', name: 'Employee Management', description: 'Employee profiles, lifecycle, designations, documents' },
  { _id: '6a44f1b6d97f5fdfeaf1d668', slug: 'attendance', name: 'Attendance Management', description: 'Check-in/out, biometric, WFH, overtime, reports' },
  { _id: '6a44f1b6d97f5fdfeaf1d66a', slug: 'leave', name: 'Leave Management', description: 'Leave types, policy, approval workflow, balance tracking' },
  { _id: '6a44f1b7d97f5fdfeaf1d66b', slug: 'payroll', name: 'Payroll Management', description: 'Salary structure, pay runs, payslips, TDS/PF/ESI' },
  { _id: '6a44f1b7d97f5fdfeaf1d66c', slug: 'organisation', name: 'Organisation Setup', description: 'Org structure, companies, LOBs, units, departments' },
  { _id: '6a44f1b7d97f5fdfeaf1d66d', slug: 'auth', name: 'Auth and Access Control', description: 'RBAC, roles, permissions, SSO, 2FA, user management' }
]

const AVAILABLE_FEATURES = [
  { key: 'shift_roster', label: 'Shift Roster', category: 'Shift & Roster' },
  { key: 'bulk_import_export', label: 'Bulk Import/Export', category: 'Operations' },
  { key: 'leave_encashment', label: 'Leave Encashment', category: 'Leave' },
  { key: 'sandwich_rule', label: 'Sandwich Rule', category: 'Leave' },
  { key: 'leave_liability_report', label: 'Leave Liability Report', category: 'Reports' },
  { key: 'custom_roles', label: 'Custom Roles', category: 'Access Control' },
  { key: 'horizontal_delegation', label: 'Horizontal Delegation', category: 'Delegation' },
  { key: 'delegation_approval_flow', label: 'Delegation Approval Flow', category: 'Delegation' },
  { key: 'payslip_pdf_download', label: 'Payslip PDF Download', category: 'Payroll' },
  { key: 'saml_sso', label: 'SAML SSO', category: 'Security' },
  { key: 'ip_allowlisting', label: 'IP Allowlisting', category: 'Security' },
  { key: 'session_activity_log', label: 'Session Activity Log', category: 'Security' },
  { key: 'biometric_integration', label: 'Biometric Integration', category: 'Integrations' },
  { key: 'bu_site_structure', label: 'BU Site Structure', category: 'Organization' },
  { key: 'bu_independent_payroll', label: 'BU Independent Payroll', category: 'Organization' },
  { key: 'advanced_reports', label: 'Advanced Reports', category: 'Reports' },
  { key: 'feature_gate_matrix', label: 'Feature Gate Matrix', category: 'Admin' }
]

export default function EditPlanDrawer({ open, toggle, plan, onSuccess }) {
  const { control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm()

  const selectedFeatures = watch('features', [])
  const selectedModules = watch('modules', [])
  
  // Debug log
  useEffect(() => {
    if (open && plan) {
      console.log('EditPlanDrawer - plan modules:', plan.modules)
      console.log('EditPlanDrawer - selected modules:', selectedModules)
    }
  }, [open, plan, selectedModules])

  const handleModuleToggle = (moduleId) => {
    const currentModules = selectedModules || []
    if (currentModules.includes(moduleId)) {
      setValue('modules', currentModules.filter(id => id !== moduleId))
    } else {
      setValue('modules', [...currentModules, moduleId])
    }
  }

  useEffect(() => {
    if (plan && open) {
      reset({
        name: plan.name || '',
        package_type: plan.package_type || 'professionals',
        structure_level: plan.structure_level || 'unit',
        price_monthly: plan.price_monthly || '',
        price_annual: plan.price_annual || '',
        seat_limit: plan.seat_limit || '',
        features: plan.features || [],
        status: plan.status || 'Draft',
        is_custom: plan.is_custom || false,
        is_public: plan.is_public !== false,
        modules: plan.modules?.map(m => m._id || m) || []
      })
    }
  }, [plan, open, reset])

  const handleFeatureToggle = (featureKey) => {
    const currentFeatures = selectedFeatures || []
    if (currentFeatures.includes(featureKey)) {
      setValue('features', currentFeatures.filter(f => f !== featureKey))
    } else {
      setValue('features', [...currentFeatures, featureKey])
    }
  }

  const onSubmit = async (data) => {
    if (!plan?._id) return

    try {
      const payload = {
        name: data.name,
        package_type: data.package_type,
        structure_level: data.structure_level,
        price_monthly: data.price_monthly ? Number(data.price_monthly) : null,
        price_annual: data.price_annual ? Number(data.price_annual) : null,
        seat_limit: data.seat_limit ? Number(data.seat_limit) : null,
        modules: data.modules || [],
        features: data.features || [],
        status: data.status,
        is_custom: data.is_custom || false,
        is_public: data.is_public !== false
      }
      
      await axiosRequest.put(`/api/v1/plans/${plan._id}`, payload)
      toast.success('Plan updated successfully! Module changes will cascade to all subscribed organisations.')
      reset()
      toggle()
      if (onSuccess) onSuccess()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to update plan')
    }
  }

  const handleClose = () => {
    reset()
    toggle()
  }

  if (!plan) return null

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 600 } } }}
    >
      <Header>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 700 }}>Edit Plan</Typography>
          <Typography variant='caption' color='text.secondary'>ID: {plan._id}</Typography>
        </Box>
        <IconButton size='small' onClick={handleClose} sx={{ borderRadius: 1, color: 'text.primary', backgroundColor: 'action.selected' }}>
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>

      <Box sx={{ p: 6, pt: 0 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Alert severity='warning' sx={{ fontSize: 12 }}>
              Changes will sync to all subscribed organisations immediately. Feature removals will deactivate OrgModule records.
            </Alert>

            {/* Basic Information */}
            <Box>
              <Typography variant='subtitle2' sx={{ mb: 3, fontWeight: 700, textTransform: 'uppercase', fontSize: 11, color: 'text.secondary' }}>
                Basic Information
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Controller name='name' control={control}
                    rules={{ required: 'Plan name is required' }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Plan Name *'
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name='package_type' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth select label='Package Type'>
                        <MenuItem value='professionals'>Professionals</MenuItem>
                        <MenuItem value='teams'>Teams</MenuItem>
                        <MenuItem value='enterprise'>Enterprise</MenuItem>
                      </CustomTextField>
                    )} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name='structure_level' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth select label='Structure Level'>
                        <MenuItem value='unit'>Unit Level</MenuItem>
                        <MenuItem value='company'>Company Level</MenuItem>
                        <MenuItem value='enterprise'>Enterprise Level</MenuItem>
                      </CustomTextField>
                    )} />
                </Grid>

                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Controller name='is_custom' control={control} render={({ field }) => <Switch {...field} checked={field.value} />} />}
                    label={<Typography variant='body2'>Custom Plan</Typography>}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Controller name='is_public' control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value !== false} />}
                        label={<Typography variant='body2'>Public Plan</Typography>}
                      />
                    )} />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Pricing */}
            <Box>
              <Typography variant='subtitle2' sx={{ mb: 3, fontWeight: 700, textTransform: 'uppercase', fontSize: 11, color: 'text.secondary' }}>
                Pricing & Limits
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Controller name='price_monthly' control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Monthly Price (₹)'
                        helperText='Leave empty for custom pricing'
                      />
                    )} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name='price_annual' control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Annual Price (₹)'
                        helperText='Usually 20% discount from monthly'
                      />
                    )} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name='seat_limit' control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Seat Limit'
                        helperText='Leave empty for unlimited'
                      />
                    )} />
                </Grid>

                <Grid item xs={6}>
                  <Controller name='status' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth select label='Status'>
                        <MenuItem value='Draft'>Draft</MenuItem>
                        <MenuItem value='Active'>Active</MenuItem>
                        <MenuItem value='Deprecated'>Deprecated</MenuItem>
                      </CustomTextField>
                    )} />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Modules (Editable) */}
            <Box>
              <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase', fontSize: 11, color: 'text.secondary' }}>
                Modules ({selectedModules?.length || 0} selected)
              </Typography>
              
              <Alert severity='warning' sx={{ mb: 2, fontSize: 11 }}>
                ⚠️ WARNING: Removing modules will disable them for ALL organisations subscribed to this plan. Users will immediately lose access to functionality.
              </Alert>
              
              <Grid container spacing={2}>
                {AVAILABLE_MODULES.map((module) => {
                  const isSelected = selectedModules?.includes(module._id)
                  return (
                    <Grid item xs={12} sm={6} key={module._id}>
                      <Box
                        onClick={() => handleModuleToggle(module._id)}
                        sx={{
                          p: 2,
                          border: '2px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          borderRadius: 2,
                          cursor: 'pointer',
                          bgcolor: isSelected ? alpha('#6366f1', 0.05) : 'background.paper',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: alpha('#6366f1', 0.08)
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Checkbox
                            checked={isSelected || false}
                            size='small'
                            sx={{ p: 0 }}
                          />
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {module.name}
                          </Typography>
                        </Box>
                        <Typography variant='caption' color='text.secondary' sx={{ ml: 4 }}>
                          {module.description}
                        </Typography>
                      </Box>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>

            <Divider />

            {/* Features */}
            <Box>
              <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase', fontSize: 11, color: 'text.secondary' }}>
                Feature Gates ({selectedFeatures?.length || 0} selected)
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {AVAILABLE_FEATURES.map((feature) => {
                  const isSelected = selectedFeatures?.includes(feature.key)
                  return (
                    <Chip
                      key={feature.key}
                      label={feature.label}
                      onClick={() => handleFeatureToggle(feature.key)}
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      sx={{ cursor: 'pointer', fontSize: 11 }}
                    />
                  )
                })}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button variant='outlined' onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant='contained' type='submit' disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} /> : null}>
                Update Plan
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}
