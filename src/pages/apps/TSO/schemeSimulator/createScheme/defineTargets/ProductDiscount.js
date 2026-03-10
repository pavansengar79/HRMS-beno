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
  eligibilityDataBOI: [{ group: [], rate: '', type: '', min: '', max: '' }]
}

const ProductDiscount = ({ setTargetData, setExpanded, eligibilityData, groupList, productRunOn }) => {
  const {
    handleSubmit,
    watch,
    control,
    register,
    setValue,
    formState: { errors }
  } = useForm({ defaultValues })
  console.log('eli', eligibilityData)
  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup
  } = useFieldArray({
    control,
    name: 'eligibilityDataBOI'
  })

  const onSubmit = async data => {
    console.log('data', data)
    setTargetData(data)
    setExpanded(false)
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
                    value={value}
                    onChange={onChange}
                    renderValue={selected => {
                      if (selected.length === 0) {
                        return 'Please select Tyre Size'
                      }
                      // return (
                      //   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      //     {selected.map(value => (
                      //       <CustomChip key={value} rounded label={value} skin='light' color='primary' />
                      //     ))}
                      //   </Box>
                      // )
                      else if (selected.length > 3) {
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
                    MenuProps={MenuProps}
                  >
                    <MenuItem value='' disabled sx={{ display: 'none' }}>
                      Please select groupTyre
                    </MenuItem>
                    {groupList &&
                      groupList?.map(type => (
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
                    <MenuItem value={'Percentage'}>Percentage</MenuItem>
                    <MenuItem value={'INR'}>INR</MenuItem>
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
                    placeholder='Max Quantity'
                    onKeyPress={handleKeyPress}
                    onChange={onChange}
                  />
                )}
              />
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
        onClick={() => appendGroup({ group: [], rate: '', type: '', min: '', max: '' })}
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

export default ProductDiscount
