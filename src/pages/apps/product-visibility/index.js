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
import EditModal from './edit'
import AddModal from './add'
import ViewModal from './view'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

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
import { fetchRestrictedProduct, fetchNonRestrictedProduct } from 'src/store/apps/product-visibility'
import CustomTextField from 'src/@core/components/mui/text-field'
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
const ProductVisibility = () => {
  // ** State

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [modalType, setModalType] = useState()
  const [currentRow, setCurrentRow] = useState()
  const [show, setShow] = useState(false)
  const [alignment, setAlignment] = useState('restrictedProduct')

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
  const dispatch = useDispatch()
  const data = useSelector(state => state.Products)
  let totalData = 0
  let loading

  const files =
    alignment === 'restrictedProduct'
      ? data?.restrictedProduct?.map((n, i) => {
          totalData = data?.totalData1
          loading = data?.restrictedProductLoadingStatus

          return {
            ...n,
            ['id']: paginationModel.page * paginationModel.pageSize + i + 1
          }
        })
      : data?.NonRestrictedProduct?.map((n, i) => {
          totalData = data?.totalData2
          loading = data?.NonRestrictedProductLoadingStatus

          return {
            ...n,
            ['id']: paginationModel.page * paginationModel.pageSize + i + 1
          }
        })
  useEffect(() => {
    if (alignment === 'restrictedProduct') {
      dispatch(fetchRestrictedProduct({ paginationModel, search: search }))
    } else {
      dispatch(fetchNonRestrictedProduct({ paginationModel, search: search }))
    }
  }, [paginationModel, search, alignment])

  useEffect(() => {
    if (data.shouldFetchData.restricted) {
      dispatch(fetchRestrictedProduct({ paginationModel, search: search }))
    } else if (data.shouldFetchData.NonRestricted) {
      dispatch(fetchNonRestrictedProduct({ paginationModel, search: search }))
    }
  }, [data.shouldFetchData])

  const handleFilter = val => {
    setValue(val)
  }

  const handleActive = async (row, active) => {
    console.log('row', row)

    // dispatch(changerepairStatus({ id: id, status: active }))
    dispatch(updateRejectData({ id: row._id, status: active, name: row.name, description: row.description }))
  }

  const handleStatusValue = e => {
    setStatusValue(e.target.value)
  }

  const handlePageChange = e => {
    setPaginationModel(e)
    dispatch(fetchRestrictedProduct(e.page))
  }

  const handleOnChangeRange = dates => {
    const [start, end] = dates
    if (start !== null && end !== null) {
      setDates(dates)
    }
    setStartDateRange(start)
    setEndDateRange(end)
  }

  const handleAlignment = (event, newAlignment) => {
    if (newAlignment != null) {
      setAlignment(newAlignment)
    }
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
      flex: 0.25,
      minWidth: 100,
      field: 'materialNo',
      headerName: 'Material No',
      renderCell: ({ row }) => <Typography>{row?.materialNo}</Typography>
    },
    {
      flex: 0.25,
      minWidth: 100,
      field: 'MatDesc',
      headerName: 'Tyre Desc',
      renderCell: ({ row }) => <Typography>{row?.MatDesc}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'restrictedDealers',
      headerName: 'Dealers Blocked',
      renderCell: ({ row }) => <Typography>{row?.restrictedDealers?.length}</Typography>,
      valueGetter: params => params.row.restrictedDealers.length
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'view',
      sortable: false,
      headerName: 'View',
      renderCell: ({ row }) => (
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
            <Icon icon='tabler:eye' fontSize={20} />
          </IconButton>
        </Tooltip>
      )
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
          {/* <Tooltip title='Delete'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                dispatch(deleteMailScheduler(row?._id))
                updateValue()
              }}
            >
              <Icon icon='tabler:trash' />
            </IconButton>
          </Tooltip> */}
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
            Manage Product Visibility
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5 }}>
            <CustomTextField
              sx={{ mb: 2 }}
              placeholder='Material No/Product Name'
              onChange={e => setTimeout(() => setSearch(e.target.value), 2000)}
            />
            {alignment === 'restrictedProduct' ? (
              <Button
                sx={{ mb: 2 }}
                variant='contained'
                onClick={() => {
                  setModalType('add')
                  setShow(true)
                }}
              >
                BULK UPLOAD
              </Button>
            ) : (
              <></>
            )}
          </Box>
        </Box>
        {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, ml: 5 }}>
          <Button
            sx={{ mb: 2 }}
            variant='contained'
            onClick={() => {
              setModalType('add')
              setShow(true)
            }}
          >
            BULK UPLOAD
          </Button>
          <Button
            sx={{ mb: 2 }}
            variant='contained'
            onClick={() => {
              setModalType('add')
              setShow(true)
            }}
          >
            BULK UPLOAD
          </Button>
        </Box> */}
        <ToggleButtonGroup exclusive color='primary' value={alignment} onChange={handleAlignment} sx={{ ml: 5, mb: 5 }}>
          <ToggleButton value='restrictedProduct'>Restricted SKU</ToggleButton>
          <ToggleButton value='NonRestrictedProduct'>Non Restricted SKU</ToggleButton>
        </ToggleButtonGroup>
        <DataGrid
          autoHeight
          rowHeight={62}
          rows={files}
          columns={columns}
          disableRowSelectionOnClick
          loading={loading === 'LOADING'}
          rowCount={totalData}
          paginationMode='server'
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={() => console.log('error')}
        />

        {/* <Stack spacing={2} alignItems={'center'} sx={{ mb: '30px' }}>
          <Pagination count={data.totalData} page={page} onChange={handleChange} />
        </Stack> */}

        {modalType === 'edit' ? (
          <CustomDialog show={show} setShow={setShow} title='Edit Dealer Product Visibility'>
            <EditModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        ) : modalType === 'add' ? (
          <CustomDialog show={show} setShow={setShow} title='Product Category'>
            <AddModal onClose={closeModal} page={paginationModel} />
          </CustomDialog>
        ) : (
          <CustomDialog show={show} setShow={setShow} title='Blocked Dealers List'>
            <ViewModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        )}
      </Card>
    </Grid>
  )
}

export default ProductVisibility
