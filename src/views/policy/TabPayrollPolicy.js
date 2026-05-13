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
import TableRow from '@mui/material/TableRow'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']

const STATUS_CONFIG = {
  active:   { color: 'success', icon: 'tabler:circle-check',    label: 'Active'   },
  inactive: { color: 'warning', icon: 'tabler:circle-pause',    label: 'Inactive' },
  draft:    { color: 'default', icon: 'tabler:file-description', label: 'Draft'   },
  archived: { color: 'error',   icon: 'tabler:archive',          label: 'Archived' }
}

// ── defaultValues — matches REAL API field names exactly ──────────────────────
// salaryCycle.salaryDate / payrollRunDate / workingDaysCalc / fixedWorkingDays
// lop (not lopRule)
// deductionPriority.leaveDeductionPriority / autoDeductInOrder
// taxCompliance (pf/esi/tds/pt/gratuity)
// overtimePay (not overtimePayment)
// proRata, payslipConfig, arrear
// applicableFor (departments/roles/locations/employmentTypes)

const defaultValues = {
  name: '',
  effectiveFrom: '',
  effectiveTo: '',
  applicableFor: {
    departments: [],
    roles: [],
    locations: [],
    employmentTypes: []
  },
  salaryCycle: {
    type: 'monthly',
    startDay: 1,
    endDay: 31,
    salaryDate: 1,
    payrollRunDate: 28,
    workingDaysCalc: 'actual',
    fixedWorkingDays: 26
  },
  lop: {
    enabled: true,
    calculation: 'per_day',
    perDayFormula: 'monthly_salary/working_days',
    roundingRule: 'round2',
    includeHolidaysInLOP: false,
    includeWeekendsInLOP: false
  },
  deductionPriority: {
    leaveDeductionPriority: ['CL', 'SL', 'AL'],
    autoDeductInOrder: true
  },
  unpaidLeave: {
    code: 'LWP',
    autoAssign: true,
    maxDaysPerMonth: null,
    maxDaysPerYear: null,
    countWeekendsBetween: false,
    countHolidaysBetween: false
  },
  taxCompliance: {
    tdsEnabled: true,
    tdsSurchargeEnabled: false,
    pfEnabled: true,
    pfEmployeeRate: 12,
    pfEmployerRate: 12,
    pfCeilingAmount: 15000,
    pfApplyOnActualBasic: false,
    esiEnabled: true,
    esiEmployeeRate: 0.75,
    esiEmployerRate: 3.25,
    esiWageCeiling: 21000,
    ptEnabled: false,
    ptState: '',
    gratuityEnabled: false,
    gratuityRate: 4.81
  },
  overtimePay: {
    enabled: false,
    rateMultiplier: 1.5,
    capHoursPerMonth: null,
    payableComponent: 'BASIC'
  },
  proRata: {
    enabled: true,
    basis: 'working_days',
    fixedDivisor: 26,
    includeJoiningDay: true,
    includeExitDay: true
  },
  payslipConfig: {
    showLeaveBalance: true,
    showAttendanceSummary: true,
    showYTDEarnings: true,
    showYTDTax: true,
    digitSignatureEnabled: false,
    companyLogoOnPayslip: true,
    footerNote: ''
  },
  arrear: {
    enabled: true,
    autoCalculate: true,
    maxBackMonths: 3
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
      label={cfg.label} size='small' color={cfg.color} variant='tonal'
      sx={{ '& .MuiChip-icon': { ml: 1 } }}
    />
  )
}

// ─── Applicability Section ────────────────────────────────────────────────────

const ApplicabilitySection = ({ control }) => {
  const [roleInput, setRoleInput] = useState('')
  const [locationInput, setLocationInput] = useState('')

  const addTag = (field, val) => {
    const trimmed = val.trim().replace(/,$/, '')
    if (trimmed && !field.value?.includes(trimmed)) {
      field.onChange([...(field.value || []), trimmed])
    }
  }

  return (
    <Box>
      <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 1 }}>Applicability</Typography>
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
        Leave all empty for a catch-all policy. Priority: Role {'>'} Dept {'>'} Location {'>'} Employment Type {'>'} Catch-all
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
                      color={checked ? 'primary' : 'default'} variant={checked ? 'filled' : 'outlined'}
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

        {/* Roles */}
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
                  <CustomTextField size='small' fullWidth placeholder='e.g. manager'
                    value={roleInput} onChange={e => setRoleInput(e.target.value)}
                    onKeyDown={e => {
                      if ((e.key === 'Enter' || e.key === ',') && roleInput.trim()) {
                        e.preventDefault(); addTag(field, roleInput); setRoleInput('')
                      }
                    }}
                  />
                  <Button size='small' variant='tonal' onClick={() => { addTag(field, roleInput); setRoleInput('') }}>Add</Button>
                </Box>
                <Typography variant='caption' color='text.secondary'>Press Enter or comma to add</Typography>
              </Box>
            )}
          />
        </Grid>

        {/* Locations */}
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
                  <CustomTextField size='small' fullWidth placeholder='e.g. Mumbai'
                    value={locationInput} onChange={e => setLocationInput(e.target.value)}
                    onKeyDown={e => {
                      if ((e.key === 'Enter' || e.key === ',') && locationInput.trim()) {
                        e.preventDefault(); addTag(field, locationInput); setLocationInput('')
                      }
                    }}
                  />
                  <Button size='small' variant='tonal' onClick={() => { addTag(field, locationInput); setLocationInput('') }}>Add</Button>
                </Box>
                <Typography variant='caption' color='text.secondary'>Matches employee city</Typography>
              </Box>
            )}
          />
        </Grid>

      </Grid>
    </Box>
  )
}

// ─── Section Header helper ────────────────────────────────────────────────────

const SectionHeader = ({ title, subtitle }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant='overline' color='text.secondary'>{title}</Typography>
    {subtitle && <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>{subtitle}</Typography>}
  </Box>
)

// ─── Payroll Policy Drawer ────────────────────────────────────────────────────

const PayrollPolicyDrawer = ({ open, onClose, editData, onSuccess }) => {
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(editData?._id)

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues })

  const lopEnabled          = watch('lop.enabled')
  const lopCalc             = watch('lop.calculation')
  const overtimeEnabled     = watch('overtimePay.enabled')
  const workingDaysCalc     = watch('salaryCycle.workingDaysCalc')
  const pfEnabled           = watch('taxCompliance.pfEnabled')
  const esiEnabled          = watch('taxCompliance.esiEnabled')
  const ptEnabled           = watch('taxCompliance.ptEnabled')
  const gratuityEnabled     = watch('taxCompliance.gratuityEnabled')
  const proRataEnabled      = watch('proRata.enabled')
  const arrearEnabled       = watch('arrear.enabled')

  useEffect(() => {
    if (open) {
      if (editData) {
        reset({
          name: editData.name || '',
          effectiveFrom: editData.effectiveFrom ? editData.effectiveFrom.split('T')[0] : '',
          effectiveTo: editData.effectiveTo ? editData.effectiveTo.split('T')[0] : '',
          applicableFor: {
            departments: editData.applicableFor?.departments || [],
            roles: editData.applicableFor?.roles || [],
            locations: editData.applicableFor?.locations || [],
            employmentTypes: editData.applicableFor?.employmentTypes || []
          },
          salaryCycle: {
            type: editData.salaryCycle?.type || 'monthly',
            startDay: editData.salaryCycle?.startDay ?? 1,
            endDay: editData.salaryCycle?.endDay ?? 31,
            salaryDate: editData.salaryCycle?.salaryDate ?? 1,
            payrollRunDate: editData.salaryCycle?.payrollRunDate ?? 28,
            workingDaysCalc: editData.salaryCycle?.workingDaysCalc || 'actual',
            fixedWorkingDays: editData.salaryCycle?.fixedWorkingDays ?? 26
          },
          lop: {
            enabled: editData.lop?.enabled ?? true,
            calculation: editData.lop?.calculation || 'per_day',
            perDayFormula: editData.lop?.perDayFormula || 'monthly_salary/working_days',
            roundingRule: editData.lop?.roundingRule || 'round2',
            includeHolidaysInLOP: editData.lop?.includeHolidaysInLOP ?? false,
            includeWeekendsInLOP: editData.lop?.includeWeekendsInLOP ?? false
          },
          deductionPriority: {
            leaveDeductionPriority: editData.deductionPriority?.leaveDeductionPriority || ['CL', 'SL', 'AL'],
            autoDeductInOrder: editData.deductionPriority?.autoDeductInOrder ?? true
          },
          unpaidLeave: {
            code: editData.unpaidLeave?.code || 'LWP',
            autoAssign: editData.unpaidLeave?.autoAssign ?? true,
            maxDaysPerMonth: editData.unpaidLeave?.maxDaysPerMonth ?? null,
            maxDaysPerYear: editData.unpaidLeave?.maxDaysPerYear ?? null,
            countWeekendsBetween: editData.unpaidLeave?.countWeekendsBetween ?? false,
            countHolidaysBetween: editData.unpaidLeave?.countHolidaysBetween ?? false
          },
          taxCompliance: {
            tdsEnabled: editData.taxCompliance?.tdsEnabled ?? true,
            tdsSurchargeEnabled: editData.taxCompliance?.tdsSurchargeEnabled ?? false,
            pfEnabled: editData.taxCompliance?.pfEnabled ?? true,
            pfEmployeeRate: editData.taxCompliance?.pfEmployeeRate ?? 12,
            pfEmployerRate: editData.taxCompliance?.pfEmployerRate ?? 12,
            pfCeilingAmount: editData.taxCompliance?.pfCeilingAmount ?? 15000,
            pfApplyOnActualBasic: editData.taxCompliance?.pfApplyOnActualBasic ?? false,
            esiEnabled: editData.taxCompliance?.esiEnabled ?? true,
            esiEmployeeRate: editData.taxCompliance?.esiEmployeeRate ?? 0.75,
            esiEmployerRate: editData.taxCompliance?.esiEmployerRate ?? 3.25,
            esiWageCeiling: editData.taxCompliance?.esiWageCeiling ?? 21000,
            ptEnabled: editData.taxCompliance?.ptEnabled ?? false,
            ptState: editData.taxCompliance?.ptState || '',
            gratuityEnabled: editData.taxCompliance?.gratuityEnabled ?? false,
            gratuityRate: editData.taxCompliance?.gratuityRate ?? 4.81
          },
          overtimePay: {
            enabled: editData.overtimePay?.enabled ?? false,
            rateMultiplier: editData.overtimePay?.rateMultiplier ?? 1.5,
            capHoursPerMonth: editData.overtimePay?.capHoursPerMonth ?? null,
            payableComponent: editData.overtimePay?.payableComponent || 'BASIC'
          },
          proRata: {
            enabled: editData.proRata?.enabled ?? true,
            basis: editData.proRata?.basis || 'working_days',
            fixedDivisor: editData.proRata?.fixedDivisor ?? 26,
            includeJoiningDay: editData.proRata?.includeJoiningDay ?? true,
            includeExitDay: editData.proRata?.includeExitDay ?? true
          },
          payslipConfig: {
            showLeaveBalance: editData.payslipConfig?.showLeaveBalance ?? true,
            showAttendanceSummary: editData.payslipConfig?.showAttendanceSummary ?? true,
            showYTDEarnings: editData.payslipConfig?.showYTDEarnings ?? true,
            showYTDTax: editData.payslipConfig?.showYTDTax ?? true,
            digitSignatureEnabled: editData.payslipConfig?.digitSignatureEnabled ?? false,
            companyLogoOnPayslip: editData.payslipConfig?.companyLogoOnPayslip ?? true,
            footerNote: editData.payslipConfig?.footerNote || ''
          },
          arrear: {
            enabled: editData.arrear?.enabled ?? true,
            autoCalculate: editData.arrear?.autoCalculate ?? true,
            maxBackMonths: editData.arrear?.maxBackMonths ?? 3
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
      const payload = {
        ...data,
        salaryCycle: {
          ...data.salaryCycle,
          startDay: Number(data.salaryCycle.startDay),
          endDay: Number(data.salaryCycle.endDay),
          salaryDate: Number(data.salaryCycle.salaryDate),
          payrollRunDate: Number(data.salaryCycle.payrollRunDate),
          fixedWorkingDays: Number(data.salaryCycle.fixedWorkingDays)
        },
        taxCompliance: {
          ...data.taxCompliance,
          pfEmployeeRate: Number(data.taxCompliance.pfEmployeeRate),
          pfEmployerRate: Number(data.taxCompliance.pfEmployerRate),
          pfCeilingAmount: Number(data.taxCompliance.pfCeilingAmount),
          esiEmployeeRate: Number(data.taxCompliance.esiEmployeeRate),
          esiEmployerRate: Number(data.taxCompliance.esiEmployerRate),
          esiWageCeiling: Number(data.taxCompliance.esiWageCeiling),
          gratuityRate: Number(data.taxCompliance.gratuityRate)
        },
        overtimePay: {
          ...data.overtimePay,
          rateMultiplier: Number(data.overtimePay.rateMultiplier),
          capHoursPerMonth: data.overtimePay.capHoursPerMonth ? Number(data.overtimePay.capHoursPerMonth) : null
        },
        proRata: {
          ...data.proRata,
          fixedDivisor: Number(data.proRata.fixedDivisor)
        },
        arrear: {
          ...data.arrear,
          maxBackMonths: Number(data.arrear.maxBackMonths)
        },
        unpaidLeave: {
          ...data.unpaidLeave,
          maxDaysPerMonth: data.unpaidLeave.maxDaysPerMonth ? Number(data.unpaidLeave.maxDaysPerMonth) : null,
          maxDaysPerYear: data.unpaidLeave.maxDaysPerYear ? Number(data.unpaidLeave.maxDaysPerYear) : null
        },
        // strip empty effectiveTo
        effectiveTo: data.effectiveTo || null
      }

      const res = isEdit
        ? await axiosRequest.put(`/api/v1/payroll-policies/${editData._id}`, payload)
        : await axiosRequest.post('/api/v1/payroll-policies', payload)

      // interceptor: res.success + res.data
      if (res?.success) {
        toast.success(`Payroll policy ${isEdit ? 'updated' : 'created'} successfully`)
        onSuccess(res.data, isEdit)
        onClose()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save policy')
    } finally {
      setSaving(false)
    }
  }

  // Reusable switch toggle row
  const SwitchRow = ({ name, label, helperText }) => (
    <Controller name={name} control={control}
      render={({ field }) => (
        <FormControlLabel
          control={<Switch checked={!!field.value} onChange={e => field.onChange(e.target.checked)} />}
          label={
            <Box>
              <Typography variant='body2'>{label}</Typography>
              {helperText && <Typography variant='caption' color='text.secondary'>{helperText}</Typography>}
            </Box>
          }
        />
      )}
    />
  )

  return (
    <Drawer open={open} anchor='right' onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 760 } } }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 5, py: 4, borderBottom: t => `1px solid ${t.palette.divider}`
      }}>
        <Box>
          <Typography variant='h6'>{isEdit ? 'Edit Payroll Policy' : 'New Payroll Policy'}</Typography>
          <Typography variant='caption' color='text.secondary'>
            Configure salary cycle, LOP, tax compliance, overtime and payslip settings
          </Typography>
        </Box>
        <IconButton onClick={onClose} size='small'><Icon icon='tabler:x' /></IconButton>
      </Box>

      <Box component='form' onSubmit={handleSubmit(onSubmit)}
        sx={{ px: 5, py: 4, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}
      >

        {/* ── 1. Policy Details ────────────────────────────────── */}
        <Box>
          <SectionHeader title='Policy Details' />
          <Grid container spacing={4}>
            <Grid item xs={12} sm={8}>
              <Controller name='name' control={control} rules={{ required: 'Policy name is required' }}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Policy Name *'
                    error={!!errors.name} helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              {/* placeholder for status indicator in edit mode */}
              {isEdit && editData?.status && (
                <Box sx={{ pt: 2 }}><StatusChip status={editData.status} /></Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name='effectiveFrom' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='date' label='Effective From'
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name='effectiveTo' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='date' label='Effective To (optional)'
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* ── 2. Applicability ─────────────────────────────────── */}
        <ApplicabilitySection control={control} />

        <Divider />

        {/* ── 3. Salary Cycle ──────────────────────────────────── */}
        <Box>
          <SectionHeader title='Salary Cycle'
            subtitle='Defines the payroll period, salary credit date and working days calculation'
          />
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Controller name='salaryCycle.type' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select fullWidth label='Cycle Type'>
                    <MenuItem value='monthly'>Monthly</MenuItem>
                    <MenuItem value='weekly'>Weekly</MenuItem>
                    <MenuItem value='biweekly'>Bi-Weekly</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Controller name='salaryCycle.startDay' control={control}
                rules={{ min: { value: 1, message: 'Min 1' }, max: { value: 31, message: 'Max 31' } }}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number' label='Start Day'
                    inputProps={{ min: 1, max: 31 }}
                    error={!!errors.salaryCycle?.startDay}
                    helperText={errors.salaryCycle?.startDay?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Controller name='salaryCycle.endDay' control={control}
                rules={{ min: { value: 1, message: 'Min 1' }, max: { value: 31, message: 'Max 31' } }}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number' label='End Day'
                    inputProps={{ min: 1, max: 31 }}
                    error={!!errors.salaryCycle?.endDay}
                    helperText={errors.salaryCycle?.endDay?.message ?? 'Must be > start day'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Controller name='salaryCycle.salaryDate' control={control}
                rules={{ min: { value: 1, message: 'Min 1' }, max: { value: 31, message: 'Max 31' } }}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number' label='Salary Credit Date'
                    inputProps={{ min: 1, max: 31 }}
                    helperText='Day of month salary is credited'
                    error={!!errors.salaryCycle?.salaryDate}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Controller name='salaryCycle.payrollRunDate' control={control}
                rules={{ min: { value: 1, message: 'Min 1' }, max: { value: 31, message: 'Max 31' } }}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number' label='Payroll Run Date'
                    inputProps={{ min: 1, max: 31 }}
                    helperText='Must be ≤ end day'
                    error={!!errors.salaryCycle?.payrollRunDate}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Controller name='salaryCycle.workingDaysCalc' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select fullWidth label='Working Days Calc'>
                    <MenuItem value='actual'>Actual</MenuItem>
                    <MenuItem value='fixed'>Fixed</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            {workingDaysCalc === 'fixed' && (
              <Grid item xs={6} sm={4}>
                <Controller name='salaryCycle.fixedWorkingDays' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='number' label='Fixed Working Days'
                      inputProps={{ min: 1, max: 31 }}
                      helperText='e.g. 26'
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider />

        {/* ── 4. LOP (Loss of Pay) ─────────────────────────────── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <SectionHeader title='Loss of Pay (LOP)' subtitle='Controls how absent days are deducted from salary' />
            <Controller name='lop.enabled' control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                  label='Enable' labelPlacement='start'
                />
              )}
            />
          </Box>
          {lopEnabled && (
            <Grid container spacing={4}>
              <Grid item xs={6} sm={4}>
                <Controller name='lop.calculation' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Calculation Basis'>
                      <MenuItem value='per_day'>Per Day</MenuItem>
                      <MenuItem value='per_hour'>Per Hour</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name='lop.roundingRule' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Rounding Rule'>
                      <MenuItem value='round2'>Round 2 decimals</MenuItem>
                      <MenuItem value='floor'>Floor</MenuItem>
                      <MenuItem value='ceil'>Ceil</MenuItem>
                      <MenuItem value='none'>No rounding</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Controller name='lop.perDayFormula' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth label='Per-Day Formula'
                      placeholder='monthly_salary/working_days'
                      helperText='Formula used to calculate per-day deduction amount'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <SwitchRow name='lop.includeHolidaysInLOP' label='Include Holidays in LOP' />
              </Grid>
              <Grid item xs={6} sm={4}>
                <SwitchRow name='lop.includeWeekendsInLOP' label='Include Weekends in LOP' />
              </Grid>
            </Grid>
          )}
          {!lopEnabled && <Alert severity='info' sx={{ mt: 1 }}>LOP deduction is disabled for this policy.</Alert>}
        </Box>

        <Divider />

        {/* ── 5. Deduction Priority ────────────────────────────── */}
        <Box>
          <SectionHeader title='Leave Deduction Priority'
            subtitle='Order in which leave types are deducted before marking LWP. No duplicates allowed.'
          />
          <Grid container spacing={4}>
            <Grid item xs={12} sm={8}>
              <Controller name='deductionPriority.leaveDeductionPriority' control={control}
                render={({ field }) => (
                  <CustomTextField fullWidth label='Priority Order (comma-separated)'
                    value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                    onChange={e => {
                      const codes = e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
                      // deduplicate client-side — backend also validates
                      field.onChange([...new Set(codes)])
                    }}
                    placeholder='CL, SL, AL'
                    helperText='e.g. CL, SL, AL — deducted in this order before LWP'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <SwitchRow name='deductionPriority.autoDeductInOrder' label='Auto Deduct in Order' />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* ── 6. Unpaid Leave (LWP) ────────────────────────────── */}
        <Box>
          <SectionHeader title='Unpaid Leave (LWP)' subtitle='Defines the leave code used when no balance is available' />
          <Grid container spacing={4}>
            <Grid item xs={6} sm={3}>
              <Controller name='unpaidLeave.code' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Leave Code'
                    onChange={e => field.onChange(e.target.value.toUpperCase())}
                    placeholder='LWP'
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
              <SwitchRow name='unpaidLeave.autoAssign' label='Auto-Assign LWP' />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Controller name='unpaidLeave.maxDaysPerMonth' control={control}
                render={({ field }) => (
                  <CustomTextField fullWidth type='number' label='Max Days / Month'
                    placeholder='No limit'
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    helperText='Optional cap'
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Controller name='unpaidLeave.maxDaysPerYear' control={control}
                render={({ field }) => (
                  <CustomTextField fullWidth type='number' label='Max Days / Year'
                    placeholder='No limit'
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <SwitchRow name='unpaidLeave.countWeekendsBetween' label='Count Weekends Between LWP Days' />
            </Grid>
            <Grid item xs={6} sm={4}>
              <SwitchRow name='unpaidLeave.countHolidaysBetween' label='Count Holidays Between LWP Days' />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* ── 7. Tax Compliance ────────────────────────────────── */}
        <Box>
          <SectionHeader title='Tax Compliance' subtitle='PF, ESI, TDS, PT and Gratuity configuration' />
          <Grid container spacing={4}>

            {/* TDS */}
            <Grid item xs={12}>
              <Typography variant='body2' fontWeight={600} color='text.secondary' sx={{ mb: 1 }}>TDS</Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <SwitchRow name='taxCompliance.tdsEnabled' label='TDS Enabled' />
            </Grid>
            <Grid item xs={6} sm={4}>
              <SwitchRow name='taxCompliance.tdsSurchargeEnabled' label='TDS Surcharge' />
            </Grid>

            <Grid item xs={12}><Divider /></Grid>

            {/* PF */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant='body2' fontWeight={600} color='text.secondary'>PF (Provident Fund)</Typography>
                <SwitchRow name='taxCompliance.pfEnabled' label='Enable PF' />
              </Box>
            </Grid>
            {pfEnabled && (
              <>
                <Grid item xs={6} sm={3}>
                  <Controller name='taxCompliance.pfEmployeeRate' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth type='number' label='Employee Rate (%)'
                        inputProps={{ step: 0.01, min: 0 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Controller name='taxCompliance.pfEmployerRate' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth type='number' label='Employer Rate (%)'
                        inputProps={{ step: 0.01, min: 0 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Controller name='taxCompliance.pfCeilingAmount' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth type='number' label='PF Ceiling (₹)'
                        helperText='Max basic for PF calc'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <SwitchRow name='taxCompliance.pfApplyOnActualBasic' label='Apply on Actual Basic' />
                </Grid>
              </>
            )}

            <Grid item xs={12}><Divider /></Grid>

            {/* ESI */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant='body2' fontWeight={600} color='text.secondary'>ESI</Typography>
                <SwitchRow name='taxCompliance.esiEnabled' label='Enable ESI' />
              </Box>
            </Grid>
            {esiEnabled && (
              <>
                <Grid item xs={6} sm={4}>
                  <Controller name='taxCompliance.esiEmployeeRate' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth type='number' label='Employee Rate (%)'
                        inputProps={{ step: 0.01, min: 0 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Controller name='taxCompliance.esiEmployerRate' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth type='number' label='Employer Rate (%)'
                        inputProps={{ step: 0.01, min: 0 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Controller name='taxCompliance.esiWageCeiling' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} fullWidth type='number' label='Wage Ceiling (₹)'
                        helperText='Max gross for ESI'
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}><Divider /></Grid>

            {/* PT */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant='body2' fontWeight={600} color='text.secondary'>Professional Tax (PT)</Typography>
                <SwitchRow name='taxCompliance.ptEnabled' label='Enable PT' />
              </Box>
            </Grid>
            {ptEnabled && (
              <Grid item xs={6} sm={4}>
                <Controller name='taxCompliance.ptState' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth label='PT State'
                      placeholder='e.g. Maharashtra'
                      helperText='PT slab depends on state'
                    />
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12}><Divider /></Grid>

            {/* Gratuity */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant='body2' fontWeight={600} color='text.secondary'>Gratuity</Typography>
                <SwitchRow name='taxCompliance.gratuityEnabled' label='Enable Gratuity' />
              </Box>
            </Grid>
            {gratuityEnabled && (
              <Grid item xs={6} sm={4}>
                <Controller name='taxCompliance.gratuityRate' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='number' label='Gratuity Rate (%)'
                      inputProps={{ step: 0.01 }}
                      helperText='Standard: 4.81%'
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider />

        {/* ── 8. Overtime Pay ──────────────────────────────────── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <SectionHeader title='Overtime Pay' />
            <SwitchRow name='overtimePay.enabled' label='Enable' />
          </Box>
          {overtimeEnabled && (
            <Grid container spacing={4}>
              <Grid item xs={6} sm={4}>
                <Controller name='overtimePay.rateMultiplier' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='number' label='Rate Multiplier'
                      placeholder='1.5' inputProps={{ step: 0.1, min: 1 }}
                      helperText='e.g. 1.5x or 2x'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name='overtimePay.capHoursPerMonth' control={control}
                  render={({ field }) => (
                    <CustomTextField fullWidth type='number' label='Cap Hours / Month'
                      placeholder='No cap'
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name='overtimePay.payableComponent' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Payable On'>
                      <MenuItem value='BASIC'>Basic</MenuItem>
                      <MenuItem value='GROSS'>Gross</MenuItem>
                      <MenuItem value='CTC'>CTC</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>
            </Grid>
          )}
          {!overtimeEnabled && <Alert severity='info' sx={{ mt: 1 }}>Overtime pay is disabled for this policy.</Alert>}
        </Box>

        <Divider />

        {/* ── 9. Pro-Rata ──────────────────────────────────────── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <SectionHeader title='Pro-Rata Calculation' subtitle='For joiners and exits mid-cycle' />
            <SwitchRow name='proRata.enabled' label='Enable' />
          </Box>
          {proRataEnabled && (
            <Grid container spacing={4}>
              <Grid item xs={6} sm={4}>
                <Controller name='proRata.basis' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Basis'>
                      <MenuItem value='working_days'>Working Days</MenuItem>
                      <MenuItem value='calendar_days'>Calendar Days</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name='proRata.fixedDivisor' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='number' label='Fixed Divisor'
                      helperText='e.g. 26 or 30'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <SwitchRow name='proRata.includeJoiningDay' label='Include Joining Day' />
              </Grid>
              <Grid item xs={6} sm={4}>
                <SwitchRow name='proRata.includeExitDay' label='Include Exit Day' />
              </Grid>
            </Grid>
          )}
        </Box>

        <Divider />

        {/* ── 10. Arrear ───────────────────────────────────────── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <SectionHeader title='Arrear' subtitle='Back-calculate pay for prior months' />
            <SwitchRow name='arrear.enabled' label='Enable' />
          </Box>
          {arrearEnabled && (
            <Grid container spacing={4}>
              <Grid item xs={6} sm={4}>
                <SwitchRow name='arrear.autoCalculate' label='Auto-Calculate Arrears' />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Controller name='arrear.maxBackMonths' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='number' label='Max Back Months'
                      inputProps={{ min: 1 }}
                      helperText='How far back to recalculate'
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}
        </Box>

        <Divider />

        {/* ── 11. Payslip Config ───────────────────────────────── */}
        <Box>
          <SectionHeader title='Payslip Configuration' subtitle='Controls what appears on the generated payslip' />
          <Grid container spacing={3}>
            {[
              ['payslipConfig.showLeaveBalance',      'Show Leave Balance'],
              ['payslipConfig.showAttendanceSummary', 'Show Attendance Summary'],
              ['payslipConfig.showYTDEarnings',       'Show YTD Earnings'],
              ['payslipConfig.showYTDTax',            'Show YTD Tax'],
              ['payslipConfig.digitSignatureEnabled', 'Digital Signature'],
              ['payslipConfig.companyLogoOnPayslip',  'Company Logo on Payslip']
            ].map(([name, label]) => (
              <Grid key={name} item xs={12} sm={6}>
                <SwitchRow name={name} label={label} />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Controller name='payslipConfig.footerNote' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth multiline rows={2} label='Footer Note (optional)'
                    placeholder='e.g. This is a system-generated payslip.'
                  />
                )}
              />
            </Grid>
          </Grid>
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
        {isLoading ? <CircularProgress size={16} /> : <Icon icon='tabler:dots-vertical' fontSize='1.1rem' />}
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
        {(status === 'draft' || status === 'inactive') && (
          <MenuItem onClick={handle(onActivate)}>
            <ListItemIcon><Icon icon='tabler:circle-check' fontSize='1rem' style={{ color: '#10B981' }} /></ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}
        {status === 'active' && (
          <MenuItem onClick={handle(onDeactivate)}>
            <ListItemIcon><Icon icon='tabler:circle-pause' fontSize='1rem' style={{ color: '#F59E0B' }} /></ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        )}
        {(status === 'active' || status === 'inactive') && (
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

// ─── Policy Detail Panel (expanded) ──────────────────────────────────────────

const PolicyDetailPanel = ({ policy: p }) => {
  const rows = [
    { label: 'Cycle',        value: `${p.salaryCycle?.type} · Day ${p.salaryCycle?.startDay}–${p.salaryCycle?.endDay} · Salary on ${p.salaryCycle?.salaryDate} · Run on ${p.salaryCycle?.payrollRunDate}` },
    { label: 'Working Days', value: p.salaryCycle?.workingDaysCalc === 'fixed' ? `Fixed ${p.salaryCycle?.fixedWorkingDays} days` : 'Actual' },
    { label: 'LOP',          value: p.lop?.enabled ? `${p.lop.calculation} · ${p.lop.perDayFormula} · ${p.lop.roundingRule}` : 'Disabled' },
    { label: 'Deduction',    value: p.deductionPriority?.leaveDeductionPriority?.join(' → ') || '—' },
    { label: 'Unpaid Code',  value: `${p.unpaidLeave?.code || 'LWP'} · Auto-assign: ${p.unpaidLeave?.autoAssign ? 'Yes' : 'No'}` },
    { label: 'PF',           value: p.taxCompliance?.pfEnabled ? `${p.taxCompliance.pfEmployeeRate}% (emp) / ${p.taxCompliance.pfEmployerRate}% (er) · Ceiling ₹${p.taxCompliance.pfCeilingAmount?.toLocaleString('en-IN')}` : 'Disabled' },
    { label: 'ESI',          value: p.taxCompliance?.esiEnabled ? `${p.taxCompliance.esiEmployeeRate}% (emp) / ${p.taxCompliance.esiEmployerRate}% (er) · Wage ceiling ₹${p.taxCompliance.esiWageCeiling?.toLocaleString('en-IN')}` : 'Disabled' },
    { label: 'TDS',          value: p.taxCompliance?.tdsEnabled ? `Enabled${p.taxCompliance.tdsSurchargeEnabled ? ' + Surcharge' : ''}` : 'Disabled' },
    { label: 'OT Pay',       value: p.overtimePay?.enabled ? `${p.overtimePay.rateMultiplier}x on ${p.overtimePay.payableComponent}${p.overtimePay.capHoursPerMonth ? ` · Cap ${p.overtimePay.capHoursPerMonth}h/mo` : ''}` : 'Disabled' },
    { label: 'Pro-Rata',     value: p.proRata?.enabled ? `${p.proRata.basis} · Divisor ${p.proRata.fixedDivisor}` : 'Disabled' },
    { label: 'Arrear',       value: p.arrear?.enabled ? `Max ${p.arrear.maxBackMonths} months back · Auto: ${p.arrear.autoCalculate ? 'Yes' : 'No'}` : 'Disabled' }
  ]

  return (
    <Table size='small'>
      <TableBody>
        {rows.map(r => (
          <TableRow key={r.label} sx={{ '&:last-child td': { border: 0 } }}>
            <TableCell sx={{ color: 'text.secondary', width: 110, py: 0.75, pl: 0, verticalAlign: 'top' }}>{r.label}</TableCell>
            <TableCell sx={{ py: 0.75 }}>{r.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ─── TabPayrollPolicy ─────────────────────────────────────────────────────────

const TabPayrollPolicy = () => {
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

      const res = await axiosRequest.get(`/api/v1/payroll-policies?${params.toString()}`)

      // Real shape: res.success, res.data.policies[], res.data.pagination
      if (res?.success) {
        setPolicies(res.data?.policies ?? [])
        setPagination(res.data?.pagination ?? { total: 0, pages: 1 })
      }
    } catch {
      toast.error('Failed to load payroll policies')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, page, rowsPerPage])

  useEffect(() => { fetchPolicies() }, [fetchPolicies])

  // ── Drawer success ────────────────────────────────────────────────────────
  const handleSuccess = (record, isEdit) => {
    const policy = record?.policies?.[0] ?? record
    if (isEdit) {
      setPolicies(prev => prev.map(p => p._id === policy._id ? policy : p))
    } else {
      fetchPolicies()
    }
  }

  // ── Generic PATCH/DELETE ──────────────────────────────────────────────────
  const doAction = async (policy, method, urlSuffix, successMsg, updateFn) => {
    setActionLoading(policy._id)
    try {
      const res = method === 'delete'
        ? await axiosRequest.delete(`/api/v1/payroll-policies/${policy._id}${urlSuffix}`)
        : await axiosRequest[method](`/api/v1/payroll-policies/${policy._id}${urlSuffix}`)

      if (res?.success) {
        toast.success(successMsg)
        if (updateFn) updateFn(res.data)
        else fetchPolicies()
      }
    } catch (err) {
        console.error(err)
      toast.error( err ||err?.response?.message || 'Action failed')
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

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleEdit = policy => { setEditData(policy); setDrawerOpen(true) }

  const handleActivate = policy => openConfirm(
    'Activate Policy',
    `Activate "${policy.name}"? It will be applied to matched employees.`,
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
    `Permanently delete "${policy.name}"? Active policies cannot be deleted — deactivate or archive first.`,
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
        title='Payroll Policies'
        subheader='Configure salary cycles, LOP rules, tax compliance and deduction priorities'
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
            {[1, 2, 3].map(i => <Skeleton key={i} variant='rectangular' height={110} sx={{ borderRadius: 2 }} />)}
          </Box>
        ) : policies.length === 0 ? (
          <Box sx={{ p: 5 }}>
            <Alert severity='info'>
              {search || statusFilter !== 'all'
                ? 'No policies match your filters.'
                : 'No payroll policies yet. Create your first one.'}
            </Alert>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {policies.map((policy, idx) => {
              const isExpanded = expandedId === policy._id

              // Tax compliance badges
              const taxBadges = []
              if (policy.taxCompliance?.pfEnabled)  taxBadges.push('PF')
              if (policy.taxCompliance?.esiEnabled)  taxBadges.push('ESI')
              if (policy.taxCompliance?.tdsEnabled)  taxBadges.push('TDS')
              if (policy.taxCompliance?.ptEnabled)   taxBadges.push('PT')
              if (policy.taxCompliance?.gratuityEnabled) taxBadges.push('Gratuity')

              return (
                <Box key={policy._id}
                  sx={{
                    borderBottom: idx < policies.length - 1 ? t => `1px solid ${t.palette.divider}` : 'none',
                    transition: 'background 0.15s',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  {/* Main Row */}
                  <Box sx={{
                    px: 5, py: 3.5,
                    display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between', gap: 3, flexWrap: 'wrap'
                  }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Name + status + version */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                        <Typography fontWeight={600}>{policy.name}</Typography>
                        <StatusChip status={policy.status} />
                        {policy.version != null && (
                          <Chip label={`v${policy.version}`} size='small' variant='outlined'
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>

                      {/* Cycle summary */}
                      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                        <Icon icon='tabler:calendar' fontSize='0.85rem' style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {policy.salaryCycle?.type} cycle ·
                        Day {policy.salaryCycle?.startDay}–{policy.salaryCycle?.endDay} ·
                        Salary on {policy.salaryCycle?.salaryDate} ·
                        Run on {policy.salaryCycle?.payrollRunDate} ·
                        {policy.salaryCycle?.workingDaysCalc === 'fixed'
                          ? ` ${policy.salaryCycle.fixedWorkingDays} fixed days`
                          : ' Actual days'}
                        {policy.effectiveFrom && ` · Effective ${formatDate(policy.effectiveFrom)}`}
                      </Typography>

                      {/* Feature flags row */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        {policy.lop?.enabled && (
                          <Chip label={`LOP · ${policy.lop.calculation}`}
                            size='small' color='warning' variant='tonal'
                            icon={<Icon icon='tabler:minus-circle' fontSize='0.75rem' />}
                          />
                        )}
                        {policy.overtimePay?.enabled && (
                          <Chip label={`OT · ${policy.overtimePay.rateMultiplier}x`}
                            size='small' color='info' variant='tonal'
                            icon={<Icon icon='tabler:trending-up' fontSize='0.75rem' />}
                          />
                        )}
                        {policy.proRata?.enabled && (
                          <Chip label='Pro-Rata' size='small' color='secondary' variant='tonal' />
                        )}
                        {policy.arrear?.enabled && (
                          <Chip label={`Arrear · ${policy.arrear.maxBackMonths}mo`}
                            size='small' color='default' variant='tonal'
                          />
                        )}
                        {taxBadges.map(b => (
                          <Chip key={b} label={b} size='small' variant='outlined'
                            sx={{ fontSize: '0.7rem', height: 22 }}
                          />
                        ))}
                      </Box>

                      {/* Deduction priority */}
                      {policy.deductionPriority?.leaveDeductionPriority?.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography variant='caption' color='text.secondary'>Deduction order:</Typography>
                          {policy.deductionPriority.leaveDeductionPriority.map((code, i, arr) => (
                            <Box key={code} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Chip label={code} size='small' variant='outlined' sx={{ height: 20, fontSize: '0.7rem' }} />
                              {i < arr.length - 1 && <Icon icon='tabler:arrow-right' fontSize='0.7rem' style={{ color: '#9CA3AF' }} />}
                            </Box>
                          ))}
                          <Chip label='LWP' size='small' color='error' variant='outlined' sx={{ height: 20, fontSize: '0.7rem' }} />
                        </Box>
                      )}

                      {/* Applicability */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        {policy.applicableFor?.roles?.length > 0
                          ? policy.applicableFor.roles.map(r => (
                            <Chip key={r} label={r} size='small' variant='tonal' color='secondary'
                              icon={<Icon icon='tabler:user-check' fontSize='0.75rem' />}
                            />
                          ))
                          : null
                        }
                        {policy.applicableFor?.departments?.length > 0 && (
                          <Chip label={`${policy.applicableFor.departments.length} dept${policy.applicableFor.departments.length > 1 ? 's' : ''}`}
                            size='small' variant='tonal' color='secondary'
                            icon={<Icon icon='tabler:building' fontSize='0.75rem' />}
                          />
                        )}
                        {policy.applicableFor?.locations?.length > 0 && (
                          <Chip label={policy.applicableFor.locations.join(', ')}
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
                        onActivate={handleActivate}
                        onDeactivate={handleDeactivate}
                        onArchive={handleArchive}
                        onDelete={handleDelete}
                      />
                    </Box>
                  </Box>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <Box sx={{
                      px: 5, pb: 3,
                      borderTop: t => `1px solid ${t.palette.divider}`,
                      bgcolor: t => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
                    }}>
                      <PolicyDetailPanel policy={policy} />
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
      <PayrollPolicyDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editData={editData}
        onSuccess={handleSuccess}
      />

      {/* Confirm */}
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

export default TabPayrollPolicy