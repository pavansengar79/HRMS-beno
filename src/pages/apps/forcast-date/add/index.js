
import {useState} from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { addForcastDate } from 'src/store/apps/forcast-date'

// ** Custom Component Import

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Icon Imports
import { useDispatch } from 'react-redux'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import PickersCustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'



const AddModal = ({ onClose }) => {
  // ** States

  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()

  const dispatch = useDispatch()

  const handleSubmit = () => {
    dispatch(addForcastDate({ startDate: startDate, endDate: endDate }))
    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Grid container spacing={5} justifyContent={'center'}>
      <Grid item xs={6} sm={3}>
        <Typography variant='h5' marginRight={2}>
          Start Date :
        </Typography>
      </Grid>
      <Grid item xs={9} sm={9}>
        <DatePickerWrapper>
          <DatePicker
            selected={startDate}
            id='basic-input'
            popperPlacement={'bottom-start'}
            onChange={date => setStartDate(date)}
            placeholderText='mm/dd/yyyy'
            customInput={<PickersCustomInput />}
          />
        </DatePickerWrapper>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Typography variant='h5' marginRight={2}>
          End Date :
        </Typography>
      </Grid>
      <Grid item xs={9} sm={9}>
        <DatePickerWrapper>
          <DatePicker
            selected={endDate}
            id='basic-input'
            popperPlacement={'bottom-start'}
            onChange={date => setEndDate(date)}
            placeholderText='mm/dd/yyy'
            customInput={<PickersCustomInput />}
          />
        </DatePickerWrapper>
      </Grid>
      <Button sx={{ mt: 4 }} variant='contained' onClick={handleSubmit}>
        SUBMIT
      </Button>
    </Grid>
  )
}

export default AddModal
