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
import EditModal from 'src/views/apps/faq/EditModal'
import AddModal from 'src/views/apps/faq/AddModal'

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
import { fetchFaqData, updateFaqData } from 'src/store/apps/faq'
import CustomTextField from 'src/@core/components/mui/text-field'
import DeleteModal from 'src/views/apps/faq/DeleteModal'
import SendModal from 'src/views/apps/faq/SendModal'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'

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
const FAQ = () => {
  // ** State

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [show, setShow] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [modalType, setModalType] = useState()
  const dispatch = useDispatch()
  const data = useSelector(state => state.faq)

  const files = data?.faq?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })
  useEffect(() => {
    dispatch(fetchFaqData({ paginationModel }))
  }, [paginationModel])
  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchFaqData({ paginationModel }))
    }
  }, [data.shouldFetchData])

  const showModal = () => {
    setShow(true)
  }

  const closeModal = () => {
    setShow(false)
  }

  const handleChange = (event, value) => {
    setPage(value)
  }

  const handleSearch = event => {
    setSearch(event.target.value)
  }

  // ** Hooks

  const handleFilter = val => {
    setValue(val)
  }

  const handleActive = async (row, active) => {
    console.log('row', row, active)
    dispatch(updateFaqData({ id: row._id, data: { active: active } }))
  }

  const handleStatusValue = e => {
    setStatusValue(e.target.value)
  }

  const handlePageChange = e => {
    setPaginationModel(e)
    dispatch(fetchFaqData(e.page))
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
      renderCell: ({ row }) => <Typography>{row?.id}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 300,
      field: 'category',
      headerName: 'Category',
      renderCell: ({ row }) => <Typography>{row?.category}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'view',
      sortable: false,
      headerName: 'Questions',
      renderCell: ({ row }) => (
        <Tooltip title='view'>
          <IconButton
            size='small'
            sx={{ color: 'text.secondary' }}
            onClick={() => {
              setCurrentRow(row)
              setModalType('send')
              setShow(true)
            }}
          >
            <Icon icon='tabler:eye' fontSize={20} />
          </IconButton>
        </Tooltip>

        // <Button
        //   variant='outlined'
        //   onClick={() => {
        //     setCurrentRow(row)
        //     setModalType('send')
        //     setShow(true)
        //   }}
        // >
        //   SEND FAQ
        // </Button>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'active',
      headerName: 'Status',
      renderCell: ({ row }) => (
        <Switch
          checked={row?.active}
          onChange={event => {
            const newActiveValue = event.target.checked
            handleActive(row, newActiveValue, 'active')
          }}
        />
      )
    }
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
          <Tooltip title='Edit'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                setCurrentRow(row)
                setModalType('edit')
                setShow(true)
              }}
            >
              <Icon icon='tabler:edit' fontSize={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Delete'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                setCurrentRow(row)
                setModalType('delete')
                setShow(true)
              }}
            >
              <Icon icon='tabler:trash' />
            </IconButton>
          </Tooltip>
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
            FAQ Management
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5 }}>
            {/* <CustomTextField sx={{ mb: 2 }} placeholder='search' onChange={e => setSearch(e.target.value)} /> */}
            <Button
              sx={{ mb: 2 }}
              variant='contained'
              onClick={() => {
                setModalType('add')
                setShow(true)
              }}
            >
              ADD FAQ
            </Button>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          rowHeight={62}
          rows={files}
          columns={columns}
          disableRowSelectionOnClick
          loading={data?.faqLoadingStatus === 'LOADING'}
          pageSizeOptions={[10, 25, 50]}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={() => console.log('error')}
        />
        {/* <Stack spacing={2} alignItems={'center'} sx={{ mb: '30px' }}>
          <Pagination count={data.totalPage} page={page} onChange={handleChange} />
        </Stack> */}

        {modalType === 'edit' ? (
          <CustomDialog show={show} setShow={setShow} title='Edit FAQ'>
            <EditModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        ) : modalType === 'add' ? (
          <CustomDialog show={show} setShow={setShow} title='Create FAQ'>
            <AddModal onClose={closeModal} />
          </CustomDialog>
        ) : modalType === 'delete' ? (
          <CustomDialog show={show} setShow={setShow} title='Delete'>
            <DeleteModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        ) : (
          <CustomDialog show={show} setShow={setShow} title='Questions'>
            <SendModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        )}
      </Card>
    </Grid>
  )
}

export default FAQ
