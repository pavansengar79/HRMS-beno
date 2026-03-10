// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import { uploadFilesToAws } from 'src/utils/helper'
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

// ** Third Party Imports

// ** Icon Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchData } from 'src/store/apps/productsPage/productsDetails'
import { fetchSizeData, updateData } from 'src/store/apps/productsPage/products'
import { fetchData as fetchData2 } from 'src/store/apps/productsPage/compatibleVehicles'
import QuestionFields from './QuestionFields'
import { styled } from '@mui/material/styles'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { Typography } from '@mui/material'

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

const defaultQuestionObject = [{ title: null, description: null, icon: null }]

const EditModal = ({ rowData, onClose }) => {
  // ** States

  let arr = rowData.productDescription.map((item, i) => {
    let obj = {
      title: item.title,
      description: item.description,
      icon: item.icon
    }

    return obj
  })
  const [details, setDetails] = useState(rowData?.productDetails)
  const [compatible, setCompatible] = useState(rowData?.compatibleVehicles)
  const [size, setSize] = useState(rowData?.sizesAvailable)
  const [image, setImage] = useState(rowData?.productDetails?.icon)
  const [image3D, setImage3D] = useState(rowData?.productDetails?.icon)
  const [questionList, setQuestionList] = useState(arr)
  const [search, setSearch] = useState('')
  const [fileuploaded, setfileuploaded] = useState('')
  const [Dfileuploaded, setDfileuploaded] = useState('')

  const dispatch = useDispatch()
  const data1 = useSelector(state => state.productsDetails)
  const data2 = useSelector(state => state.compatibleVehicles)
  const data3 = useSelector(state => state.productsPage)
  const options1 = data1.data
  const options2 = data2.data
  const options3 = data3.size

  useEffect(() => {
    dispatch(fetchData({ search: search }))
    dispatch(fetchData2({ search: search }))
    dispatch(fetchSizeData({ search: search }))
  }, [dispatch, search])

  const handleImage = async e => {
    e.target.files[0].name.length > 16
      ? setfileuploaded(e.target.files[0].name.slice(0, 16) + '...')
      : setfileuploaded(e.target.files[0].name)
    const bucket = await uploadFilesToAws(e.target.files)
    setImage(bucket[0])
  }

  const handleImage3D = async e => {
    e.target.files[0].name.length > 16
      ? setDfileuploaded(e.target.files[0].name.slice(0, 16) + '...')
      : setDfileuploaded(e.target.files[0].name)
    const bucket = await uploadFilesToAws(e.target.files)
    setImage3D(bucket[0])
  }

  const handleDetails = (event, value) => {
    console.log('value', value)
    setDetails(value)
  }

  const handleCompatible = (event, value) => {
    console.log('value', value)
    setCompatible(value)
  }

  const handleSize = (event, value) => {
    console.log('value', value)
    setSize(value)
  }

  const handleAdd = () => {
    setQuestionList(prev => [...prev, defaultQuestionObject])
  }

  const handleRemove = index => {
    setQuestionList(prev => prev.filter((q, i) => i != index))
  }

  const handleSubmit = async e => {
    dispatch(
      updateData({
        id: rowData._id,
        data: {
          productDetails: details,
          compatibleVehicles: compatible,
          sizesAvailable: size,
          imageUrl: image,
          threeDImages: image3D,
          productDesc: questionList
        }
      })
    )
    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <CustomAutocomplete
            freeSolo
            multiple
            value={details}
            id='autocomplete-multiple-filled'
            options={options1}
            getOptionLabel={option => option?.name}
            onChange={handleDetails}
            onInputChange={e => setSearch(e.target.value)}
            renderInput={params => <CustomTextField {...params} variant='filled' label='Product Details ' />}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip label={option?.name} {...getTagProps({ index })} key={index} />)
            }
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <CustomAutocomplete
            freeSolo
            multiple
            id='autocomplete-multiple-filled'
            value={compatible}
            options={options2}
            getOptionLabel={option => option.name}
            onChange={handleCompatible}
            onInputChange={e => setSearch(e.target.value)}
            renderInput={params => <CustomTextField {...params} variant='filled' label='Compatible Vehicles' />}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip label={option.name} {...getTagProps({ index })} key={index} />)
            }
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <CustomAutocomplete
            freeSolo
            multiple
            id='autocomplete-multiple-filled'
            value={size}
            options={options3}
            getOptionLabel={option => option.Ydesc}
            onChange={handleSize}
            onInputChange={e => setSearch(e.target.value)}
            renderInput={params => <CustomTextField {...params} variant='filled' label='Available Sizes' />}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip label={option.Ydesc} {...getTagProps({ index })} key={index} />)
            }
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <div>
            {image && <img alt='Product Image' width='50px' height='50px' src={image}></img>}

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
            </>
            {/* <CustomTextField
              name='asset'
              type='file'
              fullWidth
              label='image'
              InputProps={{
                inputProps: {
                  accept: 'image/*'
                }
              }}
              placeholder='Select a file'
              id='form-layouts-separator-select'
              onChange={handleImage}
            ></CustomTextField> */}
          </div>
        </Grid>
        <Grid item xs={12} sm={12}>
          {image3D && <img alt='3D Image' width='50px' height='50px' src={image3D}></img>}

          <>
            <Box sx={{ mb: 0.5 }}>
              <Typography> Image 3D</Typography>
            </Box>
            <Button
              sx={{ width: '100%', mb: 4 }}
              component='label'
              role={undefined}
              variant='contained'
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              {Dfileuploaded == '' ? 'Upload File' : Dfileuploaded}
              <VisuallyHiddenInput
                type='file'
                onChange={handleImage3D}
                id='form-layouts-separator-select'
                InputProps={{
                  inputProps: {
                    accept: 'image/*'
                  }
                }}
              />
            </Button>
          </>
          {/* <CustomTextField
            name='asset3d'
            type='file'
            InputProps={{
              inputProps: {
                accept: 'image/*'
              }
            }}
            fullWidth
            label='image 3D'
            placeholder='Select a file'
            id='form-layouts-separator-select'
            onChange={handleImage3D}
          ></CustomTextField> */}
        </Grid>
        <Grid item xs={12} sm={12}>
          {questionList.map((question, i) => (
            <QuestionFields
              questionList={question}
              key={i}
              handleRemove={handleRemove}
              index={i}
              onChange={({ name, value }, modifiedIndex) => {
                setQuestionList(prev => {
                  return prev.map((q, i) => {
                    if (i == modifiedIndex) {
                      return { ...q, [name]: value }
                    } else {
                      return q
                    }
                  })
                })
              }}
            />
          ))}
        </Grid>
        <Button onClick={handleAdd} sx={{ mr: 2, mt: 5 }} variant='contained'>
          ADD NEW PRODUCT DESCRIPTION
        </Button>
        <Button onClick={handleSubmit} sx={{ mr: 2, mt: 5 }} variant='contained' fullWidth>
          SUBMIT
        </Button>
      </Grid>
    </form>
  )
}

export default EditModal
