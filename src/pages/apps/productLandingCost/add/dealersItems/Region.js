import { Checkbox, FormControlLabel, FormGroup, Grid } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRegionList } from 'src/store/apps/productLandingCost/dealerList'

function Region({ zones, regions, setRegions, setoldzone, oldzone }) {
  const dispatch = useDispatch()
  const data = useSelector(state => state.dealersList)

  const checkAllTrue = (arr, key) => arr.every(element => element[key] === false)

  useEffect(() => {
    // Run your function here if all 'value' are truexs
    const params = zones
      .filter(zone => zone.checked == true)
      .map(zoneItem => zoneItem.value)
      .join(',')

    dispatch(fetchRegionList(params))
    console.log('fetching agian ')
  }, [zones])

  useEffect(() => {
    console.log('oldzone', oldzone)
    console.log('zones', zones)
  }, [oldzone])

  useEffect(() => {
    if (checkAllTrue(regions, 'checked') || oldzone !== zones) {
      // Run your function here if all 'value' are true
      const arr = data?.regionList?.map(a => ({ checked: false, value: a.regionCode, label: a.regionName }))
      setRegions(arr)
      setoldzone(zones)
    } else {
      console.log('Not all values are true')
    }
  }, [data.regionList])

  const handleSelectAll = e => {
    const newVal = e.target.checked
    setRegions(prev => prev.map(obj => ({ ...obj, checked: newVal })))
  }

  const handleCheckboxChange = index => {
    const newRegions = [...regions]
    newRegions[index].checked = !newRegions[index].checked
    setRegions(newRegions)
  }

  // { checked: false, value: 'NZ' },
  // { checked: false, value: 'EZ' },
  // { checked: false, value: 'SZ' },
  // { checked: false, value: 'WZ' },
  // { checked: false, value: 'TZ' }

  return (
    <Grid item xs={12} sm={12} sx={{ overflowY: 'scroll' }}>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox checked={regions.every(z => z.checked)} onChange={handleSelectAll} />}
          label='Select All'
        />
        {regions?.map((region, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox checked={region.checked} onChange={() => handleCheckboxChange(index)} value={region.value} />
            }
            label={region.label}
          />
        ))}
      </FormGroup>
    </Grid>
  )
}

export default Region
