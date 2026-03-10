import { Button, Card, Switch, Typography, InputAdornment, Drawer } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import TicketPopup from './TicketPopup2'
import { useEffect, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import { useDispatch, useSelector } from 'react-redux'
import { queryCategoryEdit, getTicketCategories } from 'src/store/apps/query-category'
import CustomTextField from 'src/@core/components/mui/text-field'
import { debounce } from 'src/utils/helper'
import CustomChip from 'src/@core/components/mui/chip'

const TicketSettingList = () => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [popupData, setPopupData] = useState(null)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const dispatch = useDispatch()
  const state = useSelector(state => state.helpDesk)
  const data1 = useSelector(state => state.queryCategory)

  const toggleModal = () => setOpen(!open)

  const ticketCategories = state.ticketCategories?.map((n, i) => {
    return {
      ...n,
      ['id']: i + 1
    }
  })

  const defaultColumns = [
    {
      flex: 0.1,
      field: 'id',
      minWidth: 75,
      headerName: 'SR.No.',
      renderCell: ({ row }) => <Typography>{`${row?.id}`}</Typography>
    },
    {
      flex: 0.25,
      minWidth: 75,
      field: 'name',
      headerName: 'Category',
      renderCell: ({ row }) => <Typography>{row?.name}</Typography>
    },
    {
      flex: 0.5,
      minWidth: 150,
      field: 'subcategory',
      headerName: 'Sub-Category',
      renderCell: ({ row }) =>
        row?.subcategory?.map((n, i) => {
          // return <Chip label={n.name} variant='outlined' color='primary' size='small' key={i} sx={{ m: 1 }} />

          return <CustomChip key={i} rounded label={n.name} skin='light' color='info' sx={{ m: 1 }} />
        })
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
    },
    {
      flex: -0.1,
      minWidth: 100,
      field: 'xyx',
      headerName: '',
      renderCell: ({ row }) => (
        <Button
          onClick={() => {
            setOpen(true)
            setPopupData(row)
          }}
          variant='contained'
          color='primary'
          size='small'
        >
          Details
        </Button>
      )
    }
  ]

  const handleActive = async (row, active) => {
    dispatch(queryCategoryEdit({ changeStatus: true, id: row._id }, paginationModel))
  }
  useEffect(() => {
    dispatch(getTicketCategories({ paginationModel, search }))
  }, [dispatch, paginationModel, search])
  useEffect(() => {
    if (data1.shouldFetchData) {
      dispatch(getTicketCategories({ paginationModel, search }))
    }
  }, [dispatch, data1.shouldFetchData])

  return (
    <Card>
      {/* {open ? <TicketPopup open={open} setOpen={setOpen} popupData={popupData} setPopupData={setPopupData} /> : <></>} */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px' }}>
        <div>
          <CustomTextField
            onChange={e => debounce(() => setSearch(e.target.value), 3000)}
            name='searchTerritory'
            variant='outlined'
            placeholder='Search'
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </div>
      </div>
      <DataGrid
        autoHeight
        rowHeight={50}
        rows={ticketCategories}
        columns={defaultColumns}
        disableRowSelectionOnClick
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50]}
      />
      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={toggleModal}
        sx={{ '& .MuiDrawer-paper': { width: [400, 500] } }}
      >
        <TicketPopup toggle={toggleModal} data={popupData} />
      </Drawer>
    </Card>
  )
}

export default TicketSettingList
