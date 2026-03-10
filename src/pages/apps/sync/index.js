// ** React Imports
import { useState } from 'react'

// ** Next Import

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

import Typography from '@mui/material/Typography'

import { DataGrid } from '@mui/x-data-grid'

import { Modal, Paper, Slide } from '@mui/material/'
import CommonModal from './CommonModal'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports

// ** Store & Actions Imports
import { useDispatch } from 'react-redux'
import { addSyncPayment, addSyncOrder, addSyncUser, addSyncParty, addSyncProduct } from 'src/store/apps/sync'

// ** Utils Import

// ** Custom Components Imports

import Button from '@mui/material/Button'
import { date } from 'yup'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'

// ** Styled Components

// ** Styled component for the link in the dataTable

/* eslint-disable */

/* eslint-enable */
const Sync = () => {
  // ** State

  const [show, setShow] = useState(false)
  const [currentRow, setCurrentRow] = useState()

  let date = new Date()

  const showModal = () => {
    setShow(true)
  }

  const closeModal = () => {
    setShow(false)
  }

  // ** Hooks
  const dispatch = useDispatch()

  const data = [
    {
      _id: 1,
      module: 'Payment',
      condition: 'Sync from Date',
      sync: 'Sync Payments',
      type: 'payment',
      label: 'Choose Start Date'
    },
    { _id: 2, module: 'User', condition: 'Sync by Kunnr', sync: 'Sync All User', type: 'user', label: 'Enter Kunnr' },
    {
      _id: 1,
      module: 'Order',
      condition: 'Sync By Kunnr',
      type: 'order',
      label: 'Enter Kunnr'

      // sync: 'Sync By Kunnr',
    },
    { _id: 1, module: 'Product', type: 'product', sync: 'Sync All Products', label: 'Enter Kunnr' },
    {
      _id: 1,
      module: 'Ship to Party',
      condition: 'Sync by Kunnr',
      type: 'party',
      label: 'Enter Kunnr'

      // sync: 'Sync By Kunnr',
    }
  ]

  const files = data.map((n, i) => {
    return {
      ...n,
      ['id']: i + 1
    }
  })

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
      field: 'module',
      headerName: 'Module',
      renderCell: ({ row }) => <Typography>{row?.module || 'N/A'}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'condition',
      headerName: 'Condition',
      renderCell: ({ row }) =>
        row.condition ? (
          <Typography
            sx={{
              color: 'blue',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
            onClick={() => {
              setCurrentRow(row)
              setShow(true)
            }}
          >
            {row.condition}
          </Typography>
        ) : (
          <Typography>N/A</Typography>
        )
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'type',
      headerName: 'Sync',
      renderCell: ({ row }) =>
        row.sync ? (
          <Button
            variant='contained'
            onClick={() =>
              row.type === 'payment'
                ? dispatch(addSyncPayment({ data: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` }))
                : row.type === 'user'
                ? dispatch(addSyncUser({ type: 'all' }))
                : dispatch(addSyncProduct({ type: 'all' }))
            }
          >
            {row.sync}
          </Button>
        ) : (
          <Typography>N/A</Typography>
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
            Sync
          </Typography>
        </Box>
        <DataGrid
          autoHeight
          rowHeight={62}
          rows={files}
          columns={defaultColumns}
          disableRowSelectionOnClick
          hideFooterPagination
        />

        <CustomDialog show={show} setShow={setShow} title={currentRow?.sync}>
          <CommonModal rowData={currentRow} onClose={closeModal} />
        </CustomDialog>
      </Card>
    </Grid>
  )
}

export default Sync
