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

const CustomInput = forwardRef(({ ...props }, ref) => {
  return <CustomTextField fullWidth inputRef={ref} sx={{ width: { sm: '250px', xs: '170px' } }} {...props} />
})
const now = new Date()
const tomorrowDate = now.setDate(now.getDate() + 7)

const schema = yup.object().shape({
  name: yup.string().required(),
  file: yup.string().required(),
  type: yup.mixed().test('required', 'Please Select a file', val => val && val.length),
  Dltype: yup.string().required()
})

const defaultValues = {
  name: '',
  type: '',
  file: '',
  Dltype: ''
}

const AddCard = props => {
  // ** Props
  const { clients, invoiceNumber, selectedClient, setSelectedClient, toggleAddCustomerDrawer } = props

  // ** States
  const [count, setCount] = useState(1)
  const [selected, setSelected] = useState('')
  const [issueDate, setIssueDate] = useState(new Date())
  const [dueDate, setDueDate] = useState(new Date(tomorrowDate))

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

  const onSubmit = data => {

    dispatch(uploadFile(data))
  }
  if (data.fileUploadStatus == 'LOADED') {
    router.push('/apps/file/list')
  }

  return (
    <Card>
      {/* <CardContent sx={{ p: [`${theme.spacing(6)} !important`, `${theme.spacing(10)} !important`] }}>
        <Grid container>
          <Grid item xl={6} xs={12} sx={{ mb: { xl: 0, xs: 4 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 6, display: 'flex', alignItems: 'center' }}>
                <svg width={34} viewBox='0 0 32 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    fill={theme.palette.primary.main}
                    d='M0.00172773 0V6.85398C0.00172773 6.85398 -0.133178 9.01207 1.98092 10.8388L13.6912 21.9964L19.7809 21.9181L18.8042 9.88248L16.4951 7.17289L9.23799 0H0.00172773Z'
                  />
                  <path
                    fill='#161616'
                    opacity={0.06}
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M7.69824 16.4364L12.5199 3.23696L16.5541 7.25596L7.69824 16.4364Z'
                  />
                  <path
                    fill='#161616'
                    opacity={0.06}
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M8.07751 15.9175L13.9419 4.63989L16.5849 7.28475L8.07751 15.9175Z'
                  />
                  <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    fill={theme.palette.primary.main}
                    d='M7.77295 16.3566L23.6563 0H32V6.88383C32 6.88383 31.8262 9.17836 30.6591 10.4057L19.7824 22H13.6938L7.77295 16.3566Z'
                  />
                </svg>
                <Typography variant='h4' sx={{ ml: 2.5, fontWeight: 700, lineHeight: '24px' }}>
                  {themeConfig.templateName}
                </Typography>
              </Box>
              <div>
                <Typography sx={{ mb: 2, color: 'text.secondary' }}>Office 149, 450 South Brand Brooklyn</Typography>
                <Typography sx={{ mb: 2, color: 'text.secondary' }}>San Diego County, CA 91905, USA</Typography>
                <Typography sx={{ color: 'text.secondary' }}>+1 (123) 456 7891, +44 (876) 543 2198</Typography>
              </div>
            </Box>
          </Grid>
          <Grid item xl={6} xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xl: 'flex-end', xs: 'flex-start' } }}>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Typography variant='h4' sx={{ mr: 2, width: '105px' }}>
                  File
                </Typography>
                <CustomTextField
                  fullWidth
                  value={invoiceNumber}
                  sx={{ width: { sm: '250px', xs: '170px' } }}
                  InputProps={{
                    disabled: true,
                    startAdornment: <InputAdornment position='start'>#</InputAdornment>
                  }}
                />
              </Box>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 3, width: '100px', color: 'text.secondary' }}>Date Issued:</Typography>
                <DatePicker
                  id='issue-date'
                  disabled='true'
                  selected={issueDate}
                  customInput={<CustomInput />}
                  onChange={date => setIssueDate(date)}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 3, width: '100px', color: 'text.secondary' }}>Date Due:</Typography>
                <DatePicker
                  id='due-date'
                  disabled='true'
                  selected={dueDate}
                  customInput={<CustomInput />}
                  onChange={date => setDueDate(date)}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent> */}

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
                      fullWidth
                      onBlur={field.onBlur}
                      label='File'
                      onChange={e => {
                        const file = e.target.files[0]
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
                  <Button type='submit' variant='contained' sx={{ mb: 4 }}>
                    ADD
                  </Button>
                </Grid>
              </Grid>
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
                      label='Select DL Type'
                      defaultValue='Select DL Type'
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
                      <MenuItem value={'Select Dl Type'} disabled>
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
          </Grid>
        </form>
      </CardContent>

      <Divider />
    </Card>
  )
}

export default AddCard
