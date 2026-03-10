import { useState, useEffect, forwardRef } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { Switch } from '@mui/material'
import { fetchDealerData, changeDealerStatus } from 'src/store/apps/dealer'
import CustomTextField from 'src/@core/components/mui/text-field'

const Dealers = () => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [search, setSearch] = useState('')

  const handleSearch = event => {
    setSearch(event.target.value)
  }

  const dispatch = useDispatch()

  const data = useSelector(state => state.dealer)

  const files = data?.dealer?.map((n, i) => {
    return {
      ...n,
      ['id']: paginationModel.page * paginationModel.pageSize + i + 1
    }
  })

  useEffect(() => {
    dispatch(fetchDealerData({ paginationModel, search: search }))
  }, [paginationModel, search])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchDealerData({ paginationModel, search: search }))
    }
  }, [data.shouldFetchData])

  const handleActive = async (id, active) => {
    dispatch(changeDealerStatus({ id, active }))
  }

  const defaultColumns = [
    {
      flex: 0.1,
      field: 'id',
      minWidth: 100,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{`${row?.id}`}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'Kunnr',
      headerName: 'Dealer Code',
      renderCell: ({ row }) => <Typography>{row?.Kunnr}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'Name1',
      headerName: 'Dealer Name',
      renderCell: ({ row }) => <Typography>{row?.Name1}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'OutTot',
      headerName: 'Outstanding',
      renderCell: ({ row }) => (
        <>
          <Icon icon='tabler:currency-rupee' />
          <Typography>{row?.OutTot}</Typography>
        </>
      )
    },
    {
      flex: 0.1,
      minWidth: 200,
      field: 'Dltype',
      headerName: 'DL Type',
      renderCell: ({ row }) => <Typography>{row?.Dltype}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'active',
      headerName: 'Status',
      renderCell: ({ row }) => (
        <Switch
          checked={row?.active}
          onChange={event => {
            const newActiveValue = event.target.checked
            handleActive(row?._id, newActiveValue, 'active')
          }}
        />
      )
    }
  ]

  const handleKeyPress = e => {
    const allowedCharacters = /^[0-9]+$/
    if (!allowedCharacters.test(e.key)) {
      e.preventDefault()
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
            Dealers
          </Typography>

          <CustomTextField
            label='Dealer Code'
            id='fullWidth'
            onChange={e => {
              setTimeout(() => handleSearch(e), 2000)
            }}
            onKeyPress={handleKeyPress}
          />
        </Box>
        <DataGrid
          autoHeight
          rowHeight={62}
          rows={files}
          columns={defaultColumns}
          disableRowSelectionOnClick
          loading={data?.dealerLoadingStatus === 'LOADING'}
          rowCount={data?.totalData}
          paginationMode='server'
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          onProcessRowUpdateError={() => console.log('error')}
        />
      </Card>
    </Grid>
  )
}

export default Dealers
