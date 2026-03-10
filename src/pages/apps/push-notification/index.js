import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Modal from '@mui/material/Modal'
import moment from 'moment'
import AddModal from './add'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@mui/material/Button'
import { fetchPushNotification } from 'src/store/apps/push-notification'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import { Tooltip } from '@mui/material'

const PushNotification = () => {
  const [show, setShow] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const closeModal = () => {
    setShow(false)
  }
  const dispatch = useDispatch()
  const data = useSelector(state => state.pushNotification)

  const files = data?.pushNotification?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  useEffect(() => {
    dispatch(fetchPushNotification({ paginationModel }))
  }, [paginationModel])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchPushNotification({ paginationModel }))
    }
  }, [data.shouldFetchData])

  const defaultColumns = [
    {
      flex: 0.1,
      field: 'id',
      minWidth: 50,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{`${row?.id}`}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 200,
      field: 'title',
      headerName: 'Title',
      renderCell: ({ row }) => <Typography>{row?.title}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 200,
      rowHeight: 500,
      field: 'body',
      headerName: 'Body',
      renderCell: ({ row }) => (
        <Tooltip title={row?.body}>
          <Typography>{row?.body.length > 30 ? row?.body.slice(0, 30) + '...' : row?.body}</Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'redirectTo',
      headerName: 'Redirect To',
      renderCell: ({ row }) => <Typography>{row?.redirectTo}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'sentTo',
      headerName: 'Sent To',
      renderCell: ({ row }) => <Typography>{row?.sentTo}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'createdAt',
      headerName: 'Date',
      renderCell: ({ row }) => <Typography>{moment(row?.createdAt).format('ddd, DD MMM YYYY')}</Typography>
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
            Push Notification Summary
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button sx={{ mb: 2 }} variant='contained' onClick={() => setShow(true)}>
                ADD NOTIFICATION
              </Button>
            </Box>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          rowHeight={70}
          rows={files}
          columns={defaultColumns}
          loading={data?.pushNotificationLoading === 'LOADING'}
          pageSizeOptions={[10, 25, 50]}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
        />
        <Modal
          show={show}
          onClose={closeModal}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <AddModal onClose={closeModal} />
        </Modal>

        <CustomDialog show={show} setShow={setShow} title='Add Push Notification'>
          <AddModal handleClose={() => setShow(false)} />
        </CustomDialog>
      </Card>
    </Grid>
  )
}

export default PushNotification
