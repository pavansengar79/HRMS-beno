import {
  Box,
  FormControlLabel,
  Radio,
  Select,
  Slider,
  Typography,
  Button,
  Grid,
  MenuItem,
  Checkbox,
  ListItemText
} from '@mui/material'
import { useForm, Controller, useWatch } from 'react-hook-form'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
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

const defaultValues = {
  slab_inputs: [],
  slabsCount: '',
  month: '',
  rotation_range: [0, 0.5],
  not_achieved: {
    min_payout: '',
    max_payout: '',
    payout_increament: ''
  },
  achieved: {
    min_payout: '',
    max_payout: '',
    payout_increament: ''
  }
}

const EarlyBird2 = ({ setTargetData }) => {
  const [probability, setProbability] = useState(0)
  const [lastTwoays, setLastTwoDays] = useState(false)

  const {
    handleSubmit,
    watch,
    control,
    register,
    setValue,
    formState: { errors }
  } = useForm({ defaultValues })

  const slabInputs = useWatch({
    control,
    name: 'slab_inputs'
  })

  const slabsCount = useWatch({
    control,
    name: 'slabsCount'
  })

  const handleGenerateSlabs = n => {
    const slabs = Array.from({ length: n }, () => ({
      slab_start_date: '',
      slab_end_date: '',
      slab_increament: '',
      rotation_range: [0, 0.5],
      rotation_increament: '',
      not_achieved: {
        min_payout: '',
        max_payout: '',
        payout_increament: ''
      },
      achieved: {
        min_payout: '',
        max_payout: '',
        payout_increament: ''
      }
    }))
    setValue('slab_inputs', slabs)
  }

  const onSubmit = async data => {
    console.log('data', data)
    setTargetData(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Typography variant='h5'> Simulator Inputs </Typography>
      <Grid container columnSpacing={3} rowSpacing={4}>
        <Grid item xs={12} sm={2}>
          <Typography variant='body2'>1. No of Slabs Req.</Typography>
          <Controller
            name='slabsCount'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <Select
                size='small'
                displayEmpty
                error={Boolean(errors.slabsCount)}
                sx={{ width: 200 }}
                id='select-checkbox'
                defaultValue=''
                value={value}
                onChange={onChange}
                renderValue={selected => {
                  if (selected.length === 0) {
                    return 'Please Select'
                  }
                  return selected
                }}
              >
                {['1', '2', '3', '4', '5'].map(option => (
                  <MenuItem key={option} value={option}>
                    <FormControlLabel control={<Radio checked={value === option} />} label={option} value={option} />
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.slabsCount && (
            <Typography variant='body2' color='error'>
              No of Slabs is required
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} sm={2}>
          <Typography variant='body2'>2. For the Month of.</Typography>
          <Controller
            name='month'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <Select
                size='small'
                displayEmpty
                error={Boolean(errors.month)}
                sx={{ width: 200 }}
                id='select-checkbox'
                defaultValue=''
                value={value}
                onChange={onChange}
                renderValue={selected => {
                  if (selected?.length === 0) {
                    return 'Please Select'
                  }
                  return selected
                }}
              >
                {[
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December'
                ].map(type => (
                  <MenuItem key={type} value={type}>
                    <FormControlLabel control={<Radio checked={value === type} />} label={type} value={type} />
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.month && (
            <Typography variant='body2' color='error'>
              Month is required
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography variant='body2'>3. Movement Probability Threshold.</Typography>
          <Controller
            name='probability'
            control={control}
            render={({ field }) => (
              <Slider
                {...field}
                value={probability}
                aria-labelledby='controlled-slider'
                onChange={(event, newValue) => {
                  setProbability(newValue)
                  field.onChange(newValue)
                }}
                min={0}
                max={1}
                step={0.1}
                valueLabelDisplay='auto'
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox checked={lastTwoays} onChange={e => setLastTwoDays(e.target.checked)} />
            <Typography variant='body2'>Take final Slab as last 2 Days of the Month</Typography>
          </div>
        </Grid>
        <Grid item xs={12} sm={2}>
          {slabsCount && (
            <Button sx={{ mt: 5 }} onClick={() => handleGenerateSlabs(slabsCount)} variant='outlined'>
              Generate Slabs
            </Button>
          )}
        </Grid>
        <Grid item xs={12} sm={12}>
          {slabInputs.map((slab, index) => (
            <Box
              key={index}
              mb={3}
              sx={{
                border: '1px solid #999999',
                borderRadius: 1,
                padding: 5,
                width: '100%'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
                <CustomTextField
                  sx={{ width: 200 }}
                  label='1. Slab Start Date'
                  {...register(`slab_inputs.${index}.slab_start_date`, {
                    required: 'Slab Start Date is required'
                  })}
                  error={Boolean(errors.slab_inputs?.[index]?.slab_start_date)}
                  helperText={errors.slab_inputs?.[index]?.slab_start_date?.message}
                />
                <CustomTextField
                  sx={{ width: 200 }}
                  label='2. Slab End Date'
                  {...register(`slab_inputs.${index}.slab_end_date`, {
                    required: 'Slab End Date is required'
                  })}
                  error={Boolean(errors.slab_inputs?.[index]?.slab_end_date)}
                  helperText={errors.slab_inputs?.[index]?.slab_end_date?.message}
                />
                <CustomTextField
                  sx={{ width: 200 }}
                  label='3. Slab Increament'
                  {...register(`slab_inputs.${index}.slab_increament`, {
                    required: 'Slab Increament is required'
                  })}
                  error={Boolean(errors.slab_inputs?.[index]?.slab_increament)}
                  helperText={errors.slab_inputs?.[index]?.slab_increament?.message}
                />
                <Box>
                  <Typography variant='body2'>4. Roation Range.</Typography>
                  <Controller
                    name={`slab_inputs.${index}.rotation_range`}
                    control={control}
                    render={({ field }) => (
                      <Slider
                        {...field}
                        value={field.value}
                        onChange={(_, newValue) => field.onChange(newValue)}
                        aria-labelledby='range-slider'
                        valueLabelDisplay='auto'
                        min={0}
                        max={1}
                        step={0.1}
                        sx={{ width: 200, ml: 3 }}
                      />
                    )}
                  />
                  {errors.slab_inputs?.[index]?.rotation_range && (
                    <Typography variant='body2' color='error'>
                      Rotation range is required
                    </Typography>
                  )}
                </Box>
                <CustomTextField
                  sx={{ width: 200 }}
                  label='5. Rotation increament'
                  {...register(`slab_inputs.${index}.rotation_increament`, {
                    required: 'Rotation Increament is required'
                  })}
                  error={Boolean(errors.slab_inputs?.[index]?.rotation_increament)}
                  helperText={errors.slab_inputs?.[index]?.rotation_increament?.message}
                />
              </div>
              <Typography variant='body2'> Rotation Not Achieved</Typography>
              <CustomTextField
                sx={{ width: 200, mr: 4 }}
                label='6. Min Payout'
                {...register(`slab_inputs.${index}.not_achieved.min_payout`, {
                  required: 'Min Payout is required'
                })}
                error={Boolean(errors.slab_inputs?.[index]?.not_achieved?.min_payout)}
                helperText={errors.slab_inputs?.[index]?.not_achieved?.min_payout?.message}
              />
              <CustomTextField
                sx={{ width: 200, mr: 4 }}
                label='6.1 Max Payout'
                {...register(`slab_inputs.${index}.not_achieved.max_payout`, {
                  required: 'Max Payout is required'
                })}
                error={Boolean(errors.slab_inputs?.[index]?.not_achieved?.max_payout)}
                helperText={errors.slab_inputs?.[index]?.not_achieved?.max_payout?.message}
              />
              <CustomTextField
                sx={{ width: 200, mr: 4 }}
                label='6.2 Payout Increament'
                {...register(`slab_inputs.${index}.not_achieved.payout_increament`, {
                  required: 'Payout Increament is required'
                })}
                error={Boolean(errors.slab_inputs?.[index]?.not_achieved?.payout_increament)}
                helperText={errors.slab_inputs?.[index]?.not_achieved?.payout_increament?.message}
              />
              <Typography variant='body2'> Rotation Achieved</Typography>
              <CustomTextField
                sx={{ width: 200, mr: 4 }}
                label='7. Min Payout'
                {...register(`slab_inputs.${index}.achieved.min_payout`, {
                  required: 'Min Payout is required'
                })}
                error={Boolean(errors.slab_inputs?.[index]?.achieved?.min_payout)}
                helperText={errors.slab_inputs?.[index]?.achieved?.min_payout?.message}
              />
              <CustomTextField
                sx={{ width: 200, mr: 4 }}
                label='7.1 Max Payout'
                {...register(`slab_inputs.${index}.achieved.max_payout`, {
                  required: 'Max Payout is required'
                })}
                error={Boolean(errors.slab_inputs?.[index]?.achieved?.max_payout)}
                helperText={errors.slab_inputs?.[index]?.achieved?.max_payout?.message}
              />
              <CustomTextField
                sx={{ width: 200, mr: 4 }}
                label='7.2 Payout Increament'
                {...register(`slab_inputs.${index}.achieved.payout_increament`, {
                  required: 'Payout Increament is required'
                })}
                error={Boolean(errors.slab_inputs?.[index]?.achieved?.payout_increament)}
                helperText={errors.slab_inputs?.[index]?.achieved?.payout_increament?.message}
              />
            </Box>
          ))}
        </Grid>
      </Grid>

      <Grid sx={{ mt: 5 }} container>
        <Button type='submit' sx={{ mr: 2 }} variant='outlined'>
          Save and Continue
        </Button>
      </Grid>
    </form>
  )
}

export default EarlyBird2
