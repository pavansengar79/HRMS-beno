// src/views/leavemanagement/TabInitializeBalance.jsx
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'

import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'

import { initializeBalance, fetchLeaveTypes } from 'src/store/leaves/leaveSlice'
import { fetchAllEmployees } from 'src/store/employee/employeeSlice'

// ─── Helper ───────────────────────────────────────────────────────────────────
const getEmpLabel = (emp) => {
  const name  = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email || emp._id
  const dept  = emp.department?.name || emp.departmentId?.name || ''
  return { name, dept, email: emp.email || '', avatar: emp.avatar || emp.profileImage || '' }
}

// ─── Main Component ───────────────────────────────────────────────────────────
const TabInitializeBalance = () => {
  const dispatch = useDispatch()

  const [employeeId,  setEmployeeId]  = useState('')
  const [leaveTypeId, setLeaveTypeId] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [errors,      setErrors]      = useState({})
  const [lastSuccess, setLastSuccess] = useState(null)

  const { list: employees = [], loading: empLoading } = useSelector(state => state.employee)
  const { leaveTypes = [], leaveTypesLoading }        = useSelector(state => state.leaves)

  useEffect(() => { dispatch(fetchAllEmployees()) }, [dispatch])

  useEffect(() => {
    if (!leaveTypes.length) dispatch(fetchLeaveTypes())
  }, [dispatch, leaveTypes.length])

  const selectedEmployee = employees.find(e => e._id === employeeId)
  const selectedType     = leaveTypes.find(lt => lt._id === leaveTypeId)

  const validate = () => {
    const errs = {}
    if (!employeeId)  errs.employeeId  = 'Select an employee'
    if (!leaveTypeId) errs.leaveTypeId = 'Select a leave type'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      await dispatch(initializeBalance({ employeeId, leaveTypeId })).unwrap()
      const empName  = getEmpLabel(selectedEmployee).name
      const typeName = selectedType?.name || leaveTypeId
      toast.success(`${typeName} balance initialized for ${empName}`)
      setLastSuccess({ empName, typeName })
      setEmployeeId('')
      setLeaveTypeId('')
      setErrors({})
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to initialize balance')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setEmployeeId('')
    setLeaveTypeId('')
    setErrors({})
    setLastSuccess(null)
  }

  return (
    <Card sx={{ maxWidth: 560 }}>
      <CardHeader
        title='Initialize Leave Balance'
        subheader='Assign a leave type balance to an employee before they can apply for leave.'
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>

          {/* ── Employee ── */}
          <CustomTextField
            select
            fullWidth
            label='Employee *'
            value={employeeId}
            onChange={e => { setEmployeeId(e.target.value); setErrors(prev => ({ ...prev, employeeId: '' })) }}
            error={!!errors.employeeId}
            helperText={errors.employeeId}
            disabled={empLoading}
            SelectProps={{
              displayEmpty: true,
              renderValue: val => {
                if (!val) return <Typography color='text.disabled'>Select employee...</Typography>
                const emp = employees.find(e => e._id === val)
                return emp ? getEmpLabel(emp).name : val
              }
            }}
          >
            {empLoading ? (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={14} />
                  <Typography variant='body2'>Loading employees...</Typography>
                </Box>
              </MenuItem>
            ) : employees.length === 0 ? (
              <MenuItem disabled>No employees found</MenuItem>
            ) : (
              employees.map(emp => {
                const { name, dept, email, avatar } = getEmpLabel(emp)
                return (
                  <MenuItem key={emp._id} value={emp._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 0.5 }}>
                      <Avatar src={avatar} sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                        {name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant='body2' fontWeight={600}>{name}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {email}{dept ? ` · ${dept}` : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                )
              })
            )}
          </CustomTextField>

          {/* ── Leave Type ── */}
          <CustomTextField
            select
            fullWidth
            label='Leave Type *'
            value={leaveTypeId}
            onChange={e => { setLeaveTypeId(e.target.value); setErrors(prev => ({ ...prev, leaveTypeId: '' })) }}
            error={!!errors.leaveTypeId}
            helperText={errors.leaveTypeId}
            disabled={leaveTypesLoading}
            SelectProps={{
              displayEmpty: true,
              renderValue: val => {
                if (!val) return <Typography color='text.disabled'>Select leave type...</Typography>
                const lt = leaveTypes.find(t => t._id === val)
                return lt ? `${lt.name} (${lt.code})` : val
              }
            }}
          >
            {leaveTypesLoading ? (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={14} />
                  <Typography variant='body2'>Loading leave types...</Typography>
                </Box>
              </MenuItem>
            ) : leaveTypes.length === 0 ? (
              <MenuItem disabled>No leave types found. Add leave types first.</MenuItem>
            ) : (
              leaveTypes.map(lt => (
                <MenuItem key={lt._id} value={lt._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 0.5 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: 1, flexShrink: 0,
                      backgroundColor: lt.colorCode || '#6B7280',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Typography variant='caption' fontWeight={700} color='white' fontSize='0.65rem'>
                        {lt.code}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body2' fontWeight={600}>{lt.name}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {lt.defaultDaysPerYear} days/yr · {lt.accrualRatePerMonth}/mo
                      </Typography>
                    </Box>
                    <Chip
                      label={lt.isPaid ? 'Paid' : 'Unpaid'}
                      size='small'
                      color={lt.isPaid ? 'success' : 'error'}
                      variant='tonal'
                    />
                  </Box>
                </MenuItem>
              ))
            )}
          </CustomTextField>

          {/* ── Success banner ── */}
          {lastSuccess && (
            <Alert severity='success' icon={<Icon icon='tabler:circle-check' />} onClose={handleReset}>
              <strong>{lastSuccess.typeName}</strong> balance initialized for <strong>{lastSuccess.empName}</strong>.
            </Alert>
          )}

          {/* ── Actions ── */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Button
              variant='tonal'
              color='secondary'
              onClick={handleReset}
              disabled={saving}
              startIcon={<Icon icon='tabler:refresh' />}
            >
              Reset
            </Button>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={saving || empLoading || leaveTypesLoading}
              startIcon={saving
                ? <CircularProgress size={16} color='inherit' />
                : <Icon icon='tabler:database-plus' />
              }
            >
              {saving ? 'Initializing...' : 'Initialize Balance'}
            </Button>
          </Box>

        </Box>
        
      </CardContent>
      
    </Card>
  )
}

export default TabInitializeBalance



 