import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material'
import { fetchSchemeParameter, addTSO } from 'src/store/apps/TSO/simulator'
import { useRouter } from 'next/router'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { handleKeyPress } from 'src/utils/helper'
import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import PickersCustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'
import { enIN } from 'date-fns/locale'

const SimulatorFields = ({ schemeConfigure, setTargetData, setExpanded }) => {
  useEffect(() => {
    dispatch(fetchSchemeParameter({ module: 'Ealy Bird' }))
  }, [schemeConfigure])

  const dispatch = useDispatch()
  const state = useSelector(state => state.TSOSimulator)
  console.log('state', state)

  // const filteredValues = state.TSOSimulator.map(item => {
  //   if (item?.fieldType === 'Array') {
  //     return { [item.fieldName]: [item?.values.length.toString()] }
  //   } else return false
  // })
  // let filteredArr = filteredValues.filter(item => item !== false)
  // const defaultValues = Object.assign({}, ...filteredArr)
  // console.log(defaultValues)

  const router = useRouter()

  const {
    register,
    unregister,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    control
  } = useForm()

  const onSubmit = async data => {
    console.log('data', data)
    setTargetData(data)
    // dispatch(addTSO(data))
    // if (state.TSOSchemeLoading === 'LOADED') {
    //   router.push('/apps/TSO/schemeParameter')
    // }
    setExpanded(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Grid container spacing={4}>
        {state?.SchemeParameter?.map((item, i) =>
          item?.fieldType === 'Number' ? (
            <Grid item xs={12} sm={4} key={i}>
              <CustomTextField
                fullWidth
                label={item?.fieldName}
                onKeyPress={e => handleKeyPress(e)}
                {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
                error={Boolean(errors[item?.fieldName])}
                helperText={errors[item?.fieldName] ? errors[item?.fieldName]?.message : ''}
              />
            </Grid>
          ) : item?.fieldType === 'Dropdown' ? (
            <Grid item xs={12} sm={4} key={i}>
              <CustomTextField
                select
                fullWidth
                label={item?.fieldName}
                {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
                error={Boolean(errors[item?.fieldName])}
                helperText={errors[item?.fieldName] ? errors[item?.fieldName]?.message : ''}
              >
                {item?.values.map((val, i) => (
                  <MenuItem key={i} value={val}>
                    {val}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
          ) : item?.fieldType === 'Radio' ? (
            <Grid item xs={12} sm={4} key={i}>
              <FormControl>
                <FormLabel>{item?.fieldName}</FormLabel>
                <Controller
                  name={item?.fieldName}
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <RadioGroup row {...field}>
                      {item?.values.map((val, i) => (
                        <FormControlLabel key={i} value={val} control={<Radio />} label={val} />
                      ))}
                    </RadioGroup>
                  )}
                />
              </FormControl>
            </Grid>
          ) : item?.fieldType === 'Checkbox' ? (
            <Grid item xs={12} sm={4} key={i}>
              <FormControl>
                <FormLabel>{item?.fieldName}</FormLabel>
                <RadioGroup
                  row
                  aria-label='applicable'
                  {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
                >
                  {item?.values?.map((val, i) => (
                    <FormControlLabel key={i} value={val} control={<Checkbox />} label={val} />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
          ) : item?.fieldType === 'Date' ? (
            <Grid item xs={12} sm={4} key={i}>
              <Controller
                name={item?.fieldName}
                control={control}
                defaultValue={null}
                rules={{ required: true }}
                render={({ field }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      isClearable
                      locale={enIN}
                      popperPlacement={'bottom-end'}
                      dateFormat='yyyy/MM/dd'
                      {...field}
                      onChange={field.onChange}
                      placeholderText='Select Date'
                      customInput={
                        <PickersCustomInput label='Date' value={field.value} fullWidth sx={{ width: 290 }} />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>
          ) : item?.fieldType === 'Boolean' ? (
            <Grid item xs={12} sm={4} key={i}>
              <CustomTextField
                select
                fullWidth
                label={item?.fieldName}
                {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
                error={Boolean(errors[item?.fieldName])}
                helperText={errors[item?.fieldName] ? errors[item?.fieldName]?.message : ''}
              >
                <MenuItem value='true'>True</MenuItem>
                <MenuItem value='false'>False</MenuItem>
              </CustomTextField>
            </Grid>
          ) : (
            <Grid item xs={12} sm={4} key={i}>
              <CustomTextField
                fullWidth
                label={item?.fieldName}
                {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
                error={Boolean(errors[item?.fieldName])}
                helperText={errors[item?.fieldName] ? errors[item?.fieldName]?.message : ''}
              ></CustomTextField>
            </Grid>
          )
        )}
      </Grid>
      <Grid sx={{ mt: 5 }} container>
        <Button type='submit' sx={{ mr: 2 }} variant='outlined'>
          Save and Continue
        </Button>
      </Grid>
    </form>
  )
}

export default SimulatorFields
