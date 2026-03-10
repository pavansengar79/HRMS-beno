// ** React Imports
import { forwardRef, useState, Fragment } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import { enIN } from 'date-fns/locale'
import format from 'date-fns/format'

// ** Icon Imports

// ** Third Party Imports
import { useForm, useWatch, useFieldArray, Controller } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Card, CardContent, CardHeader, Divider, Typography } from '@mui/material'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

const defaultValues = {
  E: {
    E1: [{ Sales_Org: '', Distribution_Channel: '', Division: '', Update_Indicator: '', UI_record_ref: 'E1R1' }],
    E2: [
      {
        Account_Group: '',
        Customer_Classification: '',
        Region: '',
        Sales_Office: '',
        Customer: '',
        Update_Indicator: '',
        UI_record_ref: 'E2R1'
      }
    ],
    E3: [{ Account_Group: '', Region: '', Sales_Office: '', Update_Indicator: '', UI_record_ref: 'E3R1' }]
  }
}

const CustomInput = forwardRef((props, ref) => {
  const startDate = props.start !== null ? format(props.start, 'MM/dd/yyyy') : null
  const endDate = props.end !== null ? format(props.end, 'MM/dd/yyyy') : null
  const value = `${startDate !== null ? startDate : ''} ${endDate !== null ? '-' + endDate : ''}`

  return <CustomTextField inputRef={ref} label={props.label || ''} {...props} />
})

const customerOptions = [
  { value: '11006444', label: '11006444' },
  { value: '11006445', label: '11006445' },
  { value: '11006446', label: '11006446' }
]

const CreateScheme = () => {
  const dispatch = useDispatch()

  const {
    register,
    unregister,
    handleSubmit,
    formState: { errors },
    control
  } = useForm({ defaultValues })

  const schemeType = useWatch({
    control,
    name: 'schemeType'
  })
  const dealerType = useWatch({
    control,
    name: 'dealerType'
  })

  const Budget_Index = useWatch({
    control,
    name: 'Budget_Index'
  })

  const { fields: E1Fields, append: appendE1 } = useFieldArray({
    control,
    name: 'E.E1'
  })

  const { fields: E2Fields, append: appendE2 } = useFieldArray({
    control,
    name: 'E.E2'
  })

  const { fields: E3Fields, append: appendE3 } = useFieldArray({
    control,
    name: 'E.E3'
  })

  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const handleDateChange = dates => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  const onSubmit = async data => {
    console.log('data', data)
  }

  return (
    <Card>
      <CardHeader title='Create Scheme' />
      <Divider sx={{ m: '0 !important' }} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Grid container columnSpacing={4} rowSpacing={4}>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                select
                fullWidth
                label='Scheme Type'
                {...register('schemeType', { required: 'Scheme Type is required' })}
                error={Boolean(errors.schemeType)}
                helperText={errors.schemeType ? errors.schemeType.message : ''}
              >
                <MenuItem value={'BOI'}>BOI</MenuItem>
                <MenuItem value={'CN'} onClick={() => unregister('dealerType')}>
                  CN
                </MenuItem>
              </CustomTextField>
            </Grid>
            {schemeType === 'BOI' && (
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  select
                  fullWidth
                  label='Dealer Type'
                  {...register('dealerType', { required: 'Dealer Type is required' })}
                  error={Boolean(errors.dealerType)}
                  helperText={errors.dealerType ? errors.dealerType.message : ''}
                >
                  <MenuItem value={'tradeOffer'}>Trade Offer</MenuItem>
                  <MenuItem value={'corePolicy'}>Core Policy</MenuItem>
                </CustomTextField>
              </Grid>
            )}

            {dealerType === 'corePolicy' && (
              <>
                <Grid item xs={12} sm={12}>
                  <Typography variant='h5'>Headers</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Deal Type'
                    {...register('Deal_Type', { required: 'Deal Type is required' })}
                    error={Boolean(errors.Deal_Type)}
                    helperText={errors.Deal_Type ? errors.Deal_Type.message : ''}
                  >
                    <MenuItem value={'ZDCP'}>ZDCP</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    fullWidth
                    label='Deal'
                    {...register('Deal', { required: 'Deal is required' })}
                    error={Boolean(errors.Deal)}
                    helperText={errors.Deal ? errors.Deal.message : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    fullWidth
                    label='Description'
                    {...register('Description', { required: 'Description is required' })}
                    error={Boolean(errors.Description)}
                    helperText={errors.Description ? errors.Description.message : ''}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    fullWidth
                    label='Ext Description'
                    {...register('Ext_Description')}
                    error={Boolean(errors.Ext_Description)}
                    helperText={errors.Ext_Description ? errors.Ext_Description.message : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <DatePickerWrapper>
                    <DatePicker
                      selectsRange
                      isClearable
                      selected={startDate}
                      startDate={startDate}
                      endDate={endDate}
                      id='date-range-picker'
                      onChange={handleDateChange}
                      locale={enIN}
                      popperPlacement='bottom-end'
                      //   placeholderText='start and end date'
                      customInput={<CustomInput label='Valid Dates' fullWidth start={startDate} end={endDate} />}
                    />
                  </DatePickerWrapper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Currency'
                    {...register('Currency', { required: 'Currency is required' })}
                    error={Boolean(errors.Currency)}
                    helperText={errors.Currency ? errors.Currency.message : ''}
                    defaultValue='INR'
                  >
                    <MenuItem value={'INR'}>INR</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Objectives'
                    {...register('Objectives', { required: 'Objective is required' })}
                    error={Boolean(errors.Objectives)}
                    helperText={errors.Objectives ? errors.Objectives.message : ''}
                  >
                    <MenuItem value={'ACER'}>ACER</MenuItem>
                    <MenuItem value={'EDBI'}>EDBI</MenuItem>
                    <MenuItem value={'EMRP'}>EMRP</MenuItem>
                    <MenuItem value={'PPDI'}>PPDI</MenuItem>
                    <MenuItem value={'PRDI'}>PRDI</MenuItem>
                    <MenuItem value={'QTDI'}>QTDI</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Budget Index'
                    {...register('Budget_Index', { required: 'Budget Index is required' })}
                    error={Boolean(errors.Budget_Index)}
                    helperText={errors.Budget_Index ? errors.Budget_Index.message : ''}
                  >
                    <MenuItem value={'01'}>01</MenuItem>
                    <MenuItem value={'02'}>02</MenuItem>
                    <MenuItem value={'03'}>03</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Reason disc'
                    {...register(
                      'Reason_Disc',
                      Budget_Index === '03' ? { required: 'Reason Disc is required' } : { required: false }
                    )}
                    error={Boolean(errors.Reason_Disc)}
                    helperText={errors.Reason_Disc ? errors.Reason_Disc.message : ''}
                  >
                    <MenuItem value={'01'}>01</MenuItem>
                    <MenuItem value={'02'}>02</MenuItem>
                    <MenuItem value={'03'}>03</MenuItem>
                    <MenuItem value={'04'}>04</MenuItem>
                    <MenuItem value={'05'}>05</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    select
                    fullWidth
                    label='PL Indicator'
                    {...register('PL_Indicator', { required: 'PL Indicator is required' })}
                    error={Boolean(errors.PL_Indicator)}
                    helperText={errors.PL_Indicator ? errors.PL_Indicator.message : ''}
                  >
                    <MenuItem value={'01'}>01</MenuItem>
                    <MenuItem value={'02'}>02</MenuItem>
                    <MenuItem value={'03'}>03</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Payment Overdue'
                    {...register('Payment_Overdue')}
                    error={Boolean(errors.Payment_Overdue)}
                    helperText={errors.Payment_Overdue ? errors.Payment_Overdue.message : ''}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value=''>
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value={'X'}>X</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    select
                    fullWidth
                    label='SAS Deposit'
                    {...register('SAS_Deposit')}
                    error={Boolean(errors.SAS_Deposit)}
                    helperText={errors.SAS_Deposit ? errors.SAS_Deposit.message : ''}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value=''>
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value={'X'}>X</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    fullWidth
                    type='number'
                    label='Rotation Cycles'
                    {...register('Rotation_Cycles', {
                      validate: value => !isNaN(value) || 'Rotation Cycles must be a valid number',
                      pattern: {
                        value: /^\d{1,4}(\.\d{2})$/,
                        message:
                          'Rotation Cycles must have up to 4 digits before the decimal and up to 2 digits after the decimal'
                      }
                    })}
                    error={Boolean(errors.Rotation_Cycles)}
                    helperText={errors.Rotation_Cycles ? errors.Rotation_Cycles.message : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    fullWidth
                    label='Ref SAS'
                    {...register('Ref_SAS')}
                    error={Boolean(errors.Ref_SAS)}
                    helperText={errors.Ref_SAS ? errors.Ref_SAS.message : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    fullWidth
                    label='Ref Historic'
                    {...register('Ref_Historic')}
                    error={Boolean(errors.Ref_Historic)}
                    helperText={errors.Ref_Historic ? errors.Ref_Historic.message : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    fullWidth
                    type='number'
                    label='Max Rotation'
                    {...register('Max_Rotation', {
                      validate: value => !isNaN(value) || 'Max Rotation must be a valid number',
                      pattern: {
                        value: /^\d{1,4}(\.\d{2})$/,
                        message:
                          'Max Rotation must have up to 4 digits before the decimal and up to 2 digits after the decimal'
                      }
                    })}
                    error={Boolean(errors.Max_Rotation)}
                    helperText={errors.Max_Rotation ? errors.Max_Rotation.message : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    fullWidth
                    type='number'
                    label='History_Volume'
                    {...register('History_Volume', {
                      validate: value => !isNaN(value) || 'History_Volume must be a valid number',
                      pattern: {
                        value: /^\d{1,4}(\.\d{2})$/,
                        message:
                          'History Volume must have up to 4 digits before the decimal and up to 2 digits after the decimal'
                      }
                    })}
                    error={Boolean(errors.History_Volume)}
                    helperText={errors.History_Volume ? errors.History_Volume.message : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Release Status'
                    {...register('Release_Status')}
                    error={Boolean(errors.Release_Status)}
                    helperText={errors.Release_Status ? errors.Release_Status.message : ''}
                    SelectProps={{ displayEmpty: true }}
                    defaultValue=''
                  >
                    <MenuItem value=''>Released</MenuItem>
                    <MenuItem value={'Blocked'}>Blocked</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Update_Indicator'
                    {...register('Update_Indicator')}
                    error={Boolean(errors.Update_Indicator)}
                    helperText={errors.Update_Indicator ? errors.Update_Indicator.message : ''}
                    disabled={true}
                  >
                    <MenuItem value='I'>I</MenuItem>
                    <MenuItem value='D'>D</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Typography variant='h5'>Eligiblity</Typography>
                </Grid>
                <Grid item xs={12}>
                  <h3>E1</h3>
                </Grid>
                {E1Fields.map((field, index) => (
                  <Grid item container columnSpacing={4} rowSpacing={6} key={field.id}>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Sales Org'
                        {...register(`E.E1.${index}.Sales_Org`, { required: 'Sales Org is required' })}
                        error={Boolean(errors.E?.E1?.[index]?.Sales_Org)}
                        helperText={errors.E?.E1?.[index]?.Sales_Org?.message}
                      >
                        <MenuItem value='1000'>1000-J.K.Tyre & Ind. Ltd</MenuItem>
                        <MenuItem value='2000'>2000-Cavendish Ind.Ltd</MenuItem>
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Distribution Channel'
                        {...register(`E.E1.${index}.Distribution_Channel`, {
                          required: 'Distribution Channel is required'
                        })}
                        error={Boolean(errors.E?.E1?.[index]?.Distribution_Channel)}
                        helperText={errors.E?.E1?.[index]?.Distribution_Channel?.message}
                      >
                        <MenuItem value='10'>10-Replacement Sales</MenuItem>
                        <MenuItem value='20'>20-OEM Sales</MenuItem>
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Division'
                        {...register(`E.E1.${index}.Division`, { required: 'Division is required' })}
                        error={Boolean(errors.E?.E1?.[index]?.Division)}
                        helperText={errors.E?.E1?.[index]?.Division?.message}
                      >
                        <MenuItem value='10'>10-Non Truck Division</MenuItem>
                        <MenuItem value='20'>20-Truck Division</MenuItem>
                        <MenuItem value='30'>30-OTR</MenuItem>
                        <MenuItem value='40'>40-RETREAD DIV</MenuItem>
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Update Indicator'
                        {...register(`E.E1.${index}.Update_Indicator`)}
                        error={Boolean(errors.E?.E1?.[index]?.Update_Indicator)}
                        helperText={errors.E?.E1?.[index]?.Update_Indicator?.message}
                        disabled
                      >
                        <MenuItem value='I'>I</MenuItem>
                        <MenuItem value='D'>D</MenuItem>
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        fullWidth
                        label='UI Record Ref'
                        defaultValue={`E1R${index + 1}`}
                        {...register(`E.E1.${index}.UI_record_ref`)}
                        error={Boolean(errors.E?.E1?.[index]?.UI_record_ref)}
                        helperText={errors.E?.E1?.[index]?.UI_record_ref?.message}
                      />
                    </Grid>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button
                    variant='contained'
                    onClick={() =>
                      appendE1({
                        Sales_Org: '',
                        Distribution_Channel: '',
                        Division: '',
                        Update_Indicator: '',
                        UI_record_ref: `E1R${E1Fields.length + 1}`
                      })
                    }
                  >
                    Add E1
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <h3>E2</h3>
                </Grid>
                {E2Fields.map((field, index) => (
                  <Grid item container columnSpacing={4} rowSpacing={6} key={field.id}>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Account Group'
                        {...register(`E.E2.${index}.Account_Group`, { required: 'Account Group is required' })}
                        error={Boolean(errors.E?.E2?.[index]?.Account_Group)}
                        helperText={errors.E?.E2?.[index]?.Account_Group?.message}
                      >
                        <MenuItem value='Z001'>Z001-Dealer</MenuItem>
                        <MenuItem value='Z002'>Z002-DG S&D</MenuItem>
                        <MenuItem value='Z003'>Z003-Exports</MenuItem>
                        <MenuItem value='Z004'>Z004-Institutional</MenuItem>
                        <MenuItem value='Z005'>Z005-STU</MenuItem>
                        <MenuItem value='Z006'>Z006-Government</MenuItem>
                        <MenuItem value='Z007'>Z007-OEM</MenuItem>
                        <MenuItem value='Z008'>Z008-Defense</MenuItem>
                        <MenuItem value='Z009'>Z009-Fleet A/C</MenuItem>
                        <MenuItem value='Z015'>Z015-Auth. Retread Centre</MenuItem>
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Customer Classification'
                        {...register(`E.E2.${index}.Customer_Classification`, {
                          required: 'Customer Classification is required'
                        })}
                        error={Boolean(errors.E?.E2?.[index]?.Customer_Classification)}
                        helperText={errors.E?.E2?.[index]?.Customer_Classification?.message}
                      >
                        <MenuItem value='CH'>CH</MenuItem>
                        <MenuItem value='DB'>DB</MenuItem>
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Region'
                        {...register(`E.E2.${index}.Region`, { required: 'Region is required' })}
                        error={Boolean(errors.E?.E2?.[index]?.Region)}
                        helperText={errors.E?.E2?.[index]?.Region?.message}
                      >
                        <MenuItem value='AGRA'>AGRA</MenuItem>
                        <MenuItem value='DELHI'>DELHI</MenuItem>
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Sales Office'
                        {...register(`E.E2.${index}.Sales_Office`, { required: 'Sales Office is required' })}
                        error={Boolean(errors.E?.E2?.[index]?.Sales_Office)}
                        helperText={errors.E?.E2?.[index]?.Sales_Office?.message}
                      >
                        <MenuItem value='1200'>1200</MenuItem>
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name={`E.E2.${index}.Customer`}
                        control={control}
                        rules={{ required: 'Customer is required' }}
                        render={({ field }) => (
                          <CustomAutocomplete
                            {...field}
                            options={customerOptions}
                            getOptionLabel={option => option.label || ''}
                            value={customerOptions.find(option => option.value === field.value) || null}
                            onChange={(event, value) => field.onChange(value?.value)}
                            renderInput={params => (
                              <CustomTextField
                                {...params}
                                label='Customer'
                                error={Boolean(errors.E?.E2?.[index]?.Customer)}
                                helperText={errors.E?.E2?.[index]?.Customer?.message}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Update Indicator'
                        {...register(`E.E2.${index}.Update_Indicator`)}
                        error={Boolean(errors.E?.E2?.[index]?.Update_Indicator)}
                        helperText={errors.E?.E2?.[index]?.Update_Indicator?.message}
                        disabled
                      >
                        <MenuItem value='I'>I</MenuItem>
                        <MenuItem value='D'>D</MenuItem>
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        fullWidth
                        label='UI Record Ref'
                        {...register(`E.E2.${index}.UI_record_ref`, { required: 'UI Record Ref is required' })}
                        error={Boolean(errors.E?.E2?.[index]?.UI_record_ref)}
                        helperText={errors.E?.E2?.[index]?.UI_record_ref?.message}
                      />
                    </Grid>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button
                    variant='contained'
                    onClick={() =>
                      appendE2({
                        Account_Group: '',
                        Customer_Classification: '',
                        Region: '',
                        Sales_Office: '',
                        Customer: '',
                        Update_Indicator: '',
                        UI_record_ref: `E2R${E2Fields.length + 1}`
                      })
                    }
                  >
                    Add E2
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <h3>E3</h3>
                </Grid>
                {E3Fields.map((field, index) => (
                  <Grid item container columnSpacing={4} rowSpacing={6} key={field.id}>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Account Group'
                        {...register(`E.E3.${index}.Account_Group`, { required: 'Account Group is required' })}
                        error={Boolean(errors.E?.E3?.[index]?.Account_Group)}
                        helperText={errors.E?.E3?.[index]?.Account_Group?.message}
                      >
                        <MenuItem value='Z001'>Z001-Dealer</MenuItem>
                        <MenuItem value='Z002'>Z002-DG S&D</MenuItem>
                        <MenuItem value='Z003'>Z003-Exports</MenuItem>
                        <MenuItem value='Z004'>Z004-Institutional</MenuItem>
                        <MenuItem value='Z005'>Z005-STU</MenuItem>
                        <MenuItem value='Z006'>Z006-Government</MenuItem>
                        <MenuItem value='Z007'>Z007-OEM</MenuItem>
                        <MenuItem value='Z008'>Z008-Defense</MenuItem>
                        <MenuItem value='Z009'>Z009-Fleet A/C</MenuItem>
                        <MenuItem value='Z015'>Z015-Auth. Retread Centre</MenuItem>
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Region'
                        {...register(`E.E3.${index}.Region`, { required: 'Region is required' })}
                        error={Boolean(errors.E?.E3?.[index]?.Region)}
                        helperText={errors.E?.E3?.[index]?.Region?.message}
                      >
                        <MenuItem value='AGRA'>AGRA</MenuItem>
                        <MenuItem value='DELHI'>DELHI</MenuItem>
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Sales Office'
                        {...register(`E.E3.${index}.Sales_Office`, { required: 'Sales Office is required' })}
                        error={Boolean(errors.E?.E3?.[index]?.Sales_Office)}
                        helperText={errors.E?.E3?.[index]?.Sales_Office?.message}
                      >
                        <MenuItem value='1200'>1200</MenuItem>
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Update Indicator'
                        {...register(`E.E3.${index}.Update_Indicator`)}
                        error={Boolean(errors.E?.E3?.[index]?.Update_Indicator)}
                        helperText={errors.E?.E3?.[index]?.Update_Indicator?.message}
                        disabled
                      >
                        <MenuItem value='I'>I</MenuItem>
                        <MenuItem value='D'>D</MenuItem>
                      </CustomTextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        fullWidth
                        label='UI Record Ref'
                        {...register(`E.E3.${index}.UI_record_ref`, { required: 'UI Record Ref is required' })}
                        error={Boolean(errors.E?.E3?.[index]?.UI_record_ref)}
                        helperText={errors.E?.E3?.[index]?.UI_record_ref?.message}
                      />
                    </Grid>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button
                    variant='contained'
                    onClick={() =>
                      appendE3({
                        Account_Group: '',
                        Region: '',
                        Sales_Office: '',
                        Update_Indicator: '',
                        UI_record_ref: `E3R${E3Fields.length + 1}`
                      })
                    }
                  >
                    Add E3
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
          <Grid sx={{ mt: 3 }} container justifyContent='center'>
            <Button type='submit' sx={{ mr: 2 }} variant='contained'>
              Submit
            </Button>
            <Button variant='outlined' onClick={() => router.back()}>
              Back
            </Button>
          </Grid>
        </CardContent>
      </form>
    </Card>
  )
}

export default CreateScheme
