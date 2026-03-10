// ** React Imports
import { useState, forwardRef } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import { styled, alpha, useTheme } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import TableCell from '@mui/material/TableCell'
import CardContent from '@mui/material/CardContent'

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
import { da } from 'date-fns/locale'
import toast from 'react-hot-toast'

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

const AddCard = props => {
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
    } else {
      // setError('Please fill all fields')
      setSubmitButton(false)
      toast.error('Please enter all the fields', { duration: 2000 })
    }
  }

  if (data.bannerUploadStatus == 'LOADED') {
    router.push('/apps/banner/list')
  }

  return (
    <Card>
      <Divider />

      <CardContent sx={{ p: [`${theme.spacing(6)} !important`, `${theme.spacing(10)} !important`] }}>
        <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
          <Grid container columnSpacing={4}>
            <Grid item xs={12} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
              <Box sx={{ mb: 4 }}>
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <CustomTextField
                      fullWidth
                      label='Name'
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      placeholder='Enter File Name'
                      error={Boolean(errors.name)}
                      {...(errors.name && { helperText: errors.name.message })}
                    />
                  )}
                />
              </Box>
              <Box sx={{ mb: 4 }}>
                <Controller
                  name='file'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      disabled={fileInput}
                      fullWidth
                      onBlur={field.onBlur}
                      label='File'
                      inputProps={{
                        accept: fileAccept
                      }}
                      onChange={e => {
                        const file = e.target.files
                        field.onChange(file)
                      }}
                      id='auth-login-v2-password'
                      type='file'
                      error={Boolean(errors.file)}
                      {...(errors.file && { helperText: errors.file.message })}
                    />
                  )}
                />
              </Box>
              <Grid container columnSpacing={3} sx={{ mt: 1.5 }}>
                <Grid item>
                  <Button variant='outlined' sx={{ mb: 4 }} onClick={() => router.back()}>
                    Back
                  </Button>
                </Grid>
                <Grid item>
                  <Button disabled={submitButton} type='submit' variant='contained' sx={{ mb: 4 }}>
                    ADD
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
              <Box sx={{ mt: -2 }}>
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
                      sx={{
                        mb: 4,
                        '& .MuiInputLabel-root': {
                          fontSize: theme => theme.typography.body1.fontSize,
                          lineHeight: theme => theme.typography.body1.lineHeight
                        }
                      }}
                      error={Boolean(errors.type)}
                      {...(errors.type && { helperText: errors.type.message })}
                    >
                      <MenuItem value={'file'}>Select File Type</MenuItem>
                      <MenuItem value={'Image'}>Image</MenuItem>
                      <MenuItem value={'Video'}>Video</MenuItem>
                      {/* <MenuItem value={'Audio'}>Audio</MenuItem>
                      <MenuItem value={'Document'}>Document</MenuItem> */}
                    </CustomTextField>
                  )}
                />
              </Box>
              <Box sx={{ mt: -1 }}>
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
                      sx={{
                        mb: 4,
                        '& .MuiInputLabel-root': {
                          fontSize: theme => theme.typography.body1.fontSize,
                          lineHeight: theme => theme.typography.body1.lineHeight
                        }
                      }}
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
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>

      <Divider />
    </Card>
  )
}

export default AddCard
