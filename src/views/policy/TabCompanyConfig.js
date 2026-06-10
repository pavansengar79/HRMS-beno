// ** React Imports
import { useEffect, useState, useRef } from 'react'

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
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'

// ** API
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Constants ────────────────────────────────────────────────────────────────

// Valid IANA timezones accepted by the backend
const TIMEZONES = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
]

// Exactly 3-letter ISO 4217 currency codes (backend validates length === 3)
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'JPY', 'AUD', 'CAD']

const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']

// API expects uppercase 3-letter day codes
const WORK_WEEK_OPTIONS = [
  { value: 'MON', label: 'Mon' },
  { value: 'TUE', label: 'Tue' },
  { value: 'WED', label: 'Wed' },
  { value: 'THU', label: 'Thu' },
  { value: 'FRI', label: 'Fri' },
  { value: 'SAT', label: 'Sat' },
  { value: 'SUN', label: 'Sun' },
]

// fiscalYearStart: 1–12 (backend rejects 13+)
const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

// ─── Default form values ──────────────────────────────────────────────────────
const defaultValues = {
  // Required fields (POST payload)
  fiscalYearStart: 4,
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  workWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
  defaultWorkingHoursPerDay: 8,
  payrollCutoffDay: 25,
  salaryDay: 1,

  // Optional fields (editable, returned by GET)
  halfDayThresholdHours: 4,
  lateThresholdMinutes: 15,
  overtimeThresholdHours: 9,
  standardHoursPerDay: 8,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Deep-compare two form values objects and return only the changed keys.
 * Used to build the partial PUT payload.
 */
const getDirtyFields = (current, original) => {
  const dirty = {}
  Object.keys(current).forEach(key => {
    const cur = current[key]
    const orig = original[key]
    if (Array.isArray(cur) && Array.isArray(orig)) {
      if (JSON.stringify([...cur].sort()) !== JSON.stringify([...orig].sort())) {
        dirty[key] = cur
      }
    } else if (cur !== orig) {
      dirty[key] = cur
    }
  })
  return dirty
}

// ─── TabCompanyConfig ─────────────────────────────────────────────────────────

const TabCompanyConfig = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  /**
   * configExists tracks whether a config record exists for this tenant.
   *   null  → unknown (still loading)
   *   false → no config yet  → use POST to create
   *   true  → config exists  → use PUT to partially update
   */
  const [configExists, setConfigExists] = useState(null)

  // workingDaysPerWeek is computed by the backend — display only
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState(null)

  // Snapshot of last-saved values used to compute the PUT diff
  const savedValuesRef = useRef(null)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({ defaultValues })

  const selectedWorkWeek = watch('workWeek')

  // ── GET /company/config ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axiosRequest.get('api/v1/company-config/config')

        if (res?.success && res.data) {
          const d = res.data
          const formValues = {
            fiscalYearStart:           d.fiscalYearStart           ?? defaultValues.fiscalYearStart,
            timezone:                  d.timezone                  ?? defaultValues.timezone,
            currency:                  d.currency                  ?? defaultValues.currency,
            dateFormat:                d.dateFormat                ?? defaultValues.dateFormat,
            workWeek:                  d.workWeek                  ?? defaultValues.workWeek,
            defaultWorkingHoursPerDay: d.defaultWorkingHoursPerDay ?? defaultValues.defaultWorkingHoursPerDay,
            payrollCutoffDay:          d.payrollCutoffDay          ?? defaultValues.payrollCutoffDay,
            salaryDay:                 d.salaryDay                 ?? defaultValues.salaryDay,
            halfDayThresholdHours:     d.halfDayThresholdHours     ?? defaultValues.halfDayThresholdHours,
            lateThresholdMinutes:      d.lateThresholdMinutes      ?? defaultValues.lateThresholdMinutes,
            overtimeThresholdHours:    d.overtimeThresholdHours    ?? defaultValues.overtimeThresholdHours,
            standardHoursPerDay:       d.standardHoursPerDay       ?? defaultValues.standardHoursPerDay,
          }

          reset(formValues)
          savedValuesRef.current = formValues
          setWorkingDaysPerWeek(d.workingDaysPerWeek ?? null)
          setConfigExists(true)
        } else {
          // GET returned success:false or null data → no config yet
          setConfigExists(false)
        }
      } catch {
        // 404 or network error → treat as "no config yet"
        setConfigExists(false)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── POST /company/config  (create) ────────────────────────────────────────
  const createConfig = async data => {
    const payload = {
      fiscalYearStart:           Number(data.fiscalYearStart),
      timezone:                  data.timezone,
      currency:                  data.currency,
      dateFormat:                data.dateFormat,
      workWeek:                  data.workWeek,
      defaultWorkingHoursPerDay: Number(data.defaultWorkingHoursPerDay),
      payrollCutoffDay:          Number(data.payrollCutoffDay),
      salaryDay:                 Number(data.salaryDay),

      // Optional fields — include only when present
      ...(data.halfDayThresholdHours  != null && { halfDayThresholdHours:  Number(data.halfDayThresholdHours) }),
      ...(data.lateThresholdMinutes   != null && { lateThresholdMinutes:   Number(data.lateThresholdMinutes) }),
      ...(data.overtimeThresholdHours != null && { overtimeThresholdHours: Number(data.overtimeThresholdHours) }),
      ...(data.standardHoursPerDay    != null && { standardHoursPerDay:    Number(data.standardHoursPerDay) }),
    }

    const res = await axiosRequest.post('api/v1/company-config/config', payload)

    if (res?.success) {
      toast.success(res.message || 'Company config created')
      setConfigExists(true)
      savedValuesRef.current = data
      if (res.data?.workingDaysPerWeek != null) {
        setWorkingDaysPerWeek(res.data.workingDaysPerWeek)
      }
    }
  }

  // ── PUT /company/config  (partial update) ─────────────────────────────────
  const updateConfig = async data => {
    const dirtyFields = getDirtyFields(data, savedValuesRef.current ?? defaultValues)

    if (Object.keys(dirtyFields).length === 0) {
      toast('No changes to save', { icon: 'ℹ️' })
      return
    }

    // Coerce numeric fields in the diff
    const numericKeys = [
      'fiscalYearStart',
      'defaultWorkingHoursPerDay',
      'payrollCutoffDay',
      'salaryDay',
      'halfDayThresholdHours',
      'lateThresholdMinutes',
      'overtimeThresholdHours',
      'standardHoursPerDay',
    ]
    const payload = {}
    Object.entries(dirtyFields).forEach(([key, val]) => {
      payload[key] = numericKeys.includes(key) ? Number(val) : val
    })

    const res = await axiosRequest.put('api/v1/company-config/config', payload)

    if (res?.success) {
      toast.success(res.message || 'Company config updated')
      savedValuesRef.current = data
      if (res.data?.workingDaysPerWeek != null) {
        setWorkingDaysPerWeek(res.data.workingDaysPerWeek)
      }
    }
  }

  // ── onSubmit — routes to POST or PUT based on configExists ────────────────
  const onSubmit = async data => {
    setSaving(true)
    try {
      if (configExists) {
        await updateConfig(data)
      } else {
        await createConfig(data)
      }
    } catch (err) {
      // Surface backend validation messages (400 edge cases)
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to save configuration'
      toast.error(serverMsg)
    } finally {
      setSaving(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
        <CircularProgress />
      </Box>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader
        title='Company Configuration'
        subheader='Global settings applied across the entire organization'
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Badge showing whether we're in create or edit mode */}
            <Chip
              size='small'
              variant='tonal'
              color={configExists ? 'success' : 'warning'}
              icon={<Icon icon={configExists ? 'tabler:circle-check' : 'tabler:alert-circle'} />}
              label={configExists ? 'Config Exists' : 'Not Configured'}
            />

            <Button
              variant='contained'
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
              startIcon={
                saving
                  ? <CircularProgress size={16} color='inherit' />
                  : <Icon icon={configExists ? 'tabler:device-floppy' : 'tabler:plus'} />
              }
            >
              {saving
                ? 'Saving…'
                : configExists
                  ? 'Save Changes'
                  : 'Create Config'}
            </Button>
          </Box>
        }
      />

      <Divider />

      {/* Info banner: tell user what will happen on submit */}
      <Box sx={{ px: 5, pt: 4 }}>
        {configExists ? (
          <Alert severity='info' icon={<Icon icon='tabler:info-circle' />}>
            Only <strong>changed fields</strong> will be sent to the server .
          </Alert>
        ) : (
          <Alert severity='info' icon={<Icon icon='tabler:settings-2' />}>
            No configuration found. Fill in all required fields (*) and click <strong>Create Config</strong>.
          </Alert>
        )}
      </Box>

      <CardContent sx={{ pt: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>

            {/* ══ SECTION: Company Info ══════════════════════════════════════ */}
            <Grid item xs={12}>
              <Typography variant='overline' color='text.secondary'>
                Company Info
              </Typography>
            </Grid>

            {/* Fiscal Year Start — max 12, backend rejects 13+ */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='fiscalYearStart'
                control={control}
                rules={{
                  required: 'Fiscal year start is required',
                  min: { value: 1,  message: 'Month must be between 1 and 12' },
                  max: { value: 12, message: 'Month must be between 1 and 12' },
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Fiscal Year Start *'
                    error={!!errors.fiscalYearStart}
                    helperText={errors.fiscalYearStart?.message}
                  >
                    {MONTHS.map(m => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Timezone — must be a valid IANA string */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='timezone'
                control={control}
                rules={{
                  required: 'Timezone is required',
                  validate: val =>
                    TIMEZONES.includes(val) || 'Invalid IANA timezone',
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Timezone *'
                    error={!!errors.timezone}
                    helperText={errors.timezone?.message}
                  >
                    {TIMEZONES.map(tz => (
                      <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Currency — must be exactly 3 chars */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='currency'
                control={control}
                rules={{
                  required: 'Currency is required',
                  validate: val =>
                    (typeof val === 'string' && val.length === 3) ||
                    'Currency must be exactly 3 characters',
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Currency *'
                    error={!!errors.currency}
                    helperText={errors.currency?.message}
                  >
                    {CURRENCIES.map(c => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Date Format */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='dateFormat'
                control={control}
                rules={{ required: 'Date format is required' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Date Format *'
                    error={!!errors.dateFormat}
                    helperText={errors.dateFormat?.message}
                  >
                    {DATE_FORMATS.map(f => (
                      <MenuItem key={f} value={f}>{f}</MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Working Days / Week — read-only, auto-computed by backend */}
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                label='Working Days / Week'
                value={workingDaysPerWeek ?? (selectedWorkWeek?.length ?? '—')}
                InputProps={{ readOnly: true }}
                helperText='Auto-computed from work week selection'
              />
            </Grid>

            <Grid item xs={12}><Divider /></Grid>

            {/* ══ SECTION: Work Week ════════════════════════════════════════ */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant='overline' color='text.secondary'>
                  Work Week
                </Typography>
                {selectedWorkWeek?.length > 0 && (
                  <Chip
                    label={`${selectedWorkWeek.length} day${selectedWorkWeek.length > 1 ? 's' : ''} selected`}
                    size='small'
                    color='primary'
                    variant='tonal'
                  />
                )}
              </Box>
            </Grid>

            {/* Work Week checkboxes — at least 1 required */}
            <Grid item xs={12}>
              <Controller
                name='workWeek'
                control={control}
                rules={{
                  validate: v =>
                    (Array.isArray(v) && v.length > 0) ||
                    'workWeek must have at least 1 day',
                }}
                render={({ field }) => (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {WORK_WEEK_OPTIONS.map(day => (
                      <FormControlLabel
                        key={day.value}
                        label={day.label}
                        control={
                          <Checkbox
                            checked={field.value?.includes(day.value) ?? false}
                            onChange={e => {
                              const cur = field.value ?? []
                              field.onChange(
                                e.target.checked
                                  ? [...cur, day.value]
                                  : cur.filter(d => d !== day.value)
                              )
                            }}
                          />
                        }
                      />
                    ))}
                  </Box>
                )}
              />
              {errors.workWeek && (
                <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block' }}>
                  {errors.workWeek.message}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}><Divider /></Grid>

            {/* ══ SECTION: Hours Configuration ═════════════════════════════ */}
            <Grid item xs={12}>
              <Typography variant='overline' color='text.secondary'>
                Hours Configuration
              </Typography>
            </Grid>

            {/* Default Working Hours / Day */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='defaultWorkingHoursPerDay'
                control={control}
                rules={{
                  required: 'Working hours per day is required',
                  min: { value: 1,  message: 'Minimum is 1 hour' },
                  max: { value: 24, message: 'Maximum is 24 hours' },
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Working Hours / Day *'
                    inputProps={{ min: 1, max: 24 }}
                    error={!!errors.defaultWorkingHoursPerDay}
                    helperText={errors.defaultWorkingHoursPerDay?.message}
                  />
                )}
              />
            </Grid>

            {/* Standard Hours / Day */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='standardHoursPerDay'
                control={control}
                rules={{
                  min: { value: 1,  message: 'Minimum is 1 hour' },
                  max: { value: 24, message: 'Maximum is 24 hours' },
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Standard Hours / Day'
                    inputProps={{ min: 1, max: 24 }}
                    error={!!errors.standardHoursPerDay}
                    helperText={errors.standardHoursPerDay?.message || 'Used for attendance calculations'}
                  />
                )}
              />
            </Grid>

            {/* Half Day Threshold */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='halfDayThresholdHours'
                control={control}
                rules={{
                  min: { value: 0.5, message: 'Minimum is 0.5 hours' },
                  max: { value: 12,  message: 'Maximum is 12 hours' },
                }}
                render={({ field }) => (
                  <Tooltip title='Hours below which attendance is marked as half day' placement='top'>
                    <span>
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Half Day Threshold (hrs)'
                        inputProps={{ min: 0.5, max: 12, step: 0.5 }}
                        error={!!errors.halfDayThresholdHours}
                        helperText={errors.halfDayThresholdHours?.message || 'Hours below which marks as half day'}
                      />
                    </span>
                  </Tooltip>
                )}
              />
            </Grid>

            {/* Late Threshold */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='lateThresholdMinutes'
                control={control}
                rules={{
                  min: { value: 0,   message: 'Minimum is 0 minutes' },
                  max: { value: 120, message: 'Maximum is 120 minutes' },
                }}
                render={({ field }) => (
                  <Tooltip title='Grace period in minutes after shift start before late mark' placement='top'>
                    <span>
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Late Threshold (min)'
                        inputProps={{ min: 0, max: 120 }}
                        error={!!errors.lateThresholdMinutes}
                        helperText={errors.lateThresholdMinutes?.message || 'Grace period before late mark'}
                      />
                    </span>
                  </Tooltip>
                )}
              />
            </Grid>

            {/* Overtime Threshold */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='overtimeThresholdHours'
                control={control}
                rules={{
                  min: { value: 1,  message: 'Minimum is 1 hour' },
                  max: { value: 24, message: 'Maximum is 24 hours' },
                }}
                render={({ field }) => (
                  <Tooltip title='Daily hours beyond which overtime applies' placement='top'>
                    <span>
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Overtime Threshold (hrs)'
                        inputProps={{ min: 1, max: 24 }}
                        error={!!errors.overtimeThresholdHours}
                        helperText={errors.overtimeThresholdHours?.message || 'Hours beyond which overtime starts'}
                      />
                    </span>
                  </Tooltip>
                )}
              />
            </Grid>

            <Grid item xs={12}><Divider /></Grid>

            {/* ══ SECTION: Payroll Dates ════════════════════════════════════ */}
            <Grid item xs={12}>
              <Typography variant='overline' color='text.secondary'>
                Payroll Dates
              </Typography>
            </Grid>

            {/* Payroll Cutoff Day — backend rejects 29+ (max 28) */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='payrollCutoffDay'
                control={control}
                rules={{
                  required: 'Payroll cutoff day is required',
                  min: { value: 1,  message: 'Minimum day is 1' },
                  max: { value: 28, message: 'Maximum day is 28 (safe across all months)' },
                  validate: val =>
                    Number.isInteger(Number(val)) || 'Must be a whole number',
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Payroll Cutoff Day *'
                    inputProps={{ min: 1, max: 28 }}
                    error={!!errors.payrollCutoffDay}
                    helperText={
                      errors.payrollCutoffDay?.message ||
                      'Day of month payroll processing closes (1–28)'
                    }
                  />
                )}
              />
            </Grid>

            {/* Salary Day */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='salaryDay'
                control={control}
                rules={{
                  required: 'Salary day is required',
                  min: { value: 1,  message: 'Minimum day is 1' },
                  max: { value: 28, message: 'Maximum day is 28 (safe across all months)' },
                  validate: val =>
                    Number.isInteger(Number(val)) || 'Must be a whole number',
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Salary Day *'
                    inputProps={{ min: 1, max: 28 }}
                    error={!!errors.salaryDay}
                    helperText={
                      errors.salaryDay?.message ||
                      'Day of month salary is credited to employees (1–28)'
                    }
                  />
                )}
              />
            </Grid>

          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default TabCompanyConfig