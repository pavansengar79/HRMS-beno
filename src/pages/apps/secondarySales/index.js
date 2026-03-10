// ** React Imports
import { useState, useEffect, forwardRef } from 'react'

// ** Next Import

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Modal from '@mui/material/Modal'
import moment from 'moment'

// ** Icon Imports

// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import
import ViewModal from './view'
import exportExcel from 'src/utils/genarateExcel'

// ** Custom Components Imports
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Styled Components

import { fetchSecondarySales, fetchUsers } from 'src/store/apps/secondarySales'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { Button, IconButton, Tooltip } from '@mui/material'

// ** Styled component for the link in the dataTable

/* eslint-disable */

/* eslint-enable */
const SecondarySales = () => {
  // ** State
  const [open, setOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [dealerCode, setDealerCode] = useState()
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const [startDate2, setStartDate2] = useState(moment().subtract(2, 'months').toDate())
  const [endDate2, setEndDate2] = useState(new Date())
  const [currentRow, setCurrentRow] = useState()

  const handleDealerChange = (event, newValue) => {
    console.log('newval', newValue)
    setDealerCode(newValue?.Kunnr)
  }

  const handleOnChange = dates => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  const handleOnChange2 = dates => {
    const [start, end] = dates
    setStartDate2(start)
    setEndDate2(end)
  }

  const handleChange = (event, value) => {
    setPage(value)
  }

  const handleSearch = event => {
    setSearch(event.target.value)
  }

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.secondarySales)
  console.log('data', data)

  const files = data?.secondarySales?.map((n, i) => {
    return {
      ...n,
      ['id']: i + 1,
      ['BillAmounts']: n?.BillAmount
    }
  })

  useEffect(() => {
    dispatch(fetchSecondarySales({ paginationModel, dealerCode, startDate, endDate, startDate2, endDate2 }))
  }, [dispatch, paginationModel, dealerCode, startDate, endDate, startDate2, endDate2])

  useEffect(() => {
    dispatch(fetchUsers(''))
  }, [])

  const handleFilter = val => {
    setValue(val)
  }

  const handleActive = async (row, active) => {
    console.log('row', row)

    updateValue()
  }

  const handleStatusValue = e => {
    setStatusValue(e.target.value)
  }

  const handlePageChange = e => {
    setPaginationModel(e)
    dispatch(fetchSecondarySales(e.page))
  }

  const handleOnChangeRange = dates => {
    const [start, end] = dates
    if (start !== null && end !== null) {
      setDates(dates)
    }
    setStartDateRange(start)
    setEndDateRange(end)
  }

  const defaultColumns = [
    {
      flex: 0.1,
      field: 'id',
      minWidth: 80,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{`${row?.id}`}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 120,
      field: 'Dealercode',
      headerName: 'DealerCode',
      renderCell: ({ row }) => <Typography>{row?.Dealercode}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 180,
      field: 'retailerCode',
      headerName: 'Sub Dealer Code',
      renderCell: ({ row }) => <Typography>{row?.retailerId?.retailerCode}</Typography>,
      valueGetter: params => params?.row?.retailerId?.retailerCode
    },
    {
      flex: 0.1,
      minWidth: 300,
      field: 'firmName',
      headerName: 'Sub Dealer Name',
      renderCell: ({ row }) => (
        <Tooltip title={row?.retailerId?.firmName}>
          <Typography>{row?.retailerId?.firmName}</Typography>
        </Tooltip>
      ),
      valueGetter: params => params?.row?.retailerId?.firmName
    },
    {
      flex: 0.1,
      minWidth: 300,
      field: 'MatDesc',
      headerName: 'Product Name',
      renderCell: ({ row }) => <Typography>{row?.products?.product?.MatDesc}</Typography>,
      valueGetter: params => params?.row?.products?.product?.MatDesc
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'quantity',
      headerName: 'Quantity',
      renderCell: ({ row }) => (
        <Typography>{row?.products.quantity}</Typography>

        // <Tooltip title='view'>
        //   <IconButton
        //     size='small'
        //     sx={{ color: 'text.secondary' }}
        //     onClick={() => {
        //       setCurrentRow(row)
        //       setOpen(true)
        //     }}
        //   >
        //     <Typography>{row?.products.quantity}</Typography>
        //   </IconButton>
        // </Tooltip>
      ),
      valueGetter: params => params?.row?.products?.quantity
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'createdAt',
      headerName: 'Created Date',
      renderCell: ({ row }) => <Typography>{moment(row?.createdAt).format('ddd, DD MMM YYYY')}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'InvDate',
      headerName: 'Invoice Date',
      renderCell: ({ row }) => <Typography>{moment(row?.InvDate).format('ddd, DD MMM YYYY')}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'discountPrice',
      headerName: 'Discount',
      renderCell: ({ row }) => <Typography>{row?.discountPrice}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 120,
      field: 'BillAmount',
      headerName: 'Net Value',
      renderCell: ({ row }) => <Typography>{row?.BillAmount.toFixed(2)}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 120,
      field: 'BillAmounts',
      headerName: 'Gross Value',
      renderCell: ({ row }) => <Typography>{row?.BillAmounts.toFixed(2)}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 120,
      field: 'gst',
      headerName: 'Tax Value',
      renderCell: ({ row }) => <Typography>{row?.gst}</Typography>
    }

    // {
    //   flex: 0.1,
    //   minWidth: 100,
    //   field: 'active',
    //   headerName: 'Status',
    //   renderCell: ({ row }) => (
    //     <Switch
    //       checked={row.status}
    //       onChange={event => {
    //         const newActiveValue = event.target.checked
    //         handleActive(row, newActiveValue, 'active')
    //       }}
    //     />
    //   )
    // }
  ]

  const CustomInput = forwardRef((props, ref) => {
    // const startDate = format(props.start, 'MM/dd/yyyy')
    const startDate = props.start !== null ? format(props.start, 'MM/dd/yyyy') : null
    const endDate = props.end !== null ? format(props.end, 'MM/dd/yyyy') : null
    const value = `${startDate !== null ? startDate : ''} ${endDate !== null ? '-' + endDate : ''}`

    return <CustomTextField inputRef={ref} label={props.label || ''} {...props} value={value} />
  })

  const generateExcel = async e => {
    const fileName = 'Secondary-Sales'
    console.log('csvDATA', data?.csvData)
    exportExcel(
      data?.csvData.map(x => {
        // let productsString = x.products.map((product) => {
        //   return `${product?.product?.materialNo} (${product?.quantity})`;
        // });
        // let productData = productsString.join(" | ");
        // const sum = x.products.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0)
        // let tempOBj = {}
        // x.products.forEach((item, idx) => {
        //   tempOBj[` productName_${idx + 1}`] = item?.product?.materialNo
        //   tempOBj[`productQuantity_${idx + 1}`] = item?.quantity
        // })

        return {
          Kunnr: x?.Dealercode,
          'Dealer Name': x?.userId?.Name1,
          'Invoice Date': moment.utc(x?.InvDate).format('DD-MM-YYYY'),
          'Creation Date': moment.utc(x?.createdAt).format('DD-MM-YYYY'),
          'Discount Price': x?.discountPrice,
          'Bill Amount': x?.BillAmount,
          GST: x?.gst,
          'Retailer Code': x?.retailerId ? x?.retailerId?.retailerCode : 'NA',
          'Retailer Name': x?.retailerId ? x?.retailerId?.firmName : 'NA',
          'Product Name': x?.products.product.MatDesc ? x?.products.product.MatDesc : '-',
          'Material No': x?.products?.MaterialNo,
          'Product Quantity': x?.products?.quantity
          // // productData: x?.products ? `${productData}` : "NA",
          // ...tempOBj,
        }
      }),
      fileName
    )
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
            Secondary Sales
          </Typography>

          <Button sx={{ mb: 2 }} variant='contained' onClick={generateExcel}>
            DOWNLOAD CSV
          </Button>
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
            <DatePickerWrapper>
              <DatePicker
                selectsRange
                endDate={endDate}
                selected={startDate}
                startDate={startDate}
                id='date-range-picker'
                isClearable
                onChange={handleOnChange}
                shouldCloseOnSelect={false}
                popperPlacement='bottom-end'
                customInput={
                  <CustomInput
                    label='Created Date'
                    start={startDate}
                    end={endDate}
                    placeholder='mm/dd/yyyy'
                    fullWidth
                    sx={{ width: 390 }}
                  />
                }
              />
            </DatePickerWrapper>
            <DatePickerWrapper>
              <DatePicker
                selectsRange
                endDate={endDate2}
                selected={startDate2}
                startDate={startDate2}
                id='date-range-picker'
                isClearable
                onChange={handleOnChange2}
                shouldCloseOnSelect={false}
                popperPlacement='bottom-end'
                customInput={
                  <CustomInput label='Invoice Date' start={startDate2} end={endDate2} fullWidth sx={{ width: 390 }} />
                }
              />
            </DatePickerWrapper>
            <CustomAutocomplete
              value={dealerCode}
              fullWidth
              sx={{ width: 390 }}
              options={data?.users}
              onChange={handleDealerChange}
              onInputChange={e => setTimeout(() => dispatch(fetchUsers(e?.target?.value)), 2000)}
              id='autocomplete-controlled'
              getOptionLabel={option => `${option?.Kunnr} - ${option?.Name1}`}
              renderInput={params => <CustomTextField {...params} label='Search dealer' />}

              // onInputChange={e => dispatch(fetchDealerData(e?.target?.value))}
            />
          </Box>
        </Box>
        <DataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={files}
          columns={defaultColumns}
          loading={data?.secondarySalesLoading === 'LOADING'}
          // onRowClick={() => setOpen(true)}
          pageSizeOptions={[10, 25, 50]}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={() => console.log('error')}
        />
        {/* <TablePagination
          component='div'
          count={100}
          rowsPerPage={10}
          page={page}
          onPageChange={handleChange}
          rowsPerPageOptions={[10, 20, 30]}
        /> */}
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <ViewModal data={currentRow} />
        </Modal>
      </Card>
    </Grid>
  )
}

export default SecondarySales
