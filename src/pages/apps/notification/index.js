import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import EditModal from './edit'
import AddModal from './add'
import { useDispatch, useSelector } from 'react-redux'
import { debounce } from 'src/utils/helper'
import Button from '@mui/material/Button'
import { fetchNotification } from 'src/store/apps/notification'
import CustomTextField from 'src/@core/components/mui/text-field'
import DeleteModal from './delete'
import SendModal from './send'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import Icon from 'src/@core/components/icon'

const Notification = () => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [modalType, setModalType] = useState()

  const closeModal = () => {
    setShow(false)
  }

  const dispatch = useDispatch()
  const data = useSelector(state => state.notification)

  const files = data?.notification?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  useEffect(() => {
    dispatch(fetchNotification({ paginationModel, search: search }))
  }, [paginationModel, search])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchNotification({ paginationModel, search: search }))
    }
  }, [data.shouldFetchData])

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
      field: 'groupname',
      headerName: 'Group Name',
      renderCell: ({ row }) => <Typography>{row?.groupName}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'usersList',
      headerName: 'User List',
      renderCell: ({ row }) => <Typography>{row?.userList?.length}</Typography>,
      valueGetter: params => params.row.userList.length
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'trigger',
      sortable: false,
      headerName: 'Trigger',
      renderCell: ({ row }) => (
        <Button
          variant='contained'
          onClick={() => {
            setCurrentRow(row)
            setModalType('send')
            setShow(true)
          }}
        >
          SEND NOTIFICATION
        </Button>
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
              <Icon icon='tabler:edit' />
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
            Send Notification to Custom Groups
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5 }}>
            <CustomTextField
              sx={{ mb: 2 }}
              placeholder='search'
              onChange={e => debounce(() => setSearch(e.target.value), 3000)}
            />
            <Button
              sx={{ mb: 2 }}
              variant='contained'
              onClick={() => {
                setModalType('add')
                setShow(true)
              }}
            >
              CREATE GROUP
            </Button>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          rowHeight={62}
          rows={files}
          columns={columns}
          disableRowSelectionOnClick
          loading={data?.notificationLoading === 'LOADING'}
          rowCount={data?.totalData}
          paginationMode='server'
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={() => console.log('error')}
        />
        {modalType === 'edit' ? (
          <CustomDialog show={show} setShow={setShow} title='Edit Group'>
            <EditModal rowData={currentRow} onClose={closeModal} />
          </CustomDialog>
        ) : modalType === 'add' ? (
          <CustomDialog show={show} setShow={setShow} title='Create Group'>
            <AddModal onClose={closeModal} />
          </CustomDialog>
        ) : modalType === 'delete' ? (
          <CustomDialog show={show} setShow={setShow} title='Delete User'>
            <DeleteModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        ) : (
          <CustomDialog show={show} setShow={setShow} title='Create Notification'>
            <SendModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        )}
      </Card>
    </Grid>
  )
}

export default Notification
