// ** React Imports
import { useState, useEffect, forwardRef } from 'react'

// ** Next Import

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import ViewModal from './view'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import { enIN } from 'date-fns/locale'
import format from 'date-fns/format'
// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import

// ** Custom Components Imports

import Button from '@mui/material/Button'

// ** Styled Components

import { fetchRestrictedProduct, fetchNonRestrictedProduct } from 'src/store/apps/adaptation/deviceLogin'
import CustomTextField from 'src/@core/components/mui/text-field'

import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import exportExcel from 'src/utils/genarateExcel'
import axiosRequest from 'src/utils/AxiosInterceptor'

const CustomInput = forwardRef((props, ref) => {
  const startDate = props.start !== null ? format(props.start, 'MM/dd/yyyy') : null
  const endDate = props.end !== null ? format(props.end, 'MM/dd/yyyy') : null
  const value = `${startDate !== null ? startDate : ''} ${endDate !== null ? '-' + endDate : ''}`

  return <CustomTextField inputRef={ref} label={props.label || ''} {...props} />
})

const DeviceLogin = () => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [alignment, setAlignment] = useState('uniqueDevices')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const handleDateChange = dates => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  const showModal = () => {
    setShow(true)
  }

  const closeModal = () => {
    setShow(false)
  }

  const handleSearch = event => {
    setSearch(event.target.value)
  }

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.deviceLogin)
  let totalData = 0
  let loading

  const files =
    alignment === 'uniqueDevices'
      ? data?.restrictedProduct?.map((n, i) => {
          totalData = data?.totalData1
          loading = data.restrictedProductLoadingStatus

          return {
            ...n,
            ['id']: paginationModel.page * paginationModel.pageSize + i + 1
          }
        })
      : data?.NonRestrictedProduct?.map((n, i) => {
          totalData = data?.totalData2
          loading = data.NonRestrictedProductLoadingStatus

          return {
            ...n,
            ['id']: paginationModel.page * paginationModel.pageSize + i + 1
          }
        })
  useEffect(() => {
    if (alignment === 'uniqueDevices') {
      dispatch(fetchRestrictedProduct({ paginationModel, search, startDate, endDate }))
    } else {
      dispatch(fetchNonRestrictedProduct({ paginationModel, search, startDate, endDate }))
    }
  }, [paginationModel, search, alignment, startDate, endDate])
  useEffect(() => {
    if (alignment === 'uniqueDevices') {
      if (data.shouldFetchData.restricted) {
        dispatch(fetchRestrictedProduct({ paginationModel, search: search }))
      }
    } else {
      if (data.shouldFetchData.NonRestricted) dispatch(fetchNonRestrictedProduct({ paginationModel, search: search }))
    }
  }, [data.shouldFetchData])

  const handleActive = async (row, active) => {
    console.log('row', row)

    // dispatch(changerepairStatus({ id: id, status: active }))
    dispatch(updateRejectData({ id: row._id, status: active, name: row.name, description: row.description }))
  }

  const handleAlignment = (event, newAlignment) => {
    if (newAlignment != null) {
      setAlignment(newAlignment)
    }
  }
  const generateExcel = async e => {
    const response = await axiosRequest({
      url: `/api/admindash/admin/getDealerDetails`,
      method: 'GET'
    })
    const fileName = 'Device-Details'
    exportExcel(
      response?.data?.map(x => {
        let tempOBj = {}
        x.user.forEach((item, idx) => {
          tempOBj[` User_${idx + 1}_Name`] = item.name
          tempOBj[`User_${idx + 1}_Kunnr`] = item.kunnr

          // tempOBj[`Visit${idx + 1}_Completed`] = item.completed;
        })

        return {
          Phone: x?.model,
          'IMEI Number': x._id,
          Count: x?.count,

          // "Dealer Logged": x?.user.map((t) => {
          //   return visitact.push({
          //     Name: t?.name,
          //     Kunnr: t?.kunnr,
          //   });
          // }),
          ...tempOBj
        }
      }),
      fileName
    )
  }

  const defaultColumns1 = [
    {
      flex: 0.1,
      field: 'id',
      minWidth: 50,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{`${row?.id}`}</Typography>
    },
    {
      flex: 0.25,
      minWidth: 100,
      field: 'Kunnr',
      headerName: 'Dealer Code',
      renderCell: ({ row }) => <Typography>{row?.user?.Kunnr}</Typography>,
      valueGetter: params => params?.row?.user?.Kunnr
    },
    {
      flex: 0.25,
      minWidth: 100,
      field: 'Name',
      headerName: 'name',
      renderCell: ({ row }) => <Typography>{row?.user?.Name1}</Typography>,
      valueGetter: params => params?.row?.user?.Name1
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'count',
      headerName: 'Unique Devices',
      renderCell: ({ row }) => <Typography>{row?.count}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'deviceinfo',
      sortable: false,
      headerName: 'Device Info',
      renderCell: ({ row }) => (
        <Tooltip title='View'>
          <IconButton
            size='small'
            sx={{ color: 'text.secondary' }}
            onClick={() => {
              setCurrentRow({
                tableHeading1: 'Model',
                tableHeading2: 'Platform',
                cell: row?.deviceInfo?.map(item => {
                  return {
                    firstColumn: item?.model,
                    secondColumn: item?.platform
                  }
                })

                // firstColumn: row?.deviceInfo?.model,
                // secondColumn: row?.deviceInfo?.platform
              })
              setShow(true)

              // setModalType('view')
            }}
          >
            <Icon icon='tabler:eye' fontSize={20} />
          </IconButton>
        </Tooltip>
      )
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

  const defaultColumns2 = [
    {
      flex: 0.1,
      field: 'id',
      minWidth: 50,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{`${row?.id}`}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'model',
      headerName: 'ModelName',
      renderCell: ({ row }) => <Typography>{row?.model}</Typography>
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: '_id',
      headerName: 'Imei',
      renderCell: ({ row }) => <Typography>{row?._id}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'count',
      headerName: 'Dealer Count',
      renderCell: ({ row }) => <Typography>{row?.count}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'dealerdetails',
      sortable: false,
      headerName: 'Dealer Details',
      renderCell: ({ row }) => (
        <Tooltip title='View'>
          <IconButton
            size='small'
            sx={{ color: 'text.secondary' }}
            onClick={() => {
              setCurrentRow({
                tableHeading1: 'Dealer Name',
                tableHeading2: 'Dealer Code',
                cell: row?.user?.map(item => {
                  return {
                    firstColumn: item?.name,
                    secondColumn: item?.kunnr
                  }
                })

                // firstColumn: row?.deviceInfo?.model,
                // secondColumn: row?.deviceInfo?.platform
              })
              setShow(true)

              // setModalType('view')
            }}
          >
            <Icon icon='tabler:eye' fontSize={20} />
          </IconButton>
        </Tooltip>
      )
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

  const columns = [
    // ...defaultColumns,
    {
      flex: 0.1,
      minWidth: 140,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='Edit'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                setCurrentRow({ user: row?.deviceInfo })
                setModalType('edit')
                setShow(true)
              }}
            >
              <Icon icon='tabler:edit' fontSize={20} />
            </IconButton>
          </Tooltip>
          {/* <Tooltip title='Delete'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                dispatch(deleteMailScheduler(row?._id))
                updateValue()
              }}
            >
              <Icon icon='tabler:trash' />
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
            Dealer Device Details
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5 }}>
            {/* <CustomTextField
              sx={{ mb: 2 }}
              placeholder='Material No/Product Name'
              onChange={e => setSearch(e.target.value)}
            /> */}
            <DatePickerWrapper>
              <DatePicker
                selectsRange
                isClearable
                endDate={endDate}
                selected={startDate}
                startDate={startDate}
                id='date-range-picker'
                onChange={handleDateChange}
                locale={enIN}
                shouldCloseOnSelect={false}
                popperPlacement='bottom-end'
                placeholderText='Filter by Date'
                customInput={<CustomInput fullWidth sx={{ width: 230, mt: 4 }} start={startDate} end={endDate} />}
              />
            </DatePickerWrapper>
            <Button sx={{ mt: 4 }} variant='contained' onClick={generateExcel}>
              Download
            </Button>
          </Box>
        </Box>
        {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, ml: 5 }}>
          <Button
            sx={{ mb: 2 }}
            variant='contained'
            onClick={() => {
              setModalType('add')
              setShow(true)
            }}
          >
            BULK UPLOAD
          </Button>
          <Button
            sx={{ mb: 2 }}
            variant='contained'
            onClick={() => {
              setModalType('add')
              setShow(true)
            }}
          >
            BULK UPLOAD
          </Button>
        </Box> */}
        <ToggleButtonGroup exclusive color='primary' value={alignment} onChange={handleAlignment} sx={{ ml: 5, mb: 5 }}>
          <ToggleButton value='uniqueDevices'>Unique Devices</ToggleButton>
          <ToggleButton value='uniqueDealers'>Unique Dealers</ToggleButton>
        </ToggleButtonGroup>
        <DataGrid
          autoHeight
          rowHeight={62}
          rows={files}
          columns={alignment === 'uniqueDevices' ? defaultColumns1 : defaultColumns2}
          disableRowSelectionOnClick
          loading={loading === 'LOADING'}
          pageSizeOptions={[10, 25, 50]}
          rowCount={totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={() => console.log('error')}
        />

        {/* <Stack spacing={2} alignItems={'center'} sx={{ mb: '30px' }}>
          <Pagination count={data.totalData} page={page} onChange={handleChange} />
        </Stack> */}
        <CustomDialog show={show} setShow={setShow} title='Device Info'>
          <ViewModal data={currentRow} onClose={closeModal} />
        </CustomDialog>
      </Card>
    </Grid>
  )
}

export default DeviceLogin
