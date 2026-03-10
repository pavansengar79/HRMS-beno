import React, { useEffect, useState } from 'react'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { CheckBox } from '@mui/icons-material'
import { InputLabel } from '@mui/material'
import navigation from 'src/navigation/vertical'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdmin } from 'src/store/apps/rolesPermission'
import toast from 'react-hot-toast'

function Permissions({ selectedData, setSelectedData }) {
  
  let arrData = navigation().slice(0, 30) //use slice beacause of extra sidebar items

  console.log('arrdata', arrData)

  let arr = []

  let accessValue = [
    { value: 'CREATE', label: 'CREATE' },
    { value: 'UPDATE', label: 'UPDATE' },
    { value: 'DELETE', label: 'DELETE' }
  ]

  arrData.forEach(item => {
    if (item.children && item.children.length > 0) {
      item.children.forEach(subItem => {
        arr.push({ ...subItem, children: [] })
      })
    } else {
      arr.push({ ...item, children: [] })
    }
  })

  const handleArrChange = (event, url) => {
    const { checked } = event.target
    setSelectedData(prevSelectedData => {
      const updatedData = [...prevSelectedData]
      if (checked) {
        updatedData.push({
          url,
          access: accessValue.map(access => access.value)
        })
      } else {
        updatedData.splice(
          updatedData.findIndex(item => item.url === url),
          1
        )
      }

      return updatedData
    })
  }

  const handleAccessLabelChange = (event, url, accessValue) => {
    const { checked } = event.target
    setSelectedData(prevSelectedData => {
      const updatedData = [...prevSelectedData]

      const existingEntryIndex = updatedData.findIndex(item => item.url === url)
      if (existingEntryIndex >= 0) {
        const existingEntry = updatedData[existingEntryIndex]
        if (checked && !existingEntry.access.includes(accessValue)) {
          existingEntry.access.push(accessValue)
        } else if (!checked) {
          existingEntry.access = existingEntry.access.filter(label => label !== accessValue)
          if (existingEntry.access.length === 0) {
            updatedData.splice(existingEntryIndex, 1)
          }
        }
      } else if (checked) {
        updatedData.push({ url, access: [accessValue] })
      }

      return updatedData
    })
  }
  console.log('selected', selectedData)

  return (
    <div
      style={{
        border: '1px solid darkgrey',
        borderRadius: '5px',
        marginTop: '1rem',
        padding: '1rem'
      }}
    >
      <InputLabel id='demo-simple-select-standard-label' sx={{ marginBottom: '10px' }}>
        Permissions
      </InputLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr'

          // padding: "1rem",
        }}
      >
        {arr.map(arrItem => (
          <div
            key={arrItem.title}
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '1rem'
            }}
          >
            <label>
              <Checkbox
                name={arrItem.title}
                checked={selectedData.some(item => item.url === arrItem.path)}
                onChange={e => handleArrChange(e, arrItem.path)}
              />
              {arrItem.title}
            </label>
            <div>
              {accessValue.map(access => (
                <label key={access.value}>
                  <Checkbox
                    type='checkbox'
                    name={access.value}
                    checked={selectedData.some(item => item.url === arrItem.path && item.access.includes(access.value))}
                    onChange={e => handleAccessLabelChange(e, arrItem.path, access.value)}
                  />
                  {access.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Permissions
