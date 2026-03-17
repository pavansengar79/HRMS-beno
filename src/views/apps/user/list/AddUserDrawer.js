// src/views/apps/user/list/AddEmployeeDrawer.jsx
//
// Add Employee drawer.
// Fields match POST /api/v1/employees exactly.
// Departments and designations fetched from API for dropdowns.

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

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Redux
import { useDispatch } from 'react-redux'
import { createEmployee } from 'src/store/employee/employeeSlice'

// ** Interceptor — for dept/designation dropdowns only
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─────────────────────────────────────────────────────────────────────────────
// Styled Header
// ─────────────────────────────────────────────────────────────────────────────
const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────
const schema = yup.object().shape({
  name:           yup.string().trim().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email:          yup.string().email('Invalid email').required('Email is required'),
  phone:          yup.string().matches(/^[0-9]{10}$/, 'Enter valid 10-digit number').required('Phone is required'),
  departmentId:   yup.string().required('Department is required'),
  // designationId:  yup.string().required('Designation is required'),
  joiningDate:    yup.string().required('Joining date is required'),
  employmentType: yup.string().required('Employment type is required'),

  // Salary fields — optional individually but nested
  salaryBasic:  yup.number().typeError('Must be a number').min(0).optional(),
  salaryHra:    yup.number().typeError('Must be a number').min(0).optional(),
  salaryTravel: yup.number().typeError('Must be a number').min(0).optional(),
  salaryPf:     yup.number().typeError('Must be a number').min(0).optional(),
  salaryTds:    yup.number().typeError('Must be a number').min(0).optional(),
})

const defaultValues = {
  name: '', email: '', phone: '',
  departmentId: '',
  //  designationId: ''
   
  joiningDate: '', employmentType: '',
  salaryBasic: '', salaryHra: '', salaryTravel: '', salaryPf: '', salaryTds: '',
}

// ─────────────────────────────────────────────────────────────────────────────
// AddEmployeeDrawer
// ─────────────────────────────────────────────────────────────────────────────
const AddEmployeeDrawer = ({ open, toggle, onSuccess }) => {
  const dispatch = useDispatch()

  const [departments,   setDepartments]   = useState([])
  const [designations,  setDesignations]  = useState([])
  const [dropLoading,   setDropLoading]   = useState(false)

  const {
    control, handleSubmit, reset,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues, mode: 'onChange', resolver: yupResolver(schema) })

  // Fetch departments + designations for dropdowns
  useEffect(() => {
    if (!open) return
    const fetchDropdowns = async () => {
      try {
        setDropLoading(true)
        const [deptRes, desigRes] = await Promise.all([
          axiosRequest.get('/api/v1/departments'),
          axiosRequest.get('/api/v1/designations'),
        ])
        if (deptRes?.success)  setDepartments(deptRes.data   || [])
        if (desigRes?.success) setDesignations(desigRes.data || [])
      } catch (err) {
        console.error('Failed to load dropdowns:', err)
      } finally {
        setDropLoading(false)
      }
    }
    fetchDropdowns()
  }, [open])

  const onSubmit = async data => {
    const payload = {
      name:           data.name.trim(),
      email:          data.email.trim().toLowerCase(),
      phone:          data.phone.trim(),
      departmentId:   data.departmentId,
      // designationId:  data.designationId,
      joiningDate:    data.joiningDate,
      employmentType: data.employmentType,
      salary: {
        ...(data.salaryBasic  && { basic:            Number(data.salaryBasic) }),
        ...(data.salaryHra    && { hra:              Number(data.salaryHra)   }),
        ...(data.salaryTravel && { travelAllowance:  Number(data.salaryTravel) }),
        ...(data.salaryPf     && { pf:               Number(data.salaryPf)   }),
        ...(data.salaryTds    && { tds:              Number(data.salaryTds)  }),
      }
    }

    const result = await dispatch(createEmployee(payload))
    if (createEmployee.fulfilled.match(result)) {
      handleClose()
      onSuccess?.()
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
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 480 } } }}
    >
      <Header>
        <Typography variant='h5'>Add Employee</Typography>
        <IconButton size='small' onClick={handleClose}
          sx={{ p: '0.438rem', borderRadius: 1, color: 'text.primary', backgroundColor: 'action.selected',
            '&:hover': { backgroundColor: theme => `rgba(${theme.palette.customColors?.main}, 0.16)` } }}>
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>

      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>

            {/* ── Basic Info ───────────────────────────────────────── */}
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mb: 2 }}>
                Basic Info
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller name='name' control={control} render={({ field }) => (
                <CustomTextField {...field} fullWidth label='Full Name' placeholder='Rahul Sharma'
                  error={Boolean(errors.name)} helperText={errors.name?.message} disabled={isSubmitting} />
              )} />
            </Grid>

            <Grid item xs={12}>
              <Controller name='email' control={control} render={({ field }) => (
                <CustomTextField {...field} fullWidth type='email' label='Email' placeholder='rahul@company.com'
                  error={Boolean(errors.email)} helperText={errors.email?.message} disabled={isSubmitting} />
              )} />
            </Grid>

            <Grid item xs={12}>
              <Controller name='phone' control={control} render={({ field }) => (
                <CustomTextField {...field} fullWidth label='Phone' placeholder='9876543210'
                  error={Boolean(errors.phone)} helperText={errors.phone?.message} disabled={isSubmitting} />
              )} />
            </Grid>

            {/* ── Work Details ─────────────────────────────────────── */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mt: 2, mb: 2 }}>
                Work Details
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller name='departmentId' control={control} render={({ field }) => (
                <CustomTextField {...field} select fullWidth label='Department'
                  error={Boolean(errors.departmentId)} helperText={errors.departmentId?.message}
                  disabled={isSubmitting || dropLoading}>
                  <MenuItem value=''>Select department</MenuItem>
                  {departments.map(d => <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)}
                </CustomTextField>
              )} />
            </Grid>

            {/* <Grid item xs={12}>
              <Controller name='designationId' control={control} render={({ field }) => (
                <CustomTextField {...field} select fullWidth label='Designation'
                  error={Boolean(errors.designationId)} helperText={errors.designationId?.message}
                  disabled={isSubmitting || dropLoading}>
                  <MenuItem value=''>Select designation</MenuItem>
                  {designations.map(d => <MenuItem key={d._id} value={d._id}>{d.title}</MenuItem>)}
                </CustomTextField>
              )} />
            </Grid> */}

            <Grid item xs={12} sm={6}>
              <Controller name='joiningDate' control={control} render={({ field }) => (
                <CustomTextField {...field} fullWidth type='date' label='Joining Date'
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(errors.joiningDate)} helperText={errors.joiningDate?.message}
                  disabled={isSubmitting} />
              )} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller name='employmentType' control={control} render={({ field }) => (
                <CustomTextField {...field} select fullWidth label='Employment Type'
                  error={Boolean(errors.employmentType)} helperText={errors.employmentType?.message}
                  disabled={isSubmitting}>
                  <MenuItem value=''>Select type</MenuItem>
                  <MenuItem value='FULL_TIME'>Full Time</MenuItem>
                  <MenuItem value='PART_TIME'>Part Time</MenuItem>
                  <MenuItem value='CONTRACT'>Contract</MenuItem>
                  <MenuItem value='INTERN'>Intern</MenuItem>
                </CustomTextField>
              )} />
            </Grid>

            {/* ── Salary ───────────────────────────────────────────── */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mt: 2, mb: 2 }}>
                Salary (optional)
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
                  <CustomTextField {...field} fullWidth type='number' label={label} placeholder='0'
                    error={Boolean(errors[name])} helperText={errors[name]?.message}
                    disabled={isSubmitting} />
                )} />
              </Grid>
            ))}

            {/* ── Actions ──────────────────────────────────────────── */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Button
                  fullWidth type='submit' variant='contained' disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={16} color='inherit' /> : null}
                >
                  {isSubmitting ? 'Adding…' : 'Add Employee'}
                </Button>
                <Button fullWidth variant='tonal' color='secondary' onClick={handleClose} disabled={isSubmitting}>
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