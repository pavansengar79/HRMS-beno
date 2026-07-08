// src/pages/delegation/create.js
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Autocomplete
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'

import { createDelegation } from 'src/store/delegation/delegationSlice'
import { fetchAllEmployees } from 'src/store/employee/employeeSlice'
import { selectPermissions } from 'src/store/auth/authSlice'

// ─── Date Helpers ───────────────────────────────────────────────────────────────
const fmtDate = d => d.toISOString().split('T')[0]
const today = new Date()
const maxEndDate = new Date(today)
maxEndDate.setDate(maxEndDate.getDate() + 90)

// ─── All Possible Delegatable Permissions ────────────────────────────────────────
const ALL_PERMISSIONS = [
  // Attendance
  { _id: 'attendance.read', name: 'View Attendance', slug: 'attendance.read', module: 'Attendance' },
  { _id: 'attendance.update', name: 'Edit Attendance', slug: 'attendance.update', module: 'Attendance' },
  { _id: 'attendance.approve', name: 'Approve Attendance', slug: 'attendance.approve', module: 'Attendance' },
  // Leave
  { _id: 'leave.read', name: 'View Leaves', slug: 'leave.read', module: 'Leave' },
  { _id: 'leave.update', name: 'Edit Leave', slug: 'leave.update', module: 'Leave' },
  { _id: 'leave.approve', name: 'Approve Leaves', slug: 'leave.approve', module: 'Leave' },
  // Employee
  { _id: 'employee.read', name: 'View Employees', slug: 'employee.read', module: 'Employee' },
  { _id: 'employee.update', name: 'Edit Employees', slug: 'employee.update', module: 'Employee' },
  // Shift
  { _id: 'shift.read', name: 'View Shifts', slug: 'shift.read', module: 'Shift' },
  { _id: 'shift.update', name: 'Edit Shifts', slug: 'shift.update', module: 'Shift' },
  // Payroll
  { _id: 'payroll.read', name: 'View Payroll', slug: 'payroll.read', module: 'Payroll' },
  { _id: 'payroll.run', name: 'Run Payroll', slug: 'payroll.run', module: 'Payroll' },
  // Holiday
  { _id: 'holiday.read', name: 'View Holidays', slug: 'holiday.read', module: 'Holiday' },
  // Roster
  { _id: 'roster.read', name: 'View Roster', slug: 'roster.read', module: 'Roster' },
  { _id: 'roster.update', name: 'Edit Roster', slug: 'roster.update', module: 'Roster' },
]

// ─── Main Component ────────────────────────────────────────────────────────────
const CreateDelegationDialog = ({ open, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const { creating, error } = useSelector(state => state.delegation)
  const { list: employees } = useSelector(state => state.employee)
  const { user } = useSelector(state => state.auth)
  const userPermissions = useSelector(selectPermissions)

  const [delegatee, setDelegatee] = useState(null)
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [startDate, setStartDate] = useState(fmtDate(today))
  const [endDate, setEndDate] = useState(fmtDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)))
  const [reason, setReason] = useState('')
  const [formErrors, setFormErrors] = useState({})

  // Fetch employees
  useEffect(() => {
    dispatch(fetchAllEmployees({ page: 1, limit: 100 }))
  }, [dispatch])

  // Filter permissions to only those the current user has
  // Users can only delegate permissions they themselves possess
  useEffect(() => {
    if (userPermissions && userPermissions.length > 0) {
      const availablePermissions = ALL_PERMISSIONS.filter(p => 
        userPermissions.includes(p.slug)
      )
      setPermissions(availablePermissions)
    } else {
      // Fallback: show all if userPermissions not loaded (shouldn't happen)
      setPermissions(ALL_PERMISSIONS)
    }
    setLoadingPermissions(false)
  }, [userPermissions])

  // Validate form
  const validate = () => {
    const errors = {}
    if (!delegatee) errors.delegatee = 'Delegatee is required'
    if (selectedPermissions.length === 0) errors.permissions = 'At least one permission is required'
    if (!startDate) errors.startDate = 'Start date is required'
    if (!endDate) errors.endDate = 'End date is required'
    if (new Date(startDate) < today.setHours(0, 0, 0, 0)) {
      errors.startDate = 'Start date cannot be in the past'
    }
    if (new Date(endDate) <= new Date(startDate)) {
      errors.endDate = 'End date must be after start date'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return

    try {
      // Note: delegatee is an Employee object, need to get userId from it
      // Employee has userId field which references User model
      const delegateeUserId = delegatee.userId?._id || delegatee.userId || delegatee.user_id?._id || delegatee.user_id
      
      await dispatch(createDelegation({
        delegatee_id: delegateeUserId,
        permissions: selectedPermissions.map(p => p._id || p.id),
        startDate,
        endDate,
        reason,
        unit_id: user.unitId
      })).unwrap()

      toast.success('Delegation created successfully')
      
      // Reset form
      setDelegatee(null)
      setSelectedPermissions([])
      setStartDate(fmtDate(today))
      setEndDate(fmtDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)))
      setReason('')
      setFormErrors({})
      
      onSuccess()
    } catch (err) {
      toast.error(err?.message || 'Failed to create delegation')
    }
  }

  // Filtered employees (exclude self)
  const availableEmployees = (employees || []).filter(e => e._id !== user.userId && e.status === 'ACTIVE')

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon icon="tabler:users-plus" fontSize={24} />
          <Typography variant="h6">Create Delegation</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={4} sx={{ mt: 1 }}>
          {/* Delegatee (Employee Search) */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Delegatee <Typography component="span" color="error">*</Typography>
            </Typography>
            <Autocomplete
              options={availableEmployees}
              value={delegatee}
              onChange={(_, newValue) => {
                setDelegatee(newValue)
                if (formErrors.delegatee) setFormErrors({ ...formErrors, delegatee: null })
              }}
              getOptionLabel={(option) => `${option.name || ''} (${option.employeeId || option.email || ''})`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search employee by name or ID"
                  error={!!formErrors.delegatee}
                  helperText={formErrors.delegatee}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}>
                      {(option.name || '?').charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.employeeId} • {option.email}
                      </Typography>
                    </Box>
                  </Box>
                </li>
              )}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Select the person who will receive these permissions
            </Typography>
          </Grid>

          {/* Permissions */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Permissions to Delegate <Typography component="span" color="error">*</Typography>
            </Typography>
            {loadingPermissions ? (
              <LinearProgress sx={{ my: 2 }} />
            ) : (
              <Autocomplete
                multiple
                options={permissions}
                value={selectedPermissions}
                onChange={(_, newValue) => {
                  setSelectedPermissions(newValue)
                  if (formErrors.permissions) setFormErrors({ ...formErrors, permissions: null })
                }}
                getOptionLabel={(option) => option.name || option.slug}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                groupBy={(option) => option.module || option.module?.toUpperCase() || 'OTHER'}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select permissions"
                    error={!!formErrors.permissions}
                    helperText={formErrors.permissions}
                  />
                )}
                renderOption={(props, option, { selected }) => (
                  <li {...props} key={option._id}>
                    <Checkbox checked={selected} sx={{ mr: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.slug}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option._id}
                      label={option.name}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))
                }
              />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Only permissions you already have can be delegated
            </Typography>
          </Grid>

          {/* Date Range */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                if (formErrors.startDate) setFormErrors({ ...formErrors, startDate: null })
              }}
              error={!!formErrors.startDate}
              helperText={formErrors.startDate}
              inputProps={{ min: fmtDate(today), max: fmtDate(maxEndDate) }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                if (formErrors.endDate) setFormErrors({ ...formErrors, endDate: null })
              }}
              error={!!formErrors.endDate}
              helperText={formErrors.endDate}
              inputProps={{ min: startDate || fmtDate(today), max: fmtDate(maxEndDate) }}
            />
          </Grid>

          {/* Reason */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason (Optional)"
              placeholder="e.g., Vacation, Medical Leave, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              rows={2}
            />
          </Grid>

          {/* Info Alert */}
          <Grid item xs={12}>
            <Alert severity="info" icon={<Icon icon="tabler:info-circle" />}>
              The delegatee will be able to approve/reject requests on your behalf. They will receive an email notification once delegation is created.
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 6, py: 3 }}>
        <Button onClick={onClose} disabled={creating}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={creating}
          startIcon={creating ? undefined : <Icon icon="tabler:check" />}
        >
          {creating ? 'Creating...' : 'Create Delegation'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateDelegationDialog
