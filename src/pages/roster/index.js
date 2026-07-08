import { useState, useEffect } from 'react'
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
import Drawer from '@mui/material/Drawer'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Chip from '@mui/material/Chip'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { fetchRosters, createRoster, updateRoster, revokeRoster, bulkAssignRoster } from 'src/store/shift/rosterSlice'
import { fetchShifts } from 'src/store/shift/shiftSlice'
import { fetchAllEmployees } from 'src/store/employee/employeeSlice'
import { selectSelectedUnitId } from 'src/store/hierarchy/hierarchySlice'
import { format, parseISO, isValid } from 'date-fns'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const schema = yup.object().shape({
  employee_id: yup.string().required('Employee is required'),
  shift_id: yup.string().required('Shift is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().min(yup.ref('startDate'), 'End date must be after start date').required('End date is required'),
  notes: yup.string().max(500)
})

const STATUS_COLORS = {
  ACTIVE: 'success',
  ENDED: 'default',
  REVOKED: 'error'
}

const RosterPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { rosters, loading } = useSelector(state => state.rosters || {})
  const { shifts } = useSelector(state => state.shifts || {})
  const { list: employees } = useSelector(state => state.employee || {})
  const selectedUnitId = useSelector(selectSelectedUnitId)

  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [revokeDialog, setRevokeDialog] = useState(null)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      employee_id: '',
      shift_id: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      notes: ''
    },
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    dispatch(fetchRosters({ unitId: router.query.unit || selectedUnitId }))
    dispatch(fetchShifts({ unitId: router.query.unit || selectedUnitId }))
    dispatch(fetchAllEmployees({ unitId: router.query.unit || selectedUnitId, limit: 500 }))
  }, [dispatch, router.query.unit, selectedUnitId])

  useEffect(() => {
    setRows(Array.isArray(rosters) ? rosters : [])
  }, [rosters])

  // Filter rows based on search
  const filteredRows = rows.filter(row => {
    if (!search) return true
    const employeeName = row.employee_id?.name || row.employee_id?.firstName || ''
    const shiftName = row.shift_id?.name || ''
    return employeeName.toLowerCase().includes(search.toLowerCase()) ||
           shiftName.toLowerCase().includes(search.toLowerCase())
  })

  const handleEdit = (row) => {
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
      toast.success('Roster revoked successfully')
      setRevokeDialog(null)
      dispatch(fetchRosters({ unitId: router.query.unit || selectedUnitId }))
    } catch (error) {
      toast.error(error || 'Failed to revoke roster')
    }
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        employee_id: data.employee_id,
        shift_id: data.shift_id,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        notes: data.notes || '',
        unitId: router.query.unit || selectedUnitId
      }

      if (editItem) {
        await dispatch(updateRoster({ rosterId: editItem._id, data: payload })).unwrap()
        toast.success('Roster updated successfully')
      } else {
        await dispatch(createRoster(payload)).unwrap()
        toast.success('Roster created successfully')
      }

      setDrawerOpen(false)
      reset()
      setEditItem(null)
      dispatch(fetchRosters({ unitId: router.query.unit || selectedUnitId }))
    } catch (error) {
      toast.error(error || 'Failed to save roster')
    }
  }

  const handleBulkAssign = async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Select at least one employee')
      return
    }

    try {
      const shiftId = watch('shift_id')
      const startDate = watch('startDate')
      const endDate = watch('endDate')

      const payload = {
        employeeIds: selectedEmployees,
        shift_id: shiftId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        unitId: router.query.unit || selectedUnitId,
        notes: watch('notes') || ''
      }

      await dispatch(bulkAssignRoster(payload)).unwrap()
      toast.success('Rosters assigned successfully')
      setDrawerOpen(false)
      setSelectedEmployees([])
      dispatch(fetchRosters({ unitId: router.query.unit || selectedUnitId }))
    } catch (error) {
      toast.error(error || 'Failed to bulk assign rosters')
    }
  }

  const columns = [
    {
      field: 'employee',
      headerName: 'Employee',
      flex: 1,
      valueGetter: (params) => {
        const emp = params.row.employee_id
        return typeof emp === 'object' ? emp?.name || `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim() : emp
      }
    },
    {
      field: 'shift',
      headerName: 'Shift',
      flex: 1,
      valueGetter: (params) => {
        const shift = params.row.shift_id
        return typeof shift === 'object' ? shift?.name : shift
      }
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      flex: 0.8,
      valueGetter: (params) => {
        const date = params.row.startDate
        if (!date) return '-'
        try {
          return format(parseISO(date), 'dd MMM yyyy')
        } catch {
          return '-'
        }
      }
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      flex: 0.8,
      valueGetter: (params) => {
        const date = params.row.endDate
        if (!date) return '-'
        try {
          return format(parseISO(date), 'dd MMM yyyy')
        } catch {
          return '-'
        }
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.6,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          color={STATUS_COLORS[params.row.status] || 'default'}
          size='small'
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size='small' onClick={() => handleEdit(params.row)} disabled={params.row.status !== 'ACTIVE'}>
            <Icon icon='mdi:pencil' fontSize={20} />
          </IconButton>
          <IconButton size='small' onClick={() => setRevokeDialog(params.row)} disabled={params.row.status !== 'ACTIVE'}>
            <Icon icon='mdi:cancel' fontSize={20} color='error' />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <Card>
      <Header>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant='h5'>Roster Management</Typography>
          <CustomTextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search employee or shift...'
            size='small'
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: <Icon icon='mdi:magnify' fontSize={20} style={{ marginRight: 8 }} />
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='outlined'
            startIcon={<Icon icon='mdi:account-multiple' />}
            onClick={() => {
              setBulkMode(true)
              setEditItem(null)
              reset({
                employee_id: '',
                shift_id: '',
                startDate: format(new Date(), 'yyyy-MM-dd'),
                endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                notes: ''
              })
              setDrawerOpen(true)
            }}
          >
            Bulk Assign
          </Button>
          <Button
            variant='contained'
            startIcon={<Icon icon='mdi:plus' />}
            onClick={() => {
              setBulkMode(false)
              setEditItem(null)
              reset({
                employee_id: '',
                shift_id: '',
                startDate: format(new Date(), 'yyyy-MM-dd'),
                endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                notes: ''
              })
              setDrawerOpen(true)
            }}
          >
            Add Roster
          </Button>
        </Box>
      </Header>

      <CardContent sx={{ pt: 0 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          sx={{ minHeight: 500 }}
        />
      </CardContent>

      {/* Add/Edit/Bulk Drawer */}
      <Drawer
        anchor='right'
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setEditItem(null)
          setSelectedEmployees([])
        }}
        PaperProps={{ sx: { width: { xs: 350, sm: 500 } } }}
      >
        <Box sx={{ p: 6 }}>
          <Typography variant='h6' sx={{ mb: 4 }}>
            {editItem ? 'Edit Roster' : bulkMode ? 'Bulk Assign Shift' : 'Add Roster'}
          </Typography>

          <form onSubmit={handleSubmit(bulkMode ? handleBulkAssign : onSubmit)}>
            <Grid container spacing={4}>
              {!bulkMode && !editItem && (
                <Grid item xs={12}>
                  <Controller
                    name='employee_id'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        select
                        fullWidth
                        label='Employee'
                        error={!!errors.employee_id}
                        helperText={errors.employee_id?.message}
                      >
                        {(employees || []).map(emp => (
                          <MenuItem key={emp._id} value={emp._id}>
                            {emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    )}
                  />
                </Grid>
              )}

              {bulkMode && (
                <Grid item xs={12}>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    Select Employees ({selectedEmployees.length} selected)
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
                    {(employees || []).map(emp => (
                      <Box
                        key={emp._id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1,
                          cursor: 'pointer',
                          bgcolor: selectedEmployees.includes(emp._id) ? 'action.selected' : 'transparent',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => {
                          setSelectedEmployees(prev =>
                            prev.includes(emp._id)
                              ? prev.filter(id => id !== emp._id)
                              : [...prev, emp._id]
                          )
                        }}
                      >
                        <Icon
                          icon={selectedEmployees.includes(emp._id) ? 'mdi:checkbox-marked' : 'mdi:checkbox-blank-outline'}
                          fontSize={20}
                          style={{ marginRight: 8 }}
                        />
                        {emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <Controller
                  name='shift_id'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      label='Shift'
                      error={!!errors.shift_id}
                      helperText={errors.shift_id?.message}
                    >
                      {(shifts || []).map(shift => (
                        <MenuItem key={shift._id} value={shift._id}>
                          {shift.name} ({shift.startTime} - {shift.endTime})
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='startDate'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='date'
                      label='Start Date'
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.startDate}
                      helperText={errors.startDate?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='endDate'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='date'
                      label='End Date'
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.endDate}
                      helperText={errors.endDate?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='notes'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      multiline
                      rows={3}
                      label='Notes (Optional)'
                      placeholder='e.g., Project deadline coverage'
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', mt: 6 }}>
              <Button
                variant='tonal'
                color='secondary'
                onClick={() => {
                  setDrawerOpen(false)
                  setEditItem(null)
                  setSelectedEmployees([])
                }}
              >
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
        <DialogContent>
          <Typography>
            Are you sure you want to revoke this roster? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeDialog(null)}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleRevoke} disabled={loading}>
            {loading && <CircularProgress size={16} sx={{ mr: 1 }} />}
            Revoke
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default RosterPage
