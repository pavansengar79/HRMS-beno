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
import Button from '@mui/material/Button'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import

import { Switch } from '@mui/material'
import { queryCategoryEdit, fetchQueryCategoryData } from 'src/store/apps/query-category'
import EditCard from './EditCard'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import AddCard from './AddCard'

// ** Styled component for the link in the dataTable

/* eslint-disable */

/* eslint-enable */
const QueryCategoryList = () => {
  // ** State

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [currentRow, setCurrentRow] = useState()
  const [modalType, setModalType] = useState()
  const [show, setShow] = useState(false)

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.queryCategory)

  useEffect(() => {
    dispatch(fetchQueryCategoryData({ paginationModel }))
  }, [paginationModel])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchQueryCategoryData({ paginationModel }))
    }
  }, [data.shouldFetchData])

  const files = data?.queryCategory?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  const closeModal = () => {
    setOpen(false)
  }

  const handleFilter = val => {
    setValue(val)
  }

  const updateValue = () => {
    dispatch(fetchQueryCategoryData({ paginationModel }))
  }

  const handleActive = async (row, active) => {
    dispatch(queryCategoryEdit({ changeStatus: true, id: row._id }, paginationModel))
  }

  const defaultColumns = [
    {
      flex: 0,
      field: 'id',
      minWidth: 50,
      headerName: 'SR No.',
      renderCell: ({ row }) => <Typography>{`${row?.id}`}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'name',
      headerName: 'Category',
      renderCell: ({ row }) => <Typography>{row?.name}</Typography>
    },
    {
      flex: 0.25,
      field: 'subcategory',
      minWidth: 200,
      headerName: 'Sub-Category',
      renderCell: ({ row }) => (
        <Tooltip title={row?.subcategory?.map(item => item?.name).join(',')}>
          <Typography>{row?.subcategory?.map(item => item?.name).join(',')}</Typography>
        </Tooltip>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'active',
      headerName: 'Status',
      renderCell: ({ row }) => (
        <Switch
          checked={row.active}
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
              <Icon icon='tabler:edit' />
            </IconButton>
          </Tooltip>
          {/* <Tooltip title='Delete'>
            <IconButton size='small' sx={{ color: 'text.secondary' }}>
              onClick={() => dispatch(deleteInvoice(row.id))}
              <Icon icon='tabler:trash' />
            </IconButton>
          </Tooltip> */}

          {/* <Tooltip title='View'>
            <IconButton size='small' sx={{ color: 'text.secondary' }} href={`/apps/invoice/preview/${row.id}`}>
              <Icon icon='tabler:eye' />
            </IconButton>
          </Tooltip> */}
          {/* <OptionsMenu
            menuProps={{ sx: { '& .MuiMenuItem-root svg': { mr: 2 } } }}
            iconButtonProps={{ size: 'small', sx: { color: 'text.secondary' } }}
            options={[
              {
                text: 'Download',
                icon: <Icon icon='tabler:download' fontSize={20} />
              },
              {
                text: 'Edit',

                // href: `/apps/query-category/edit?${row._id}`,
                icon: <Icon icon='tabler:edit' fontSize={20} />
              },
              {
                text: 'Duplicate',
                icon: <Icon icon='tabler:copy' fontSize={20} />
              }
            ]}
          /> */}
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
            Query Categories
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              sx={{ mb: 2 }}
              onClick={() => {
                setModalType('add')
                setShow(true)
              }}
              variant='contained'
            >
              ADD CATEGORY
            </Button>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={files}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={() => console.log('error')}
          disableRowSelectionOnClick
          loading={data?.queryCategoryLoadingStatus === 'LOADING'}
          hideFooterPagination

          // checkboxSelection
        />

        {/* <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <EditCard rowData={currentRow} onClose={closeModal} />
        </Modal> */}
      </Card>
      {modalType === 'add' ? (
        <CustomDialog title='Add Query Category' show={show} setShow={setShow}>
          <AddCard handleClose={() => setShow(false)} />
        </CustomDialog>
      ) : (
        <CustomDialog title='Edit Query Category' show={show} setShow={setShow}>
          <EditCard handleClose={() => setShow(false)} rowData={currentRow} />
        </CustomDialog>
      )}
    </Grid>
  )
}

export default QueryCategoryList
