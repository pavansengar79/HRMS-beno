// src/views/apps/user/view/UserViewLeft.jsx

// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import { getInitials } from 'src/@core/utils/get-initials'

// ** Redux
import { useDispatch, useSelector } from 'react-redux'
import { updateEmployee } from 'src/store/employee/employeeSlice'
import { selectPermissions } from 'src/store/auth/authSlice'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  ACTIVE:     'success',
  INACTIVE:   'secondary',
  TERMINATED: 'error',
  ON_LEAVE:   'warning',
}

const EMPLOYMENT_TYPE_LABEL = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT:  'Contract',
  INTERN:    'Intern',
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit schema — only fields PUT /api/v1/employees/:id accepts
// ─────────────────────────────────────────────────────────────────────────────
const editSchema = yup.object().shape({
  phone:       yup.string().matches(/^[0-9]{10}$/, 'Enter valid 10-digit number').required('Phone is required'),
  salaryBasic: yup.number().typeError('Must be a number').min(0).optional(),
  salaryHra:   yup.number().typeError('Must be a number').min(0).optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// UserViewLeft
// ─────────────────────────────────────────────────────────────────────────────
const UserViewLeft = ({ employee }) => {
  const dispatch    = useDispatch()
  const permissions = useSelector(selectPermissions)
  const canEdit     = permissions.includes('employee.update')

  const [openEdit, setOpenEdit]       = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [suspending, setSuspending]   = useState(false)

  const {
    control, handleSubmit, reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(editSchema),
    defaultValues: {
      phone:       '',
      salaryBasic: '',
      salaryHra:   '',
    }
  })

  if (!employee) return null

  // ── Helpers — API uses departmentId object not department ──────────────────
  // { _id: "...", name: "ITI" }
  const deptName  = employee.departmentId?.name || employee.department?.name || '—'
  const deptId    = employee.departmentId?._id  || employee.department?._id  || '—'

  const joiningFormatted = employee.joiningDate
    ? new Date(employee.joiningDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  // ── Edit submit ────────────────────────────────────────────────────────────
  const onEditSubmit = async data => {
    const payload = {
      phone:  data.phone,
      salary: {
        ...(data.salaryBasic && { basic: Number(data.salaryBasic) }),
        ...(data.salaryHra   && { hra:   Number(data.salaryHra)   }),
      }
    }
    const result = await dispatch(updateEmployee({ id: employee._id, payload }))
    if (updateEmployee.fulfilled.match(result)) {
      setOpenEdit(false)
    }
  }

  // ── Open edit — pre-fill current values ────────────────────────────────────
  const handleOpenEdit = () => {
    reset({
      phone:       employee.phone              || '',
      salaryBasic: employee.salary?.basic      || '',
      salaryHra:   employee.salary?.hra        || '',
    })
    setOpenEdit(true)
  }

  // ── Suspend ────────────────────────────────────────────────────────────────
  const handleSuspend = async () => {
    try {
      setSuspending(true)
      await dispatch(updateEmployee({ id: employee._id, payload: { status: 'INACTIVE' } }))
      setSuspendOpen(false)
    } finally {
      setSuspending(false)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>

          {/* ── Avatar + Name + Designation ─────────────────────── */}
          <CardContent sx={{ pt: 13.5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <CustomAvatar
              skin='light'
              variant='rounded'
              color='primary'
              sx={{ width: 100, height: 100, mb: 4, fontSize: '3rem' }}
            >
              {getInitials(employee.name || 'NA')}
            </CustomAvatar>

            <Typography variant='h4' sx={{ mb: 3 }}>
              {employee.name}
            </Typography>

            <CustomChip
              rounded skin='light' size='small'
              label={EMPLOYMENT_TYPE_LABEL[employee.employmentType] || employee.employmentType || 'Employee'}
              color='primary'
              sx={{ textTransform: 'capitalize' }}
            />
          </CardContent>

          {/* ── Stats row ──────────────────────────────────────── */}
          <CardContent sx={{ pt: theme => `${theme.spacing(2)} !important` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              <Box sx={{ mr: 8, display: 'flex', alignItems: 'center' }}>
                <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                  <Icon fontSize='1.75rem' icon='tabler:building' />
                </CustomAvatar>
                <div>
                  <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    {deptName}
                  </Typography>
                  <Typography variant='body2'>Department</Typography>
                </div>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                  <Icon fontSize='1.75rem' icon='tabler:calendar' />
                </CustomAvatar>
                <div>
                  <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    {joiningFormatted}
                  </Typography>
                  <Typography variant='body2'>Joined</Typography>
                </div>
              </Box>

            </Box>
          </CardContent>

          <Divider sx={{ my: '0 !important', mx: 6 }} />

          {/* ── Details ────────────────────────────────────────── */}
          <CardContent sx={{ pb: 4 }}>
            <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
              Details
            </Typography>

            <Box sx={{ pt: 4 }}>
              {[
                { label: 'Employee ID', value: employee.employeeId },
                { label: 'Full Name',   value: employee.name },
                { label: 'Email',       value: employee.email },
                { label: 'Phone',       value: employee.phone },
                { label: 'Department',  value: deptName },
                { label: 'Type',        value: EMPLOYMENT_TYPE_LABEL[employee.employmentType] || employee.employmentType },
                { label: 'Joined',      value: joiningFormatted },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', mb: 3 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 110 }}>
                    {label}:
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {value || '—'}
                  </Typography>
                </Box>
              ))}

              {/* Status chip */}
              <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
                <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 110 }}>
                  Status:
                </Typography>
                <CustomChip
                  rounded skin='light' size='small'
                  label={employee.status || 'ACTIVE'}
                  color={STATUS_COLOR[employee.status] || 'success'}
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </Box>
          </CardContent>

          {/* ── Salary ─────────────────────────────────────────── */}
          {employee.salary && Object.values(employee.salary).some(Boolean) && (
            <>
              <Divider sx={{ my: '0 !important', mx: 6 }} />
              <CardContent sx={{ pb: 4 }}>
                <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mb: 3 }}>
                  Salary
                </Typography>
                {[
                  { label: 'Basic',            value: employee.salary.basic },
                  { label: 'HRA',              value: employee.salary.hra },
                  { label: 'Travel Allowance', value: employee.salary.travelAllowance },
                  { label: 'PF',               value: employee.salary.pf },
                  { label: 'TDS',              value: employee.salary.tds },
                ].filter(s => s.value).map(({ label, value }) => (
                  <Box key={label} sx={{ display: 'flex', mb: 2 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 130 }}>
                      {label}:
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      ₹{Number(value).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </>
          )}

          {/* ── Actions ────────────────────────────────────────── */}
          {canEdit && (
            <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant='contained' sx={{ mr: 2 }} onClick={handleOpenEdit}>
                Edit
              </Button>
              {employee.status !== 'INACTIVE' && employee.status !== 'TERMINATED' && (
                <Button color='error' variant='tonal' onClick={() => setSuspendOpen(true)}>
                  Suspend
                </Button>
              )}
            </CardActions>
          )}

        </Card>
      </Grid>

      {/* ── Edit Dialog ─────────────────────────────────────────── */}
      <Dialog
        open={openEdit}
        onClose={() => !isSubmitting && setOpenEdit(false)}
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 600 } }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontSize: '1.5rem !important',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
          }}
        >
          Edit Employee
        </DialogTitle>

        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(8)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          }}
        >
          <DialogContentText variant='body2' sx={{ textAlign: 'center', mb: 7 }}>
            Update phone number and salary details.
          </DialogContentText>

          <form id='edit-employee-form' onSubmit={handleSubmit(onEditSubmit)}>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={6}>
                <Controller name='phone' control={control} render={({ field }) => (
                  <CustomTextField
                    {...field} fullWidth label='Phone' placeholder='9876543210'
                    error={Boolean(errors.phone)} helperText={errors.phone?.message}
                    disabled={isSubmitting}
                  />
                )} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller name='salaryBasic' control={control} render={({ field }) => (
                  <CustomTextField
                    {...field} fullWidth type='number' label='Basic Salary'
                    error={Boolean(errors.salaryBasic)} helperText={errors.salaryBasic?.message}
                    disabled={isSubmitting}
                  />
                )} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller name='salaryHra' control={control} render={({ field }) => (
                  <CustomTextField
                    {...field} fullWidth type='number' label='HRA'
                    error={Boolean(errors.salaryHra)} helperText={errors.salaryHra?.message}
                    disabled={isSubmitting}
                  />
                )} />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
          }}
        >
          <Button
            form='edit-employee-form'
            type='submit'
            variant='contained'
            sx={{ mr: 2 }}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
          <Button
            variant='tonal' color='secondary'
            onClick={() => setOpenEdit(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Suspend Confirm Dialog ───────────────────────────────── */}
      <Dialog open={suspendOpen} onClose={() => !suspending && setSuspendOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle
          component='div'
          sx={{
            textAlign: 'center',
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          }}
        >
          <Typography variant='h4'>Suspend Employee</Typography>
          <Typography color='text.secondary' sx={{ mt: 2 }}>
            Are you sure you want to suspend <strong>{employee.name}</strong>?
            Their status will be set to Inactive.
          </Typography>
        </DialogTitle>
        <DialogActions
          sx={{
            justifyContent: 'center',
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
            gap: 3,
          }}
        >
          <Button
            variant='contained' color='error'
            onClick={handleSuspend}
            disabled={suspending}
            startIcon={suspending ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {suspending ? 'Suspending…' : 'Suspend'}
          </Button>
          <Button
            variant='tonal' color='secondary'
            onClick={() => setSuspendOpen(false)}
            disabled={suspending}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

    </Grid>
  )
}

export default UserViewLeft