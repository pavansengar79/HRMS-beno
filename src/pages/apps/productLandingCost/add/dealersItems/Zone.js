import { Checkbox, FormControlLabel, FormGroup, Grid } from '@mui/material'
import React, { useEffect, useState } from 'react'
import disabled from 'src/store/apps/disabled'

function Zone({ zones, setZones }) {
  const handleCheckboxChange = index => {
    const newZones = [...zones]
    newZones[index].checked = !newZones[index].checked
    setZones(newZones)
  }

  const handleSelectAll = e => {
    const newVal = e.target.checked
    setZones(prev => prev.map(obj => ({ ...obj, checked: newVal })))
  }

  return (
    <Grid item xs={12} sm={12} sx={{ overflowY: 'scroll', maxHeight: '500px' }}>
      {/* <FormGroup row>
        <FormControlLabel
          control={<Checkbox checked={selectAllZones} onChange={handleCheckboxChange} name='selectAllZones' />}
          label='Select All'
        />
        {Object.entries(zones).map(([key, { checked, value }]) => (
          <FormControlLabel
            key={key}
            control={<Checkbox checked={checked} onChange={handleCheckboxChange} name={key} />}
            label={value}
          />
        ))}
      </FormGroup> */}
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox checked={zones.every(z => z.checked)} onChange={handleSelectAll} />}
          label='Select All'
        />
        {zones.map((zone, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox checked={zone.checked} onChange={() => handleCheckboxChange(index)} value={zone.value} />
            }
            label={zone.value}
          />
        ))}
      </FormGroup>
    </Grid>
  )
}

export default Zone
