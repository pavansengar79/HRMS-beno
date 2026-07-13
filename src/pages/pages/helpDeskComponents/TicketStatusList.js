import { Button, Card, Chip, Drawer, InputAdornment, MenuItem, TextField, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Box } from '@mui/system'
import TicketStatusPopup from './TicketStatusPopUp'
import { forwardRef, useEffect, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import { enIN } from 'date-fns/locale'
import format from 'date-fns/format'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchQueryCategoryData, fetchQueryData } from 'src/store/apps/helpDeskTickets'
import exportExcel from 'src/utils/genarateExcel'
import CustomTextField from 'src/@core/components/mui/text-field'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import moment from 'moment'

const CustomInput = forwardRef((props, ref) => {
  const startDate = props.start !== null ? format(props.start, 'MM/dd/yyyy') : null
  const endDate = props.end !== null ? format(props.end, 'MM/dd/yyyy') : null
  const value = `${startDate !== null ? startDate : ''} ${endDate !== null ? '-' + endDate : ''}`

  return <CustomTextField inputRef={ref} label={props.label || ''} {...props} />
})

const ITEM_HEIGHT = 58
const ITEM_PADDING_TOP = 8

const MenuProps = {
  PaperProps: {
    style: {
      width: 200,
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
}
const statusOptions = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'ASSIGNED', label: 'Assign To' }
]

const Index = () => {
  const [open, setOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState({ value: 'ALL', label: '' })
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [popupData, setPopupData] = useState(null)
  const [category, setCategory] = useState('')
  const toggleModal = () => setOpen(!open)

  const dispatch = useDispatch()
  const queries = useSelector(state => state?.helpDeskTickets)

  console.log('category', queries.category)

  const queries1 = queries?.queries?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  const defaultColumns = [
    {
      flex: 0.1,
      minWidth: 90,
      field: 'id',
      headerName: 'SR. NO.',
      renderCell: ({ row }) => <Typography>{row?.id}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'ticketNo',
      headerName: 'Ticket ID',
      renderCell: ({ row }) => <Typography>#{row?.ticketNo}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'Name1',
      headerName: 'Dealer Name',
      renderCell: ({ row }) => <Typography>{row?.user?.Name1}</Typography>,
      valueGetter: params => params?.row?.user?.Name1
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'City1',
      headerName: 'City',
      renderCell: ({ row }) => <Typography>{row?.user?.City1}</Typography>,
      valueGetter: params => params?.row?.user?.City1
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'category',
      headerName: 'Category',
      renderCell: ({ row }) => <Typography>{row?.category}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'subCategory',
      headerName: 'Sub-Category',
      renderCell: ({ row }) => <Typography>{row?.subCategory}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 100,
      field: 'subject',
      headerName: 'Subject',
      renderCell: ({ row }) => <Typography>{row?.subject}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'createdAt',
      headerName: 'Date',
      renderCell: ({ row }) => <Typography>{moment(row?.createdAt).format('DD/MM/YYYY')}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 120,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => (
        <Chip
          label={row?.status}
          sx={{ fontSize: 12 }}
          color={
            row?.status === 'RESOLVED'
              ? 'primary'
              : row?.status === 'OPEN'
              ? 'error'
              : row?.status === 'ASSIGNED'
              ? 'success'
              : 'warning'
          }
        ></Chip>
      )

      // renderCell: ({ row }) => (
      //   <Stack direction={'row'} sx={{ display: 'flex' }}>
      //     <Typography color={getColorName(row?.status)}>{capitalizeFirstLetter(row?.status)}</Typography>
      //     <InfoIcon
      //       sx={{ color: '#413d3d' }}
      //       onClick={() => {
      //         setOpen(true)
      //         setPopupData(row)
      //       }}
      //     />
      //   </Stack>

      //   // <Switch
      //   //   checked={row?.active}
      //   //   onChange={event => {
      //   //     const newActiveValue = event.target.checked
      //   //     handleActive(row?._id, newActiveValue, 'active')
      //   //   }}
      //   // />
      // )
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'takeaction',
      headerName: '',
      renderCell: ({ row }) => (
        <Button
          onClick={() => {
            setOpen(true)
            setPopupData(row)
          }}
          variant='contained'
          color='primary'
          size='small'
        >
          Take Action
        </Button>
      )
    }
  ]

  useEffect(() => {
    if (queries.shouldFetchData) {
      dispatch(fetchQueryData({ paginationModel, search, status }))
    }
  }, [dispatch, queries.shouldFetchData, paginationModel, search, status])

  useEffect(() => {
    dispatch(fetchQueryData({ paginationModel, search, status, startDate, endDate, category }))
  }, [dispatch, paginationModel, search, status, startDate, endDate, category])

  useEffect(() => {
    dispatch(fetchQueryCategoryData())
  }, [dispatch])

  const handleDateChange = dates => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
  }

  const handleStatusChange = (event, newValue) => {
    setStatus(newValue)
  }
  const handleCategoryChange = (event, newValue) => {
    setCategory(newValue)
  }

  return (
    <Card>
      <Box
        sx={{
          p: 5,
          pb: 5,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            gap: '20px'
          }}
        >
          {/* <CustomTextField
            select
            id='ticket_status'
            fullwidth
            SelectProps={{ MenuProps, multiple: false, value: status, onChange: e => setStatus(e.target.value) }}
          >
            <MenuItem value='ALL'>Filter by Ticket Status</MenuItem>
            <MenuItem value='OPEN'>Open</MenuItem>
            <MenuItem value='IN PROGRESS'>In Progress</MenuItem>
            <MenuItem value='RESOLVED'>Resolved</MenuItem>
          </CustomTextField> */}
          <CustomAutocomplete
            freeSolo={false}
            value={status}
            sx={{ width: 250 }}
            options={statusOptions}
            onChange={handleStatusChange}
            id='autocomplete-controlled'
            getOptionLabel={option => option.label || ''}
            renderInput={params => <CustomTextField {...params} placeholder='Filter by Ticket Status' />}
          />
          {/* <CustomTextField
            select
            fullwidth
            id='ticket_category'
            SelectProps={{
              displayEmpty: true,
              MenuProps,
              multiple: false,
              value: category,
              onChange: e => setCategory(e.target.value)
            }}
          >
            <MenuItem disabled value=''>
              Filter by category
            </MenuItem>
            {queries?.category?.map((cat, i) => (
              <MenuItem key={i} value={cat?.name}>
                {cat?.name}
              </MenuItem>
            ))}
          </CustomTextField> */}
          <CustomAutocomplete
            freeSolo={false}
            value={category}
            sx={{ width: 250 }}
            options={queries?.category}
            onChange={handleCategoryChange}
            id='autocomplete-controlled'
            getOptionLabel={option => option.name || ''}
            renderInput={params => <CustomTextField {...params} placeholder='Filter by category' />}
          />
          {/* <CustomTextField
            select
            defaultValue=''
            id='select-without-label'
            helperText='Without label'
            inputProps={{ 'aria-label': 'Without label' }}
          >
            <MenuItem disabled value=''>
              Filter by category
            </MenuItem>
            {queries?.category?.map((cat, i) => (
              <MenuItem key={i} value={cat?.name}>
                {cat?.name}
              </MenuItem>
            ))}
          </CustomTextField> */}
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
              customInput={<CustomInput start={startDate} end={endDate} />}
            />
          </DatePickerWrapper>
          {/* <select
            style={{
              width: '200px',
              height: '52px',
              borderRadius: '5px',
              padding: '0 10px',
              margin: '0 5px',
              border: '1px solid #d5d5d8',
              fontSize: '15px'
            }}
          >
            <option selected disabled>
              Filter by Ticket Status
            </option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Escalated</option>
            <option>Resolved</option>
            <option>Unresolved</option>
          </select>
          <select
            style={{
              width: '200px',
              height: '52px',
              borderRadius: '5px',
              padding: '0 10px',
              margin: '0 5px',
              border: '1px solid #d5d5d8',
              fontSize: '15px'
            }}
          >
            <option selected disabled>
              Filter by Date Range
            </option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Escalated</option>
            <option>Resolved</option>
            <option>Unresolved</option>
          </select> */}
          <CustomTextField
            fullwidth
            onChange={e => setSearch(e.target.value)}
            value={search}
            name='searchTerritory'
            placeholder='Search by Subject'
            InputProps={{
              endAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Button
          sx={{ width: '20%' }}
          variant='contained'
          color='primary'
          onClick={() => {
            let report = queries1.map(item => {
              return {
                status: item?.status || 'Unknown',
                userName: item?.user?.Name1 || 'Unknown',
                subject: item?.subject || 'Unknown',
                category: item?.category || 'Unknown',
                subCategory: item?.subCategory || 'Unknown',
                description: item?.description || 'Unknown',
                ticketNo: item?.ticketNo || 'Unknown',
                ticketEscalationStatus: item?.ticketEscalationStatus || 'Unknown'
              }
            })
            exportExcel(report, 'details')
          }}
        >
          Download Report
        </Button>
      </Box>
      {/* {open ? <TicketStatusPopup open={open} setOpen={setOpen} popupData={popupData} /> : <></>} */}
      <DataGrid
        autoHeight
        rowHeight={50}
        rows={queries1}
        columns={defaultColumns}
        disableRowSelectionOnClick
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50]}
        loading={queries?.queriesLoadingStatus === 'LOADING'}
        rowCount={queries?.totalData}
        paginationMode='server'
      />

      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={toggleModal}
        sx={{ '& .MuiDrawer-paper': { width: [500, 550] } }}
      >
        <TicketStatusPopup toggle={toggleModal} popupData={popupData} />
      </Drawer>
    </Card>
  )
}

export default Index
