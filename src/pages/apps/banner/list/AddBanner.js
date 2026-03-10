// ** React Imports
import { useState, forwardRef } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'

// ** Icon Imports

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useDispatch, useSelector } from 'react-redux'

// ** Configs

// ** Custom Component Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import { useRouter } from 'next/router'
import { uploadFilesToAws } from 'src/utils/helper'
import { uploadBanner } from 'src/store/apps/banner'
import toast from 'react-hot-toast'
import FileUploaderRestrictions from '../FileUploader'
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

const schema = yup.object().shape({
  name: yup.string().required(),
  file: yup
    .mixed()
    .required()
    .test('fileResolution', 'File resolution should be equal to 1566px (width) X 306px (height)', async files => {
      if (!files) return true
      if (files.length === 0) return
      const file = files[0]
      const image = new Image()
      image.src = window?.URL?.createObjectURL(file)

      return new Promise((resolve, reject) => {
        image.onload = function () {
          const width = this.width
          const height = this.height

          if (width === 1566 && height === 306) {
            resolve(true)
          } else {
            resolve(false)
          }
        }
        image.onerror = function () {
          reject(new Error('Error loading image'))
        }
      })
    }),

  type: yup.string().required(),
  platform: yup.string().required()

  // type: yup.mixed().test('required', 'Please Select a file', val => val && val.length),
})

const defaultValues = {
  name: '',
  type: 'file',
  file: '',
  platform: 'platform'
}

const AddCard = ({ handleClose }) => {
  // ** Props

  // ** States

  // ** Hook
  const theme = useTheme()
  const router = useRouter()
  const dispatch = useDispatch()
  const data = useSelector(state => state.banner)
  const [fileInput, setFileInput] = useState(true)
  const [submitButton, setSubmitButton] = useState(false)
  const [fileAccept, setFileAccept] = useState('/*')
  const [fileuploaded, setfileuploaded] = useState('')

  // ** Deletes form
  //   const deleteForm = e => {
  //     e.preventDefault()

  //     // @ts-ignore
  //     e.target.closest('.repeater-wrapper').remove()
  //   }

  // ** Handle Invoice To Change

  const {
    control,
    setError,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, dirtyFields }
  } = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema)
  })

  const onFileChange = e => {
    console.log('e', e.target.value)
    if (e.target.value === 'file') {
      setFileInput(true)
    } else {
      setFileInput(false)
    }
  }

  const onSubmit = async data => {
    setSubmitButton(true)
    console.log('file', data)
    if (data.file && data.type != 'file' && data.name.length > 0 && data.platform != 'platform') {
      const bucket = await uploadFilesToAws(data.file)
      console.log('bucket', bucket)
      data.file = bucket[0]
      dispatch(uploadBanner(data))
      handleClose()
    } else {
      // setError('Please fill all fields')
      setSubmitButton(false)
      toast.error('Please enter all the fields', { duration: 2000 })
    }
  }

  return (
    <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
      <Grid container rowGap={6}>
        <Grid item xs={12} sm={12}>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <CustomTextField
                fullWidth
                label='Banner Title'
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder='Enter Banner Title'
                error={Boolean(errors.name)}
                {...(errors.name && { helperText: errors.name.message })}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <Controller
            name='type'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                placeholder='filetype'
                select
                fullWidth
                label='Select File Type'
                value={field.value}
                onChange={e => {
                  e.target.value === 'file' ? setFileInput(true) : setFileInput(false)
                  e.target.value === 'Image'
                    ? setFileAccept('image/*')
                    : e.target.value === 'Video'
                    ? setFileAccept('video/*')
                    : setFileAccept('/*')

                  field.onChange(e.target.value)
                }}
                error={Boolean(errors.type)}
                {...(errors.type && { helperText: errors.type.message })}
              >
                <MenuItem value={'file'}>Select File Type</MenuItem>
                <MenuItem value={'Image'}>Image</MenuItem>
                {/* <MenuItem value={'Video'}>Video</MenuItem> */}
                {/* <MenuItem value={'Audio'}>Audio</MenuItem>
                      <MenuItem value={'Document'}>Document</MenuItem> */}
              </CustomTextField>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <Controller
            name='platform'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <CustomTextField
                select
                fullWidth
                label='Platform'
                value={value}
                onChange={onChange}
                error={Boolean(errors.platform)}
                {...(errors.platform && { helperText: errors.platform.message })}
              >
                <MenuItem value={'platform'}>Select Platform</MenuItem>
                <MenuItem value={'Web'}>Web</MenuItem>
                <MenuItem value={'Mobile'}>Mobile</MenuItem>
                <MenuItem value={'Both'}>Both</MenuItem>
              </CustomTextField>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={12}>
          {/* <FileUploaderRestrictions /> */}

          <Controller
            name='file'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <>
                <Box sx={{ mb: 0.5 }}>
                  <Typography> File*</Typography>
                </Box>
                <Button
                  sx={{ width: '100%' }}
                  component='label'
                  role={undefined}
                  variant='contained'
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                >
                  {field.value ? fileuploaded : 'Upload File'}
                  <VisuallyHiddenInput
                    type='file'
                    inputProps={{
                      accept: fileAccept
                    }}
                    onChange={e => {
                      let file = e.target.files
                      console.log('selecgt', file[0].name.length)
                      setValue('file', file)
                      {
                        file[0].name.length > 16
                          ? setfileuploaded(file[0].name.slice(0, 16) + '...')
                          : setfileuploaded(file[0].name)
                      }
                    }}
                    id='auth-login-v2-password'
                  />
                </Button>
                <Typography color='error' variant='body2'>
                  {
                    // error={Booleaan(errors.file)}
                    errors.file && errors.file.message
                  }
                </Typography>
              </>
              // <CustomTextField
              //   fullWidth
              //   onBlur={field.onBlur}
              //   label='File'
              //   inputProps={{
              //     accept: fileAccept
              //   }}
              //   onChange={e => {
              //     const file = e.target.files
              //     field.onChange(file)
              //   }}
              //   id='auth-login-v2-password'
              //   type='file'
              //   error={Boolean(errors.file)}
              //   {...(errors.file && { helperText: errors.file.message })}
              //   disabled={fileInput}
              // />
            )}
          />
        </Grid>
        <Grid container justifyContent='center'>
          <Button disabled={submitButton} type='submit' variant='contained' sx={{ mr: 4 }}>
            SUBMIT
          </Button>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            CANCEL
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default AddCard
