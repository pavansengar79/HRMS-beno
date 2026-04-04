// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const LEAVE_TYPES = ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity Leave']

const defaultForm = {
  leaveType : '',
  fromDate  : '',
  toDate    : '',
  reason    : '',
  attachment: null
}

const TabApplyLeave = () => {
  const [form, setForm]       = useState(defaultForm)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = field => e =>
    setForm(p => ({ ...p, [field]: e.target.value }))

  const handleSubmit = () => {
    // TODO: dispatch Redux thunk here
    console.log('Leave application:', form)
    setSubmitted(true)
    setForm(defaultForm)
    setTimeout(() => setSubmitted(false), 4000)
  }

  const isValid = form.leaveType && form.fromDate && form.toDate && form.reason

  return (
    <Card>
      <CardHeader
        title='Apply for Leave'
        subheader='Fill in the details to submit a leave request'
      />
      <CardContent>
        {submitted && (
          <Alert severity='success' sx={{ mb: 4 }} icon={<Icon icon='tabler:circle-check' />}>
            Leave request submitted successfully!
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label='Leave Type'
              value={form.leaveType}
              onChange={handleChange('leaveType')}
            >
              {LEAVE_TYPES.map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type='date'
              label='From Date'
              InputLabelProps={{ shrink: true }}
              value={form.fromDate}
              onChange={handleChange('fromDate')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type='date'
              label='To Date'
              InputLabelProps={{ shrink: true }}
              value={form.toDate}
              onChange={handleChange('toDate')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label='Reason for Leave'
              value={form.reason}
              onChange={handleChange('reason')}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
              <Button variant='outlined' onClick={() => setForm(defaultForm)}>
                Reset
              </Button>
              <Button
                variant='contained'
                disabled={!isValid}
                onClick={handleSubmit}
                startIcon={<Icon icon='tabler:send' />}
              >
                Submit Request
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default TabApplyLeave