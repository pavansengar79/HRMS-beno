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
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import EditModal from './edit'
import DeleteModal from './delete'
import AddModal from './add'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import format from 'date-fns/format'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import

// ** Custom Components Imports
import Button from '@mui/material/Button'

// ** Styled Components
import { Switch } from '@mui/material'
import { fetchReasonData, updateRejectData } from 'src/store/apps/reject-reason'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'

// ** Styled component for the link in the dataTable

/* eslint-disable */

/* eslint-enable */
const Reason = () => {
  // ** State
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [modalType, setModalType] = useState('')

  const dispatch = useDispatch()
  const data = useSelector(state => state.reason)

  const files = data?.reason?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  useEffect(() => {
    dispatch(fetchReasonData({ paginationModel, search: search }))
  }, [paginationModel, search])

  useEffect(() => {
    dispatch(fetchReasonData({ paginationModel, search: search }))
  }, [data.shouldFetchData])

  const updateValue = () => {
    dispatch(fetchReasonData({ paginationModel, search: search }))
  }

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
    // dispatch(changeReasonStatus({ id, active }))
    dispatch(updateRejectData({ id: row?._id, status: active, name: row?.name, description: row?.description }))
  }

  const handleStatusValue = e => {
    setStatusValue(e.target.value)
  }

  const handlePageChange = e => {
    setPaginationModel(e)
    dispatch(fetchReasonData(e.page))
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
      field: 'name',
      headerName: 'Name',
      renderCell: ({ row }) => <Typography>{row?.name}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'description',
      headerName: 'Description',
      renderCell: ({ row }) => <Typography>{row?.description}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => (
        <Switch
          checked={row?.status}
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
              <Icon icon='tabler:trash' fontSize={20} />
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
            Reject Reasons
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              sx={{ mb: 2 }}
              variant='contained'
              onClick={() => {
                setShow(true)
                setModalType('add')
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
          loading={data?.reasonLoadingStatus === 'LOADING'}
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
        {modalType === 'add' ? (
          <CustomDialog show={show} setShow={setShow} title='Add Reject Reasons'>
            <AddModal onClose={closeModal} />
          </CustomDialog>
        ) : modalType === 'delete' ? (
          <CustomDialog show={show} setShow={setShow} title='Delete Reject Reason'>
            <DeleteModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        ) : (
          <CustomDialog show={show} setShow={setShow} title='Edit Reject Reason'>
            <EditModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        )}
      </Card>
    </Grid>
  )
}

export default Reason
