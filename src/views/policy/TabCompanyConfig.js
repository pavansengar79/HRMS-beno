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
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** API

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const TIMEZONES = [
  'Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles',
  'Europe/London', 'Asia/Dubai', 'Asia/Singapore'
]

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD']

const DATE_FORMATS = ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY']

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' }
]

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const defaultValues = {
  companyName: '',
  fiscalYearStart: 4,
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  dateFormat: 'DD-MM-YYYY',
  workWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  defaultWorkingHoursPerDay: 8,
  payrollCutoffDay: 28,
  salaryCreditDay: 7
}

// ─── TabCompanyConfig ─────────────────────────────────────────────────────────

const TabCompanyConfig = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues })

  // GET company config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axiosRequest.get('/company/config')
        if (res.data?.success && res.data.data) {
          reset({ ...defaultValues, ...res.data.data })
        }
      } catch {
        // No config yet — form stays with defaults
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])






  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const res = await axiosRequest.put('/company/config', {
        ...data,
        fiscalYearStart: Number(data.fiscalYearStart),
        defaultWorkingHoursPerDay: Number(data.defaultWorkingHoursPerDay),
        payrollCutoffDay: Number(data.payrollCutoffDay),
        salaryCreditDay: Number(data.salaryCreditDay)
      })
      if (res.data?.success) {
        toast.success('Company config saved')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }



  // if (loading) {
  //   return (
  //     <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
  //       <CircularProgress />
  //     </Box>
  //   )
  // }

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
            startIcon={saving ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:device-floppy' />}
          >
            {saving ? 'Saving...' : 'Save Config'}
          </Button>
        }
      />
      <Divider />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>

            {/* ── Company Info ─────────────────────── */}
            <Grid item xs={12}>
              <Typography variant='overline' color='text.secondary'>Company Info</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller name='companyName' control={control}
                rules={{ required: 'Company name is required' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field} fullWidth label='Company Name *'
                    error={!!errors.companyName} helperText={errors.companyName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name='fiscalYearStart' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select fullWidth label='Fiscal Year Start'>
                    {MONTHS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller name='timezone' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select fullWidth label='Timezone'>
                    {TIMEZONES.map(tz => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name='currency' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select fullWidth label='Currency'>
                    {CURRENCIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name='dateFormat' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select fullWidth label='Date Format'>
                    {DATE_FORMATS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12}><Divider /></Grid>

            {/* ── Work Week ───────────────────────── */}
            <Grid item xs={12}>
              <Typography variant='overline' color='text.secondary'>Work Week</Typography>
            </Grid>
            <Grid item xs={12}>
              <Controller name='workWeek' control={control}
                render={({ field }) => (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {DAYS_OF_WEEK.map(day => (
                      <FormControlLabel key={day} label={day}
                        control={
                          <Checkbox
                            checked={field.value?.includes(day)}
                            onChange={e => {
                              const cur = field.value || []
                              field.onChange(e.target.checked ? [...cur, day] : cur.filter(d => d !== day))
                            }}
                          />
                        }
                      />
                    ))}
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name='defaultWorkingHoursPerDay' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number' label='Working Hours / Day' />
                )}
              />
            </Grid>

            <Grid item xs={12}><Divider /></Grid>

            {/* ── Payroll Dates ────────────────────── */}
            <Grid item xs={12}>
              <Typography variant='overline' color='text.secondary'>Payroll Dates</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name='payrollCutoffDay' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number' label='Payroll Cutoff Day'
                    helperText='Day of month payroll processing closes (e.g. 28)'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name='salaryCreditDay' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number' label='Salary Credit Day'
                    helperText='Day of month salary is paid to employees (e.g. 5)'
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