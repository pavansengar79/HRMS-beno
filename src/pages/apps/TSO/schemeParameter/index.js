import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import EditModal from './edit'
import { useDispatch, useSelector } from 'react-redux'
import { debounce } from 'src/utils/helper'
import Button from '@mui/material/Button'
import { fetchTSO } from 'src/store/apps/TSO/scheme'
import CustomTextField from 'src/@core/components/mui/text-field'
import DeleteModal from './delete'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import Icon from 'src/@core/components/icon'
import Link from 'next/link'

const TSOScheme = () => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [modalType, setModalType] = useState()

  const closeModal = () => {
    setShow(false)
  }

  const dispatch = useDispatch()
  const data = useSelector(state => state.TSOScheme)

  const files = data?.TSOScheme?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })
  useEffect(() => {
    dispatch(fetchTSO({ paginationModel, search: search }))
  }, [paginationModel, search])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchTSO({ paginationModel, search: search }))
    }
  }, [data.shouldFetchData])

  const defaultColumns = [
    {
      flex: 0.0,
      field: 'id',
      minWidth: 50,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{row?.id}</Typography>
    },
    {
      flex: 0.1,
      field: 'schemetype',
      minWidth: 50,
      headerName: 'Scheme Type',
      renderCell: ({ row }) => <Typography>{row?.schemeType}</Typography>
    },
    {
      flex: 0.1,
      field: 'module',
      minWidth: 50,
      headerName: 'Module',
      renderCell: ({ row }) => <Typography>{row?.module}</Typography>
    },
    {
      flex: 0.1,
      field: 'fieldname',
      minWidth: 50,
      headerName: 'Field Name',
      renderCell: ({ row }) => <Typography>{row?.fieldName}</Typography>
    },
    {
      flex: 0.1,
      field: 'fieldtype',
      minWidth: 50,
      headerName: 'Field Type',
      renderCell: ({ row }) => <Typography>{row?.fieldType}</Typography>
    },
    {
      flex: 0.1,
      field: 'values',
      minWidth: 50,
      headerName: 'Values',
      renderCell: ({ row }) => <Typography>{row?.values ? row?.values?.join(',') : '--'}</Typography>
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
            Simulator Parameters
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5 }}>
            <CustomTextField
              fullWidth
              sx={{ mb: 2, width: 350 }}
              placeholder='Search by Scheme Type, Module or Field Name'
              onChange={e => debounce(() => setSearch(e.target.value), 2000)}
            />
            <Button sx={{ mb: 2 }} component={Link} variant='contained' href='/apps/TSO/schemeParameter/create'>
              CREATE PARAMETERS
            </Button>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          rowHeight={62}
          rows={files}
          columns={columns}
          disableRowSelectionOnClick
          loading={data?.TSOSchemeLoading === 'LOADING'}
          rowCount={data?.totalData}
          paginationMode='server'
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
        {modalType === 'edit' ? (
          <CustomDialog show={show} setShow={setShow} title='Edit Parameter'>
            <EditModal rowData={currentRow} onClose={closeModal} />
          </CustomDialog>
        ) : (
          <CustomDialog show={show} setShow={setShow} title='Delete Parameter'>
            <DeleteModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        )}
      </Card>
    </Grid>
  )
}

export default TSOScheme
