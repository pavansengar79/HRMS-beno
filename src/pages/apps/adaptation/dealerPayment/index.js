// ** React Imports
import { useState, useEffect, forwardRef } from 'react'

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
import Pagination from '@mui/material/Pagination'
import TablePagination from '@mui/material/TablePagination'
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar'
import Modal from '@mui/material/Modal'
import EditModal from './edit'
import AddModal from './add'

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

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { Stack } from '@mui/system'
import { Switch } from '@mui/material'
import { formateDate } from 'src/utils/helper'
import { fetchMailScheduler, deleteMailScheduler } from 'src/store/apps/adaptation/dealerPayment'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Styled component for the link in the dataTable
const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  fontSize: theme.typography.body1.fontSize,
  color: `${theme.palette.primary.main} !important`
}))

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
  // ** State
  const [dates, setDates] = useState([])
  const [value, setValue] = useState('')
  const [statusValue, setStatusValue] = useState('')
  const [endDateRange, setEndDateRange] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [startDateRange, setStartDateRange] = useState(null)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [modalType, setModalType] = useState()
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const openModal = () => {
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
  }

  const handleChange = (event, value) => {
    setPage(value)
  }

  const handleSearch = event => {
    setSearch(event.target.value)
  }

  const handleOnChange = dates => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.dealerPayment)

  const files = data?.mail?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })
  useEffect(() => {
    dispatch(fetchMailScheduler({ paginationModel, search, startDate, endDate }))
  }, [dispatch, paginationModel, search, startDate, endDate])

  const handleFilter = val => {
    setValue(val)
  }

  const updateValue = () => {
    dispatch(fetchMailScheduler({ paginationModel, search, startDate, endDate }))
  }

  const handleActive = async (row, active) => {
    console.log('row', row)

    // dispatch(changerepairStatus({ id: id, status: active }))
    dispatch(updateRejectData({ id: row._id, status: active, name: row.name, description: row.description }))
    updateValue()
  }

  const handleStatusValue = e => {
    setStatusValue(e.target.value)
  }

  const handlePageChange = e => {
    setPaginationModel(e)
    dispatch(fetchMailScheduler(e.page))
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
            Dealer Payment Details
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

        {/* <Stack spacing={2} alignItems={'center'} sx={{ mb: '30px' }}>
          <Pagination count={data.totalPage} page={page} onChange={handleChange} />
        </Stack> */}
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
