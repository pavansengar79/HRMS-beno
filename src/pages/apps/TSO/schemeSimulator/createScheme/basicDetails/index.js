import { Box, OutlinedInput, Select, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import { useForm, Controller, useWatch } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import PickersCustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'
import { enIN } from 'date-fns/locale'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import CustomChip from 'src/@core/components/mui/chip'
import { useDispatch } from 'react-redux'
import { fetchSchemeParameter } from 'src/store/apps/TSO/simulator'
import { useState } from 'react'
import moment from 'moment'
import PickersNumeric from 'src/views/forms/form-elements/pickers/PickersNumeric'

const productTypeItems = [
  'Finished Goods',
  'New Defective Tyres',
  'Old Code Tyre',
  'SRT - Claim / Service Return Tyres'
]

const BOIOptions = [
  'Flat Discount',
  'Product Discount',
  'Discount on Single Invoice',
  'Early Bird',
  'Old Code',
  'Buy X Get Y',
  'Club Based Discount',
  'Smart Tyre'
]

const CNOptions = ['Volume Discount', 'Target Based Discount']

const defaultValues = {
  schemeProduct: ['Finished Goods'],
  rebateOption: '4',
  schemeStartDate: moment(new Date()).startOf('month').toDate(),
  schemeEndDate: moment(new Date()).endOf('month').toDate()
}

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const MenuProps = {
  PaperProps: {
    style: {
      width: 280,
      maxHeight: ITEM_HEIGHT * 6 + ITEM_PADDING_TOP
    }
  }
}

const BasicDetails = ({ setDetailsData, setExpanded }) => {
  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors }
  } = useForm({ defaultValues })

  const schemeTypeValue = useWatch({
    control,
    name: 'schemeType'
  })
  const schemeStartDateValue = useWatch({
    control,
    name: 'schemeStartDate'
  })

  const isDateDisabled = date => {
    if (schemeTypeValue === 'CN') {
      const day = date.getDate()
      return day < 29
    }
    return true
  }

  const onSubmit = async data => {
    data.schemeStartDate = moment(data.schemeStartDate).format('YYYY/MM/DD')
    data.schemeEndDate = moment(data.schemeEndDate).format('YYYY/MM/DD')
    // console.log('data', data)
    setDetailsData(data)
    setExpanded(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Grid container columnSpacing={3} rowSpacing={3}>
        <Grid item xs={12} sm={3}>
          <Typography variant='body2'>1. Select Scheme Type</Typography>
          <Controller
            name='schemeType'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                fullWidth
                size='small'
                displayEmpty
                defaultValue=''
                value={value}
                onChange={e => {
                  onChange(e.target.value)
                }}
                error={Boolean(errors.schemeType)}
              >
                <MenuItem value='' disabled sx={{ display: 'none' }}>
                  Select Scheme Type
                </MenuItem>
                <MenuItem value={'BOI'}>Body of Invoice</MenuItem>
                <MenuItem value={'CN'}>Credit Note</MenuItem>
              </Select>
            )}
          />

          {errors.schemeType && (
            <Typography variant='body2' color='error'>
              Scheme Type is required
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} sm={3}>
          <Typography variant='body2'>2. Select Scheme to Configure</Typography>
          <Controller
            name='schemeConfig'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                fullWidth
                size='small'
                displayEmpty
                defaultValue=''
                value={value || ''}
                onChange={e => {
                  onChange(e.target.value)
                }}
                error={Boolean(errors.schemeConfig)}
              >
                <MenuItem value='' disabled sx={{ display: 'none' }}>
                  Select Scheme
                </MenuItem>
                {schemeTypeValue === 'BOI'
                  ? BOIOptions.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))
                  : CNOptions.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
              </Select>
            )}
          />

          {errors.schemeConfig && (
            <Typography variant='body2' color='error'>
              Scheme Configure is required
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant='body2'> 3. Enter Scheme Description</Typography>
          <Controller
            name='description'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                placeholder='Please enter Scheme description'
                value={value}
                onChange={onChange}
                error={Boolean(errors.description)}
              />
            )}
          />

          {errors.description && (
            <Typography variant='body2' color='error'>
              Scheme Description is required
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant='body2'>4. Scheme Duration</Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Controller
                name='schemeStartDate'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={value}
                      locale={enIN}
                      dateFormat='yyyy/MM/dd'
                      onChange={date => {
                        onChange(date)
                      }}
                      filterDate={isDateDisabled}
                      placeholderText='Start Date'
                      customInput={
                        <PickersNumeric
                          value={value}
                          fullWidth
                          sx={{ width: 140 }}
                          error={Boolean(errors.schemeStartDate)}
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
              {errors.schemeStartDate && (
                <Typography variant='body2' color='error'>
                  Start Date is required
                </Typography>
              )}
            </Box>
            <Box>
              <Controller
                name='schemeEndDate'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={value}
                      locale={enIN}
                      dateFormat='yyyy/MM/dd'
                      onChange={date => {
                        onChange(date)
                      }}
                      minDate={schemeStartDateValue}
                      filterDate={isDateDisabled}
                      placeholderText='End Date'
                      customInput={
                        <PickersNumeric
                          value={value}
                          fullWidth
                          sx={{ width: 140 }}
                          error={Boolean(errors.schemeEndDate)}
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />

              {errors.schemeEndDate && (
                <Typography variant='body2' color='error'>
                  End Date is required
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant='body2'>5. Include Product Type</Typography>
          <Controller
            name='schemeProduct'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <Select
                size='small'
                fullWidth
                // sx={{ minWidth: 100 }}
                displayEmpty
                error={Boolean(errors.schemeProduct)}
                id='select-multiple-checkbox'
                multiple
                value={value}
                onChange={onChange}
                renderValue={selected => {
                  if (selected.length === 0) {
                    return 'Please select Product Type'
                  }
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {selected.map(value => (
                        <CustomChip key={value} rounded label={value} skin='light' color='primary' />
                      ))}
                    </Box>
                  )
                }}
                MenuProps={MenuProps}
              >
                <MenuItem value='' disabled sx={{ display: 'none' }}>
                  Please select Product Type
                </MenuItem>
                {productTypeItems.map(type => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={value?.indexOf(type) > -1} />
                    <ListItemText primary={type} />
                  </MenuItem>
                ))}
              </Select>
            )}
          />

          {errors.schemeProduct && (
            <Typography variant='body2' color='error'>
              Product Type is required
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={3}>
          {schemeTypeValue === 'CN' && (
            <>
              <Typography variant='body2'>6. Select Rebate Option</Typography>
              <Controller
                name='rebateOption'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <Select
                    fullWidth
                    size='small'
                    displayEmpty
                    value={value}
                    onChange={e => {
                      onChange(e.target.value)
                    }}
                    error={Boolean(errors.rebateOption)}
                  >
                    <MenuItem value='' disabled sx={{ display: 'none' }}>
                      Please select rebate option
                    </MenuItem>
                    <MenuItem value='1'>NDP</MenuItem>
                    <MenuItem value='2'>Invoice Value</MenuItem>
                    <MenuItem value='3'>Base Value</MenuItem>
                    <MenuItem value='4'>Merchandise Value</MenuItem>
                  </Select>
                )}
              />

              {errors.rebateOption && (
                <Typography variant='body2' color='error'>
                  Rebate option is required
                </Typography>
              )}
            </>
          )}
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

export default BasicDetails
