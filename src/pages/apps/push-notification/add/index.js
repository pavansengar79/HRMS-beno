// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import { Chip } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { addpushNotification, fetchUsers } from 'src/store/apps/push-notification'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

const AddModal = ({ handleClose }) => {
  const defaultValues = {
    sentTo: '',
    title: '',
    body: '',
    redirectTo: '',
    users: []
  }

  // ** States

  const dispatch = useDispatch()

  // ** Hooks

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const data = useSelector(state => state.pushNotification)
  const options = data?.users

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const onSubmit = e => {
    if (e.sentTo === 'Selected Users') {
      const usersId = e.users.map(user => user._id)
      e.users = usersId
    }
    dispatch(addpushNotification(e))
    handleClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <Controller
            name='title'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Title'
                onChange={onChange}
                placeholder=''
                error={Boolean(errors.title)}
                aria-describedby='validation-basic-first-name'
                {...(errors.title && { helperText: 'Title is required' })}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <Controller
            name='body'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Body'
                onChange={onChange}
                placeholder=''
                error={Boolean(errors.body)}
                aria-describedby='validation-basic-first-name'
                {...(errors.body && { helperText: 'Body is required' })}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <Controller
            name='redirectTo'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                select
                fullWidth
                value={value}
                label='Redirect To'
                onChange={onChange}
                error={Boolean(errors.redirectTo)}
                aria-describedby='validation-basic-first-name'
                {...(errors.redirectTo && { helperText: 'Redirect to is required' })}
              >
                <MenuItem value='Home Page'>Home Page</MenuItem>
                <MenuItem value='Order List'>Order List</MenuItem>
                <MenuItem value='Payment History'>Payment History</MenuItem>
                <MenuItem value='View Claim'>View Claim</MenuItem>
                <MenuItem value='View Warranty'>View Warranty</MenuItem>
                <MenuItem value='Loyalty Program'>Loyalty Program</MenuItem>
                <MenuItem value='Forecast'>Forecast</MenuItem>
                <MenuItem value='Dealer Financial Health'>Dealer Financial Health</MenuItem>
                <MenuItem value='Account Statement'>Account Statement</MenuItem>
                <MenuItem value='ROI Calculator'>ROI Calculator</MenuItem>
                <MenuItem value='Landing Price Calculator'>Landing Price Calculator</MenuItem>
                <MenuItem value='Invoice History'>Invoice History</MenuItem>
                <MenuItem value='Offtake'>Offtake</MenuItem>
                <MenuItem value='Credit Debit Note'>Credit Debit Note</MenuItem>
                <MenuItem value='Settings'>Settings</MenuItem>
                <MenuItem value='FAQ'>FAQ</MenuItem>
                <MenuItem value='Download'>Download</MenuItem>
                <MenuItem value='Support'>Support</MenuItem>
              </CustomTextField>
            )}
          />
        </Grid>
        <Controller
          name='sentTo'
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <>
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  select
                  fullWidth
                  label='Send To'
                  SelectProps={{
                    value: value,
                    onChange: e => onChange(e)
                  }}
                  id='validation-basic-select'
                  error={Boolean(errors.sentTo)}
                  aria-describedby='validation-basic-select'
                  {...(errors.sentTo && { helperText: 'Send to is required' })}
                >
                  <MenuItem value='All Users'>All Users</MenuItem>
                  <MenuItem value='Selected Users'>Selected Users</MenuItem>
                </CustomTextField>
              </Grid>
              {value === 'Selected Users' && (
                <Controller
                  name='users'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <Grid item xs={12} sm={12}>
                      <CustomAutocomplete
                        freeSolo
                        multiple
                        id='autocomplete-multiple-filled'
                        options={options}
                        getOptionLabel={option => option.name}
                        value={value}
                        onChange={(e, newValue) => onChange(newValue)}
                        renderInput={params => (
                          <CustomTextField
                            fullWidth
                            {...params}
                            variant='filled'
                            label='Select Users'
                            placeholder='Enter Kunnr(s)'
                            error={Boolean(errors.users)}
                            aria-describedby='validation-basic-select'
                            {...(errors.users && { helperText: 'Users is required' })}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip label={option.name} {...getTagProps({ index })} key={index} />
                          ))
                        }
                      />
                    </Grid>
                  )}
                />
              )}
            </>
          )}
        />
      </Grid>
      <Grid container justifyContent='center' columnGap={5} sx={{ mt: 5 }}>
        <Button type='submit' variant='contained'>
          SUBMIT
        </Button>
        <Button variant='tonal' color='secondary' onClick={handleClose}>
          CANCEL
        </Button>
      </Grid>
    </form>
  )
}

export default AddModal
