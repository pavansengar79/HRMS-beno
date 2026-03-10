import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrderData } from 'src/store/apps/order'
import CustomTextField from 'src/@core/components/mui/text-field'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import PickersCustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'
import { enIN } from 'date-fns/locale'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { fetchDealerData } from 'src/store/apps/payment'
import { debounce } from 'src/utils/helper'

const Order = () => {
  const [statusValue, setStatusValue] = useState()
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [startDate, setStartDate] = useState()
  const [orderNo, setOrderNo] = useState()
  const [dealerCode, setDealerCode] = useState()
  const dispatch = useDispatch()
  const data = useSelector(state => state.order)
  const payment = useSelector(state => state.payment)

  const files = data?.order?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  useEffect(() => {
    dispatch(
      fetchOrderData({
        paginationModel,
        orderStatus: statusValue,
        orderNo: orderNo,
        dealerCode: dealerCode,
        createdAt: startDate
      })
    )
    dispatch(fetchDealerData(''))
  }, [paginationModel, orderNo, dealerCode, startDate, statusValue])

  const handleStatusValue = (e, newValue) => {
    console.log('>>', newValue)
    setStatusValue(newValue)
  }

  const defaultColumns = [
    {
      flex: 0.1,
      field: 'id',
      minWidth: 50,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{`${row?.id}`}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'Dealercode',
      headerName: 'Dealer Code',
      renderCell: ({ row }) => <Typography>{row?.Dealercode}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'OrderNo',
      headerName: 'Order No',
      renderCell: ({ row }) => <Typography>{row?.OrderNo}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'paymentStatus',
      headerName: 'Payment Status',
      renderCell: ({ row }) => <Typography>{row?.paymentStatus}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'orderStatus',
      headerName: 'Order Status',
      renderCell: ({ row }) => <Typography>{row?.orderStatus}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'totalPrice',
      headerName: 'Total Price',
      renderCell: ({ row }) => <Typography>{row?.totalPrice}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'products',
      headerName: 'Products',
      renderCell: ({ row }) => <Typography>{row?.products?.length}</Typography>,
      valueGetter: params => params?.row?.products.length
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'createdAt',
      headerName: 'Created At',
      renderCell: ({ row }) => <Typography>{row?.createdAt?.slice(0, 10)}</Typography>
    }
  ]

  const handleKeyPress = e => {
    const allowedCharacters = /^[0-9]+$/
    if (!allowedCharacters.test(e.key)) {
      e.preventDefault()
    }
  }

  const handleDealerChange = (event, newValue) => {
    setDealerCode(newValue?.Kunnr)
  }

  return (
    <Grid item xs={12}>
      <Card>
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
            Orders
          </Typography>
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
            {/* <CustomTextField
              fullWidth
              sx={{ width: 290 }}
              label='Dealer Code'
              id='dealer'
              onChange={e => {
                setTimeout(() => setDealerCode(e.target.value), 2000)
              }}
              onKeyPress={handleKeyPress}
            /> */}
            <CustomAutocomplete
              value={dealerCode}
              sx={{ width: 290 }}
              options={payment?.dealer}
              onChange={handleDealerChange}
              onInputChange={e => debounce(() => dispatch(fetchDealerData(e.target.value)), 2000)}
              id='autocomplete-controlled'
              getOptionLabel={option => option?.Kunnr || ''}
              renderInput={params => (
                <CustomTextField {...params} label='Search Dealer Code' onKeyPress={handleKeyPress} />
              )}
            />
            <CustomTextField
              fullWidth
              sx={{ width: 290 }}
              label='Order No'
              id='order'
              onChange={e => {
                setTimeout(() => setOrderNo(e.target.value), 2000)
              }}
              onKeyPress={handleKeyPress}
            />
            {/* <CustomTextField
              select
              label='Order Status'
              SelectProps={{ value: statusValue, onChange: e => handleStatusValue(e) }}
            >
              <MenuItem value='Cancelled'>Cancelled</MenuItem>
              <MenuItem value='Completed'>Completed</MenuItem>
              <MenuItem value='Processing'>Processing</MenuItem>
            </CustomTextField> */}
            <CustomAutocomplete
              freeSolo={false}
              value={statusValue}
              sx={{ width: 290 }}
              options={['Cancelled', 'Completed', 'Processing']}
              onChange={handleStatusValue}
              id='autocomplete-controlled'
              getOptionLabel={option => option || ''}
              renderInput={params => <CustomTextField label='Order Status' {...params} />}
            />
            <DatePickerWrapper>
              <DatePicker
                isClearable
                selected={startDate}
                id='Date'
                locale={enIN}
                maxDate={new Date()}
                popperPlacement={'bottom-end'}
                dateFormat='yyyy/MM/dd'
                onChange={date => {
                  setStartDate(date)
                }}
                placeholderText='Filter by Date'
                customInput={<PickersCustomInput label='Date' value={startDate} fullWidth sx={{ width: 290 }} />}
              />
            </DatePickerWrapper>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          rowHeight={62}
          rows={files}
          columns={defaultColumns}
          disableRowSelectionOnClick
          loading={data?.orderLoadingStatus === 'LOADING'}
          rowCount={data?.totalData}
          paginationMode='server'
          pageSizeOptions={[25, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={() => console.log('error')}
        />
      </Card>
    </Grid>
  )
}

export default Order
