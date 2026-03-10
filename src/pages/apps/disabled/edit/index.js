// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import { Chip, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import { enIN } from 'date-fns/locale'
import PickersCustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'
import { fetchUsers, updateDisabledData } from 'src/store/apps/disabled'

const EditModal = ({ onClose, rowData }) => {
  const defaultValues = {
    allUsers: rowData?.allUsers === true ? 'true' : 'false',
    buttonModule: rowData?.buttonModule,
    startDate: new Date(rowData?.startDate),
    endDate: new Date(rowData?.endDate),
    user: rowData?.user
  }

  const dispatch = useDispatch()

  // ** Hooks

  const data = useSelector(state => state.disabled)
  // ** Hooks
  useEffect(() => {
    dispatch(fetchUsers())
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const onSubmit = e => {
    let data = {}
    if (e.allUsers === 'true') {
      data.allUsers = true
      data.startDate = e.startDate
      data.endDate = e.endDate
      data.buttonModule = e.buttonModule
    } else {
      data.allUsers = false
      data.startDate = e.startDate
      data.endDate = e.endDate
      data.buttonModule = e.buttonModule
      data.users = [e.user.Kunnr]
    }

    dispatch(updateDisabledData({ data: data, id: rowData?._id }))
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={5}>
          <Controller
            name='startDate'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <DatePickerWrapper>
                <DatePicker
                  isClearable
                  selected={value}
                  id='startDate'
                  fullWidth
                  popperPlacement='bottom-end'
                  locale={enIN}
                  dateFormat='yyyy/MM/dd'
                  onChange={date => {
                    onChange(date)
                  }}
                  placeholderText='select start date'
                  customInput={<PickersCustomInput label='Start Date' value={value} />}
                />
                {errors.startDate && (
                  <Typography variant='body2' color='error'>
                    Start date is required
                  </Typography>
                )}
              </DatePickerWrapper>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <Controller
            name='endDate'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <DatePickerWrapper>
                <DatePicker
                  isClearable
                  selected={value}
                  id='endDate'
                  fullWidth
                  popperPlacement='bottom-end'
                  locale={enIN}
                  dateFormat='yyyy/MM/dd'
                  onChange={date => {
                    onChange(date)
                  }}
                  placeholderText='select end date'
                  customInput={<PickersCustomInput label='End Date' value={value} />}
                />
                {errors.endDate && (
                  <Typography variant='body2' color='error'>
                    End date is required
                  </Typography>
                )}
              </DatePickerWrapper>
            )}
          />
        </Grid>
        <Controller
          name='allUsers'
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <>
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  select
                  fullWidth
                  label='User'
                  SelectProps={{
                    value: value,
                    onChange: e => onChange(e)
                  }}
                  id='validation-basic-select'
                  error={Boolean(errors.allUsers && value)}
                  aria-describedby='validation-basic-select'
                  {...(errors.allUsers && value && { helperText: 'Send to is required' })}
                >
                  <MenuItem value={'true'}>All Users</MenuItem>
                  <MenuItem value={'false'}>Single User</MenuItem>
                </CustomTextField>
              </Grid>
              {value === 'false' && (
                <Controller
                  name='user'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <Grid item xs={12} sm={12}>
                      <CustomAutocomplete
                        freeSolo={false}
                        multiple={false}
                        id='autocomplete-multiple-filled'
                        options={data?.users}
                        value={value}
                        getOptionLabel={option => `${option?.Kunnr} - ${option?.Name1}`}
                        onChange={(event, newValue) => {
                          onChange(newValue)
                        }}
                        onInputChange={(event, newInputValue) => {
                          dispatch(fetchUsers(newInputValue))
                        }}
                        renderInput={params => (
                          <CustomTextField
                            {...params}
                            variant='filled'
                            label='Select Dealers'
                            placeholder='Select Dealers'
                            error={Boolean(errors.user)}
                            helperText={errors.user ? 'User is required' : ''}
                            aria-describedby='validation-basic-first-name'
                          />
                        )}
                        // renderTags={(value, getTagProps) =>
                        //   value.map((option, index) => (
                        //     <Chip label={`${option.Kunnr} - ${option.Name1}`} {...getTagProps({ index })} key={index} />
                        //   ))
                        // }
                      />
                      {/* <CustomTextField
                        fullWidth
                        value={value}
                        label='Single User'
                        onChange={onChange}
                        placeholder='Enter Kunnr'
                        error={Boolean(errors.user)}
                        aria-describedby='validation-basic-first-name'
                        {...(errors.user && { helperText: 'User is required' })}
                      /> */}
                    </Grid>
                  )}
                />
              )}
            </>
          )}
        />
        <Controller
          name='buttonModule'
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <>
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  select
                  fullWidth
                  label='Type'
                  SelectProps={{
                    value: value,
                    onChange: e => onChange(e)
                  }}
                  id='validation-basic-select'
                  error={Boolean(errors.buttonModule)}
                  aria-describedby='validation-basic-select'
                  {...(errors.buttonModule && { helperText: 'Button Module is required' })}
                >
                  <MenuItem value='ORDER'>ORDER</MenuItem>
                  <MenuItem value='PAYMENT'>PAYMENT</MenuItem>
                </CustomTextField>
              </Grid>
            </>
          )}
        />
      </Grid>
      <Grid container justifyContent='center' columnGap={5} sx={{ mt: 5 }}>
        <Button type='submit' variant='contained'>
          SUBMIT
        </Button>
        <Button variant='tonal' color='secondary' onClick={onClose}>
          CANCEL
        </Button>
      </Grid>
    </form>
  )
}

export default EditModal
