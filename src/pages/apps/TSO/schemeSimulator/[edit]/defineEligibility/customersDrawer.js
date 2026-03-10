import React, { useState } from 'react'
import { Box, Typography, IconButton, Checkbox, FormControlLabel, InputAdornment } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { styled } from '@mui/material/styles'
import CustomTextField from 'src/@core/components/mui/text-field'
import { debounce } from 'src/utils/helper'
import SearchIcon from '@mui/icons-material/Search'

const data = [
  '1100640 - Arihant Tyres - Mumbai',
  '1100641 - Arihant Tyres - Mumbai',
  '1100642 - Arihant Tyres - Mumbai',
  '1100643 - Arihant Tyres - Mumbai',
  '1100644 - Arihant Tyres - Mumbai',
  '1100645 - Arihant Tyres - Mumbai',
  '1100646 - Arihant Tyres - Mumbai',
  '1100647 - Arihant Tyres - Mumbai',
  '1100648 - Arihant Tyres - Mumbai',
  '1100649 - Arihant Tyres - Mumbai'
]

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(4),
  justifyContent: 'space-between'
}))

const Customers = ({ toggle, checkedItems, setCheckedItems }) => {
  // const [checkedItems, setCheckedItems] = useState(data)

  const [selectAll, setSelectAll] = useState(false)
  const [search, setSearch] = useState('')
  const handleSelectAll = event => {
    const newCheckedState = event.target.checked
    setCheckedItems(newCheckedState ? data : [])
    setSelectAll(newCheckedState)
  }

  const handleCheckboxChange = event => {
    const { name, checked } = event.target
    setCheckedItems(prevCheckedItems =>
      checked ? [...prevCheckedItems, name] : prevCheckedItems.filter(item => item !== name)
    )

    if (!checked) {
      setSelectAll(false)
    } else {
      const allChecked = data.every(item => checkedItems.includes(item) || item === name)
      setSelectAll(allChecked)
    }
  }

  const chunkSize = 10
  const chunkedData = []
  for (let i = 0; i < data.length; i += chunkSize) {
    chunkedData.push(data.slice(i, i + chunkSize))
  }

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
        <Box sx={{ display: 'flex', gap: '20px' }}>
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
        </Box>
      </Box>
    </Box>
  )
}

export default Customers
