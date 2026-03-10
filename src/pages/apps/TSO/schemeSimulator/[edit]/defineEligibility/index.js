import { Box, Drawer, FormControlLabel, OutlinedInput, Radio, Select, Typography } from '@mui/material'
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
import { useEffect, useState } from 'react'
import PlacesDrawer from './placesDrawer'
import ProductSubCategoryDrawer from './productSubCategoryDrawer'
import SKUDrawer from './SKUDrawer'
import Customers from './customersDrawer'

const companyItems = ['JK', 'CIL']
const customerTypeOptions = [
  'Non truck',
  'Truck',
  'FLEET MANAGEMENT',
  'Mobility',
  'Farm Xpress Wheel',
  'Steel wheels',
  'Xpress Wheels',
  'Truck wheels',
  'Pref.Trade Partner',
  'MBO',
  'OTR',
  'Rural Distribution',
  'Non SAS Account',
  'Employee'
]

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
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm()

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
  const togglePlacesDrawer = () => setplacesDrawerOpen(!placesDrawerOpen)
  const toggleProductSubCategoryDrawer = () => setProductSubCategoryDrawerOpen(!productSubCategoryDrawerOpen)
  const toggleSKUDrawer = () => setSKUDrawerOpen(!SKUDrawerOpen)
  const toggleCustomerDrawer = () => setCustomersDrawerOpen(!customersDrawerOpen)

  const onSubmit = async data => {
    data.coverage = data.coverage != 'Pan India' ? places : data.coverage
    data.productSubCategory = productSubCategory
    data.excludeSku = selectedSKU
    data.excludedCustomers = selectedCustomer
    console.log('data', data)

    // setEligibilityData(data)
    // setExpanded('panel3')
  }

  // useEffect(() => {
  //   setValue('schemeType', detailsData?.schemeType)
  //   setValue('schemeConfigure', detailsData?.schemeConfigure)
  //   setValue('productType', detailsData?.productType)

  //   setValue('startDate', detailsData?.startDate ? Date.parse(detailsData?.startDate) : new Date())
  //   setValue('endDate', detailsData?.endDate ? Date.parse(detailsData?.endDate) : new Date())
  // }, [])

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
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                fullWidth
                sx={{ width: 300 }}
                size='small'
                displayEmpty
                defaultValue=''
                value={value}
                onChange={onChange}
                error={Boolean(errors.channel)}
                renderValue={selected => {
                  if (selected.length === 0) {
                    return 'Please select Channel'
                  }
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                      <CustomChip rounded label={selected} skin='light' color='primary' />
                    </Box>
                  )
                }}
              >
                <MenuItem value='' disabled sx={{ display: 'none' }}>
                  Please select Channel
                </MenuItem>
                {['Replacement Sales', 'OEM Sales'].map(option => (
                  <MenuItem key={option} value={option}>
                    <FormControlLabel control={<Radio checked={value === option} />} label={option} value={option} />
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
                {['Pan India', 'In a Zone', 'In a Region', 'In an Area', 'At a Depot'].map(option => (
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
            <Select
              sx={{ width: 300, mt: 5 }}
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
                  if (places.length === 30) {
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <CustomChip rounded label={'All' + selectedOption} skin='light' color='primary' />
                      </Box>
                    )
                  } else {
                    if (places.length > 3) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={places[0]} skin='light' color='primary' />
                          <CustomChip rounded label={places[1]} skin='light' color='primary' />
                          <CustomChip rounded label={`${places.length - 2} more...`} skin='light' color='primary' />
                        </Box>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {places.map((item, i) => (
                            <CustomChip key={i} rounded label={item} skin='light' color='primary' />
                          ))}
                        </Box>
                      )
                    }
                  }
                }
              }}
            ></Select>
          )}
          {/* {errors.schemeCoverage && (
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
                          <CustomChip rounded label={productSubCategory[0]} skin='light' color='primary' />
                          <CustomChip rounded label={productSubCategory[1]} skin='light' color='primary' />
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
                  {['Brand', 'Tyre Size', 'Rim Size'].map(option => (
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
          {watch('schemesRun', false) != '' && (
            <>
              <Typography variant='body2'>4.3. Exclude SKUs</Typography>
              <Select
                sx={{ width: 300 }}
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
                    if (selectedSKU.length > 3) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={selectedSKU[0]} skin='light' color='primary' />
                          <CustomChip rounded label={selectedSKU[1]} skin='light' color='primary' />
                          <CustomChip
                            rounded
                            label={`${selectedSKU.length - 2} more...`}
                            skin='light'
                            color='primary'
                          />
                        </Box>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {selectedSKU.map((item, i) => (
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
                fullWidth
                sx={{ width: 300 }}
                size='small'
                displayEmpty
                defaultValue=''
                value={value}
                onChange={onChange}
                error={Boolean(errors.customerGroup)}
              >
                <MenuItem value='' disabled sx={{ display: 'none' }}>
                  Please select Customer Group
                </MenuItem>
                <MenuItem value={'Dealer'}>Dealer</MenuItem>
                <MenuItem value={'Fleet A/C'}>Fleet A/C</MenuItem>
                <MenuItem value={'Institutional'}>Institutional</MenuItem>
                <MenuItem value={'DG S&D'}>DG S&D</MenuItem>
                <MenuItem value={'Exports'}>Exports</MenuItem>
                <MenuItem value={'STU'}>STU</MenuItem>
                <MenuItem value={'Government'}>Government</MenuItem>
                <MenuItem value={'OEM'}>OEM</MenuItem>
                <MenuItem value={'Defense'}>Defense</MenuItem>
                <MenuItem value={'Auth. Retread Centre'}>Auth. Retread Centre</MenuItem>
              </Select>
            )}
          />

          {errors.customerGroup && (
            <Typography variant='body2' color='error'>
              Customer Group is required
            </Typography>
          )}
        </Grid>
        {watch('customerGroup', false) && (
          <Grid item xs={12} sm={3}>
            <Typography variant='body2'>5.1 Select Customer Type</Typography>
            <Controller
              name='customerType'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select
                  size='small'
                  defaultValue={[]}
                  displayEmpty
                  error={Boolean(errors.customerType)}
                  sx={{ width: 300 }}
                  id='select-multiple-checkbox'
                  multiple
                  value={value}
                  onChange={onChange}
                  renderValue={selected => {
                    if (selected.length === 0) {
                      return 'Please select Customer Type'
                    }
                    if (selected.length === 14) {
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <CustomChip rounded label={'All Customer Type'} skin='light' color='primary' />
                        </Box>
                      )
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
                  MenuProps={MenuProps}
                >
                  <MenuItem value='' disabled sx={{ display: 'none' }}>
                    Please select Customer Type
                  </MenuItem>
                  {customerTypeOptions.map(type => (
                    <MenuItem key={type} value={type}>
                      <Checkbox checked={value?.indexOf(type) > -1} />
                      <ListItemText primary={type} />
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.customerType && (
              <Typography variant='body2' color='error'>
                Customer Type is required
              </Typography>
            )}
          </Grid>
        )}
        <Grid item xs={12} sm={3}>
          {watch('CustomerType') != '' && (
            <>
              <Typography variant='body2'>5.2. Exclude Customers</Typography>
              <Select
                sx={{ width: 300 }}
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
                          <CustomChip rounded label={selectedCustomer[0]} skin='light' color='primary' />
                          <CustomChip rounded label={selectedCustomer[1]} skin='light' color='primary' />
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
        />
      </Drawer>
      <Drawer open={SKUDrawerOpen} anchor='right' variant='persistent' onClose={toggleSKUDrawer}>
        <SKUDrawer toggle={toggleSKUDrawer} checkedItems={selectedSKU} setCheckedItems={setSelectedSKU} />
      </Drawer>
      <Drawer open={customersDrawerOpen} anchor='right' variant='persistent' onClose={toggleCustomerDrawer}>
        <Customers
          toggle={toggleCustomerDrawer}
          checkedItems={selectedCustomer}
          setCheckedItems={setSelectedCustomer}
        />
      </Drawer>
    </form>
  )
}

export default DefineEligibility

// import React from 'react'
// import EditScheme from './EditScheme'

// const DefineEligibility = ({ allData }) => {
//   return <EditScheme />
// }

// export default DefineEligibility
