// ** React Imports
import { useState, useEffect } from 'react'

// ** Next Import
import Link from 'next/link'
// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Button from '@mui/material/Button'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Styled Components
import { fetchCoupon, updateCoupon } from 'src/store/apps/coupon'
import { IconButton, Switch, Tooltip } from '@mui/material'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import ViewModal from './view'
import DeleteModal from './delete'

const CouponList = () => {
  // ** State
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [show, setShow] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [modalType, setModalType] = useState()

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.coupon)

  const coupons = data?.coupon?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  useEffect(() => {
    dispatch(fetchCoupon({ paginationModel }))
  }, [paginationModel])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchCoupon({ paginationModel }))
    }
  }, [data.shouldFetchData])

  const handleActive = async (row, active) => {
    dispatch(updateCoupon({ id: row?._id, isEnable: !active }))
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
      field: 'couponType',
      headerName: 'Coupon Type',
      renderCell: ({ row }) => <Typography>{row?.couponType}</Typography>
    },
    {
      flex: 0.25,
      field: 'title',
      minWidth: 200,
      headerName: 'Title',
      renderCell: ({ row }) => <Typography>{row?.couponDetails?.title}</Typography>,
      valueGetter: params => params?.row?.couponDetails?.title
    },
    {
      flex: 0.25,
      field: 'description',
      minWidth: 200,
      headerName: 'Description',
      renderCell: ({ row }) => <Typography>{row?.couponDetails?.description}</Typography>,
      valueGetter: params => params?.row?.couponDetails?.description
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'isEnable',
      headerName: 'Status',
      renderCell: ({ row }) => (
        <Switch
          checked={row?.isEnable}
          onChange={event => {
            const newActiveValue = event.target.checked
            handleActive(row, newActiveValue)
          }}
        />
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'view',
      sortable:false,
      headerName: 'Coupon Code',
      renderCell: ({ row }) => (
        <Tooltip title='View'>
          <IconButton
            size='small'
            sx={{ color: 'text.secondary' }}
            onClick={() => {
              setCurrentRow(row)
              setShow(true)
              setModalType('view')
            }}
          >
            <Icon icon='tabler:eye' fontSize={20} />
          </IconButton>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'Actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: ({ row }) => (
        <Tooltip title='Delete'>
          <IconButton
            size='small'
            sx={{ color: 'text.secondary' }}
            onClick={() => {
              setCurrentRow(row)
              setShow(true)
              setModalType('Delete')
            }}
          >
            <Icon icon='tabler:trash' fontSize={20} />
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
            Coupon List
          </Typography>
          <Button sx={{ mb: 2 }} variant='contained' componet={Link} href='/apps/coupon/add'>
            CREATE
          </Button>
        </Box>
        <DataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={coupons}
          columns={defaultColumns}
          loading={data?.couponLoadingStatus === 'LOADING'}
          pageSizeOptions={[10, 25, 50]}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
        />
      </Card>
      {modalType == 'view' ? (
        <CustomDialog show={show} setShow={setShow} title='View Coupon' size='md'>
          <ViewModal data={currentRow} />
        </CustomDialog>
      ) : (
        <CustomDialog show={show} setShow={setShow} title='Delete Coupon'>
          <DeleteModal data={currentRow} onClose={() => setShow(false)} />
        </CustomDialog>
      )}
    </Grid>
  )
}

export default CouponList
