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
import { Fragment } from 'react'

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
      slab: [
        {
          minSales: '',
          maxSales: '',
          rewardAmout: ''
        }
      ],
      slabRequired: 1
    }
  ]
}

const TargetBasedDiscount = ({ setTargetData, setExpanded, groupList, productRunOn }) => {
  const {
    handleSubmit,
    watch,
    control,
    register,
    setValue,
    formState: { errors }
  } = useForm({ defaultValues })

  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup
  } = useFieldArray({
    control,
    name: 'eligibilityDataBOI'
  })

  const handleGenerateSlabs = (n, groupIndex) => {
    const validNumber = Math.max(n, 1)
    const slabArray = [...Array(validNumber).keys()].map(() => ({
      minSales: '',
      maxSales: '',
      rewardAmout: ''
    }))
    const groupsCopy = [...watch('eligibilityDataBOI')]
    groupsCopy[groupIndex].slab = slabArray
    groupsCopy[groupIndex].slabRequired = validNumber
    setValue('eligibilityDataBOI', groupsCopy)
  }

  const onSubmit = async data => {
    console.log('data', data)
    setTargetData(data)
    setExpanded(false)
  }

  const rewardTypeMapping = {
    '%': 'Percentage',
    'Quantity Discount': 'Quantity Discount',
    'Flat Discount': 'Flat Discount'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      {groupFields.map((group, groupIndex) => (
        <Box key={group.id} mb={3} sx={{ border: '1px solid #999999', borderRadius: 1, padding: 5 }}>
          {productRunOn && (
            <Grid sx={{ display: 'flex', alignItems: 'center', gap: '50px', marginY: '10px' }}>
              <Typography variant='h5'>Group {groupIndex + 1}</Typography>
              <Controller
                name={`eligibilityDataBOI.${groupIndex}.materialType`}
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Select
                    size='small'
                    displayEmpty
                    // value={value}
                    value={value || ''}
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
          )}
          <Grid container columnSpacing={3} rowSpacing={3}>
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
                    // value={value}
                    value={value || []}
                    onChange={onChange}
                    renderValue={selected => {
                      if (selected.length === 0) {
                        return 'Please select Tyre Size'
                      }
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {selected.map(value => (
                            <CustomChip key={value} rounded label={value} skin='light' color='primary' />
                          ))}
                        </Box>
                      )
                      //   else if (selected.length > 3) {
                      //     return (
                      //       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      //         <CustomChip rounded label={selected[0]} skin='light' color='primary' />
                      //         <CustomChip rounded label={selected[1]} skin='light' color='primary' />
                      //         <CustomChip rounded label={`${selected.length - 2} more...`} skin='light' color='primary' />
                      //       </Box>
                      //     )
                      //   } else {
                      //     return (
                      //       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      //         {selected.map((item, i) => (
                      //           <CustomChip key={i} rounded label={item} skin='light' color='primary' />
                      //         ))}
                      //       </Box>
                      //     )
                      //   }
                    }}
                    MenuProps={MenuProps}
                  >
                    <MenuItem value='' disabled sx={{ display: 'none' }}>
                      Please select groupTyre
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
              <Typography variant='body2'>2. Reward Type</Typography>
              <Controller
                name={`eligibilityDataBOI.${groupIndex}.rewardType`}
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <Select
                    fullWidth
                    size='small'
                    displayEmpty
                    // value={value}
                    value={value || ''}
                    onChange={onChange}
                    error={Boolean(errors.eligibilityDataBOI?.[groupIndex]?.rewardType)}
                    renderValue={selected => {
                      if (selected === '' || selected === undefined) {
                        return 'Please select reward type'
                      }
                      return rewardTypeMapping[selected] || selected
                    }}
                  >
                    <MenuItem value={'%'}>Percentage</MenuItem>
                    <MenuItem value={'Quantity Discount'}>Quantity Discount</MenuItem>
                    <MenuItem value={'Flat Discount'}>Flat Discount</MenuItem>
                  </Select>
                )}
              />

              {errors.eligibilityDataBOI?.[groupIndex]?.rewardType && (
                <Typography variant='body2' color='error'>
                  Reward Type is required
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant='body2'>3. Number of Slabs Required</Typography>
              <Controller
                name={`eligibilityDataBOI.${groupIndex}.slabRequired`}
                control={control}
                rules={{ required: true, min: 1 }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    placeholder='Please select the slabs required'
                    onKeyPress={handleKeyPress}
                    onChange={onChange}
                    error={Boolean(errors.eligibilityDataBOI?.[groupIndex]?.slabRequired)}
                  />
                )}
              />
              {errors.eligibilityDataBOI?.[groupIndex]?.slabRequired && (
                <Typography variant='body2' color='error'>
                  No. of Slabs is required
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={2}>
              {watch(`eligibilityDataBOI.${groupIndex}.slabRequired`, false) != '' && (
                <Button
                  sx={{ mt: 5 }}
                  onClick={() =>
                    handleGenerateSlabs(+watch(`eligibilityDataBOI.${groupIndex}.slabRequired`), groupIndex)
                  }
                  variant='outlined'
                >
                  Generate Slabs
                </Button>
              )}
            </Grid>
            <Grid item xs={12} sm={12}>
              {watch('eligibilityDataBOI')[groupIndex].slab.map((_, slabIndex) => (
                <Grid container key={slabIndex} sx={{ mt: '1rem', gap: '1rem' }}>
                  <Grid item xs={12} sm={2}>
                    <CustomTextField
                      fullWidth
                      label='1. Sales Target'
                      placeholder='Sales Target (Start)'
                      {...register(`eligibilityDataBOI.${groupIndex}.slab.${slabIndex}.minSales`, {
                        required: 'sales target start is required'
                      })}
                      error={Boolean(errors.eligibilityDataBOI?.[groupIndex]?.slab?.[slabIndex]?.minSales)}
                      helperText={errors.eligibilityDataBOI?.[groupIndex]?.slab?.[slabIndex]?.minSales?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <CustomTextField
                      fullWidth
                      sx={{ mt: 5 }}
                      placeholder='Sales Target (End)'
                      {...register(`eligibilityDataBOI.${groupIndex}.slab.${slabIndex}.maxSales`, {
                        required: 'sales target end is required'
                      })}
                      error={Boolean(errors.eligibilityDataBOI?.[groupIndex]?.slab?.[slabIndex]?.maxSales)}
                      helperText={errors.eligibilityDataBOI?.[groupIndex]?.slab?.[slabIndex]?.maxSales?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography variant='body2'>Reward Amount</Typography>
                    <Controller
                      name={`eligibilityDataBOI.${groupIndex}.slab.${slabIndex}.rewardAmout`}
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <CustomTextField
                          fullWidth
                          value={value || ''}
                          placeholder='Reward amount'
                          onKeyPress={handleKeyPress}
                          onChange={onChange}
                          error={Boolean(errors.eligibilityDataBOI?.[groupIndex]?.slab?.[slabIndex]?.rewardAmout)}
                        />
                      )}
                    />
                    {errors.eligibilityDataBOI?.[groupIndex]?.slab?.[slabIndex]?.rewardAmout && (
                      <Typography variant='body2' color='error'>
                        Reward Amount is required
                      </Typography>
                    )}
                  </Grid>

                  {slabIndex > 0 && (
                    <Grid item xs={12} sm={2}>
                      <Button
                        variant='contained'
                        sx={{ mt: 5 }}
                        onClick={() => {
                          const groupsCopy = [...watch('eligibilityDataBOI')]
                          groupsCopy[groupIndex].slab.splice(slabIndex, 1)
                          groupsCopy[groupIndex].slabRequired = groupsCopy[groupIndex].slab.length
                          setValue('eligibilityDataBOI', groupsCopy)
                        }}
                      >
                        Delete Slab
                      </Button>
                    </Grid>
                  )}
                </Grid>
              ))}
            </Grid>
            {groupIndex !== 0 && (
              <Grid item xs={12} sm={3}>
                <Button variant='outlined' onClick={() => removeGroup(groupIndex)}>
                  Remove
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      ))}
      <Button
        sx={{ mt: 5 }}
        variant='contained'
        onClick={() =>
          appendGroup({
            slab: [
              {
                minSales: '',
                maxSales: '',
                rewardAmout: ''
              }
            ],
            slabRequired: 1,
            rate: '',
            type: '',
            min: '',
            max: ''
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

export default TargetBasedDiscount
