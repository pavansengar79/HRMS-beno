// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Drawer from '@mui/material/Drawer'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { Paper } from '@mui/material'

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
  year: new Date().getFullYear()
}

// ────────────────────────────────────────────────────────────────
// Drawer
// ────────────────────────────────────────────────────────────────

const HolidayDrawer = ({ open, onClose, editData, onSuccess }) => {
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(editData?._id)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues
  })

  useEffect(() => {
    if (open) {
      reset(
        editData
          ? {
              name: editData.name || '',
              date: editData.date ? editData.date.split('T')[0] : '',
              type: editData.type || 'NATIONAL',
              year: editData.year || new Date().getFullYear()
            }
          : defaultValues
      )
    }
  }, [open, editData, reset])

  const onSubmit = async values => {
    setSaving(true)

    try {
      const payload = {
        ...values,
        year: Number(values.year)
      }

      let res

      if (isEdit) {
        res = await axiosRequest.put(`api/v1/holidays/${editData._id}`, payload)
      } else {
        res = await axiosRequest.post('api/v1/holidays', payload)
      }

      if (res?.data?.success) {
        toast.success(`Holiday ${isEdit ? 'updated' : 'created'} successfully`)
        onSuccess(res.data.data, isEdit)
        onClose()
      }
    } catch (error) {
      toast.error(error || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: {
            xs: '100%',
            sm: 520
          }
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 5,
          py: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant='h6'>
          {isEdit ? 'Edit Holiday' : 'Create Holiday'}
        </Typography>

        <IconButton size='small' onClick={onClose}>
          <Icon icon='tabler:x' />
        </IconButton>
      </Box>

      {/* Form */}
      <Box
        component='form'
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          height: '100%'
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Controller
              name='name'
              control={control}
              rules={{
                required: 'Holiday name is required'
              }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Holiday Name'
                  placeholder='Republic Day'
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name='date'
              control={control}
              rules={{
                required: 'Date is required'
              }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='date'
                  label='Date'
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date}
                  helperText={errors.date?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name='year'
              control={control}
              rules={{
                required: 'Year required'
              }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='number'
                  label='Year'
                  error={!!errors.year}
                  helperText={errors.year?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name='type'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} select fullWidth label='Holiday Type'>
                  {HOLIDAY_TYPES.map(item => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Grid>
        </Grid>

        {/* Footer */}
        <Box
          sx={{
            mt: 'auto',
            pt: 5,
            display: 'flex',
            gap: 3,
            justifyContent: 'flex-end'
          }}
        >
          <Button
            variant='tonal'
            color='secondary'
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type='submit'
            variant='contained'
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={18} color='inherit' /> : null
            }
          >
            {saving
              ? 'Saving...'
              : isEdit
              ? 'Update Holiday'
              : 'Create Holiday'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

// ────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────

const TabHolidayCalendar = () => {
  const currentYear = new Date().getFullYear()

  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editData, setEditData] = useState(null)

  const [selectedYear, setSelectedYear] = useState(currentYear)

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    data: null
  })

  // ────────────────────────────────────────────────────────────
  // Fetch Holidays
  // ────────────────────────────────────────────────────────────

  const fetchHolidays = useCallback(async () => {
    setLoading(true)

    try {
      const res = await axiosRequest.get(
        `api/v1/holidays?year=${selectedYear}`
      )

      console.log('Holiday fetch response:', res.data)
      if (res?.success) {
        setHolidays(res.data || [])
      }
    } catch (error) {
      toast.error('Failed to load holidays')
    } finally {
      setLoading(false)
    }
  }, [selectedYear])

  useEffect(() => {
    fetchHolidays()
  }, [fetchHolidays])

  // ────────────────────────────────────────────────────────────
  // Create / Update Success
  // ────────────────────────────────────────────────────────────

  const handleSuccess = (record, isEdit) => {
    setHolidays(prev => {
      if (isEdit) {
        return prev.map(item =>
          item._id === record._id ? record : item
        )
      }

      return [record, ...prev]
    })
  }

  // ────────────────────────────────────────────────────────────
  // Delete Holiday
  // ────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    try {
      const id = deleteModal?.data?._id

      const res = await axiosRequest.delete(`api/v1/holidays/${id}`)

      if (res?.data?.success) {
        setHolidays(prev => prev.filter(item => item._id !== id))

        toast.success('Holiday deleted successfully')

        setDeleteModal({
          open: false,
          data: null
        })
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Delete failed')
    }
  }

  // ────────────────────────────────────────────────────────────
  // Type Chip Color
  // ────────────────────────────────────────────────────────────

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

  return (
    <>
      <Card>
        {/* Header */}
        <CardHeader
          title='Holiday Management'
          subheader='Manage company holidays and holiday calendars'
          action={
            <Box sx={{ display: 'flex', gap: 3 }}>
              <CustomTextField
                select
                size='small'
                value={selectedYear}
                sx={{ minWidth: 120 }}
                onChange={e => setSelectedYear(e.target.value)}
              >
                {[2024, 2025, 2026, 2027, 2028].map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </CustomTextField>

              <Button
                variant='contained'
                startIcon={<Icon icon='tabler:plus' />}
                onClick={() => {
                  setEditData(null)
                  setDrawerOpen(true)
                }}
              >
                Add Holiday
              </Button>
            </Box>
          }
        />

        <Divider />

        {/* Content */}
        <CardContent>
          {loading ? (
            <Box
              sx={{
                py: 10,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <CircularProgress />
            </Box>
          ) : holidays.length === 0 ? (
            <Alert severity='info'>
              No holidays found for {selectedYear}
            </Alert>
          ) : (
            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {holidays.map(row => (
                    <TableRow hover key={row._id}>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {row.name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {row.date
                          ? new Date(row.date).toLocaleDateString('en-IN')
                          : '-'}
                      </TableCell>

                      <TableCell>{row.year}</TableCell>

                      <TableCell>
                        <Chip
                          size='small'
                          label={row.type}
                          color={getTypeColor(row.type)}
                          variant='tonal'
                        />
                      </TableCell>

                      <TableCell align='right'>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 1
                          }}
                        >
                          <Tooltip title='View'>
                            <IconButton
                              size='small'
                              onClick={async () => {
                                try {
                                  const res = await axiosRequest.get(
                                    `api/v1/holidays/${row._id}`
                                  )

                                  if (res?.data?.success) {
                                    setEditData(res.data.data)
                                    setDrawerOpen(true)
                                  }
                                } catch (error) {
                                  toast.error('Failed to fetch holiday')
                                }
                              }}
                            >
                              <Icon icon='tabler:eye' />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title='Edit'>
                            <IconButton
                              size='small'
                              onClick={() => {
                                setEditData(row)
                                setDrawerOpen(true)
                              }}
                            >
                              <Icon icon='tabler:pencil' />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title='Delete'>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() =>
                                setDeleteModal({
                                  open: true,
                                  data: row
                                })
                              }
                            >
                              <Icon icon='tabler:trash' />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Drawer */}
      <HolidayDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editData={editData}
        onSuccess={handleSuccess}
      />

      {/* Delete Dialog */}
      <Dialog
        open={deleteModal.open}
        onClose={() =>
          setDeleteModal({
            open: false,
            data: null
          })
        }
      >
        <DialogTitle>Delete Holiday</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>{deleteModal?.data?.name}</strong>?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            variant='tonal'
            onClick={() =>
              setDeleteModal({
                open: false,
                data: null
              })
            }
          >
            Cancel
          </Button>

          <Button
            color='error'
            variant='contained'
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TabHolidayCalendar