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
// import { Fragment, useState } from 'react'

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
//   eligibilityDataBOI: [{ group: [], rate: '', type: '', min: '', max: '' }]
// }

// const FlatDiscount = ({ setTargetData, setExpanded, eligibilityData, groupList }) => {
//   const {
//     handleSubmit,
//     watch,
//     control,
//     register,
//     setValue,
//     formState: { errors }
//   } = useForm({ defaultValues })
//   console.log('eli', groupList)
//   const {
//     fields: groupFields,
//     append: appendGroup,
//     remove: removeGroup
//   } = useFieldArray({
//     control,
//     name: 'eligibilityDataBOI'
//   })

//   const onSubmit = async data => {
//     console.log('data', data)
//     setTargetData(data)
//     setExpanded(false)
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
//                 name={`eligibilityDataBOI.${groupIndex}.group`}
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { value, onChange } }) => (
//                   <Select
//                     size='small'
//                     defaultValue={[]}
//                     displayEmpty
//                     fullWidth
//                     error={Boolean(errors.eligibilityDataBOI?.[groupIndex]?.group)}
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
//                     {groupList?.map(type => (
//                       <MenuItem key={type} value={type}>
//                         <Checkbox checked={value?.indexOf(type) > -1} />
//                         <ListItemText primary={type} />
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 )}
//               />
//               {errors.eligibilityDataBOI?.[groupIndex]?.group && (
//                 <Typography variant='body2' color='error'>
//                   Group Tyre is required
//                 </Typography>
//               )}
//             </Grid>
//             <Grid item xs={12} sm={3}>
//               <Typography variant='body2'>2. Rate or Amount</Typography>
//               <Controller
//                 name={`eligibilityDataBOI.${groupIndex}.rate`}
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { value, onChange } }) => (
//                   <CustomTextField
//                     fullWidth
//                     value={value}
//                     onKeyPress={handleKeyPress}
//                     onChange={onChange}
//                     error={Boolean(errors.groups?.rate)}
//                   />
//                 )}
//               />
//               {errors.eligibilityDataBOI?.[groupIndex]?.rate && (
//                 <Typography variant='body2' color='error'>
//                   Rate or Amount is required
//                 </Typography>
//               )}
//             </Grid>
//             <Grid item xs={12} sm={3}>
//               <Typography variant='body2'>3. Discount Type</Typography>
//               <Controller
//                 name={`eligibilityDataBOI.${groupIndex}.type`}
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { value, onChange, onBlur } }) => (
//                   <Select
//                     fullWidth
//                     size='small'
//                     displayEmpty
//                     value={value}
//                     onChange={onChange}
//                     error={Boolean(errors.eligibilityDataBOI?.[groupIndex]?.type)}
//                   >
//                     <MenuItem value={'Percentage'}>Percentage</MenuItem>
//                     <MenuItem value={'INR'}>INR</MenuItem>
//                   </Select>
//                 )}
//               />

//               {errors.eligibilityDataBOI?.[groupIndex]?.type && (
//                 <Typography variant='body2' color='error'>
//                   Discount Type is required
//                 </Typography>
//               )}
//             </Grid>
//             <Grid item xs={12} sm={3}>
//               <Typography variant='body2'>4. Min & Max Quantity (Optional)</Typography>
//               <Controller
//                 name={`eligibilityDataBOI.${groupIndex}.min`}
//                 control={control}
//                 rules={{ required: false }}
//                 render={({ field: { value, onChange } }) => (
//                   <CustomTextField
//                     fullWidth
//                     sx={{ width: 100, mr: 3 }}
//                     value={value}
//                     onKeyPress={handleKeyPress}
//                     onChange={onChange}
//                   />
//                 )}
//               />
//               <Controller
//                 name={`eligibilityDataBOI.${groupIndex}.max`}
//                 control={control}
//                 rules={{ required: false }}
//                 render={({ field: { value, onChange } }) => (
//                   <CustomTextField
//                     fullWidth
//                     sx={{ width: 100 }}
//                     value={value}
//                     onKeyPress={handleKeyPress}
//                     onChange={onChange}
//                   />
//                 )}
//               />
//             </Grid>
//           </Grid>
//         </Box>
//       ))}
//       <Button
//         sx={{ mt: 5 }}
//         variant='contained'
//         onClick={() => appendGroup({ group: [], rate: '', type: '', min: '', max: '' })}
//       >
//         Add New Group
//       </Button>
//       <Grid sx={{ mt: 5 }} container>
//         <Button type='submit' sx={{ mr: 2 }} variant='outlined'>
//           Save and Continue
//         </Button>
//       </Grid>
//     </form>
//   )
// }

// export default FlatDiscount

// import Button from '@mui/material/Button'
// import Grid from '@mui/material/Grid'
// import MenuItem from '@mui/material/MenuItem'
// import { useForm, useFieldArray, Controller } from 'react-hook-form'
// import { useDispatch, useSelector } from 'react-redux'
// import CustomTextField from 'src/@core/components/mui/text-field'
// import {
//   Box,
//   Card,
//   CardContent,
//   CardHeader,
//   Checkbox,
//   Chip,
//   CircularProgress,
//   Divider,
//   FormControl,
//   FormControlLabel,
//   FormLabel,
//   Radio,
//   RadioGroup,
//   Typography
// } from '@mui/material'
// import { fetchSchemeParameter, addTSO } from 'src/store/apps/TSO/simulator'
// import { useRouter } from 'next/router'
// import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
// import { handleKeyPress } from 'src/utils/helper'
// import { useEffect, useState } from 'react'
// import DatePicker from 'react-datepicker'
// import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
// import PickersCustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'
// import { enIN } from 'date-fns/locale'

// const EarlyBird = ({ schemeConfigure, setTargetData, setExpanded }) => {
//   useEffect(() => {
//     dispatch(fetchSchemeParameter({ module: 'Ealy Bird' }))
//   }, [schemeConfigure])

//   const dispatch = useDispatch()
//   const state = useSelector(state => state.TSOSimulator)
//   console.log('state', state)

//   // const filteredValues = state.TSOSimulator.map(item => {
//   //   if (item?.fieldType === 'Array') {
//   //     return { [item.fieldName]: [item?.values.length.toString()] }
//   //   } else return false
//   // })
//   // let filteredArr = filteredValues.filter(item => item !== false)
//   // const defaultValues = Object.assign({}, ...filteredArr)
//   // console.log(defaultValues)

//   const router = useRouter()

//   const {
//     register,
//     unregister,
//     handleSubmit,
//     watch,
//     reset,
//     formState: { errors },
//     control
//   } = useForm()

//   const onSubmit = async data => {
//     console.log('data', data)
//     setTargetData(data)
//     // dispatch(addTSO(data))
//     // if (state.TSOSchemeLoading === 'LOADED') {
//     //   router.push('/apps/TSO/schemeParameter')
//     // }
//     setExpanded(false)
//   }

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
//       <Grid container spacing={4}>
//         {state?.SchemeParameter?.map((item, i) =>
//           item?.fieldType === 'Number' ? (
//             <Grid item xs={12} sm={4} key={i}>
//               <CustomTextField
//                 fullWidth
//                 label={item?.fieldName}
//                 onKeyPress={e => handleKeyPress(e)}
//                 {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
//                 error={Boolean(errors[item?.fieldName])}
//                 helperText={errors[item?.fieldName] ? errors[item?.fieldName]?.message : ''}
//               />
//             </Grid>
//           ) : item?.fieldType === 'Array' ? (
//             <Grid item xs={12} sm={4} key={i}>
//               <CustomTextField
//                 fullWidth
//                 label={item?.fieldName}
//                 onKeyPress={e => handleKeyPress(e)}
//                 {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
//                 error={Boolean(errors[item?.fieldName])}
//                 helperText={errors[item?.fieldName] ? errors[item?.fieldName]?.message : ''}
//               />
//             </Grid>
//           ) : item?.fieldType === 'Dropdown' ? (
//             <Grid item xs={12} sm={4} key={i}>
//               <CustomTextField
//                 select
//                 fullWidth
//                 label={item?.fieldName}
//                 {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
//                 error={Boolean(errors[item?.fieldName])}
//                 helperText={errors[item?.fieldName] ? errors[item?.fieldName]?.message : ''}
//               >
//                 {item?.values.map((val, i) => (
//                   <MenuItem key={i} value={val}>
//                     {val}
//                   </MenuItem>
//                 ))}
//               </CustomTextField>
//             </Grid>
//           ) : item?.fieldType === 'Radio' ? (
//             <Grid item xs={12} sm={4} key={i}>
//               <FormControl>
//                 <FormLabel>{item?.fieldName}</FormLabel>
//                 <Controller
//                   name={item?.fieldName}
//                   control={control}
//                   rules={{ required: true }}
//                   render={({ field }) => (
//                     <RadioGroup row {...field}>
//                       {item?.values.map((val, i) => (
//                         <FormControlLabel key={i} value={val} control={<Radio />} label={val} />
//                       ))}
//                     </RadioGroup>
//                   )}
//                 />
//               </FormControl>
//             </Grid>
//           ) : item?.fieldType === 'Checkbox' ? (
//             <Grid item xs={12} sm={4} key={i}>
//               <FormControl>
//                 <FormLabel>{item?.fieldName}</FormLabel>
//                 <RadioGroup
//                   row
//                   aria-label='applicable'
//                   {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
//                 >
//                   {item?.values?.map((val, i) => (
//                     <FormControlLabel key={i} value={val} control={<Checkbox />} label={val} />
//                   ))}
//                 </RadioGroup>
//               </FormControl>
//             </Grid>
//           ) : item?.fieldType === 'Date' ? (
//             <Grid item xs={12} sm={4} key={i}>
//               <Controller
//                 name={item?.fieldName}
//                 control={control}
//                 defaultValue={null}
//                 rules={{ required: true }}
//                 render={({ field }) => (
//                   <DatePickerWrapper>
//                     <DatePicker
//                       isClearable
//                       locale={enIN}
//                       popperPlacement={'bottom-end'}
//                       dateFormat='yyyy/MM/dd'
//                       {...field}
//                       onChange={field.onChange}
//                       placeholderText='Select Date'
//                       customInput={
//                         <PickersCustomInput label='Date' value={field.value} fullWidth sx={{ width: 290 }} />
//                       }
//                     />
//                   </DatePickerWrapper>
//                 )}
//               />
//             </Grid>
//           ) : item?.fieldType === 'Boolean' ? (
//             <Grid item xs={12} sm={4} key={i}>
//               <CustomTextField
//                 select
//                 fullWidth
//                 label={item?.fieldName}
//                 {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
//                 error={Boolean(errors[item?.fieldName])}
//                 helperText={errors[item?.fieldName] ? errors[item?.fieldName]?.message : ''}
//               >
//                 <MenuItem value='true'>True</MenuItem>
//                 <MenuItem value='false'>False</MenuItem>
//               </CustomTextField>
//             </Grid>
//           ) : (
//             <Grid item xs={12} sm={4} key={i}>
//               <CustomTextField
//                 fullWidth
//                 label={item?.fieldName}
//                 {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
//                 error={Boolean(errors[item?.fieldName])}
//                 helperText={errors[item?.fieldName] ? errors[item?.fieldName]?.message : ''}
//               ></CustomTextField>
//             </Grid>
//           )
//         )}
//       </Grid>
//       <Grid sx={{ mt: 5 }} container>
//         <Button type='submit' sx={{ mr: 2 }} variant='outlined'>
//           Save and Continue
//         </Button>
//       </Grid>
//     </form>
//   )
// }

// export default EarlyBird

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

// const EarlyBird = ({ setTargetData }) => {
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

// export default EarlyBird

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
import dayjs from 'dayjs'

const defaultValues = {
  slab_inputs: [
    {
      slab_end: '',
      slab_start: '',
      slab_step: '',
      success_end: '',
      success_start: '',
      success_step: '',
      target_end: '',
      target_start: '',
      target_step: ''
    }
  ],
  days_in_month: '',
  number_of_slabs: '1',
  objective: '',
  movement_shift: 0
}

const getDaysInMonth = (month, year) => {
  return dayjs(`${year}-${month}-01`).daysInMonth()
}

const EarlyBird = ({ schemeConfig, setTargetData, setExpanded }) => {
  useEffect(() => {
    dispatch(fetchSchemeParameter({ module: 'Early Bird' }))
  }, [schemeConfig])

  const dispatch = useDispatch()
  const state = useSelector(state => state.TSOSimulator)
  console.log('state', state)

  const router = useRouter()

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = dayjs().add(i, 'month')
    return { name: date.format('MMMM'), month: date.month() + 1, year: date.year() }
  })

  const handleMonthChange = event => {
    const selectedValue = event.target.value
    setValue('days_in_month', selectedValue)
  }

  const {
    register,
    unregister,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    control
  } = useForm({ defaultValues })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'slab_inputs'
  })

  const handleGenerateSlabs = n => {
    const currentSlabCount = fields.length

    if (currentSlabCount >= n) return

    for (let i = currentSlabCount; i < n; i++) {
      append({
        slab_end: '',
        slab_start: '',
        slab_step: '',
        success_end: '',
        success_start: '',
        success_step: '',
        target_end: '',
        target_start: '',
        target_step: ''
      })
    }
  }

  const slabInputValues = useWatch({ name: 'slab_inputs', control })

  useEffect(() => {
    console.log('value', slabInputValues)
  }, [slabInputValues])

  const handleDuplicateSlabValues = () => {
    const slabInputs = structuredClone(watch('slab_inputs'))
    const firstSlabValues = slabInputs[0]

    const updatedSlabs = slabInputs.map(() => ({
      ...structuredClone(firstSlabValues)
    }))

    setValue('slab_inputs', updatedSlabs, { shouldValidate: true, shouldDirty: true })
  }

  const onSubmit = async data => {
    console.log('data', data)

    const [month, year] = data.days_in_month.split('-').map(Number)
    const numberOfDaysInMonth = getDaysInMonth(month, year)

    const slabInputs = data.slab_inputs.map((slab, index) => ({
      slab_end: slab.slab_end || '',
      slab_start: slab.slab_start || '',
      slab_step: slab.slab_step || '',
      success_end: slab.success_end !== undefined ? slab.success_end.toString() : '',
      success_start: slab.success_start !== undefined ? slab.success_start.toString() : '',
      success_step: slab.success_step || '',
      target_end: slab.target_end || '',
      target_start: slab.target_start || '',
      target_step: slab.target_step || ''
    }))

    const transformedData = {
      slab_inputs: slabInputs,
      objective: data.objective,
      number_of_slabs: data.number_of_slabs,
      days_in_month: numberOfDaysInMonth,
      movement_shift: data.movement_shift
    }

    console.log('transformedData', transformedData)
    setTargetData(transformedData)
    setExpanded(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={4}>
          <CustomTextField
            select
            fullWidth
            label={'Define Scheme Objective'}
            {...register('objective', { required: `Scheme Objective is required` })}
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
            label={'For the Month of'}
            {...register('days_in_month', { required: `Month is required` })}
            onChange={handleMonthChange}
            helperText={'Select a month'}
          >
            {months.map((monthObj, index) => (
              <MenuItem key={index} value={`${monthObj.month}-${monthObj.year}`}>
                {monthObj.name}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Controller
            name='movement_shift'
            control={control}
            defaultValue={0}
            render={({ field }) => {
              return (
                <FormControl fullWidth>
                  <FormLabel>Movement Probability Threshold [{field.value}]</FormLabel>
                  <Slider
                    {...field}
                    value={field.value}
                    valueLabelDisplay='auto'
                    step={0.1}
                    min={0}
                    max={1}
                    valueLabelFormat={value => `${value}`}
                    onChange={(_, value) => field.onChange(value)}
                  />
                  <Box display='flex' justifyContent='space-between' mt={-1}>
                    <Typography variant='caption' color='textSecondary'>
                      0
                    </Typography>
                    <Typography variant='caption' color='textSecondary'>
                      1
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
            label={'Number of Slabs Required'}
            defaultValue='1'
            {...register('number_of_slabs', {
              required: 'Number of Slabs is required'
            })}
            error={!!errors.number_of_slabs}
            helperText={errors.number_of_slabs ? errors.number_of_slabs.message : 'Number of Slabs Required'}
          >
            {Array.from({ length: 10 }, (_, index) => (
              <MenuItem key={index + 1} value={String(index + 1)}>
                {index + 1}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={2}>
          {watch('number_of_slabs', '1') !== '' && (
            <Button
              sx={{ mt: 5 }}
              onClick={() => handleGenerateSlabs(+watch('number_of_slabs', '1'))}
              variant='outlined'
            >
              Generate Slabs
            </Button>
          )}
        </Grid>
        <Grid item xs={12} sm={12}>
          {fields?.map((_, slabIndex) => (
            <>
              <Typography sx={{ fontWeight: 500, fontSize: '1.125rem' }}>Slab {slabIndex + 1}:</Typography>
              <Box mb={3} sx={{ border: '1px solid #999999', borderRadius: 1, padding: 5 }}>
                <Grid container columnSpacing={3} rowSpacing={3}>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      label={'Slab Start Date'}
                      placeholder='Please enter the slab start date'
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${slabIndex}.slab_start`, {
                        required: 'Slab Start Date is required'
                      })}
                      error={!!errors.number_of_slabs}
                      helperText={errors.number_of_slabs ? errors.number_of_slabs.message : 'Slab Start Date'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      label={'Slab End Date'}
                      placeholder='Please enter the slab end date'
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${slabIndex}.slab_end`, {
                        required: 'Slab End Date is required'
                      })}
                      error={!!errors.number_of_slabs}
                      helperText={errors.number_of_slabs ? errors.number_of_slabs.message : 'Slab End Date'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      label={'Slab Increment'}
                      placeholder='Please enter the slab step'
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${slabIndex}.slab_step`, {
                        required: 'Slab Increment is required'
                      })}
                      error={!!errors.number_of_slabs}
                      helperText={errors.number_of_slabs ? errors.number_of_slabs.message : 'Slab Increment'}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Controller
                      name={`slab_inputs.${slabIndex}.rotationRange`}
                      control={control}
                      defaultValue={[0, 1]}
                      render={({ field }) => {
                        const handleSliderChange = (_, newValue) => {
                          field.onChange(newValue)
                          setValue(`slab_inputs.${slabIndex}.success_start`, newValue[0])
                          setValue(`slab_inputs.${slabIndex}.success_end`, newValue[1])
                        }

                        return (
                          <FormControl fullWidth>
                            <FormLabel>
                              Rotation Range [{field.value[0]} - {field.value[1]}]
                            </FormLabel>
                            <Slider
                              {...field}
                              valueLabelDisplay='auto'
                              step={0.1}
                              min={0}
                              max={1}
                              valueLabelFormat={value => `${value}`}
                              onChange={handleSliderChange}
                            />
                            <Box display='flex' justifyContent='space-between' mt={-1}>
                              <Typography variant='caption' color='textSecondary'>
                                0
                              </Typography>
                              <Typography variant='caption' color='textSecondary'>
                                1
                              </Typography>
                            </Box>
                          </FormControl>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      label={'Rotation Increment'}
                      placeholder='Please enter the rotation increment'
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${slabIndex}.success_step`, {
                        required: 'Rotation Increment is required'
                      })}
                      error={!!errors.number_of_slabs}
                      helperText={errors.number_of_slabs ? errors.number_of_slabs.message : 'Rotation Increment'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}></Grid>

                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      label={'Min Payout'}
                      placeholder='Please enter the minimum payout'
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${slabIndex}.target_start`, {
                        required: 'Min Payout is required'
                      })}
                      error={!!errors.number_of_slabs}
                      helperText={errors.number_of_slabs ? errors.number_of_slabs.message : 'Min Payout'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      label={'Max Payout'}
                      placeholder='Please enter the maximum payout'
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${slabIndex}.target_end`, {
                        required: 'Max Payout is required'
                      })}
                      error={!!errors.number_of_slabs}
                      helperText={errors.number_of_slabs ? errors.number_of_slabs.message : 'Max Payout'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      label={'Payout Increment'}
                      placeholder='Please enter the payout increment'
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${slabIndex}.target_step`, {
                        required: 'Payout Increment is required'
                      })}
                      error={!!errors.number_of_slabs}
                      helperText={errors.number_of_slabs ? errors.number_of_slabs.message : 'Payout Increment'}
                    />
                  </Grid>

                  {slabIndex === 0 && (
                    <Grid item xs={12} sm={12}>
                      <Button sx={{ mt: 3 }} variant='contained' onClick={handleDuplicateSlabValues}>
                        Duplicate these values in all the slabs
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </>
          ))}
        </Grid>

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
          ) : item?.fieldType === 'Text' ? (
            <Grid item xs={12} sm={4} key={i}>
              <CustomTextField
                fullWidth
                label={item?.fieldName}
                {...register(item?.fieldName, { required: `${item?.fieldName} is required` })}
                error={Boolean(errors[item?.fieldName])}
                helperText={errors[item?.fieldName] ? errors[item?.fieldName]?.message : ''}
              ></CustomTextField>
            </Grid>
          ) : item?.fieldType === 'Array' ? (
            <>
              {fields?.map((val, i) => (
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
                    <CustomTextField
                      fullWidth
                      label={`failure_end`}
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${i}.failure_end`, {
                        required: `failure_end is required`
                      })}
                      error={Boolean(errors.slab_inputs?.[i]?.failure_end)}
                      helperText={
                        errors.slab_inputs?.[i]?.failure_end ? errors.slab_inputs?.[i]?.failure_end?.message : ''
                      }
                    />
                    <CustomTextField
                      fullWidth
                      label={`failure_start`}
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${i}.failure_start`, {
                        required: `failure_start is required`
                      })}
                      error={Boolean(errors.slab_inputs?.[i]?.failure_start)}
                      helperText={
                        errors.slab_inputs?.[i]?.failure_start ? errors.slab_inputs?.[i]?.failure_start?.message : ''
                      }
                    />
                    <CustomTextField
                      fullWidth
                      label={`failure_step`}
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${i}.failure_step`, {
                        required: `failure_step is required`
                      })}
                      error={Boolean(errors.slab_inputs?.[i]?.failure_step)}
                      helperText={
                        errors.slab_inputs?.[i]?.failure_step ? errors.slab_inputs?.[i]?.failure_step?.message : ''
                      }
                    />
                    <CustomTextField
                      fullWidth
                      label={`slab_end`}
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${i}.slab_end`, {
                        required: `slab_end is required`
                      })}
                      error={Boolean(errors.slab_inputs?.[i]?.slab_end)}
                      helperText={errors.slab_inputs?.[i]?.slab_end ? errors.slab_inputs?.[i]?.slab_end?.message : ''}
                    />
                    <CustomTextField
                      fullWidth
                      label={`slab_start`}
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${i}.slab_start`, {
                        required: `slab_start is required`
                      })}
                      error={Boolean(errors.slab_inputs?.[i]?.slab_start)}
                      helperText={
                        errors.slab_inputs?.[i]?.slab_start ? errors.slab_inputs?.[i]?.slab_start?.message : ''
                      }
                    />
                    <CustomTextField
                      fullWidth
                      label={`slab_step`}
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${i}.slab_step`, {
                        required: `slab_step is required`
                      })}
                      error={Boolean(errors.slab_inputs?.[i]?.slab_step)}
                      helperText={errors.slab_inputs?.[i]?.slab_step ? errors.slab_inputs?.[i]?.slab_step?.message : ''}
                    />
                    <CustomTextField
                      fullWidth
                      label={`success_end`}
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${i}.success_end`, {
                        required: `success_end is required`
                      })}
                      error={Boolean(errors.slab_inputs?.[i]?.success_end)}
                      helperText={
                        errors.slab_inputs?.[i]?.success_end ? errors.slab_inputs?.[i]?.success_end?.message : ''
                      }
                    />
                    <CustomTextField
                      fullWidth
                      label={`success_start`}
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${i}.success_start`, {
                        required: `success_start is required`
                      })}
                      error={Boolean(errors.slab_inputs?.[i]?.success_start)}
                      helperText={
                        errors.slab_inputs?.[i]?.success_start ? errors.slab_inputs?.[i]?.success_start?.message : ''
                      }
                    />
                    <CustomTextField
                      fullWidth
                      label={`success_step`}
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${i}.success_step`, {
                        required: `success_step is required`
                      })}
                      error={Boolean(errors.slab_inputs?.[i]?.success_step)}
                      helperText={
                        errors.slab_inputs?.[i]?.success_step ? errors.slab_inputs?.[i]?.success_step?.message : ''
                      }
                    />
                    <CustomTextField
                      fullWidth
                      label={`target_end`}
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${i}.target_end`, {
                        required: `target_end is required`
                      })}
                      error={Boolean(errors.slab_inputs?.[i]?.target_end)}
                      helperText={
                        errors.slab_inputs?.[i]?.target_end ? errors.slab_inputs?.[i]?.target_end?.message : ''
                      }
                    />
                    <CustomTextField
                      fullWidth
                      label={`target_start`}
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${i}.target_start`, {
                        required: `target_start is required`
                      })}
                      error={Boolean(errors.slab_inputs?.[i]?.target_start)}
                      helperText={
                        errors.slab_inputs?.[i]?.target_start ? errors.slab_inputs?.[i]?.target_start?.message : ''
                      }
                    />
                    <CustomTextField
                      fullWidth
                      label={`target_step`}
                      onKeyPress={e => handleKeyPress(e)}
                      {...register(`slab_inputs.${i}.target_step`, {
                        required: `target_step is required`
                      })}
                      error={Boolean(errors.slab_inputs?.[i]?.target_step)}
                      helperText={
                        errors.slab_inputs?.[i]?.target_step ? errors.slab_inputs?.[i]?.target_start?.message : ''
                      }
                    />
                  </Box>
                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-end' }}>
                    <Button variant='outlined' onClick={() => remove(i)}>
                      Remove
                    </Button>
                  </Box>
                </Grid>
              ))}
              <Grid item xs={12} sm={12}>
                <Button
                  variant='contained'
                  onClick={() =>
                    append({
                      failure_end: '',
                      failure_start: '',
                      failure_step: '',
                      slab_end: '',
                      slab_start: '',
                      slab_step: '',
                      success_end: '',
                      success_start: '',
                      success_step: '',
                      target_end: '',
                      target_start: '',
                      target_step: ''
                    })
                  }
                >
                  Add New slab
                </Button>
              </Grid>
            </>
          ) : (
            <></>
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

export default EarlyBird
