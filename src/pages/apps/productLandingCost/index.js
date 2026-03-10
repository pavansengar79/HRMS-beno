// ** React Imports
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'
import exportExcel from 'src/utils/genarateExcel'
import { fetchProductLandingCost } from 'src/store/apps/productLandingCost'
import { Button } from '@mui/material'

const ProductLandingCost = () => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const dispatch = useDispatch()

  const data = useSelector(state => state.productLandingCost)

  const files = data?.productLandingCost?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  useEffect(() => {
    dispatch(fetchProductLandingCost({ paginationModel }))
  }, [paginationModel])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchProductLandingCost({ paginationModel }))
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
      minWidth: 100,
      field: 'name',
      headerName: 'Name',
      renderCell: ({ row }) => <Typography>{row?.name}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'productType',
      headerName: 'Product Type',
      renderCell: ({ row }) => <Typography>{row?.productType}</Typography>
    },
    {
      flex: 0.25,
      minWidth: 100,
      field: 'description',
      headerName: 'Description',
      renderCell: ({ row }) => <Typography>{row?.description}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 50,
      field: 'percentage',
      headerName: 'Percentage',
      renderCell: ({ row }) => <Typography>{row?.percentage}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 150,
      field: 'discountType',
      headerName: 'Discount Type',
      renderCell: ({ row }) => <Typography>{row?.discountType}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'visibility',
      headerName: 'Visibility',
      renderCell: ({ row }) => <Typography>{row?.visibility}</Typography>
    }
  ]

  const generateExcel = async e => {
    const fileName = 'Product-Discount'

    exportExcel(
      data?.csvData.map(x => {
        let dealers = x?.applicableTo.map(x => {
          return x?.user?.Kunnr
        })
        let dealersList = dealers.join(', ')

        return {
          Name: x?.name,
          Product: x?.userId?.Name1,
          'Product Type': x?.productType,
          Description: x?.description,
          Percentage: x?.percentage,
          'Discount Type': x?.discountType,
          Visibility: x?.visibility,
          'Created On': moment.utc(x?.createdAt).format('YYYY-MM-DD'),
          Dealers: dealersList
        }
      }),

      fileName
    )
  }

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
            Discount Management
          </Typography>
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
            <Button sx={{ mb: 2 }} variant='contained' componet={Link} href='/apps/productLandingCost/add'>
              CREATE DISCOUNT
            </Button>
            <Button
              sx={{ mb: 2 }}
              variant='contained'
              color='primary'
              onClick={generateExcel}
              disabled={data?.productLandingCost?.length == 0}
            >
              DOWNLOAD CSV
            </Button>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={files}
          columns={defaultColumns}
          loading={data?.productLandingCostLoading === 'LOADING'}
          pageSizeOptions={[10, 25, 50]}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
        />
      </Card>
    </Grid>
  )
}

export default ProductLandingCost
