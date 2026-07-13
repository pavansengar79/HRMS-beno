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
import Modal from '@mui/material/Modal'
import EditModal from './edit'
import AddModal from './add'
import DeleteModal from './delete'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import

// ** Custom Components Imports

import Button from '@mui/material/Button'

// ** Styled Components

import { fetchMailScheduler, deleteMailScheduler } from 'src/store/apps/mail-scheduler'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'

// ** Styled component for the link in the dataTable

/* eslint-enable */
const MailSchedular = () => {
  // ** State

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [modalType, setModalType] = useState()
  const dispatch = useDispatch()
  const data = useSelector(state => state.mailScheduler)

  useEffect(() => {
    dispatch(fetchMailScheduler({ paginationModel, search: search }))
  }, [dispatch, paginationModel, search])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchMailScheduler({ paginationModel, search: search }))
    }
  }, [dispatch, data.shouldFetchData, paginationModel, search])

  const files = data?.mailScheduler?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

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
      renderCell: ({ row }) => <Typography>{row?.id}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'report',
      headerName: 'Report',
      renderCell: ({ row }) => <Typography>{row?.report}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'frequency',
      headerName: 'Frequency',
      renderCell: ({ row }) => <Typography>{row?.frequency}</Typography>
    },
    {
      flex: 0.5,
      minWidth: 200,
      field: 'userList',
      headerName: 'User List',
      renderCell: ({ row }) => (
        <Tooltip title={row?.userList?.join(', ') || ''}>
          <Typography>{row?.userList?.join(', ')}</Typography>
        </Tooltip>
      ),
      valueGetter: params => params?.row?.userList.join(',')
      // valueGetter: params => params?.row?._id?.Kunnr
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
            Report Wise Mail Scheduler
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5 }}>
            <CustomTextField
              sx={{ mb: 2 }}
              placeholder='search by user list'
              onChange={e => setTimeout(() => handleSearch(e), 2000)}
            />
            <Button
              sx={{ mb: 2 }}
              variant='contained'
              onClick={() => {
                setModalType('add')
                setShow(true)
              }}
            >
              ADD
            </Button>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          rowHeight={62}
          rows={files}
          columns={columns}
          disableRowSelectionOnClick
          loading={data?.mailLoadingStatus === 'LOADING'}
          rowCount={data?.totalData}
          paginationMode='server'
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={() => console.log('error')}
        />

        {/* <Stack spacing={2} alignItems={'center'} sx={{ mb: '30px' }}>
          <Pagination count={data.totalPage} page={page} onChange={handleChange} />
        </Stack> */}

        {modalType === 'edit' ? (
          <CustomDialog show={show} setShow={setShow} title='Update User'>
            <EditModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        ) : modalType === 'delete' ? (
          <CustomDialog show={show} setShow={setShow} title='Delete'>
            <DeleteModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        ) : (
          <CustomDialog show={show} setShow={setShow} title='Add Users'>
            <AddModal onClose={closeModal} />
          </CustomDialog>
        )}
      </Card>
    </Grid>
  )
}

export default MailSchedular
