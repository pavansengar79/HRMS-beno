import React, { useEffect, useState } from 'react'
import { Box, Typography, IconButton, Checkbox, FormControlLabel, InputAdornment } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { styled } from '@mui/material/styles'
import CustomTextField from 'src/@core/components/mui/text-field'
import { debounce } from 'src/utils/helper'
import SearchIcon from '@mui/icons-material/Search'

// Updated data

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(4),
  justifyContent: 'space-between'
}))

const ProductSubCategoryDrawer = ({ toggle, checkedItems, setCheckedItems, selectedCategory }) => {
  console.log('selected', selectedCategory)
  const [selectAll, setSelectAll] = useState(false)
  const [search, setSearch] = useState('')
  const [data, setData] = useState([])
  const handleSelectAll = event => {
    const newCheckedState = event.target.checked
    setCheckedItems(newCheckedState ? data : [])
    setSelectAll(newCheckedState)
  }

  useEffect(() => {
    if (selectedCategory === 'Non Truck') {
      setData([
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
        { value: 'F1', label: 'KARTING TYRES' }
      ])
    } else if (selectedCategory === 'Truck') {
      setData([
        { value: '11', label: 'TRUCK BIAS' },
        { value: '12', label: 'TRUCK RADIAL' }
      ])
    } else if (selectedCategory === 'OTR') {
      setData([
        { value: '81', label: 'OTR BIAS' },
        { value: 'E1', label: 'OTR BIAS' },
        { value: 'G1', label: 'OTR BIAS' },
        { value: 'E2', label: 'OTR RADIAL' },
        { value: '82', label: 'OTR RADIAL' }
      ])
    } else {
      setData([
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
      ])
    }
  }, [selectedCategory])

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
          Please Select a Sub Category - Total {checkedItems.length} selected out of {data.length}
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
                    <Checkbox
                      checked={checkedItems.some(item => item.value === region.value)}
                      onChange={handleCheckboxChange}
                      name={region.value}
                    />
                  }
                  label={region.label}
                />
              ))}
            </Box>
          ))}
        </Box> */}
        <Box sx={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
          {data.map((el, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={checkedItems.some(item => item?.value === el?.value)}
                  onChange={handleCheckboxChange}
                  name={el?.value}
                />
              }
              label={el?.label}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default ProductSubCategoryDrawer
