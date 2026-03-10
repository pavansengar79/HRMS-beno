// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import { sendNotification } from 'src/store/apps/notification'
import { useDispatch } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useState } from 'react'

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

const SendModal = ({ data, onClose }) => {
  const [message, setMessage] = useState('')
  const dispatch = useDispatch()

  const handleMessage = e => {
    setMessage(e.target.value)
  }

  const handleSubmit = () => {
    dispatch(sendNotification({ id: data?._id, message: message }))
    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            fullWidth
            sx={{ mb: 4 }}
            label='Message'
            placeholder='Message'
            id='form-layouts-separator-select'
            onChange={handleMessage}
          ></CustomTextField>
          <Button onClick={handleCancel} sx={{ mr: 2, mt: 5 }} variant='tonal' color='secondary'>
            CANCEL
          </Button>
          <Button onClick={handleSubmit} sx={{ mr: 2, mt: 5 }} variant='contained' color='primary'>
            SEND NOTIFICATION
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default SendModal
