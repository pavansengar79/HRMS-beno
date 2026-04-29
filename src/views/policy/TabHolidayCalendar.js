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
import Checkbox from '@mui/material/Checkbox'
import Drawer from '@mui/material/Drawer'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** API

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKEND_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const defaultHoliday = { date: '', name: '', type: 'public', isPaid: true }

const defaultValues = {
    name: '',
    location: '',
    weeklyOff: ['Sat', 'Sun'],
    holidays: []
}

// ─── Holiday Calendar Drawer ──────────────────────────────────────────────────

const HolidayCalendarDrawer = ({ open, onClose, editData, onSuccess }) => {
    const [saving, setSaving] = useState(false)
    const isEdit = Boolean(editData?._id)

    const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues })
    const { fields, append, remove } = useFieldArray({ control, name: 'holidays' })

    useEffect(() => {
        if (open) reset(editData ? { ...defaultValues, ...editData } : defaultValues)
    }, [open, editData])

    const onSubmit = async (data) => {
        setSaving(true)
        try {
            const res = isEdit
                ? await axiosRequest.put(`/holiday/calendars/${editData._id}`, data)
                : await axiosRequest.post('/holiday/calendars', data)

            if (res.data?.success) {
                toast.success(`Holiday calendar ${isEdit ? 'updated' : 'created'}`)
                onSuccess(res.data.data, isEdit)
                onClose()
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Drawer open={open} anchor='right' onClose={onClose}
            PaperProps={{ sx: { width: { xs: '100%', sm: 680 } } }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 5, py: 4, borderBottom: t => `1px solid ${t.palette.divider}` }}>
                <Typography variant='h6'>{isEdit ? 'Edit Holiday Calendar' : 'New Holiday Calendar'}</Typography>
                <IconButton onClick={onClose} size='small'><Icon icon='tabler:x' /></IconButton>
            </Box>

            <Box component='form' onSubmit={handleSubmit(onSubmit)}
                sx={{ px: 5, py: 4, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}
            >
                {/* Calendar Meta */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Calendar Details</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6}>
                            <Controller name='name' control={control} rules={{ required: 'Calendar name required' }}
                                render={({ field }) => (
                                    <CustomTextField {...field} fullWidth label='Calendar Name *' error={!!errors.name} helperText={errors.name?.message} />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller name='location' control={control}
                                render={({ field }) => (
                                    <CustomTextField {...field} fullWidth label='Location / Region' placeholder='e.g. Maharashtra, Karnataka' />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* Weekly Off */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 2 }}>Weekly Off</Typography>
                    <Controller name='weeklyOff' control={control}
                        render={({ field }) => (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {WEEKEND_DAYS.map(day => (
                                    <FormControlLabel key={day} label={day}
                                        control={
                                            <Checkbox checked={field.value?.includes(day)}
                                                onChange={e => {
                                                    const cur = field.value || []
                                                    field.onChange(e.target.checked ? [...cur, day] : cur.filter(d => d !== day))
                                                }}
                                            />
                                        }
                                    />
                                ))}
                            </Box>
                        )}
                    />
                </Box>

                <Divider />

                {/* Holidays List */}
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant='overline' color='text.secondary'>Holidays ({fields.length})</Typography>
                        <Button size='small' variant='tonal' startIcon={<Icon icon='tabler:plus' />}
                            onClick={() => append({ ...defaultHoliday })}
                        >
                            Add Holiday
                        </Button>
                    </Box>

                    {fields.length === 0 ? (
                        <Alert severity='info' sx={{ mb: 2 }}>No holidays added yet.</Alert>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {fields.map((field, index) => (
                                <Box key={field.id} sx={{
                                    p: 3, border: t => `1px solid ${t.palette.divider}`,
                                    borderRadius: 2, display: 'flex', gap: 3, alignItems: 'flex-end', flexWrap: 'wrap'
                                }}>
                                    <Grid container spacing={3} sx={{ flex: 1 }}>
                                        <Grid item xs={12} sm={5}>
                                            <Controller name={`holidays.${index}.name`} control={control}
                                                rules={{ required: 'Name required' }}
                                                render={({ field, fieldState }) => (
                                                    <CustomTextField {...field} fullWidth label='Holiday Name *'
                                                        placeholder='e.g. Republic Day'
                                                        error={!!fieldState.error} helperText={fieldState.error?.message}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Controller name={`holidays.${index}.date`} control={control}
                                                rules={{ required: 'Date required' }}
                                                render={({ field, fieldState }) => (
                                                    <CustomTextField {...field} fullWidth type='date' label='Date *'
                                                        InputLabelProps={{ shrink: true }}
                                                        error={!!fieldState.error} helperText={fieldState.error?.message}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Controller name={`holidays.${index}.type`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} select fullWidth label='Type'>
                                                        <MenuItem value='public'>Public</MenuItem>
                                                        <MenuItem value='optional'>Optional</MenuItem>
                                                    </CustomTextField>
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Controller name={`holidays.${index}.isPaid`} control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                                                        label='Paid'
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                    <IconButton color='error' size='small' onClick={() => remove(index)}>
                                        <Icon icon='tabler:trash' fontSize='1rem' />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Footer */}
                <Box sx={{ mt: 'auto', pt: 4, display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                    <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button type='submit' variant='contained' disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}
                    >
                        {saving ? 'Saving...' : isEdit ? 'Update Calendar' : 'Create Calendar'}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    )
}

// ─── TabHolidayCalendar ───────────────────────────────────────────────────────

const TabHolidayCalendar = () => {
    const [calendars, setCalendars] = useState([])
    const [loading, setLoading] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [expandedId, setExpandedId] = useState(null)

    const fetchCalendars = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axiosRequest.get('/holiday/calendars')
            if (res.data?.success) setCalendars(res.data.data)
        } catch {
            toast.error('Failed to load holiday calendars')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchCalendars() }, [fetchCalendars])

    const handleSuccess = (record, isEdit) => {
        setCalendars(prev =>
            isEdit ? prev.map(c => (c._id === record._id ? record : c)) : [...prev, record]
        )
    }

    return (
        <Card>
            <CardHeader
                title='Holiday Calendars'
                subheader='Define public and optional holidays per location or region'
                action={
                    <Button variant='contained' startIcon={<Icon icon='tabler:plus' />}
                        onClick={() => { setEditData(null); setDrawerOpen(true) }}
                    >
                        New Calendar
                    </Button>
                }
            />
            <Divider />
            <CardContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
                ) : calendars.length === 0 ? (
                    <Alert severity='info'>No holiday calendars yet. Create your first one.</Alert>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {calendars.map(cal => (
                            <Box key={cal._id} sx={{ border: t => `1px solid ${t.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                {/* Calendar header */}
                                <Box sx={{
                                    px: 4, py: 3,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    backgroundColor: t => t.palette.action.hover, flexWrap: 'wrap', gap: 2
                                }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography fontWeight={600}>{cal.name}</Typography>
                                            {cal.location && <Chip label={cal.location} size='small' variant='tonal' />}
                                        </Box>
                                        <Typography variant='caption' color='text.secondary'>
                                            {cal.holidays?.length || 0} holidays · Weekly off: {cal.weeklyOff?.join(', ')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button size='small' variant='tonal'
                                            onClick={() => setExpandedId(expandedId === cal._id ? null : cal._id)}
                                            endIcon={<Icon icon={expandedId === cal._id ? 'tabler:chevron-up' : 'tabler:chevron-down'} />}
                                        >
                                            {expandedId === cal._id ? 'Hide' : 'View Holidays'}
                                        </Button>
                                        <Tooltip title='Edit'>
                                            <IconButton size='small' onClick={() => { setEditData(cal); setDrawerOpen(true) }}>
                                                <Icon icon='tabler:pencil' fontSize='1.1rem' />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                {/* Holiday list (expandable) */}
                                {expandedId === cal._id && cal.holidays?.length > 0 && (
                                    <TableContainer>
                                        <Table size='small'>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Type</TableCell>
                                                    <TableCell>Paid</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {cal.holidays.map((h, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>{h.date ? new Date(h.date).toLocaleDateString('en-IN') : '—'}</TableCell>
                                                        <TableCell>{h.name}</TableCell>
                                                        <TableCell>
                                                            <Chip label={h.type} size='small'
                                                                color={h.type === 'public' ? 'primary' : 'default'} variant='tonal'
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip label={h.isPaid ? 'Paid' : 'Unpaid'} size='small'
                                                                color={h.isPaid ? 'success' : 'error'} variant='tonal'
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>

            <HolidayCalendarDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                editData={editData}
                onSuccess={handleSuccess}
            />
        </Card>
    )
}

export default TabHolidayCalendar