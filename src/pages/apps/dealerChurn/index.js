// ** React Imports
import { useState, useEffect, forwardRef } from 'react'
import 'react-datepicker/dist/react-datepicker.css'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'
import InputAdornment from '@mui/material/InputAdornment'
import CustomTextField from 'src/@core/components/mui/text-field'
import PickersCustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import OptionsMenu from 'src/@core/components/option-menu'
import Button from '@mui/material/Button'

import { TextField } from '@mui/material'
import TablePagination from '@mui/material/TablePagination'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { Stack } from '@mui/system'
import { Switch } from '@mui/material'
import { formateDate } from 'src/utils/helper'
import { fetchPaymentData, fetchDealerData } from 'src/store/apps/payment'
import { fetchSchemeData } from 'src/store/apps/dealerChurn'

// ** Styled component for the link in the dataTable
const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  fontSize: theme.typography.body1.fontSize,
  color: `${theme.palette.primary.main} !important`
}))

/* eslint-disable */
const CustomInput = forwardRef((props, ref) => {
  const startDate = props.start !== null ? format(props.start, 'MM/dd/yyyy') : ''
  const endDate = props.end !== null ? ` - ${format(props.end, 'MM/dd/yyyy')}` : null
  const value = `${startDate}${endDate !== null ? endDate : ''}`
  props.start === null && props.dates.length && props.setDates ? props.setDates([]) : null
  const updatedProps = { ...props }
  delete updatedProps.setDates
  return <CustomTextField fullWidth inputRef={ref} {...updatedProps} label={props.label || ''} value={value} />
})

/* eslint-enable */
const Payment = () => {
  // ** State
  const [month, setMonth] = useState(1)
  const [year, setYear] = useState('2024')

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 30 })

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.dealerChurn)

  // const dealers = data?.dealer
  // console.log('dealers', dealers)

  const files = data?.scheme?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })
  useEffect(() => {
    dispatch(fetchSchemeData({ paginationModel, month: month, year: year }))

    // dispatch(fetchDealerData(''))
  }, [paginationModel, month, year])

  const handleMonth = e => {
    setMonth(e.target.value)
  }

  const handleYear = e => {
    setYear(e.target.value)
  }

  const defaultColumns = [
    {
      flex: 0.1,
      field: 'id',
      minWidth: 50,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{row?.id}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'month',
      headerName: 'Month',
      renderCell: ({ row }) => <Typography>{months[row?.month - 1]}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'year',
      headerName: 'Year',
      renderCell: ({ row }) => <Typography>{row?.year}</Typography>
    }

    // {
    //   flex: 0.1,
    //   minWidth: 200,
    //   field: 'amount',
    //   headerName: 'Amount',
    //   renderCell: ({ row }) => <Typography>{row?.amount}</Typography>
    // },
    // {
    //   flex: 0.1,
    //   minWidth: 200,
    //   field: 'status',
    //   headerName: 'Status',
    //   renderCell: ({ row }) => <Typography>{row?.status}</Typography>
    // },
    // {
    //   flex: 0.1,
    //   minWidth: 200,
    //   field: 'createdat',
    //   headerName: 'CreatedAt',
    //   renderCell: ({ row }) => <Typography>{row?.createdAt.slice(0, 10)}</Typography>
    // }
  ]

  const columns = [
    ...defaultColumns,
    {
      flex: 0.1,
      minWidth: 140,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='Download'>
            {/* <IconButton size='small' sx={{ color: 'text.secondary' }} onClick={() => dispatch(deleteInvoice(row.id))}> */}
            <IconButton size='small' sx={{ color: 'text.secondary' }} href={row?.recordUrl}>
              <Icon icon='tabler:download' />
            </IconButton>
          </Tooltip>
          {/* <Tooltip title='Edit'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}

              //   href={`/apps/invoice/preview/${row.id}`}
            >
              <Icon icon='tabler:edit' fontSize={20} />
            </IconButton>
          </Tooltip> */}
        </Box>
      )
    }
  ]

  return (
    <Grid item xs={12}>
      <Card>
        {/* <TableHeader /> */}
        <Box
          sx={{
            p: 5,
            pb: 3,
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant='h4' sx={{ mb: 2 }}>
            Dealer Churn Report (Not Available For Current Month)
          </Typography>

          <Box
            sx={{
              p: 5,
              pb: 3,
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 2

              // justifyContent: 'space-between'
            }}
          >
            {/* <TextField label='Search dealer' id='dealer' onChange={e => setDealerCode(e.target.value)} /> */}

            {/* <TextField
              select
              label='Search Dealer'
              id='dealer'
              SelectProps={{ value: statusValue, onChange: e => setDealerCode(e.target.value) }}
              MenuProps={{
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left'
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left'
                },
                getContentAnchorEl: null
              }}
            >
              {dealers?.map(item => (
                <MenuItem key={item._id} value={item._id}>
                  {item.Kunnr}
                </MenuItem>
              ))}
            </TextField> */}
            <CustomTextField select label='Month' SelectProps={{ value: month, onChange: e => handleMonth(e) }}>
              {months.map((curr, i) => (
                <MenuItem key={i} value={i + 1}>
                  {curr}
                </MenuItem>
              ))}
            </CustomTextField>
            <CustomTextField select label='Year' SelectProps={{ value: year, onChange: e => handleYear(e) }}>
              <MenuItem value='2019'>2019</MenuItem>
              <MenuItem value='2020'>2020</MenuItem>
              <MenuItem value='2021'>2021</MenuItem>
              <MenuItem value='2022'>2022</MenuItem>
              <MenuItem value='2023'>2023</MenuItem>
              <MenuItem value='2024'>2024</MenuItem>
              <MenuItem value='2025'>2025</MenuItem>
              <MenuItem value='2026'>2026</MenuItem>
              <MenuItem value='2027'>2027</MenuItem>
              <MenuItem value='2028'>2028</MenuItem>
              <MenuItem value='2029'>2029</MenuItem>
            </CustomTextField>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          rowHeight={62}
          rows={files}
          columns={columns}
          disableRowSelectionOnClick
          loading={data?.schemeLoadingStatus === 'LOADING'}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          onProcessRowUpdateError={() => console.log('error')}
        />
      </Card>
    </Grid>
  )
}

export default Payment
