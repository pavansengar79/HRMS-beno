// ** React Imports
import { useState, useEffect, forwardRef } from 'react'

// ** Next Import
import CalculateModal from './CalculateModal'
import UploadModal from './UploadModal'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import moment from 'moment'

// ** Icon Imports

// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import
import exportExcel from 'src/utils/genarateExcel'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Styled Components

import { fetchPointData } from 'src/store/apps/point'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { Button, Modal } from '@mui/material'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import { debounce } from 'src/utils/helper'
import { width } from '@mui/system'

// ** Styled component for the link in the dataTable

/* eslint-disable */

/* eslint-enable */
const RetreadReports = () => {
  // ** State
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [search, setSearch] = useState('')
  const [modalType, setModalType] = useState()
  const [show, setShow] = useState(false)

  const closeModal = () => {
    setOpen(false)
  }

  const handleOnChange = dates => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.point)
  console.log('data', data)

  const files = data?.point?.map((n, i) => {
    return {
      ...n,
      ['id']:  paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  useEffect(() => {
    dispatch(fetchPointData({ paginationModel, startDate, endDate, search }))
  }, [paginationModel, startDate, endDate, search])

  const defaultColumns = [
    {
      flex: 0.0,
      field: 'id',
      minWidth: 50,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{`${row?.id}`}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'kunnr',
      headerName: 'Dealer Kunnr',
      renderCell: ({ row }) => <Typography>{row?.kunnr}</Typography>
    },
    {
      flex: 0.3,
      minWidth: 220,
      field: 'dealerName',
      headerName: 'Dealer Name',
      renderCell: ({ row }) => <Typography>{row?.dealerName}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'schemePoints',
      headerName: 'Points Allocated',
      renderCell: ({ row }) => <Typography>{row?.schemePoints}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'schemeName',
      headerName: 'Scheme Name',
      renderCell: ({ row }) => <Typography>{row?.schemeName || '-'}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'schemeEndDate',
      headerName: 'Date',
      renderCell: ({ row }) => <Typography>{moment(row?.schemeEndDate).format('ddd, DD MMM YYYY')}</Typography>
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

    return (
      <CustomTextField
        inputRef={ref}
        label={props.label || ''}
        {...props}
        value={value}
        onChange={e => console.log('val', e.target.value)}
      />
    )
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
        const sum = x.products.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0)
        let tempOBj = {}
        x.products.forEach((item, idx) => {
          tempOBj[` productName_${idx + 1}`] = item?.product?.materialNo
          tempOBj[`productQuantity_${idx + 1}`] = item?.quantity
        })

        return {
          Dealercode: x?.Dealercode,
          DealerName: x?.userId?.Name1,
          createdAt: x?.createdAt,
          InvDate: x?.InvDate,
          discountPrice: x?.discountPrice,
          BillAmount: x?.BillAmount,
          gst: x?.gst,
          'retailerId.retailerCode': x?.retailerId ? x?.retailerId?.retailerCode : 'NA',
          totalProducts: x?.products ? x?.products.length : '-',
          productQuantity: sum ? sum : 'NA',

          // productData: x?.products ? `${productData}` : "NA",
          'retaileId.firmName': x?.retailerId ? x?.retailerId?.firmName : 'NA',
          ...tempOBj
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
            Loyalty Points
          </Typography>

          <Box
            sx={{
              p: 5,
              pb: 3,
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '20px',
              justifyContent: 'space-between'
            }}
          >
            <CustomTextField
              label='Search'
              placeholder='Search by Kunnr or Dealer name'
              onChange={e => debounce(() => setSearch(e.target.value), 2000)}
            />

            <DatePickerWrapper>
              <DatePicker
                selectsRange
                isClearable
                endDate={endDate}
                selected={startDate}
                startDate={startDate}
                id='date-range-picker'
                onChange={handleOnChange}
                shouldCloseOnSelect={false}
                popperPlacement='bottom-end'
                customInput={
                  <CustomInput
                    label='Date'
                    sx={{ margin: 3 }}
                    start={startDate}
                    end={endDate}
                    placeholder='mm/dd/yyyy'
                  />
                }
              />
            </DatePickerWrapper>
            {/* <Button
              variant='contained'
              onClick={() => {
                setModalType('calculate')
                setOpen(true)
              }}
            >
              CALCULATE FLEET LOAYLTY POINTS
            </Button> */}
            <Button
              variant='contained'
              onClick={() => {
                setModalType('upload')
                setShow(true)
              }}
            >
              UPLOAD LOAYLTY POINTS
            </Button>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={files}
          columns={defaultColumns}
          loading={data?.pointLoadingStatus === 'LOADING'}
          pageSizeOptions={[10, 25, 50]}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={() => console.log('error')}
          disableRowSelectionOnClick
        />
        {/* <TablePagination
          component='div'
          count={100}
          rowsPerPage={10}
          page={page}
          onPageChange={handleChange}
          rowsPerPageOptions={[10, 20, 30]}
        /> */}
      </Card>
      {/* <Modal
        open={open}
        onClose={closeModal}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        {modalType === 'calculate' ? <CalculateModal onClose={closeModal} /> : <UploadModal onClose={closeModal} />}
      </Modal> */}
      <CustomDialog show={show} setShow={setShow} title='Bulk Upload Loyalty Scheme Points'>
        <UploadModal handleClose={() => setShow(false)} />
      </CustomDialog>
    </Grid>
  )
}

export default RetreadReports
