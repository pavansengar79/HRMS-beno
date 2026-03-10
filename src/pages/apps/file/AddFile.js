// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
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
import { uploadFile } from 'src/store/apps/file'
import { uploadFilesToAws } from 'src/utils/helper'
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
  name: yup.string().required('Please enter your name'),

  file: yup.string().required(),
  file: yup.mixed().test('required', 'Please Select a file', val => val && val.length),
  type: yup.string().required('Please select file type'),
  Dltype: yup.string().required('Please select DL type')
})

const defaultValues = {
  name: '',
  type: '',
  file: '',
  Dltype: ''
}

const AddFile = ({ handleClose }) => {
  // ** Props

  // ** States

  const [submitButton, setSubmitButton] = useState(false)
  const [fileAccept, setFileAccept] = useState('/*')
  const [fileuploaded, setfileuploaded] = useState('')

  // const [fileuploaded, setfileuploaded] = useState()

  // ** Hook
  const dispatch = useDispatch()

  // ** Deletes form

  // ** Handle Invoice To Change

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = async data => {
    setSubmitButton(true)

    if (data.file && data.type != 'file' && data.name.length > 0 && data.Dltype != 'DlType') {
      const bucket = await uploadFilesToAws(data.file)
      setfileuploaded(true)
      console.log('bucket', bucket)
      data.file = bucket[0]
      dispatch(uploadFile(data))
      handleClose()
    } else {
      setSubmitButton(false)
    }
  }

  return (
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
                  label='Name*'
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
        </Grid>
        <Grid item xs={12} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
          <Box sx={{ mt: -2 }}>
            <Controller
              name='type'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Select File Type*'
                  value={field.value}
                  onChange={e => {
                    e.target.value === 'Image'
                      ? setFileAccept('image/*')
                      : e.target.value === 'Video'
                      ? setFileAccept('video/*')
                      : e.target.value === 'Audio'
                      ? setFileAccept('audio/*')
                      : e.target.value === 'Document'
                      ? setFileAccept('.doc, .docx, .pdf, .txt, .xls, xlsx, .csv')
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
                  {/* <MenuItem disabled value={'file'}>
                    Select File Type
                  </MenuItem> */}
                  <MenuItem value={'Image'}>Image</MenuItem>
                  <MenuItem value={'Video'}>Video</MenuItem>
                  <MenuItem value={'Audio'}>Audio</MenuItem>
                  <MenuItem value={'Document'}>Document</MenuItem>
                </CustomTextField>
              )}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
          <Box sx={{ mb: 1.2 }}>
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
                      accept={fileAccept}
                      onChange={e => {
                        let file = e.target.files
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
                //   inputProps={{
                //     accept: fileAccept
                //   }}
                //   onBlur={field.onBlur}
                //   label='File*'
                //   onChange={e => {
                //     const file = e.target.files
                //     field.onChange(file)
                //   }}
                //   id='auth-login-v2-password'
                //   type='file'
                //   error={Boolean(errors.file)}
                //   {...(errors.file && { helperText: errors.file.message })}
                // />
              )}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ mt: -1 }}>
            <Controller
              name='Dltype'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Select DL Type*'
                  value={value}
                  onChange={onChange}
                  sx={{
                    mb: 4,
                    '& .MuiInputLabel-root': {
                      fontSize: theme => theme.typography.body1.fontSize,
                      lineHeight: theme => theme.typography.body1.lineHeight
                    }
                  }}
                  error={Boolean(errors.Dltype)}
                  {...(errors.Dltype && { helperText: errors.Dltype.message })}
                >
                  {/* <MenuItem value={'DlType'} disabled>
                    Select DL Type
                  </MenuItem> */}
                  <MenuItem value={'DL'}>DL</MenuItem>
                  <MenuItem value={'DB'}>DB</MenuItem>
                  <MenuItem value={'RT'}>RT</MenuItem>
                  <MenuItem value={'FM'}>FM</MenuItem>
                </CustomTextField>
              )}
            />
          </Box>
        </Grid>
      </Grid>
      <Grid container justifyContent='center'>
        <Button variant='tonal' color='secondary' onClick={handleClose} sx={{ mr: 4 }}>
          CANCEL
        </Button>
        <Button disabled={submitButton} type='submit' variant='contained'>
          SUBMIT
        </Button>
      </Grid>
    </form>
  )
}

export default AddFile
