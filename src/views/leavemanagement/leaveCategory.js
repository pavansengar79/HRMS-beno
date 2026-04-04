// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
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
  name:        yup.string().required('Category name is required'),
  description: yup.string().required('Description is required')
})

const mockCategories = [
  { id: 1, name: 'Medical',   description: 'Health-related leaves'    },
  { id: 2, name: 'Personal',  description: 'Personal day-offs'        },
  { id: 3, name: 'Emergency', description: 'Urgent family situations' },
]

const TabLeaveCategory = () => {
  const [rows, setRows]       = useState(mockCategories)
  const [open, setOpen]       = useState(false)
  const [editRow, setEditRow] = useState(null)

  const { reset, control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', description: '' }
  })

  const handleOpen = (row = null) => {
    setEditRow(row)
    reset(row ? { name: row.name, description: row.description } : { name: '', description: '' })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditRow(null)
    reset()
  }

  const onSubmit = data => {
    if (editRow) {
      setRows(prev => prev.map(r => r.id === editRow.id ? { ...r, ...data } : r))
    } else {
      setRows(prev => [...prev, { id: Date.now(), ...data }])
    }
    handleClose()
  }

  const handleDelete = id => setRows(prev => prev.filter(r => r.id !== id))

  const columns = [
    { field: 'id',          headerName: '#',          width: 60 },
    { field: 'name',        headerName: 'Category',   flex: 1   },
    { field: 'description', headerName: 'Description',flex: 2   },
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
          title='Leave Categories'
          action={
            <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={() => handleOpen()}>
              Add Category
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
          <Typography variant='h5'>{editRow ? 'Edit Category' : 'Add Category'}</Typography>
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
                  label='Category Name'
                  sx={{ mb: 4 }}
                  error={Boolean(errors.name)}
                  {...(errors.name && { helperText: errors.name.message })}
                />
              )}
            />
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  label='Description'
                  sx={{ mb: 6 }}
                  placeholder='Describe this category…'
                  error={Boolean(errors.description)}
                  {...(errors.description && { helperText: errors.description.message })}
                />
              )}
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

export default TabLeaveCategory