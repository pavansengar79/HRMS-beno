import { Box, Select, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import { handleKeyPress } from 'src/utils/helper'
import { Fragment, useState } from 'react'

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

const SimulatorConfigure = ({ setTargetData }) => {
  const {
    handleSubmit,
    watch,
    control,
    register,
    setValue,
    formState: { errors }
  } = useForm()

  const [slabs, setSlabs] = useState()
  const generatedSlabs = () => {
    switch (slab) {
      case 1:
        return (
          <>
            <Grid item xs={12} sm={2}>
              <CustomTextField
                fullWidth
                label='1. Slab Start Date'
                {...register(`first_slab_inputs.slab_start_date`, {
                  required: 'slab start date start is required'
                })}
                error={Boolean(errors?.first_slab_inputs?.slab_start_date)}
                helperText={errors?.first_slab_inputs.slab_start_date?.message}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <CustomTextField
                fullWidth
                label='2. Slab End Date'
                {...register(`first_slab_inputs.slab_end_date`, {
                  required: 'slab end date start is required'
                })}
                error={Boolean(errors?.first_slab_inputs?.slab_start_date)}
                helperText={errors?.first_slab_inputs.slab_start_date?.message}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <CustomTextField
                fullWidth
                label='3. Slab Increament'
                {...register(`first_slab_inputs.slab_increament`, {
                  required: 'slab increament is required'
                })}
                error={Boolean(errors?.first_slab_inputs?.slab_increament)}
                helperText={errors?.first_slab_inputs?.slab_increament?.message}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <CustomTextField
                fullWidth
                label='5. Rotation Increment'
                {...register(`first_slab_inputs.rotation_increament`, {
                  required: 'rotation increament is required'
                })}
                error={Boolean(errors?.first_slab_inputs?.rotation_increament)}
                helperText={errors?.first_slab_inputs?.rotation_increament?.message}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <CustomTextField
                fullWidth
                label='6. Min Payout'
                {...register(`first_slab_inputs.min_payout`, {
                  required: 'min payout is required'
                })}
                error={Boolean(errors?.first_slab_inputs?.rotation_increament)}
                helperText={errors?.first_slab_inputs?.rotation_increament?.message}
              />
            </Grid>
          </>
        )
    }
  }

  const slabsCount = useWatch({
    control,
    name: 'number_of_slabs'
  })

  const onSubmit = async data => {
    console.log('data', data)
    setTargetData(data)
  }

  return (
    // <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
    //   {groupFields.map((group, groupIndex) => (
    //     <Box key={group.id} mb={3} sx={{ border: '1px solid #999999', borderRadius: 1, padding: 5 }}>
    //       <Typography variant='h5'>Group {groupIndex + 1}</Typography>
    //       <Grid container columnSpacing={3} rowSpacing={3}>
    //         <Grid item xs={12} sm={3}>
    //           <Typography variant='body2'>1. No of Slabs Req.</Typography>
    //           <Controller
    //             name={`groups.${groupIndex}.number_of_slabs`}
    //             control={control}
    //             rules={{ required: true }}
    //             render={({ field: { value, onChange } }) => (
    //               <Select
    //                 size='small'
    //                 displayEmpty
    //                 error={Boolean(errors.groups?.[groupIndex]?.number_of_slabs)}
    //                 sx={{ width: 200 }}
    //                 id='select-multiple-checkbox'
    //                 value={value}
    //                 onChange={onChange}
    //                 renderValue={selected => {
    //                   if (selected.length === 0) {
    //                     return 'Please select'
    //                   }
    //                 }}
    //               >
    //                 {[1, 2, 3, 4, 5].map(item => (
    //                   <MenuItem key={item} value={item}>
    //                     {item}
    //                   </MenuItem>
    //                 ))}
    //               </Select>
    //             )}
    //           />
    //           {errors.groups?.[groupIndex]?.number_of_slabs && (
    //             <Typography variant='body2' color='error'>
    //               No. Of Slabs is required
    //             </Typography>
    //           )}
    //         </Grid>
    //         <Grid item xs={12} sm={3}>
    //           <Typography variant='body2'>2. For the Month of</Typography>
    //           <Controller
    //             name={`groups.${groupIndex}.month`}
    //             control={control}
    //             rules={{ required: true }}
    //             render={({ field: { value, onChange } }) => (
    //               <Select
    //                 size='small'
    //                 displayEmpty
    //                 error={Boolean(errors.groups?.[groupIndex]?.month)}
    //                 sx={{ width: 200 }}
    //                 id='select-multiple-checkbox'
    //                 value={value}
    //                 onChange={onChange}
    //                 renderValue={selected => {
    //                   if (selected.length === 0) {
    //                     return 'Please select'
    //                   }
    //                 }}
    //               >
    //                 {[
    //                   'January',
    //                   'February',
    //                   'March',
    //                   'April',
    //                   'May',
    //                   'June',
    //                   'July',
    //                   'August',
    //                   'September',
    //                   'October',
    //                   'November',
    //                   'December'
    //                 ].map(item => (
    //                   <MenuItem key={item} value={item}>
    //                     {item}
    //                   </MenuItem>
    //                 ))}
    //               </Select>
    //             )}
    //           />
    //           {errors.groups?.[groupIndex]?.month && (
    //             <Typography variant='body2' color='error'>
    //               Month is required
    //             </Typography>
    //           )}
    //         </Grid>
    //         <Grid item xs={12} sm={3}>
    //           {slabsCount != '' && (
    //             <Button sx={{ mt: 5 }} onClick={() => setSlabs(slabsCount)} variant='outlined'>
    //               Generate Slabs
    //             </Button>
    //           )}
    //         </Grid>
    //         <Grid item xs={12} sm={3} />
    //         {/* {watch(`groups.${groupIndex}.slab`, []).map((field, slabIndex) => (
    //           <Fragment key={slabIndex}>
    //             <Grid item xs={12} sm={2}>
    //               <CustomTextField
    //                 fullWidth
    //                 label='1. Sales Target'
    //                 {...register(`groups.${groupIndex}.slab.${slabIndex}.salesTarget.start`, {
    //                   required: 'sales tartget start is required'
    //                 })}
    //                 error={Boolean(errors.groups?.[groupIndex]?.slab?.[slabIndex]?.salesTarget?.start)}
    //                 helperText={errors.groups?.[groupIndex]?.slab?.[slabIndex]?.salesTarget?.start?.message}
    //               />
    //             </Grid>
    //             <Grid item xs={12} sm={2}>
    //               <CustomTextField
    //                 fullWidth
    //                 sx={{ mt: 5 }}
    //                 {...register(`groups.${groupIndex}.slab.${slabIndex}.salesTarget.end`, {
    //                   required: 'sales tartget end is required'
    //                 })}
    //                 error={Boolean(errors.groups?.[groupIndex]?.slab?.[slabIndex]?.salesTarget?.end)}
    //                 helperText={errors.groups?.[groupIndex]?.slab?.[slabIndex]?.salesTarget?.end?.message}
    //               />
    //             </Grid>
    //             <Grid item xs={12} sm={3}>
    //               <Typography variant='body2'>2. Reward Type</Typography>
    //               <Controller
    //                 name={`groups.${groupIndex}.slab.${slabIndex}.rewardType`}
    //                 control={control}
    //                 rules={{ required: true }}
    //                 render={({ field: { value, onChange, onBlur } }) => (
    //                   <Select
    //                     fullWidth
    //                     size='small'
    //                     displayEmpty
    //                     value={value}
    //                     onChange={onChange}
    //                     error={Boolean(errors.groups?.[groupIndex]?.slab?.[slabIndex]?.rewardType)}
    //                   >
    //                     <MenuItem value={'Percentage'}>Percentage</MenuItem>
    //                   </Select>
    //                 )}
    //               />

    //               {errors.groups?.[groupIndex]?.slab?.[slabIndex]?.rewardType && (
    //                 <Typography variant='body2' color='error'>
    //                   Reward Type is required
    //                 </Typography>
    //               )}
    //             </Grid>
    //             <Grid item xs={12} sm={2}>
    //               <Typography variant='body2'>Reward Amount</Typography>
    //               <Controller
    //                 name={`groups.${groupIndex}.slab.${slabIndex}.rewardAmount`}
    //                 control={control}
    //                 rules={{ required: true }}
    //                 render={({ field: { value, onChange } }) => (
    //                   <CustomTextField
    //                     fullWidth
    //                     value={value}
    //                     onKeyPress={handleKeyPress}
    //                     onChange={onChange}
    //                     error={Boolean(errors.groups?.[groupIndex]?.slab?.[slabIndex]?.rewardAmount)}
    //                   />
    //                 )}
    //               />
    //               {errors.groups?.[groupIndex]?.slab?.[slabIndex]?.rewardAmount && (
    //                 <Typography variant='body2' color='error'>
    //                   Reward Amont is required
    //                 </Typography>
    //               )}
    //             </Grid>
    //             <Grid item xs={12} sm={2}>
    //               <Button
    //                 variant='contained'
    //                 sx={{ mt: 5 }}
    //                 onClick={() => {
    //                   const groupsCopy = [...watch('groups')]
    //                   groupsCopy[groupIndex].slab.splice(slabIndex, 1)
    //                   setValue('groups', groupsCopy)
    //                 }}
    //               >
    //                 Delete Slab
    //               </Button>
    //             </Grid>
    //           </Fragment>
    //         ))} */}
    //         generatedSlabs()
    //       </Grid>
    //       <Button sx={{ mt: 5 }} variant='contained' onClick={() => appendGroup({ slab: [] })}>
    //         Add New Group
    //       </Button>
    //     </Box>
    //   ))}
    //   <Grid sx={{ mt: 5 }} container>
    //     <Button type='submit' sx={{ mr: 2 }} variant='outlined'>
    //       Save and Continue
    //     </Button>
    //   </Grid>
    // </form>
    <></>
  )
}

export default SimulatorConfigure
