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
import Dialog from '@mui/material'
import moment from 'moment'

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
import TableHeader from 'src/@core/components/CustomComponents/TableHeader'
import CustomTextField from 'src/@core/components/mui/text-field'
import Button from '@mui/material/Button'
import Modal from '@mui/material/Modal'
import ActionModal from './action'
import EditModal from './edit'
import Divider from '@mui/material/Divider'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { Chip, Switch } from '@mui/material'
import { formateDate } from 'src/utils/helper'
import { fetchQueryData } from 'src/store/apps/query'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'

// ** Styled component for the link in the dataTable

/* eslint-enable */
const QueryList = () => {
  // ** State

  const [currentRow, setCurrentRow] = useState()
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [open, setOpen] = useState(false)
  const [show, setShow] = useState(false)
  const dispatch = useDispatch()
  const data = useSelector(state => state.queries)

  const queries = data?.queries?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })
  useEffect(() => {
    dispatch(fetchQueryData({ paginationModel }))
  }, [paginationModel])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchQueryData({ paginationModel }))
    }
  }, [data.shouldFetchData])

  const openModal = () => {
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
  }

  // ** Hooks

  const updateValue = () => {
    dispatch(fetchQueryData({ paginationModel }))
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
      flex: 0.1,
      minWidth: 200,
      field: 'name',
      headerName: 'Dealer Name',
      renderCell: ({ row }) => <Typography>{row?.user?.Name1}</Typography>
    },
    {
      flex: 0.1,
      field: 'city',
      minWidth: 200,
      headerName: 'CITY',
      renderCell: ({ row }) => <Typography>{row?.user?.City1}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'category',
      headerName: 'CATEGORY',
      renderCell: ({ row }) => <Typography>{`${row?.category || '---'}`}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 140,
      field: 'subject',
      headerName: 'SUBJECT',
      renderCell: ({ row }) => <Typography>{row?.subject}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'createdAt',
      headerName: 'DATE',
      renderCell: ({ row }) => <Typography>{formateDate(row?.createdAt)}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'active',
      headerName: 'STATUS',
      renderCell: ({ row }) => (
        <Chip
          label={row?.status}
          color={row?.status == 'RESOLVED' ? 'primary' : row.status == 'OPEN' ? 'warning' : 'secondary'}
        />
      )
    },
    {
      flex: 0.1,
      field: 'action',
      minWidth: 100,
      sortable: false,
      headerName: 'ACTION',
      renderCell: ({ row }) => (
        <Tooltip title='View'>
          <IconButton
            size='small'
            sx={{ color: 'text.secondary' }}
            onClick={() => {
              setCurrentRow(row)
              setShow(true)
            }}
          >
            <Icon icon='mdi:interaction-double-tap' style={{ fontSize: '30px', color: '#7367F0' }} />
          </IconButton>
        </Tooltip>
      )
    }
  ]

  // const columns = [
  //   ...defaultColumns,
  //   {
  //     flex: 0.1,
  //     minWidth: 140,
  //     sortable: false,
  //     field: 'actions',
  //     headerName: 'Actions',
  //     renderCell: ({ row }) => (
  //       <Box sx={{ display: 'flex', alignItems: 'center' }}>
  //         <Tooltip title='Delete Query'>
  //           {/* <IconButton size='small' sx={{ color: 'text.secondary' }} onClick={() => dispatch(deleteInvoice(row.id))}> */}
  //           <IconButton size='small' sx={{ color: 'text.secondary' }}>
  //             <Icon icon='tabler:trash' />
  //           </IconButton>
  //         </Tooltip>
  // <Tooltip title='View'>
  //   <IconButton
  //     size='small'
  //     sx={{ color: 'text.secondary' }}

  //     //   href={`/apps/invoice/preview/${row.id}`}
  //   >
  //     <Icon icon='tabler:eye' />
  //   </IconButton>
  // </Tooltip>
  //         <OptionsMenu
  //           menuProps={{ sx: { '& .MuiMenuItem-root svg': { mr: 2 } } }}
  //           iconButtonProps={{ size: 'small', sx: { color: 'text.secondary' } }}
  //           options={[
  //             {
  //               text: 'Download',
  //               icon: <Icon icon='tabler:download' fontSize={20} />
  //             },
  //             {
  //               text: 'Edit',

  //               // href: `/apps/query/edit/${row.id}`,
  //               icon: <Icon icon='tabler:edit' fontSize={20} />
  //             },
  //             {
  //               text: 'Duplicate',
  //               icon: <Icon icon='tabler:copy' fontSize={20} />
  //             }
  //           ]}
  //         />
  //       </Box>
  //     )
  //   }
  // ]

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
            Queries
          </Typography>
        </Box>
        <DataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={queries}
          columns={defaultColumns}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={() => console.log('error')}
          disableRowSelectionOnClick
          loading={data?.queriesLoadingStatus === 'LOADING'}
          hideFooterPagination
        />
      </Card>
      {/* <Modal
        open={open}
        onClose={closeModal}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <EditModal data={currentRow} onClose={closeModal} />
      </Modal> */}

      <CustomDialog
        title={`Raised Ticket on ${moment(currentRow?.createdAt).format('YYYY-MM-DD, HH:MM')}`}
        show={show}
        setShow={setShow}
      >
        <EditModal onClose={() => setShow(false)} data={currentRow} />
      </CustomDialog>
    </Grid>
  )
}

export default QueryList
