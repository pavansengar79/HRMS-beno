import { Checkbox, FormControlLabel, FormGroup, Grid } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAreasList, fetchDealerType } from 'src/store/apps/productLandingCost/dealerList'

function Area({ regions, areas, setAreas, oldregions, setoldregions }) {
  const dispatch = useDispatch()
  const data = useSelector(state => state.dealersList)

  const checkAllTrue = (arr, key) => arr.every(element => element[key] === false)

  useEffect(() => {
    dispatch(fetchDealerType())

    const params = regions
      .filter(region => region.checked == true)
      .map(regionItem => regionItem.value)
      .join(',')

    dispatch(fetchAreasList(params))
  }, [])

  useEffect(() => {
    if (checkAllTrue(areas, 'checked') || oldregions !== regions) {
      // Run your function here if all 'value' are true
      const arr = data?.areasList?.map(a => ({ checked: false, value: a.areaCode, label: a.areaName }))
      setAreas(arr)
      setoldregions(regions)
    } else {
      console.log('Not all values are true')
    }
  }, [data.areasList])

  const handleCheckboxChange = index => {
    const newAreas = [...areas]
    newAreas[index].checked = !newAreas[index].checked
    setAreas(newAreas)
  }

  const handleSelectAll = e => {
    const newVal = e.target.checked
    setAreas(prev => prev.map(obj => ({ ...obj, checked: newVal })))
  }

  // { checked: false, value: 'NZ' },
  // { checked: false, value: 'EZ' },
  // { checked: false, value: 'SZ' },
  // { checked: false, value: 'WZ' },
  // { checked: false, value: 'TZ' }

  return (
    <Grid item xs={12} sm={12} sx={{ overflowY: 'scroll', maxHeight: '500px' }}>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox checked={areas?.every(z => z.checked)} onChange={handleSelectAll} />}
          label='Select All'
        />
        {areas.map((area, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox checked={area.checked} onChange={() => handleCheckboxChange(index)} value={area.value} />
            }
            label={area.label}
          />
        ))}
      </FormGroup>
    </Grid>
  )
}

export default Area
