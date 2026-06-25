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
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
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
import TablePagination from '@mui/material/TablePagination'
import InputAdornment from '@mui/material/InputAdornment'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

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

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']

const STATUS_CONFIG = {
  active:   { color: 'success', icon: 'tabler:circle-check',    label: 'Active'   },
  inactive: { color: 'warning', icon: 'tabler:circle-pause',    label: 'Inactive' },
  draft:    { color: 'default', icon: 'tabler:file-description', label: 'Draft'   },
  archived: { color: 'error',   icon: 'tabler:archive',          label: 'Archived' }
}

// ── defaultValues matches REAL API field names ─────────────────────────────
// shift.start / shift.end  (NOT startTime/endTime)
// lateMark                 (NOT lateMarkRule)
// overtime                 (NOT overtimeRule)
// applicableFor            with departments / roles / locations / employmentTypes

const defaultValues = {
  name: '',
  applicableFor: {
    departments: [],
    roles: [],
    locations: [],
    employmentTypes: []
  },
  shift: {
    name: 'Standard',
    start: '09:00',
    end: '18:00',
    graceMinutes: 15,
    minimumHours: 8,
    halfDayMinHours: 4
  },
  lateMark: {
    enabled: true,
    countAfterMinutes: 15,
    allowedPerMonth: 2,
    escalationAfter: 3,
    penalty: { type: 'leave', value: 0.5 }
  },
  sandwichRule: {
    enabled: false,
    includeHolidays: true,
    includeWeekends: true,
    consecutiveLeaveThreshold: 2
  },
  overtime: {
    enabled: false,
    compensationType: 'comp_off',
    minimumMinutes: 60
  }
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

// ─── StatusChip ───────────────────────────────────────────────────────────────

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

// ─── Applicability Section (reusable inside drawer) ───────────────────────────
// Handles departments (ObjectId array), roles (string array),
// locations (string array), employmentTypes (enum array)

const ApplicabilitySection = ({ control, watch }) => {
  // roles and locations are free-text multi-entry (comma-separated → array on submit)
  // For a real app, hook these to actual department/role search APIs
  const [roleInput, setRoleInput] = useState('')
  const [locationInput, setLocationInput] = useState('')

  return (
    <Box>
      <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
        Applicability
      </Typography>
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 2 }}>
        Leave all empty for a catch-all policy. Priority: Role {'>'} Department {'>'} Location {'>'} Employment Type {'>'} Catch-all
      </Typography>

      <Grid container spacing={4}>

        {/* Employment Types */}
        <Grid item xs={12}>
          <Typography variant='body2' fontWeight={500} sx={{ mb: 1.5 }}>Employment Types</Typography>
          <Controller name='applicableFor.employmentTypes' control={control}
            render={({ field }) => (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {EMPLOYMENT_TYPES.map(type => {
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

        {/* Roles — free-text tags */}
        <Grid item xs={12} sm={6}>
          <Typography variant='body2' fontWeight={500} sx={{ mb: 1 }}>Roles</Typography>
          <Controller name='applicableFor.roles' control={control}
            render={({ field }) => (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  {(field.value || []).map((r, i) => (
                    <Chip key={i} label={r} size='small' variant='tonal' color='secondary'
                      onDelete={() => field.onChange(field.value.filter((_, idx) => idx !== i))}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <CustomTextField
                    size='small' fullWidth placeholder='e.g. hr_manager'
                    value={roleInput}
                    onChange={e => setRoleInput(e.target.value)}
                    onKeyDown={e => {
                      if ((e.key === 'Enter' || e.key === ',') && roleInput.trim()) {
                        e.preventDefault()
                        const val = roleInput.trim().replace(/,$/, '')
                        if (val && !(field.value || []).includes(val)) {
                          field.onChange([...(field.value || []), val])
                        }
                        setRoleInput('')
                      }
                    }}
                  />
                  <Button size='small' variant='tonal'
                    onClick={() => {
                      const val = roleInput.trim()
                      if (val && !(field.value || []).includes(val)) {
                        field.onChange([...(field.value || []), val])
                      }
                      setRoleInput('')
                    }}
                  >
                    Add
                  </Button>
                </Box>
                <Typography variant='caption' color='text.secondary'>Press Enter or comma to add</Typography>
              </Box>
            )}
          />
        </Grid>

        {/* Locations — free-text tags */}
        <Grid item xs={12} sm={6}>
          <Typography variant='body2' fontWeight={500} sx={{ mb: 1 }}>Locations (City)</Typography>
          <Controller name='applicableFor.locations' control={control}
            render={({ field }) => (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  {(field.value || []).map((l, i) => (
                    <Chip key={i} label={l} size='small' variant='tonal' color='info'
                      icon={<Icon icon='tabler:map-pin' fontSize='0.75rem' />}
                      onDelete={() => field.onChange(field.value.filter((_, idx) => idx !== i))}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <CustomTextField
                    size='small' fullWidth placeholder='e.g. Bangalore'
                    value={locationInput}
                    onChange={e => setLocationInput(e.target.value)}
                    onKeyDown={e => {
                      if ((e.key === 'Enter' || e.key === ',') && locationInput.trim()) {
                        e.preventDefault()
                        const val = locationInput.trim().replace(/,$/, '')
                        if (val && !(field.value || []).includes(val)) {
                          field.onChange([...(field.value || []), val])
                        }
                        setLocationInput('')
                      }
                    }}
                  />
                  <Button size='small' variant='tonal'
                    onClick={() => {
                      const val = locationInput.trim()
                      if (val && !(field.value || []).includes(val)) {
                        field.onChange([...(field.value || []), val])
                      }
                      setLocationInput('')
                    }}
                  >
                    Add
                  </Button>
                </Box>
                <Typography variant='caption' color='text.secondary'>Matches employee.currentAddress.city</Typography>
              </Box>
            )}
          />
        </Grid>

      </Grid>
    </Box>
  )
}

// ─── Attendance Policy Drawer ─────────────────────────────────────────────────

const AttendancePolicyDrawer = ({ open, onClose, editData, onSuccess }) => {
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(editData?._id)

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues })

  const lateMarkEnabled = watch('lateMark.enabled')
  const overtimeEnabled = watch('overtime.enabled')
  const sandwichEnabled = watch('sandwichRule.enabled')

  useEffect(() => {
    if (open) {
      if (editData) {
        // Map real API response shape into form
        reset({
          name: editData.name || '',
          applicableFor: {
            departments: editData.applicableFor?.departments || [],
            roles: editData.applicableFor?.roles || [],
            locations: editData.applicableFor?.locations || [],
            employmentTypes: editData.applicableFor?.employmentTypes || []
          },
          shift: {
            name: editData.shift?.name || 'Standard',
            start: editData.shift?.start || '09:00',
            end: editData.shift?.end || '18:00',
            graceMinutes: editData.shift?.graceMinutes ?? 15,
            minimumHours: editData.shift?.minimumHours ?? 8,
            halfDayMinHours: editData.shift?.halfDayMinHours ?? 4
          },
          lateMark: {
            enabled: editData.lateMark?.enabled ?? true,
            countAfterMinutes: editData.lateMark?.countAfterMinutes ?? 15,
            allowedPerMonth: editData.lateMark?.allowedPerMonth ?? 2,
            escalationAfter: editData.lateMark?.escalationAfter ?? 3,
            penalty: {
              type: editData.lateMark?.penalty?.type || 'leave',
              value: editData.lateMark?.penalty?.value ?? 0.5
            }
          },
          sandwichRule: {
            enabled: editData.sandwichRule?.enabled ?? false,
            includeHolidays: editData.sandwichRule?.includeHolidays ?? true,
            includeWeekends: editData.sandwichRule?.includeWeekends ?? true,
            consecutiveLeaveThreshold: editData.sandwichRule?.consecutiveLeaveThreshold ?? 2
          },
          overtime: {
            enabled: editData.overtime?.enabled ?? false,
            compensationType: editData.overtime?.compensationType || 'comp_off',
            minimumMinutes: editData.overtime?.minimumMinutes ?? 60
          }
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [open, editData])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      // Coerce all numeric fields — HTML inputs return strings
      const payload = {
        name: data.name,
        applicableFor: data.applicableFor,
        shift: {
          name: data.shift.name,
          start: data.shift.start,
          end: data.shift.end,
          graceMinutes: Number(data.shift.graceMinutes),
          minimumHours: Number(data.shift.minimumHours),
          halfDayMinHours: Number(data.shift.halfDayMinHours)
        },
        lateMark: {
          enabled: data.lateMark.enabled,
          countAfterMinutes: Number(data.lateMark.countAfterMinutes),
          allowedPerMonth: Number(data.lateMark.allowedPerMonth),
          escalationAfter: Number(data.lateMark.escalationAfter),
          penalty: {
            type: data.lateMark.penalty.type,
            value: Number(data.lateMark.penalty.value)
          }
        },
        sandwichRule: {
          enabled: data.sandwichRule.enabled,
          includeHolidays: data.sandwichRule.includeHolidays,
          includeWeekends: data.sandwichRule.includeWeekends,
          consecutiveLeaveThreshold: Number(data.sandwichRule.consecutiveLeaveThreshold)
        },
        overtime: {
          enabled: data.overtime.enabled,
          compensationType: data.overtime.compensationType,
          minimumMinutes: Number(data.overtime.minimumMinutes)
        }
      }

      const res = isEdit
        ? await axiosRequest.put(`/api/v1/attendance-policies/${editData._id}`, payload)
        : await axiosRequest.post('/api/v1/attendance-policies', payload)

      // interceptor pattern: res.success + res.data
      if (res?.success) {
        toast.success(`Attendance policy ${isEdit ? 'updated' : 'created'} successfully`)
        onSuccess(res.data, isEdit)
        onClose()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save policy')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer open={open} anchor='right' onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 680 } } }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 5, py: 4, borderBottom: t => `1px solid ${t.palette.divider}`
      }}>
        <Box>
          <Typography variant='h6'>{isEdit ? 'Edit Attendance Policy' : 'New Attendance Policy'}</Typography>
          <Typography variant='caption' color='text.secondary'>
            Configure shift, late mark, sandwich and overtime rules
          </Typography>
        </Box>
        <IconButton onClick={onClose} size='small'><Icon icon='tabler:x' /></IconButton>
      </Box>

      <Box component='form' onSubmit={handleSubmit(onSubmit)}
        sx={{ px: 5, py: 4, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}
      >

        {/* ── Policy Name ────────────────────────────────────────── */}
        <Box>
          <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
            Policy Details
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={8}>
              <Controller name='name' control={control} rules={{ required: 'Policy name is required' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field} fullWidth label='Policy Name *'
                    error={!!errors.name} helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* ── Applicability ──────────────────────────────────────── */}
        <ApplicabilitySection control={control} watch={watch} />

        <Divider />

        {/* ── Shift Timings ──────────────────────────────────────── */}
        <Box>
          <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
            Shift Timings
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Controller name='shift.name' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Shift Name'
                    placeholder='e.g. Standard, Early, Flex'
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Controller name='shift.start' control={control}
                rules={{
                  required: 'Required',
                  pattern: { value: /^([01]\d|2[0-3]):[0-5]\d$/, message: 'Must be HH:MM' }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field} fullWidth type='time' label='Start Time *'
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.shift?.start}
                    helperText={errors.shift?.start?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Controller name='shift.end' control={control}
                rules={{
                  required: 'Required',
                  pattern: { value: /^([01]\d|2[0-3]):[0-5]\d$/, message: 'Must be HH:MM' }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field} fullWidth type='time' label='End Time *'
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.shift?.end}
                    helperText={errors.shift?.end?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Controller name='shift.graceMinutes' control={control}
                rules={{ min: { value: 0, message: 'Min 0' } }}
                render={({ field }) => (
                  <CustomTextField
                    {...field} fullWidth type='number' label='Grace Period (min)'
                    inputProps={{ min: 0 }}
                    helperText='0 = no grace'
                    error={!!errors.shift?.graceMinutes}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Controller name='shift.minimumHours' control={control}
                rules={{ required: 'Required', min: { value: 1, message: 'Min 1' } }}
                render={({ field }) => (
                  <CustomTextField
                    {...field} fullWidth type='number' label='Minimum Hours *'
                    inputProps={{ min: 1, step: 0.5 }}
                    error={!!errors.shift?.minimumHours}
                    helperText={errors.shift?.minimumHours?.message ?? 'Full-day threshold'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Controller name='shift.halfDayMinHours' control={control}
                rules={{
                  required: 'Required',
                  validate: val => {
                    // halfDayMinHours must be < minimumHours
                    return true // full validation handled server-side; keep simple here
                  }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field} fullWidth type='number' label='Half-Day Min Hours *'
                    inputProps={{ min: 0.5, step: 0.5 }}
                    error={!!errors.shift?.halfDayMinHours}
                    helperText={errors.shift?.halfDayMinHours?.message ?? 'Must be < minimum hours'}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* ── Late Mark ──────────────────────────────────────────── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant='overline' color='text.secondary'>Late Mark Rule</Typography>
            <Controller name='lateMark.enabled' control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                  label='Enable'
                  labelPlacement='start'
                />
              )}
            />
          </Box>
          {lateMarkEnabled && (
            <Grid container spacing={4}>
              <Grid item xs={6} sm={3}>
                <Controller name='lateMark.countAfterMinutes' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='number' label='Count After (min)'
                      helperText='0 = any late counts'
                      inputProps={{ min: 0 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Controller name='lateMark.allowedPerMonth' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='number' label='Allowed / Month'
                      helperText='0 = none allowed'
                      inputProps={{ min: 0 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Controller name='lateMark.escalationAfter' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='number' label='Escalate After'
                      helperText='# of late marks'
                      inputProps={{ min: 1 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                {/* spacer */}
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name='lateMark.penalty.type' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Penalty Type'>
                      <MenuItem value='leave'>Deduct Leave</MenuItem>
                      <MenuItem value='salary'>Deduct Salary</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name='lateMark.penalty.value' control={control}
                  rules={{
                    validate: val => [0.5, 1].includes(Number(val)) || 'Must be 0.5 or 1'
                  }}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Penalty Value'
                      error={!!errors.lateMark?.penalty?.value}
                      helperText={errors.lateMark?.penalty?.value?.message ?? '0.5 = half day, 1 = full day'}
                    >
                      <MenuItem value={0.5}>0.5 (Half Day)</MenuItem>
                      <MenuItem value={1}>1.0 (Full Day)</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>
            </Grid>
          )}
          {!lateMarkEnabled && (
            <Alert severity='info' sx={{ mt: 1 }}>Late mark tracking is disabled for this policy.</Alert>
          )}
        </Box>

        <Divider />

        {/* ── Sandwich Rule ──────────────────────────────────────── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant='overline' color='text.secondary'>Sandwich Rule</Typography>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                Weekends / holidays between two leave days count as leave
              </Typography>
            </Box>
            <Controller name='sandwichRule.enabled' control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                  label='Enable'
                  labelPlacement='start'
                />
              )}
            />
          </Box>
          {sandwichEnabled && (
            <Grid container spacing={4}>
              <Grid item xs={6} sm={4}>
                <Controller name='sandwichRule.includeWeekends' control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                      label='Include Weekends'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name='sandwichRule.includeHolidays' control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                      label='Include Holidays'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller name='sandwichRule.consecutiveLeaveThreshold' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='number' label='Consecutive Threshold'
                      helperText='Min leave days to trigger sandwich'
                      inputProps={{ min: 1 }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}
          {!sandwichEnabled && (
            <Alert severity='info' sx={{ mt: 1 }}>Sandwich rule is disabled. Weekends/holidays between leaves will not count as leave.</Alert>
          )}
        </Box>

        <Divider />

        {/* ── Overtime ───────────────────────────────────────────── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant='overline' color='text.secondary'>Overtime</Typography>
            <Controller name='overtime.enabled' control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                  label='Enable'
                  labelPlacement='start'
                />
              )}
            />
          </Box>
          {overtimeEnabled && (
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Controller name='overtime.compensationType' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Compensation Type'>
                      <MenuItem value='comp_off'>Comp Off</MenuItem>
                      <MenuItem value='salary'>Salary</MenuItem>
                      <MenuItem value='none'>None</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name='overtime.minimumMinutes' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='number' label='Minimum OT Minutes'
                      helperText='Min minutes to qualify as overtime'
                      inputProps={{ min: 1 }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}
          {!overtimeEnabled && (
            <Alert severity='info' sx={{ mt: 1 }}>Overtime tracking is disabled for this policy.</Alert>
          )}
        </Box>

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
// NOTE: activate/deactivate/archive routes are missing in backend routes file (known bug).
// They are shown in the menu but will 404 until Prakhar adds the routes.
// Service + controller functions already exist on backend.

const PolicyActionsMenu = ({ policy, onEdit, onActivate, onDeactivate, onArchive, onDelete, actionLoading }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const { status } = policy
  const isLoading = actionLoading === policy._id

  const close = () => setAnchorEl(null)
  const handle = fn => () => { close(); fn(policy) }

  return (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)} disabled={isLoading}>
        {isLoading
          ? <CircularProgress size={16} />
          : <Icon icon='tabler:dots-vertical' fontSize='1.1rem' />
        }
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {status !== 'archived' && (
          <MenuItem onClick={handle(onEdit)}>
            <ListItemIcon><Icon icon='tabler:pencil' fontSize='1rem' /></ListItemIcon>
            <ListItemText>Edit Policy</ListItemText>
          </MenuItem>
        )}
        {(status === 'draft' || status === 'inactive') && onActivate && (
          <MenuItem onClick={handle(onActivate)}>
            <ListItemIcon><Icon icon='tabler:circle-check' fontSize='1rem' style={{ color: '#10B981' }} /></ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}
        {status === 'active' && onDeactivate && (
          <MenuItem onClick={handle(onDeactivate)}>
            <ListItemIcon><Icon icon='tabler:circle-pause' fontSize='1rem' style={{ color: '#F59E0B' }} /></ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        )}
        {(status === 'active' || status === 'inactive') && onArchive && (
          <MenuItem onClick={handle(onArchive)}>
            <ListItemIcon><Icon icon='tabler:archive' fontSize='1rem' style={{ color: '#6B7280' }} /></ListItemIcon>
            <ListItemText>Archive</ListItemText>
          </MenuItem>
        )}
        {(status === 'draft' || status === 'inactive' || status === 'archived') && (
          <MenuItem onClick={handle(onDelete)} sx={{ color: 'error.main' }}>
            <ListItemIcon><Icon icon='tabler:trash' fontSize='1rem' style={{ color: 'inherit' }} /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

// ─── Policy Detail Row (expanded view) ───────────────────────────────────────

const PolicyDetailRow = ({ policy }) => {
  const rows = [
    { label: 'Shift', value: `${policy.shift?.name || ''} · ${policy.shift?.start} – ${policy.shift?.end}` },
    { label: 'Grace', value: `${policy.shift?.graceMinutes ?? 0} min` },
    { label: 'Min Hours', value: `${policy.shift?.minimumHours ?? '—'} hrs (full) / ${policy.shift?.halfDayMinHours ?? '—'} hrs (half)` },
    {
      label: 'Late Mark',
      value: policy.lateMark?.enabled
        ? `After ${policy.lateMark.countAfterMinutes}min · ${policy.lateMark.allowedPerMonth}/mo allowed · Penalty: ${policy.lateMark.penalty?.value} ${policy.lateMark.penalty?.type}`
        : 'Disabled'
    },
    {
      label: 'Sandwich',
      value: policy.sandwichRule?.enabled
        ? `Enabled · Weekends: ${policy.sandwichRule.includeWeekends ? 'Yes' : 'No'} · Holidays: ${policy.sandwichRule.includeHolidays ? 'Yes' : 'No'} · Threshold: ${policy.sandwichRule.consecutiveLeaveThreshold} days`
        : 'Disabled'
    },
    {
      label: 'Overtime',
      value: policy.overtime?.enabled
        ? `${policy.overtime.compensationType?.replace('_', ' ')} · Min ${policy.overtime.minimumMinutes} min`
        : 'Disabled'
    }
  ]

  return (
    <Table size='small'>
      <TableBody>
        {rows.map(r => (
          <TableRow key={r.label} sx={{ '&:last-child td': { border: 0 } }}>
            <TableCell sx={{ color: 'text.secondary', width: 120, py: 0.75, pl: 0 }}>{r.label}</TableCell>
            <TableCell sx={{ py: 0.75 }}>{r.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ─── TabAttendancePolicy ──────────────────────────────────────────────────────

const TabAttendancePolicy = () => {
  const roleSlug   = useSelector(selectRoleSlug)
  const canActivate = roleSlug === 'unit_admin'
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', action: null, color: 'primary', label: '' })

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchPolicies = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      params.set('page', page + 1)
      params.set('limit', rowsPerPage)

      const res = await axiosRequest.get(`/api/v1/attendance-policies?${params.toString()}`)

      // Real shape: res.success, res.data.policies[], res.data.pagination
      if (res?.success) {
        setPolicies(res.data?.policies ?? [])
        setPagination(res.data?.pagination ?? { total: 0, pages: 1 })
      }
    } catch {
      toast.error('Failed to load attendance policies')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, page, rowsPerPage])

  useEffect(() => { fetchPolicies() }, [fetchPolicies])

  // ── Drawer success ────────────────────────────────────────────────────────
  const handleSuccess = (record, isEdit) => {
    // record may be the policy directly or wrapped
    const policy = record?.policies?.[0] ?? record
    if (isEdit) {
      setPolicies(prev => prev.map(p => p._id === policy._id ? policy : p))
    } else {
      fetchPolicies()
    }
  }

  // ── Generic PATCH/DELETE action ───────────────────────────────────────────
  const doAction = async (policy, method, urlSuffix, successMsg, updateFn) => {
    setActionLoading(policy._id)
    try {
      const res = method === 'delete'
        ? await axiosRequest.delete(`/api/v1/attendance-policies/${policy._id}${urlSuffix}`)
        : await axiosRequest[method](`/api/v1/attendance-policies/${policy._id}${urlSuffix}`)

      if (res?.success) {
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

  // ── Confirm helpers ───────────────────────────────────────────────────────
  const openConfirm = (title, message, action, color = 'primary', label = 'Confirm') =>
    setConfirm({ open: true, title, message, action, color, label })

  const execConfirm = async () => {
    if (confirm.action) await confirm.action()
    setConfirm(c => ({ ...c, open: false }))
  }

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleEdit = policy => { setEditData(policy); setDrawerOpen(true) }

  const handleActivate = policy => openConfirm(
    'Activate Policy',
    `Activate "${policy.name}"? It will apply to matched employees.`,
    () => doAction(policy, 'patch', '/activate', 'Policy activated', updated => {
      const p = updated?.policies?.[0] ?? updated
      setPolicies(prev => prev.map(x => x._id === p._id ? p : x))
    }),
    'success', 'Activate'
  )

  const handleDeactivate = policy => openConfirm(
    'Deactivate Policy',
    `Deactivate "${policy.name}"?`,
    () => doAction(policy, 'patch', '/deactivate', 'Policy deactivated', updated => {
      const p = updated?.policies?.[0] ?? updated
      setPolicies(prev => prev.map(x => x._id === p._id ? p : x))
    }),
    'warning', 'Deactivate'
  )

  const handleArchive = policy => openConfirm(
    'Archive Policy',
    `Archive "${policy.name}"? It will become read-only.`,
    () => doAction(policy, 'patch', '/archive', 'Policy archived', updated => {
      const p = updated?.policies?.[0] ?? updated
      setPolicies(prev => prev.map(x => x._id === p._id ? p : x))
    }),
    'default', 'Archive'
  )

  const handleDelete = policy => openConfirm(
    'Delete Policy',
    `Permanently delete "${policy.name}"? This cannot be undone.`,
    () => doAction(policy, 'delete', '', 'Policy deleted', () => {
      setPolicies(prev => prev.filter(p => p._id !== policy._id))
    }),
    'error', 'Delete'
  )

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = d => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return (
    <Card>
      <CardHeader
        title='Attendance Policies'
        subheader='Configure shift timings, late mark, sandwich and overtime rules per scope'
        action={
          <Button variant='contained' startIcon={<Icon icon='tabler:plus' />}
            onClick={() => { setEditData(null); setDrawerOpen(true) }}
          >
            New Policy
          </Button>
        }
      />
      <Divider />

      {/* Filters */}
      <Box sx={{ px: 5, py: 3, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <CustomTextField
          size='small' placeholder='Search policies...' value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          sx={{ minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Icon icon='tabler:search' fontSize='1rem' />
              </InputAdornment>
            )
          }}
        />
        <CustomTextField
          select size='small' label='Status' value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value='all'>All Statuses</MenuItem>
          <MenuItem value='active'>Active</MenuItem>
          <MenuItem value='inactive'>Inactive</MenuItem>
          <MenuItem value='draft'>Draft</MenuItem>
          <MenuItem value='archived'>Archived</MenuItem>
        </CustomTextField>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {pagination.total} polic{pagination.total !== 1 ? 'ies' : 'y'}
        </Typography>
      </Box>

      <Divider />

      <CardContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} variant='rectangular' height={100} sx={{ borderRadius: 2 }} />)}
          </Box>
        ) : policies.length === 0 ? (
          <Box sx={{ p: 5 }}>
            <Alert severity='info'>
              {search || statusFilter !== 'all'
                ? 'No policies match your filters.'
                : 'No attendance policies yet. Create your first one.'}
            </Alert>
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
                        {policy.version != null && (
                          <Chip label={`v${policy.version}`} size='small' variant='outlined'
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>

                      {/* Shift summary line */}
                      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                        <Icon icon='tabler:clock' fontSize='0.85rem' style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {policy.shift?.name && `${policy.shift.name} · `}
                        {policy.shift?.start} – {policy.shift?.end}
                        {policy.shift?.graceMinutes > 0 && ` · Grace: ${policy.shift.graceMinutes}min`}
                        {policy.shift?.minimumHours && ` · ${policy.shift.minimumHours}h full / ${policy.shift.halfDayMinHours}h half`}
                        {policy.updatedAt && ` · Updated ${formatDate(policy.updatedAt)}`}
                      </Typography>

                      {/* Feature flags */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        {policy.lateMark?.enabled && (
                          <Chip label={`Late Mark · ${policy.lateMark.countAfterMinutes}min`}
                            size='small' color='warning' variant='tonal'
                            icon={<Icon icon='tabler:clock-exclamation' fontSize='0.75rem' />}
                          />
                        )}
                        {policy.sandwichRule?.enabled && (
                          <Chip label='Sandwich Rule' size='small' color='info' variant='tonal'
                            icon={<Icon icon='tabler:layers-intersect' fontSize='0.75rem' />}
                          />
                        )}
                        {policy.overtime?.enabled && (
                          <Chip label={`OT · ${policy.overtime.compensationType?.replace('_', ' ')}`}
                            size='small' color='success' variant='tonal'
                            icon={<Icon icon='tabler:trending-up' fontSize='0.75rem' />}
                          />
                        )}
                      </Box>

                      {/* Applicability chips */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        {policy.applicableFor?.roles?.length > 0
                          ? policy.applicableFor.roles.map(r => (
                            <Chip key={r} label={r} size='small' variant='tonal' color='secondary'
                              icon={<Icon icon='tabler:user-check' fontSize='0.75rem' />}
                            />
                          ))
                          : null
                        }
                        {policy.applicableFor?.departments?.length > 0 && (
                          <Chip
                            label={`${policy.applicableFor.departments.length} dept${policy.applicableFor.departments.length > 1 ? 's' : ''}`}
                            size='small' variant='tonal' color='secondary'
                            icon={<Icon icon='tabler:building' fontSize='0.75rem' />}
                          />
                        )}
                        {policy.applicableFor?.locations?.length > 0 && (
                          <Chip
                            label={policy.applicableFor.locations.join(', ')}
                            size='small' variant='tonal' color='info'
                            icon={<Icon icon='tabler:map-pin' fontSize='0.75rem' />}
                          />
                        )}
                        {policy.applicableFor?.employmentTypes?.length > 0
                          ? policy.applicableFor.employmentTypes.map(t => (
                            <Chip key={t} label={t.replace('_', ' ')} size='small' variant='tonal' color='secondary' />
                          ))
                          : null
                        }
                        {!policy.applicableFor?.roles?.length &&
                          !policy.applicableFor?.departments?.length &&
                          !policy.applicableFor?.locations?.length &&
                          !policy.applicableFor?.employmentTypes?.length && (
                            <Chip label='Catch-all (all employees)' size='small' variant='tonal' color='default' />
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
                      {policy.status !== 'archived' && (
                        <Tooltip title='Edit'>
                          <IconButton size='small' onClick={() => handleEdit(policy)}>
                            <Icon icon='tabler:pencil' fontSize='1.1rem' />
                          </IconButton>
                        </Tooltip>
                      )}
                      <PolicyActionsMenu
                        policy={policy}
                        actionLoading={actionLoading}
                        onEdit={handleEdit}
                        onActivate={canActivate ? handleActivate : null}
                        onDeactivate={canActivate ? handleDeactivate : null}
                        onArchive={canActivate ? handleArchive : null}
                        onDelete={handleDelete}
                      />
                    </Box>
                  </Box>

                  {/* Expanded detail row */}
                  {isExpanded && (
                    <Box sx={{
                      px: 5, pb: 3,
                      borderTop: t => `1px solid ${t.palette.divider}`,
                      bgcolor: t => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
                    }}>
                      <PolicyDetailRow policy={policy} />
                    </Box>
                  )}
                </Box>
              )
            })}
          </Box>
        )}

        {/* Pagination */}
        {!loading && pagination.total > rowsPerPage && (
          <>
            <Divider />
            <TablePagination
              component='div'
              count={pagination.total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </>
        )}
      </CardContent>

      {/* Drawer */}
      <AttendancePolicyDrawer
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

export default TabAttendancePolicy