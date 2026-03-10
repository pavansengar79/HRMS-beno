import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import EditModal from './[edit]'
import { useDispatch, useSelector } from 'react-redux'
import { debounce } from 'src/utils/helper'
import Button from '@mui/material/Button'
import { fetchTSO } from 'src/store/apps/TSO/simulator'
import CustomTextField from 'src/@core/components/mui/text-field'
import DeleteModal from './delete'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import Icon from 'src/@core/components/icon'
import Link from 'next/link'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import CustomChip from 'src/@core/components/mui/chip'
import moment from 'moment'

const TSOScheme = () => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [currentRow, setCurrentRow] = useState()
  const [modalType, setModalType] = useState()
  const [alignment, setAlignment] = useState('')

  const closeModal = () => {
    setShow(false)
  }

  const dispatch = useDispatch()
  const data = useSelector(state => state.TSOSimulator)

  const files = data?.TSOSimulator?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })
  useEffect(() => {
    dispatch(fetchTSO({ paginationModel, search: search, status: alignment }))
  }, [paginationModel, search, alignment])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchTSO({ paginationModel, search: search, status: alignment }))
    }
  }, [data.shouldFetchData])

  const draftColumns = [
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
      renderCell: ({ row }) => <Typography>{row?.schemeObj?.basicData?.schemeType}</Typography>,
      valueGetter: params => params?.row?.schemeObj?.basicData?.schemeType
    },
    {
      flex: 0.1,
      field: 'schemeConfigure',
      minWidth: 50,
      headerName: 'Scheme Configure',
      renderCell: ({ row }) => (
        <Typography>{row?.schemeObj?.basicData?.schemeConfig || row?.schemeObj?.basicData?.schemeConfigure}</Typography>
      ),
      valueGetter: params => params?.row?.schemeObj?.basicData?.schemeConfig
    },
    {
      flex: 0.1,
      field: 'sendSimulator',
      minWidth: 50,
      headerName: 'Send Simulator',
      renderCell: ({ row }) =>
        row?.sendSimulator ? (
          <CustomChip rounded label='True' skin='light' color='success' />
        ) : (
          <CustomChip rounded label='False' skin='light' color='error' />
        )
    },
    {
      flex: 0.1,
      field: 'sentOn',
      minWidth: 50,
      headerName: 'Sent On',
      renderCell: ({ row }) => <Typography>{moment.utc(row?.sentOn).format('YYYY-MM-DD')}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 140,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='Edit'>
            {/* <IconButton size='small' sx={{ color: 'text.secondary' }} href={`/apps/TSO/schemeSimulator/${row?._id}`}>
              <Icon icon='tabler:edit' />
            </IconButton> */}
            <Link href={`/apps/TSO/schemeSimulator/${row?._id}`} passHref>
              <IconButton size='small' sx={{ color: 'text.secondary' }}>
                <Icon icon='tabler:edit' />
              </IconButton>
            </Link>
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

  const allColumns = [
    {
      flex: 0.0,
      field: 'id',
      minWidth: 50,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{row?.id}</Typography>
    },
    {
      flex: 0.1,
      field: 'deal',
      minWidth: 100,
      headerName: 'Deal Id.',
      renderCell: ({ row }) => <Typography>{row?.deal}</Typography>
    },
    {
      flex: 0.1,
      field: 'dealType',
      minWidth: 50,
      headerName: 'Deal Type',
      renderCell: ({ row }) => <Typography>{row?.dealType}</Typography>
    },
    {
      flex: 0.1,
      field: 'description',
      minWidth: 50,
      headerName: 'Description',
      renderCell: ({ row }) => (
        <Typography>{row?.dataObj?.H?.Description || row?.dataObj?.H?.Ext_Description}</Typography>
      ),
      valueGetter: params => params?.row?.dataObj?.H?.Description
    },
    {
      flex: 0.1,
      field: 'dealCreatedOn',
      minWidth: 50,
      headerName: 'Creation Date',
      renderCell: ({ row }) => <Typography>{moment.utc(row?.dealCreatedOn).format('YYYY.MM.DD')}</Typography>
    },
    {
      flex: 0.1,
      field: 'Valid_From',
      minWidth: 50,
      headerName: 'Valid From',
      renderCell: ({ row }) => <Typography>{row?.dataObj?.H?.Valid_From}</Typography>,
      valueGetter: params => params?.row?.dataObj?.H?.Valid_From
    },
    {
      flex: 0.1,
      field: 'Valid_To',
      minWidth: 50,
      headerName: 'Valid To',
      renderCell: ({ row }) => <Typography>{row?.dataObj?.H?.Valid_To}</Typography>,
      valueGetter: params => params?.row?.dataObj?.H?.Valid_To
    }
    // {
    //   flex: 0.1,
    //   minWidth: 140,
    //   sortable: false,
    //   field: 'actions',
    //   headerName: 'Actions',
    //   renderCell: ({ row }) => (
    //     <Box sx={{ display: 'flex', alignItems: 'center' }}>
    //       <Tooltip title='Edit'>
    //         <IconButton size='small' sx={{ color: 'text.secondary' }} href={`/apps/TSO/schemeSimulator/${row?._id}`}>
    //           <Icon icon='tabler:edit' />
    //         </IconButton>
    //       </Tooltip>
    //       <Tooltip title='Delete'>
    //         <IconButton
    //           size='small'
    //           sx={{ color: 'text.secondary' }}
    //           onClick={() => {
    //             setCurrentRow(row)
    //             setModalType('delete')
    //             setShow(true)
    //           }}
    //         >
    //           <Icon icon='tabler:trash' />
    //         </IconButton>
    //       </Tooltip>
    //     </Box>
    //   )
    // }
  ]

  const handleAlignment = (event, newAlignment) => {
    if (newAlignment != null) {
      setAlignment(newAlignment)
    }
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
            Scheme Table
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5 }}>
            <CustomTextField
              fullWidth
              sx={{ mb: 2, width: 350 }}
              placeholder='Search by Scheme Type, Module or Field Name'
              onChange={e => debounce(() => setSearch(e.target.value), 2000)}
            />
            {/* <Button
              sx={{ mb: 2 }}
              component={Link}
              variant='contained'
              href='/apps/TSO/schemeSimulator/createSchemeSimulator'
            >
              CREATE SIMULATOR SCHEME
            </Button> */}
            <Button sx={{ mb: 2 }} component={Link} variant='contained' href='/apps/TSO/schemeSimulator/createScheme'>
              CREATE SCHEME
            </Button>
          </Box>
        </Box>
        <ToggleButtonGroup exclusive color='primary' value={alignment} onChange={handleAlignment} sx={{ ml: 5, mb: 5 }}>
          <ToggleButton value=''>All</ToggleButton>
          <ToggleButton value='DRAFT'>Draft</ToggleButton>
        </ToggleButtonGroup>
        <DataGrid
          autoHeight
          rowHeight={62}
          rows={files}
          columns={alignment === 'DRAFT' ? draftColumns : allColumns}
          disableRowSelectionOnClick
          loading={data?.TSOSimulatorLoading === 'LOADING'}
          rowCount={data?.totalData}
          paginationMode='server'
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
        {modalType === 'edit' ? (
          <CustomDialog show={show} setShow={setShow} title='Edit Scheme'>
            <EditModal rowData={currentRow} onClose={closeModal} />
          </CustomDialog>
        ) : (
          <CustomDialog show={show} setShow={setShow} title='Delete Scheme'>
            <DeleteModal data={currentRow} onClose={closeModal} />
          </CustomDialog>
        )}
      </Card>
    </Grid>
  )
}

export default TSOScheme
