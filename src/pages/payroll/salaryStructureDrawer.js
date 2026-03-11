// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
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
// Mock employees list for the dropdown
// Replace with: axios.get('/api/employees') inside a useEffect
// ---------------------------------------------------------------------------
const MOCK_EMPLOYEES = [
  { id: 1, name: 'Rahul Sharma'   },
  { id: 2, name: 'Priya Singh'    },
  { id: 3, name: 'Amit Verma'     },
  { id: 4, name: 'Sneha Kapoor'   },
  { id: 5, name: 'Karan Malhotra' },
]

// ---------------------------------------------------------------------------
// Mock API helper
// ---------------------------------------------------------------------------

/**
 * Save salary structure.
 * Replace with: axios.post('/api/payrolls/salary-structure', payload)
 */
const postSalaryStructure = async payload => {
  await new Promise(r => setTimeout(r, 350))
  console.log('Salary structure payload:', payload)
  return { success: true }
}

// ---------------------------------------------------------------------------
// Styled header — same as all other drawers
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
  baseSalary:  yup.number().typeError('Must be a number').required('Base salary is required').min(1),
  allowances:  yup.number().typeError('Must be a number').required('Allowances are required').min(0),
  deductions:  yup.number().typeError('Must be a number').required('Deductions are required').min(0),
})

const defaultValues = {
  baseSalary: '',
  allowances: '',
  deductions: '',
}

// ---------------------------------------------------------------------------
// SalaryStructureDrawer
// ---------------------------------------------------------------------------
const SalaryStructureDrawer = ({ open, toggle, onSuccess }) => {
  const [employee,   setEmployee]   = useState('')
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
      await postSalaryStructure({ ...data, employeeId: employee })
      handleClose()
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Failed to save salary structure:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    toggle()
    reset()
    setEmployee('')
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
        <Typography variant='h5'>Add Salary Structure</Typography>
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

          {/* Employee */}
          <CustomTextField
            select fullWidth
            value={employee}
            sx={{ mb: 4 }}
            label='Employee'
            onChange={e => setEmployee(e.target.value)}
            SelectProps={{ value: employee, onChange: e => setEmployee(e.target.value) }}
          >
            <MenuItem value=''>Select Employee</MenuItem>
            {MOCK_EMPLOYEES.map(emp => (
              <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
            ))}
          </CustomTextField>

          {/* Base Salary */}
          <Controller
            name='baseSalary'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth type='number'
                value={value} sx={{ mb: 4 }}
                label='Base Salary (₹)'
                onChange={onChange}
                placeholder='e.g. 50000'
                error={Boolean(errors.baseSalary)}
                {...(errors.baseSalary && { helperText: errors.baseSalary.message })}
              />
            )}
          />

          {/* Allowances */}
          <Controller
            name='allowances'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth type='number'
                value={value} sx={{ mb: 4 }}
                label='Allowances (₹)'
                onChange={onChange}
                placeholder='e.g. 10000'
                error={Boolean(errors.allowances)}
                {...(errors.allowances && { helperText: errors.allowances.message })}
              />
            )}
          />

          {/* Deductions */}
          <Controller
            name='deductions'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth type='number'
                value={value} sx={{ mb: 6 }}
                label='Deductions (₹)'
                onChange={onChange}
                placeholder='e.g. 3000'
                error={Boolean(errors.deductions)}
                {...(errors.deductions && { helperText: errors.deductions.message })}
              />
            )}
          />

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button type='submit' variant='contained' sx={{ mr: 3 }} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
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

export default SalaryStructureDrawer