// ** React Imports
import { useEffect, useState, forwardRef } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import TableRow from '@mui/material/TableRow'
import Collapse from '@mui/material/Collapse'
import TableBody from '@mui/material/TableBody'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import TableContainer from '@mui/material/TableContainer'
import TableCell from '@mui/material/TableCell'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import axios from 'axios'
import * as yup from 'yup'
import DatePicker from 'react-datepicker'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Custom Component Imports
import Repeater from 'src/@core/components/repeater'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { queryCategoryEdit } from 'src/store/apps/query-category'

const RepeatingContent = styled(Grid)(({ theme }) => ({
  paddingRight: 0,
  display: 'flex',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,

  //   border: `1px solid ${theme.palette.divider}`,
  '& .col-title': {
    top: '-2.375rem',
    position: 'absolute'
  },
  [theme.breakpoints.down('md')]: {
    '& .col-title': {
      top: '0',
      position: 'relative'
    }
  }
}))

const RepeaterWrapper = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(0, 0, 0),
  '& .repeater-wrapper + .repeater-wrapper': {
    marginTop: theme.spacing(0)
  },
  [theme.breakpoints.down('md')]: {
    paddingTop: theme.spacing(0)
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(6)
  }
}))

const InvoiceAction = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  padding: theme.spacing(2, 1)

  //   borderLeft: `1px solid ${theme.palette.divider}`
}))

const EditCard = ({ rowData, handleClose }) => {
  // ** States
  const [count, setCount] = useState(rowData?.subcategory?.length)
  const [selected, setSelected] = useState('')
  const [clients, setClients] = useState(undefined)
  const [selectedClient, setSelectedClient] = useState(null)

  // ** Hook
  const theme = useTheme()
  const router = useRouter()
  const dispatch = useDispatch()
  const data = useSelector(state => state.queryCategory)

  // useEffect(() => {
  //   axios.get('/apps/invoice/clients').then(response => {
  //     if (response.data && clients === undefined) {
  //       setClients(response.data)
  //       setSelected(response.data[0].name)
  //       setSelectedClient(response.data[0])
  //     }
  //   })
  // }, [clients])

  // ** Deletes form
  const deleteForm = e => {
    e.preventDefault()

    // @ts-ignore
    e.target.closest('.repeater-wrapper').remove()
  }

  // ** Handle Invoice To Change
  const handleInvoiceChange = e => {
    setSelected(e.target.value)
    if (clients !== undefined) {
      setSelectedClient(clients.filter(i => i.name === e.target.value)[0])
    }
  }

  const schema = yup.object().shape({
    category: yup.string().required(),
    subCategory: yup.array().required()
  })
  console.log('row', rowData)

  const defaultValues = {
    category: rowData?.name,
    subCategory: rowData?.subcategory?.map(item => item?.name)
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
    console.log(data)
    const id = rowData?._id
    const category = data?.category
    const subCategory = []
    data?.subCategory?.map(sub => subCategory.push({ name: sub }))
    const send = { category, subCategory, id }
    console.log('se', send)

    dispatch(queryCategoryEdit(send))
    handleClose()
  }

  // if (data.fileUploadStatus == 'LOADED') {
  //   router.push('/apps/query-category/')
  // }

  // const handleSubmit = () => {
  //   dispatch(updateQueryData({ status: status, remark: remark, queryId: data._id }))
  //   handleCancel()
  // }

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

  return (
    <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
      <Grid container columnSpacing={4}>
        <Grid item xs={12} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
          <Box sx={{ mb: 4 }}>
            <Controller
              name='category'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur, defaultValue } }) => (
                <CustomTextField
                  fullWidth
                  label='Category'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder='Enter Category'
                  error={Boolean(errors.category)}
                  {...(errors.category && { helperText: errors.category.message })}
                />
              )}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
          <RepeaterWrapper>
            <Repeater count={count}>
              {i => {
                const Tag = i === 0 ? Box : Collapse

                return (
                  <Tag key={i} className='repeater-wrapper' {...(i !== 0 ? { in: true } : {})}>
                    <Grid container>
                      <RepeatingContent item xs={12}>
                        <Controller
                          name={`subCategory[${i}]`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { value, onChange, onBlur } }) => (
                            <CustomTextField
                              fullWidth
                              label={`Sub-Category ${i + 1}`}
                              value={value}
                              onBlur={onBlur}
                              onChange={onChange}
                              placeholder='Enter SubCategory'
                              error={Boolean(errors.subCategory)}
                              {...(errors.subCategory && { helperText: errors.subCategory.message })}
                            />
                          )}
                        />
                        <InvoiceAction>
                          <IconButton size='small' onClick={deleteForm}>
                            <Icon icon='tabler:x' fontSize='1.25rem' />
                          </IconButton>
                        </InvoiceAction>
                      </RepeatingContent>
                    </Grid>
                  </Tag>
                )
              }}
            </Repeater>

            <Grid container sx={{ mt: 5 }}>
              <Grid item xs={12} sx={{ px: 0 }}>
                <Button variant='contained' onClick={() => setCount(count + 1)}>
                  Add Sub-Category
                </Button>
              </Grid>
            </Grid>
          </RepeaterWrapper>
        </Grid>
      </Grid>
      <Grid container justifyContent='center' columnGap={4}>
        <Button type='submit' variant='contained'>
          EDIT
        </Button>
        <Button variant='outlined' onClick={handleClose}>
          BACK
        </Button>
      </Grid>
    </form>
  )
}

export default EditCard
