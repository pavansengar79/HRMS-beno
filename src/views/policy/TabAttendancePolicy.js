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

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** API

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const defaultValues = {
    name: '',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    shift: { startTime: '09:00', endTime: '18:00', graceMinutes: 15, breakDuration: 60 },
    lateMarkRule: {
        enabled: true,
        thresholdMinutes: 15,
        maxAllowedPerMonth: 3,
        penalty: { type: 'leave', value: 0.5 }
    },
    halfDayRule: { minHours: 4, maxHours: 6 },
    sandwichRule: { enabled: true, includeWeekends: false, includeHolidays: false },
    overtimeRule: { enabled: false, minHours: 1, multiplier: 1.5 }
}

// ─── Attendance Policy Drawer ─────────────────────────────────────────────────

const AttendancePolicyDrawer = ({ open, onClose, editData, onSuccess }) => {
    const [saving, setSaving] = useState(false)
    const isEdit = Boolean(editData?._id)

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues })

    const lateMarkEnabled = watch('lateMarkRule.enabled')
    const overtimeEnabled = watch('overtimeRule.enabled')
    const sandwichEnabled = watch('sandwichRule.enabled')

    useEffect(() => {
        if (open) reset(editData ? { ...defaultValues, ...editData } : defaultValues)
    }, [open, editData])

    const onSubmit = async (data) => {
        setSaving(true)
        try {
            const payload = {
                ...data,
                shift: {
                    ...data.shift,
                    graceMinutes: Number(data.shift.graceMinutes),
                    breakDuration: Number(data.shift.breakDuration)
                },
                lateMarkRule: {
                    ...data.lateMarkRule,
                    thresholdMinutes: Number(data.lateMarkRule.thresholdMinutes),
                    maxAllowedPerMonth: Number(data.lateMarkRule.maxAllowedPerMonth),
                    penalty: { ...data.lateMarkRule.penalty, value: Number(data.lateMarkRule.penalty.value) }
                },
                halfDayRule: {
                    minHours: Number(data.halfDayRule.minHours),
                    maxHours: Number(data.halfDayRule.maxHours)
                },
                overtimeRule: {
                    ...data.overtimeRule,
                    minHours: Number(data.overtimeRule.minHours),
                    multiplier: Number(data.overtimeRule.multiplier)
                }
            }

            const res = isEdit
                ? await axiosRequest.put(`/attendance/policies/${editData._id}`, payload)
                : await axiosRequest.post('/attendance/policies', payload)

            if (res.data?.success) {
                toast.success(`Attendance policy ${isEdit ? 'updated' : 'created'}`)
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
            PaperProps={{ sx: { width: { xs: '100%', sm: 600 } } }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 5, py: 4, borderBottom: t => `1px solid ${t.palette.divider}` }}>
                <Typography variant='h6'>{isEdit ? 'Edit Attendance Policy' : 'New Attendance Policy'}</Typography>
                <IconButton onClick={onClose} size='small'><Icon icon='tabler:x' /></IconButton>
            </Box>

            <Box component='form' onSubmit={handleSubmit(onSubmit)}
                sx={{ px: 5, py: 4, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}
            >
                {/* Policy Name */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Policy Details</Typography>
                    <Controller name='name' control={control} rules={{ required: 'Name required' }}
                        render={({ field }) => (
                            <CustomTextField {...field} fullWidth label='Policy Name *' error={!!errors.name} helperText={errors.name?.message} />
                        )}
                    />
                </Box>

                <Divider />

                {/* Working Days */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 2 }}>Working Days</Typography>
                    <Controller name='workingDays' control={control}
                        render={({ field }) => (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {DAYS_OF_WEEK.map(day => (
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

                {/* Shift */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Shift Timings</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={6}>
                            <Controller name='shift.startTime' control={control}
                                render={({ field }) => <CustomTextField {...field} fullWidth type='time' label='Start Time' InputLabelProps={{ shrink: true }} />}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller name='shift.endTime' control={control}
                                render={({ field }) => <CustomTextField {...field} fullWidth type='time' label='End Time' InputLabelProps={{ shrink: true }} />}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller name='shift.graceMinutes' control={control}
                                render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Grace (min)' />}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller name='shift.breakDuration' control={control}
                                render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Break Duration (min)' />}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* Late Mark */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Late Mark Rule</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Controller name='lateMarkRule.enabled' control={control}
                                render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable Late Mark' />
                                )}
                            />
                        </Grid>
                        {lateMarkEnabled && (
                            <>
                                <Grid item xs={6}>
                                    <Controller name='lateMarkRule.thresholdMinutes' control={control}
                                        render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Late After (min)' />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller name='lateMarkRule.maxAllowedPerMonth' control={control}
                                        render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Max Allowed / Month' />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller name='lateMarkRule.penalty.type' control={control}
                                        render={({ field }) => (
                                            <CustomTextField {...field} select fullWidth label='Penalty Type'>
                                                <MenuItem value='leave'>Deduct Leave</MenuItem>
                                                <MenuItem value='salary'>Deduct Salary</MenuItem>
                                            </CustomTextField>
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller name='lateMarkRule.penalty.value' control={control}
                                        render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Penalty Value' />}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Box>

                <Divider />

                {/* Half Day */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Half Day Rule</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={6}>
                            <Controller name='halfDayRule.minHours' control={control}
                                render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Min Hours' />}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller name='halfDayRule.maxHours' control={control}
                                render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Max Hours' />}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* Sandwich */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 2 }}>Sandwich Rule</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Controller name='sandwichRule.enabled' control={control}
                                render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable Sandwich Rule' />
                                )}
                            />
                        </Grid>
                        {sandwichEnabled && (
                            <>
                                <Grid item xs={6}>
                                    <Controller name='sandwichRule.includeWeekends' control={control}
                                        render={({ field }) => (
                                            <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Include Weekends' />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller name='sandwichRule.includeHolidays' control={control}
                                        render={({ field }) => (
                                            <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Include Holidays' />
                                        )}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Box>

                <Divider />

                {/* Overtime */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Overtime Rule</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Controller name='overtimeRule.enabled' control={control}
                                render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable Overtime' />
                                )}
                            />
                        </Grid>
                        {overtimeEnabled && (
                            <>
                                <Grid item xs={6}>
                                    <Controller name='overtimeRule.minHours' control={control}
                                        render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Min OT Hours' />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller name='overtimeRule.multiplier' control={control}
                                        render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Pay Multiplier' placeholder='1.5' />}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Box>

                {/* Footer */}
                <Box sx={{ mt: 'auto', pt: 4, display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                    <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button type='submit' variant='contained' disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}
                    >
                        {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    )
}

// ─── TabAttendancePolicy ──────────────────────────────────────────────────────

const TabAttendancePolicy = () => {
    const [policies, setPolicies] = useState([])
    const [loading, setLoading] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editData, setEditData] = useState(null)

    const fetchPolicies = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axiosRequest.get('/attendance/policies')
            if (res.data?.success) setPolicies(res.data.data)
        } catch {
            toast.error('Failed to load attendance policies')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchPolicies() }, [fetchPolicies])

    const handleSuccess = (record, isEdit) => {
        setPolicies(prev =>
            isEdit ? prev.map(p => (p._id === record._id ? record : p)) : [...prev, record]
        )
    }

    return (
        <Card>
            <CardHeader
                title='Attendance Policies'
                subheader='Configure shift timings, late marks, half-day and overtime rules'
                action={
                    <Button variant='contained' startIcon={<Icon icon='tabler:plus' />}
                        onClick={() => { setEditData(null); setDrawerOpen(true) }}
                    >
                        New Policy
                    </Button>
                }
            />
            <Divider />
            <CardContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
                ) : policies.length === 0 ? (
                    <Alert severity='info'>No attendance policies yet. Create your first one.</Alert>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {policies.map(policy => (
                            <Box key={policy._id} sx={{
                                p: 4, border: t => `1px solid ${t.palette.divider}`, borderRadius: 2,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2
                            }}>
                                <Box>
                                    <Typography fontWeight={600} sx={{ mb: 0.5 }}>{policy.name}</Typography>
                                    <Typography variant='caption' color='text.secondary'>
                                        {policy.shift?.startTime} – {policy.shift?.endTime} ·{' '}
                                        {policy.workingDays?.join(', ')} ·{' '}
                                        Grace: {policy.shift?.graceMinutes}min
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        {policy.lateMarkRule?.enabled && <Chip label='Late Mark' size='small' color='warning' variant='tonal' />}
                                        {policy.sandwichRule?.enabled && <Chip label='Sandwich' size='small' color='info' variant='tonal' />}
                                        {policy.overtimeRule?.enabled && <Chip label='Overtime' size='small' color='success' variant='tonal' />}
                                    </Box>
                                </Box>
                                <Tooltip title='Edit'>
                                    <IconButton size='small' onClick={() => { setEditData(policy); setDrawerOpen(true) }}>
                                        <Icon icon='tabler:pencil' fontSize='1.1rem' />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>

            <AttendancePolicyDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                editData={editData}
                onSuccess={handleSuccess}
            />
        </Card>
    )
}

export default TabAttendancePolicy