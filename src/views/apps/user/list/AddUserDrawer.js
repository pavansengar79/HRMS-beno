// src/views/apps/user/list/AddUserDrawer.jsx
//
// Add mode  → all fields empty, POST /api/v1/employees
// Edit mode → all fields pre-filled from editingEmployee
//             editable: phone, salary (PUT /api/v1/employees/:id accepts these)
//             read-only: name, email, department, joiningDate, employmentType
//             (shown for context so user knows which employee they're editing)

// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'

// ** Redux
import { useDispatch } from 'react-redux'
import { createEmployee, updateEmployee } from 'src/store/employee/employeeSlice'

// ** Interceptor
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─────────────────────────────────────────────────────────────────────────────
// Styled
// ─────────────────────────────────────────────────────────────────────────────
const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

// ─────────────────────────────────────────────────────────────────────────────
// Validation schemas
// ─────────────────────────────────────────────────────────────────────────────
const addSchema = yup.object().shape({
  name:           yup.string().trim().min(2, 'Min 2 characters').required('Name is required'),
  email:          yup.string().email('Invalid email').required('Email is required'),
  phone:          yup.string().matches(/^[0-9]{10}$/, 'Enter valid 10-digit number').required('Phone is required'),
  departmentId:   yup.string().required('Department is required'),
  joiningDate:    yup.string().required('Joining date is required'),
  employmentType: yup.string().required('Employment type is required'),
  salaryBasic:    yup.number().typeError('Must be a number').min(0).optional(),
  salaryHra:      yup.number().typeError('Must be a number').min(0).optional(),
  salaryTravel:   yup.number().typeError('Must be a number').min(0).optional(),
  salaryPf:       yup.number().typeError('Must be a number').min(0).optional(),
  salaryTds:      yup.number().typeError('Must be a number').min(0).optional(),
})

// Edit schema validates only the fields the PUT API accepts
// All other fields are shown but readOnly — no validation needed for them
const editSchema = yup.object().shape({
  phone:        yup.string().matches(/^[0-9]{10}$/, 'Enter valid 10-digit number').required('Phone is required'),
  salaryBasic:  yup.number().typeError('Must be a number').min(0).optional(),
  salaryHra:    yup.number().typeError('Must be a number').min(0).optional(),
  salaryTravel: yup.number().typeError('Must be a number').min(0).optional(),
  salaryPf:     yup.number().typeError('Must be a number').min(0).optional(),
  salaryTds:    yup.number().typeError('Must be a number').min(0).optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// AddEmployeeDrawer
//
// Props:
//   open             — boolean
//   toggle           — () => void
//   editingEmployee  — null = Add mode | employee object = Edit mode
//   onSuccess        — () => void
// ─────────────────────────────────────────────────────────────────────────────
const AddEmployeeDrawer = ({ open, toggle, editingEmployee, onSuccess }) => {
  const dispatch   = useDispatch()
  const isEditMode = Boolean(editingEmployee)

  const [departments, setDepartments] = useState([])
  const [dropLoading, setDropLoading] = useState(false)

  const {
    control, handleSubmit, reset,
    formState: { errors, isSubmitting }
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(isEditMode ? editSchema : addSchema),
    defaultValues: {
      name: '', email: '', phone: '',
      departmentId: '', joiningDate: '', employmentType: '',
      salaryBasic: '', salaryHra: '', salaryTravel: '', salaryPf: '', salaryTds: '',
    }
  })

  // ── Pre-fill / reset form whenever drawer opens ───────────────────────────
  useEffect(() => {
    if (!open) return

    if (isEditMode && editingEmployee) {
      // Pre-fill ALL fields from the employee object
      reset({
        // Read-only fields (shown for context)
        name:           editingEmployee.name                        || '',
        email:          editingEmployee.email                       || '',
        departmentId:   editingEmployee.departmentId?.name          || // show name for display
                        editingEmployee.departmentId                || '',
        joiningDate:    editingEmployee.joiningDate
                          ? editingEmployee.joiningDate.substring(0, 10)  // YYYY-MM-DD for date input
                          : '',
        employmentType: editingEmployee.employmentType              || '',

        // Editable fields
        phone:        editingEmployee.phone              || '',
        salaryBasic:  editingEmployee.salary?.basic      || '',
        salaryHra:    editingEmployee.salary?.hra        || '',
        salaryTravel: editingEmployee.salary?.travelAllowance || '',
        salaryPf:     editingEmployee.salary?.pf         || '',
        salaryTds:    editingEmployee.salary?.tds        || '',
      })
    } else {
      // Add mode — blank form
      reset({
        name: '', email: '', phone: '',
        departmentId: '', joiningDate: '', employmentType: '',
        salaryBasic: '', salaryHra: '', salaryTravel: '', salaryPf: '', salaryTds: '',
      })
    }
  }, [open, isEditMode, editingEmployee, reset])

  // ── Fetch departments for Add mode ────────────────────────────────────────
  useEffect(() => {
    if (!open || isEditMode) return
    const fetchDropdowns = async () => {
      try {
        setDropLoading(true)
        const res = await axiosRequest.get('/api/v1/departments')
        if (res?.success) setDepartments(res.data || [])
      } catch (err) {
        console.error('Failed to load departments:', err)
      } finally {
        setDropLoading(false)
      }
    }
    fetchDropdowns()
  }, [open, isEditMode])

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async data => {
    try {
      if (isEditMode) {
        // PUT only sends editable fields — phone + salary
        const payload = {
          phone: data.phone,
          salary: {
            ...(data.salaryBasic  !== '' && data.salaryBasic  != null && { basic:           Number(data.salaryBasic)  }),
            ...(data.salaryHra    !== '' && data.salaryHra    != null && { hra:             Number(data.salaryHra)    }),
            ...(data.salaryTravel !== '' && data.salaryTravel != null && { travelAllowance: Number(data.salaryTravel) }),
            ...(data.salaryPf     !== '' && data.salaryPf     != null && { pf:              Number(data.salaryPf)     }),
            ...(data.salaryTds    !== '' && data.salaryTds    != null && { tds:             Number(data.salaryTds)    }),
          }
        }
        const result = await dispatch(updateEmployee({ id: editingEmployee._id, payload }))
        if (updateEmployee.fulfilled.match(result)) {
          onSuccess?.()
        }
      } else {
        // POST sends all fields
        const payload = {
          name:           data.name.trim(),
          email:          data.email.trim().toLowerCase(),
          phone:          data.phone.trim(),
          departmentId:   data.departmentId,
          joiningDate:    data.joiningDate,
          employmentType: data.employmentType,
          salary: {
            ...(data.salaryBasic  !== '' && data.salaryBasic  != null && { basic:           Number(data.salaryBasic)  }),
            ...(data.salaryHra    !== '' && data.salaryHra    != null && { hra:             Number(data.salaryHra)    }),
            ...(data.salaryTravel !== '' && data.salaryTravel != null && { travelAllowance: Number(data.salaryTravel) }),
            ...(data.salaryPf     !== '' && data.salaryPf     != null && { pf:              Number(data.salaryPf)     }),
            ...(data.salaryTds    !== '' && data.salaryTds    != null && { tds:             Number(data.salaryTds)    }),
          }
        }
        const result = await dispatch(createEmployee(payload))
        if (createEmployee.fulfilled.match(result)) {
          onSuccess?.()
        }
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Something went wrong')
    }
  }

  const handleClose = () => {
    toggle()
  }

  // ── Read-only badge for fields that can't be edited via PUT ───────────────
  const ReadOnlyBadge = () => (
    <InputAdornment position='end'>
      <Typography variant='caption' sx={{
        px: 1.5, py: 0.5, borderRadius: 1,
        backgroundColor: 'action.selected',
        color: 'text.disabled',
        fontSize: '0.65rem',
        letterSpacing: '0.04em'
      }}>
        READ ONLY
      </Typography>
    </InputAdornment>
  )

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 480 } } }}
    >
      {/* Header */}
      <Header>
        <Box>
          <Typography variant='h5'>
            {isEditMode ? 'Edit Employee' : 'Add Employee'}
          </Typography>
          {isEditMode && (
            <Typography variant='caption' sx={{ color: 'text.disabled' }}>
              {editingEmployee?.employeeId} · {editingEmployee?.name}
            </Typography>
          )}
        </Box>
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{
            p: '0.438rem', borderRadius: 1, color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': { backgroundColor: theme => `rgba(${theme.palette.customColors?.main}, 0.16)` }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>

      {/* Edit mode info banner */}
      {isEditMode && (
        <Box sx={{
          mx: 6, mb: 2, px: 3, py: 2,
          borderRadius: 1, backgroundColor: 'primary.light',
          border: theme => `1px solid ${theme.palette.primary.main}`,
          display: 'flex', alignItems: 'center', gap: 2
        }}>
          <Icon icon='tabler:info-circle' fontSize='1rem' style={{ color: 'interit', flexShrink: 0 }} />
          <Typography variant='caption' style={{ color: 'inherit' }}>
            Only Phone and Salary can be updated. Other fields are shown for reference.
          </Typography>
        </Box>
      )}

      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>

            {/* ── Section: Basic Info ──────────────────────────────── */}
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mb: 1 }}>
                Basic Info
              </Typography>
            </Grid>

            {/* Name */}
            <Grid item xs={12}>
              <Controller name='name' control={control} render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Full Name'
                  placeholder='Rahul Sharma'
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                  disabled={isSubmitting}
                  InputProps={{
                    readOnly: isEditMode,
                    endAdornment: isEditMode ? <ReadOnlyBadge /> : null
                  }}
                  sx={{ ...(isEditMode && { '& .MuiInputBase-input': { color: 'text.disabled' } }) }}
                />
              )} />
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <Controller name='email' control={control} render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='email'
                  label='Email'
                  placeholder='rahul@company.com'
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  disabled={isSubmitting}
                  InputProps={{
                    readOnly: isEditMode,
                    endAdornment: isEditMode ? <ReadOnlyBadge /> : null
                  }}
                  sx={{ ...(isEditMode && { '& .MuiInputBase-input': { color: 'text.disabled' } }) }}
                />
              )} />
            </Grid>

            {/* Phone — editable in BOTH modes */}
            <Grid item xs={12}>
              <Controller name='phone' control={control} render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Phone'
                  placeholder='9876543210'
                  error={Boolean(errors.phone)}
                  helperText={errors.phone?.message}
                  disabled={isSubmitting}
                />
              )} />
            </Grid>

            {/* ── Section: Work Details ────────────────────────────── */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mt: 2, mb: 1 }}>
                Work Details
              </Typography>
            </Grid>

            {/* Department */}
            <Grid item xs={12}>
              {isEditMode ? (
                // In edit mode show department name as read-only text field
                <Controller name='departmentId' control={control} render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Department'
                    disabled={isSubmitting}
                    InputProps={{
                      readOnly: true,
                      endAdornment: <ReadOnlyBadge />
                    }}
                    sx={{ '& .MuiInputBase-input': { color: 'text.disabled' } }}
                  />
                )} />
              ) : (
                // In add mode show dropdown
                <Controller name='departmentId' control={control} render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Department'
                    error={Boolean(errors.departmentId)}
                    helperText={errors.departmentId?.message}
                    disabled={isSubmitting || dropLoading}
                  >
                    <MenuItem value=''>Select department</MenuItem>
                    {departments.map(d => (
                      <MenuItem key={d.id} value={d._id}>{d.name}</MenuItem>
                    ))}
                  </CustomTextField>
                )} />
              )}
            </Grid>

            {/* Joining Date */}
            <Grid item xs={12} sm={6}>
              <Controller name='joiningDate' control={control} render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='date'
                  label='Joining Date'
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(errors.joiningDate)}
                  helperText={errors.joiningDate?.message}
                  disabled={isSubmitting}
                  InputProps={{
                    readOnly: isEditMode,
                    endAdornment: isEditMode ? <ReadOnlyBadge /> : null
                  }}
                  sx={{ ...(isEditMode && { '& .MuiInputBase-input': { color: 'text.disabled' } }) }}
                />
              )} />
            </Grid>

            {/* Employment Type */}
            <Grid item xs={12} sm={6}>
              {isEditMode ? (
                <Controller name='employmentType' control={control} render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Employment Type'
                    disabled={isSubmitting}
                    InputProps={{
                      readOnly: true,
                      endAdornment: <ReadOnlyBadge />
                    }}
                    sx={{ '& .MuiInputBase-input': { color: 'text.disabled', textTransform: 'capitalize' } }}
                  />
                )} />
              ) : (
                <Controller name='employmentType' control={control} render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Employment Type'
                    error={Boolean(errors.employmentType)}
                    helperText={errors.employmentType?.message}
                    disabled={isSubmitting}
                  >
                    <MenuItem value=''>Select type</MenuItem>
                    <MenuItem value='FULL_TIME'>Full Time</MenuItem>
                    <MenuItem value='PART_TIME'>Part Time</MenuItem>
                    <MenuItem value='CONTRACT'>Contract</MenuItem>
                    <MenuItem value='INTERN'>Intern</MenuItem>
                  </CustomTextField>
                )} />
              )}
            </Grid>

            {/* ── Section: Salary ──────────────────────────────────── */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mt: 2, mb: 1 }}>
                Salary {!isEditMode && '(optional)'}
              </Typography>
            </Grid>

            {[
              { name: 'salaryBasic',  label: 'Basic' },
              { name: 'salaryHra',    label: 'HRA' },
              { name: 'salaryTravel', label: 'Travel Allowance' },
              { name: 'salaryPf',     label: 'PF' },
              { name: 'salaryTds',    label: 'TDS' },
            ].map(({ name, label }) => (
              <Grid item xs={12} sm={6} key={name}>
                <Controller name={name} control={control} render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label={label}
                    placeholder='0'
                    error={Boolean(errors[name])}
                    helperText={errors[name]?.message}
                    disabled={isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>₹</Typography>
                        </InputAdornment>
                      )
                    }}
                  />
                )} />
              </Grid>
            ))}

            {/* ── Actions ─────────────────────────────────────────── */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Button
                  fullWidth
                  type='submit'
                  variant='contained'
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={16} color='inherit' /> : null}
                >
                  {isSubmitting
                    ? isEditMode ? 'Saving…' : 'Adding…'
                    : isEditMode ? 'Save Changes' : 'Add Employee'
                  }
                </Button>
                <Button
                  fullWidth
                  variant='tonal'
                  color='secondary'
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>

          </Grid>
        </form>
      </Box>
    </Drawer>
  )
}

export default AddEmployeeDrawer