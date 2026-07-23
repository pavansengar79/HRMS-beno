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
  Button, Box, Typography, Grid, CircularProgress, Skeleton
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

// ─────────────────────────────────────────────────────────────────────────────
// Regularize Dialog
// ─────────────────────────────────────────────────────────────────────────────

export const RegularizeDialog = ({ open, onClose, record, onSuccess }) => {
  const [saving, setSaving] = useState(false)
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      status:   record?.status || 'PRESENT',
      checkIn:  record?.checkIn  ? new Date(record.checkIn).toISOString().slice(0, 16)  : '',
      checkOut: record?.checkOut ? new Date(record.checkOut).toISOString().slice(0, 16) : '',
      remarks:  '',
    },
  })

  useEffect(() => {
    if (open && record) {
      reset({
        status:   record.status || 'PRESENT',
        checkIn:  record.checkIn  ? new Date(record.checkIn).toISOString().slice(0, 16)  : '',
        checkOut: record.checkOut ? new Date(record.checkOut).toISOString().slice(0, 16) : '',
        remarks:  '',
      })
    }
  }, [open, record, reset])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const payload = {
        status:   data.status,
        checkIn:  data.checkIn  ? new Date(data.checkIn).toISOString()  : null,
        checkOut: data.checkOut ? new Date(data.checkOut).toISOString() : null,
        remarks:  data.remarks,
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
            <Controller name='status' control={control}
              render={({ field }) => (
                <CustomTextField {...field} select fullWidth label='Status'>
                  {Object.entries(STATUS_LABEL).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </CustomTextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name='checkIn' control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth type='datetime-local' label='Check In'
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name='checkOut' control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth type='datetime-local' label='Check Out'
                  InputLabelProps={{ shrink: true }}
                  helperText='Must be after check-in'
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name='remarks' control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth multiline rows={2} label='Remarks *'
                  placeholder='e.g. Employee forgot to punch in'
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant='contained' onClick={handleSubmit(onSubmit)} disabled={saving}
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
