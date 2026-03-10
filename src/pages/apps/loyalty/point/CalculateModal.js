// ** React Imports
import { forwardRef, useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import { fetchSchemeData } from 'src/store/apps/scheme'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import { uploadFilesToAws } from 'src/utils/helper'

// ** Third Party Imports

// ** Icon Imports
import { useDispatch, useSelector } from 'react-redux'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const AddModal = ({ onClose }) => {
  // ** States

  const [image, setImage] = useState()
  const [image1, setImage1] = useState()
  const [schemeValue, setSchemeValue] = useState()

  const dispatch = useDispatch()

  const data = useSelector(state => state.scheme)
  console.log('data', data)

  useEffect(() => {
    dispatch(fetchSchemeData())
  }, [])

  const handleSubmit = () => {
    // dispatch(addData({ name: name, icon: image }))
    onClose()
  }

  const handleDownload = () => {
    // dispatch(addData({ name: name, icon: image }))
  }

  const handleStatusValue = async e => {
    setSchemeValue(e.target.value)
  }

  const handleImage = async e => {
    const bucket = await uploadFilesToAws(e.target.files)
    setImage(bucket[0])
  }

  const handleImage1 = async e => {
    const bucket = await uploadFilesToAws(e.target.files)
    setImage1(bucket[0])
  }

  return (
    <Box sx={style}>
      <Card>
        <CardHeader title='Calculate Loyalty Scheme Points Fleets' />
        <Divider sx={{ m: '0 !important' }} />
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={12} container gap={3}>
                <CustomTextField
                  select
                  fullWidth
                  label='Select scheme'
                  SelectProps={{ value: schemeValue, onChange: e => handleStatusValue(e) }}
                >
                  {data?.scheme?.map(item => (
                    <MenuItem key={item?._id} value={item?._id}>
                      {item?.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
                <CustomTextField
                  name='asset'
                  type='file'
                  fullWidth
                  sx={{ mb: 4 }}
                  label='Upload Fleets Sales CSV :'
                  placeholder='Select a file'
                  id='form-layouts-separator-select'
                  onChange={handleImage}
                ></CustomTextField>
                <CustomTextField
                  name='asset'
                  type='file'
                  fullWidth
                  sx={{ mb: 4 }}
                  label='Upload Fleets Club CSV :'
                  placeholder='Select a file'
                  id='form-layouts-separator-select'
                  onChange={handleImage1}
                ></CustomTextField>
              </Grid>
            </Grid>
            <Button onClick={handleSubmit} sx={{ mr: 2, mt: 4 }} variant='contained' fullWidth>
              Upload Data
            </Button>
            <Button onClick={handleDownload} sx={{ mr: 2, mt: 4 }} variant='outlined' fullWidth>
              Download CSV
            </Button>
          </CardContent>
        </form>
      </Card>
    </Box>
  )
}

export default AddModal
