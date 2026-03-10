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
import { allSubCategories, depotList, regionsListData, schemeRegionList, zoneList } from 'src/utils/constants'

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

const allCustomerGroups = [
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
  { value: 'CO', label: 'Common' },
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

const customerAccountGroupList = [
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
  // { value: 'FM', label: 'FLEET MANAGEMENT' },
  // { value: 'MB', label: 'Mobility' },
  // { value: 'WV', label: 'Waves account' }
]

const dealerCustomerGroupTruckList = [
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
const dealerCustomerGroupOtrList = [{ value: 'OT', label: 'OTR' }]

const fleetCustomerGroupList = [
  { value: 'FM', label: 'FLEET MANAGEMENT' },
  { value: 'MB', label: 'Mobility' },
  { value: 'WV', label: 'Waves account' }
]

const institutionalCustomerGroupList = [
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
  { value: 'OD', label: 'OEM-FRAN DISTRIBUTOR' },
  { value: 'RT', label: 'Retrade' }
]

const oemCustomerGroupList = [{ value: 'OD', label: 'OEM-FRAN DISTRIBUTOR' }]

const retreadCustomerClassList = [{ value: 'RT', label: 'Retrade' }]

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

const defaultValues = {
  company: [],
  channel: [],
  coverage: '',
  productCategory: [],
  customerGroup: [],
  includeCustomerClass: [],
  excludedCustomerClass: [],
  productRunOn: ''
}

const DefineEligibility = ({
  setEligibilityData,
  setExpanded,
  brand,
  setBrand,
  setGroupList,
  schemeConfig,
  eligibilityData
}) => {
  const {
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    formState: { errors }
  } = useForm({ defaultValues })

  const [placesDrawerOpen, setplacesDrawerOpen] = useState(false)
  const [productSubCategoryDrawerOpen, setProductSubCategoryDrawerOpen] = useState(false)
  const [popupData, setPopupData] = useState(null)
  const [selectedOption, setSelectedOption] = useState()
  const [places, setPlaces] = useState([])
  const [productSubCategory, setProductSubCategory] = useState([])
  const [selectedSKU, setSelectedSKU] = useState([])
  const [SKUDrawerOpen, setSKUDrawerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState([])
  const [customersDrawerOpen, setCustomersDrawerOpen] = useState(false)
  const [uniqueCustomerClass, setUniqueCustomerClass] = useState([])
  const [availableIncludeOptions, setAvailableIncludeOptions] = useState([])
  const [availableExcludeOptions, setAvailableExcludeOptions] = useState([])
  const [excludedRegions, setExcludedRegions] = useState([])

  const togglePlacesDrawer = () => setplacesDrawerOpen(!placesDrawerOpen)
  const toggleProductSubCategoryDrawer = () => setProductSubCategoryDrawerOpen(!productSubCategoryDrawerOpen)
  const toggleSKUDrawer = () => setSKUDrawerOpen(!SKUDrawerOpen)
  const toggleCustomerDrawer = () => setCustomersDrawerOpen(!customersDrawerOpen)

  const onSubmit = async data => {
    data.coverage = data?.coverage != 'Pan India' ? places?.map(el => el?.value) : data?.coverage
    if (selectedOption === 'Pan India') {
      data.excludedRegions = excludedRegions?.map(el => el?.value)
    } else {
      data.selectedCoverage = places?.map(el => el?.value)
    }
    data.productSubCategory = productSubCategory?.map(el => el?.label)
    data.excludeSku = selectedSKU
    // data.excludedCustomers = selectedCustomer.map(el => el.value)

    data.customerGroup = data?.customerGroup?.map(el => el?.value)

    if (data.excludedCustomerClass) {
      data.excludedCustomerClass = data?.excludedCustomerClass?.map(el => el?.value)
      data.excludedCustomers = selectedCustomer
    }
    if (data.includeCustomerClass) {
      data.customerType = data.includeCustomerClass?.map(el => el?.value)
      data.includeCustomerClass = ''
    }

    // data.retread = data.productCategory
    console.log('submitdata', data)

    setEligibilityData(data)
    // setExpanded(false)
  }

  const isCustomerGroupIncluded = groupValues => {
    const includedValues = ['Z001', 'Z003', 'Z004', 'Z007', 'Z009', 'Z015']
    return groupValues?.some(el => includedValues.includes(el.value))
  }

  const isSpecialGroupSelected = groupValues => {
    const specialValues = ['Z002', 'Z005', 'Z006', 'Z008']
    return groupValues?.some(el => specialValues.includes(el.value))
  }

  const customerGroupValue = useWatch({
    control,
    name: 'customerGroup'
  })

  const includeCustomerClassValue = useWatch({
    control,
    name: 'includeCustomerClass'
  })

  const excludedCustomerClassValue = useWatch({
    control,
    name: 'excludedCustomerClass'
  })

  useEffect(() => {
    const combinedCustomerClass = []

    if (customerGroupValue?.some(el => el?.value == 'Z001')) {
      combinedCustomerClass.push(...dealerCustomerGroupTruckList)
    }
    if (customerGroupValue?.some(el => el?.value == 'Z004')) {
      combinedCustomerClass.push(...institutionalCustomerGroupList)
    }
    if (customerGroupValue?.some(el => el?.value == 'Z009')) {
      combinedCustomerClass.push(...fleetCustomerGroupList)
    }
    if (customerGroupValue?.some(el => el?.value == 'Z007')) {
      combinedCustomerClass.push(...oemCustomerGroupList)
    }
    if (customerGroupValue?.some(el => el?.value == 'Z015')) {
      combinedCustomerClass.push(...retreadCustomerClassList)
    }

    const uniqueCustomerClassMap = new Map()
    combinedCustomerClass.forEach(item => {
      uniqueCustomerClassMap.set(item.value, item)
    })
    const uniqueCustomerClass = Array.from(uniqueCustomerClassMap.values())
    setUniqueCustomerClass(uniqueCustomerClass)
    setValue('includeCustomerClass', [])
    setValue('excludedCustomerClass', [])
    // setCustomerClass(combinedCustomerClass)
  }, [customerGroupValue, setValue])

  useEffect(() => {
    const selectedIncludeValuesSet = new Set((includeCustomerClassValue || []).map(item => item.value))
    const selectedExcludeValuesSet = new Set((excludedCustomerClassValue || []).map(item => item.value))

    const availableInclude = uniqueCustomerClass.filter(item => !selectedExcludeValuesSet.has(item.value))
    const availableExclude = uniqueCustomerClass.filter(item => !selectedIncludeValuesSet.has(item.value))
    // console.log(uniqueCustomerClass, 'availableInclude', availableInclude, 'availableExclude', availableExclude)
    setAvailableIncludeOptions(availableInclude)
    setAvailableExcludeOptions(availableExclude)
  }, [includeCustomerClassValue, excludedCustomerClassValue, uniqueCustomerClass, customerGroupValue])

  useEffect(() => {
    console.log('eli', eligibilityData)
    setValue('company', eligibilityData?.company)
    setValue('channel', eligibilityData?.channel)
    setValue('coverage', eligibilityData?.coverage)
    setSelectedOption(eligibilityData?.coverage)
    if (eligibilityData?.coverage === 'Pan India') {
      setExcludedRegions(
        eligibilityData?.excludedRegions?.map(item => schemeRegionList?.find(el => el?.value === item))
      )
    } else if (eligibilityData?.coverage === 'Zone') {
      setPlaces(eligibilityData?.selectedCoverage?.map(item => zoneList?.find(el => el?.value === item)))
    } else if (eligibilityData?.coverage === 'Region') {
      setPlaces(eligibilityData?.selectedCoverage.map(item => regionsListData?.find(el => el?.value === item)))
    } else if (eligibilityData?.coverage === 'Depot') {
      setPlaces(eligibilityData?.selectedCoverage?.map(item => depotList?.find(el => el?.value === item)))
    }
    setValue('productCategory', eligibilityData?.productCategory)
    setProductSubCategory(
      eligibilityData?.productSubCategory?.map(item => allSubCategories?.find(el => el?.label === item))
    ),
      setValue('productRunOn', eligibilityData?.productRunOn ? eligibilityData?.productRunOn : '')
    setBrand(eligibilityData?.productRunOn)
    setSelectedSKU(eligibilityData?.excludeSku)

    setValue(
      'customerGroup',
      eligibilityData?.customerGroup?.map(item => customerAccountGroupList.find(el => el?.value === item))
    )
    setValue(
      'includeCustomerClass',
      eligibilityData?.customerType?.map(item => allCustomerGroups?.find(el => el?.value === item))
    )
    setValue(
      'excludedCustomerClass',
      eligibilityData?.excludedCustomerClass?.map(item => allCustomerGroups?.find(el => el?.value === item))
    )
    setSelectedCustomer(eligibilityData?.excludedCustomers)
    // setValue('includeCustomerClass', eligibilityData?.includeCustomerClass)
  }, [eligibilityData])

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Grid container rowGap={3} columnGap={4}>
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
                  if (selected?.length === 0) {
                    return 'Please select Company'
                  }
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {selected?.map(value => (
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
                {companyItems?.map(type => (
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
        <Grid item xs={12} sm={8}>
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
                  if (selected?.length === 0) {
                    return 'Please select Channel'
                  }
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {selected?.map(value => (
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
                {channelItems?.map(type => (
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
                    setPlaces([])
                  }
                  setSelectedOption(e.target.value)
                }}
                error={Boolean(errors.coverage)}
                renderValue={selected => {
                  if (selected?.length === 0) {
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
        <Grid item xs={12} sm={8}>
          <>
            {selectedOption && selectedOption != 'Pan India' && (
              <>
                <Typography variant='body2'>3.1 Select Scheme Coverage</Typography>
                {/* <Controller
                name='selectedCoverage'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <Select
                    sx={{ width: 300 }}
                    size='small'
                    displayEmpty
                    defaultValue=''
                    value={value}
                    // onChange={onChange}
                    inputProps={{ readOnly: true }}
                    onClick={() => setplacesDrawerOpen(true)}
                    error={Boolean(errors.selectedCoverage)}
                    renderValue={selected => {
                      if (selected === 'Pan India')
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <CustomChip rounded label={selected} skin='light' color='primary' />
                          </Box>
                        )
                      else {
                        if (selected.length > 3) {
                          return (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                              <CustomChip rounded label={selected[0].label} skin='light' color='primary' />
                              <CustomChip rounded label={selected[1].label} skin='light' color='primary' />
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
                                <CustomChip key={i} rounded label={item.label} skin='light' color='primary' />
                              ))}
                            </Box>
                          )
                        }
                      }
                    }}
                  ></Select>
                )}
              />

              {errors.selectedCoverage && (
                <Typography variant='body2' color='error'>
                  Scheme Selected Coverage is required
                </Typography>
              )} */}
                <Select
                  sx={{ width: 300 }}
                  size='small'
                  displayEmpty
                  defaultValue=''
                  inputProps={{ readOnly: true }}
                  onClick={() => setplacesDrawerOpen(true)}
                  // error={places.length === 0}
                  renderValue={selected => {
                    if (places?.length > 3) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={places[0]?.label} skin='light' color='primary' />
                          <CustomChip rounded label={places[1]?.label} skin='light' color='primary' />
                          <CustomChip rounded label={`${places?.length - 2} more...`} skin='light' color='primary' />
                        </Box>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {places?.map((item, i) => (
                            <CustomChip key={i} rounded label={item?.label} skin='light' color='primary' />
                          ))}
                        </Box>
                      )
                    }
                  }}
                ></Select>
              </>
            )}
            {selectedOption && selectedOption === 'Pan India' && (
              <>
                <Typography variant='body2'>3.1 Exclude Regions</Typography>
                <Select
                  sx={{ width: 300 }}
                  size='small'
                  displayEmpty
                  defaultValue=''
                  inputProps={{ readOnly: true }}
                  onClick={() => setplacesDrawerOpen(true)}
                  // error={places.length === 0}
                  renderValue={selected => {
                    if (excludedRegions?.length > 3) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={excludedRegions[0]?.label} skin='light' color='primary' />
                          <CustomChip rounded label={excludedRegions[1]?.label} skin='light' color='primary' />
                          <CustomChip
                            rounded
                            label={`${excludedRegions?.length - 2} more...`}
                            skin='light'
                            color='primary'
                          />
                        </Box>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {excludedRegions?.map((item, i) => (
                            <CustomChip key={i} rounded label={item?.label} skin='light' color='primary' />
                          ))}
                        </Box>
                      )
                    }
                  }}
                ></Select>
              </>
            )}
          </>

          {/* {errors.coverage && (
            <Typography variant='body2' color='error'>
              Scheme Coverage is required
            </Typography>
          )} */}
        </Grid>
        {/* {errors.coverage && (
            <Typography variant='body2' color='error'>
              Scheme Coverage is required
            </Typography>
          )} */}
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
                multiple
                value={value}
                onChange={e => {
                  onChange(e.target.value)
                  setProductSubCategory([])
                }}
                error={Boolean(errors.productCategory)}
                renderValue={selected => {
                  if (selected.length === 0) {
                    return 'Please Select Product Category'
                  } else {
                    if (selected.length > 3) {
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
                  }
                }}
              >
                <MenuItem value='' disabled sx={{ display: 'none' }}>
                  Please Select Product Category
                </MenuItem>
                {['Non Truck', 'Truck', 'OTR', 'Retread', 'JK Treel'].map(type => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={value?.indexOf(type) > -1} />
                    <ListItemText primary={type} />
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
                  if (productSubCategory?.length === 30) {
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <CustomChip rounded label={'All Sub Category'} skin='light' color='primary' />
                      </Box>
                    )
                  } else {
                    if (productSubCategory?.length > 3) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={productSubCategory[0]?.label} skin='light' color='primary' />
                          <CustomChip rounded label={productSubCategory[1]?.label} skin='light' color='primary' />
                          <CustomChip
                            rounded
                            label={`${productSubCategory?.length - 2} more...`}
                            skin='light'
                            color='primary'
                          />
                        </Box>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {productSubCategory?.map((item, i) => (
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
        {productSubCategory?.length > 0 && (
          <Grid item xs={12} sm={3}>
            <Typography variant='body2'>4.2. Scheme to be run on</Typography>
            <Controller
              name='productRunOn'
              control={control}
              rules={{ required: false }}
              render={({ field: { value, onChange, onBlur } }) => (
                <Select
                  sx={{ width: 300 }}
                  size='small'
                  displayEmpty
                  value={value}
                  onChange={e => {
                    onChange(e.target.value)
                    setBrand(e.target.value)
                  }}
                  error={Boolean(errors.productRunOn)}
                  renderValue={selected => {
                    if (selected?.length === 0) {
                      return <CustomChip rounded label={'Category'} skin='light' color='primary' />
                    }
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        <CustomChip rounded label={selected} skin='light' color='primary' />
                      </Box>
                    )
                  }}
                >
                  <MenuItem value='' sx={{ fontStyle: 'italic' }}>
                    <FormControlLabel control={<Radio checked={value === ''} />} label={'Category'} value='' />
                  </MenuItem>
                  {['Brand', 'Sub Brand', 'Tyre Size', 'Material'].map(option => (
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
                  if (selectedSKU?.length === 0) {
                    return 'Please select SKU'
                  } else {
                    if (selectedSKU?.length > 5) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={selectedSKU[0]} skin='light' color='primary' />
                          <CustomChip rounded label={selectedSKU[1]} skin='light' color='primary' />
                          <CustomChip rounded label={selectedSKU[2]} skin='light' color='primary' />
                          <CustomChip rounded label={selectedSKU[3]} skin='light' color='primary' />
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
                          {selectedSKU?.map((item, i) => (
                            <CustomChip key={i} rounded label={item} skin='light' color='primary' />
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
                  if (selected?.length === 0) {
                    return 'Please select Customer Group'
                  } else {
                    if (selected?.length > 3) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={selected[0]?.label} skin='light' color='primary' />
                          <CustomChip rounded label={selected[1]?.label} skin='light' color='primary' />
                          <CustomChip rounded label={`${selected?.length - 2} more...`} skin='light' color='primary' />
                        </Box>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {selected?.map((item, i) => (
                            <CustomChip key={i} rounded label={item?.label} skin='light' color='primary' />
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
                {customerAccountGroupList?.map(type => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={value?.some(item => item?.value === type?.value)} />
                    <ListItemText primary={type?.label} />
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
        {/* {customerGroupValue?.some(
          el =>
            el?.value === 'Z001' ||
            el?.value === 'Z003' ||
            el?.value === 'Z004' ||
            el?.value === 'Z007' ||
            el?.value === 'Z009' ||
            el?.value === 'Z015'
        ) && (
          <Grid item xs={12} sm={3}>
            <Typography variant='body2'>5.1 Select Customer Class</Typography>
            <Controller
              name='includeCustomerClass'
              control={control}
              rules={{ required: false }}
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
                    if (selected?.length === 0) {
                      return 'Please select Customer Class'
                    }
                    if (selected?.length === 14) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={'All Customer Class'} skin='light' color='primary' />
                        </Box>
                      )
                    } else {
                      if (selected?.length > 3) {
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <CustomChip rounded label={selected[0]?.label} skin='light' color='primary' />
                            <CustomChip rounded label={selected[1]?.label} skin='light' color='primary' />
                            <CustomChip
                              rounded
                              label={`${selected?.length - 2} more...`}
                              skin='light'
                              color='primary'
                            />
                          </Box>
                        )
                      } else {
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {selected?.map((item, i) => (
                              <CustomChip key={i} rounded label={item?.label} skin='light' color='primary' />
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
                  {availableIncludeOptions.length === 0 ? (
                    <MenuItem value='' disabled>
                      No Data Available
                    </MenuItem>
                  ) : (
                    availableIncludeOptions.map(type => (
                      <MenuItem key={type} value={type}>
                        <Checkbox checked={value?.some(item => item.value === type.value)} />
                        <ListItemText primary={type.label} />
                      </MenuItem>
                    ))
                  )}
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
            el?.value === 'Z001' ||
            el?.value === 'Z003' ||
            el?.value === 'Z004' ||
            el?.value === 'Z007' ||
            el?.value === 'Z009' ||
            el?.value === 'Z015'
        ) && (
          <Grid item xs={12} sm={3}>
            <Typography variant='body2'>5.2 Exclude Customer Class</Typography>
            <Controller
              name='excludedCustomerClass'
              control={control}
              rules={{ required: false }}
              render={({ field: { value, onChange } }) => (
                <Select
                  size='small'
                  defaultValue={[]}
                  displayEmpty
                  error={Boolean(errors.excludedCustomerClass)}
                  sx={{ width: 300 }}
                  id='select-multiple-checkbox'
                  multiple
                  value={value}
                  onChange={onChange}
                  renderValue={selected => {
                    if (selected?.length === 0) {
                      return 'Please select Customer Class'
                    }
                    if (selected?.length === 14) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={'All Customer Class'} skin='light' color='primary' />
                        </Box>
                      )
                    } else {
                      if (selected?.length > 3) {
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <CustomChip rounded label={selected[0]?.label} skin='light' color='primary' />
                            <CustomChip rounded label={selected[1]?.label} skin='light' color='primary' />
                            <CustomChip
                              rounded
                              label={`${selected?.length - 2} more...`}
                              skin='light'
                              color='primary'
                            />
                          </Box>
                        )
                      } else {
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {selected?.map((item, i) => (
                              <CustomChip key={i} rounded label={item?.label} skin='light' color='primary' />
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
                  {availableExcludeOptions.length === 0 ? (
                    <MenuItem value='' disabled>
                      No Data Available
                    </MenuItem>
                  ) : (
                    availableExcludeOptions.map(type => (
                      <MenuItem key={type} value={type}>
                        <Checkbox checked={value?.some(item => item.value === type.value)} />
                        <ListItemText primary={type.label} />
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
            {errors.excludedCustomerClass && (
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
                  if (selectedCustomer?.length === 0) {
                    return 'Please Select Customer'
                  } else {
                    if (selectedCustomer?.length > 6) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={selectedCustomer[0]} skin='light' color='primary' />
                          <CustomChip rounded label={selectedCustomer[1]} skin='light' color='primary' />
                          <CustomChip rounded label={selectedCustomer[2]} skin='light' color='primary' />
                          <CustomChip rounded label={selectedCustomer[3]} skin='light' color='primary' />
                          <CustomChip rounded label={selectedCustomer[4]} skin='light' color='primary' />
                          <CustomChip
                            rounded
                            label={`${selectedCustomer?.length - 5} more...`}
                            skin='light'
                            color='primary'
                          />
                        </Box>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {selectedCustomer?.map((item, i) => (
                            <CustomChip key={i} rounded label={item} skin='light' color='primary' />
                          ))}
                        </Box>
                      )
                    }
                  }
                }}
              ></Select>
            </>
          )}
        </Grid> */}
        {isCustomerGroupIncluded(customerGroupValue) && (
          <>
            <Grid item xs={12} sm={3}>
              <Typography variant='body2'>5.1 Select Customer Class</Typography>
              <Controller
                name='includeCustomerClass'
                control={control}
                rules={{ required: false }}
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
                    {availableIncludeOptions.length === 0 ? (
                      <MenuItem value='' disabled>
                        No Data Available
                      </MenuItem>
                    ) : (
                      availableIncludeOptions.map(type => (
                        <MenuItem key={type} value={type}>
                          <Checkbox checked={value?.some(item => item.value === type.value)} />
                          <ListItemText primary={type.label} />
                        </MenuItem>
                      ))
                    )}
                  </Select>
                )}
              />
              {errors.includeCustomerClass && (
                <Typography variant='body2' color='error'>
                  Customer Type is required
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant='body2'>5.2 Exclude Customer Class</Typography>
              <Controller
                name='excludedCustomerClass'
                control={control}
                rules={{ required: false }}
                render={({ field: { value, onChange } }) => (
                  <Select
                    size='small'
                    defaultValue={[]}
                    displayEmpty
                    error={Boolean(errors.excludedCustomerClass)}
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
                    {availableExcludeOptions.length === 0 ? (
                      <MenuItem value='' disabled>
                        No Data Available
                      </MenuItem>
                    ) : (
                      availableExcludeOptions.map(type => (
                        <MenuItem key={type} value={type}>
                          <Checkbox checked={value?.some(item => item.value === type.value)} />
                          <ListItemText primary={type.label} />
                        </MenuItem>
                      ))
                    )}
                  </Select>
                )}
              />
              {errors.excludedCustomerClass && (
                <Typography variant='body2' color='error'>
                  Customer Type is required
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography variant='body2'>5.3. Exclude Customer </Typography>
              <Select
                sx={{ minWidth: 300 }}
                size='small'
                displayEmpty
                defaultValue=''
                inputProps={{ readOnly: true }}
                onClick={() => setCustomersDrawerOpen(true)}
                renderValue={selected => {
                  if (selectedCustomer.length === 0) {
                    return 'Please Select Customer'
                  } else {
                    if (selectedCustomer.length > 6) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={selectedCustomer[0].label} skin='light' color='primary' />
                          <CustomChip rounded label={selectedCustomer[1].label} skin='light' color='primary' />
                          <CustomChip rounded label={selectedCustomer[2].label} skin='light' color='primary' />
                          <CustomChip rounded label={selectedCustomer[3].label} skin='light' color='primary' />
                          <CustomChip rounded label={selectedCustomer[4].label} skin='light' color='primary' />
                          <CustomChip
                            rounded
                            label={`${selectedCustomer.length - 5} more...`}
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
            </Grid>
          </>
        )}
        {isSpecialGroupSelected(customerGroupValue) && !isCustomerGroupIncluded(customerGroupValue) && (
          <Grid item xs={12} sm={12}>
            <Typography variant='body2'>5.3. Exclude Customer </Typography>
            <Select
              sx={{ minWidth: 300 }}
              size='small'
              displayEmpty
              defaultValue=''
              inputProps={{ readOnly: true }}
              onClick={() => setCustomersDrawerOpen(true)}
              renderValue={selected => {
                if (selectedCustomer.length === 0) {
                  return 'Please Select Customer'
                } else {
                  if (selectedCustomer.length > 6) {
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <CustomChip rounded label={selectedCustomer[0].label} skin='light' color='primary' />
                        <CustomChip rounded label={selectedCustomer[1].label} skin='light' color='primary' />
                        <CustomChip rounded label={selectedCustomer[2].label} skin='light' color='primary' />
                        <CustomChip rounded label={selectedCustomer[3].label} skin='light' color='primary' />
                        <CustomChip rounded label={selectedCustomer[4].label} skin='light' color='primary' />
                        <CustomChip
                          rounded
                          label={`${selectedCustomer.length - 5} more...`}
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
          </Grid>
        )}
      </Grid>
      <Grid sx={{ mt: 5 }} container>
        <Button type='submit' sx={{ mr: 2 }} variant='outlined'>
          Save and Continue
        </Button>
      </Grid>
      <Drawer open={placesDrawerOpen} anchor='right' variant='temporary' onClose={togglePlacesDrawer}>
        <PlacesDrawer
          toggle={togglePlacesDrawer}
          checkedItems={selectedOption === 'Pan India' ? excludedRegions : places}
          setCheckedItems={selectedOption === 'Pan India' ? setExcludedRegions : setPlaces}
          selectedOption={selectedOption}
        />
        {/* <PlacesDrawer
          toggle={togglePlacesDrawer}
          checkedItems={getValues('selectedCoverage')}
          setCheckedItems={setValues}
          selectedOption={selectedOption}
        /> */}
      </Drawer>
      <Drawer
        open={productSubCategoryDrawerOpen}
        anchor='right'
        variant='temporary'
        onClose={toggleProductSubCategoryDrawer}
      >
        <ProductSubCategoryDrawer
          toggle={toggleProductSubCategoryDrawer}
          checkedItems={productSubCategory}
          setCheckedItems={setProductSubCategory}
          selectedCategory={getValues('productCategory')}
        />
      </Drawer>
      <Drawer open={SKUDrawerOpen} anchor='right' variant='temporary' onClose={toggleSKUDrawer}>
        <SKUDrawer
          toggle={toggleSKUDrawer}
          checkedItems={selectedSKU}
          setCheckedItems={setSelectedSKU}
          selectedSubCategory={productSubCategory}
          setGroupList={setGroupList}
          brand={brand}
          productCategory={getValues('productCategory')}
        />
      </Drawer>
      <Drawer open={customersDrawerOpen} anchor='right' variant='temporary' onClose={toggleCustomerDrawer}>
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
