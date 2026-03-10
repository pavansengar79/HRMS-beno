// ** React Imports
import { useState, useEffect, forwardRef } from 'react'

// ** Next Import

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import { enIN } from 'date-fns/locale'
import format from 'date-fns/format'
import { fetchMailScheduler } from 'src/store/apps/adaptation/warrantyClaim'
import CustomTextField from 'src/@core/components/mui/text-field'
import moment from 'moment'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import ViewModal from './view'
import { IconButton, Tooltip } from '@mui/material'
import Icon from 'src/@core/components/icon'

// ** Styled component for the link in the dataTable
const CustomInput = forwardRef((props, ref) => {
  const startDate = props.start !== null ? format(props.start, 'MM/dd/yyyy') : null
  const endDate = props.end !== null ? format(props.end, 'MM/dd/yyyy') : null
  const value = `${startDate !== null ? startDate : ''} ${endDate !== null ? '-' + endDate : ''}`

  return <CustomTextField inputRef={ref} label={props.label || ''} {...props} value={value} />
})

/* eslint-enable */
const Repair = () => {
  // ** State

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [startDate, setStartDate] = useState(new Date(moment.utc().startOf('month').format('YYYY-MM-DD')))
  const [endDate, setEndDate] = useState(new Date(moment.utc().format('YYYY-MM-DD')))

  const handleDateChange = dates => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  const closeModal = () => {
    setShow(false)
  }

  const handleSearch = event => {
    setSearch(event.target.value)
  }

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.warrantyClaim)
  console.log('data warranty', data)

  const files = data?.mail?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })
  useEffect(() => {
    dispatch(fetchMailScheduler({ paginationModel, search, startDate, endDate }))
  }, [dispatch, paginationModel, search, startDate, endDate])

  const updateValue = () => {
    dispatch(fetchMailScheduler({ paginationModel, search, startDate, endDate }))
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
      renderCell: ({ row }) => <Typography>{row?._id?.Kunnr || 'NA'}</Typography>,
      valueGetter: params => params?.row?._id?.Kunnr
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'Name1',
      headerName: 'Name',
      renderCell: ({ row }) => <Typography>{row?._id?.Name1 || 'NA'}</Typography>,
      valueGetter: params => params?.row?._id?.Name1
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'totalDocs',
      headerName: 'Total Docs',
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
      // flex: 0.0,
      minWidth: 50,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      align: 'center',
      renderCell: ({ row }) => (
        <Tooltip title='View'>
          <IconButton
            size='small'
            sx={{ color: 'text.secondary' }}
            onClick={() => {
              setCurrentRow(row)
              setShow(true)
            }}
          >
            <Icon icon='tabler:eye' fontSize={20} />
          </IconButton>
        </Tooltip>
      )
    }
  ]

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
            Dealer Warranty Details
          </Typography>
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
              customInput={
                <CustomInput label='Filter by date' fullWidth sx={{ width: 240 }} start={startDate} end={endDate} />
              }
            />
          </DatePickerWrapper>
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

        <CustomDialog show={show} setShow={setShow} title='View Warranty Claim' size='full'>
          <ViewModal data={currentRow} onClose={closeModal} />
        </CustomDialog>
      </Card>
    </Grid>
  )
}

export default Repair
