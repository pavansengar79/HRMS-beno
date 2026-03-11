// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ---------------------------------------------------------------------------
// Mock API helpers
// ---------------------------------------------------------------------------

/**
 * Fetches today's existing attendance record for the current user.
 * Replace with: axios.get(`/api/attendance/today/${userId}`)
 */
const fetchTodayRecord = async userId => {
  await new Promise(r => setTimeout(r, 300))

  // Mock: user has already clocked in but not out
  return {
    data: {
      checkIn:  '09:20 AM',
      checkOut: null,
      notes:    ''
    }
  }
}

/**
 * Saves the clock-in / clock-out record.
 * Replace with: axios.post('/api/attendance/clock', payload)
 */
const postAttendance = async payload => {
  await new Promise(r => setTimeout(r, 350))
  console.log('Attendance payload:', payload)

  return { success: true }
}

// ---------------------------------------------------------------------------
// Styled header — same pattern as AddCompanyDrawer
// ---------------------------------------------------------------------------
const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

// ---------------------------------------------------------------------------
// Yup schema
// ---------------------------------------------------------------------------
const schema = yup.object().shape({
  checkIn:  yup.string().required('Check-in time is required'),
  checkOut: yup.string(),
  notes:    yup.string()
})

const defaultValues = {
  checkIn:  '',
  checkOut: '',
  notes:    ''
}

// ---------------------------------------------------------------------------
// AttendanceDrawer
// ---------------------------------------------------------------------------
const AttendanceDrawer = ({ open, toggle, userId, onSuccess }) => {
  const [status, setStatus]       = useState('')
  const [fetching, setFetching]   = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  // Pre-fill form with today's existing record when drawer opens
  useEffect(() => {
    if (!open) return

    const load = async () => {
      setFetching(true)
      try {
        const res = await fetchTodayRecord(userId)
        const { checkIn, checkOut, notes } = res.data

        setValue('checkIn',  checkIn  ?? '')
        setValue('checkOut', checkOut ?? '')
        setValue('notes',    notes    ?? '')

        // Auto-derive status for the dropdown
        if (checkIn && checkOut) setStatus('Present')
        else if (checkIn)        setStatus('Working')
        else                     setStatus('')
      } catch (err) {
        console.error('Failed to fetch today record:', err)
      } finally {
        setFetching(false)
      }
    }

    load()
  }, [open, userId, setValue])

  const onSubmit = async data => {
    setSubmitting(true)
    try {
      await postAttendance({ ...data, status, userId, date: new Date().toISOString().split('T')[0] })
      handleClose()
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Clock action failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
    setStatus('')
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      {/* Header */}
      <Header>
        <Box>
          <Typography variant='h5'>Mark Attendance</Typography>
          <Typography variant='body2' sx={{ color: 'text.disabled', mt: 0.5 }}>
            {today}
          </Typography>
        </Box>
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{
            p: '0.438rem',
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>

      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        {fetching ? (
          <Typography sx={{ color: 'text.disabled' }}>Loading today&apos;s record…</Typography>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Check-in Time */}
            <Controller
              name='checkIn'
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  type='time'
                  value={value}
                  sx={{ mb: 4 }}
                  label='Check-in Time'
                  onChange={onChange}
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(errors.checkIn)}
                  {...(errors.checkIn && { helperText: errors.checkIn.message })}
                />
              )}
            />

            {/* Check-out Time */}
            <Controller
              name='checkOut'
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  type='time'
                  value={value}
                  sx={{ mb: 4 }}
                  label='Check-out Time'
                  onChange={onChange}
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(errors.checkOut)}
                  {...(errors.checkOut && { helperText: errors.checkOut.message })}
                />
              )}
            />

            {/* Status */}
            <CustomTextField
              select
              fullWidth
              value={status}
              sx={{ mb: 4 }}
              label='Status'
              onChange={e => setStatus(e.target.value)}
              SelectProps={{ value: status, onChange: e => setStatus(e.target.value) }}
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value='Present'>Present</MenuItem>
              <MenuItem value='Late'>Late</MenuItem>
              <MenuItem value='Half Day'>Half Day</MenuItem>
              <MenuItem value='Working'>Working</MenuItem>
              <MenuItem value='Absent'>Absent</MenuItem>
            </CustomTextField>

            {/* Notes */}
            <Controller
              name='notes'
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  multiline
                  rows={3}
                  value={value}
                  sx={{ mb: 6 }}
                  label='Notes (optional)'
                  onChange={onChange}
                  placeholder='Add any remarks…'
                />
              )}
            />

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button type='submit' variant='contained' sx={{ mr: 3 }} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save'}
              </Button>
              <Button variant='tonal' color='secondary' onClick={handleClose} disabled={submitting}>
                Cancel
              </Button>
            </Box>
          </form>
        )}
      </Box>
    </Drawer>
  )
}

export default AttendanceDrawer