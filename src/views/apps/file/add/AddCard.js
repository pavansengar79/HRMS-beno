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
import DatePicker from 'react-datepicker'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useDispatch, useSelector } from 'react-redux'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Custom Component Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import { useRouter } from 'next/router'
import { uploadFile } from 'src/store/apps/file'
import axios from 'axios'
import { uploadFilesToAws } from 'src/utils/helper'
import toast from 'react-hot-toast'

const CustomInput = forwardRef(({ ...props }, ref) => {
  return <CustomTextField fullWidth inputRef={ref} sx={{ width: { sm: '250px', xs: '170px' } }} {...props} />
})
const now = new Date()
const tomorrowDate = now.setDate(now.getDate() + 7)

const schema = yup.object().shape({
  name: yup.string().required('Please enter your name'),

  // file: yup.string().required(),
  file: yup.mixed().test('required', 'Please Select a file', val => val && val.length),
  type: yup.mixed().test('required', 'Please Select a file', val => val && val.length),
  Dltype: yup.string().required()
})

const defaultValues = {
  name: '',
  type: 'file',
  file: '',
  Dltype: 'DlType'
}

const AddCard = props => {
  // ** Props
  const { clients, invoiceNumber, selectedClient, setSelectedClient, toggleAddCustomerDrawer } = props

  // ** States
  const [count, setCount] = useState(1)
  const [selected, setSelected] = useState('')
  const [issueDate, setIssueDate] = useState(new Date())
  const [dueDate, setDueDate] = useState(new Date(tomorrowDate))
  const [fileInput, setFileInput] = useState(true)
  const [submitButton, setSubmitButton] = useState(false)
  const [fileAccept, setFileAccept] = useState('/*')

  // ** Hook
  const theme = useTheme()
  const router = useRouter()
  const dispatch = useDispatch()
  const data = useSelector(state => state.file)

  // ** Deletes form
  //   const deleteForm = e => {
  //     e.preventDefault()

  //     // @ts-ignore
  //     e.target.closest('.repeater-wrapper').remove()
  //   }

  // ** Handle Invoice To Change
  const handleInvoiceChange = event => {
    setSelected(event.target.value)
    if (clients !== undefined) {
      setSelectedClient(clients.filter(i => i.name === event.target.value)[0])
    }
  }

  const handleAddNewCustomer = () => {
    toggleAddCustomerDrawer()
  }

  const {
    control,
    setError,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, dirtyFields }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = async data => {
    console.log('>>', data)

    // setSubmitButton(true)
    // console.log('file', data)
    // if (data.file && data.type != 'file' && data.name.length > 0 && data.Dltype != 'DlType') {
    //   console.log('file', data.file)
    //   const bucket = await uploadFilesToAws(data.file)
    //   console.log('bucket', bucket)
    //   data.file = bucket[0]
    //   dispatch(uploadFile(data))
    // } else {
    //   // setError('Please fill all fields')
    //   setSubmitButton(false)

    //   toast.error('Please enter all the fields', { duration: 2000 })
    // }

    // const formData = new FormData()
    // formData.append('file', data.file)

    // const bucket = axios.post('https://jkconnect.s3-ap-south-1.amazonaws.com/', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   }
    // })
    // const bucket = await uploadFilesToAws(data.file)
    // console.log('bucket', bucket)
    // data.file = bucket[0]

    // dispatch(uploadFile(data))
  }

  if (data.fileUploadStatus == 'LOADED') {
    router.push('/apps/file/list')
  }

  return (
    
    // <Card>
    //   <Divider />
    //   <CardContent sx={{ p: [`${theme.spacing(6)} !important`, `${theme.spacing(10)} !important`] }}>

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
                    e.target.value === 'file' ? setFileInput(true) : setFileInput(false)
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
                  <MenuItem disabled value={'file'}>
                    Select File Type
                  </MenuItem>
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
          <Box sx={{ mb: 4 }}>
            <Controller
              name='file'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  fullWidth
                  inputProps={{
                    accept: fileAccept
                  }}
                  onBlur={field.onBlur}
                  label='File*'
                  onChange={e => {
                    const file = e.target.files
                    field.onChange(file)
                  }}
                  id='auth-login-v2-password'
                  type='file'
                  error={Boolean(errors.file)}
                  {...(errors.file && { helperText: errors.file.message })}
                />

                // disabled={fileInput}
              )}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
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
                  <MenuItem value={'DlType'} disabled>
                    Select DL Type
                  </MenuItem>
                  <MenuItem value={'DL'}>DL</MenuItem>
                  <MenuItem value={'DB'}>DB</MenuItem>
                  <MenuItem value={'RT'}>RT</MenuItem>
                  <MenuItem value={'FM'}>FM</MenuItem>
                </CustomTextField>
              )}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
          <Button variant='outlined' sx={{ mb: 4, mr: 4 }} onClick={() => router.back()}>
            Back
          </Button>

          <Button disabled={submitButton} type='submit' variant='contained' sx={{ mb: 4 }}>
            ADD
          </Button>
        </Grid>
      </Grid>
    </form>

    //   </CardContent>

    //   <Divider />
    // </Card>
  )
}

export default AddCard
