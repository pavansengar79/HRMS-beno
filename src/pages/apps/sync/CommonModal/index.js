// ** React Imports
import { forwardRef, useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'

import CardHeader from '@mui/material/CardHeader'

import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import { addSyncPayment, addSyncOrder, addSyncUser, addSyncParty } from 'src/store/apps/sync'
import PickersCustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Icon Imports
import { useDispatch } from 'react-redux'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { toNestError } from '@hookform/resolvers'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const CommonModal = ({ rowData, onClose }) => {
  // ** States

  const [groupName, setGroupName] = useState('')

  const [startDate, setStartDate] = useState(new Date())

  const dispatch = useDispatch()

  const handleGroupName = event => {
    setGroupName(event.target.value)
  }

  const handleSubmit = () => {
    if (rowData.type === 'payment') {
      const data = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`
      dispatch(addSyncPayment({ type: 'single', data: data }))
    }
    if (rowData.type === 'user') {
      dispatch(addSyncUser({ type: 'single', data: groupName }))
    }
    if (rowData.type === 'order') {
      dispatch(addSyncOrder({ type: 'single', data: groupName }))
    }
    if (rowData.type === 'party') {
      dispatch(addSyncParty({ type: 'single', data: groupName }))
    }

    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container>
        <Grid item xs={12} sm={12}>
          {rowData.type === 'payment' ? (
            <DatePickerWrapper>
              <DatePicker
                selected={startDate}
                id='basic-input'
                popperPlacement={'bottom-start'}
                onChange={date => setStartDate(date)}
                placeholderText='mm/dd/yyyy'
                customInput={<PickersCustomInput label={rowData.label} />}
              />
            </DatePickerWrapper>
          ) : (
            <CustomTextField
              fullWidth
              sx={{ mb: 4 }}
              label={rowData.label}
              id='form-layouts-separator-select'
              onChange={handleGroupName}
            ></CustomTextField>
          )}
          <Button onClick={handleSubmit} sx={{ mr: 2, mt: 5 }} variant='contained' fullWidth>
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default CommonModal
