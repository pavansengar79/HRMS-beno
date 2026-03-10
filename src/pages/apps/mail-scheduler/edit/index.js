// ** React Imports
import { forwardRef, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import { updateMailScheduler } from 'src/store/apps/mail-scheduler'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

// ** Icon Imports
import { useDispatch } from 'react-redux'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const EditModal = ({ data, onClose }) => {
  console.log('daaa', data)

  // ** States
  const [report, setReport] = useState(data?.report)
  const [frequency, setFrequency] = useState(data?.frequency)
  const [email, setEmail] = useState(data?.userList)

  const dispatch = useDispatch()

  const handleReport = event => {
    setReport(event.target.value)
  }

  const handleFrequency = event => {
    setFrequency(event.target.value)
  }

  const handleEmail = event => {
    setEmail(event.target.value)
  }

  const handleSubmit = e => {
    e.preventDefault()
    dispatch(updateMailScheduler({ id: data._id, report: report, frequency: frequency, userList: email }))

    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container rowGap={5}>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            select
            fullWidth
            label='Report'
            id='form-layouts-separator-select'
            defaultValue={report}
            onChange={handleReport}
          >
            <MenuItem value='Secondary Sales'>Secondary Salse</MenuItem>
            <MenuItem value='Orders'>Orders</MenuItem>
            <MenuItem value='Payments'>Payments</MenuItem>
            <MenuItem value='Device logins'>Device logins</MenuItem>
            <MenuItem value='Dealer order'>Dealer order</MenuItem>
            <MenuItem value='Dealer payment'>Dealer payment</MenuItem>
            <MenuItem value='Warranty'>Warranty</MenuItem>
            <MenuItem value='Claims'>Claims</MenuItem>
            <MenuItem value='Retread'>Retread</MenuItem>
            <MenuItem value='Queries'>Queries</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            select
            fullWidth
            label='frequency'
            id='form-layouts-separator-select'
            defaultValue={frequency}
            onChange={handleFrequency}
          >
            <MenuItem value='Daily'>Daily</MenuItem>
            <MenuItem value='Weekly'>Weekly</MenuItem>
            <MenuItem value='Monthly'>Monthly</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            fullWidth
            label='Email'
            id='form-layouts-separator-select'
            defaultValue={email}
            onChange={handleEmail}
          ></CustomTextField>
        </Grid>
        <Grid container justifyContent='center'>
          <Button type='submit' variant='contained' sx={{ mr: 4 }}>
            SUBMIT
          </Button>
          <Button variant='tonal' color='secondary' onClick={() => handleCancel()}>
            CANCEL
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default EditModal
