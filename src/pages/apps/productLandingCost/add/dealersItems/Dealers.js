import { Checkbox, FormControlLabel, FormGroup, Grid, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRegionList, fetchDealerType, fetchTerrCode } from 'src/store/apps/productLandingCost/dealerList'

function Dealers({ type, setType, category, setCategory, areas, setOldAreasData, oldareasData }) {
  const dispatch = useDispatch()
  const data = useSelector(state => state.dealersList)

  const checkAllTrue = (arr, key) => arr.every(element => element[key] === false)

  useEffect(() => {
    if ((checkAllTrue(category, 'checked') && checkAllTrue(type, 'checked')) || oldareasData !== areas) {
      // Run your function here if all 'value' are true
      console.log('refeching')
      const arrType = data?.dealerType?.distinctTypes?.map(a => ({ checked: false, value: a, label: a }))
      setType(arrType)
      const arrCategory = data?.dealerType?.distinctCategory?.map(a => ({ checked: false, value: a, label: a }))

      setCategory(arrCategory)
      setOldAreasData(areas)
    } else {
      console.log('Not all values are true')
    }
  }, [])

  useEffect(() => {
    const params = areas
      .filter(ar => ar.checked == true)
      .map(item => item.value)
      .join(',')

    dispatch(fetchTerrCode(params))
  }, [areas])

  const handleSelectAll1 = e => {
    const newVal = e.target.checked
    setType(prev => prev.map(obj => ({ ...obj, checked: newVal })))
  }

  const handleCheckboxChange1 = index => {
    const newRegions = [...type]
    newRegions[index].checked = !newRegions[index].checked
    setType(newRegions)
  }

  const handleSelectAll2 = e => {
    const newVal = e.target.checked
    setCategory(prev => prev.map(obj => ({ ...obj, checked: newVal })))
  }

  const handleCheckboxChange2 = index => {
    const newRegions = [...category]
    newRegions[index].checked = !newRegions[index].checked
    setCategory(newRegions)
  }

  // { checked: false, value: 'NZ' },
  // { checked: false, value: 'EZ' },
  // { checked: false, value: 'SZ' },
  // { checked: false, value: 'WZ' },
  // { checked: false, value: 'TZ' }

  return (
    <Grid item xs={12} sm={12} sx={{ overflowY: 'scroll', maxHeight: '500px' }}>
      <Typography>DEALER TYPE</Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox checked={type?.every(z => z?.checked)} onChange={handleSelectAll1} />}
          label='Select All'
        />
        {type?.map((curr, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox checked={curr?.checked} onChange={() => handleCheckboxChange1(index)} value={curr?.value} />
            }
            label={curr?.value}
          />
        ))}
      </FormGroup>
      <Typography>DEALER CATEGORY</Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox checked={category?.every(z => z?.checked)} onChange={handleSelectAll2} />}
          label='Select All'
        />
        {category?.map((cat, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox checked={cat?.checked} onChange={() => handleCheckboxChange2(index)} value={cat?.value} />
            }
            label={cat?.value}
          />
        ))}
      </FormGroup>
    </Grid>
  )
}

export default Dealers
