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
//         //   durationType: { start: '', end: '' },
//         //   rewardType: '',
//         //   rewardAmount: ''
//         // }
//       ]
//     }
//   ]
// }

// const OldCode = ({ setTargetData, setExpanded }) => {
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
//       durationType: '',
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
//                   <Typography variant='body2'>1. Duration Type</Typography>
//                   <Controller
//                     name={`groups.${groupIndex}.slab.${slabIndex}.durationType`}
//                     control={control}
//                     rules={{ required: true }}
//                     render={({ field: { value, onChange, onBlur } }) => (
//                       <Select
//                         fullWidth
//                         size='small'
//                         displayEmpty
//                         value={value}
//                         onChange={onChange}
//                         error={Boolean(errors.groups?.[groupIndex]?.slab?.[slabIndex]?.durationType)}
//                       >
//                         <MenuItem value={'Percentage'}>Weeks</MenuItem>
//                       </Select>
//                     )}
//                   />

//                   {errors.groups?.[groupIndex]?.slab?.[slabIndex]?.durationType && (
//                     <Typography variant='body2' color='error'>
//                       Duration Type is required
//                     </Typography>
//                   )}
//                 </Grid>
//                 <Grid item xs={12} sm={2}>
//                   <CustomTextField
//                     fullWidth
//                     label='2. From'
//                     {...register(`groups.${groupIndex}.slab.${slabIndex}.from`, {
//                       required: 'from is required'
//                     })}
//                     error={Boolean(errors.groups?.[groupIndex]?.slab?.[slabIndex]?.from)}
//                     helperText={errors.groups?.[groupIndex]?.slab?.[slabIndex]?.from?.message}
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={2}>
//                   <CustomTextField
//                     fullWidth
//                     label='2.1. To'
//                     {...register(`groups.${groupIndex}.slab.${slabIndex}.to`, {
//                       required: 'to is required'
//                     })}
//                     error={Boolean(errors.groups?.[groupIndex]?.slab?.[slabIndex]?.to)}
//                     helperText={errors.groups?.[groupIndex]?.slab?.[slabIndex]?.to?.message}
//                   />
//                 </Grid>

//                 <Grid item xs={12} sm={2}>
//                   <Typography variant='body2'>3. Reward Type</Typography>
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
//                   <Typography variant='body2'>4. Reward Amount</Typography>
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
//                       Reward Amount is required
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
//                 {/* <Grid item xs={12} sm={4} /> */}
//               </Fragment>
//             ))}
//           </Grid>
//         </Box>
//       ))}
//       <Button sx={{ mt: 5 }} variant='contained' onClick={() => appendGroup({ slab: [] })}>
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

// export default OldCode

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

import { Box, Select, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import { handleKeyPress } from 'src/utils/helper'
import { Fragment, useEffect, useState } from 'react'

const ITEM_HEIGHT = 60
const ITEM_PADDING_TOP = 8

const MenuProps = {
  PaperProps: {
    style: {
      width: 280,
      maxHeight: ITEM_HEIGHT * 6 + ITEM_PADDING_TOP
    }
  }
}

const defaultValues = {
  eligibilityDataBOI: [
    {
      group: [],
      rate: '',
      type: '',
      min: '',
      max: '',
      oldCode: [
        {
          type: [],
          rate: '',
          rateType: ''
        }
      ]
    }
  ]
}

const oc10OldCode = [
  {
    value: '0A',
    label: '6-12 months'
  },
  {
    value: '0B',
    label: '12+ months'
  }
]

const oc10Employee = [
  {
    value: 'E1',
    label: 'EMP-10%'
  },
  {
    value: 'E2',
    label: 'EMP-15%'
  },
  {
    value: 'E3',
    label: 'EMP-20%'
  },
  {
    value: 'E4',
    label: 'EMP-25%'
  },
  {
    value: 'E5',
    label: 'EMP-30%'
  },
  {
    value: 'E6',
    label: 'EMP-35%'
  },
  {
    value: 'E7',
    label: 'EMP-40%'
  },
  {
    value: 'E8',
    label: 'EMP-45%'
  },
  {
    value: 'E9',
    label: 'EMP-50%'
  },
  {
    value: 'EB',
    label: 'EMP-17%'
  }
]

export const oc10OldCodeWeeks = [
  {
    value: 'L1',
    label: 'W: 52-78'
  },
  {
    value: 'L2',
    label: 'W:79-104'
  },
  {
    value: 'L3',
    label: 'W:105-156'
  },
  {
    value: 'L4',
    label: 'W:157+'
  }
]

export const oc10OldCodeTest = [
  {
    value: 'Test-95%',
    label: 'Test-95%'
  },
  {
    value: 'TEST-25%',
    label: 'TEST-25%'
  },
  {
    value: 'TEST-50%',
    label: 'TEST-50%'
  },
  {
    value: 'TEST-15%',
    label: 'TEST-15%'
  },
  {
    value: 'Test-10%',
    label: 'Test-10%'
  }
]

export const oc10OldCodeRetread = [
  {
    value: 'P1',
    label: 'PCTR-W:0-11'
  },
  {
    value: 'P2',
    label: 'PCTR-W:12-17'
  },
  {
    value: 'P3',
    label: 'PCTR-W:18-23'
  },
  {
    value: 'P4',
    label: 'PCTR-W:24-29'
  },
  {
    value: 'P5',
    label: 'PCTR-W:30-35'
  },
  {
    value: 'P6',
    label: 'PCTR-W:36+'
  },
  {
    value: 'P7',
    label: 'VULS- M 5-6'
  },
  {
    value: 'P8',
    label: 'VULS- M 7-8'
  },
  {
    value: 'P9',
    label: 'CGUM -M 3-4'
  },
  {
    value: 'PA',
    label: 'CGUM -M 5-6'
  },
  {
    value: 'PB',
    label: 'RTD.SECOND MATERIAL'
  }
]

const OldCode = ({ setTargetData, setExpanded, eligibilityData, groupList, oldCodeMapping }) => {
  const [oldCodeClass, setOldCodeClass] = useState([])

  const {
    handleSubmit,
    watch,
    control,
    register,
    setValue,
    formState: { errors }
  } = useForm({ defaultValues })
  console.log('eli', groupList)

  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup
  } = useFieldArray({
    control,
    name: 'eligibilityDataBOI'
  })

  // const fieldArrays = groupFields.map((group, groupIndex) => {
  //   return useFieldArray({
  //     control,
  //     name: `eligibilityDataBOI.${groupIndex}.oldCode`
  //   })
  // })

  useEffect(() => {
    const combinedCustomerClass = []
    const mapping = oldCodeMapping.map(item => item.value)

    if (mapping.includes('2/3W')) {
      combinedCustomerClass.push(...oc10OldCode)
    }
    if (mapping.includes('ED')) {
      combinedCustomerClass.push(...oc10Employee)
    }
    if (mapping.includes('OC')) {
      combinedCustomerClass.push(...oc10OldCodeWeeks)
    }
    if (mapping.includes('TT')) {
      combinedCustomerClass.push(...oc10OldCodeTest)
    }
    if (mapping.includes('ROC')) {
      combinedCustomerClass.push(...oc10OldCodeRetread)
    }

    setOldCodeClass(combinedCustomerClass)
  }, [oldCodeMapping])

  const onSubmit = async data => {
    data.eligibilityDataBOI = data.eligibilityDataBOI.map(el => {
      const oldCodeUpdated = el.oldCode.map(item => ({
        type: item.type.map(ty => ty.value).flat(),
        rate: item.rate
      }))
      return { ...el, oldCode: oldCodeUpdated }
    })

    console.log(data.eligibilityDataBOI, 'Updated eligibilityDataBOI')
    setTargetData(data)
    setExpanded(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      {groupFields.map((group, groupIndex) => {
        const { fields: oldCodeFields, append: appendOldCode, remove: removeOldCode } = fieldArrays[groupIndex]

        return (
          <Box key={group.id} mb={3} sx={{ border: '1px solid #999999', borderRadius: 1, padding: 5 }}>
            <Grid sx={{ display: 'flex', alignItems: 'center', gap: '50px' }}>
              <Typography variant='h5'>Group {groupIndex + 1}</Typography>
              <Controller
                name={`eligibilityDataBOI.${groupIndex}.materialType`}
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Select
                    size='small'
                    displayEmpty
                    value={value}
                    onChange={onChange}
                    error={Boolean(errors.eligibilityDataBOI?.[groupIndex]?.materialType)}
                    renderValue={selected => {
                      if (selected === '' || selected === undefined) {
                        return 'Please select Material type'
                      }
                      return selected
                    }}
                  >
                    <MenuItem value='Tyre'>Tyre</MenuItem>
                    <MenuItem value='Tube'>Tube</MenuItem>
                    <MenuItem value='Flap'>Flap</MenuItem>
                  </Select>
                )}
              />
              {errors.eligibilityDataBOI?.[groupIndex]?.materialType && (
                <Typography variant='body2' color='error'>
                  Material Type is required
                </Typography>
              )}
            </Grid>
            <Grid container columnSpacing={3} rowSpacing={3} marginTop={1}>
              <Grid item xs={12} sm={3}>
                <Typography variant='body2'>1. Select or Group Tyre Size</Typography>
                <Controller
                  name={`eligibilityDataBOI.${groupIndex}.group`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      size='small'
                      defaultValue={[]}
                      displayEmpty
                      fullWidth
                      error={Boolean(errors.eligibilityDataBOI?.[groupIndex]?.group)}
                      id='select-multiple-checkbox'
                      multiple
                      value={value}
                      onChange={onChange}
                      renderValue={selected => {
                        if (selected.length === 0) {
                          return 'Please select Tyre Size'
                        } else if (selected.length > 3) {
                          return (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                              <CustomChip rounded label={selected[0]} skin='light' color='primary' />
                              <CustomChip rounded label={selected[1]} skin='light' color='primary' />
                              <CustomChip
                                rounded
                                label={`${selected.length - 2} more...`}
                                skin='light'
                                color='primary'
                              />
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
                      MenuProps={MenuProps}
                    >
                      <MenuItem value='' disabled sx={{ display: 'none' }}>
                        Please select
                      </MenuItem>
                      {groupList?.map(type => (
                        <MenuItem key={type} value={type}>
                          <Checkbox checked={value?.indexOf(type) > -1} />
                          <ListItemText primary={type} />
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.eligibilityDataBOI?.[groupIndex]?.group && (
                  <Typography variant='body2' color='error'>
                    Group Tyre is required
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant='body2'>2. Rate or Amount</Typography>
                <Controller
                  name={`eligibilityDataBOI.${groupIndex}.rate`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      placeholder='Please enter rate or amount'
                      onKeyPress={handleKeyPress}
                      onChange={onChange}
                      error={Boolean(errors.groups?.rate)}
                    />
                  )}
                />
                {errors.eligibilityDataBOI?.[groupIndex]?.rate && (
                  <Typography variant='body2' color='error'>
                    Rate or Amount is required
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant='body2'>3. Discount Type</Typography>
                <Controller
                  name={`eligibilityDataBOI.${groupIndex}.type`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <Select
                      fullWidth
                      size='small'
                      displayEmpty
                      value={value}
                      onChange={onChange}
                      error={Boolean(errors.eligibilityDataBOI?.[groupIndex]?.type)}
                      renderValue={selected => {
                        if (selected === '') {
                          return 'Please select discount type'
                        }
                        return selected
                      }}
                    >
                      <MenuItem value='Percentage'>Percentage</MenuItem>
                      <MenuItem value='INR'>INR</MenuItem>
                    </Select>
                  )}
                />
                {errors.eligibilityDataBOI?.[groupIndex]?.type && (
                  <Typography variant='body2' color='error'>
                    Discount Type is required
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant='body2'>4. Min & Max Quantity (Optional)</Typography>
                <Controller
                  name={`eligibilityDataBOI.${groupIndex}.min`}
                  control={control}
                  rules={{ required: false }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      sx={{ width: 100, mr: 3 }}
                      value={value}
                      placeholder='Min Quantity'
                      onKeyPress={handleKeyPress}
                      onChange={onChange}
                    />
                  )}
                />
                <Controller
                  name={`eligibilityDataBOI.${groupIndex}.max`}
                  control={control}
                  rules={{ required: false }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      sx={{ width: 100 }}
                      value={value}
                      placeholder='Min Quantity'
                      onKeyPress={handleKeyPress}
                      onChange={onChange}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                {oldCodeFields.map((oldCode, oldCodeIndex) => (
                  <Fragment key={oldCode.id}>
                    <Grid container columnSpacing={3} rowSpacing={3} padding={2}>
                      <Grid item xs={12} sm={3}>
                        <Typography variant='body2'>
                          {`${groupIndex + 1}.${oldCodeIndex + 1} Select Old Code TypeOld Code Type}`}
                        </Typography>
                        <Controller
                          name={`eligibilityDataBOI.${groupIndex}.oldCode.${oldCodeIndex}.type`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { value, onChange } }) => (
                            // <Select
                            //   size='small'
                            //   fullWidth
                            //   value={value}
                            //   onChange={onChange}
                            //   multiple
                            //   defaultValue={[]}
                            //   error={Boolean(errors.eligibilityDataBOI?.[groupIndex]?.oldCode?.[oldCodeIndex]?.type)}
                            // >
                            //   {oldCodeClass.map(type => (
                            //     <MenuItem key={type} value={type}>
                            //       <Checkbox checked={value?.some(item => item.value === type.value)} />
                            //       <ListItemText primary={type.label} />
                            //     </MenuItem>
                            //   ))}
                            // </Select>
                            <Select
                              size='small'
                              defaultValue={[]}
                              displayEmpty
                              fullWidth
                              error={Boolean(errors.eligibilityDataBOI?.[groupIndex]?.oldCode?.[oldCodeIndex]?.type)}
                              id='select-multiple-checkbox'
                              multiple
                              value={value}
                              onChange={onChange}
                              renderValue={selected => {
                                if (selected.length === 0) {
                                  return 'Please select Tyre Size'
                                }
                                return (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                    {selected.map((item, i) => (
                                      <CustomChip key={i} rounded label={item.label} skin='light' color='primary' />
                                    ))}
                                  </Box>
                                )
                              }}
                              MenuProps={MenuProps}
                            >
                              <MenuItem value='' disabled sx={{ display: 'none' }}>
                                Please select
                              </MenuItem>
                              {oldCodeClass?.map(type => (
                                // <MenuItem key={type} value={type}>
                                //   <Checkbox checked={value?.indexOf(type) > -1} />
                                //   <ListItemText primary={type} />
                                // </MenuItem>
                                <MenuItem key={type} value={type}>
                                  <Checkbox checked={value?.some(item => item.value === type.value)} />
                                  <ListItemText primary={type.label} />
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {errors.eligibilityDataBOI?.[groupIndex]?.oldCode?.[oldCodeIndex]?.type && (
                          <Typography variant='body2' color='error'>
                            Old Code Type is required
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant='body2'>Rate or Amount</Typography>
                        <Controller
                          name={`eligibilityDataBOI.${groupIndex}.oldCode.${oldCodeIndex}.rate`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { value, onChange } }) => (
                            <CustomTextField
                              fullWidth
                              value={value}
                              placeholder='Please enter rate or amount'
                              onKeyPress={handleKeyPress}
                              onChange={onChange}
                              error={Boolean(errors.eligibilityDataBOI?.[groupIndex]?.oldCode?.[oldCodeIndex]?.rate)}
                            />
                          )}
                        />
                        {errors.eligibilityDataBOI?.[groupIndex]?.oldCode?.[oldCodeIndex]?.rate && (
                          <Typography variant='body2' color='error'>
                            Rate or Amount is required
                          </Typography>
                        )}
                      </Grid>
                      {/* <Grid item xs={12} sm={3}>
                        <Typography variant='body2'>Old Code Rate Type</Typography>
                        <Controller
                          name={`eligibilityDataBOI.${groupIndex}.oldCode.${oldCodeIndex}.rateType`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { value, onChange } }) => (
                            <Select
                              size='small'
                              fullWidth
                              value={value}
                              onChange={onChange}
                              error={Boolean(
                                errors.eligibilityDataBOI?.[groupIndex]?.oldCode?.[oldCodeIndex]?.rateType
                              )}
                            >
                              <MenuItem value='Percentage'>Percentage</MenuItem>
                              <MenuItem value='Fixed'>Fixed</MenuItem>
                            </Select>
                          )}
                        />
                        {errors.eligibilityDataBOI?.[groupIndex]?.oldCode?.[oldCodeIndex]?.rateType && (
                          <Typography variant='body2' color='error'>
                            Old Code Rate Type is required
                          </Typography>
                        )}
                      </Grid> */}
                      {/* <Grid item xs={12} sm={3}>
                        <Button sx={{ mt: 5 }} variant='outlined' onClick={() => removeOldCode(oldCodeIndex)}>
                          Remove
                        </Button>
                        <Button
                          sx={{ mt: 5, px: 8, ml: 6 }}
                          variant='contained'
                          onClick={() => appendOldCode({ type: [], rate: '', rateType: '' })}
                        >
                          Add
                        </Button>
                      </Grid> */}
                      <Grid item xs={12} sm={3}>
                        {oldCodeIndex === oldCodeFields.length - 1 ? (
                          <Button
                            sx={{ mt: 5, px: 8 }}
                            variant='contained'
                            onClick={() => appendOldCode({ type: [], rate: '', rateType: '' })}
                          >
                            Add
                          </Button>
                        ) : (
                          <Button
                            sx={{ mt: 5, px: 8 }}
                            variant='outlined'
                            // color='error'
                            onClick={() => removeOldCode(oldCodeIndex)}
                          >
                            Remove
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Fragment>
                ))}
              </Grid>
            </Grid>
          </Box>
        )
      })}
      <Button
        sx={{ mt: 5 }}
        variant='contained'
        onClick={() =>
          appendGroup({
            group: [],
            rate: '',
            type: '',
            min: '',
            max: '',
            oldCode: [{ type: '', rate: '', rateType: '' }]
          })
        }
      >
        Add New Group
      </Button>
      <Grid sx={{ mt: 5 }} container>
        <Button type='submit' sx={{ mr: 2 }} variant='outlined'>
          Save and Continue
        </Button>
      </Grid>
    </form>
  )
}

export default OldCode
