// src/views/attendance/AttendanceDialogs.js
//
// ─────────────────────────────────────────────────────────────────────────────
// Attendance Dialog Components
// ─────────────────────────────────────────────────────────────────────────────
// RegularizeDialog — HR regularizes attendance records
// EmployeeSummaryDialog — Shows employee attendance summary
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Grid, CircularProgress, Skeleton, MenuItem, Alert
} from '@mui/material'
import { Icon } from '@iconify/react'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'

import CustomTextField from 'src/@core/components/mui/text-field'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_LABEL = {
  PRESENT:   'Present',
  ABSENT:    'Absent',
  LATE:      'Late',
  HALF_DAY:  'Half Day',
  ON_LEAVE:  'On Leave',
  HOLIDAY:   'Holiday',
  WEEKEND:   'Weekend',
  WFH:       'WFH'
}

const REGULARIZATION_TYPE_LABEL = {
  MISSED_PUNCH_IN:  'Missed Punch In',
  MISSED_PUNCH_OUT: 'Missed Punch Out',
  BOTH_MISSED:      'Both Punches Missed',
  WRONG_TIME:       'Wrong Time',
  WFH_CORRECTION:   'Work From Home Correction',
  STATUS_CORRECTION:'Status Correction'
}

const CHECK_IN_TYPES = ['MISSED_PUNCH_IN', 'BOTH_MISSED', 'WRONG_TIME']
const CHECK_OUT_TYPES = ['MISSED_PUNCH_OUT', 'BOTH_MISSED', 'WRONG_TIME']

const getTimeInputValue = value => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const combineRecordDateAndTime = (recordDate, time) => {
  const date = new Date(recordDate).toISOString().slice(0, 10)
  return new Date(`${date}T${time}`).toISOString()
}

const getPolicyDateError = (policy, recordDate) => {
  if (!policy || !recordDate) return ''

  const attendanceDate = new Date(recordDate)
  attendanceDate.setUTCHours(0, 0, 0, 0)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const ageInDays = Math.floor((today - attendanceDate) / (1000 * 60 * 60 * 24))

  if (!policy.requestWindow?.futureAllowed && attendanceDate > today) {
    return 'This policy does not allow regularisation for future dates.'
  }
  if (ageInDays > policy.requestWindow?.pastDaysAllowed) {
    return `This attendance is outside the ${policy.requestWindow.pastDaysAllowed}-day regularisation window.`
  }

  return ''
}

// ─────────────────────────────────────────────────────────────────────────────
// Regularize Dialog
// ─────────────────────────────────────────────────────────────────────────────

export const RegularizeDialog = ({ open, onClose, record, onSuccess }) => {
  const [saving, setSaving] = useState(false)
  const [policy, setPolicy] = useState(null)
  const [policyLoading, setPolicyLoading] = useState(false)
  const [policyError, setPolicyError] = useState('')
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm({
    defaultValues: {
      regularizationType: '',
      status:             record?.status || 'PRESENT',
      checkIn:            getTimeInputValue(record?.checkIn),
      checkOut:           getTimeInputValue(record?.checkOut),
      remarks:            '',
    },
  })

  const regularizationType = watch('regularizationType')
  const allowedTypes = policy?.allowedRegularizationTypes || []
  const requiresCheckIn = CHECK_IN_TYPES.includes(regularizationType)
  const requiresCheckOut = CHECK_OUT_TYPES.includes(regularizationType)
  const policyDateError = getPolicyDateError(policy, record?.date)

  useEffect(() => {
    if (open && record) {
      reset({
        regularizationType: '',
        status:             record.status || 'PRESENT',
        checkIn:            getTimeInputValue(record.checkIn),
        checkOut:           getTimeInputValue(record.checkOut),
        remarks:            '',
      })
    }
  }, [open, record, reset])

  useEffect(() => {
    if (!open || !record?._id) return undefined

    let active = true
    setPolicy(null)
    setPolicyError('')
    setPolicyLoading(true)

    axiosRequest
      .get('/api/v1/regularisation/policies/effective', { params: { attendanceId: record._id } })
      .then(response => {
        if (!active) return

        const effectivePolicy = response?.data
        const effectiveTypes = effectivePolicy?.allowedRegularizationTypes || []
        if (!effectivePolicy) {
          setPolicyError('No active regularisation policy applies to this employee.')
        } else if (effectiveTypes.length === 0) {
          setPolicyError('The active policy does not allow any supported correction type.')
        } else {
          setPolicy(effectivePolicy)
          setValue('regularizationType', effectiveTypes[0], { shouldValidate: true })
        }
      })
      .catch(error => {
        if (active) {
          setPolicyError(typeof error === 'string' ? error : error?.message || 'Unable to load the regularisation policy.')
        }
      })
      .finally(() => {
        if (active) setPolicyLoading(false)
      })

    return () => {
      active = false
    }
  }, [open, record?._id, setValue])

  const onSubmit = async (data) => {
    clearErrors(['regularizationType', 'checkIn', 'checkOut'])

    if (!allowedTypes.includes(data.regularizationType)) {
      setError('regularizationType', { message: 'Select a correction type allowed by the active policy.' })
      return
    }
    if (policyDateError) {
      toast.error(policyDateError)
      return
    }
    if (requiresCheckIn && !data.checkIn) {
      setError('checkIn', { message: 'Check-in time is required for this correction type.' })
      return
    }
    if (requiresCheckOut && !data.checkOut) {
      setError('checkOut', { message: 'Check-out time is required for this correction type.' })
      return
    }

    const checkIn = requiresCheckIn ? combineRecordDateAndTime(record.date, data.checkIn) : null
    const checkOut = requiresCheckOut ? combineRecordDateAndTime(record.date, data.checkOut) : null
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      setError('checkOut', { message: 'Check-out time must be after check-in time.' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        regularizationType: data.regularizationType,
        status:             data.status,
        checkIn,
        checkOut,
        remarks:            data.remarks,
      }
      const res = await axiosRequest.patch(`/api/v1/attendance/${record._id}/regularize`, payload)
      if (res?.success) {
        toast.success('Attendance regularized successfully')
        onSuccess(res.data)
        onClose()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to regularize')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant='h6'>Regularize Attendance</Typography>
          {record && (
            <Typography variant='caption' color='text.secondary'>
              {record.employeeId?.name || record.employeeName} ·{' '}
              {record.date
                ? new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—'}
            </Typography>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={4} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            {policyLoading && (
              <Alert severity='info' icon={<CircularProgress size={18} />}>
                Loading the employee&apos;s regularisation policy...
              </Alert>
            )}
            {policyError && <Alert severity='error'>{policyError}</Alert>}
            {policy && !policyDateError && (
              <Alert severity='info'>
                {policy.name}: requests are allowed for today and the previous {policy.requestWindow?.pastDaysAllowed} days
                {policy.requestWindow?.futureAllowed ? ', including future dates.' : '; future dates are not allowed.'}
              </Alert>
            )}
            {policyDateError && <Alert severity='error'>{policyDateError}</Alert>}
          </Grid>
          <Grid item xs={12}>
            <Controller name='regularizationType' control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  select
                  fullWidth
                  label='Correction Type'
                  disabled={policyLoading || Boolean(policyError)}
                  error={!!errors.regularizationType}
                  helperText={errors.regularizationType?.message || 'Options are controlled by the active regularisation policy.'}
                >
                  {allowedTypes.map(value => (
                    <MenuItem key={value} value={value}>{REGULARIZATION_TYPE_LABEL[value] || value}</MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name='status' control={control}
              render={({ field }) => (
                <CustomTextField {...field} select fullWidth label='Status'>
                  {Object.entries(STATUS_LABEL).map(([val, label]) => (
                    <MenuItem key={val} value={val}>{label}</MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Grid>
          {requiresCheckIn && (
            <Grid item xs={12} sm={requiresCheckOut ? 6 : 12}>
              <Controller name='checkIn' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='time' label='Check In Time *'
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.checkIn}
                    helperText={errors.checkIn?.message || 'Select the corrected punch-in time.'}
                  />
                )}
              />
            </Grid>
          )}
          {requiresCheckOut && (
            <Grid item xs={12} sm={requiresCheckIn ? 6 : 12}>
              <Controller name='checkOut' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='time' label='Check Out Time *'
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.checkOut}
                    helperText={errors.checkOut?.message || (requiresCheckIn ? 'Must be after check-in time.' : 'Select the corrected punch-out time.')}
                  />
                )}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Controller name='remarks' control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth multiline rows={2} label='Remarks *'
                  placeholder='e.g. Employee forgot to punch in'
                  error={!!errors.remarks}
                  helperText={errors.remarks?.message || 'Enter at least 5 characters.'}
                />
              )}
              rules={{ required: 'Remarks are required.', minLength: { value: 5, message: 'Remarks must be at least 5 characters.' } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant='contained' onClick={handleSubmit(onSubmit)}
          disabled={saving || policyLoading || Boolean(policyError) || allowedTypes.length === 0 || Boolean(policyDateError)}
          startIcon={saving ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:edit' />}
        >
          {saving ? 'Saving…' : 'Regularize'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Employee Summary Dialog
// ─────────────────────────────────────────────────────────────────────────────

export const EmployeeSummaryDialog = ({ open, onClose, employee, month, summaryData, loading }) => {
  const items = [
    { key: 'present',            label: 'Present',           icon: 'tabler:circle-check',      color: 'success'   },
    { key: 'absent',             label: 'Absent',            icon: 'tabler:circle-x',          color: 'error'     },
    { key: 'late',               label: 'Late',              icon: 'tabler:clock-exclamation', color: 'warning'   },
    { key: 'halfDay',            label: 'Half Day',          icon: 'tabler:clock-half',        color: 'info'      },
    { key: 'onLeave',            label: 'On Leave',          icon: 'tabler:calendar-off',      color: 'primary'   },
    { key: 'holiday',            label: 'Holiday',           icon: 'tabler:calendar-holiday',  color: 'default'   },
    { key: 'weekend',            label: 'Weekend',           icon: 'tabler:calendar-week',     color: 'default'   },
    { key: 'wfh',                label: 'Work From Home',    icon: 'tabler:home-check',        color: 'info'      },
    { key: 'totalWorkingHours',  label: 'Working Hours',     icon: 'tabler:clock',             color: 'secondary' },
    { key: 'totalOvertimeHours', label: 'Overtime Hours',    icon: 'tabler:timeline-event-ex', color: 'warning'   },
    { key: 'totalLateMinutes',   label: 'Late Minutes',      icon: 'tabler:alert-circle',      color: 'error'     },
  ]

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant='h6'>Attendance Summary</Typography>
          {employee && month && (
            <Typography variant='caption' color='text.secondary'>
              {employee.name} ({employee.employeeId}){employee.email && ` · ${employee.email}`} · {month}
            </Typography>
          )}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {items.map(item => (
            <Grid key={item.key} item xs={6} sm={4}>
              <Box sx={{
                p: 2.5, borderRadius: 1.5, textAlign: 'center',
                border: t => `1px solid ${t.palette.divider}`,
                bgcolor: t => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                transition: 'all 0.15s',
              }}>
                {loading ? (
                  <>
                    <Skeleton variant='circular' width={28} height={28} sx={{ mx: 'auto', mb: 1 }} />
                    <Skeleton variant='text' width='70%' sx={{ mx: 'auto' }} />
                  </>
                ) : (
                  <>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '50%', mx: 'auto', mb: 0.75,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: `${item.color}.main`, opacity: 0.85,
                    }}>
                      <Icon icon={item.icon} color='white' fontSize='1rem' />
                    </Box>
                    <Typography variant='subtitle2' fontWeight={700}>
                      {summaryData?.[item.key] ?? '—'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>{item.label}</Typography>
                  </>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant='tonal' color='secondary' onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

// Default export for backward compatibility
export default RegularizeDialog
