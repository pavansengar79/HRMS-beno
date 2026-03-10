// ** React Imports
import { useState, useEffect } from 'react'

// ** Next Import

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Tooltip from '@mui/material/Tooltip'

import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import
import ViewModal from './view'
import AddModal from './add'
import DeleteModal from './delete'
import exportExcel from 'src/utils/genarateExcel'

// ** Custom Components Imports

import Button from '@mui/material/Button'

import { Modal, TextField } from '@mui/material'

// ** Styled Components

import {
  fetchLoyaltySchemeData,
  fetchLoyaltySchemePremiuim,
  fetchSchemeData,
  fetchTotalPoints
} from 'src/store/apps/scheme'
import toast from 'react-hot-toast'
import Link from 'next/link'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { duration } from 'moment'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'

// ** Styled component for the link in the dataTable

/* eslint-disable */

/* eslint-enable */
const LoyaltyScheme = () => {
  // ** State

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [modalType, setModalType] = useState()
  const [open, setOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.scheme)

  useEffect(() => {
    dispatch(fetchSchemeData({ paginationModel, search }))
  }, [paginationModel, search])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchSchemeData({ paginationModel, search }))
    }
  }, [data.shouldFetchData])

  const files = data?.scheme?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  const generateExcel = async id => {
    const fileName = 'Fleet-Loyalty-Report'
    const fileName1 = 'Dealer-Loyalty-Report'
    toast.success('file download in progress', { duration: 2000 })

    const [loyaltySchemeData, loyaltySchemeDataPremium, totalPoints] = await Promise.all([
      await axiosRequest({
        url: `/api/admindash/loyalty/loyalty-scheme-data/${id}`,
        method: 'GET'
      }),
      await axiosRequest({
        url: `/api/admindash/loyalty/loyalty-scheme-data/premium/${id}`,
        method: 'GET'
      }),
      await axiosRequest({
        url: `/api/admindash/loyalty/loyalty-scheme-points/${id}`,
        method: 'GET'
      })
    ])

    let sumTotalPoints = totalPoints?.data

    let totalData = loyaltySchemeDataPremium?.data
    let kunnrObject = {}

    if (loyaltySchemeData?.user === 'DEALER') {
      let schemeData = await convertData(loyaltySchemeData?.data)

      const updateObject = (item, key) => {
        kunnrObject[key] = { ...kunnrObject[key], ...item }
      }

      schemeData.forEach(item => updateObject(item, item.Kunnr))

      totalData.forEach(item => updateObject(item, item.Kunnr))

      sumTotalPoints.forEach(item => updateObject(item, item.Kunnr))

      let mergedData = await Object.values(kunnrObject)

      await exportExcel(
        mergedData?.map(x => {
          let tempOBj = {}

          x?.Matnr?.forEach((item, idx) => {
            tempOBj[`Tyre_${idx + 1}`] = `${item?.matr}`
          })

          return {
            'Dealer Code': x?.Kunnr,
            'Total Tyres Sold': x?.totalQuantity ?? 0,
            'Premium Tyres Sold': x?.premiumCount ?? 0,
            'Invoice Generated': x?.count ?? 0,
            'Tyres Sold for Points': x?.totalBillQty ?? 0,
            'Total Points':
              (x?.nonPrmTyrePoints ?? 0) +
              (x?.nonPrmBrandTyrePoints ?? 0) +
              (x?.prmTyrePoints ?? 0) +
              (x?.pmrSpecialTyrePoints ?? 0),
            'Non Prm Tyres Sold': x?.normalTyreCount ?? 0,
            'Non Prm Special Tyres Sold': x?.specialTypeCount ?? 0,
            'Prm Tyres Sold': x?.normalBrandPrmTyreCount ?? 0,
            'Prm Special Tyres Sold': x?.brandPrmTyreCount ?? 0,
            'Non Prm Points': x?.nonPrmTyrePoints ?? 0,
            'Non Prm Special Points': x?.nonPrmBrandTyrePoints ?? 0,
            'Prm Points': x?.prmTyrePoints ?? 0,
            'Prm Special Points': x?.pmrSpecialTyrePoints ?? 0,
            ...tempOBj
          }
        }),
        loyaltySchemeDataPremium?.scheme ?? fileName1
      )
      toast.success('file download successfully!', { duration: 2000 })
    }
    if (loyaltySchemeData?.user === 'FLEET') {
      let schemeData = loyaltySchemeData?.data
      let kunnrObject = {}

      const updateObject = (item, key) => {
        kunnrObject[key] = { ...kunnrObject[key], ...item }
      }

      schemeData.forEach(item => updateObject(item, item.Kunnr))
      totalData.forEach(item => updateObject(item, item.Kunnr))
      sumTotalPoints.forEach(item => updateObject(item, item.Kunnr))

      let mergedData = Object.values(kunnrObject)

      exportExcel(
        mergedData?.map(x => {
          return {
            'Fleet Code': x?.Kunnr,
            'Fleet Name': x?.name,
            'Fleet Club': x?.Club,
            'Invoices Generated': x?.count ?? 0,
            'TBB Sales': x?.TBB ?? 0,
            'TBR Sales': x?.TBR ?? 0,
            'Total Sales': x?.TBB + x?.TBR ?? 0,
            'TBB Total Points': (x?.TBB ?? 0) * (x?.tbbPoints ?? 0),
            'TBR Total Points': (x?.TBR ?? 0) * (x?.tbrPoints ?? 0),
            'Slabjump Points': x?.slabJumpPoint ?? 0,
            'Total Points': x?.points ?? 0
          }
        }),
        loyaltySchemeDataPremium?.scheme ?? fileName
      )
      toast.success('file download successfully!', { duration: 2000 })
    }
  }

  const convertData = async data => {
    return data.map(group => {
      const result = {
        Kunnr: group[0]?.Kunnr,
        totalBillQty: group.reduce((sum, item) => sum + item.totalBillQty, 0),
        Matnr: group.reduce((matnrArray, item) => {
          matnrArray.push({
            matr: `${item.Product} - ${item.totalBillQty}`
          })

          return matnrArray
        }, [])
      }

      return result
    })
  }

  const handleSearch = event => {
    setSearch(event.target.value)
  }

  const closeModal = () => {
    //  setOpen(false)
    setShow(false)
  }

  const updateValue = () => {
    dispatch(fetchSchemeData({ paginationModel, search }))
  }

  function formatDateRange(startDateStr, endDateStr) {
    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]

    const formattedStartDate = `${months[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()}`
    const formattedEndDate = `${months[endDate.getMonth()]} ${endDate.getDate()}, ${endDate.getFullYear()}`

    return `${formattedStartDate} - ${formattedEndDate}`
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
      field: 'userType',
      minWidth: 200,
      headerName: 'User Type',
      renderCell: ({ row }) => <Typography>{row?.userType}</Typography>
    },
    {
      flex: 0.25,
      field: 'duration',
      minWidth: 200,
      headerName: 'Duration',
      renderCell: ({ row }) => <Typography>{formatDateRange(row?.startDate, row?.endDate)}</Typography>
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
          <Tooltip title='Delete'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                setCurrentRow(row)
                setModalType('delete')
                //setOpen(true)
                setShow(true)
              }}
            >
              <Icon icon='tabler:trash' />
            </IconButton>
          </Tooltip>
          <Tooltip title='View'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                setCurrentRow(row)
                setModalType('view')
                setShow(true)
              }}
            >
              <Icon icon='tabler:eye' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Download'>
            <IconButton size='small' sx={{ color: 'text.secondary' }} onClick={() => generateExcel(row?._id)}>
              <Icon icon='tabler:download' fontSize={20} />
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
            Loyalty Schemes
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button sx={{ ml: 2, mb: 3 }} variant='contained' component={Link} href='/apps/loyalty/scheme/add'>
              CREATE LOYALTY SCHEME
            </Button>
          </Box>
          <TextField
            fullWidth
            label='search schemes'
            id='fullWidth'
            onChange={e => {
              setTimeout(() => handleSearch(e), 2000)
            }}
          />
        </Box>
        <DataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={files}
          columns={columns}
          loading={data?.schemeLoadingStatus === 'LOADING'}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
        />
      </Card>

      <Modal
        open={show}
        onClose={closeModal}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        {modalType === 'view' ? (
          <ViewModal data={currentRow} onClose={closeModal} />
        ) : (
          <CustomDialog show={show} setShow={setShow} title='Delete'>
            <DeleteModal data={currentRow} onClose={closeModal} onUpdate={updateValue} />
          </CustomDialog>
        )}
      </Modal>
    </Grid>
  )
}

export default LoyaltyScheme
