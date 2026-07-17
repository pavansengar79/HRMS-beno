
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
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { selectRoleSlug, selectPermissions } from 'src/store/auth/authSlice'

// ** API
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']

// ─── Hook to fetch dropdown options with permission checks ────────────────────
const useApplicabilityOptions = () => {
  const permissions = useSelector(selectPermissions) || []
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true)
        const requests = []
        const keys = []
        
        // Only fetch if user has read permission for each resource
        if (permissions.includes('department.read')) {
          requests.push(axiosRequest.get('/api/v1/departments'))
          keys.push('departments')
        }
        if (permissions.includes('designation.read')) {
          requests.push(axiosRequest.get('/api/v1/designations'))
          keys.push('designations')
        }
        if (permissions.includes('role.read')) {
          requests.push(axiosRequest.get('/api/v1/roles'))
          keys.push('roles')
        }

        if (requests.length === 0) {
          setLoading(false)
          return
        }

        const responses = await Promise.all(requests)
        
        responses.forEach((res, index) => {
          const key = keys[index]
          if (key === 'departments') setDepartments(res?.data || [])
          else if (key === 'designations') setDesignations(res?.data || [])
          else if (key === 'roles') setRoles(res?.data || [])
        })
      } catch (err) {
        console.error('Failed to load applicability options:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOptions()
  }, [permissions])

  return { departments, designations, roles, loading }
}

const STATUS_CONFIG = {
  active:   { color: 'success', icon: 'tabler:circle-check',    label: 'Active'   },
  inactive: { color: 'warning', icon: 'tabler:circle-pause',    label: 'Inactive' },
  draft:    { color: 'default', icon: 'tabler:file-description', label: 'Draft'    },
  archived: { color: 'error',   icon: 'tabler:archive',          label: 'Archived' }
}

// ─── Default values aligned with backend model/validation ────────────────────

const defaultPolicyLeaveEntry = {
  leaveTypeId: '',
  name: '',
  code: '',
  color: '#10B981',
  description: '',
  isPaid: true,
  isActive: true,
  isPublic: true,
  genderRestriction: 'ALL',
  applicableEmploymentTypes: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'],
  minTenureMonths: 0,
  cooldownDays: 0,
  credit: {
    totalPerYear: 0,
    frequency: 'YEARLY',
    perCycle: 0,
    accrualType: 'YEARLY',
    accrualDay: 1,
    roundingRule: 'ROUND',
    probationApplicable: false
  },
  balance: {
    maxBalance: null,
    allowNegative: false,
    maxNegative: 0,
    resetCycle: 'YEARLY'
  },
  carryForward: {
    allowed: false,
    max: 0,
    expiryDays: 90,
    expiryAction: 'LAPSE',
    carryForwardOn: 'YEAR_END'
  },
  encashment: {
    allowed: false,
    maxDays: 0,
    minBalance: 0,
    applicableAt: ['YEAR_END'],
    taxable: true
  },
  application: {
    minDays: 0.5,
    maxDays: null,
    maxPerMonth: null,
    advanceNoticeDays: 0,
    allowBackdated: false,
    backdatedAllowedDays: 0,
    allowHalfDay: true,
    allowContinuousWithHoliday: true,
    requireReasonMinLength: 10,
    cooldownDays: 0
  },
  documentRule: {
    required: false,
    afterDays: null,
    allowedTypes: ['pdf', 'jpg', 'jpeg', 'png']
  },
  sandwichRule: {
    override: false,
    enabled: false,
    includeHolidays: true,
    includeWeekends: true
  }
}

const defaultPolicyValues = {
  name: '',
  description: '',
  effectiveFrom: '',
  effectiveTo: null,
  status: 'active',
  changeNote: '',
  approvalFlow: {
    type: 'L1_L2'
  },
  applicableFor: {
    departments: [],
    designations: [],
    roles: [],
    employmentTypes: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']
  },
  sandwichRule: {
    enabled: false,
    includeHolidays: true,
    includeWeekends: true,
    consecutiveLeaveThreshold: 2
  },
  leaveTypes: []
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

const ConfirmDialog = ({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', confirmColor = 'primary', loading = false
}) => (
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

// ─── Master Leave Types Hook ──────────────────────────────────────────────────

const useMasterLeaveTypes = () => {
  const [leaveTypes, setLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await axiosRequest.get('/api/v1/leave/types')
        if (res?.success) setLeaveTypes(res.data ?? [])
      } catch {
        toast.error('Failed to load leave types')
      } finally {
        setLoading(false)
      }
    }
    fetchTypes()
  }, [])

  return { leaveTypes, loading }
}

// ─── LeaveTypesSection ────────────────────────────────────────────────────────

const LeaveTypesSection = ({ control, watch, setValue, masterLeaveTypes, masterLoading }) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'leaveTypes' })
  const [expanded, setExpanded] = useState(null)

  // ✅ Map master leave type fields to backend-aligned form fields
  const handleLeaveTypeSelect = (index, leaveTypeId) => {
    const master = masterLeaveTypes.find(lt => lt._id === leaveTypeId)
    if (!master) return
    const prefix = `leaveTypes.${index}`

    setValue(`${prefix}.name`, master.name)
    setValue(`${prefix}.code`, master.code)
    setValue(`${prefix}.color`, master.colorCode || master.color || '#10B981') // ✅ map to 'color'
    setValue(`${prefix}.isPaid`, master.isPaid ?? true)
    setValue(`${prefix}.isActive`, master.isActive ?? true)
    setValue(`${prefix}.genderRestriction`, master.applicableGender ?? 'ALL') // ✅ string only
    setValue(`${prefix}.applicableEmploymentTypes`, master.applicableEmploymentTypes ?? ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'])

    // credit — map master flat fields to nested credit object
    setValue(`${prefix}.credit.totalPerYear`, master.defaultDaysPerYear ?? 0)
    setValue(`${prefix}.credit.perCycle`, master.accrualRatePerMonth ?? 0)
    setValue(`${prefix}.credit.frequency`, master.credit?.frequency ?? 'MONTHLY')
    setValue(`${prefix}.credit.accrualType`, master.credit?.accrualType ?? 'YEARLY')

    // carryForward
    setValue(`${prefix}.carryForward.allowed`, master.isCarryForwardAllowed ?? false)
    setValue(`${prefix}.carryForward.max`, master.carryForwardLimit ?? 0)

    // encashment
    setValue(`${prefix}.encashment.allowed`, master.isEncashmentAllowed ?? false)

    // application
    setValue(`${prefix}.application.allowHalfDay`, master.isHalfDayAllowed ?? true)
    setValue(`${prefix}.application.advanceNoticeDays`, master.minNoticeDays ?? 0)

    // documentRule
    setValue(`${prefix}.documentRule.required`, master.requiresDocumentAfterDays != null)
    setValue(`${prefix}.documentRule.afterDays`, master.requiresDocumentAfterDays ?? 0)

    // sandwichRule
    setValue(`${prefix}.sandwichRule.enabled`, master.isSandwichApplicable ?? false)
  }

  const addLeaveType = () => {
    append({ ...defaultPolicyLeaveEntry })
    setExpanded(fields.length)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant='subtitle1' fontWeight={600}>Leave Types in Policy</Typography>
          <Typography variant='caption' color='text.secondary'>
            Select from master leave types and override policy-level settings
          </Typography>
        </Box>
        <Button size='small' variant='tonal' startIcon={<Icon icon='tabler:plus' />} onClick={addLeaveType}>
          Add Leave Type
        </Button>
      </Box>

      {fields.length === 0 && (
        <Alert severity='info' sx={{ mb: 3 }}>
          No leave types added. Click "Add Leave Type" to include types from the master list.
        </Alert>
      )}

      {fields.map((field, index) => {
        const p = `leaveTypes.${index}`
        const cfAllowed  = watch(`${p}.carryForward.allowed`)
        const encAllowed = watch(`${p}.encashment.allowed`)
        const docReq     = watch(`${p}.documentRule.required`)
        const colorVal   = watch(`${p}.color`)   // ✅ 'color' not 'colorCode'
        const nameVal    = watch(`${p}.name`)
        const codeVal    = watch(`${p}.code`)
        const leaveTypeId = watch(`${p}.leaveTypeId`)

        return (
          <Accordion
            key={field.id}
            expanded={expanded === index}
            onChange={() => setExpanded(expanded === index ? null : index)}
            sx={{
              mb: 2,
              '&:before': { display: 'none' },
              border: t => `1px solid ${t.palette.divider}`,
              borderLeft: `4px solid ${colorVal || '#6B7280'}`,
              borderRadius: '8px !important',
              boxShadow: 'none'
            }}
          >
            <AccordionSummary expandIcon={<Icon icon='tabler:chevron-down' />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: 1,
                  backgroundColor: colorVal || '#6B7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Typography variant='caption' fontWeight={700} color='white' sx={{ fontSize: '0.65rem' }}>
                    {codeVal || '?'}
                  </Typography>
                </Box>
                <Typography fontWeight={500}>{nameVal || 'Select a leave type...'}</Typography>
                {!leaveTypeId && <Chip label='Not configured' size='small' color='warning' variant='tonal' />}
                <Box sx={{ ml: 'auto', mr: 1 }}>
                  <Button size='small' color='error' variant='tonal'
                    onClick={e => { e.stopPropagation(); remove(index) }}
                    startIcon={<Icon icon='tabler:trash' fontSize='1rem' />}
                  >
                    Remove
                  </Button>
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={4}>

                {/* Select master leave type */}
                <Grid item xs={12}>
                  <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 2 }}>
                    Select Leave Type
                  </Typography>
                  {masterLoading ? (
                    <Skeleton variant='rectangular' height={56} sx={{ borderRadius: 1 }} />
                  ) : (
                    <Controller
                      name={`${p}.leaveTypeId`}
                      control={control}
                      rules={{ required: 'Please select a leave type' }}
                      render={({ field, fieldState }) => (
                        <CustomTextField
                          select fullWidth label='Master Leave Type *'
                          value={field.value || ''}
                          onChange={e => { field.onChange(e.target.value); handleLeaveTypeSelect(index, e.target.value) }}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message ?? 'All fields below will auto-fill and can be overridden'}
                        >
                          {masterLeaveTypes.map(lt => (
                            <MenuItem key={lt._id} value={lt._id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: lt.colorCode || lt.color || '#6B7280', flexShrink: 0 }} />
                                <span>{lt.name}</span>
                                <Typography variant='caption' color='text.secondary' sx={{ ml: 0.5 }}>
                                  ({lt.code}) · {lt.defaultDaysPerYear} days/yr
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </CustomTextField>
                      )}
                    />
                  )}
                </Grid>

                {leaveTypeId && (
                  <>
                    <Grid item xs={12}>
                      <Divider textAlign='left'>
                        <Typography variant='caption' color='text.secondary'>Policy-Level Overrides</Typography>
                      </Divider>
                    </Grid>

                    {/* Basic Info */}
                    <Grid item xs={12}>
                      <Typography variant='overline' color='text.secondary'>Basic Info</Typography>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <Controller name={`${p}.name`} control={control}
                        render={({ field }) => <CustomTextField {...field} fullWidth label='Display Name' />}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Controller name={`${p}.code`} control={control}
                        render={({ field }) => (
                          <CustomTextField {...field} fullWidth label='Code'
                            onChange={e => field.onChange(e.target.value.toUpperCase())}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Controller name={`${p}.isPaid`} control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                            label='Paid'
                          />
                        )}
                      />
                      <Controller name={`${p}.isActive`} control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                            label='Active'
                          />
                        )}
                      />
                    </Grid>

                    {/* Color — ✅ field name is 'color' */}
                    <Grid item xs={12}>
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>Color</Typography>
                      <Controller name={`${p}.color`} control={control}
                        render={({ field }) => (
                          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                            {['#10B981', '#4F46E5', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6B7280'].map(c => (
                              <Box key={c} onClick={() => field.onChange(c)}
                                sx={{
                                  width: 22, height: 22, borderRadius: '50%', backgroundColor: c, cursor: 'pointer',
                                  border: field.value === c ? '3px solid white' : '2px solid transparent',
                                  outline: field.value === c ? `2px solid ${c}` : 'none',
                                  transition: 'transform 0.15s',
                                  '&:hover': { transform: 'scale(1.2)' }
                                }}
                              />
                            ))}
                            <input type='color' value={field.value || '#10B981'}
                              onChange={e => field.onChange(e.target.value)}
                              style={{ width: 22, height: 22, border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 0 }}
                            />
                          </Box>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}><Divider /></Grid>

                    {/* Credit & Accrual */}
                    <Grid item xs={12}>
                      <Typography variant='overline' color='text.secondary'>Credit & Accrual</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Controller name={`${p}.credit.totalPerYear`} control={control}
                        render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Total Days / Year' />}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Controller name={`${p}.credit.frequency`} control={control}
                        render={({ field }) => (
                          <CustomTextField {...field} select fullWidth label='Credit Frequency'>
                            <MenuItem value='NONE'>None</MenuItem>
                            <MenuItem value='MONTHLY'>Monthly</MenuItem>
                            <MenuItem value='QUARTERLY'>Quarterly</MenuItem>
                            <MenuItem value='YEARLY'>Yearly</MenuItem>
                          </CustomTextField>
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Controller name={`${p}.credit.accrualType`} control={control}
                        render={({ field }) => (
                          <CustomTextField {...field} select fullWidth label='Accrual Type'>
                            <MenuItem value='NONE'>None</MenuItem>
                            <MenuItem value='MONTHLY'>Monthly</MenuItem>
                            <MenuItem value='QUARTERLY'>Quarterly</MenuItem>
                            <MenuItem value='YEARLY'>Yearly</MenuItem>
                          </CustomTextField>
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Controller name={`${p}.credit.accrualDay`} control={control}
                        render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Accrual Day' inputProps={{ min: 1, max: 31 }} />}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Controller name={`${p}.credit.roundingRule`} control={control}
                        render={({ field }) => (
                          <CustomTextField {...field} select fullWidth label='Rounding Rule'>
                            <MenuItem value='ROUND'>Round (Nearest)</MenuItem>
                            <MenuItem value='FLOOR'>Floor (Round Down)</MenuItem>
                            <MenuItem value='CEIL'>Ceiling (Round Up)</MenuItem>
                          </CustomTextField>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Controller name={`${p}.credit.probationApplicable`} control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                            label='Probation Applicable (credit counts during probation)'
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}><Divider /></Grid>

                    {/* Balance */}
                    <Grid item xs={12}>
                      <Typography variant='overline' color='text.secondary'>Balance</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Controller name={`${p}.balance.maxBalance`} control={control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            type='number'
                            label='Max Balance (days)'
                            placeholder='No limit'
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Controller name={`${p}.balance.allowNegative`} control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                            label='Allow Negative Balance'
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Controller name={`${p}.balance.maxNegative`} control={control}
                        render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Max Negative Days' />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller name={`${p}.balance.resetCycle`} control={control}
                        render={({ field }) => (
                          <CustomTextField {...field} select fullWidth label='Reset Cycle'>
                            <MenuItem value='YEARLY'>Yearly</MenuItem>
                            <MenuItem value='FISCAL_YEAR'>Fiscal Year</MenuItem>
                            <MenuItem value='NEVER'>Never</MenuItem>
                          </CustomTextField>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}><Divider /></Grid>

                    {/* Carry Forward */}
                    <Grid item xs={12}>
                      <Typography variant='overline' color='text.secondary'>Carry Forward</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Controller name={`${p}.carryForward.allowed`} control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                            label='Allow Carry Forward'
                          />
                        )}
                      />
                    </Grid>
                    {cfAllowed && (
                      <>
                        <Grid item xs={6} sm={4}>
                          <Controller name={`${p}.carryForward.max`} control={control}
                            render={({ field }) => (
                              <CustomTextField {...field} fullWidth type='number' label='Max Carry Forward (days)' />
                            )}
                          />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Controller name={`${p}.carryForward.expiryDays`} control={control}
                            render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Expiry (days)' />}
                          />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Controller name={`${p}.carryForward.expiryAction`} control={control}
                            render={({ field }) => (
                              <CustomTextField {...field} select fullWidth label='Expiry Action'>
                                <MenuItem value='LAPSE'>Lapse (Auto-expire)</MenuItem>
                                <MenuItem value='ENCASH'>Encash (Pay out)</MenuItem>
                              </CustomTextField>
                            )}
                          />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Controller name={`${p}.carryForward.carryForwardOn`} control={control}
                            render={({ field }) => (
                              <CustomTextField {...field} select fullWidth label='Carry Forward On'>
                                <MenuItem value='YEAR_END'>Year End</MenuItem>
                                <MenuItem value='MONTH_END'>Month End</MenuItem>
                              </CustomTextField>
                            )}
                          />
                        </Grid>
                      </>
                    )}

                    <Grid item xs={12}><Divider /></Grid>

                    {/* Encashment */}
                    <Grid item xs={12}>
                      <Typography variant='overline' color='text.secondary'>Encashment</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Controller name={`${p}.encashment.allowed`} control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                            label='Allow Encashment'
                          />
                        )}
                      />
                    </Grid>
                    {encAllowed && (
                      <>
                        <Grid item xs={6} sm={4}>
                          <Controller name={`${p}.encashment.maxDays`} control={control}
                            render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Max Encashment Days' />}
                          />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Controller name={`${p}.encashment.minBalance`} control={control}
                            render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Min Balance Required' />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>Applicable At</Typography>
                          <Controller name={`${p}.encashment.applicableAt`} control={control}
                            render={({ field }) => (
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {['YEAR_END', 'RESIGNATION', 'RETIREMENT', 'ANYTIME'].map(type => {
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
                        <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
                          <Controller name={`${p}.encashment.taxable`} control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                                label='Taxable'
                              />
                            )}
                          />
                        </Grid>
                      </>
                    )}

                    <Grid item xs={12}><Divider /></Grid>

                    {/* Application Rules */}
                    <Grid item xs={12}>
                      <Typography variant='overline' color='text.secondary'>Application Rules</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Controller name={`${p}.application.minDays`} control={control}
                        render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Min Days' inputProps={{ step: 0.5, min: 0.5 }} />}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Controller name={`${p}.application.maxDays`} control={control}
                        render={({ field }) => (
                          <CustomTextField fullWidth type='number' label='Max Days' placeholder='No limit'
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Controller name={`${p}.application.maxPerMonth`} control={control}
                        render={({ field }) => (
                          <CustomTextField fullWidth type='number' label='Max Per Month' placeholder='No limit'
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Controller name={`${p}.application.advanceNoticeDays`} control={control}
                        render={({ field }) => (
                          <CustomTextField {...field} fullWidth type='number' label='Min Notice Days' />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <Controller name={`${p}.application.allowHalfDay`} control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                              label='Allow Half Day'
                            />
                          )}
                        />
                        <Controller name={`${p}.application.allowBackdated`} control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                              label='Allow Backdated'
                            />
                          )}
                        />
                        <Controller name={`${p}.application.allowContinuousWithHoliday`} control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                              label='Allow Continuous with Holiday'
                            />
                          )}
                        />
                        <Controller name={`${p}.sandwichRule.enabled`} control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                              label='Sandwich Rule'
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                    {watch(`${p}.application.allowBackdated`) && (
                      <Grid item xs={12} sm={4}>
                        <Controller name={`${p}.application.backdatedAllowedDays`} control={control}
                          render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Backdated Allowed Days' />}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12} sm={4}>
                      <Controller name={`${p}.application.requireReasonMinLength`} control={control}
                        render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Min Reason Length (chars)' />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Controller name={`${p}.application.cooldownDays`} control={control}
                        render={({ field }) => (
                          <CustomTextField {...field} fullWidth type='number' label='Cooldown Days'
                            helperText='Days before applying same leave type again'
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}><Divider /></Grid>

                    {/* Document Rule */}
                    <Grid item xs={12}>
                      <Typography variant='overline' color='text.secondary'>Document Rule</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Controller name={`${p}.documentRule.required`} control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                            label='Document Required (e.g., medical certificate)'
                          />
                        )}
                      />
                    </Grid>
                    {docReq && (
                      <>
                        <Grid item xs={12} sm={4}>
                          <Controller name={`${p}.documentRule.afterDays`} control={control}
                            render={({ field }) => (
                              <CustomTextField fullWidth type='number' label='Required After (days)'
                                helperText='Require doc only if leave exceeds X days'
                                value={field.value ?? ''}
                                onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>Allowed File Types</Typography>
                          <Controller name={`${p}.documentRule.allowedTypes`} control={control}
                            render={({ field }) => (
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {['pdf', 'jpg', 'jpeg', 'png'].map(type => {
                                  const checked = field.value?.includes(type)
                                  return (
                                    <Chip key={type} label={type.toUpperCase()} clickable size='small'
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
                      </>
                    )}

                    <Grid item xs={12}><Divider /></Grid>

                    {/* Applicability & Restrictions */}
                    <Grid item xs={12}>
                      <Typography variant='overline' color='text.secondary'>Applicability & Restrictions</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller name={`${p}.genderRestriction`} control={control}
                        render={({ field }) => (
                          <CustomTextField {...field} select fullWidth label='Gender Restriction'
                            helperText='e.g., Maternity Leave → Female only'>
                            <MenuItem value='ALL'>All Genders</MenuItem>
                            <MenuItem value='MALE'>Male Only</MenuItem>
                            <MenuItem value='FEMALE'>Female Only</MenuItem>
                            <MenuItem value='OTHER'>Other</MenuItem>
                          </CustomTextField>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller name={`${p}.minTenureMonths`} control={control}
                        render={({ field }) => (
                          <CustomTextField {...field} fullWidth type='number' label='Min Tenure (months)'
                            helperText='Employee must complete X months before eligible'
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>Applicable Employment Types</Typography>
                      <Controller name={`${p}.applicableEmploymentTypes`} control={control}
                        render={({ field }) => (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'].map(type => {
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
                  </>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )
      })}
    </Box>
  )
}

// ─── Policy Drawer ────────────────────────────────────────────────────────────

const LeavePolicyDrawer = ({ open, onClose, editData, onSuccess }) => {
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(editData?._id)
  const { leaveTypes: masterLeaveTypes, loading: masterLoading } = useMasterLeaveTypes()
  const { departments: departmentOptions, designations: designationOptions, roles: roleOptions, loading: applicabilityLoading } = useApplicabilityOptions()

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: defaultPolicyValues
  })

  useEffect(() => {
    if (open) {
      if (editData) {
        // ✅ Convert IDs to objects for multiselect fields
        const convertedApplicableFor = {
          departments: (editData.applicableFor?.departments || []).map(id => {
            if (typeof id === 'string') {
              // Find full object from options, else keep as string ID
              const found = departmentOptions.find(d => d._id === id || d.id === id)
              return found || id  // Return ID string if not found
            }
            // Already an object (with _id property)
            if (id && typeof id === 'object' && (id._id || id.id)) {
              // Try to find matching object from options
              const found = departmentOptions.find(d => d._id === id._id || d.id === id.id)
              return found || id  // Return original object if not found
            }
            return id
          }),
          designations: (editData.applicableFor?.designations || []).map(id => {
            if (typeof id === 'string') {
              const found = designationOptions.find(d => d._id === id || d.id === id)
              return found || id
            }
            if (id && typeof id === 'object' && (id._id || id.id)) {
              const found = designationOptions.find(d => d._id === id._id || d.id === id.id)
              return found || id
            }
            return id
          }),
          roles: (editData.applicableFor?.roles || []).map(id => {
            if (typeof id === 'string') {
              const found = roleOptions.find(r => r._id === id || r.id === id || r.slug === id)
              return found || id
            }
            if (id && typeof id === 'object' && (id._id || id.id)) {
              const found = roleOptions.find(r => r._id === id._id || r.id === id.id)
              return found || id
            }
            return id
          }),
          employmentTypes: editData.applicableFor?.employmentTypes || ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']
        }

        reset({
          ...defaultPolicyValues,
          ...editData,
          applicableFor: convertedApplicableFor,
          leaveTypes: (editData.leaveTypes || []).map(lt => ({
            ...defaultPolicyLeaveEntry,
            leaveTypeId: lt.leaveTypeId || '',
            name: lt.name || '',
            code: lt.code || '',
            color: lt.color || '#10B981',                    // ✅ 'color' not 'colorCode'
            isPaid: lt.isPaid ?? true,
            isActive: lt.isActive ?? true,
            isPublic: lt.isPublic ?? true,
            genderRestriction: lt.genderRestriction ?? 'ALL', // ✅ string only
            applicableEmploymentTypes: lt.applicableEmploymentTypes ?? ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'],
            minTenureMonths: lt.minTenureMonths ?? 0,
            cooldownDays: lt.cooldownDays ?? 0,
            credit: lt.credit ?? defaultPolicyLeaveEntry.credit,
            balance: lt.balance ?? defaultPolicyLeaveEntry.balance,
            carryForward: lt.carryForward ?? defaultPolicyLeaveEntry.carryForward,
            encashment: lt.encashment ?? defaultPolicyLeaveEntry.encashment,
            application: lt.application ?? defaultPolicyLeaveEntry.application,
            documentRule: lt.documentRule ?? defaultPolicyLeaveEntry.documentRule,
            sandwichRule: lt.sandwichRule ?? defaultPolicyLeaveEntry.sandwichRule,
          }))
        })
      } else {
        reset(defaultPolicyValues)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editData, reset])

  // ✅ Strip internal/meta fields before sending to backend
  const stripIds = (value) => {
    if (Array.isArray(value)) return value.map(stripIds)
    if (value && typeof value === 'object') {
     const keysToRemove = new Set([
'_id', 'id', 'tenantId', 'createdAt', 'updatedAt',
'createdBy', 'updatedBy', 'archivedAt', 'archivedBy',
'activatedAt', 'activatedBy', '__v', 'version'
// isActive yahan nahi — leaveType ke andar chahiye
])
      return Object.entries(value).reduce((acc, [key, val]) => {
        if (keysToRemove.has(key)) return acc
        acc[key] = stripIds(val)
        return acc
      }, {})
    }
    return value
  }

 const onSubmit = async (data) => {
  const { leaveTypes, ...metaData } = data

  // Remove top-level virtual/internal fields
  delete metaData.isActive
  delete metaData.totalLeaveTypesCount
  delete metaData.activeLeaveTypes

  // Extract IDs from selected objects for applicability
  if (metaData.applicableFor) {
    metaData.applicableFor = {
      departments: (metaData.applicableFor.departments || []).map(d => d._id || d.id || d),
      designations: (metaData.applicableFor.designations || []).map(d => d._id || d.id || d),
      roles: (metaData.applicableFor.roles || []).map(r => r._id || r.id || r.slug || r),
      employmentTypes: metaData.applicableFor.employmentTypes || []
    }
  }

  const cleanMeta = stripIds(metaData)
  const cleanLeaveTypes = stripIds(leaveTypes)

  setSaving(true)
  try {
    const url = isEdit
      ? `/api/v1/leave-policies/${editData._id}`
      : `/api/v1/leave-policies`

    // Step 1 — Create or update policy meta
    const metaRes = isEdit
      ? await axiosRequest.put(url, cleanMeta)
      : await axiosRequest.post(url, cleanMeta)

    if (!metaRes?.success) return

    const policyId = isEdit ? editData._id : metaRes.data?._id

    // Step 2 — Update leave types (only if any added)
    if (cleanLeaveTypes?.length > 0) {
      await axiosRequest.put(
        `/api/v1/leave-policies/${policyId}/leave-types`,
        { leaveTypes: cleanLeaveTypes }
      )
    }

    toast.success(`Policy ${isEdit ? 'updated' : 'created'} successfully`)
    onSuccess(metaRes.data, isEdit)
    onClose()

  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to save policy')
  } finally {
    setSaving(false)
  }
}

  return (
    <Drawer open={open} anchor='right' onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 760 } } }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 5, py: 4, borderBottom: t => `1px solid ${t.palette.divider}`
      }}>
        <Box>
          <Typography variant='h6'>{isEdit ? 'Edit Leave Policy' : 'New Leave Policy'}</Typography>
          <Typography variant='caption' color='text.secondary'>
            Group leave types and define policy-level overrides
          </Typography>
        </Box>
        <IconButton onClick={onClose} size='small'><Icon icon='tabler:x' /></IconButton>
      </Box>

      <Box component='form' onSubmit={handleSubmit(onSubmit)}
        sx={{ px: 5, py: 4, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}
      >
        {/* Policy Meta */}
        <Box>
          <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
            Policy Details
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Controller name='name' control={control} rules={{ required: 'Policy name required' }}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Policy Name *'
                    placeholder='e.g., Standard Leave Policy 2026'
                    error={!!errors.name} helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller name='effectiveFrom' control={control} rules={{ required: 'Effective from date required' }}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='date' label='Effective From *'
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller name='effectiveTo' control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth type='date' label='Effective To'
                    InputLabelProps={{ shrink: true }}
                    placeholder='Leave blank for no end date'
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value || null)}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name='approvalFlow.type' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select fullWidth label='Approval Flow *'
                    helperText='L1 = Manager only · L1_L2 = Manager → HR · AUTO = Auto-approve'
                  >
                    <MenuItem value='L1'>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon icon='tabler:user' fontSize='1rem' />
                        L1 — Manager Only
                      </Box>
                    </MenuItem>
                    <MenuItem value='L1_L2'>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon icon='tabler:users' fontSize='1rem' />
                        L1 → L2 — Manager → HR
                      </Box>
                    </MenuItem>
                    <MenuItem value='AUTO'>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon icon='tabler:robot' fontSize='1rem' />
                        AUTO — Auto Approve
                      </Box>
                    </MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name='status' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select fullWidth label='Status'>
                    <MenuItem value='draft'>Draft</MenuItem>
                    <MenuItem value='active'>Active</MenuItem>
                    <MenuItem value='inactive'>Inactive</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller name='description' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth multiline rows={2} label='Description'
                    placeholder='Brief description of this leave policy'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller name='changeNote' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Change Note'
                    placeholder='Describe what changed in this version (for audit trail)'
                    helperText='Required for tracking policy version history'
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Approval Flow Info */}
        {watch('approvalFlow.type') === 'L1_L2' && (
          <Alert severity='info' sx={{ mt: 2 }}>
            <Typography variant='body2'>
              <strong>L1 → L2 Flow:</strong> Leave requests will first go to the employee's Reporting Manager.
              After L1 approval, it will route to HR Manager (role: <code>hr_manager</code>) in the same unit.
            </Typography>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
              ⚠️ Ensure employees have Reporting Manager assigned, and unit has an active HR Manager user.
            </Typography>
          </Alert>
        )}

        {watch('approvalFlow.type') === 'AUTO' && (
          <Alert severity='warning' sx={{ mt: 2 }}>
            <Typography variant='body2'>
              <strong>AUTO Approval:</strong> All leave requests will be automatically approved without human review.
              Use only for leave types that don't require approval (e.g., Comp Off).
            </Typography>
          </Alert>
        )}

        <Divider />

        {/* Applicability */}
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

            {/* Departments — Autocomplete multi-select */}
            <Grid item xs={12} sm={6}>
              <Typography variant='body2' fontWeight={500} sx={{ mb: 1 }}>Departments</Typography>
              <Controller name='applicableFor.departments' control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    size='small'
                    loading={applicabilityLoading}
                    options={departmentOptions}
                    getOptionLabel={option => {
                      // Handle both string IDs and objects
                      if (typeof option === 'string') return departmentOptions.find(d => d._id === option)?.name || option
                      return option?.name || ''
                    }}
                    isOptionEqualToValue={(option, value) => {
                      const valueId = value._id || value.id || value
                      return option._id === valueId || option.id === valueId
                    }}
                    value={field.value || []}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    renderInput={params => (
                      <TextField {...params} placeholder='Select departments' />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        // Handle both object and string ID formats
                        const id = typeof option === 'string' ? option : (option._id || option.id)
                        const name = typeof option === 'string' ? option : (option.name || option)
                        return (
                          <Chip
                            {...getTagProps({ index })}
                            key={id}
                            label={name}
                            size='small'
                            variant='tonal'
                            color='primary'
                          />
                        )
                      })
                    }
                  />
                )}
              />
              <Typography variant='caption' color='text.secondary'>Target specific departments</Typography>
            </Grid>

            {/* Designations — Autocomplete multi-select */}
            <Grid item xs={12} sm={6}>
              <Typography variant='body2' fontWeight={500} sx={{ mb: 1 }}>Designations</Typography>
              <Controller name='applicableFor.designations' control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    size='small'
                    loading={applicabilityLoading}
                    options={designationOptions}
                    getOptionLabel={option => {
                      // Handle both string IDs and objects
                      if (typeof option === 'string') return designationOptions.find(d => d._id === option)?.name || option
                      return option?.name || ''
                    }}
                    isOptionEqualToValue={(option, value) => {
                      const valueId = value._id || value.id || value
                      return option._id === valueId || option.id === valueId
                    }}
                    value={field.value || []}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    renderInput={params => (
                      <TextField {...params} placeholder='Select designations' />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        // Handle both object and string ID formats
                        const id = typeof option === 'string' ? option : (option._id || option.id)
                        const name = typeof option === 'string' ? option : (option.name || option)
                        return (
                          <Chip
                            {...getTagProps({ index })}
                            key={id}
                            label={name}
                            size='small'
                            variant='tonal'
                            color='warning'
                          />
                        )
                      })
                    }
                  />
                )}
              />
              <Typography variant='caption' color='text.secondary'>Target specific job titles</Typography>
            </Grid>

            {/* Roles — Autocomplete multi-select */}
            <Grid item xs={12} sm={6}>
              <Typography variant='body2' fontWeight={500} sx={{ mb: 1 }}>Roles</Typography>
              <Controller name='applicableFor.roles' control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    size='small'
                    loading={applicabilityLoading}
                    options={roleOptions}
                    getOptionLabel={option => {
                      // Handle both string IDs and objects
                      if (typeof option === 'string') {
                        const found = roleOptions.find(r => r._id === option || r.slug === option)
                        return found?.name || found?.slug || option
                      }
                      return option?.name || option?.slug || ''
                    }}
                    isOptionEqualToValue={(option, value) => {
                      const valueId = value._id || value.id || value
                      return option._id === valueId || option.id === valueId
                    }}
                    value={field.value || []}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    renderInput={params => (
                      <TextField {...params} placeholder='Select roles' />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        // Handle both object and string ID formats
                        const id = typeof option === 'string' ? option : (option._id || option.id)
                        const name = typeof option === 'string' ? option : (option.name || option.slug || option)
                        return (
                          <Chip
                            {...getTagProps({ index })}
                            key={id}
                            label={name}
                            size='small'
                            variant='tonal'
                            color='secondary'
                          />
                        )
                      })
                    }
                  />
                )}
              />
              <Typography variant='caption' color='text.secondary'>Target specific roles</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Sandwich Rule */}
        <Box>
          <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
            Sandwich Rule
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Controller name='sandwichRule.enabled' control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                    label='Enable Sandwich Rule'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Controller name='sandwichRule.includeHolidays' control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                    label='Include Holidays'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Controller name='sandwichRule.includeWeekends' control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                    label='Include Weekends'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name='sandwichRule.consecutiveLeaveThreshold' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number' label='Consecutive Threshold (days)' />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Leave Types */}
        <LeaveTypesSection
          control={control}
          watch={watch}
          setValue={setValue}
          masterLeaveTypes={masterLeaveTypes}
          masterLoading={masterLoading}
        />

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

// ─── Policy Card Actions Menu ─────────────────────────────────────────────────

const PolicyActionsMenu = ({ policy, onEdit, onActivate, onDeactivate, onArchive, onDelete, actionLoading }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const status = policy.status

  const close = () => setAnchorEl(null)
  const handle = (fn) => () => { close(); fn(policy) }
  const isLoading = actionLoading === policy._id

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
            <ListItemIcon><Icon icon='tabler:circle-check' fontSize='1rem' color='#10B981' /></ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}
        {status === 'active' && onDeactivate && (
          <MenuItem onClick={handle(onDeactivate)}>
            <ListItemIcon><Icon icon='tabler:circle-pause' fontSize='1rem' color='#F59E0B' /></ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        )}
        {(status === 'active' || status === 'inactive') && onArchive && (
          <MenuItem onClick={handle(onArchive)}>
            <ListItemIcon><Icon icon='tabler:archive' fontSize='1rem' color='#6B7280' /></ListItemIcon>
            <ListItemText>Archive</ListItemText>
          </MenuItem>
        )}
        {(status === 'draft' || status === 'inactive' || status === 'archived') && (
          <MenuItem onClick={handle(onDelete)} sx={{ color: 'error.main' }}>
            <ListItemIcon><Icon icon='tabler:trash' fontSize='1rem' color='inherit' style={{ color: 'var(--mui-palette-error-main)' }} /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

// ─── TabLeavePolicy ───────────────────────────────────────────────────────────

const TabLeavePolicy = () => {
  const roleSlug   = useSelector(selectRoleSlug)
  const canActivate = roleSlug === 'unit_admin'
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  const [confirm, setConfirm] = useState({
    open: false, title: '', message: '', action: null, color: 'primary', label: ''
  })

  const fetchPolicies = useCallback(async (overridePage) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      params.set('page', (overridePage ?? page) + 1)
      params.set('limit', rowsPerPage)

      const res = await axiosRequest.get(`/api/v1/leave-policies?${params.toString()}`)
      if (res?.success) {
        setPolicies(res.data?.policies ?? [])
        setPagination(res.data?.pagination ?? { total: 0, pages: 1 })
      }
    } catch {
      toast.error('Failed to load leave policies')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, page, rowsPerPage])

  useEffect(() => { fetchPolicies() }, [fetchPolicies])

  const handleSuccess = (record, isEdit) => {
    const policy = record?.policies?.[0] ?? record
    if (isEdit) {
      setPolicies(prev => prev.map(p => p._id === policy._id ? policy : p))
    } else {
      fetchPolicies()
    }
  }

  const doAction = async (policy, method, urlSuffix, successMsg, updateFn) => {
    setActionLoading(policy._id)
    try {
      const res = method === 'delete'
        ? await axiosRequest.delete(`/api/v1/leave-policies/${policy._id}${urlSuffix}`)
        : await axiosRequest[method](`/api/v1/leave-policies/${policy._id}${urlSuffix}`)

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

  const openConfirm = (title, message, action, color = 'primary', label = 'Confirm') => {
    setConfirm({ open: true, title, message, action, color, label })
  }

  const handleActivate = (policy) => openConfirm(
    'Activate Policy',
    `Activate "${policy.name}"? It will become the active policy for matched employees.`,
    () => doAction(policy, 'patch', '/activate', 'Policy activated', updated => {
      const p = updated?.policies?.[0] ?? updated
      setPolicies(prev => prev.map(x => x._id === p._id ? p : x))
    }),
    'success', 'Activate'
  )

  const handleDeactivate = (policy) => openConfirm(
    'Deactivate Policy',
    `Deactivate "${policy.name}"? Employees won't be able to apply for new leaves under this policy.`,
    () => doAction(policy, 'patch', '/deactivate', 'Policy deactivated', updated => {
      const p = updated?.policies?.[0] ?? updated
      setPolicies(prev => prev.map(x => x._id === p._id ? p : x))
    }),
    'warning', 'Deactivate'
  )

  const handleArchive = (policy) => openConfirm(
    'Archive Policy',
    `Archive "${policy.name}"? It will be read-only and can no longer be activated.`,
    () => doAction(policy, 'patch', '/archive', 'Policy archived', updated => {
      const p = updated?.policies?.[0] ?? updated
      setPolicies(prev => prev.map(x => x._id === p._id ? p : x))
    }),
    'default', 'Archive'
  )

  const handleDelete = (policy) => openConfirm(
    'Delete Policy',
    `Permanently delete "${policy.name}"? This cannot be undone.`,
    () => doAction(policy, 'delete', '', 'Policy deleted', () => {
      setPolicies(prev => prev.filter(p => p._id !== policy._id))
    }),
    'error', 'Delete'
  )

  const handleEdit = (policy) => {
    setEditData(policy)
    setDrawerOpen(true)
  }

  const execConfirm = async () => {
    if (confirm.action) await confirm.action()
    setConfirm(c => ({ ...c, open: false }))
  }

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

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

  return (
    <Card>
      <CardHeader
        title='Leave Policies'
        subheader='Group master leave types into policies and override settings per policy'
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
          size='small'
          placeholder='Search policies...'
          value={search}
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
            {[1, 2, 3].map(i => <Skeleton key={i} variant='rectangular' height={110} sx={{ borderRadius: 2 }} />)}
          </Box>
        ) : policies.length === 0 ? (
          <Box sx={{ p: 5 }}>
            <Alert severity='info'>
              {search || statusFilter !== 'all'
                ? 'No policies match your filters. Try adjusting the search or status.'
                : 'No leave policies yet. Create your first one using the button above.'}
            </Alert>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {policies.map((policy, idx) => (
              <Box key={policy._id}
                sx={{
                  px: 5, py: 4,
                  borderBottom: idx < policies.length - 1 ? t => `1px solid ${t.palette.divider}` : 'none',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  gap: 3, flexWrap: 'wrap',
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background 0.15s'
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                    <Typography fontWeight={600} variant='body1'>{policy.name}</Typography>
                    <StatusChip status={policy.status} />
                    {policy.version != null && (
                      <Chip label={`v${policy.version}`} size='small' variant='outlined' sx={{ fontSize: '0.7rem', height: 20 }} />
                    )}
                  </Box>

                  {policy.description && (
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1, maxWidth: 600 }} noWrap>
                      {policy.description}
                    </Typography>
                  )}

                  <Typography variant='caption' color='text.secondary'>
                    Effective: {formatDate(policy.effectiveFrom)}
                    {policy.effectiveTo ? ` → ${formatDate(policy.effectiveTo)}` : ''}
                    {' · '}
                    {policy.totalLeaveTypesCount ?? policy.leaveTypes?.length ?? 0} leave type{(policy.totalLeaveTypesCount ?? policy.leaveTypes?.length) !== 1 ? 's' : ''}
                    {policy.updatedAt && ` · Updated ${formatDate(policy.updatedAt)}`}
                  </Typography>

                  {policy.leaveTypes?.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                      {policy.leaveTypes.map((lt, i) => (
                        <Tooltip
                          key={lt._id || lt.code || i}
                          title={`${lt.credit?.totalPerYear ?? '?'} days/yr · ${lt.isPaid ? 'Paid' : 'Unpaid'}${lt.carryForward?.allowed ? ' · CF' : ''}`}
                        >
                          <Chip
                            label={lt.code || lt.name}
                            size='small'
                            variant='outlined'
                            sx={{
                              borderColor: lt.color || '#6B7280',
                              color: lt.color || 'text.primary',
                              backgroundColor: `${lt.color || '#6B7280'}18`
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    {policy.applicableFor?.employmentTypes?.length > 0
                      ? policy.applicableFor.employmentTypes.map(type => (
                        <Chip key={type} label={type} size='small' variant='tonal' color='secondary' />
                      ))
                      : <Chip label='All employees' size='small' variant='tonal' color='secondary' />
                    }
                    {policy.applicableFor?.departments?.length > 0 && (
                      <Chip
                        label={`${policy.applicableFor.departments.length} dept${policy.applicableFor.departments.length > 1 ? 's' : ''}`}
                        size='small' variant='tonal' color='info'
                        icon={<Icon icon='tabler:building' fontSize='0.75rem' />}
                      />
                    )}
                    {policy.applicableFor?.roles?.length > 0 && (
                      <Chip
                        label={`${policy.applicableFor.roles.length} role${policy.applicableFor.roles.length > 1 ? 's' : ''}`}
                        size='small' variant='tonal' color='info'
                        icon={<Icon icon='tabler:user-check' fontSize='0.75rem' />}
                      />
                    )}
                    {policy.applicableFor?.locations?.length > 0 && (
                      <Chip
                        label={policy.applicableFor.locations.join(', ')}
                        size='small' variant='tonal' color='info'
                        icon={<Icon icon='tabler:map-pin' fontSize='0.75rem' />}
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  {policy.status !== 'archived' && (
                    <Tooltip title='Edit Policy'>
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
            ))}
          </Box>
        )}

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

      <LeavePolicyDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editData={editData}
        onSuccess={handleSuccess}
      />

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

export default TabLeavePolicy
