// ** React Imports
import { useState, useEffect } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Button from '@mui/material/Button'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Utils Import

// ** Custom Components Imports

// ** Styled Components

import { fetchMatrixData, fetchTimeConfig } from 'src/store/apps/matrix'
import DeleteModal from './delete'
import EditModal from './edit'
import TimeConfig from './timeConfig'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import { IconButton } from '@mui/material'
import AddModal from './add2'

// ** Styled component for the link in the dataTable

/* eslint-disable */

/* eslint-enable */
const EscalationMatrix = () => {
  // ** State
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [show, setShow] = useState(false)

  const [currentRow, setCurrentRow] = useState()
  const [modalType, setModalType] = useState()

  // ** Hooks
  const dispatch = useDispatch()
  const data = useSelector(state => state.matrix)

  const matrix = data?.matrix?.map((n, i) => {
    return {
      ...n,
      ['id']: i + 1
    }
  })

  useEffect(() => {
    dispatch(fetchMatrixData({ paginationModel }))
    dispatch(fetchTimeConfig())
  }, [paginationModel])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchMatrixData({ paginationModel }))
      dispatch(fetchTimeConfig())
    }
  }, [data.shouldFetchData])

  const closeModal = () => {
    setShow(false)
  }

  const defaultColumns = [
    {
      flex: 0.1,
      field: 'id',
      minWidth: 50,
      headerName: 'SR No.',
      renderCell: ({ row }) => <Typography>{`${row?.id}`}</Typography>
    },
    {
      flex: 0.25,
      minWidth: 200,
      field: 'category',
      headerName: 'Category',
      renderCell: ({ row }) => <Typography>{row?.category?.name}</Typography>
    },
    {
      flex: 0.25,
      field: 'subcategory',
      minWidth: 200,
      headerName: 'Sub-Category',
      renderCell: ({ row }) => <Typography>{row?.subCategory?.join(', ')}</Typography>
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
                setShow(true)
              }}
            >
              <Icon icon='tabler:trash' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Edit'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                setCurrentRow(row)
                setModalType('edit')
                setShow(true)
              }}

              //   href={`/apps/invoice/preview/${row.id}`}
            >
              <Icon icon='tabler:edit' fontSize={20} />
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
            Escalation Matrix
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
              ADD USER
            </Button>
            <Button
              sx={{ mb: 2, ml: 4 }}
              onClick={() => {
                setModalType('timeConfig')
                setShow(true)
              }}
              variant='contained'
            >
              Time Config
            </Button>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={matrix}
          columns={columns}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={() => console.log('error')}
          disableRowSelectionOnClick
          loading={data?.matrixLoadingStatus === 'LOADING'}
          pageSizeOptions={[10, 25, 50]}
          hideFooterPagination
        />
      </Card>

      {modalType === 'add' ? (
        <CustomDialog title='Add Escalation Matrix' show={show} setShow={setShow}>
          <AddModal onClose={closeModal} />
        </CustomDialog>
      ) : modalType === 'edit' ? (
        <CustomDialog title='Edit Escalation Matrix' show={show} setShow={setShow}>
          <EditModal data={currentRow} onClose={closeModal} />
        </CustomDialog>
      ) : modalType === 'delete' ? (
        <CustomDialog title='Delete Escalation Matrix' show={show} setShow={setShow}>
          <DeleteModal data={currentRow} onClose={closeModal} />
        </CustomDialog>
      ) : (
        <CustomDialog title='Edit Escalation Matrix Time Configuration' show={show} setShow={setShow}>
          <TimeConfig data={data?.timeConfig} onClose={closeModal} />
        </CustomDialog>
      )}
    </Grid>
  )
}

export default EscalationMatrix
