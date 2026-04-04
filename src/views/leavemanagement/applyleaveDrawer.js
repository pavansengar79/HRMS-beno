// ** React Imports
import { useState } from 'react'

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
// Mock leave types — replace with API call if needed
// ---------------------------------------------------------------------------
const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Unpaid Leave']

// ---------------------------------------------------------------------------
// Mock API helper
// ---------------------------------------------------------------------------

/**
 * Submit a leave application.
 * Replace with: axios.post('/api/leaves/apply', payload)
 */
const postLeave = async payload => {
  await new Promise(r => setTimeout(r, 350))
  console.log('Leave payload:', payload)

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
  fromDate: yup.string().required('From date is required'),
  toDate:   yup.string().required('To date is required'),
  reason:   yup.string().required('Reason is required')
})

const defaultValues = {
  fromDate: '',
  toDate:   '',
  reason:   ''
}

// ---------------------------------------------------------------------------
// ApplyLeaveDrawer
// ---------------------------------------------------------------------------
const ApplyLeaveDrawer = ({ open, toggle, userId, onSuccess }) => {
  const [leaveType,   setLeaveType]   = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const onSubmit = async data => {
    setSubmitting(true)
    try {
      await postLeave({ ...data, leaveType, userId })
      handleClose()
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Leave application failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
    setLeaveType('')
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
      <Header>
        <Typography variant='h5'>Apply Leave</Typography>
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
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Leave Type */}
          <CustomTextField
            select
            fullWidth
            value={leaveType}
            sx={{ mb: 4 }}
            label='Leave Type'
            onChange={e => setLeaveType(e.target.value)}
            SelectProps={{ value: leaveType, onChange: e => setLeaveType(e.target.value) }}
          >
            <MenuItem value=''>Select Leave Type</MenuItem>
            {LEAVE_TYPES.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </CustomTextField>

          {/* From Date */}
          <Controller
            name='fromDate'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                type='date'
                value={value}
                sx={{ mb: 4 }}
                label='From Date'
                onChange={onChange}
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.fromDate)}
                {...(errors.fromDate && { helperText: errors.fromDate.message })}
              />
            )}
          />

          {/* To Date */}
          <Controller
            name='toDate'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                type='date'
                value={value}
                sx={{ mb: 4 }}
                label='To Date'
                onChange={onChange}
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.toDate)}
                {...(errors.toDate && { helperText: errors.toDate.message })}
              />
            )}
          />

          {/* Reason */}
          <Controller
            name='reason'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                multiline
                rows={4}
                value={value}
                sx={{ mb: 6 }}
                label='Reason'
                onChange={onChange}
                placeholder='Describe the reason for leave…'
                error={Boolean(errors.reason)}
                {...(errors.reason && { helperText: errors.reason.message })}
              />
            )}
          />

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button type='submit' variant='contained' sx={{ mr: 3 }} disabled={submitting}>
              {submitting ? 'Applying…' : 'Apply Leave'}
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}

export default ApplyLeaveDrawer