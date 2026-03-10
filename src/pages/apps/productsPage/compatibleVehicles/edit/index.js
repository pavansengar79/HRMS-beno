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
import { updateData } from 'src/store/apps/productsPage/compatibleVehicles'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import { uploadFilesToAws } from 'src/utils/helper'

// ** Third Party Imports

// ** Icon Imports
import { useDispatch, useSelector } from 'react-redux'
import { styled } from '@mui/material/styles'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

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

const EditModal = ({ onClose, data }) => {
  // ** States
  console.log('row', data)
  const [image, setImage] = useState(data?.icon)
  const [name, setName] = useState(data?.name)
  const [error, setError] = useState({ nameError: false, imageError: false })
  const [fileuploaded, setfileuploaded] = useState('')

  const dispatch = useDispatch()

  const handleSubmit = e => {
    e.preventDefault()
    if (!name) {
      setError(prev => ({
        ...prev,
        nameError: true
      }))
    } else if (!image) {
      setError(prev => ({
        ...prev,
        imageError: true
      }))
    } else {
      dispatch(updateData({ id: data?._id, data: { name: name, icon: image } }))
      onClose()
    }
  }

  const handleImage = async e => {
    e.target.files[0].name.length > 16
      ? setfileuploaded(e.target.files[0].name.slice(0, 16) + '...')
      : setfileuploaded(e.target.files[0].name)
    const bucket = await uploadFilesToAws(e.target.files)
    setImage(bucket[0])
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            fullWidth
            sx={{ mb: 2 }}
            value={name}
            placeholder='Name'
            label='Name'
            onChange={e => setName(e.target.value)}
            error={error.nameError}
            helperText={error.nameError ? 'This field is required' : ''}
          />
          <div>
            <img src={image} alt='Product Image' width='40px' height='40px'></img>
          </div>
          <>
            <Box sx={{ mb: 0.5 }}>
              <Typography> Image</Typography>
            </Box>
            <Button
              sx={{ width: '100%', mb: 4 }}
              component='label'
              role={undefined}
              variant='contained'
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              {fileuploaded == '' ? 'Upload File' : fileuploaded}
              <VisuallyHiddenInput type='file' onChange={handleImage} id='form-layouts-separator-select' />
            </Button>
            <Typography color='error' variant='body2'>
              {
                // error={error.imageError}
                error.imageError && 'This field is required'
              }
            </Typography>
          </>
          {/* <CustomTextField
            name='asset'
            type='file'
            fullWidth
            sx={{ mb: 4 }}
            label='image'
            placeholder='Select a file'
            id='form-layouts-separator-select'
            onChange={handleImage}
            error={error.imageError}
            helperText={error.imageError ? 'This field is required' : ''}
          ></CustomTextField> */}
        </Grid>
      </Grid>
      <Grid container justifyContent='center' columnGap={5} sx={{ mt: 5 }}>
        <Button type='submit' variant='contained'>
          SUBMIT
        </Button>
        <Button variant='tonal' color='secondary' onClick={onClose}>
          CANCEL
        </Button>
      </Grid>
    </form>
  )
}

export default EditModal
