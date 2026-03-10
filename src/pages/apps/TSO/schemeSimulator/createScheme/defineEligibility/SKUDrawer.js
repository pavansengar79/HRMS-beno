import React, { useEffect, useState } from 'react'
import { Box, Typography, IconButton, Checkbox, FormControlLabel, InputAdornment } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { styled } from '@mui/material/styles'
import CustomTextField from 'src/@core/components/mui/text-field'
import { debounce } from 'src/utils/helper'
import SearchIcon from '@mui/icons-material/Search'
import axiosRequest from 'src/utils/AxiosInterceptor'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(4),
  justifyContent: 'space-between'
}))

const SKUDrawer = ({
  toggle,
  checkedItems,
  setCheckedItems,
  selectedSubCategory,
  brand,
  setGroupList,
  productCategory
}) => {
  const [selectAll, setSelectAll] = useState(false)
  const [search, setSearch] = useState('')
  const [data, setData] = useState([])
  const handleSelectAll = event => {
    const newCheckedState = event.target.checked
    setCheckedItems(newCheckedState ? data : [])
    setSelectAll(newCheckedState)
  }

  useEffect(() => {
    const Category = selectedSubCategory.map(cat => cat.value)
    const categoryName = selectedSubCategory.map(cat => cat.label)
    const getSKU = async () => {
      const response = await axiosRequest({
        url: `/api/admindash/product/getSKUlist?search=${search}`,
        method: 'POST',
        data: {
          Category,
          categoryName,
          retread: productCategory
        }
      })

      console.log('SKU Data', response?.data)
      setData(
        response?.data?.map(item => {
          return { value: item?.ParentSku, label: item?.MatDesc }
        })
      )
      if (brand === 'Brand') {
        setGroupList([...new Set(response?.data?.filter(item => item.BrandDesc !== '').map(item => item.BrandDesc))])
      } else if (brand === 'Sub Brand') {
        setGroupList([
          ...new Set(response?.data?.filter(item => item.SubBrandDesc !== '').map(item => item.SubBrandDesc))
        ])
      } else if (brand === 'Tyre Size') {
        setGroupList([...new Set(response?.data?.filter(item => item.Inch !== '').map(item => item.Inch))])
      } else if (brand === 'Material') {
        setGroupList([...new Set(response?.data?.filter(item => item.materialNo !== '').map(item => item.materialNo))])
      } else {
        const labels = selectedSubCategory.map(item => item.label)
        const uniqueLabels = [...new Set(labels)]
        setGroupList(uniqueLabels)
      }
    }

    getSKU()
  }, [selectedSubCategory, brand, search])

  const handleCheckboxChange = event => {
    const { name, checked } = event.target
    const selectedItem = data.find(item => item.value === name)
    console.log('>>', selectedItem)

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

  return (
    <Box>
      <Header>
        <Typography variant='h6'>
          Please Select a SKU - Total {checkedItems.length} selected out of {data.length}
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
        <Box sx={{ display: 'grid', columnGap: '10px', rowGap: '5px', gridTemplateColumns: '1fr 1fr' }}>
          {data?.length === 0 ? (
            <Typography variant='body2' color='error'>
              No data found
            </Typography>
          ) : (
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
                label={el.label}
              />
            ))
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default SKUDrawer
