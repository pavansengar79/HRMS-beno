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

// const defaultValues = {
//   slab_inputs: [
//     {
//       failure_end: '',
//       failure_start: '',
//       failure_step: '',
//       slab_end: '',
//       slab_start: '',
//       slab_step: '',
//       success_end: '',
//       success_start: '',
//       success_step: '',
//       target_end: '',
//       target_start: '',
//       target_step: ''
//     }
//   ]
// }

const DefineTarget2 = ({ allData, targetData, slabInputs }) => {
  const dispatch = useDispatch()
  // const state = useSelector(state => state.TSOSimulator)
  console.log('state2', allData)

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
    setValue,
    formState: { errors },
    control
  } = useForm()

  useEffect(() => {
    allData.map(el => setValue(el.fieldName, el.field_value))
  }, [allData])

  const onSubmit = async data => {
    console.log('data', data)
    // setTargetData(data)
    // dispatch(addTSO(data))
    // if (state.TSOSchemeLoading === 'LOADED') {
    //   router.push('/apps/TSO/schemeParameter')
    // }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Grid container spacing={4}>
        {allData?.map((item, i) =>
          item?.fieldType === 'Number' ? (
            <Grid item xs={12} sm={4} key={i}>
              <CustomTextField
              disabled
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
              disabled
                fullWidth
                label={item?.fieldName}
                {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
              ></CustomTextField>
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
                        <FormControlLabel disabled key={i} value={val} control={<Radio />} label={val} />
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
                    <FormControlLabel disabled key={i} value={val} control={<Checkbox />} label={val} />
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
                        <PickersCustomInput disabled label='Date' value={field.value} fullWidth sx={{ width: 290 }} />
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
                disabled
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
                disabled
                label={item?.fieldName}
                {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
                error={Boolean(errors[item?.fieldName])}
                helperText={errors[item?.fieldName] ? errors[item?.fieldName]?.message : ''}
              ></CustomTextField>
            </Grid>
          )
        )}
        {slabInputs.length > 0 &&
          slabInputs?.map((val, i) => (
            <Grid item xs={12} sm={12} key={i}>
              <Typography variant='h5' sx={{ mb: 2 }}>
                Slab {i + 1}:
              </Typography>
              <Box
                key={i}
                mb={3}
                sx={{
                  border: '1px solid #999999',
                  borderRadius: 1,
                  padding: 5,
                  width: '100%',
                  display: 'Grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '10px'
                }}
              >
                <CustomTextField disabled fullWidth label={`failure_end`} value={val?.failure_end} />
                <CustomTextField disabled fullWidth label={`failure_start`} value={val?.failure_start} />
                <CustomTextField disabled fullWidth label={`failure_step`} value={val?.failure_step} />
                <CustomTextField disabled fullWidth label={`slab_end`} value={val?.failure_end} />
                <CustomTextField disabled fullWidth label={`slab_start`} value={val?.slab_start} />
                <CustomTextField disabled fullWidth label={`slab_step`} value={val?.slab_step} />
                <CustomTextField disabled fullWidth label={`success_end`} value={val?.success_end} />
                <CustomTextField disabled fullWidth label={`success_start`} value={val?.success_start} />
                <CustomTextField disabled fullWidth label={`success_step`} value={val?.success_step} />
                <CustomTextField disabled fullWidth label={`target_end`} value={val?.target_end} />
                <CustomTextField disabled fullWidth label={`target_start`} value={val?.target_start} />
                <CustomTextField disabled fullWidth label={`target_step`} value={val?.target_step} />
              </Box>
            </Grid>
          ))}
      </Grid>
      {/* <Grid sx={{ mt: 5 }} container>
        <Button type='submit' sx={{ mr: 2 }} variant='outlined'>
          Save and Continue
        </Button>
      </Grid> */}
    </form>
  )
}

export default DefineTarget2

// import Grid from '@mui/material/Grid'
// import CustomTextField from 'src/@core/components/mui/text-field'
// import { useEffect, useState } from 'react'

// const DefineTarget2 = ({ allData }) => {
//   console.log('state222', allData)

//   const [fieldData, setFieldData] = useState([])

//   useEffect(() => {
//     console.log('field', fieldData)
//     setFieldData(Object.keys(allData).map(key => ({ label: key, value: allData[key] })))
//   }, [allData])

//   return (
//     <Grid container spacing={4}>
//       {fieldData.map((item, index) => (
//         <Grid item xs={12} sm={4} key={index}>
//           <CustomTextField value={item?.value} disabled label={item?.label} />
//         </Grid>
//       ))}
//     </Grid>
//   )
// }

// export default DefineTarget2
