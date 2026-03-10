// ** React Imports
import { useState, useEffect, forwardRef } from 'react'

// ** Next Import
// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import EditModal from './edit'
import AddModal from './add'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import


// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

import { fetchMailScheduler } from 'src/store/apps/adaptation/dealerOrder'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Styled component for the link in the dataTable

/* eslint-disable */
const CustomInput = forwardRef((props, ref) => {
  // const startDate = format(props.start, 'MM/dd/yyyy')
  const startDate = props.start !== null ? format(props.start, 'MM/dd/yyyy') : null
  const endDate = props.end !== null ? format(props.end, 'MM/dd/yyyy') : null
  const value = `${startDate !== null ? startDate : ''} ${endDate !== null ? '-' + endDate : ''}`

  return <CustomTextField inputRef={ref} label={props.label || ''} {...props} />
})

/* eslint-enable */
const Repair = () => {
  const twoMonthsAgo = new Date()
  twoMonthsAgo.setMonth(new Date().getMonth() - 2)

  // ** State
  const [value, setValue] = useState('')
  
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [modalType, setModalType] = useState()
  const [startDate, setStartDate] = useState(twoMonthsAgo)
  const [endDate, setEndDate] = useState(new Date())


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
  const data = useSelector(state => state.dealerOrder)
  const files = data?.mail?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })
  useEffect(() => {
    dispatch(fetchMailScheduler({ paginationModel, search, startDate, endDate }))
  }, [paginationModel, search, startDate, endDate])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchMailScheduler({ paginationModel, search, startDate, endDate }))
    }
  }, [data.shouldFetchData])

  const handleFilter = val => {
    setValue(val)
  }

  const updateValue = () => {
    dispatch(fetchMailScheduler({ paginationModel, search }))
  }

  const handleActive = async (row, active) => {
    console.log('row', row)

    // dispatch(changerepairStatus({ id: id, status: active }))
    dispatch(updateRejectData({ id: row._id, status: active, name: row.name, description: row.description }))
    updateValue()
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
      field: 'Kunnr',
      headerName: 'Kunnr',
      renderCell: ({ row }) => <Typography>{row?._id?.Kunnr}</Typography>,
      valueGetter: params => params?.row?._id?.Kunnr
    },
    {
      flex: 0.2,
      minWidth: 200,
      field: 'Name1',
      headerName: 'Name',
      renderCell: ({ row }) => <Typography>{row?._id?.Name1}</Typography>,
      valueGetter: params => params?.row?._id?.Name1
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'totalDocs',
      headerName: 'Order Placed',
      renderCell: ({ row }) => <Typography>{row?.totalDocs}</Typography>
    }

    // {
    //   flex: 0.5,
    //   minWidth: 200,
    //   field: 'userlist',
    //   headerName: 'User List',
    //   renderCell: ({ row }) => <Typography>{row.userList.map(item => item).join(',')}</Typography>
    // }

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
    ...defaultColumns,
    {
      flex: 0.1,
      minWidth: 140,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Typography>-</Typography>
        // <Box sx={{ display: 'flex', alignItems: 'center' }}>
        //   <Tooltip title='Edit'>
        //     <IconButton
        //       size='small'
        //       sx={{ color: 'text.secondary' }}
        //       onClick={() => {
        //         setCurrentRow(row)
        //         setModalType('edit')
        //         setOpen(true)
        //       }}
        //     >
        //       <Icon icon='tabler:edit' fontSize={20} />
        //     </IconButton>
        //   </Tooltip>
        //   <Tooltip title='Delete'>
        //     <IconButton
        //       size='small'
        //       sx={{ color: 'text.secondary' }}
        //       onClick={() => {
        //         dispatch(deleteMailScheduler(row?._id))
        //         updateValue()
        //       }}
        //     >
        //       <Icon icon='tabler:trash' />
        //     </IconButton>
        //   </Tooltip>
        // </Box>
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
            Dealer Order Details
          </Typography>
          <DatePickerWrapper>
            <DatePicker
              isClearable
              selectsRange
              endDate={endDate}
              selected={startDate}
              startDate={startDate}
              id='date-range-picker'
              onChange={handleOnChange}
              shouldCloseOnSelect={false}
              popperPlacement='bottom-end'
              placeholderText='Filter by Date'
              customInput={<CustomInput label='Date' start={startDate} end={endDate} fullWidth sx={{ width: 250 }} />}
            />
          </DatePickerWrapper>
          {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5 }}>
            <CustomTextField sx={{ mb: 2 }} placeholder='search' />
            <Button
              sx={{ mb: 2 }}
              variant='contained'
              onClick={() => {
                setModalType('add')
                setOpen(true)
              }}
            >
              ADD
            </Button>
          </Box> */}
        </Box>
        <DataGrid
          autoHeight
          rowHeight={62}
          rows={files}
          columns={columns}
          disableRowSelectionOnClick
          loading={data?.mailLoadingStatus === 'LOADING'}
          pageSizeOptions={[10, 25, 50]}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          {modalType === 'edit' ? (
            <EditModal data={currentRow} onClose={closeModal} onUpdate={updateValue} />
          ) : (
            <AddModal onClose={closeModal} onUpdate={updateValue} />
          )}
        </Modal>
      </Card>
    </Grid>
  )
}

export default Repair
