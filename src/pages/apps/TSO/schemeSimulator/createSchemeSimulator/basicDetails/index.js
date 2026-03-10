import { Box, OutlinedInput, Select, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import { useForm, Controller } from 'react-hook-form'
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

const productTypeItems = [
  'Finished Goods',
  'New Defective Tyres',
  'Old Code Tyre',
  'SRT - Claim / Service Return Tyres'
]

const defaultValues = {
  productType: ['Finished Goods']
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

  const [selectedSchemeType, setSelectedSchemeType] = useState()

  const dispatch = useDispatch()

  const onSubmit = async data => {
    console.log('data', data)
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
                  setSelectedSchemeType(e.target.value)
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
                value={value}
                onChange={e => {
                  onChange(e.target.value)
                  dispatch(fetchSchemeParameter({ module: e.target.value }))
                }}
                error={Boolean(errors.schemeConfig)}
              >
                <MenuItem value='' disabled sx={{ display: 'none' }}>
                  Select Scheme
                </MenuItem>
                {/* {selectedSchemeType === 'BOI' ? (
                  <MenuItem value={'Early Bird'}>Early Bird</MenuItem>
                ) : (
                  <MenuItem value={'Volume Discount'}>Volume Discount</MenuItem>
                )} */}
                {/* <MenuItem value={'Flat Discount'}>Flat Discount</MenuItem> */}
                <MenuItem value={'Volume Discount'}>Volume Discount</MenuItem>
                {/* <MenuItem value={'Discount on Single Invoice'}>Discount on Single Invoice</MenuItem> */}
                <MenuItem value={'Early Bird'}>Early Bird</MenuItem>
                {/* <MenuItem value={'Old Code'}>Old Code</MenuItem> */}
                {/* <MenuItem value={'Buy X Get Y'}>Buy X Get Y</MenuItem> */}
                {/* <MenuItem value={'Club Based Discount'}>Club Based Discount</MenuItem> */}
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
              <CustomTextField fullWidth value={value} onChange={onChange} error={Boolean(errors.description)} />
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
                      //   popperPlacement={'bottom-end'}
                      dateFormat='yyyy/MM/dd'
                      onChange={date => {
                        onChange(date)
                      }}
                      placeholderText='Start Date'
                      customInput={
                        <PickersCustomInput
                          value={value}
                          fullWidth
                          sx={{ width: 150 }}
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
                      //   popperPlacement={'bottom-end'}
                      dateFormat='yyyy/MM/dd'
                      onChange={date => {
                        onChange(date)
                        // console.log(new Date(getValues('schemeStartDate').toISOString()))
                      }}
                      placeholderText='End Date'
                      customInput={
                        <PickersCustomInput
                          value={value}
                          fullWidth
                          sx={{ width: 150 }}
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
        <Grid item xs={12} sm={12}>
          <Typography variant='body2'>5. Include Product Type</Typography>
          <Controller
            name='productType'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <Select
                size='small'
                sx={{ minWidth: 330 }}
                displayEmpty
                error={Boolean(errors.productType)}
                id='select-multiple-checkbox'
                multiple
                value={value}
                onChange={onChange}
                renderValue={selected => {
                  if (selected.length === 0) {
                    return 'Please select Product Type to Include'
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
                  Please select Product Type to Include
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

          {errors.productType && (
            <Typography variant='body2' color='error'>
              Product Type is required
            </Typography>
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
