// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ---------------------------------------------------------------------------
// Mock API helper
// ---------------------------------------------------------------------------

/**
 * Submit a new department.
 * Replace with: axios.post('/api/departments', payload)
 */
const postDepartment = async payload => {
  await new Promise(r => setTimeout(r, 350))
  console.log('New department payload:', payload)

  return { success: true, data: { id: Date.now(), ...payload } }
}

// ---------------------------------------------------------------------------
// Styled header — same as all other drawers in the project
// ---------------------------------------------------------------------------
const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

// ---------------------------------------------------------------------------
// Yup schema
// ---------------------------------------------------------------------------
const schema = yup.object().shape({
  name:        yup.string().required('Department name is required'),
  description: yup.string()
})

const defaultValues = {
  name:        '',
  description: ''
}

// ---------------------------------------------------------------------------
// AddDepartmentDrawer
// ---------------------------------------------------------------------------
const AddDepartmentDrawer = ({ open, toggle, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false)

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const onSubmit = async data => {
    setSubmitting(true)
    try {
      const res = await postDepartment(data)
      handleClose()
      if (onSuccess) onSuccess(res.data)
    } catch (err) {
      console.error('Failed to add department:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
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
        <Typography variant='h5'>Add Department</Typography>
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{
            p: '0.438rem',
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>

      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Department Name */}
          <Controller
            name='name'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Department Name'
                onChange={onChange}
                placeholder='e.g. Engineering'
                error={Boolean(errors.name)}
                {...(errors.name && { helperText: errors.name.message })}
              />
            )}
          />

          {/* Department Description */}
          <Controller
            name='description'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                multiline
                rows={4}
                value={value}
                sx={{ mb: 6 }}
                label='Description (optional)'
                onChange={onChange}
                placeholder='Brief description of this department…'
                error={Boolean(errors.description)}
                {...(errors.description && { helperText: errors.description.message })}
              />
            )}
          />

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button type='submit' variant='contained' sx={{ mr: 3 }} disabled={submitting}>
              {submitting ? 'Adding…' : 'Add Department'}
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}

export default AddDepartmentDrawer