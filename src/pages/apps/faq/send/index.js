// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import { sendNotification } from 'src/store/apps/notification'
import { useDispatch } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useState } from 'react'
import Typography from '@mui/material/Typography'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  overflowY: 'scroll',
  maxHeight: '700px',
  p: 4
}

const ViewModal = ({ data, onClose }) => {
  console.log(data)
  const [message, setMessage] = useState('')
  const dispatch = useDispatch()

  const handleCancel = () => {
    onClose()
  }

  return (
    <form>
      <Grid container spacing={5}>
        {data?.question?.map((item, i) => (
          <Grid key={i} item xs={12} sm={12}>
            <Typography variant='body1' sx={{ fontWeight: 900 }}>
              {item.title}
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 900 }}>
              {item.description}
            </Typography>
            {item?.asset && <img src={item?.asset} alt='Uploaded Image' style={{ width: '200px' }} />}
          </Grid>
        ))}
      </Grid>
    </form>
  )
}

export default ViewModal
