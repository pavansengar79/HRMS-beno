// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import SwitchComponent from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────

const HOLIDAY_TYPES = [
  { label: 'National', value: 'NATIONAL' },
  { label: 'Festival', value: 'FESTIVAL' },
  { label: 'Regional', value: 'REGIONAL' },
  { label: 'Optional', value: 'OPTIONAL' }
]

const defaultValues = {
  name: '',
  date: '',
  type: 'NATIONAL',
  isRecurring: false
}

// ────────────────────────────────────────────────────────────────
// Type Chip Color Helper
// ────────────────────────────────────────────────────────────────

const getTypeColor = type => {
  switch (type) {
    case 'NATIONAL':
      return 'primary'
    case 'FESTIVAL':
      return 'success'
    case 'REGIONAL':
      return 'warning'
    case 'OPTIONAL':
      return 'secondary'
    default:
      return 'default'
  }
}

// ────────────────────────────────────────────────────────────────
// Main Component - LIST VIEW ONLY
// ────────────────────────────────────────────────────────────────

const TabHolidayCalendar = () => {
  // ** State
  const [holidays, setHolidays] = useState([])
  const [masterHolidays, setMasterHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [filterType, setFilterType] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [toggleLoading, setToggleLoading] = useState(null)
  const [selectedMasterIds, setSelectedMasterIds] = useState([])

  // ** Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ defaultValues })

  // ────────────────────────────────────────────────────────────
  // Fetch Company Holidays
  // ────────────────────────────────────────────────────────────

  const fetchHolidays = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ year: selectedYear })
      if (filterType) params.append('type', filterType)
      
      // Fetch company holidays (not master)
      const res = await axiosRequest.get(`/api/v1/holidays?${params.toString()}`)
      
      if (res && res.success && Array.isArray(res.data)) {
        setHolidays(res.data)
      } else {
        setHolidays([])
      }
    } catch (error) {
      console.error('Failed to load holidays:', error)
      toast.error('Failed to load holidays')
    } finally {
      setLoading(false)
    }
  }

  // Fetch master holidays for import dialog
  const fetchMasterHolidays = async () => {
    try {
      const params = new URLSearchParams({ year: selectedYear })
      const res = await axiosRequest.get(`/api/v1/holidays/master?${params.toString()}`)
      
      if (res && res.success && Array.isArray(res.data)) {
        setMasterHolidays(res.data.filter(h => h.isActive))
      }
    } catch (error) {
      console.error('Failed to load master holidays:', error)
    }
  }

  useEffect(() => {
    fetchHolidays()
  }, [selectedYear, filterType])

  // ────────────────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────────────────

  const handleToggleActive = async (holidayId, currentStatus) => {
    setToggleLoading(holidayId)
    try {
      // Toggle company holiday (not master)
      const res = await axiosRequest.patch(`/api/v1/holidays/${holidayId}/toggle`)
      
      if (res && res.success) {
        toast.success(`Holiday ${!currentStatus ? 'activated' : 'deactivated'}`)
        setHolidays(prev => prev.map(h => h._id === holidayId ? { ...h, isActive: !currentStatus } : h))
      }
    } catch (error) {
      toast.error('Failed to update holiday')
    } finally {
      setToggleLoading(null)
    }
  }

  // Handle import from master
  const handleOpenImport = () => {
    fetchMasterHolidays()
    setSelectedMasterIds([])
    setImportDialogOpen(true)
  }

  const handleImport = async () => {
    if (selectedMasterIds.length === 0) {
      toast.error('Please select at least one holiday to import')
      return
    }

    try {
      const res = await axiosRequest.post('/api/v1/holidays/import', {
        holiday_ids: selectedMasterIds,
        yearType: 'CALENDAR'
      })

      if (res && res.success) {
        toast.success(res.message || 'Holidays imported successfully')
        setImportDialogOpen(false)
        fetchHolidays()
      }
    } catch (error) {
      toast.error('Failed to import holidays')
    }
  }

  const handleAddNew = () => {
    setEditData(null)
    reset(defaultValues)
    setDialogOpen(true)
  }

  const handleEdit = (holiday) => {
    setEditData(holiday)
    reset({
      name: holiday.name,
      date: holiday.date ? holiday.date.split('T')[0] : '',
      type: holiday.type,
      isRecurring: holiday.isRecurring || false
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        year: selectedYear,
        date: new Date(data.date).toISOString()
      }

      let res
      if (editData) {
        // Update company holiday
        res = await axiosRequest.patch(`/api/v1/holidays/${editData._id}`, payload)
      } else {
        // Create company holiday
        res = await axiosRequest.post('/api/v1/holidays', payload)
      }

      if (res && res.success) {
        toast.success(editData ? 'Holiday updated' : 'Holiday created')
        setDialogOpen(false)
        fetchHolidays()
      }
    } catch (error) {
      toast.error('Failed to save holiday')
    }
  }

  // ────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Company Holiday Configuration'
            subheader='Manage holidays for your company. Import from platform holidays or create custom holidays.'
            action={
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  select
                  size='small'
                  label='Year'
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  sx={{ width: 100 }}
                >
                  {[2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </TextField>
                
                <TextField
                  select
                  size='small'
                  label='Type'
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  sx={{ width: 150 }}
                >
                  <MenuItem value=''>All</MenuItem>
                  {HOLIDAY_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </TextField>
                
                <Button
                  variant='outlined'
                  startIcon={<Icon icon='mdi:import' />}
                  onClick={handleOpenImport}
                >
                  Import from Master
                </Button>
                
                <Button
                  variant='contained'
                  startIcon={<Icon icon='mdi:plus' />}
                  onClick={handleAddNew}
                >
                  Add Holiday
                </Button>
              </Box>
            }
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Recurring</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holidays.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        <Typography variant='body2' sx={{ py: 4 }}>
                          No holidays found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    holidays.map(holiday => (
                      <TableRow key={holiday._id} hover>
                        <TableCell>{holiday.name}</TableCell>
                        <TableCell>
                          {new Date(holiday.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={holiday.type}
                            color={getTypeColor(holiday.type)}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          {holiday.isRecurring ? (
                            <Icon icon='mdi:check-circle' style={{ color: '#16A34A' }} />
                          ) : (
                            <Icon icon='mdi:minus-circle' style={{ color: '#94A3B8' }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <SwitchComponent
                            checked={holiday.isActive}
                            onChange={() => handleToggleActive(holiday._id, holiday.isActive)}
                            disabled={toggleLoading === holiday._id}
                            color='success'
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title='Edit'>
                            <IconButton
                              size='small'
                              onClick={() => handleEdit(holiday)}
                            >
                              <Icon icon='mdi:pencil' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='body2' color='text.secondary'>
                Total: {holidays.length} holidays • Active: {holidays.filter(h => h.isActive).length} • Inactive: {holidays.filter(h => !h.isActive).length}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editData ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Controller
                name='name'
                control={control}
                rules={{ required: 'Holiday name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Holiday Name'
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    fullWidth
                  />
                )}
              />
              
              <Controller
                name='date'
                control={control}
                rules={{ required: 'Date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type='date'
                    label='Date'
                    error={!!errors.date}
                    helperText={errors.date?.message}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
              
              <Controller
                name='type'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label='Type'
                    fullWidth
                  >
                    {HOLIDAY_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
              
              <Controller
                name='isRecurring'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    control={<SwitchComponent />}
                    label='Recurring Holiday'
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type='submit' variant='contained'>{editData ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Import from Master Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Import Holidays from Master</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Select holidays to import for your company. Active holidays from platform will be imported for year {selectedYear}.
          </Typography>
          
          {masterHolidays.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant='body2' color='text.secondary'>
                No master holidays available for import
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='body2'>
                  {selectedMasterIds.length} of {masterHolidays.length} holidays selected
                </Typography>
                <Box>
                  <Button 
                    size='small' 
                    onClick={() => setSelectedMasterIds(masterHolidays.map(h => h._id))}
                  >
                    Select All
                  </Button>
                  <Button 
                    size='small' 
                    onClick={() => setSelectedMasterIds([])}
                  >
                    Clear All
                  </Button>
                </Box>
              </Box>
              
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding='checkbox'></TableCell>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {masterHolidays.map(holiday => {
                      const isSelected = selectedMasterIds.includes(holiday._id)
                      const alreadyImported = holidays.some(h => 
                        new Date(h.date).toDateString() === new Date(holiday.date).toDateString()
                      )
                      
                      return (
                        <TableRow 
                          key={holiday._id} 
                          hover
                          selected={isSelected}
                        >
                          <TableCell padding='checkbox'>
                            <SwitchComponent
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSelectedMasterIds(prev => prev.filter(id => id !== holiday._id))
                                } else {
                                  setSelectedMasterIds(prev => [...prev, holiday._id])
                                }
                              }}
                              disabled={alreadyImported || !holiday.isActive}
                              color='primary'
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2'>
                              {holiday.name}
                              {alreadyImported && (
                                <Chip label='Already Imported' size='small' color='success' sx={{ ml: 1 }} />
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(holiday.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={holiday.type}
                              color={getTypeColor(holiday.type)}
                              size='small'
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button 
            variant='contained' 
            onClick={handleImport}
            disabled={selectedMasterIds.length === 0}
          >
            Import {selectedMasterIds.length} Holidays
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default TabHolidayCalendar
