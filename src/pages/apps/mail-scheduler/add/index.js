import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button, Grid, MenuItem } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useDispatch } from 'react-redux'
import { addMailScheduler } from 'src/store/apps/mail-scheduler'

const AddModal = ({ onClose }) => {
  yup.addMethod(yup.string, 'emails', function (message) {
    return this.test('emails', message, function (value) {
      const { path, createError } = this

      if (!value) {
        return true
      }

      const emails = value.split(',').map(email => email.trim())
      const isValid = emails.every(email => yup.string().email().isValidSync(email))

      return isValid || createError({ path, message })
    })
  })

  const schema = yup.object().shape({
    report: yup.string().required('Report is required'),
    frequency: yup.string().required('Frequency is required'),
    email: yup.string().emails('Each email must be a valid email').required('Email is required')
  })

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const dispatch = useDispatch()

  const onSubmit = data => {
    dispatch(addMailScheduler({ report: data.report, frequency: data.frequency, userList: data.email }))
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container rowGap={5}>
        <Grid item xs={12} sm={12}>
          <Controller
            name='report'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='Report'
                id='form-layouts-separator-select'
                error={!!errors.report}
                helperText={errors.report ? errors.report.message : ''}
              >
                <MenuItem value='Secondary Sales'>Secondary Sales</MenuItem>
                <MenuItem value='Orders'>Orders</MenuItem>
                <MenuItem value='Payments'>Payments</MenuItem>
                <MenuItem value='Device logins'>Device logins</MenuItem>
                <MenuItem value='Dealer order'>Dealer order</MenuItem>
                <MenuItem value='Dealer payment'>Dealer payment</MenuItem>
                <MenuItem value='Warranty'>Warranty</MenuItem>
                <MenuItem value='Claims'>Claims</MenuItem>
                <MenuItem value='Retread'>Retread</MenuItem>
                <MenuItem value='Queries'>Queries</MenuItem>
              </CustomTextField>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <Controller
            name='frequency'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='Frequency'
                id='form-layouts-separator-select'
                error={!!errors.frequency}
                helperText={errors.frequency ? errors.frequency.message : ''}
              >
                <MenuItem value='Daily'>Daily</MenuItem>
                <MenuItem value='Weekly'>Weekly</MenuItem>
                <MenuItem value='Monthly'>Monthly</MenuItem>
              </CustomTextField>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          {/* Add validation for email */}
          <Controller
            name='email'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Email'
                id='form-layouts-separator-select'
                error={!!errors.email}
                helperText={errors.email ? errors.email.message : ''}
              />
            )}
          />
        </Grid>
        <Grid container justifyContent='center'>
          <Button type='submit' variant='contained' sx={{ mr: 4 }}>
            SUBMIT
          </Button>
          <Button variant='tonal' color='secondary' onClick={() => onClose()}>
            CANCEL
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default AddModal
