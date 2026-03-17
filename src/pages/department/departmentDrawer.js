// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'

// ✅ Interceptor — attaches Bearer token from localStorage on every request
import axiosRequest from 'src/utils/AxiosInterceptor'

// ---------------------------------------------------------------------------
// Styled header
// ---------------------------------------------------------------------------
const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const schema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name must not exceed 100 characters')
    .required('Department name is required')
})

const defaultValues = { name: '' }

// ---------------------------------------------------------------------------
// AddDepartmentDrawer
//
// Props:
//   open        — boolean
//   toggle      — () => void        close the drawer
//   onSuccess   — () => void        called after successful create or update
//   editingDept — null (Add mode)   |  { _id, name, ... } (Edit mode)
// ---------------------------------------------------------------------------
const AddDepartmentDrawer = ({ open, toggle, onSuccess, editingDept }) => {
  const isEditMode  = Boolean(editingDept)
  const [submitting, setSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  // Pre-fill form when editing, clear when adding
  useEffect(() => {
    if (open) {
      reset({ name: editingDept?.name ?? '' })
    }
  }, [open, editingDept, reset])

  // ---------------------------------------------------------------------------
  // Submit
  //   Add mode  → POST /api/v1/departments/create
  //   Edit mode → PUT  /api/v1/departments/:id
  // ---------------------------------------------------------------------------
  const onSubmit = async data => {
    try {
      setSubmitting(true)

      const res = isEditMode
        ? await axiosRequest.put(`/api/v1/departments/${editingDept._id}`, { name: data.name.trim() })
        : await axiosRequest.post('/api/v1/departments/create', { name: data.name.trim() })

      if (res?.success) {
        toast.success(
          isEditMode
            ? `Department renamed to "${data.name.trim()}" successfully`
            : `Department "${data.name.trim()}" created successfully`
        )
        handleClose()
        onSuccess?.()
      } else {
        toast.error(res?.message || `Failed to ${isEditMode ? 'update' : 'create'} department`)
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    reset(defaultValues)
    toggle()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Header>
        <Typography variant='h5'>
          {isEditMode ? 'Edit Department' : 'Add Department'}
        </Typography>
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{
            p: '0.375rem',
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors?.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </IconButton>
      </Header>

      <Box
        component='form'
        onSubmit={handleSubmit(onSubmit)}
        sx={{ px: 6, pb: 6, display: 'flex', flexDirection: 'column', gap: 5 }}
      >
        <Controller
          name='name'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              autoFocus
              label='Department Name'
              placeholder='e.g. Engineering'
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              disabled={submitting}
            />
          )}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Button
            fullWidth
            type='submit'
            variant='contained'
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {submitting
              ? isEditMode ? 'Saving…' : 'Creating…'
              : isEditMode ? 'Save Changes' : 'Create Department'
            }
          </Button>
          <Button fullWidth variant='tonal' color='secondary' onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default AddDepartmentDrawer