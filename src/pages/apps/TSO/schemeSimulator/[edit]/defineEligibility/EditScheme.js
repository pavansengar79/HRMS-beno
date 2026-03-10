// import { Box, Select, Typography } from '@mui/material'
// import Button from '@mui/material/Button'
// import Grid from '@mui/material/Grid'
// import MenuItem from '@mui/material/MenuItem'
// import { useForm, Controller, useFieldArray } from 'react-hook-form'
// import Checkbox from '@mui/material/Checkbox'
// import ListItemText from '@mui/material/ListItemText'
// import CustomChip from 'src/@core/components/mui/chip'
// import CustomTextField from 'src/@core/components/mui/text-field'
// import { handleKeyPress } from 'src/utils/helper'
// import { Fragment } from 'react'

// const ITEM_HEIGHT = 60
// const ITEM_PADDING_TOP = 8

// const MenuProps = {
//   PaperProps: {
//     style: {
//       width: 280,
//       maxHeight: ITEM_HEIGHT * 6 + ITEM_PADDING_TOP
//     }
//   }
// }

// const defaultValues = {
//   groups: [
//     {
//       slab: [
//         // {
//         //   salesTarget: { start: '', end: '' },
//         //   rewardType: '',
//         //   rewardAmount: ''
//         // }
//       ]
//     }
//   ]
// }

// const DefineTarget = () => {
//   const {
//     handleSubmit,
//     watch,
//     control,
//     register,
//     setValue,
//     formState: { errors }
//   } = useForm({ defaultValues })

//   const {
//     fields: groupFields,
//     append: appendGroup,
//     remove: removeGroup
//   } = useFieldArray({
//     control,
//     name: 'groups'
//   })

//   const handleGenerateSlabs = (n, groupIndex) => {
//     const slabArray = [...Array(n).keys()].map(() => ({
//       salesTarget: { start: '', end: '' },
//       rewardType: '',
//       rewardAmount: ''
//     }))
//     const groupsCopy = [...watch('groups')]
//     groupsCopy[groupIndex].slab = slabArray
//     setValue('groups', groupsCopy)
//   }

//   const onSubmit = async data => {
//     console.log('data', data)
//   }

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
//       {groupFields.map((group, groupIndex) => (
//         <Box key={group.id} mb={3} sx={{ border: '1px solid #999999', borderRadius: 1, padding: 5 }}>
//           <Typography variant='h5'>Group {groupIndex + 1}</Typography>
//           <Grid container columnSpacing={3} rowSpacing={3}>
//             <Grid item xs={12} sm={3}>
//               <Typography variant='body2'>1. Select or Group Tyre Size</Typography>
//               <Controller
//                 name={`groups.${groupIndex}.groupTyre`}
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { value, onChange } }) => (
//                   <Select
//                     size='small'
//                     defaultValue={[]}
//                     displayEmpty
//                     error={Boolean(errors.groups?.[groupIndex]?.groupTyre)}
//                     sx={{ width: 300 }}
//                     id='select-multiple-checkbox'
//                     multiple
//                     value={value}
//                     onChange={onChange}
//                     renderValue={selected => {
//                       if (selected.length === 0) {
//                         return 'Please select Tyre Size'
//                       }
//                       return (
//                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
//                           {selected.map(value => (
//                             <CustomChip key={value} rounded label={value} skin='light' color='primary' />
//                           ))}
//                         </Box>
//                       )
//                     }}
//                     MenuProps={MenuProps}
//                   >
//                     <MenuItem value='' disabled sx={{ display: 'none' }}>
//                       Please select groupTyre
//                     </MenuItem>
//                     {['14 Inch', '15 Inch', '16 Inch', '17 Inch', '18 Inch'].map(type => (
//                       <MenuItem key={type} value={type}>
//                         <Checkbox checked={value?.indexOf(type) > -1} />
//                         <ListItemText primary={type} />
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 )}
//               />
//               {errors.groups?.[groupIndex]?.groupTyre && (
//                 <Typography variant='body2' color='error'>
//                   Group Tyre is required
//                 </Typography>
//               )}
//             </Grid>

//             <Grid item xs={12} sm={3}>
//               <Typography variant='body2'>2. Number of Slabs Required</Typography>
//               <Controller
//                 name={`groups.${groupIndex}.slabsCount`}
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { value, onChange } }) => (
//                   <CustomTextField
//                     fullWidth
//                     value={value}
//                     onKeyPress={handleKeyPress}
//                     onChange={onChange}
//                     error={Boolean(errors.groups?.[groupIndex]?.slabsCount)}
//                   />
//                 )}
//               />
//               {errors.groups?.[groupIndex]?.slabsCount && (
//                 <Typography variant='body2' color='error'>
//                   No. of Slabs is required
//                 </Typography>
//               )}
//             </Grid>
//             <Grid item xs={12} sm={3}>
//               {watch(`groups.${groupIndex}.slabsCount`, false) != '' && (
//                 <Button
//                   sx={{ mt: 5 }}
//                   onClick={() => handleGenerateSlabs(+watch(`groups.${groupIndex}.slabsCount`), groupIndex)}
//                   variant='outlined'
//                 >
//                   Generate Slabs
//                 </Button>
//               )}
//             </Grid>
//             <Grid item xs={12} sm={3} />

//             {watch(`groups.${groupIndex}.slab`, []).map((field, slabIndex) => (
//               <Fragment key={slabIndex}>
//                 <Grid item xs={12} sm={2}>
//                   <CustomTextField
//                     fullWidth
//                     label='1. Sales Target'
//                     {...register(`groups.${groupIndex}.slab.${slabIndex}.salesTarget.start`, {
//                       required: 'sales tartget start is required'
//                     })}
//                     error={Boolean(errors.groups?.[groupIndex]?.slab?.[slabIndex]?.salesTarget?.start)}
//                     helperText={errors.groups?.[groupIndex]?.slab?.[slabIndex]?.salesTarget?.start?.message}
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={2}>
//                   <CustomTextField
//                     fullWidth
//                     sx={{ mt: 5 }}
//                     {...register(`groups.${groupIndex}.slab.${slabIndex}.salesTarget.end`, {
//                       required: 'sales tartget end is required'
//                     })}
//                     error={Boolean(errors.groups?.[groupIndex]?.slab?.[slabIndex]?.salesTarget?.end)}
//                     helperText={errors.groups?.[groupIndex]?.slab?.[slabIndex]?.salesTarget?.end?.message}
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={3}>
//                   <Typography variant='body2'>2. Reward Type</Typography>
//                   <Controller
//                     name={`groups.${groupIndex}.slab.${slabIndex}.rewardType`}
//                     control={control}
//                     rules={{ required: true }}
//                     render={({ field: { value, onChange, onBlur } }) => (
//                       <Select
//                         fullWidth
//                         size='small'
//                         displayEmpty
//                         value={value}
//                         onChange={onChange}
//                         error={Boolean(errors.groups?.[groupIndex]?.slab?.[slabIndex]?.rewardType)}
//                       >
//                         <MenuItem value={'Percentage'}>Percentage</MenuItem>
//                       </Select>
//                     )}
//                   />

//                   {errors.groups?.[groupIndex]?.slab?.[slabIndex]?.rewardType && (
//                     <Typography variant='body2' color='error'>
//                       Reward Type is required
//                     </Typography>
//                   )}
//                 </Grid>
//                 <Grid item xs={12} sm={2}>
//                   <Typography variant='body2'>Reward Amount</Typography>
//                   <Controller
//                     name={`groups.${groupIndex}.slab.${slabIndex}.rewardAmount`}
//                     control={control}
//                     rules={{ required: true }}
//                     render={({ field: { value, onChange } }) => (
//                       <CustomTextField
//                         fullWidth
//                         value={value}
//                         onKeyPress={handleKeyPress}
//                         onChange={onChange}
//                         error={Boolean(errors.groups?.[groupIndex]?.slab?.[slabIndex]?.rewardAmount)}
//                       />
//                     )}
//                   />
//                   {errors.groups?.[groupIndex]?.slab?.[slabIndex]?.rewardAmount && (
//                     <Typography variant='body2' color='error'>
//                       Reward Amont is required
//                     </Typography>
//                   )}
//                 </Grid>
//                 <Grid item xs={12} sm={2}>
//                   <Button
//                     variant='contained'
//                     sx={{ mt: 5 }}
//                     onClick={() => {
//                       const groupsCopy = [...watch('groups')]
//                       groupsCopy[groupIndex].slab.splice(slabIndex, 1)
//                       setValue('groups', groupsCopy)
//                     }}
//                   >
//                     Delete Slab
//                   </Button>
//                 </Grid>
//               </Fragment>
//             ))}
//           </Grid>
//           <Button sx={{ mt: 5 }} variant='contained' onClick={() => appendGroup({ slab: [] })}>
//             Add New Group
//           </Button>
//         </Box>
//       ))}
//       <Grid sx={{ mt: 5 }} container>
//         <Button type='submit' sx={{ mr: 2 }} variant='outlined'>
//           Save and Continue
//         </Button>
//       </Grid>
//     </form>
//   )
// }

// export default DefineTarget



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
  RadioGroup
} from '@mui/material'
import { fetchTSO, addTSO } from 'src/store/apps/TSO/simulator'
import { useRouter } from 'next/router'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { handleKeyPress } from 'src/utils/helper'
import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import PickersCustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'
import { enIN } from 'date-fns/locale'

const EditScheme = ({ allData }) => {
  // useEffect(() => {
  //   dispatch(fetchTSO({ module: 'Volume Slab' }))
  // }, [])

  const dispatch = useDispatch()

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
    // setValue('region_customization', 'true')
  }, [allData])

  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: 'slab_inputs'
  // })

  const onSubmit = async data => {
    // setTargetData(data)
    // dispatch(addTSO(data))
    // if (state.TSOSchemeLoading === 'LOADED') {
    //   router.push('/apps/TSO/schemeParameter')
    // }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container columnSpacing={4} rowSpacing={4}>
        {allData?.map((item, i) =>
          item?.fieldType === 'Number' ? (
            <Grid item xs={12} sm={3} key={i}>
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
            <Grid item xs={12} sm={3} key={i}>
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
            <Grid item xs={12} sm={3} key={i}>
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
            <Grid item xs={12} sm={3} key={i}>
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
            <Grid item xs={12} sm={3} key={i}>
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
          ) : item?.fieldType === 'Array' ? (
            item?.values.map((val, i) => (
              <Grid item xs={12} sm={3} key={i}>
                <CustomTextField
                  fullWidth
                  label={`slab: ${val}`}
                  {...register(`slab.${i}.${val}`, { required: `slab.${i}.${val} is required` })}
                  error={Boolean(errors[val])}
                  helperText={errors[val] ? errors[val]?.message : ''}
                />
              </Grid>
            ))
          ) : item?.fieldType === 'Boolean' ? (
            <Grid item xs={12} sm={3} key={i}>
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
            <Grid item xs={12} sm={3} key={i}>
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

export default EditScheme
