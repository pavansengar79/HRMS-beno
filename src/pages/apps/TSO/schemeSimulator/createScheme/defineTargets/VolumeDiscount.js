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

// const VolumeDiscount = ({ setTargetData }) => {
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
//     setTargetData(data)
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
//                       // return (
//                       //   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
//                       //     {selected.map(value => (
//                       //       <CustomChip key={value} rounded label={value} skin='light' color='primary' />
//                       //     ))}
//                       //   </Box>
//                       // )
//                       else if (selected.length > 3) {
//                         return (
//                           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
//                             <CustomChip rounded label={selected[0]} skin='light' color='primary' />
//                             <CustomChip rounded label={selected[1]} skin='light' color='primary' />
//                             <CustomChip rounded label={`${selected.length - 2} more...`} skin='light' color='primary' />
//                           </Box>
//                         )
//                       } else {
//                         return (
//                           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
//                             {selected.map((item, i) => (
//                               <CustomChip key={i} rounded label={item} skin='light' color='primary' />
//                             ))}
//                           </Box>
//                         )
//                       }
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

// export default VolumeDiscount

// import { Box, Divider, Select, Typography } from '@mui/material'
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
//         {
//           rewardType: '',
//           rewardAmount: ''
//         }
//       ]
//     }
//   ]
// }

// const FlatDiscount = () => {
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

//   const onSubmit = async data => {
//     console.log('data', data)
//   }

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
//       {groupFields.map((group, groupIndex) => (
//         <>
//           <Typography variant='h5'>Group {groupIndex + 1}</Typography>
//           <Box key={group.id} mb={3} sx={{ border: '1px solid #999999', borderRadius: 1, padding: 5 }}>
//             <Grid container columnSpacing={3} rowSpacing={3}>
//               <Grid item xs={12} sm={12}>
//                 <Box
//                   key={group.id}
//                   sx={{
//                     padding: 5
//                   }}
//                 >
//                   <Typography variant='body2'>1. Select or Group Tyre Size</Typography>
//                   <Controller
//                     name={`groups.${groupIndex}.groupTyre`}
//                     control={control}
//                     rules={{ required: true }}
//                     render={({ field: { value, onChange } }) => (
//                       <Select
//                         size='small'
//                         defaultValue={[]}
//                         displayEmpty
//                         error={Boolean(errors.groups?.[groupIndex]?.groupTyre)}
//                         sx={{ width: 300 }}
//                         id='select-multiple-checkbox'
//                         multiple
//                         value={value}
//                         onChange={onChange}
//                         renderValue={selected => {
//                           if (selected.length === 0) {
//                             return 'Please select Tyre Size'
//                           }
//                           // return (
//                           //   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
//                           //     {selected.map(value => (
//                           //       <CustomChip key={value} rounded label={value} skin='light' color='primary' />
//                           //     ))}
//                           //   </Box>
//                           // )
//                           else if (selected.length > 3) {
//                             return (
//                               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
//                                 <CustomChip rounded label={selected[0]} skin='light' color='primary' />
//                                 <CustomChip rounded label={selected[1]} skin='light' color='primary' />
//                                 <CustomChip
//                                   rounded
//                                   label={`${selected.length - 2} more...`}
//                                   skin='light'
//                                   color='primary'
//                                 />
//                               </Box>
//                             )
//                           } else {
//                             return (
//                               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
//                                 {selected.map((item, i) => (
//                                   <CustomChip key={i} rounded label={item} skin='light' color='primary' />
//                                 ))}
//                               </Box>
//                             )
//                           }
//                         }}
//                         MenuProps={MenuProps}
//                       >
//                         <MenuItem value='' disabled sx={{ display: 'none' }}>
//                           Please select groupTyre
//                         </MenuItem>
//                         {['14 Inch', '15 Inch', '16 Inch', '17 Inch', '18 Inch'].map(type => (
//                           <MenuItem key={type} value={type}>
//                             <Checkbox checked={value?.indexOf(type) > -1} />
//                             <ListItemText primary={type} />
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     )}
//                   />
//                   {errors.groups?.[groupIndex]?.groupTyre && (
//                     <Typography variant='body2' color='error'>
//                       Group Tyre is required
//                     </Typography>
//                   )}
//                 </Box>
//               </Grid>
//               <Grid item xs={12} sm={8}>
//                 <Box
//                   key={group.id}
//                   sx={{
//                     border: '1px solid #999999',
//                     borderRadius: 1,
//                     padding: 5,
//                     // margin: 10,
//                     ml: 10,
//                     display: 'flex',
//                     gap: 10
//                   }}
//                 >
//                   <Box>
//                     <Typography variant='body2'>1. Reward Type</Typography>
//                     <Controller
//                       name={`groups.${groupIndex}.slab.rewardType`}
//                       control={control}
//                       rules={{ required: true }}
//                       render={({ field: { value, onChange, onBlur } }) => (
//                         <Select
//                           sx={{ width: 300 }}
//                           size='small'
//                           displayEmpty
//                           value={value}
//                           onChange={onChange}
//                           error={Boolean(errors.groups?.[groupIndex]?.slab?.rewardType)}
//                         >
//                           <MenuItem value={'Percentage'}>Percentage</MenuItem>
//                         </Select>
//                       )}
//                     />

//                     {errors.groups?.[groupIndex]?.slab?.rewardType && (
//                       <Typography variant='body2' color='error'>
//                         Reward Type is required
//                       </Typography>
//                     )}
//                   </Box>
//                   <Box>
//                     <Typography variant='body2'>2. Reward Amount</Typography>
//                     <Controller
//                       name={`groups.${groupIndex}.slab.rewardAmount`}
//                       control={control}
//                       rules={{ required: true }}
//                       render={({ field: { value, onChange } }) => (
//                         <CustomTextField
//                           sx={{ width: 200 }}
//                           value={value}
//                           onKeyPress={handleKeyPress}
//                           onChange={onChange}
//                           error={Boolean(errors.groups?.[groupIndex]?.slab?.rewardAmount)}
//                         />
//                       )}
//                     />
//                     {errors.groups?.[groupIndex]?.slab?.rewardAmount && (
//                       <Typography variant='body2' color='error'>
//                         Reward Amont is required
//                       </Typography>
//                     )}
//                   </Box>
//                 </Box>
//               </Grid>
//               <Grid item xs={12} sm={2}></Grid>
//             </Grid>
//           </Box>
//           <Button sx={{ mt: 5 }} variant='contained' onClick={() => appendGroup({ slab: [] })}>
//             Add New Group
//           </Button>
//         </>
//       ))}
//       <Grid sx={{ mt: 5 }} container>
//         <Button type='submit' sx={{ mr: 2 }} variant='outlined'>
//           Save and Continue
//         </Button>
//       </Grid>
//     </form>
//   )
// }

// export default FlatDiscount

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import {
  Slider,
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
  Typography,
  Select
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
import ListItemText from '@mui/material/ListItemText'
import CustomChip from 'src/@core/components/mui/chip'

const VolumeDiscount = ({ schemeConfig, setTargetData, setExpanded }) => {
  useEffect(() => {
    dispatch(fetchSchemeParameter({ module: 'Volume Slab' }))
  }, [schemeConfig])

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
    setValue,
    formState: { errors },
    control
  } = useForm({
    defaultValues: {
      reward_type: 'percentage',
      payoutRange: [0.25, 15]
    }
  })

  const onSubmit = async data => {
    console.log('data', data)

    let min_payout, max_payout, payout_increment

    if (data.reward_type === 'percentage') {
      ;[min_payout, max_payout] = data.payoutRange
      min_payout = parseFloat(min_payout / 100)
      max_payout = parseFloat(max_payout / 100)
      payout_increment = parseFloat(data.payout_increment / 100)
    } else {
      min_payout = parseFloat(data.min_payout)
      max_payout = parseFloat(data.max_payout)
      payout_increment = parseFloat(data.payout_increment)
    }

    const number_of_slabs = data.number_of_slabs.split(',')
    const transformedData = {
      ...data,
      number_of_slabs,
      payout_increment: payout_increment,
      min_payout: min_payout.toString(),
      max_payout: max_payout.toString()
    }

    delete transformedData.payoutRange

    console.log('transformedData', transformedData)
    setTargetData(transformedData)
    setExpanded(false)
  }

  // const marks = Array.from({ length: 61 }, (_, index) => ({
  //   value: index * 0.25,
  //   label: index % 4 === 0 ? `${index * 0.25}%` : ''
  // }))

  const rewardTypeValue = useWatch({ control, name: 'reward_type' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Grid container spacing={10} rowSpacing={5}>
        <Grid item xs={12} sm={4}>
          <CustomTextField
            select
            fullWidth
            label={'Define Scheme Objective'}
            {...register('objective', { required: `Scheme Objective is required` })}
            // error={Boolean(errors[item?.fieldName])}
            helperText={'Define Scheme Objective'}
          >
            <MenuItem value={'Minimize Spend Payout'}>Minimize Spend Payout</MenuItem>
            <MenuItem value={'Maximize Sales Uplift'}>Maximize Sales Uplift</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomTextField
            select
            fullWidth
            label={'Reward Type'}
            value={rewardTypeValue}
            {...register('reward_type', { required: `Reward Type is required` })}
            // error={Boolean(errors[item?.fieldName])}
            helperText={'Reward Type'}
          >
            <MenuItem value={'loyalty_points'}>Loyalty Points</MenuItem>
            <MenuItem value={'monetary'}>Monetary</MenuItem>
            <MenuItem value={'percentage'}>Percentage</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='body2'>Number of Slabs</Typography>
          <Controller
            name='number_of_slabs'
            control={control}
            rules={{ required: 'Number of Slabs is required' }}
            render={({ field: { value = '', onChange } }) => {
              const allOptions = ['2', '3', '4', '5', '6', '7', '8', '9', '10']

              const handleSelectAll = () => {
                if (value && value.split(',').length === allOptions.length) {
                  onChange('')
                } else {
                  onChange(allOptions.join(','))
                }
              }

              const handleChange = event => {
                const selectedValues = event.target.value

                if (selectedValues.includes('select_all')) {
                  handleSelectAll()
                } else {
                  onChange(selectedValues.join(','))
                }
              }

              const selectedArray = typeof value === 'string' && value.length > 0 ? value.split(',') : []

              return (
                <Select
                  size='small'
                  multiple
                  fullWidth
                  value={selectedArray}
                  onChange={handleChange}
                  renderValue={selected => {
                    if (selected.length === 0) {
                      return 'Please select Number of Slabs'
                    } else if (selected.length > 3) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={selected[0]} skin='light' color='primary' />
                          <CustomChip rounded label={selected[1]} skin='light' color='primary' />
                          <CustomChip rounded label={`${selected.length - 2} more...`} skin='light' color='primary' />
                        </Box>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {selected.map((item, i) => (
                            <CustomChip key={i} rounded label={item} skin='light' color='primary' />
                          ))}
                        </Box>
                      )
                    }
                  }}
                >
                  <MenuItem value='select_all' onClick={handleSelectAll}>
                    <Checkbox
                      checked={selectedArray.length === allOptions.length}
                      indeterminate={selectedArray.length > 0 && selectedArray.length < allOptions.length}
                    />
                    <ListItemText primary='Select All' />
                  </MenuItem>
                  {allOptions.map(slab => (
                    <MenuItem key={slab} value={slab}>
                      <Checkbox checked={selectedArray.indexOf(slab) > -1} />
                      <ListItemText primary={slab} />
                    </MenuItem>
                  ))}
                </Select>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomTextField
            fullWidth
            label={'Slab Starts From'}
            defaultValue={20}
            onKeyPress={e => handleKeyPress(e)}
            onBlur={e => {
              const value = parseFloat(e.target.value)
              if (value < 20 || !Number.isInteger(value)) {
                e.target.setCustomValidity('Minimum value is 20, and only whole numbers are allowed.')
                e.target.reportValidity()
              } else {
                e.target.setCustomValidity('')
              }
            }}
            {...register('min_slab_start', {
              required: 'Slab starts from date is required',
              validate: value =>
                (parseFloat(value) >= 20 && Number.isInteger(parseFloat(value))) ||
                'Minimum value is 20, and only whole numbers are allowed.'
            })}
            error={!!errors.min_slab_start}
            helperText={errors.min_slab_start ? errors.min_slab_start.message : 'Slab starts from'}
          />
        </Grid>
        {rewardTypeValue === 'percentage' && (
          <>
            <Grid item xs={12} sm={4}>
              <Controller
                name='payoutRange'
                control={control}
                defaultValue={[0.25, 15]}
                render={({ field }) => {
                  const min = field.value[0]
                  const max = field.value[1]
                  return (
                    <FormControl fullWidth>
                      <FormLabel>
                        Payout Range [{min}% - {max}%]
                      </FormLabel>
                      <Slider
                        {...field}
                        valueLabelDisplay='auto'
                        step={0.25}
                        min={0.25}
                        max={15}
                        valueLabelFormat={value => `${value}%`}
                      />
                      <Box display='flex' justifyContent='space-between' mt={-1}>
                        <Typography variant='caption' color='textSecondary'>
                          0.25 %
                        </Typography>
                        <Typography variant='caption' color='textSecondary'>
                          15 %
                        </Typography>
                      </Box>
                    </FormControl>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                select
                fullWidth
                label={'Payout Multiples'}
                {...register('payout_increment', { required: 'Payout Multiples is required' })}
                helperText={'Payout Multiples'}
              >
                <MenuItem value={'0.25'}>0.10%</MenuItem>
                <MenuItem value={'0.5'}>0.15%</MenuItem>
                <MenuItem value={'1.0'}>0.20%</MenuItem>
                <MenuItem value={'0.25'}>0.25%</MenuItem>
                <MenuItem value={'0.5'}>0.5%</MenuItem>
                <MenuItem value={'1.0'}>1.0%</MenuItem>
                <MenuItem value={'1.25'}>1.25%</MenuItem>
                <MenuItem value={'1.5'}>1.5%</MenuItem>
                <MenuItem value={'1.75'}>1.75%</MenuItem>
                <MenuItem value={'2.0'}>2.0%</MenuItem>
              </CustomTextField>
            </Grid>
          </>
        )}

        {(rewardTypeValue === 'loyalty_points' || rewardTypeValue === 'monetary') && (
          <>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                label={'Minimum Payout'}
                onKeyPress={e => handleKeyPress(e)}
                {...register('min_payout', { required: `Minimum Payout is required` })}
                // error={Boolean(errors[])}
                helperText={'Minimum Payout'}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                label={'Maximum Payout'}
                onKeyPress={e => handleKeyPress(e)}
                {...register('max_payout', { required: `Maximum Payout is required` })}
                // error={Boolean(errors[])}
                helperText={'Maximum Payout'}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                label={'Payout Multiples'}
                onKeyPress={e => handleKeyPress(e)}
                defaultValue={undefined}
                {...register('payout_increment', { required: `Payout Multiples is required` })}
                // error={Boolean(errors[])}
                helperText={'Payout Multiples'}
              />
            </Grid>
          </>
        )}
        {/* {state?.SchemeParameter?.map((item, i) =>
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
          )} */}
      </Grid>
      <Grid sx={{ mt: 5 }} container>
        <Button type='submit' sx={{ mr: 2 }} variant='outlined'>
          Save and Continue
        </Button>
      </Grid>
    </form>
  )
}

export default VolumeDiscount
