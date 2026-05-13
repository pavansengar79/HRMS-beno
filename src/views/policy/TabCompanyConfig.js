// ** React Imports
import { useEffect, useState } from 'react'

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

// API expects uppercase 3-letter codes: MON, TUE, WED ...
const WORK_WEEK_OPTIONS = [
  { value: 'MON', label: 'Mon' },
  { value: 'TUE', label: 'Tue' },
  { value: 'WED', label: 'Wed' },
  { value: 'THU', label: 'Thu' },
  { value: 'FRI', label: 'Fri' },
  { value: 'SAT', label: 'Sat' },
  { value: 'SUN', label: 'Sun' },
]

const TIMEZONES = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Dubai',
  'Asia/Singapore',
]

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD']

const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']

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

// ─── Default form values — maps 1:1 to POST payload ──────────────────────────
// Required fields (backend validates these):
//   fiscalYearStart, timezone, currency, dateFormat,
//   workWeek, defaultWorkingHoursPerDay, payrollCutoffDay, salaryDay
//
// Optional / read-only from API (shown but not sent unless changed):
//   halfDayThresholdHours, lateThresholdMinutes, overtimeThresholdHours,
//   standardHoursPerDay, workingDaysPerWeek

const defaultValues = {
  // ── Required (POST payload fields) ────────────────────────────────────────
  fiscalYearStart: 4,
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  workWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
  defaultWorkingHoursPerDay: 8,
  payrollCutoffDay: 25,
  salaryDay: 1,                    // ← correct field name (not salaryCreditDay)

  // ── Optional overrides (returned by GET, editable) ─────────────────────
  halfDayThresholdHours: 4,
  lateThresholdMinutes: 15,
  overtimeThresholdHours: 9,
  standardHoursPerDay: 8,
}

// ─── TabCompanyConfig ─────────────────────────────────────────────────────────

const TabCompanyConfig = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // workingDaysPerWeek is auto-computed by backend — display only
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState(null)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues })

  const selectedWorkWeek = watch('workWeek')

  // ── GET /company/config ────────────────────────────────────────────────────
  // Interceptor pattern: res.success + res.data (not res.data.success)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axiosRequest.get('api/v1/company/config')
        if (res?.success && res.data) {
          const d = res.data

          // Map all GET response fields into the form
          reset({
            fiscalYearStart: d.fiscalYearStart ?? defaultValues.fiscalYearStart,
            timezone: d.timezone ?? defaultValues.timezone,
            currency: d.currency ?? defaultValues.currency,
            dateFormat: d.dateFormat ?? defaultValues.dateFormat,
            workWeek: d.workWeek ?? defaultValues.workWeek,
            defaultWorkingHoursPerDay: d.defaultWorkingHoursPerDay ?? defaultValues.defaultWorkingHoursPerDay,
            payrollCutoffDay: d.payrollCutoffDay ?? defaultValues.payrollCutoffDay,
            salaryDay: d.salaryDay ?? defaultValues.salaryDay,
            halfDayThresholdHours: d.halfDayThresholdHours ?? defaultValues.halfDayThresholdHours,
            lateThresholdMinutes: d.lateThresholdMinutes ?? defaultValues.lateThresholdMinutes,
            overtimeThresholdHours: d.overtimeThresholdHours ?? defaultValues.overtimeThresholdHours,
            standardHoursPerDay: d.standardHoursPerDay ?? defaultValues.standardHoursPerDay,
          })

          // Display-only field from backend
          setWorkingDaysPerWeek(d.workingDaysPerWeek ?? null)
        }
      } catch {
        // No config yet — form stays with defaults, not an error
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── POST /company/config ───────────────────────────────────────────────────
  const onSubmit = async (data) => {
    setSaving(true)
    try {
      // Build payload matching exact POST contract
      const payload = {
        fiscalYearStart: Number(data.fiscalYearStart),
        timezone: data.timezone,
        currency: data.currency,
        dateFormat: data.dateFormat,
        workWeek: data.workWeek,                              // already ['MON','TUE',...]
        defaultWorkingHoursPerDay: Number(data.defaultWorkingHoursPerDay),
        payrollCutoffDay: Number(data.payrollCutoffDay),
        salaryDay: Number(data.salaryDay),                   // ← correct key

        // Optional fields — only include if they have values
        ...(data.halfDayThresholdHours && { halfDayThresholdHours: Number(data.halfDayThresholdHours) }),
        ...(data.lateThresholdMinutes && { lateThresholdMinutes: Number(data.lateThresholdMinutes) }),
        ...(data.overtimeThresholdHours && { overtimeThresholdHours: Number(data.overtimeThresholdHours) }),
        ...(data.standardHoursPerDay && { standardHoursPerDay: Number(data.standardHoursPerDay) }),
      }

      const res = await axiosRequest.post('/company/config', payload)

      // interceptor pattern
      if (res?.success) {
        toast.success(res.message || 'Company config saved')
        if (res.data?.workingDaysPerWeek) {
          setWorkingDaysPerWeek(res.data.workingDaysPerWeek)
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save config')
    } finally {
      setSaving(false)
    }
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
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
          <Button
            variant='contained'
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            startIcon={
              saving
                ? <CircularProgress size={16} color='inherit' />
                : <Icon icon='tabler:device-floppy' />
            }
          >
            {saving ? 'Saving...' : 'Save Config'}
          </Button>
        }
      />

      <Divider />

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>

            {/* ══ SECTION: Company Info ══════════════════════════════════════ */}
            <Grid item xs={12}>
              <Typography variant='overline' color='text.secondary'>
                Company Info
              </Typography>
            </Grid>

            {/* Fiscal Year Start */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='fiscalYearStart'
                control={control}
                rules={{ required: 'Fiscal year start is required' }}
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

            {/* Timezone */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='timezone'
                control={control}
                rules={{ required: 'Timezone is required' }}
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

            {/* Currency */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='currency'
                control={control}
                rules={{ required: 'Currency is required' }}
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

            {/* Working Days Per Week — read-only from API */}
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
                    label={`${selectedWorkWeek.length} days selected`}
                    size='small'
                    color='primary'
                    variant='tonal'
                  />
                )}
              </Box>
            </Grid>

            {/* Work Week checkboxes — values are MON, TUE, ... (uppercase) */}
            <Grid item xs={12}>
              <Controller
                name='workWeek'
                control={control}
                rules={{ validate: v => (v && v.length > 0) || 'Select at least one working day' }}
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

            {/* ══ SECTION: Hours Config ════════════════════════════════════ */}
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
                  required: 'Required',
                  min: { value: 1, message: 'Min 1 hour' },
                  max: { value: 24, message: 'Max 24 hours' },
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Working Hours / Day *'
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
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Standard Hours / Day'
                    helperText='Used for attendance calculations'
                  />
                )}
              />
            </Grid>

            {/* Half Day Threshold */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='halfDayThresholdHours'
                control={control}
                render={({ field }) => (
                  <Tooltip title='Minimum hours to be present for a half-day mark' placement='top'>
                    <span>
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Half Day Threshold (hrs)'
                        helperText='Hours below which marks as half day'
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
                render={({ field }) => (
                  <Tooltip title='Minutes after shift start before marking as late' placement='top'>
                    <span>
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Late Threshold (min)'
                        helperText='Grace period before late mark'
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
                render={({ field }) => (
                  <Tooltip title='Hours worked per day above which overtime applies' placement='top'>
                    <span>
                      <CustomTextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Overtime Threshold (hrs)'
                        helperText='Hours beyond which overtime starts'
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

            {/* Payroll Cutoff Day */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='payrollCutoffDay'
                control={control}
                rules={{
                  required: 'Required',
                  min: { value: 1, message: 'Min day is 1' },
                  max: { value: 31, message: 'Max day is 31' },
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Payroll Cutoff Day *'
                    error={!!errors.payrollCutoffDay}
                    helperText={errors.payrollCutoffDay?.message || 'Day of month payroll processing closes (e.g. 25)'}
                  />
                )}
              />
            </Grid>

            {/* Salary Day — correct field name from API */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='salaryDay'
                control={control}
                rules={{
                  required: 'Required',
                  min: { value: 1, message: 'Min day is 1' },
                  max: { value: 31, message: 'Max day is 31' },
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Salary Day *'
                    error={!!errors.salaryDay}
                    helperText={errors.salaryDay?.message || 'Day of month salary is credited to employees (e.g. 1)'}
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