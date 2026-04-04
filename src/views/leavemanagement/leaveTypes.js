// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import { DataGrid } from '@mui/x-data-grid'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const schema = yup.object().shape({
  name:    yup.string().required('Type name is required'),
  maxDays: yup.number().typeError('Must be a number').min(1).required('Max days is required')
})

const mockTypes = [
  { id: 1, name: 'Annual Leave',    maxDays: 21, paid: true  },
  { id: 2, name: 'Sick Leave',      maxDays: 10, paid: true  },
  { id: 3, name: 'Casual Leave',    maxDays: 7,  paid: false },
  { id: 4, name: 'Maternity Leave', maxDays: 90, paid: true  },
]

const TabLeaveTypes = () => {
  const [rows, setRows]     = useState(mockTypes)
  const [open, setOpen]     = useState(false)
  const [editRow, setEditRow] = useState(null)
  const [paid, setPaid]     = useState(true)

  const { reset, control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', maxDays: '' }
  })

  const handleOpen = (row = null) => {
    setEditRow(row)
    setPaid(row ? row.paid : true)
    reset(row ? { name: row.name, maxDays: row.maxDays } : { name: '', maxDays: '' })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditRow(null)
    reset()
  }

  const onSubmit = data => {
    if (editRow) {
      setRows(prev => prev.map(r => r.id === editRow.id ? { ...r, ...data, paid } : r))
    } else {
      setRows(prev => [...prev, { id: Date.now(), ...data, paid }])
    }
    handleClose()
  }

  const handleDelete = id => setRows(prev => prev.filter(r => r.id !== id))

  const columns = [
    { field: 'id',      headerName: '#',        width: 60  },
    { field: 'name',    headerName: 'Type Name', flex: 1   },
    { field: 'maxDays', headerName: 'Max Days',  width: 120 },
    {
      field: 'paid', headerName: 'Paid', width: 100,
      renderCell: ({ row }) => (
        <Icon
          icon={row.paid ? 'tabler:circle-check' : 'tabler:circle-x'}
          color={row.paid ? 'green' : 'red'}
        />
      )
    },
    {
      field: 'actions', headerName: 'Actions', flex: 1,
      renderCell: ({ row }) => (
        <Stack direction='row' spacing={1}>
          <IconButton size='small' onClick={() => handleOpen(row)}>
            <Icon icon='tabler:edit' />
          </IconButton>
          <IconButton size='small' color='error' onClick={() => handleDelete(row.id)}>
            <Icon icon='tabler:trash' />
          </IconButton>
        </Stack>
      )
    }
  ]

  return (
    <>
      <Card>
        <CardHeader
          title='Leave Types'
          action={
            <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={() => handleOpen()}>
              Add Type
            </Button>
          }
        />
        <CardContent>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            pageSizeOptions={[10]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      {/* Drawer */}
      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={handleClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <Header>
          <Typography variant='h5'>{editRow ? 'Edit Leave Type' : 'Add Leave Type'}</Typography>
          <IconButton
            size='small'
            onClick={handleClose}
            sx={{
              p: '0.438rem', borderRadius: 1,
              color: 'text.primary', backgroundColor: 'action.selected',
              '&:hover': { backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)` }
            }}
          >
            <Icon icon='tabler:x' fontSize='1.125rem' />
          </IconButton>
        </Header>

        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name='name'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Type Name'
                  sx={{ mb: 4 }}
                  error={Boolean(errors.name)}
                  {...(errors.name && { helperText: errors.name.message })}
                />
              )}
            />
            <Controller
              name='maxDays'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='number'
                  label='Max Days'
                  sx={{ mb: 4 }}
                  error={Boolean(errors.maxDays)}
                  {...(errors.maxDays && { helperText: errors.maxDays.message })}
                />
              )}
            />
            <FormControlLabel
              sx={{ mb: 4 }}
              control={<Switch checked={paid} onChange={e => setPaid(e.target.checked)} />}
              label='Paid Leave'
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button type='submit' variant='contained' sx={{ mr: 3 }}>Save</Button>
              <Button variant='tonal' color='secondary' onClick={handleClose}>Cancel</Button>
            </Box>
          </form>
        </Box>
      </Drawer>
    </>
  )
}

export default TabLeaveTypes