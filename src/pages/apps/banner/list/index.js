// ** React Imports
import { useState, useEffect } from 'react'

// ** Next Import

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import

// ** Styled Components

import { changeBannerStatus, fetchBannerData } from 'src/store/apps/banner'
import { Button, IconButton, Switch, Tooltip } from '@mui/material'
import { formateDate } from 'src/utils/helper'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import AddCard from './AddBanner'
import ViewModal from './ViewModal'

const Banners = () => {
  // ** State

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [show, setShow] = useState(false)
  const [modalType, setModalType] = useState()
  const [currentRow, setCurrentRow] = useState()

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.banner)
  console.log('data', data)

  const files = data?.banner?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  useEffect(() => {
    dispatch(fetchBannerData({ paginationModel }))
  }, [paginationModel])

  useEffect(() => {
    dispatch(fetchBannerData({ paginationModel }))
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
      flex: 0.1,
      minWidth: 200,
      field: 'name',
      headerName: 'Banner Title',
      renderCell: ({ row }) => <Typography>{row?.name}</Typography>
    },
    {
      flex: 0.1,
      field: 'type',
      minWidth: 100,
      headerName: 'File Type',
      renderCell: ({ row }) => <Typography>{row?.type}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'platform',
      headerName: 'Platform',
      renderCell: ({ row }) => <Typography>{`${row?.platform || '--'}`}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 140,
      field: 'issuedDate',
      headerName: 'File',
      renderCell: ({ row }) => (
        // <Typography>
        //   <a href={row?.file} target='_blank' rel='noopener noreferrer'>
        //     <Icon icon={row.type == 'Document' ? 'vscode-icons:file-type-pdf2' : 'logos:imagemin'} />
        //   </a>
        // </Typography>
        <Tooltip title='Open'>
          <IconButton
            size='small'
            sx={{ color: 'text.secondary' }}
            onClick={() => {
              if (row.type === 'Document') {
                window.open(row?.file)
              } else {
                setCurrentRow(row)
                setModalType('View')
                setShow(true)
              }
            }}
          >
            <Icon
              icon={
                row?.type == 'Document'
                  ? 'vscode-icons:file-type-pdf2'
                  : row?.type == 'Image'
                  ? 'logos:imagemin'
                  : row?.type == 'Video'
                  ? 'flat-color-icons:video-file'
                  : 'flat-color-icons:audio-file'
              }
            />
          </IconButton>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'createdAt',
      headerName: 'UPLOADED AT',
      renderCell: ({ row }) => <Typography>{formateDate(row?.createdAt)}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'active',
      headerName: 'Status',
      renderCell: ({ row }) =>
        row.active ? (
          <Switch defaultChecked onChange={() => dispatch(changeBannerStatus(row?._id))} />
        ) : (
          <Switch onChange={() => dispatch(changeBannerStatus(row?._id))} />
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
            Banners
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              sx={{ mb: 2 }}
              variant='contained'
              onClick={() => {
                setModalType('add')
                setShow(true)
              }}
            >
              ADD BANNER
            </Button>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={files}
          columns={defaultColumns}
          loading={data?.bannerLoadingStatus === 'LOADING'}
          pageSizeOptions={[10, 25, 50]}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
        />
      </Card>
      {modalType === 'add' ? (
        <CustomDialog show={show} setShow={setShow} title='Add Banner'>
          <AddCard handleClose={() => setShow(false)} />
        </CustomDialog>
      ) : (
        <CustomDialog show={show} setShow={setShow} size='full'>
          <ViewModal data={currentRow} />
        </CustomDialog>
      )}
    </Grid>
  )
}

export default Banners
