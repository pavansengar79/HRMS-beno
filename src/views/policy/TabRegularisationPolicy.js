// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Drawer from '@mui/material/Drawer'
import Skeleton from '@mui/material/Skeleton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Menu from '@mui/material/Menu'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { selectRoleSlug } from 'src/store/auth/authSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_FOR_OPTIONS = [
  { value: 'late', label: 'Late Arrival' },
  { value: 'absent', label: 'Absent' },
  { value: 'missed_punch', label: 'Missed Punch' },
  { value: 'early_exit', label: 'Early Exit' }
]

const APPROVAL_FLOW_OPTIONS = [
  { value: 'L1_ONLY', label: 'L1 Only - Reporting Manager' },
  { value: 'L2_ONLY', label: 'L2 Only - HR Manager (Default)' },
  { value: 'L1_L2', label: 'L1 + L2 - Both Manager & HR' },
  { value: 'AUTO', label: 'Auto - Instant Approval' }
]

const EMPLOYEE_TYPES = ['full_time', 'part_time', 'contract', 'intern']

const STATUS_CONFIG = {
  active: { color: 'success', icon: 'tabler:circle-check', label: 'Active' },
  inactive: { color: 'warning', icon: 'tabler:circle-pause', label: 'Inactive' },
  draft: { color: 'default', icon: 'tabler:file-description', label: 'Draft' }
}

const defaultValues = {
  name: '',
  description: '',
  enabled: true,
  isDefault: false,
  allowedFor: ['late', 'absent', 'missed_punch'],
  maxRequestsPerMonth: 3,
  requestWindow: { pastDaysAllowed: 30, futureAllowed: false },
  approvalFlow: 'L2_ONLY',
  autoApproval: { enabled: false, conditions: [] },
  autoRejectAfterDays: 7,
  documentRequired: {
    enabled: false,
    forTypes: [],
    maxSizeMB: 5,
    allowedFormats: ['pdf', 'jpg', 'jpeg', 'png']
  },
  escalation: {
    enabled: false,
    afterDays: 3,
    escalateTo: 'l2'
  },
  applicableFor: {
    departments: [],
    designations: [],
    roles: [],
    employeeTypes: []
  },
  status: 'active',
  effectiveFrom: null,
  effectiveTill: null
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmColor = 'primary', loading = false }) => (
  <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{message}</DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3 }}>
      <Button variant='tonal' color='secondary' onClick={onClose} disabled={loading}>Cancel</Button>
      <Button variant='contained' color={confirmColor} onClick={onConfirm} disabled={loading}
        startIcon={loading ? <CircularProgress size={16} color='inherit' /> : null}
      >
        {loading ? 'Please wait...' : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
)

// ─── Status Chip ─────────────────────────────────────────────────────────────

const StatusChip = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return (
    <Chip
      icon={<Icon icon={cfg.icon} fontSize='0.75rem' />}
      label={cfg.label}
      size='small'
      color={cfg.color}
      variant='tonal'
      sx={{ '& .MuiChip-icon': { ml: 1 } }}
    />
  )
}

// ─── Hook to fetch dropdown options ───────────────────────────────────────────

const useApplicabilityOptions = () => {
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true)
        const [deptRes, desigRes, roleRes] = await Promise.all([
          axiosRequest.get('/api/v1/departments'),
          axiosRequest.get('/api/v1/designations'),
          axiosRequest.get('/api/v1/roles')
        ])
        setDepartments(deptRes?.data || [])
        setDesignations(desigRes?.data || [])
        setRoles(roleRes?.data || [])
      } catch (err) {
        console.error('Failed to load applicability options:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOptions()
  }, [])

  return { departments, designations, roles, loading }
}

// ─── Applicability Section ───────────────────────────────────────────────────

const ApplicabilitySection = ({ control, watch }) => {
  const { departments, designations, roles, loading } = useApplicabilityOptions()

  return (
    <Box>
      <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
        Applicability
      </Typography>
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 2 }}>
        Leave empty for all. Priority: Role {'>'} Department {'>'} Designation {'>'} Employee Type
      </Typography>

      <Grid container spacing={4}>
        {/* Departments */}
        <Grid item xs={12} sm={6}>
          <Typography variant='body2' fontWeight={500} sx={{ mb: 1 }}>Departments</Typography>
          <Controller name='applicableFor.departments' control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                size='small'
                loading={loading}
                options={departments}
                getOptionLabel={option => option.name || ''}
                isOptionEqualToValue={(option, value) => option._id === value._id || option.id === value.id}
                value={field.value || []}
                onChange={(_, newValue) => field.onChange(newValue)}
                renderInput={params => <TextField {...params} placeholder='Select departments' />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option._id || option}
                      label={option.name || option}
                      size='small'
                      variant='tonal'
                      color='primary'
                    />
                  ))
                }
              />
            )}
          />
          <Typography variant='caption' color='text.secondary'>Target specific departments</Typography>
        </Grid>

        {/* Designations */}
        <Grid item xs={12} sm={6}>
          <Typography variant='body2' fontWeight={500} sx={{ mb: 1 }}>Designations</Typography>
          <Controller name='applicableFor.designations' control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                size='small'
                loading={loading}
                options={designations}
                getOptionLabel={option => option?.name || (typeof option === 'string' ? option : '') || ''}
                isOptionEqualToValue={(option, value) => {
                  const optionId = option?._id || option?.id || option
                  const valueId = value?._id || value?.id || value
                  return optionId === valueId
                }}
                value={field.value || []}
                onChange={(_, newValue) => field.onChange(newValue)}
                renderInput={params => <TextField {...params} placeholder='Select designations' />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option?._id || option?.id || option || index}
                      label={option?.name || option}
                      size='small'
                      variant='tonal'
                      color='warning'
                    />
                  ))
                }
              />
            )}
          />
          <Typography variant='caption' color='text.secondary'>Target specific job titles</Typography>
        </Grid>

        {/* Roles */}
        <Grid item xs={12} sm={6}>
          <Typography variant='body2' fontWeight={500} sx={{ mb: 1 }}>Roles</Typography>
          <Controller name='applicableFor.roles' control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                size='small'
                loading={loading}
                options={roles}
                getOptionLabel={option => option?.name || option?.slug || ''}
                isOptionEqualToValue={(option, value) => {
                  const optionId = option?._id || option?.id || option?.slug
                  const valueId = value?._id || value?.id || value?.slug || value
                  return optionId === valueId
                }}
                value={field.value || []}
                onChange={(_, newValue) => field.onChange(newValue)}
                renderInput={params => <TextField {...params} placeholder='Select roles' />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option?._id || option?.id || option?.slug || option || index}
                      label={option?.name || option?.slug || option}
                      size='small'
                      variant='tonal'
                      color='secondary'
                    />
                  ))
                }
              />
            )}
          />
          <Typography variant='caption' color='text.secondary'>Target specific roles</Typography>
        </Grid>

        {/* Employee Types */}
        <Grid item xs={12} sm={6}>
          <Typography variant='body2' fontWeight={500} sx={{ mb: 1 }}>Employee Types</Typography>
          <Controller name='applicableFor.employeeTypes' control={control}
            render={({ field }) => (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {EMPLOYEE_TYPES.map(type => {
                  const checked = field.value?.includes(type)
                  return (
                    <Chip key={type} label={type.replace('_', ' ')} clickable size='small'
                      color={checked ? 'primary' : 'default'}
                      variant={checked ? 'filled' : 'outlined'}
                      onClick={() => {
                        const cur = field.value || []
                        field.onChange(checked ? cur.filter(t => t !== type) : [...cur, type])
                      }}
                    />
                  )
                })}
              </Box>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

// ─── Regularisation Policy Drawer ────────────────────────────────────────────

const RegularisationPolicyDrawer = ({ open, onClose, editData, onSuccess }) => {
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(editData?._id)

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues })

  const enabled = watch('enabled')
  const autoApprovalEnabled = watch('autoApproval.enabled')
  const docRequired = watch('documentRequired.enabled')
  const escalationEnabled = watch('escalation.enabled')

  useEffect(() => {
    if (open) {
      if (editData) {
        reset({
          ...defaultValues,
          ...editData,
          requestWindow: editData.requestWindow || defaultValues.requestWindow,
          autoApproval: editData.autoApproval || defaultValues.autoApproval,
          documentRequired: editData.documentRequired || defaultValues.documentRequired,
          escalation: editData.escalation || defaultValues.escalation,
          applicableFor: {
            departments: editData.applicableFor?.departments || [],
            designations: editData.applicableFor?.designations || [],
            roles: editData.applicableFor?.roles || [],
            employeeTypes: editData.applicableFor?.employeeTypes || []
          }
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [open, editData, reset])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        maxRequestsPerMonth: Number(data.maxRequestsPerMonth),
        autoRejectAfterDays: Number(data.autoRejectAfterDays),
        requestWindow: {
          pastDaysAllowed: Number(data.requestWindow.pastDaysAllowed),
          futureAllowed: data.requestWindow.futureAllowed
        },
        documentRequired: {
          ...data.documentRequired,
          maxSizeMB: Number(data.documentRequired.maxSizeMB)
        },
        escalation: {
          ...data.escalation,
          afterDays: Number(data.escalation.afterDays)
        },
        applicableFor: {
          departments: (data.applicableFor?.departments || []).map(d => d._id || d.id || d),
          designations: (data.applicableFor?.designations || []).map(d => d._id || d.id || d),
          roles: (data.applicableFor?.roles || []).map(r => r._id || r.id || r.slug || r),
          employeeTypes: data.applicableFor?.employeeTypes || []
        }
      }

      const res = isEdit
        ? await axiosRequest.put(`/api/v1/regularisation/policies/${editData._id}`, payload)
        : await axiosRequest.post('/api/v1/regularisation/policies', payload)

      if (res?.success || res?.data?.success) {
        toast.success(`Regularisation policy ${isEdit ? 'updated' : 'created'}`)
        onSuccess(res?.data || res, isEdit)
        onClose()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer open={open} anchor='right' onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 700 } } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 5, py: 4, borderBottom: t => `1px solid ${t.palette.divider}` }}>
        <Box>
          <Typography variant='h6'>{isEdit ? 'Edit Regularisation Policy' : 'New Regularisation Policy'}</Typography>
          <Typography variant='caption' color='text.secondary'>Configure regularisation rules and approval workflow</Typography>
        </Box>
        <IconButton onClick={onClose} size='small'><Icon icon='tabler:x' /></IconButton>
      </Box>

      <Box component='form' onSubmit={handleSubmit(onSubmit)}
        sx={{ px: 5, py: 4, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}
      >
        {/* Policy Details */}
        <Box>
          <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Policy Details</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Controller name='name' control={control} rules={{ required: 'Name required' }}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Policy Name *' error={!!errors.name} helperText={errors.name?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name='status' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select fullWidth label='Status'>
                    <MenuItem value='active'>Active</MenuItem>
                    <MenuItem value='inactive'>Inactive</MenuItem>
                    <MenuItem value='draft'>Draft</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller name='description' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth multiline rows={2} label='Description' />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name='enabled' control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable Policy' />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name='isDefault' control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Set as Default' />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name='effectiveFrom' control={control}
                render={({ field }) => (
                  <CustomTextField 
                    {...field}
                    fullWidth
                    type='date'
                    label='Effective From'
                    InputLabelProps={{ shrink: true }}
                    value={field.value ? field.value.split('T')[0] : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller name='effectiveTill' control={control}
                render={({ field }) => (
                  <CustomTextField 
                    {...field}
                    fullWidth
                    type='date'
                    label='Effective Till'
                    InputLabelProps={{ shrink: true }}
                    value={field.value ? field.value.split('T')[0] : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        {enabled && (
          <>
            <Divider />
            <ApplicabilitySection control={control} watch={watch} />
            <Divider />

            {/* Allowed For */}
            <Box>
              <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 2 }}>Allowed Regularisation Types</Typography>
              <Controller name='allowedFor' control={control}
                render={({ field }) => (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {ALLOWED_FOR_OPTIONS.map(opt => {
                      const checked = field.value?.includes(opt.value)
                      return (
                        <Chip key={opt.value} label={opt.label} clickable size='small'
                          color={checked ? 'primary' : 'default'}
                          variant={checked ? 'filled' : 'outlined'}
                          onClick={() => {
                            const cur = field.value || []
                            field.onChange(checked ? cur.filter(v => v !== opt.value) : [...cur, opt.value])
                          }}
                        />
                      )
                    })}
                  </Box>
                )}
              />
            </Box>

            <Divider />

            {/* Request Limits */}
            <Box>
              <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Request Limits & Window</Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Controller name='maxRequestsPerMonth' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth type='number' label='Max Requests / Month'
                        helperText='How many regularisations allowed per month' inputProps={{ min: 1, max: 31 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller name='autoRejectAfterDays' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth type='number' label='Auto Reject After (days)'
                        helperText='Pending requests older than N days auto-rejected' inputProps={{ min: 1, max: 30 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller name='requestWindow.pastDaysAllowed' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth type='number' label='Past Days Allowed'
                        helperText='How many days back can employee regularize (1-90)' inputProps={{ min: 1, max: 90 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller name='requestWindow.futureAllowed' control={control}
                    render={({ field }) => (
                      <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Allow Future Dates' />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Approval Flow */}
            <Box>
              <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Approval Flow</Typography>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Controller name='approvalFlow' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} select fullWidth label='Approval Flow'>
                        {APPROVAL_FLOW_OPTIONS.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </CustomTextField>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Auto Approval */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='overline' color='text.secondary'>Auto Approval</Typography>
                <Controller name='autoApproval.enabled' control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable' labelPlacement='start' />
                  )}
                />
              </Box>
              {autoApprovalEnabled && (
                <Alert severity='info'>Auto approval conditions can be configured after policy creation.</Alert>
              )}
            </Box>

            <Divider />

            {/* Document Requirements */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant='overline' color='text.secondary'>Document Requirements</Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>Require documents for specific types</Typography>
                </Box>
                <Controller name='documentRequired.enabled' control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable' labelPlacement='start' />
                  )}
                />
              </Box>
              {docRequired && (
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <Typography variant='body2' fontWeight={500} sx={{ mb: 1 }}>Require document for:</Typography>
                    <Controller name='documentRequired.forTypes' control={control}
                      render={({ field }) => (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {ALLOWED_FOR_OPTIONS.map(opt => {
                            const checked = field.value?.includes(opt.value)
                            return (
                              <Chip key={opt.value} label={opt.label} clickable size='small'
                                color={checked ? 'primary' : 'default'}
                                variant={checked ? 'filled' : 'outlined'}
                                onClick={() => {
                                  const cur = field.value || []
                                  field.onChange(checked ? cur.filter(v => v !== opt.value) : [...cur, opt.value])
                                }}
                              />
                            )
                          })}
                        </Box>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name='documentRequired.maxSizeMB' control={control}
                      render={({ field }) => (
                        <CustomTextField {...field} fullWidth type='number' label='Max File Size (MB)' inputProps={{ min: 1, max: 20 }} />
                      )}
                    />
                  </Grid>
                </Grid>
              )}
            </Box>

            <Divider />

            {/* Escalation */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant='overline' color='text.secondary'>Escalation</Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>Escalate pending requests after N days</Typography>
                </Box>
                <Controller name='escalation.enabled' control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable' labelPlacement='start' />
                  )}
                />
              </Box>
              {escalationEnabled && (
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Controller name='escalation.afterDays' control={control}
                      render={({ field }) => (
                        <CustomTextField {...field} fullWidth type='number' label='Escalate After (days)' inputProps={{ min: 1, max: 14 }} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name='escalation.escalateTo' control={control}
                      render={({ field }) => (
                        <CustomTextField {...field} select fullWidth label='Escalate To'>
                          <MenuItem value='l2'>L2 - HR Manager</MenuItem>
                          <MenuItem value='unit_admin'>Unit Admin</MenuItem>
                          <MenuItem value='company_admin'>Company Admin</MenuItem>
                        </CustomTextField>
                      )}
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          </>
        )}

        {/* Footer */}
        <Box sx={{ mt: 'auto', pt: 4, display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
          <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type='submit' variant='contained' disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {saving ? 'Saving...' : isEdit ? 'Update Policy' : 'Create Policy'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

// ─── Policy Actions Menu ──────────────────────────────────────────────────────

const PolicyActionsMenu = ({ policy, onEdit, onToggle, onDelete, actionLoading }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const isLoading = actionLoading === policy._id

  const close = () => setAnchorEl(null)
  const handle = fn => () => { close(); fn(policy) }

  return (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)} disabled={isLoading}>
        {isLoading ? <CircularProgress size={16} /> : <Icon icon='tabler:dots-vertical' fontSize='1.1rem' />}
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handle(onEdit)}>
          <ListItemIcon><Icon icon='tabler:pencil' fontSize='1rem' /></ListItemIcon>
          <ListItemText>Edit Policy</ListItemText>
        </MenuItem>
        <MenuItem onClick={handle(onToggle)}>
          <ListItemIcon>
            <Icon icon={policy.enabled ? 'tabler:circle-pause' : 'tabler:circle-check'} fontSize='1rem' 
              style={{ color: policy.enabled ? '#F59E0B' : '#10B981' }} 
            />
          </ListItemIcon>
          <ListItemText>{policy.enabled ? 'Deactivate' : 'Activate'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handle(onDelete)} sx={{ color: 'error.main' }}>
          <ListItemIcon><Icon icon='tabler:trash' fontSize='1rem' style={{ color: 'inherit' }} /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

// ─── Policy Detail Row ─────────────────────────────────────────────────────────

const PolicyDetailRow = ({ policy }) => {
  // Fetch options for name lookup
  const { departments: allDepartments, designations: allDesignations, roles: allRoles } = useApplicabilityOptions()
  
  // Helper to get department name from ID
  const getDepartmentName = (idOrObj) => {
    if (typeof idOrObj === 'object' && idOrObj !== null) return idOrObj.name
    const dept = allDepartments.find(d => d._id === idOrObj || d.id === idOrObj)
    return dept?.name || idOrObj
  }
  
  // Helper to get designation name from ID
  const getDesignationName = (idOrObj) => {
    if (typeof idOrObj === 'object' && idOrObj !== null) return idOrObj.name
    const desig = allDesignations.find(d => d._id === idOrObj || d.id === idOrObj)
    return desig?.name || idOrObj
  }
  
  // Helper to get role name from ID or slug
  const getRoleName = (idOrSlugOrObj) => {
    if (typeof idOrSlugOrObj === 'object' && idOrSlugOrObj !== null) return idOrSlugOrObj.name || idOrSlugOrObj.slug
    const role = allRoles.find(r => r._id === idOrSlugOrObj || r.id === idOrSlugOrObj || r.slug === idOrSlugOrObj)
    return role?.name || role?.slug || idOrSlugOrObj
  }
  
  const rows = [
    { label: 'Allowed For', value: policy.allowedFor?.map(t => t.replace('_', ' ')).join(', ') || '—' },
    { label: 'Request Limit', value: `${policy.maxRequestsPerMonth || 0}/month · ${policy.requestWindow?.pastDaysAllowed || 30} days back` },
    { label: 'Auto Reject', value: policy.autoRejectAfterDays ? `${policy.autoRejectAfterDays} days` : 'Disabled' },
    { label: 'Approval Flow', value: policy.approvalFlow || '—' },
    { label: 'Auto Approval', value: policy.autoApproval?.enabled ? 'Enabled' : 'Disabled' },
    { label: 'Documents', value: policy.documentRequired?.enabled 
      ? `Required for: ${policy.documentRequired.forTypes?.join(', ') || 'N/A'}` 
      : 'Not required' 
    },
    { label: 'Escalation', value: policy.escalation?.enabled 
      ? `After ${policy.escalation.afterDays} days to ${policy.escalation.escalateTo}` 
      : 'Disabled' 
    },
    { label: 'Effective', value: policy.effectiveFrom 
      ? `${new Date(policy.effectiveFrom).toLocaleDateString()} - ${policy.effectiveTill ? new Date(policy.effectiveTill).toLocaleDateString() : 'Ongoing'}` 
      : 'Immediately'
    }
  ]

  return (
    <Box sx={{ py: 2, px: 5, bgcolor: t => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
      <Grid container spacing={2}>
        {rows.map(r => (
          <Grid item xs={12} sm={6} md={3} key={r.label}>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>{r.label}</Typography>
            <Typography variant='body2'>{r.value}</Typography>
          </Grid>
        ))}
      </Grid>
      
      {/* Applicability Chips */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant='caption' color='text.secondary' sx={{ mr: 1 }}>Applies to:</Typography>
        {policy.applicableFor?.roles?.length > 0 && policy.applicableFor.roles.map(r => (
          <Chip key={typeof r === 'object' ? r._id : r} label={getRoleName(r)} size='small' variant='tonal' color='secondary'
            icon={<Icon icon='tabler:user-check' fontSize='0.75rem' />}
          />
        ))}
        {policy.applicableFor?.departments?.length > 0 && (
          <Chip label={`${policy.applicableFor.departments.length} dept${policy.applicableFor.departments.length > 1 ? 's' : ''}`}
            size='small' variant='tonal' color='primary'
            icon={<Icon icon='tabler:building' fontSize='0.75rem' />}
          />
        )}
        {policy.applicableFor?.designations?.length > 0 && (
          <Chip label={`${policy.applicableFor.designations.length} designation${policy.applicableFor.designations.length > 1 ? 's' : ''}`}
            size='small' variant='tonal' color='warning'
            icon={<Icon icon='tabler:briefcase' fontSize='0.75rem' />}
          />
        )}
        {policy.applicableFor?.employeeTypes?.length > 0 && policy.applicableFor.employeeTypes.map(t => (
          <Chip key={t} label={t.replace('_', ' ')} size='small' variant='tonal' color='info' />
        ))}
        {!policy.applicableFor?.roles?.length &&
          !policy.applicableFor?.departments?.length &&
          !policy.applicableFor?.designations?.length &&
          !policy.applicableFor?.employeeTypes?.length && (
            <Chip label='All Employees' size='small' variant='tonal' color='default' />
          )
        }
      </Box>
    </Box>
  )
}

// ─── TabRegularisationPolicy ──────────────────────────────────────────────────

const TabRegularisationPolicy = () => {
  const roleSlug = useSelector(selectRoleSlug)
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', action: null, color: 'primary', label: '' })
  
  // Fetch applicability options for lookup
  const { departments: allDepartments, designations: allDesignations, roles: allRoles } = useApplicabilityOptions()
  
  // Helper to get department name from ID
  const getDepartmentName = (idOrObj) => {
    if (typeof idOrObj === 'object' && idOrObj !== null) return idOrObj.name
    const dept = allDepartments.find(d => d._id === idOrObj || d.id === idOrObj)
    return dept?.name || idOrObj
  }
  
  // Helper to get designation name from ID
  const getDesignationName = (idOrObj) => {
    if (typeof idOrObj === 'object' && idOrObj !== null) return idOrObj.name
    const desig = allDesignations.find(d => d._id === idOrObj || d.id === idOrObj)
    return desig?.name || idOrObj
  }
  
  // Helper to get role name from ID or slug
  const getRoleName = (idOrSlugOrObj) => {
    if (typeof idOrSlugOrObj === 'object' && idOrSlugOrObj !== null) return idOrSlugOrObj.name || idOrSlugOrObj.slug
    const role = allRoles.find(r => r._id === idOrSlugOrObj || r.id === idOrSlugOrObj || r.slug === idOrSlugOrObj)
    return role?.name || role?.slug || idOrSlugOrObj
  }

  const fetchPolicies = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axiosRequest.get('/api/v1/regularisation/policies')
      if (res?.success) {
        setPolicies(res.data || [])
      }
    } catch (err) {
      toast.error('Failed to load regularisation policies')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPolicies() }, [fetchPolicies])

  const handleSuccess = (record, isEdit) => {
    if (isEdit) {
      setPolicies(prev => prev.map(p => p._id === record._id ? record : p))
    } else {
      fetchPolicies()
    }
  }

  const doAction = async (policy, method, urlSuffix, successMsg, updateFn) => {
    setActionLoading(policy._id)
    try {
      const res = method === 'delete'
        ? await axiosRequest.delete(`/api/v1/regularisation/policies/${policy._id}${urlSuffix}`)
        : await axiosRequest[method](`/api/v1/regularisation/policies/${policy._id}${urlSuffix}`)

      if (res?.data?.success || res?.success) {
        toast.success(successMsg)
        if (updateFn) updateFn(res.data)
        else fetchPolicies()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const openConfirm = (title, message, action, color = 'primary', label = 'Confirm') =>
    setConfirm({ open: true, title, message, action, color, label })

  const execConfirm = async () => {
    if (confirm.action) await confirm.action()
    setConfirm(c => ({ ...c, open: false }))
  }

  const handleEdit = policy => { setEditData(policy); setDrawerOpen(true) }

  const handleToggle = policy => openConfirm(
    policy.enabled ? 'Deactivate Policy' : 'Activate Policy',
    policy.enabled ? `Deactivate "${policy.name}"?` : `Activate "${policy.name}"?`,
    () => doAction(policy, 'patch', '/toggle', `Policy ${policy.enabled ? 'deactivated' : 'activated'}`, updated => {
      const p = updated?.data || updated
      setPolicies(prev => prev.map(x => x._id === p._id ? { ...x, enabled: p.enabled } : x))
    }),
    policy.enabled ? 'warning' : 'success',
    policy.enabled ? 'Deactivate' : 'Activate'
  )

  const handleDelete = policy => openConfirm(
    'Delete Policy',
    `Permanently delete "${policy.name}"? This cannot be undone.`,
    () => doAction(policy, 'delete', '', 'Policy deleted', () => {
      setPolicies(prev => prev.filter(p => p._id !== policy._id))
    }),
    'error', 'Delete'
  )

  const formatDate = d => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return (
    <Card>
      <CardHeader
        title='Regularisation Policies'
        subheader='Configure regularisation request limits, approval workflows, and applicability'
        action={
          <Button variant='contained' startIcon={<Icon icon='tabler:plus' />}
            onClick={() => { setEditData(null); setDrawerOpen(true) }}
          >
            New Policy
          </Button>
        }
      />
      <Divider />

      <CardContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} variant='rectangular' height={100} sx={{ borderRadius: 2 }} />)}
          </Box>
        ) : policies.length === 0 ? (
          <Box sx={{ p: 5 }}>
            <Alert severity='info'>No regularisation policies yet. Create your first one.</Alert>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {policies.map((policy, idx) => {
              const isExpanded = expandedId === policy._id

              return (
                <Box key={policy._id}
                  sx={{
                    borderBottom: idx < policies.length - 1 ? t => `1px solid ${t.palette.divider}` : 'none',
                    transition: 'background 0.15s',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  {/* Main row */}
                  <Box sx={{
                    px: 5, py: 3.5,
                    display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between', gap: 3, flexWrap: 'wrap'
                  }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Name + chips */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                        <Typography fontWeight={600}>{policy.name}</Typography>
                        <StatusChip status={policy.status} />
                        {policy.enabled ? (
                          <Chip label='Enabled' size='small' color='success' variant='tonal'
                            icon={<Icon icon='tabler:circle-check' fontSize='0.75rem' />}
                          />
                        ) : (
                          <Chip label='Disabled' size='small' color='default' variant='tonal'
                            icon={<Icon icon='tabler:circle-pause' fontSize='0.75rem' />}
                          />
                        )}
                        {policy.isDefault && (
                          <Chip label='Default' size='small' color='primary' variant='filled'
                            icon={<Icon icon='tabler:star' fontSize='0.75rem' />}
                          />
                        )}
                      </Box>

                      {/* Summary line */}
                      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                        <Icon icon='tabler:refresh' fontSize='0.85rem' style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {policy.allowedFor?.join(', ') || 'No types'}
                        {' · '}Max {policy.maxRequestsPerMonth || 0}/month
                        {' · '}{policy.approvalFlow || 'L2_ONLY'}
                        {policy.updatedAt && ` · Updated ${formatDate(policy.updatedAt)}`}
                      </Typography>

                      {/* Feature flags */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        <Chip label={`Past ${policy.requestWindow?.pastDaysAllowed || 30} days`}
                          size='small' color='info' variant='tonal'
                          icon={<Icon icon='tabler:calendar' fontSize='0.75rem' />}
                        />
                        {policy.autoRejectAfterDays > 0 && (
                          <Chip label={`Auto-reject ${policy.autoRejectAfterDays}d`}
                            size='small' color='warning' variant='tonal'
                            icon={<Icon icon='tabler:clock-x' fontSize='0.75rem' />}
                          />
                        )}
                        {policy.documentRequired?.enabled && (
                          <Chip label='Docs Required' size='small' color='secondary' variant='tonal'
                            icon={<Icon icon='tabler:file-check' fontSize='0.75rem' />}
                          />
                        )}
                        {policy.escalation?.enabled && (
                          <Chip label='Escalation' size='small' color='error' variant='tonal'
                            icon={<Icon icon='tabler:arrow-up-circle' fontSize='0.75rem' />}
                          />
                        )}
                      </Box>

                      {/* Applicability chips */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        {policy.applicableFor?.roles?.length > 0 && policy.applicableFor.roles.map(r => (
                          <Chip key={typeof r === 'object' ? r._id : r} 
                            label={getRoleName(r)} 
                            size='small' variant='tonal' color='secondary'
                            icon={<Icon icon='tabler:user-check' fontSize='0.75rem' />}
                          />
                        ))}
                        {policy.applicableFor?.departments?.length > 0 && (
                          <Chip label={`${policy.applicableFor.departments.length} dept${policy.applicableFor.departments.length > 1 ? 's' : ''}`}
                            size='small' variant='tonal' color='primary'
                            icon={<Icon icon='tabler:building' fontSize='0.75rem' />}
                          />
                        )}
                        {policy.applicableFor?.designations?.length > 0 && (
                          <Chip label={`${policy.applicableFor.designations.length} designation${policy.applicableFor.designations.length > 1 ? 's' : ''}`}
                            size='small' variant='tonal' color='warning'
                            icon={<Icon icon='tabler:briefcase' fontSize='0.75rem' />}
                          />
                        )}
                        {policy.applicableFor?.employeeTypes?.length > 0 && policy.applicableFor.employeeTypes.map(t => (
                          <Chip key={t} label={t.replace('_', ' ')} size='small' variant='tonal' color='info' />
                        ))}
                        {!policy.applicableFor?.roles?.length &&
                          !policy.applicableFor?.departments?.length &&
                          !policy.applicableFor?.designations?.length &&
                          !policy.applicableFor?.employeeTypes?.length && (
                            <Chip label='All Employees' size='small' variant='tonal' color='default' />
                          )
                        }
                      </Box>
                    </Box>

                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                      <Tooltip title={isExpanded ? 'Collapse' : 'View Details'}>
                        <IconButton size='small' onClick={() => setExpandedId(isExpanded ? null : policy._id)}>
                          <Icon icon={isExpanded ? 'tabler:chevron-up' : 'tabler:chevron-down'} fontSize='1.1rem' />
                        </IconButton>
                      </Tooltip>
                      <PolicyActionsMenu
                        policy={policy}
                        actionLoading={actionLoading}
                        onEdit={handleEdit}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                      />
                    </Box>
                  </Box>

                  {/* Expanded detail row */}
                  {isExpanded && (
                    <Box sx={{
                      borderTop: t => `1px solid ${t.palette.divider}`
                    }}>
                      <PolicyDetailRow policy={policy} />
                    </Box>
                  )}
                </Box>
              )
            })}
          </Box>
        )}
      </CardContent>

      {/* Drawer */}
      <RegularisationPolicyDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editData={editData}
        onSuccess={handleSuccess}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm(c => ({ ...c, open: false }))}
        onConfirm={execConfirm}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.label}
        confirmColor={confirm.color}
        loading={Boolean(actionLoading)}
      />
    </Card>
  )
}

export default TabRegularisationPolicy
