import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import Drawer from '@mui/material/Drawer'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Chip from '@mui/material/Chip'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { DataGrid } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { format, parseISO } from 'date-fns'

// Redux slices
import { fetchShifts, createShift, updateShift, deleteShift } from 'src/store/shift/shiftSlice'
import { fetchRosters, createRoster, updateRoster, revokeRoster, bulkAssignRoster } from 'src/store/shift/rosterSlice'
import {
  fetchShiftSwaps,
  raiseSwapRequest,
  respondToSwap,
  approveSwap,
  rejectSwap,
  cancelSwapRequest
} from 'src/store/shift/shiftSwapSlice'
import { fetchAllEmployees } from 'src/store/employee/employeeSlice'
import { selectAllHierarchyUnits, fetchHierarchy } from 'src/store/hierarchy/hierarchySlice'
import useUnitContext from 'src/hooks/useUnitContext'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(4),
  justifyContent: 'space-between'
}))

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const STATUS_CONFIG = {
  PENDING_ACCEPTANCE: { color: 'warning', label: 'Pending Acceptance' },
  PENDING_APPROVAL: { color: 'info', label: 'Pending Approval' },
  APPROVED: { color: 'success', label: 'Approved' },
  REJECTED_BY_B: { color: 'error', label: 'Rejected by Employee' },
  REJECTED_BY_MANAGER: { color: 'error', label: 'Rejected by Manager' },
  CANCELLED: { color: 'default', label: 'Cancelled' },
  EXPIRED: { color: 'default', label: 'Expired' }
}

const ROSTER_STATUS_COLORS = {
  ACTIVE: 'success',
  ENDED: 'default',
  REVOKED: 'error'
}

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SHIFTS TAB
// ─────────────────────────────────────────────────────────────────────────────

const shiftSchema = yup.object().shape({
  name: yup.string().required('Shift name is required'),
  startTime: yup.string().required('Start time is required'),
  endTime: yup.string().required('End time is required'),
  gracePeriodMinutes: yup.number().min(0).max(60).default(15),
  workingMinutes: yup.number().min(60).max(1440).default(480),
  halfDayThresholdMinutes: yup.number().min(60).max(480).default(240),
  applicableDays: yup.array().min(1, 'Select at least one working day'),
  shiftType: yup.string().oneOf(['GENERAL', 'MORNING', 'EVENING', 'NIGHT', 'ROTATIONAL']).default('GENERAL'),
  isNextDay: yup.boolean().default(false),
  isDefault: yup.boolean().default(false)
})

const ShiftsTab = ({ shifts, loading, dispatch, unitId }) => {
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '', startTime: '09:00', endTime: '18:00',
      gracePeriodMinutes: 15, workingMinutes: 480, halfDayThresholdMinutes: 240,
      isDefault: false, applicableDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      shiftType: 'GENERAL', isNextDay: false
    },
    resolver: yupResolver(shiftSchema)
  })

  const workingDays = watch('applicableDays') || []

  const handleDayToggle = day => {
    const current = workingDays
    const newDays = current.includes(day) ? current.filter(d => d !== day) : [...current, day]
    setValue('applicableDays', newDays)
  }

  const handleEdit = row => {
    setEditItem(row)
    setValue('name', row.name)
    setValue('startTime', row.startTime)
    setValue('endTime', row.endTime)
    setValue('gracePeriodMinutes', row.gracePeriodMinutes || 15)
    setValue('workingMinutes', row.workingMinutes || 480)
    setValue('halfDayThresholdMinutes', row.halfDayThresholdMinutes || 240)
    setValue('isDefault', row.isDefault)
    setValue('applicableDays', row.applicableDays || ['MON', 'TUE', 'WED', 'THU', 'FRI'])
    setValue('shiftType', row.shiftType || 'GENERAL')
    setValue('isNextDay', row.isNextDay || false)
    setDrawerOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteDialog) return
    try {
      await dispatch(deleteShift(deleteDialog._id)).unwrap()
      toast.success('Shift deleted')
      setDeleteDialog(null)
      dispatch(fetchShifts({ unitId }))
    } catch (err) {
      toast.error(err || 'Failed')
    }
  }

  const onSubmit = async data => {
    try {
      const payload = {
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        gracePeriodMinutes: Number(data.gracePeriodMinutes) || 15,
        workingMinutes: Number(data.workingMinutes) || 480,
        halfDayThresholdMinutes: Number(data.halfDayThresholdMinutes) || 240,
        applicableDays: data.applicableDays || ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        shiftType: data.shiftType || 'GENERAL',
        isNextDay: Boolean(data.isNextDay),
        isDefault: Boolean(data.isDefault),
        unit_id: unitId
      }
      if (editItem) {
        await dispatch(updateShift({ shiftId: editItem._id, data: payload })).unwrap()
        toast.success('Shift updated')
      } else {
        await dispatch(createShift(payload)).unwrap()
        toast.success('Shift created')
      }
      setDrawerOpen(false)
      setEditItem(null)
      reset()
      dispatch(fetchShifts({ unitId }))
    } catch (err) {
      toast.error(err || 'Failed')
    }
  }

  const columns = [
    {
      flex: 0.25, minWidth: 180, field: 'name', headerName: 'Shift Name',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 500 }}>{row.name}</Typography>
          {row.isDefault && <Chip label='Default' size='small' color='primary' sx={{ ml: 1 }} />}
        </Box>
      )
    },
    { flex: 0.12, minWidth: 100, field: 'startTime', headerName: 'Start' },
    { flex: 0.12, minWidth: 100, field: 'endTime', headerName: 'End' },
    { flex: 0.1, minWidth: 80, field: 'workingMinutes', headerName: 'Hours',
      renderCell: ({ row }) => <Typography>{Math.round((row.workingMinutes || 480) / 60)}h</Typography> },
    { flex: 0.1, minWidth: 80, field: 'gracePeriodMinutes', headerName: 'Grace',
      renderCell: ({ row }) => <Typography>{row.gracePeriodMinutes || 15}m</Typography> },
    { flex: 0.1, minWidth: 100, field: 'shiftType', headerName: 'Type',
      renderCell: ({ row }) => <Chip label={row.shiftType || 'GENERAL'} size='small' /> },
    { flex: 0.15, minWidth: 150, field: 'applicableDays', headerName: 'Days',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.3 }}>
          {DAYS.map(day => (
            <Chip key={day} label={day.charAt(0)} size='small'
              color={row.applicableDays?.includes(day) ? 'success' : 'default'} variant='outlined'
              sx={{ height: 20, fontSize: '0.6rem' }} />
          ))}
        </Box>
      )
    },
    { flex: 0.1, minWidth: 80, field: 'actions', headerName: 'Actions', sortable: false,
      renderCell: ({ row }) => (
        <>
          <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
            <Icon icon='tabler:dots-vertical' />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { handleEdit(row); setAnchorEl(null) }}>
              <Icon icon='tabler:edit' fontSize={18} style={{ marginRight: 8 }} /> Edit
            </MenuItem>
            <MenuItem onClick={() => { setDeleteDialog(row); setAnchorEl(null) }} sx={{ color: 'error.main' }}>
              <Icon icon='tabler:trash' fontSize={18} style={{ marginRight: 8 }} /> Delete
            </MenuItem>
          </Menu>
        </>
      )
    }
  ]

  const filteredRows = (shifts || []).filter(r => !search || r.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <CustomTextField size='small' placeholder='Search shifts...' value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <Icon icon='tabler:search' fontSize={20} /> }}
          sx={{ minWidth: 250 }} />
        <Button variant='contained' startIcon={<Icon icon='tabler:plus' />}
          onClick={() => { setEditItem(null); reset(); setDrawerOpen(true) }}>
          Add Shift
        </Button>
      </Box>
      <DataGrid autoHeight rows={filteredRows} columns={columns} loading={loading}
        getRowId={row => row._id} pageSizeOptions={[5, 10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />

      {/* Add/Edit Drawer */}
      <Drawer anchor='right' open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: 300, sm: 400 } } }}>
        <Box sx={{ p: 5 }}>
          <Typography variant='h6' sx={{ mb: 4 }}>{editItem ? 'Edit Shift' : 'Add New Shift'}</Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Controller name='name' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth label='Shift Name' error={!!errors.name}
                      helperText={errors.name?.message} />
                  )} />
              </Grid>
              <Grid item xs={6}>
                <Controller name='startTime' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='time' label='Start Time'
                      InputLabelProps={{ shrink: true }} error={!!errors.startTime} />
                  )} />
              </Grid>
              <Grid item xs={6}>
                <Controller name='endTime' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='time' label='End Time'
                      InputLabelProps={{ shrink: true }} error={!!errors.endTime} />
                  )} />
              </Grid>
              <Grid item xs={6}>
                <Controller name='workingMinutes' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='number' label='Working Minutes'
                      inputProps={{ min: 60, max: 1440 }} />
                  )} />
              </Grid>
              <Grid item xs={6}>
                <Controller name='gracePeriodMinutes' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='number' label='Grace (min)'
                      inputProps={{ min: 0, max: 120 }} />
                  )} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle2' sx={{ mb: 1 }}>Applicable Days</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {DAYS.map(day => (
                    <Chip key={day} label={day} onClick={() => handleDayToggle(day)}
                      color={workingDays.includes(day) ? 'primary' : 'default'}
                      variant={workingDays.includes(day) ? 'filled' : 'outlined'} sx={{ cursor: 'pointer' }} />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Controller name='shiftType' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Shift Type'>
                      <MenuItem value='GENERAL'>General</MenuItem>
                      <MenuItem value='MORNING'>Morning Shift</MenuItem>
                      <MenuItem value='EVENING'>Evening Shift</MenuItem>
                      <MenuItem value='NIGHT'>Night Shift</MenuItem>
                      <MenuItem value='ROTATIONAL'>Rotational</MenuItem>
                    </CustomTextField>
                  )} />
              </Grid>
              <Grid item xs={12}>
                <Controller name='isNextDay' control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Switch checked={field.value || false}
                      onChange={e => field.onChange(e.target.checked)} />}
                      label='End time is on next day' />
                  )} />
              </Grid>
              <Grid item xs={12}>
                <Controller name='isDefault' control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Switch checked={field.value || false}
                      onChange={e => field.onChange(e.target.checked)} />}
                      label='Set as default shift' />
                  )} />
              </Grid>
              <Grid item xs={12}>
                <Button type='submit' variant='contained' fullWidth disabled={loading}>
                  {loading ? <CircularProgress size={22} /> : editItem ? 'Update Shift' : 'Create Shift'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Drawer>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Delete Shift</DialogTitle>
        <DialogContent><Typography>Delete "{deleteDialog?.name}"?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROSTERS TAB
// ─────────────────────────────────────────────────────────────────────────────

const rosterSchema = yup.object().shape({
  employee_id: yup.string().required('Employee is required'),
  shift_id: yup.string().required('Shift is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().min(yup.ref('startDate'), 'End must be after start').required('End date required'),
  notes: yup.string().max(500)
})

const RostersTab = ({ rosters, shifts, employees, loading, dispatch, unitId }) => {
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [revokeDialog, setRevokeDialog] = useState(null)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState([])

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      employee_id: '', shift_id: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      notes: ''
    },
    resolver: yupResolver(rosterSchema)
  })

  const handleEdit = row => {
    setEditItem(row)
    setBulkMode(false)
    reset({
      employee_id: row.employee_id?._id || row.employee_id || '',
      shift_id: row.shift_id?._id || row.shift_id || '',
      startDate: row.startDate ? format(parseISO(row.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      endDate: row.endDate ? format(parseISO(row.endDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      notes: row.notes || ''
    })
    setDrawerOpen(true)
  }

  const handleRevoke = async () => {
    if (!revokeDialog) return
    try {
      await dispatch(revokeRoster(revokeDialog._id)).unwrap()
      toast.success('Roster revoked')
      setRevokeDialog(null)
      dispatch(fetchRosters({ unitId }))
    } catch (error) {
      toast.error(error || 'Failed')
    }
  }

  const onSubmit = async data => {
    try {
      const payload = {
        employee_id: data.employee_id, shift_id: data.shift_id,
        startDate: new Date(data.startDate), endDate: new Date(data.endDate),
        notes: data.notes || '', unit_id: unitId
      }
      if (editItem) {
        await dispatch(updateRoster({ rosterId: editItem._id, data: payload })).unwrap()
        toast.success('Roster updated')
      } else {
        await dispatch(createRoster(payload)).unwrap()
        toast.success('Roster created')
      }
      setDrawerOpen(false)
      reset()
      setEditItem(null)
      dispatch(fetchRosters({ unitId }))
    } catch (error) {
      toast.error(error || 'Failed')
    }
  }

  const handleBulkAssign = async () => {
    if (selectedEmployees.length === 0) { toast.error('Select employees'); return }
    try {
      await dispatch(bulkAssignRoster({
        employee_ids: selectedEmployees, shift_id: watch('shift_id'),
        startDate: new Date(watch('startDate')), endDate: new Date(watch('endDate')),
        unit_id: unitId, notes: watch('notes') || ''
      })).unwrap()
      toast.success('Rosters assigned')
      setDrawerOpen(false)
      setSelectedEmployees([])
      dispatch(fetchRosters({ unitId }))
    } catch (error) {
      toast.error(error || 'Failed')
    }
  }

  const filteredRows = (rosters || []).filter(row => {
    if (!search) return true
    const empName = row.employee_id?.name || `${row.employee_id?.firstName || ''} ${row.employee_id?.lastName || ''}`
    return empName.toLowerCase().includes(search.toLowerCase())
  })

  const columns = [
    { field: 'employee', headerName: 'Employee', flex: 1,
      renderCell: params => {
        const emp = params.row.employee_id
        if (!emp) return <Typography color="text.secondary">-</Typography>
        const empName = typeof emp === 'object' 
          ? (emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.employeeId || 'Unknown')
          : emp
        return <Typography>{empName}</Typography>
      }
    },
    { field: 'shift', headerName: 'Shift', flex: 0.8,
      renderCell: params => {
        const shift = params.row.shift_id
        if (!shift) return <Typography color="text.secondary">-</Typography>
        const shiftName = typeof shift === 'object' ? shift.name : shift
        return <Typography>{shiftName}</Typography>
      }
    },
    { field: 'startDate', headerName: 'Start', flex: 0.6,
      valueGetter: params => { try { return format(parseISO(params.row.startDate), 'dd MMM') } catch { return '-' } }
    },
    { field: 'endDate', headerName: 'End', flex: 0.6,
      valueGetter: params => { try { return format(parseISO(params.row.endDate), 'dd MMM') } catch { return '-' } }
    },
    { field: 'status', headerName: 'Status', flex: 0.5,
      renderCell: params => <Chip label={params.row.status} color={ROSTER_STATUS_COLORS[params.row.status] || 'default'} size='small' />
    },
    { field: 'actions', headerName: 'Actions', flex: 0.5, sortable: false,
      renderCell: params => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size='small' onClick={() => handleEdit(params.row)} disabled={params.row.status !== 'ACTIVE'}>
            <Icon icon='mdi:pencil' fontSize={18} />
          </IconButton>
          <IconButton size='small' onClick={() => setRevokeDialog(params.row)} disabled={params.row.status !== 'ACTIVE'}>
            <Icon icon='mdi:cancel' fontSize={18} color='error' />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <CustomTextField size='small' placeholder='Search employee...' value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <Icon icon='tabler:search' fontSize={20} /> }} sx={{ minWidth: 250 }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant='outlined' startIcon={<Icon icon='mdi:account-multiple' />}
            onClick={() => { setBulkMode(true); setEditItem(null); reset(); setDrawerOpen(true) }}>
            Bulk Assign
          </Button>
          <Button variant='contained' startIcon={<Icon icon='mdi:plus' />}
            onClick={() => { setBulkMode(false); setEditItem(null); reset(); setDrawerOpen(true) }}>
            Add Roster
          </Button>
        </Box>
      </Box>
      <DataGrid autoHeight rows={filteredRows} columns={columns} loading={loading}
        getRowId={row => row._id} pageSizeOptions={[5, 10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />

      {/* Drawer */}
      <Drawer anchor='right' open={drawerOpen} onClose={() => { setDrawerOpen(false); setSelectedEmployees([]) }}
        PaperProps={{ sx: { width: { xs: 350, sm: 500 } } }}>
        <Box sx={{ p: 6 }}>
          <Typography variant='h6' sx={{ mb: 4 }}>
            {editItem ? 'Edit Roster' : bulkMode ? 'Bulk Assign Shift' : 'Add Roster'}
          </Typography>
          <form onSubmit={handleSubmit(bulkMode ? handleBulkAssign : onSubmit)}>
            <Grid container spacing={4}>
              {!bulkMode && !editItem && (
                <Grid item xs={12}>
                  <Controller name='employee_id' control={control}
                    render={({ field }) => (
                      <CustomTextField {...field} select fullWidth label='Employee'>
                        {(employees || []).map(emp => (
                          <MenuItem key={emp._id} value={emp._id}>
                            {emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    )} />
                </Grid>
              )}
              {bulkMode && (
                <Grid item xs={12}>
                  <Typography variant='body2' sx={{ mb: 1 }}>Select Employees ({selectedEmployees.length})</Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
                    {(employees || []).map(emp => (
                      <Box key={emp._id} sx={{ display: 'flex', alignItems: 'center', p: 1, cursor: 'pointer',
                        bgcolor: selectedEmployees.includes(emp._id) ? 'action.selected' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' } }}
                        onClick={() => setSelectedEmployees(prev =>
                          prev.includes(emp._id) ? prev.filter(id => id !== emp._id) : [...prev, emp._id])}>
                        <Icon icon={selectedEmployees.includes(emp._id) ? 'mdi:checkbox-marked' : 'mdi:checkbox-blank-outline'}
                          fontSize={18} style={{ marginRight: 8 }} />
                        {emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Controller name='shift_id' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Shift'>
                      {(shifts || []).map(s => (
                        <MenuItem key={s._id} value={s._id}>{s.name} ({s.startTime} - {s.endTime})</MenuItem>
                      ))}
                    </CustomTextField>
                  )} />
              </Grid>
              <Grid item xs={6}>
                <Controller name='startDate' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='date' label='Start Date' InputLabelProps={{ shrink: true }} />
                  )} />
              </Grid>
              <Grid item xs={6}>
                <Controller name='endDate' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='date' label='End Date' InputLabelProps={{ shrink: true }} />
                  )} />
              </Grid>
              <Grid item xs={12}>
                <Controller name='notes' control={control}
                  render={({ field }) => <CustomTextField {...field} fullWidth multiline rows={2} label='Notes' />} />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', mt: 4 }}>
              <Button variant='tonal' color='secondary' onClick={() => { setDrawerOpen(false); setSelectedEmployees([]) }}>
                Cancel
              </Button>
              <Button type='submit' variant='contained' disabled={loading}>
                {loading && <CircularProgress size={16} sx={{ mr: 1 }} />}
                {editItem ? 'Update' : bulkMode ? 'Assign' : 'Create'}
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>

      {/* Revoke Dialog */}
      <Dialog open={!!revokeDialog} onClose={() => setRevokeDialog(null)}>
        <DialogTitle>Revoke Roster</DialogTitle>
        <DialogContent><Typography>Revoke this roster assignment?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeDialog(null)}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleRevoke} disabled={loading}>Revoke</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SHIFT SWAPS TAB
// ─────────────────────────────────────────────────────────────────────────────

const swapSchema = yup.object().shape({
  requestedEmployeeId: yup.string().required('Employee is required'),
  swapDate: yup.date().required('Swap date is required').min(new Date(), 'Date must be today or future'),
  reason: yup.string().max(500)
})

const ShiftSwapsTab = ({ swapRequests, employees, loading, dispatch, unitId }) => {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [actionDialog, setActionDialog] = useState(null)
  const [actionComment, setActionComment] = useState('')

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      requestedEmployeeId: '',
      swapDate: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      reason: ''
    },
    resolver: yupResolver(swapSchema)
  })

  const onSubmit = async data => {
    try {
      await dispatch(raiseSwapRequest({
        requested_employee_id: data.requestedEmployeeId,
        swapDate: new Date(data.swapDate),
        reason: data.reason || '',
        unit_id: unitId
      })).unwrap()
      toast.success('Swap request raised')
      setDrawerOpen(false)
      reset()
      dispatch(fetchShiftSwaps({ unitId }))
    } catch (error) {
      toast.error(error || 'Failed')
    }
  }

  const handleAction = async () => {
    if (!actionDialog) return
    try {
      const { action, swapId } = actionDialog
      if (action === 'accept') await dispatch(respondToSwap({ swapId, accept: true, comment: actionComment })).unwrap()
      if (action === 'decline') await dispatch(respondToSwap({ swapId, accept: false, comment: actionComment })).unwrap()
      if (action === 'approve') await dispatch(approveSwap({ swapId, comment: actionComment })).unwrap()
      if (action === 'reject') await dispatch(rejectSwap({ swapId, comment: actionComment })).unwrap()
      if (action === 'cancel') await dispatch(cancelSwapRequest({ swapId, comment: actionComment })).unwrap()
      toast.success(`Request ${action}d`)
      setActionDialog(null)
      setActionComment('')
      dispatch(fetchShiftSwaps({ unitId }))
    } catch (error) {
      toast.error(error || 'Failed')
    }
  }

  const filteredRows = (swapRequests || []).filter(row => {
    if (filterStatus !== 'all' && row.status !== filterStatus) return false
    if (!search) return true
    const emp1 = row.requesterEmployeeId?.name || ''
    const emp2 = row.requestedEmployeeId?.name || ''
    return emp1.toLowerCase().includes(search.toLowerCase()) || emp2.toLowerCase().includes(search.toLowerCase())
  })

  const columns = [
    { field: 'requester', headerName: 'Requester', flex: 1,
      renderCell: params => {
        const emp = params.row.requesterEmployeeId
        if (!emp) return <Typography color="text.secondary">-</Typography>
        const name = typeof emp === 'object' ? (emp.name || emp.employeeId || 'Unknown') : emp
        return <Typography>{name}</Typography>
      }
    },
    { field: 'requested', headerName: 'Requested', flex: 1,
      renderCell: params => {
        const emp = params.row.requestedEmployeeId
        if (!emp) return <Typography color="text.secondary">-</Typography>
        const name = typeof emp === 'object' ? (emp.name || emp.employeeId || 'Unknown') : emp
        return <Typography>{name}</Typography>
      }
    },
    { field: 'swapDate', headerName: 'Swap Date', flex: 0.7,
      valueGetter: params => { try { return format(parseISO(params.row.swapDate), 'dd MMM yyyy') } catch { return '-' } }
    },
    { field: 'status', headerName: 'Status', flex: 0.8,
      renderCell: params => {
        const config = STATUS_CONFIG[params.row.status] || { color: 'default', label: params.row.status }
        return <Chip label={config.label} color={config.color} size='small' />
      }
    },
    { field: 'actions', headerName: 'Actions', flex: 1, sortable: false,
      renderCell: params => {
        const status = params.row.status
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {status === 'PENDING_ACCEPTANCE' && (
              <>
                <IconButton size='small' onClick={() => setActionDialog({ action: 'accept', swapId: params.row._id })}>
                  <Icon icon='mdi:check' fontSize={18} color='success' />
                </IconButton>
                <IconButton size='small' onClick={() => setActionDialog({ action: 'decline', swapId: params.row._id })}>
                  <Icon icon='mdi:close' fontSize={18} color='error' />
                </IconButton>
              </>
            )}
            {status === 'PENDING_APPROVAL' && (
              <>
                <IconButton size='small' onClick={() => setActionDialog({ action: 'approve', swapId: params.row._id })}>
                  <Icon icon='mdi:check-circle' fontSize={18} color='success' />
                </IconButton>
                <IconButton size='small' onClick={() => setActionDialog({ action: 'reject', swapId: params.row._id })}>
                  <Icon icon='mdi:close-circle' fontSize={18} color='error' />
                </IconButton>
              </>
            )}
            {(status === 'PENDING_ACCEPTANCE' || status === 'PENDING_APPROVAL') && (
              <IconButton size='small' onClick={() => setActionDialog({ action: 'cancel', swapId: params.row._id })}>
                <Icon icon='mdi:cancel' fontSize={18} color='warning' />
              </IconButton>
            )}
          </Box>
        )
      }
    }
  ]

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <CustomTextField size='small' placeholder='Search...' value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <Icon icon='tabler:search' fontSize={20} /> }} sx={{ minWidth: 200 }} />
          <CustomTextField select size='small' value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            sx={{ minWidth: 150 }} label='Status'>
            <MenuItem value='all'>All</MenuItem>
            <MenuItem value='PENDING_ACCEPTANCE'>Pending Acceptance</MenuItem>
            <MenuItem value='PENDING_APPROVAL'>Pending Approval</MenuItem>
            <MenuItem value='APPROVED'>Approved</MenuItem>
            <MenuItem value='REJECTED_BY_B'>Rejected by Employee</MenuItem>
            <MenuItem value='REJECTED_BY_MANAGER'>Rejected by Manager</MenuItem>
          </CustomTextField>
        </Box>
        <Button variant='contained' startIcon={<Icon icon='mdi:swap-horizontal' />}
          onClick={() => { reset(); setDrawerOpen(true) }}>
          New Request
        </Button>
      </Box>
      <DataGrid autoHeight rows={filteredRows} columns={columns} loading={loading}
        getRowId={row => row._id} pageSizeOptions={[5, 10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />

      {/* New Request Drawer */}
      <Drawer anchor='right' open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: 350, sm: 450 } } }}>
        <Box sx={{ p: 6 }}>
          <Typography variant='h6' sx={{ mb: 4 }}>Raise Shift Swap Request</Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Controller name='requestedEmployeeId' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Employee to Swap With'>
                      {(employees || []).map(emp => (
                        <MenuItem key={emp._id} value={emp._id}>
                          {emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )} />
              </Grid>
              <Grid item xs={12}>
                <Controller name='swapDate' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='date' label='Swap Date'
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: format(new Date(), 'yyyy-MM-dd') }} />
                  )} />
              </Grid>
              <Grid item xs={12}>
                <Controller name='reason' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth multiline rows={2} label='Reason (Optional)' />
                  )} />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', mt: 4 }}>
              <Button variant='tonal' color='secondary' onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button type='submit' variant='contained' disabled={loading}>
                {loading && <CircularProgress size={16} sx={{ mr: 1 }} />}Submit
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)}>
        <DialogTitle>{actionDialog?.action?.charAt(0).toUpperCase()}{actionDialog?.action?.slice(1)} Request</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Add an optional comment:</DialogContentText>
          <CustomTextField fullWidth multiline rows={2} value={actionComment}
            onChange={e => setActionComment(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>Cancel</Button>
          <Button variant='contained'
            color={actionDialog?.action === 'approve' || actionDialog?.action === 'accept' ? 'primary' : 'error'}
            onClick={handleAction} disabled={loading}>
            {loading && <CircularProgress size={16} sx={{ mr: 1 }} />}
            {actionDialog?.action?.charAt(0).toUpperCase()}{actionDialog?.action?.slice(1)}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const ShiftRosterPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  
  // ✅ Use useUnitContext for consistent ID resolution
  const { orgId, companyId, unitId } = useUnitContext()
  const units = useSelector(selectAllHierarchyUnits)

  const [tabValue, setTabValue] = useState(0)
  const initialized = useRef(false)

  // Redux state
  const { shifts, loading: shiftLoading } = useSelector(state => state.shifts || {})
  const { rosters, loading: rosterLoading } = useSelector(state => state.rosters || {})
  const { swapRequests, loading: swapLoading } = useSelector(state => state.shiftSwaps || {})
  const { list: employees } = useSelector(state => state.employee || {})
  const hierarchyLoading = useSelector(state => state.hierarchy?.loading || false)

  // Single initialization effect
  useEffect(() => {
    if (initialized.current) return

    const init = async () => {
      initialized.current = true

      // Fetch hierarchy if needed
      if (units.length === 0) {
        try {
          await dispatch(fetchHierarchy()).unwrap()
        } catch (err) {
          console.error('Failed to fetch hierarchy:', err)
          return
        }
      }

      // Fetch data if unitId is available
      if (unitId) {
        await Promise.all([
          dispatch(fetchShifts({ unitId })),
          dispatch(fetchRosters({ unitId })),
          dispatch(fetchShiftSwaps({ unitId })),
          dispatch(fetchAllEmployees({ unitId, limit: 500 }))
        ])
      }
    }

    init()
  }, []) // Empty deps - runs once on mount

  // Re-fetch when unit changes
  useEffect(() => {
    if (!unitId || !initialized.current) return

    dispatch(fetchShifts({ unitId }))
    dispatch(fetchRosters({ unitId }))
    dispatch(fetchShiftSwaps({ unitId }))
    dispatch(fetchAllEmployees({ unitId, limit: 500 }))
  }, [dispatch, unitId])

  const handleTabChange = (event, newValue) => setTabValue(newValue)

  // Show loading state while initializing
  if (!initialized.current && (hierarchyLoading || units.length === 0)) {
    return (
      <Grid container spacing={6.5}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Loading organizational structure...</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Shift & Roster Management'
            subheader='Manage shifts, assign rosters to employees, and handle shift swap requests' />
          <Divider />
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label='Shifts' icon={<Icon icon='mdi:clock-outline' />} iconPosition='start' />
              <Tab label='Rosters' icon={<Icon icon='mdi:account-clock' />} iconPosition='start' />
              <Tab label='Shift Swaps' icon={<Icon icon='mdi:swap-horizontal' />} iconPosition='start' />
            </Tabs>
          </Box>
          <CardContent>
            <TabPanel value={tabValue} index={0}>
              <ShiftsTab shifts={shifts} loading={shiftLoading} dispatch={dispatch} unitId={unitId} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <RostersTab rosters={rosters} shifts={shifts} employees={employees}
                loading={rosterLoading} dispatch={dispatch} unitId={unitId} />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <ShiftSwapsTab swapRequests={swapRequests} employees={employees}
                loading={swapLoading} dispatch={dispatch} unitId={unitId} />
            </TabPanel>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ShiftRosterPage
