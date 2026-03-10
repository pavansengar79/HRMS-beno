// ** React Imports
import { forwardRef, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import { updateQueryData } from 'src/store/apps/query'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

import { useDispatch } from 'react-redux'
import moment from 'moment/moment'

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

const ActionModal = ({ data, onClose }) => {
  console.log('daaa', data)

  // ** States

  const [status, setStatus] = useState(data?.status)
  const [remark, setRemark] = useState(data?.remark)

  const dispatch = useDispatch()

  const handleStatus = event => {
    setStatus(event.target.value)
  }

  const handleRemark = event => {
    setRemark(event.target.value)
  }

  const handleSubmit = () => {
    dispatch(updateQueryData({ status: status, remark: remark, queryId: data?._id }))
    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Box sx={style}>
      <Card>
        <CardHeader
          title={`Raised Ticket - ${moment.utc(data?.createdAt).add(330, 'minutes').format('YYYY-MM-DD : HH:MM')}`}
        />
        <Divider sx={{ m: '0 !important' }} />
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <Typography variant='body2' sx={{ fontWeight: 900 }}>
                  Name : {data?.user?.Name1}
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 900 }}>
                  Kunnr : {data?.user?.Kunnr}
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 900 }}>
                  City : {data?.user?.City1}
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 900 }}>
                  State : {data?.user?.state}
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 900 }}>
                  Category : {data?.category}
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 900 }}>
                  Subject : {data?.subject}
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 900 }}>
                  Description : {data?.description}
                </Typography>
              </Grid>
              <Divider sx={{ m: '0 !important' }} />
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  fullWidth
                  label='Status'
                  id='form-layouts-separator-select'
                  defaultValue={data?.status}
                  onChange={handleStatus}
                >
                  <MenuItem value='IN PROGRESS'>IN PROGRESS</MenuItem>
                  <MenuItem value='RESOLVED'>RESOLVED</MenuItem>
                  <MenuItem value='OPEN'>OPEN</MenuItem>
                </CustomTextField>
                <CustomTextField fullWidth label='Remark' value={remark} onChange={handleRemark} />
              </Grid>
              <Grid item xs={12} sm={6}></Grid>
            </Grid>
            <Button onClick={handleSubmit} sx={{ mr: 2, mt: 4 }} variant='contained'>
              Submit
            </Button>
            <Button onClick={handleCancel} sx={{ mr: 2, mt: 4 }} variant='outlined'>
              cancel
            </Button>
          </CardContent>
        </form>
      </Card>
    </Box>
  )
}

export default ActionModal
