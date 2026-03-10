import { useState, useEffect } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { enIN } from 'date-fns/locale'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import CustomTextField from 'src/@core/components/mui/text-field'
import PickersCustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'
import DatePicker from 'react-datepicker'
import { useDispatch, useSelector } from 'react-redux'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { fetchPaymentData, fetchDealerData } from 'src/store/apps/payment'
import { debounce } from 'src/utils/helper'

const Payment = () => {
  const [statusValue, setStatusValue] = useState()
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [startDate, setStartDate] = useState()
  const [dealerCode, setDealerCode] = useState()
  const dispatch = useDispatch()
  const data = useSelector(state => state.payment)

  const files = data?.payment?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  useEffect(() => {
    dispatch(
      fetchPaymentData({
        paginationModel,
        status: statusValue,
        dealerCode: dealerCode,
        createdAt: startDate
      })
    )

    dispatch(fetchDealerData(''))
  }, [dispatch, statusValue, startDate, paginationModel, dealerCode])

  const handleDealerChange = (event, newValue) => {
    setDealerCode(newValue?._id)
  }

  const handleStatusValue = e => {
    setStatusValue(e.target.value)
  }

  const defaultColumns = [
    {
      flex: 0.1,
      field: 'id',
      minWidth: 50,
      headerName: 'SR. No.',
      renderCell: ({ row }) => <Typography>{row?.id}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 100,
      field: 'Kunnr',
      headerName: 'Dealer Code',
      renderCell: ({ row }) => <Typography>{row?.userId?.Kunnr}</Typography>,
      valueGetter: params => params?.row?.userId?.Kunnr
    },
    {
      flex: 0.3,
      minWidth: 400,
      field: 'Name1',
      headerName: 'Name',
      renderCell: ({ row }) => <Typography>{row?.userId?.Name1}</Typography>,
      valueGetter: params => params?.row?.userId?.Name1
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'amount',
      headerName: 'Amount',
      renderCell: ({ row }) => <Typography>{row?.amount}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => <Typography>{row?.status}</Typography>
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
            Payment Summary
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
            <CustomAutocomplete
              value={dealerCode}
              sx={{ width: 390 }}
              options={data?.dealer}
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
              sx={{ width: 390 }}
              select
              label='Status'
              SelectProps={{ value: statusValue, onChange: e => handleStatusValue(e) }}
            >
              <MenuItem value='PENDING'>PENDING</MenuItem>
              <MenuItem value='PAID'>PAID</MenuItem>
            </CustomTextField>

            <DatePickerWrapper>
              <DatePicker
                isClearable
                selected={startDate}
                id='Date'
                popperPlacement={'bottom-end'}
                locale={enIN}
                dateFormat='yyyy/MM/dd'
                onChange={date => {
                  setStartDate(date)
                }}
                placeholderText='Filter by Date'
                customInput={<PickersCustomInput label='Date' value={startDate} fullWidth sx={{ width: 390 }} />}
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
          loading={data.paymentLoadingStatus === 'LOADING'}
          rowCount={data?.totalData}
          paginationMode='server'
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Card>
    </Grid>
  )
}

export default Payment
