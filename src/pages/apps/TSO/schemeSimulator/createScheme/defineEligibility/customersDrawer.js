import React, { useEffect, useState } from 'react'
import { Box, Typography, IconButton, Checkbox, FormControlLabel, InputAdornment } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { styled } from '@mui/material/styles'
import CustomTextField from 'src/@core/components/mui/text-field'
import { debounce } from 'src/utils/helper'
import SearchIcon from '@mui/icons-material/Search'
import axiosRequest from 'src/utils/AxiosInterceptor'

// const data = [
//   { value: '1100064- Arhihant tyres mumbai', label: '1100064- Arhihant tyres mumbai' },
//   { value: '1100064- Arhihant tyres mumbai', label: '1100064- Arhihant tyres mumbai' },
//   { value: '1100064- Arhihant tyres mumbai', label: '1100064- Arhihant tyres mumbai' },
//   { value: '1100064- Arhihant tyres mumbai', label: '1100064- Arhihant tyres mumbai' },
//   { value: '1100064- Arhihant tyres mumbai', label: '1100064- Arhihant tyres mumbai' },
//   { value: '1100064- Arhihant tyres mumbai', label: '1100064- Arhihant tyres mumbai' },
//   { value: '1100064- Arhihant tyres mumbai', label: '1100064- Arhihant tyres mumbai' },
//   { value: '1100064- Arhihant tyres mumbai', label: '1100064- Arhihant tyres mumbai' },
//   { value: '1100064- Arhihant tyres mumbai', label: '1100064- Arhihant tyres mumbai' },
//   { value: '1100064- Arhihant tyres mumbai', label: '1100064- Arhihant tyres mumbai' },
//   { value: '1100064- Arhihant tyres mumbai', label: '1100064- Arhihant tyres mumbai' }
// ]

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(4),
  justifyContent: 'space-between'
}))

const Customers = ({ toggle, checkedItems, setCheckedItems, customerGroupValue, includeCustomerClassValue }) => {
  // const [checkedItems, setCheckedItems] = useState(data)

  console.log('customergroup', customerGroupValue, includeCustomerClassValue)

  const [selectAll, setSelectAll] = useState(false)
  const [search, setSearch] = useState('')
  const [data, setData] = useState([])

  useEffect(() => {
    const accountGroup = customerGroupValue?.map(cat => cat.value)
    const customerClass = includeCustomerClassValue?.map(cat => cat.value)
    const getDealers = async () => {
      const response = await axiosRequest({
        url: `/api/admindash/vistex/dealer-list?search=${search}`,
        method: 'POST',
        data: {
          accountGroup,
          customerClass
        }
      })
      setData(
        response?.dealers?.map(item => {
          return { value: item?.value, label: item?.label }
        })
      )
    }

    getDealers()
  }, [search, customerGroupValue, includeCustomerClassValue])

  const handleSelectAll = event => {
    const newCheckedState = event.target.checked
    setCheckedItems(newCheckedState ? data : [])
    setSelectAll(newCheckedState)
  }

  const handleCheckboxChange = event => {
    const { name, checked } = event.target
    const selectedItem = data.find(item => item.value === name)

    setCheckedItems(prevCheckedItems =>
      checked ? [...prevCheckedItems, selectedItem] : prevCheckedItems.filter(item => item.value !== name)
    )

    if (!checked) {
      setSelectAll(false)
    } else {
      const allChecked = data.every(
        item => checkedItems.some(checkedItem => checkedItem.value === item.value) || item.value === name
      )
      setSelectAll(allChecked)
    }
  }

  // const chunkSize = 10
  // const chunkedData = []
  // for (let i = 0; i < data.length; i += chunkSize) {
  //   chunkedData.push(data.slice(i, i + chunkSize))
  // }

  return (
    <Box>
      <Header>
        <Typography variant='h6'>
          Please Select a Customer - Total {checkedItems.length} selected out of {data.length}
        </Typography>
        <IconButton
          size='small'
          onClick={toggle}
          sx={{
            p: '0.375rem',
            borderRadius: 1,
            color: 'text.primary',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </IconButton>
      </Header>
      <Box p={6}>
        <CustomTextField
          fullWidth
          placeholder='Search'
          onChange={e => debounce(() => setSearch(e.target.value), 2000)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <FormControlLabel control={<Checkbox checked={selectAll} onChange={handleSelectAll} />} label='Select All' />
        {/* <Box sx={{ display: 'flex', gap: '20px' }}>
          {chunkedData.map((chunk, columnIndex) => (
            <Box key={columnIndex} sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {chunk.map((region, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox checked={checkedItems.includes(region)} onChange={handleCheckboxChange} name={region} />
                  }
                  label={region}
                />
              ))}
            </Box>
          ))}
        </Box> */}
        <Box sx={{ display: 'grid', rowGap: '5px', gridTemplateColumns: '1fr 1fr' }}>
          {
            data?.length === 0 ? ( <Typography variant='body2' color='error'>
            No data found
          </Typography>) : (
              data.map((el, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={checkedItems.some(item => item.value === el.value)}
                      onChange={handleCheckboxChange}
                      name={el.value}
                    />
                  }
                  label={`${el.value}-${el.label}`}
                />
              ))
            )
          }
        </Box>
      </Box>
    </Box>
  )
}

export default Customers
