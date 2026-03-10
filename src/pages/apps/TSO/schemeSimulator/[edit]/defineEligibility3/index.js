import { Box, Drawer, FormControlLabel, OutlinedInput, Radio, Select, Typography } from '@mui/material'
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
import { useEffect, useState } from 'react'
import PlacesDrawer from './placesDrawer'
import ProductSubCategoryDrawer from './productSubCategoryDrawer'
import SKUDrawer from './SKUDrawer'
import Customers from './customersDrawer'

const defaultValues = {
  company: ['JK'],
  channel: ['Replacement Sales'],
  coverage: ['NZ'],
  productCategory: 'Truck',
  customerGroup: ['Z001'],
  productRunOn: 'Brand',
  includeCustomerClass: ['NA'],
  excludeCustomerClass: ['1111577'],
  productSubCategory: ['11'],
  excludeSku: ['1111110020016J1030', '1111110020016J1060']
}

const allProductCategory = [
  { value: '11', label: 'TRUCK BIAS' },
  { value: '12', label: 'TRUCK RADIAL' },
  { value: '21', label: 'LCV BIAS' },
  { value: '22', label: 'LCV RADIAL' },
  { value: '31', label: 'CAR BIAS' },
  { value: '32', label: 'CAR RADIAL' },
  { value: '41', label: 'JEEP BIAS' },
  { value: '42', label: 'JEEP RADIAL' },
  { value: '51', label: 'TRACTOR REAR BIAS' },
  { value: '52', label: 'TRACTOR REAR RADIAL' },
  { value: '61', label: 'TRACTOR FRONT BIAS' },
  { value: '71', label: 'TRACTOR TRAILOR BIAS' },
  { value: '91', label: 'ADV BIAS' },
  { value: 'B1', label: 'MOTORCYCLE BIAS' },
  { value: 'D1', label: 'SCV BIAS' },
  { value: 'D2', label: 'SCV RADIAL' },
  { value: 'H1', label: '3 WHEELER BIAS' },
  { value: 'S1', label: 'SCOOTER BIAS' },
  { value: 'R0', label: 'TREEL' },
  { value: 'F1', label: 'KARTING TYRES' },
  { value: '11', label: 'TRUCK BIAS' },
  { value: '12', label: 'TRUCK RADIAL' },
  { value: '81', label: 'OTR BIAS' },
  { value: 'E1', label: 'OTR BIAS' },
  { value: 'G1', label: 'OTR BIAS' },
  { value: 'E2', label: 'OTR RADIAL' },
  { value: '82', label: 'OTR RADIAL' },
  { value: '11', label: 'TRUCK BIAS' },
  { value: '12', label: 'TRUCK RADIAL' },
  { value: '21', label: 'LCV BIAS' },
  { value: '22', label: 'LCV RADIAL' },
  { value: '31', label: 'CAR BIAS' },
  { value: '32', label: 'CAR RADIAL' },
  { value: '41', label: 'JEEP BIAS' },
  { value: '42', label: 'JEEP RADIAL' },
  { value: '51', label: 'TRACTOR REAR BIAS' },
  { value: '52', label: 'TRACTOR REAR RADIAL' },
  { value: '61', label: 'TRACTOR FRONT BIAS' },
  { value: '71', label: 'TRACTOR TRAILOR BIAS' },
  { value: '81', label: 'OTR BIAS' },
  { value: '91', label: 'ADV BIAS' },
  { value: 'B1', label: 'MOTORCYCLE BIAS' },
  { value: 'D1', label: 'SCV BIAS' },
  { value: 'D2', label: 'SCV RADIAL' },
  { value: 'H1', label: '3 WHEELER BIAS' },
  { value: 'S1', label: 'SCOOTER BIAS' },
  { value: 'R0', label: 'TREEL' },
  { value: 'E1', label: 'OTR BIAS' },
  { value: 'G1', label: 'OTR BIAS' },
  { value: 'F1', label: 'KARTING TYRES' },
  { value: 'E2', label: 'OTR RADIAL' },
  { value: '82', label: 'OTR RADIAL' }
]

const companyItems = ['JK', 'CIL']
const channelItems = ['Replacement Sales', 'OEM']

const customerTypeOptions = [
  { value: 'Non truck', label: 'Non truck' },
  { value: 'Truck', label: 'Truck' },
  { value: 'FLEET MANAGEMENT', label: 'FLEET MANAGEMENT' },
  { value: 'Mobility', label: 'Mobility' },
  { value: 'Farm Xpress Wheel', label: 'Farm Xpress Wheel' },
  { value: 'Steel wheels', label: 'Steel wheels' },
  { value: 'Xpress Wheels', label: 'Xpress Wheels' },
  { value: 'Truck wheels', label: 'Truck wheels' },
  { value: 'Pref.Trade Partner', label: 'Pref.Trade Partner' },
  { value: 'MBO', label: 'MBO' },
  { value: 'OTR', label: 'OTR' },
  { value: 'Rural Distribution', label: 'Rural Distribution' },
  { value: 'Non SAS Account', label: 'Non SAS Account' },
  { value: 'Employee', label: 'Employee' }
]

export const customerAccountGroupList = [
  { value: 'Z001', label: 'Dealer' },
  { value: 'Z002', label: 'DG S&D' },
  { value: 'Z003', label: 'Exports' },
  { value: 'Z004', label: 'Institutional' },
  { value: 'Z005', label: 'STU' },
  { value: 'Z006', label: 'Government' },
  { value: 'Z007', label: 'OEM' },
  { value: 'Z008', label: 'Defense' },
  { value: 'Z009', label: 'Fleet A/C' },
  { value: 'Z015', label: 'Auth. Retread Centre' }
]

export const dealerCustomerGroupTruckList = [
  { value: 'NA', label: 'Non SAS Account' },
  { value: 'TP', label: 'Pref.Trade Partner' },
  { value: 'FW', label: 'Farm Xpress Wheel' },
  { value: 'SW', label: 'Steel wheels' },
  { value: 'TW', label: 'Truck wheels' },
  { value: 'XW', label: 'Xpress Wheels' },
  { value: 'IC', label: 'Indian Oil-Comb' },
  { value: 'IN', label: 'Indian Oil-NT' },
  { value: 'IO', label: 'IOCL- Not in use' },
  { value: 'IP', label: 'INDIAN OIL-PTP' },
  { value: 'IS', label: 'INDIAN OIL-SW' },
  { value: 'IT', label: 'Indian Oil-TR' },
  { value: 'EC', label: 'ESSAR Oil-Comb' },
  { value: 'EN', label: 'ESSAR Oil-NT' },
  { value: 'EP', label: 'ESSAR OIL-PTP' },
  { value: 'ES', label: 'ESSAR OIL-SW' },
  { value: 'ET', label: 'ESSAR Oil-TR' },
  { value: 'HN', label: 'HPCL-NT' },
  { value: 'HP', label: 'HPCL-PTP' },
  { value: 'HS', label: 'HPCL-SW' },
  { value: 'HT', label: 'HPCL-TR' },
  { value: 'CO', label: 'Common' }
]
export const dealerCustomerGroupOtrList = [{ value: 'OT', label: 'OTR' }]

export const fleetCustomerGroupList = [
  { value: 'FM', label: 'FLEET MANAGEMENT' },
  { value: 'MB', label: 'Mobility' },
  { value: 'WV', label: 'Waves account' }
]

export const institutionalCustomerGroupList = [
  { value: 'OT', label: 'OTR' },
  { value: 'RD', label: 'Rural Distribution' },
  { value: 'DB', label: 'DISTRIBUTOR' },
  { value: 'WV', label: 'Waves account' },
  { value: 'CO', label: 'Common' },
  { value: 'GM', label: 'General Motors' },
  { value: 'HD', label: 'HONDA' },
  { value: 'HY', label: 'HYUNDAI' },
  { value: 'MS', label: 'Maruti Suzuki' },
  { value: 'NS', label: 'NISSAN' },
  { value: 'RN', label: 'RENAULT' },
  { value: 'TO', label: 'TOYATA' },
  { value: 'OD', label: 'OEM-FRAN DISTRIBUTOR' }
]

export const oemCustomerGroupList = [{ value: 'OD', label: 'OEM-FRAN DISTRIBUTOR' }]

export const retreadCustomerClassList = [{ value: 'RT', label: 'Retrade' }]

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

const DefineEligibility = ({ setEligibilityData, setExpanded }) => {
  console.log('defaulValues', defaultValues)
  const {
    handleSubmit,
    control,
    watch,
    getValues,
    setValues,
    formState: { errors }
  } = useForm({ defaultValues })

  const [placesDrawerOpen, setplacesDrawerOpen] = useState(false)
  const [productSubCategoryDrawerOpen, setProductSubCategoryDrawerOpen] = useState(false)
  const [popupData, setPopupData] = useState(null)
  const [selectedOption, setSelectedOption] = useState()
  const [places, setPlaces] = useState([])
  const [productSubCategory, setProductSubCategory] = useState([
    allProductCategory.find(el => el.value === defaultValues?.productSubCategory)
  ])
  const [selectedSKU, setSelectedSKU] = useState(defaultValues?.excludeSku)
  const [SKUDrawerOpen, setSKUDrawerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(defaultValues?.excludeCustomerClass)
  const [customersDrawerOpen, setCustomersDrawerOpen] = useState(false)
  const [customerClass, setCustomerClass] = useState(defaultValues?.includeCustomerClass)

  const togglePlacesDrawer = () => setplacesDrawerOpen(!placesDrawerOpen)
  const toggleProductSubCategoryDrawer = () => setProductSubCategoryDrawerOpen(!productSubCategoryDrawerOpen)
  const toggleSKUDrawer = () => setSKUDrawerOpen(!SKUDrawerOpen)
  const toggleCustomerDrawer = () => setCustomersDrawerOpen(!customersDrawerOpen)

  const onSubmit = async data => {
    data.coverage = data.coverage != 'Pan India' ? places.map(el => el.value) : data.coverage
    data.productSubCategory = productSubCategory.map(el => el.value)
    data.excludeSku = selectedSKU.map(el => el.value)
    // data.excludedCustomers = selectedCustomer.map(el => el.value)

    data.customerGroup = data.customerGroup.map(el => el.value)

    if (data.excludeCustomerClass) {
      data.excludeCustomerClass = selectedCustomer.map(el => el.value)
    }
    if (data.includeCustomerClass) {
      data.includeCustomerClass = data.includeCustomerClass.map(el => el.value)
    }
    console.log('data', data)

    setEligibilityData(data)
    setExpanded(false)
  }

  const customerGroupValue = useWatch({
    control,
    name: 'customerGroup'
  })

  const includeCustomerClassValue = useWatch({
    control,
    name: 'includeCustomerClass'
  })

  useEffect(() => {
    const combinedCustomerClass = []

    if (customerGroupValue?.some(el => el.value == 'Z001')) {
      combinedCustomerClass.push(...dealerCustomerGroupTruckList)
    }
    if (customerGroupValue?.some(el => el.value == 'Z004')) {
      combinedCustomerClass.push(...institutionalCustomerGroupList)
    }
    if (customerGroupValue?.some(el => el.value == 'Z009')) {
      combinedCustomerClass.push(...fleetCustomerGroupList)
    }
    if (customerGroupValue?.some(el => el.value == 'Z007')) {
      combinedCustomerClass.push(...oemCustomerGroupList)
    }
    if (customerGroupValue?.some(el => el.value == 'Z015')) {
      combinedCustomerClass.push(...retreadCustomerClassList)
    }

    setCustomerClass(combinedCustomerClass)
  }, [customerGroupValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Grid container columnSpacing={3} rowSpacing={3}>
        <Grid item xs={12} sm={3}>
          <Typography variant='body2'>1. Select Company</Typography>
          <Controller
            name='company'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <Select
                size='small'
                defaultValue={[]}
                displayEmpty
                error={Boolean(errors.company)}
                sx={{ width: 300 }}
                id='select-multiple-checkbox'
                multiple
                value={value}
                onChange={onChange}
                renderValue={selected => {
                  if (selected.length === 0) {
                    return 'Please select Company'
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
                  Please select Company
                </MenuItem>
                {companyItems.map(type => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={value?.indexOf(type) > -1} />
                    <ListItemText primary={type} />
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.company && (
            <Typography variant='body2' color='error'>
              company is required
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography variant='body2'>2. Select Channel</Typography>
          <Controller
            name='channel'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <Select
                size='small'
                defaultValue={[]}
                displayEmpty
                error={Boolean(errors.company)}
                sx={{ width: 300 }}
                id='select-multiple-checkbox'
                multiple
                value={value}
                onChange={onChange}
                renderValue={selected => {
                  if (selected.length === 0) {
                    return 'Please select Channel'
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
                  Please select Channel
                </MenuItem>
                {channelItems.map(type => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={value?.indexOf(type) > -1} />
                    <ListItemText primary={type} />
                  </MenuItem>
                ))}
              </Select>
            )}
          />

          {errors.channel && (
            <Typography variant='body2' color='error'>
              Channel is required
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant='body2'>3. Define Scheme Coverage</Typography>
          <Controller
            name='coverage'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                sx={{ width: 300 }}
                size='small'
                displayEmpty
                defaultValue=''
                value={value}
                onChange={e => {
                  onChange(e.target.value)
                  if (e.target.value != 'Pan India') {
                    setSelectedOption(e.target.value)
                    setPlaces([])
                  }
                }}
                error={Boolean(errors.coverage)}
                renderValue={selected => {
                  if (selected.length === 0) {
                    return 'Please Define Scheme Coverage'
                  }
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                      <CustomChip rounded label={selected} skin='light' color='primary' />
                    </Box>
                  )
                }}
              >
                <MenuItem value='' disabled sx={{ display: 'none' }}>
                  Please Define Scheme Coverage
                </MenuItem>
                {['Pan India', 'Zone', 'Region', 'Depot', 'Customer'].map(option => (
                  <MenuItem key={option} value={option}>
                    <FormControlLabel control={<Radio checked={value === option} />} label={option} value={option} />
                  </MenuItem>
                ))}
              </Select>
            )}
          />

          {errors.coverage && (
            <Typography variant='body2' color='error'>
              Scheme Coverage is required
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={9}>
          {selectedOption && (
            <>
              <Typography variant='body2'>3.1 Select Scheme Coverage</Typography>

              <Select
                sx={{ width: 300 }}
                size='small'
                displayEmpty
                defaultValue=''
                inputProps={{ readOnly: true }}
                onClick={() => setplacesDrawerOpen(true)}
                // error={places.length === 0}
                renderValue={selected => {
                  if (selectedOption === 'Pan India')
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <CustomChip rounded label={selectedOption} skin='light' color='primary' />
                      </Box>
                    )
                  else {
                    if (places.length > 3) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={places[0].label} skin='light' color='primary' />
                          <CustomChip rounded label={places[1].label} skin='light' color='primary' />
                          <CustomChip rounded label={`${places.length - 2} more...`} skin='light' color='primary' />
                        </Box>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {places.map((item, i) => (
                            <CustomChip key={i} rounded label={item.label} skin='light' color='primary' />
                          ))}
                        </Box>
                      )
                    }
                  }
                }}
              ></Select>
            </>
          )}
          {/* {errors.coverage && (
            <Typography variant='body2' color='error'>
              Scheme Coverage is required
            </Typography>
          )} */}
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant='body2'>4. Select Product Category</Typography>
          <Controller
            name='productCategory'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                sx={{ width: 300 }}
                size='small'
                displayEmpty
                defaultValue=''
                value={value}
                onChange={e => {
                  onChange(e.target.value)
                  setProductSubCategory([])
                }}
                error={Boolean(errors.productCategory)}
                renderValue={selected => {
                  if (selected.length === 0) {
                    return 'Please Select Product Category'
                  }
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                      <CustomChip rounded label={selected} skin='light' color='primary' />
                    </Box>
                  )
                }}
              >
                <MenuItem value='' disabled sx={{ display: 'none' }}>
                  Please Select Product Category
                </MenuItem>
                {['Non Truck', 'Truck', 'OC10', 'OTR', 'Retread'].map(option => (
                  <MenuItem key={option} value={option}>
                    <FormControlLabel control={<Radio checked={value === option} />} label={option} value={option} />
                  </MenuItem>
                ))}
              </Select>
            )}
          />

          {errors.productCategory && (
            <Typography variant='body2' color='error'>
              Product is required
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={3}>
          {watch('productCategory', false) != '' && (
            <>
              <Typography variant='body2'>4.1 Select Product Sub Category</Typography>
              <Select
                sx={{ width: 300 }}
                size='small'
                displayEmpty
                defaultValue=''
                inputProps={{ readOnly: true }}
                onClick={() => setProductSubCategoryDrawerOpen(true)}
                // error={places.length === 0}
                renderValue={selected => {
                  if (productSubCategory.length === 30) {
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <CustomChip rounded label={'All Sub Category'} skin='light' color='primary' />
                      </Box>
                    )
                  } else {
                    if (productSubCategory.length > 3) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={productSubCategory[0].label} skin='light' color='primary' />
                          <CustomChip rounded label={productSubCategory[1].label} skin='light' color='primary' />
                          <CustomChip
                            rounded
                            label={`${productSubCategory.length - 2} more...`}
                            skin='light'
                            color='primary'
                          />
                        </Box>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {productSubCategory.map((item, i) => (
                            <CustomChip key={i} rounded label={item?.label} skin='light' color='primary' />
                          ))}
                        </Box>
                      )
                    }
                  }
                }}
              ></Select>
            </>
          )}
        </Grid>
        {productSubCategory.length > 0 && (
          <Grid item xs={12} sm={3}>
            <Typography variant='body2'>4.2. Scheme to be run on</Typography>
            <Controller
              name='productRunOn'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <Select
                  sx={{ width: 300 }}
                  size='small'
                  displayEmpty
                  defaultValue=''
                  value={value}
                  onChange={e => {
                    onChange(e.target.value)
                  }}
                  error={Boolean(errors.productRunOn)}
                  renderValue={selected => {
                    if (selected.length === 0) {
                      return 'Please select from Brand/Tyre/Rim Size '
                    }
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        <CustomChip rounded label={selected} skin='light' color='primary' />
                      </Box>
                    )
                  }}
                >
                  <MenuItem value='' disabled sx={{ display: 'none' }}>
                    Please select from Brand/Tyre/Rim Size
                  </MenuItem>
                  {['Brand', 'Sub Brand', 'Tyre Size', 'Rim Size'].map(option => (
                    <MenuItem key={option} value={option}>
                      <FormControlLabel control={<Radio checked={value === option} />} label={option} value={option} />
                    </MenuItem>
                  ))}
                </Select>
              )}
            />

            {errors.productRunOn && (
              <Typography variant='body2' color='error'>
                Schemes Run is required
              </Typography>
            )}
          </Grid>
        )}

        <Grid item xs={12} sm={12}>
          {watch('productRunOn', false) != '' && (
            <>
              <Typography variant='body2'>4.3. Exclude SKUs</Typography>
              <Select
                sx={{ minWidth: 300 }}
                // fullWidth

                size='small'
                displayEmpty
                defaultValue=''
                inputProps={{ readOnly: true }}
                onClick={() => setSKUDrawerOpen(true)}
                // error={places.length === 0}
                renderValue={selected => {
                  if (selectedSKU.length === 30) {
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <CustomChip rounded label={'All SKU'} skin='light' color='primary' />
                      </Box>
                    )
                  } else {
                    if (selectedSKU.length > 5) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={selectedSKU[0].label} skin='light' color='primary' />
                          <CustomChip rounded label={selectedSKU[1].label} skin='light' color='primary' />
                          <CustomChip rounded label={selectedSKU[2].label} skin='light' color='primary' />
                          <CustomChip rounded label={selectedSKU[3].label} skin='light' color='primary' />
                          <CustomChip
                            rounded
                            label={`${selectedSKU.length - 4} more...`}
                            skin='light'
                            color='primary'
                          />
                        </Box>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {selectedSKU.map((item, i) => (
                            <CustomChip key={i} rounded label={item?.label} skin='light' color='primary' />
                          ))}
                        </Box>
                      )
                    }
                  }
                }}
              ></Select>
            </>
          )}
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant='body2'>5. Select Customer Group</Typography>
          <Controller
            name='customerGroup'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                size='small'
                defaultValue={[]}
                displayEmpty
                error={Boolean(errors.customerGroup)}
                sx={{ width: 300 }}
                id='select-multiple-checkbox'
                multiple
                value={value}
                onChange={onChange}
                renderValue={selected => {
                  if (selected.length === 0) {
                    return 'Please select Customer Group'
                  } else {
                    if (selected.length > 3) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={selected[0].label} skin='light' color='primary' />
                          <CustomChip rounded label={selected[1].label} skin='light' color='primary' />
                          <CustomChip rounded label={`${selected.length - 2} more...`} skin='light' color='primary' />
                        </Box>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {selected.map((item, i) => (
                            <CustomChip key={i} rounded label={item.label} skin='light' color='primary' />
                          ))}
                        </Box>
                      )
                    }
                  }
                }}
                MenuProps={MenuProps}
              >
                <MenuItem value='' disabled sx={{ display: 'none' }}>
                  Please select Customer Group
                </MenuItem>
                {customerAccountGroupList.map(type => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={value?.some(item => item.value === type.value)} />
                    <ListItemText primary={type.label} />
                  </MenuItem>
                ))}
              </Select>
            )}
          />

          {errors.customerGroup && (
            <Typography variant='body2' color='error'>
              Customer Group is required
            </Typography>
          )}
        </Grid>
        {customerGroupValue?.some(
          el =>
            el.value === 'Z001' ||
            el.value === 'Z003' ||
            el.value === 'Z004' ||
            el.value === 'Z007' ||
            el.value === 'Z009' ||
            el.value === 'Z0015'
        ) && (
          <Grid item xs={12} sm={3}>
            <Typography variant='body2'>5.1 Select Customer Class</Typography>
            <Controller
              name='includeCustomerClass'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select
                  size='small'
                  defaultValue={[]}
                  displayEmpty
                  error={Boolean(errors.includeCustomerClass)}
                  sx={{ width: 300 }}
                  id='select-multiple-checkbox'
                  multiple
                  value={value}
                  onChange={onChange}
                  renderValue={selected => {
                    if (selected.length === 0) {
                      return 'Please select Customer Class'
                    }
                    if (selected.length === 14) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={'All Customer Class'} skin='light' color='primary' />
                        </Box>
                      )
                    } else {
                      if (selected.length > 3) {
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <CustomChip rounded label={selected[0].label} skin='light' color='primary' />
                            <CustomChip rounded label={selected[1].label} skin='light' color='primary' />
                            <CustomChip rounded label={`${selected.length - 2} more...`} skin='light' color='primary' />
                          </Box>
                        )
                      } else {
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {selected.map((item, i) => (
                              <CustomChip key={i} rounded label={item.label} skin='light' color='primary' />
                            ))}
                          </Box>
                        )
                      }
                    }
                  }}
                  MenuProps={MenuProps}
                >
                  <MenuItem value='' disabled sx={{ display: 'none' }}>
                    Please select Customer Class
                  </MenuItem>
                  {customerClass.map(type => (
                    <MenuItem key={type} value={type}>
                      <Checkbox checked={value?.some(item => item.value === type.value)} />
                      <ListItemText primary={type.label} />
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.includeCustomerClass && (
              <Typography variant='body2' color='error'>
                Customer Type is required
              </Typography>
            )}
          </Grid>
        )}
        {customerGroupValue?.some(
          el =>
            el.value === 'Z001' ||
            el.value === 'Z003' ||
            el.value === 'Z004' ||
            el.value === 'Z007' ||
            el.value === 'Z009' ||
            el.value === 'Z0015'
        ) && (
          <Grid item xs={12} sm={3}>
            <Typography variant='body2'>5.2 Exclude Customer Class</Typography>
            <Controller
              name='excludeCustomerClass'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select
                  size='small'
                  defaultValue={[]}
                  displayEmpty
                  error={Boolean(errors.excludeCustomerClass)}
                  sx={{ width: 300 }}
                  id='select-multiple-checkbox'
                  multiple
                  value={value}
                  onChange={onChange}
                  renderValue={selected => {
                    if (selected.length === 0) {
                      return 'Please select Customer Class'
                    }
                    if (selected.length === 14) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={'All Customer Class'} skin='light' color='primary' />
                        </Box>
                      )
                    } else {
                      if (selected.length > 3) {
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <CustomChip rounded label={selected[0].label} skin='light' color='primary' />
                            <CustomChip rounded label={selected[1].label} skin='light' color='primary' />
                            <CustomChip rounded label={`${selected.length - 2} more...`} skin='light' color='primary' />
                          </Box>
                        )
                      } else {
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {selected.map((item, i) => (
                              <CustomChip key={i} rounded label={item.label} skin='light' color='primary' />
                            ))}
                          </Box>
                        )
                      }
                    }
                  }}
                  MenuProps={MenuProps}
                >
                  <MenuItem value='' disabled sx={{ display: 'none' }}>
                    Please select Customer Class
                  </MenuItem>
                  {customerClass.map(type => (
                    <MenuItem key={type} value={type}>
                      <Checkbox checked={value?.some(item => item.value === type.value)} />
                      <ListItemText primary={type.label} />
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.excludeCustomerClass && (
              <Typography variant='body2' color='error'>
                Customer Type is required
              </Typography>
            )}
          </Grid>
        )}
        <Grid item xs={12} sm={12}>
          {includeCustomerClassValue?.length > 0 && (
            <>
              <Typography variant='body2'>5.3. Exclude Customer </Typography>
              <Select
                sx={{ minWidth: 300 }}
                size='small'
                displayEmpty
                defaultValue=''
                inputProps={{ readOnly: true }}
                onClick={() => setCustomersDrawerOpen(true)}
                // error={places.length === 0}
                renderValue={selected => {
                  if (selectedCustomer.length === 30) {
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <CustomChip rounded label={'All SKU'} skin='light' color='primary' />
                      </Box>
                    )
                  } else {
                    if (selectedCustomer.length > 3) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={selectedCustomer[0].label} skin='light' color='primary' />
                          <CustomChip rounded label={selectedCustomer[1].label} skin='light' color='primary' />
                          <CustomChip
                            rounded
                            label={`${selectedCustomer.length - 2} more...`}
                            skin='light'
                            color='primary'
                          />
                        </Box>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {selectedCustomer.map((item, i) => (
                            <CustomChip key={i} rounded label={item.label} skin='light' color='primary' />
                          ))}
                        </Box>
                      )
                    }
                  }
                }}
              ></Select>
            </>
          )}
        </Grid>
      </Grid>
      <Grid sx={{ mt: 5 }} container>
        <Button type='submit' sx={{ mr: 2 }} variant='outlined'>
          Save and Continue
        </Button>
      </Grid>
      <Drawer open={placesDrawerOpen} anchor='right' variant='persistent' onClose={togglePlacesDrawer}>
        <PlacesDrawer
          toggle={togglePlacesDrawer}
          checkedItems={places}
          setCheckedItems={setPlaces}
          selectedOption={selectedOption}
        />
      </Drawer>
      <Drawer
        open={productSubCategoryDrawerOpen}
        anchor='right'
        variant='persistent'
        onClose={toggleProductSubCategoryDrawer}
      >
        <ProductSubCategoryDrawer
          toggle={toggleProductSubCategoryDrawer}
          checkedItems={productSubCategory}
          setCheckedItems={setProductSubCategory}
          selectedCategory={getValues('productCategory')}
        />
      </Drawer>
      <Drawer open={SKUDrawerOpen} anchor='right' variant='persistent' onClose={toggleSKUDrawer}>
        <SKUDrawer
          toggle={toggleSKUDrawer}
          checkedItems={selectedSKU}
          setCheckedItems={setSelectedSKU}
          selectedSubCategory={productSubCategory}
        />
      </Drawer>
      <Drawer open={customersDrawerOpen} anchor='right' variant='persistent' onClose={toggleCustomerDrawer}>
        <Customers
          toggle={toggleCustomerDrawer}
          checkedItems={selectedCustomer}
          setCheckedItems={setSelectedCustomer}
          customerGroupValue={customerGroupValue}
          includeCustomerClassValue={includeCustomerClassValue}
        />
      </Drawer>
    </form>
  )
}

export default DefineEligibility
