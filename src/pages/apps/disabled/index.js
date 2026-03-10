import { useState, useEffect, forwardRef } from 'react'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import { DataGrid } from '@mui/x-data-grid'
import format from 'date-fns/format'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@mui/material/Button'
import { Chip, IconButton, Tooltip, Typography } from '@mui/material'
import { Switch } from '@mui/material'
import { addDisabledData, fetchDisabledData } from 'src/store/apps/disabled'
import AddModal from './add'
import EditModal from './edit'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'
import Icon from 'src/@core/components/icon'

const Disabled = () => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [show, setShow] = useState(false)
  const [modalType, setModalType] = useState()
  const [currentRow, setCurrentRow] = useState()

  const dispatch = useDispatch()
  const data = useSelector(state => state.disabled)

  const files = data?.disabled?.map((n, i) => {
    return {
      ...n,
      ['id']: i + 1
    }
  })

  useEffect(() => {
    dispatch(fetchDisabledData({ paginationModel }))
  }, [paginationModel])
  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchDisabledData({ paginationModel }))
    }
  }, [data.shouldFetchData])

  function formatDateTime(dateTimeStr) {
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

    const dateTime = new Date(dateTimeStr)
    const day = dateTime.getDate()
    const month = months[dateTime.getMonth()]
    const year = dateTime.getFullYear()
    let hours = dateTime.getHours()
    let minutes = dateTime.getMinutes()

    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes

    const period = hours >= 12 ? 'pm' : 'am'

    hours = hours % 12 || 12

    const formattedDateTime = `${day}th ${month} ${year}, ${hours}:${minutes} ${period}`

    return formattedDateTime
  }

  const defaultColumns = [
    {
      flex: 0.1,
      field: 'id',
      minWidth: 50,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{row?.id}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'buttonModule',
      headerName: 'Type',
      renderCell: ({ row }) => <Typography>{row?.buttonModule}</Typography>
    },
    {
      flex: 0.25,
      minWidth: 120,
      field: 'startDate',
      headerName: 'Start Date',
      renderCell: ({ row }) => <Typography>{row?.startDate ? formatDateTime(row.startDate) : '--'}</Typography>
    },
    {
      flex: 0.25,
      minWidth: 120,
      field: 'endDate',
      headerName: 'End Date',
      renderCell: ({ row }) => <Typography>{row?.endDate ? formatDateTime(row.endDate) : '--'}</Typography>
    },
    {
      flex: 0.25,
      minWidth: 120,
      field: 'active',
      headerName: 'Status',
      renderCell: ({ row }) => (
        <Chip label={row?.active ? 'ENABLED' : 'DISABLED'} color={row?.active ? 'primary' : 'secondary'}></Chip>
      )
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'Kunnr',
      headerName: 'Users',
      renderCell: ({ row }) => <Typography>{row?.allUsers ? 'ALL' : row?.user?.Kunnr}</Typography>,
      valueGetter: params => params?.row?.user?.Kunnr
    }

    // {
    //   flex: 0.1,
    //   minWidth: 100,
    //   field: 'active',
    //   headerName: 'Action',
    //   renderCell: ({ row }) =>
    //     row.active ? (
    //       <Switch defaultChecked onChange={() => dispatch(addDisabledData({ disableId: row?._id }))} />
    //     ) : (
    //       '--'
    //     )
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
          {/* <Tooltip title='Delete'>
            <IconButton size='small' sx={{ color: 'text.secondary' }}>
              <Icon icon='tabler:trash' />
            </IconButton>
          </Tooltip> */}
          <Tooltip title='Edit'>
            <IconButton
              size='small'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                setModalType('edit')
                setShow(true)
                setCurrentRow(row)
              }}
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
            Disables
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
              ADD
            </Button>
          </Box>
        </Box>
        <DataGrid
          autoHeight
          pagination
          rowHeight={62}
          rows={files}
          columns={columns}
          disableRowSelectionOnClick
          loading={data?.disabledLoadingStatus === 'LOADING'}
          pageSizeOptions={[10, 25, 50]}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
        {modalType === 'add' ? (
          <CustomDialog show={show} setShow={setShow} title='Add Disable'>
            <AddModal onClose={() => setShow(false)} />
          </CustomDialog>
        ) : (
          <CustomDialog show={show} setShow={setShow} title='Edit Disable'>
            <EditModal onClose={() => setShow(false)} rowData={currentRow} />
          </CustomDialog>
        )}
      </Card>
    </Grid>
  )
}

export default Disabled
