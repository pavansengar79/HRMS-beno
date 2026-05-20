// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import { styled, useTheme } from '@mui/material/styles'
import MuiStep from '@mui/material/Step'
import MuiStepper from '@mui/material/Stepper'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'

// ** Util
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import StepperWrapper from 'src/@core/styles/mui/stepper'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** API — uses your project's custom axios instance

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
    { value: 'ALL', label: 'All' },
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' }
]

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']

const COLOR_PRESETS = [
    '#10B981', '#4F46E5', '#F59E0B', '#EF4444',
    '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
    '#F97316', '#6B7280'
]

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const REGULARISATION_OPTIONS = [
    { value: 'late', label: 'Late Arrival' },
    { value: 'absent', label: 'Absent' },
    { value: 'missed_punch', label: 'Missed Punch' },
    { value: 'early_exit', label: 'Early Exit' }
]

// ─── Stepper config ───────────────────────────────────────────────────────────

const steps = [
    { title: 'Leave Types', icon: 'tabler:calendar-off', subtitle: 'Configure leave policies' },
    { title: 'Attendance', icon: 'tabler:clock', subtitle: 'Shift & attendance rules' },
    { title: 'Payroll', icon: 'tabler:cash', subtitle: 'Salary & LOP settings' },
    { title: 'Regularisation', icon: 'tabler:refresh', subtitle: 'Request & approval rules' }
]

// ─── Styled ───────────────────────────────────────────────────────────────────

const StepperEl = styled(MuiStepper)(({ theme }) => ({
    height: '100%',
    minWidth: '15rem',
    '& .MuiStep-root:not(:last-of-type) .MuiStepLabel-root': { paddingBottom: theme.spacing(5) },
    [theme.breakpoints.down('md')]: { minWidth: 0 }
}))

const StepperHeaderContainer = styled(CardContent)(({ theme }) => ({
    borderRight: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('md')]: { borderRight: 0, borderBottom: `1px solid ${theme.palette.divider}` }
}))

const StepEl = styled(MuiStep)(({ theme }) => ({
    '& .MuiStepLabel-root': { paddingTop: 0 },
    '&:not(:last-of-type) .MuiStepLabel-root': { paddingBottom: theme.spacing(6) },
    '&:last-of-type .MuiStepLabel-root': { paddingBottom: 0 },
    '& .MuiStepLabel-iconContainer': { display: 'none' },
    '& .step-subtitle': { color: `${theme.palette.text.disabled} !important` },
    '& + svg': { color: theme.palette.text.disabled },
    '&.Mui-completed .step-title': { color: theme.palette.text.disabled },
    '& .MuiStepLabel-label': { cursor: 'pointer' }
}))

// ─── Default values for Leave Type drawer form ────────────────────────────────
// Maps 1:1 to the backend response shape.
// Required by API: name, code, accrualRatePerMonth, carryForwardLimit, isPaid, colorCode, defaultDaysPerYear, isCarryForwardAllowed
// All others are optional (required: false in form rules)

const defaultLeaveTypeValues = {
    name: '',
    code: '',
    defaultDaysPerYear: 0,
    accrualRatePerMonth: 0,
    isPaid: true,
    colorCode: '#10B981',
    isCarryForwardAllowed: false,
    carryForwardLimit: 0,
    isEncashmentAllowed: false,
    isHalfDayAllowed: true,
    isSandwichApplicable: false,
    minNoticeDays: 0,
    maxConsecutiveDays: '',          // backend: null — send '' → convert to null
    applicableGender: 'ALL',
    applicableEmploymentTypes: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'],
    requiresDocumentAfterDays: '',   // backend: null — send '' → convert to null
    isActive: true
}


const predefinedLeaveTypes = [
  {
    name: "Annual Leave",
    code: "AL",
  },
  {
    name: "Sick Leave",
    code: "SL",
  },
  {
    name: "Casual Leave",
    code: "CL",
  },
  {
    name: "Maternity Leave",
    code: "ML",
  },
  {
    name: "Paternity Leave",
    code: "PL",
  },
  {
    name: "Loss of Pay",
    code: "LOP",
  },
  {
    name: "Compensatory Off",
    code: "COMP",
  },
]

// ─── Leave Type Drawer ────────────────────────────────────────────────────────

const LeaveTypeDrawer = ({ open, onClose, editData, onSuccess }) => {
    const [saving, setSaving] = useState(false)
    const isEdit = Boolean(editData?._id)

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm({ defaultValues: defaultLeaveTypeValues })

    const carryForwardAllowed = watch('isCarryForwardAllowed')
    const selectedColor = watch('colorCode')

    // Populate form on open
    useEffect(() => {
        if (open) {
            if (editData) {
                reset({
                    ...defaultLeaveTypeValues,
                    ...editData,
                    maxConsecutiveDays: editData.maxConsecutiveDays ?? '',
                    requiresDocumentAfterDays: editData.requiresDocumentAfterDays ?? '',
                    applicableEmploymentTypes: editData.applicableEmploymentTypes ?? ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']
                })
            } else {
                reset(defaultLeaveTypeValues)
            }
        }
    }, [open, editData])

    const buildPayload = (data) => ({
        // Required
        name: data.name,
        code: data.code,
        accrualRatePerMonth: Number(data.accrualRatePerMonth),
        carryForwardLimit: Number(data.carryForwardLimit),
        isPaid: data.isPaid,
        colorCode: data.colorCode,
        defaultDaysPerYear: Number(data.defaultDaysPerYear),
        isCarryForwardAllowed: data.isCarryForwardAllowed,
        // Optional
        isEncashmentAllowed: data.isEncashmentAllowed,
        isHalfDayAllowed: data.isHalfDayAllowed,
        isSandwichApplicable: data.isSandwichApplicable,
        minNoticeDays: Number(data.minNoticeDays),
        maxConsecutiveDays: data.maxConsecutiveDays === '' ? null : Number(data.maxConsecutiveDays),
        applicableGender: data.applicableGender,
        applicableEmploymentTypes: data.applicableEmploymentTypes,
        requiresDocumentAfterDays: data.requiresDocumentAfterDays === '' ? null : Number(data.requiresDocumentAfterDays),
        isActive: data.isActive
    })

    const onSubmit = async (data) => {
        setSaving(true)
        try {
            const payload = buildPayload(data)
            const res = isEdit
                ? await axiosRequest.put(`/api/v1/leave/types/${editData._id}`, payload)
                : await axiosRequest.post('/api/v1/leave/types', payload)

            if (res.data?.success) {
                toast.success(`Leave type ${isEdit ? 'updated' : 'created'} successfully`)
                onSuccess(res.data.data, isEdit)
                onClose()
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Drawer
            open={open}
            anchor='right'
            onClose={onClose}
            PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}
        >
            {/* Drawer Header */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 5, py: 4, borderBottom: theme => `1px solid ${theme.palette.divider}`
            }}>
                <Typography variant='h6'>{isEdit ? 'Edit Leave Type' : 'Add Leave Type'}</Typography>
                <IconButton onClick={onClose} size='small'>
                    <Icon icon='tabler:x' />
                </IconButton>
            </Box>

            {/* Drawer Body */}
            <Box
                component='form'
                onSubmit={handleSubmit(onSubmit)}
                sx={{ px: 5, py: 4, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}
            >

                {/* ── Basic Info ───────────────────── */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
                        Basic Info
                    </Typography>
                   <Grid item xs={12} sm={8}>
    <Controller
        name='name'
        control={control}
        rules={{ required: 'Leave type name is required' }}
        render={({ field }) => (
            <CustomTextField
                select
                fullWidth
                label='Leave Type Name *'
                value={field.value}
                onChange={e => {
                    const selected = predefinedLeaveTypes.find(
                        item => item.name === e.target.value
                    )

                    field.onChange(e.target.value)

                    if (selected) {
                        setValue('code', selected.code)
                    }
                }}
                error={!!errors.name}
                helperText={errors.name?.message}
            >
                <MenuItem value=''>
                    Select Leave Type
                </MenuItem>

                {predefinedLeaveTypes.map(item => (
                    <MenuItem key={item.code} value={item.name}>
                        {item.name}
                    </MenuItem>
                ))}
            </CustomTextField>
        )}
    />
</Grid>

<Grid item xs={12} sm={4}>
    <Controller
        name='code'
        control={control}
        rules={{ required: 'Code is required' }}
        render={({ field }) => (
            <CustomTextField
                {...field}
                fullWidth
                label='Code *'
                placeholder='EL'
                disabled
                error={!!errors.code}
                helperText={errors.code?.message}
            />
        )}
    />
</Grid>
                </Box>

                <Divider />

                {/* ── Credit & Days ────────────────── */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
                        Credit & Days
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='defaultDaysPerYear'
                                control={control}
                                rules={{ required: 'Required' }}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        type='number'
                                        label='Default Days / Year *'
                                        error={!!errors.defaultDaysPerYear}
                                        helperText={errors.defaultDaysPerYear?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='accrualRatePerMonth'
                                control={control}
                                rules={{ required: 'Required' }}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        type='number'
                                        label='Accrual Rate / Month *'
                                        placeholder='1.25'
                                        error={!!errors.accrualRatePerMonth}
                                        helperText={errors.accrualRatePerMonth?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='minNoticeDays'
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField {...field} fullWidth type='number' label='Min Notice Days' />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='maxConsecutiveDays'
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        type='number'
                                        label='Max Consecutive Days'
                                        placeholder='Leave blank for no limit'
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* ── Carry Forward ────────────────── */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
                        Carry Forward
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Controller
                                name='isCarryForwardAllowed'
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                                        label='Allow Carry Forward'
                                    />
                                )}
                            />
                        </Grid>
                        {carryForwardAllowed && (
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name='carryForwardLimit'
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField {...field} fullWidth type='number' label='Carry Forward Limit (Days)' />
                                    )}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Box>

                <Divider />

                {/* ── Document Rule ────────────────── */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
                        Document Rule
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name='requiresDocumentAfterDays'
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        type='number'
                                        label='Requires Document After (Days)'
                                        placeholder='Leave blank if not required'
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* ── Toggles ──────────────────────── */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
                        Rules & Flags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {[
                            { name: 'isPaid', label: 'Paid Leave' },
                            { name: 'isEncashmentAllowed', label: 'Allow Encashment' },
                            { name: 'isHalfDayAllowed', label: 'Allow Half Day' },
                            { name: 'isSandwichApplicable', label: 'Sandwich Rule' },
                            { name: 'isActive', label: 'Active' }
                        ].map(sw => (
                            <Controller
                                key={sw.name}
                                name={sw.name}
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                                        label={sw.label}
                                    />
                                )}
                            />
                        ))}
                    </Box>
                </Box>

                <Divider />

                {/* ── Applicability ────────────────── */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
                        Applicability
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Controller
                                name='applicableGender'
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField {...field} select fullWidth label='Applicable Gender'>
                                        {GENDER_OPTIONS.map(g => (
                                            <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                                        ))}
                                    </CustomTextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                                Applicable Employment Types
                            </Typography>
                            <Controller
                                name='applicableEmploymentTypes'
                                control={control}
                                render={({ field }) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {EMPLOYMENT_TYPES.map(type => {
                                            const checked = field.value?.includes(type)
                                            return (
                                                <Chip
                                                    key={type}
                                                    label={type.replace('_', ' ')}
                                                    clickable
                                                    size='small'
                                                    color={checked ? 'primary' : 'default'}
                                                    variant={checked ? 'filled' : 'outlined'}
                                                    onClick={() => {
                                                        const cur = field.value || []
                                                        field.onChange(checked ? cur.filter(t => t !== type) : [...cur, type])
                                                    }}
                                                />
                                            )
                                        })}
                                    </Box>
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* ── Footer ───────────────────────── */}
                <Box sx={{ mt: 'auto', pt: 4, display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                    <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        variant='contained'
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}
                    >
                        {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    )
}

// ─── Step 1: Leave Types (API driven) ─────────────────────────────────────────

const StepLeaveTypes = () => {
    const [leaveTypes, setLeaveTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editData, setEditData] = useState(null)

    // GET /leave/types
    const fetchLeaveTypes = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axiosRequest.get('/api/v1/leave/types')
            console.log('Leave types:', res)
            if (res?.success) {
                setLeaveTypes(res.data)
            }
        } catch {
            toast.error('Failed to load leave types')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchLeaveTypes() }, [fetchLeaveTypes])

    // Drawer callbacks
    const handleSuccess = (record, isEdit) => {
        setLeaveTypes(prev =>
            isEdit ? prev.map(lt => (lt._id === record._id ? record : lt)) : [...prev, record]
        )
    }
    const openAdd = () => { setEditData(null); setDrawerOpen(true) }
    const openEdit = (lt) => { setEditData(lt); setDrawerOpen(true) }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant='h6'>Leave Types</Typography>
                <Button variant='contained' size='small' startIcon={<Icon icon='tabler:plus' />} onClick={openAdd}>
                    Add Leave Type
                </Button>
            </Box>

            {/* List */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : leaveTypes.length === 0 ? (
                <Alert severity='info'>
                    No leave types configured yet. Click "Add Leave Type" to get started.
                </Alert>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {leaveTypes.map((lt) => (
                        <Card
                            key={lt._id}
                            variant='outlined'
                            sx={{ borderRadius: 2, borderLeft: `4px solid ${lt.colorCode || '#6B7280'}` }}
                        >
                            <CardContent sx={{ py: '12px !important', px: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>

                                    {/* Name + code block */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <Box sx={{
                                            width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
                                            backgroundColor: lt.colorCode || '#6B7280',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Typography variant='caption' fontWeight={700} color='white'>
                                                {lt.code}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography fontWeight={600}>{lt.name}</Typography>
                                            <Typography variant='caption' color='text.secondary'>
                                                {lt.defaultDaysPerYear} days/yr · {lt.accrualRatePerMonth}/mo accrual
                                                {lt.isCarryForwardAllowed && ` · CF: ${lt.carryForwardLimit}`}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Flags */}
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip label={lt.isPaid ? 'Paid' : 'Unpaid'} size='small' color={lt.isPaid ? 'success' : 'error'} variant='tonal' />
                                        {lt.isCarryForwardAllowed && <Chip label='Carry Fwd' size='small' color='primary' variant='tonal' />}
                                        {lt.isEncashmentAllowed && <Chip label='Encashable' size='small' color='warning' variant='tonal' />}
                                        {lt.isHalfDayAllowed && <Chip label='Half Day' size='small' variant='tonal' />}
                                        {lt.isSandwichApplicable && <Chip label='Sandwich' size='small' variant='tonal' />}
                                        {lt.applicableGender !== 'ALL' && (
                                            <Chip label={lt.applicableGender} size='small' color='secondary' variant='tonal' />
                                        )}
                                        {!lt.isActive && <Chip label='Inactive' size='small' color='default' />}
                                    </Box>

                                    {/* Actions */}
                                    <Tooltip title='Edit'>
                                        <IconButton size='small' onClick={() => openEdit(lt)}>
                                            <Icon icon='tabler:pencil' fontSize='1.1rem' />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            <LeaveTypeDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                editData={editData}
                onSuccess={handleSuccess}
            />
        </Box>
    )
}

// ─── Step 2: Attendance ───────────────────────────────────────────────────────

const StepAttendance = ({ control, watch }) => {
    const lateMarkEnabled = watch('attendanceRules.lateMark.enabled')

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 2 }}>
                    Working Days
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Controller name='attendanceRules.workingDays' control={control}
                        render={({ field }) => (
                            <>
                                {DAYS_OF_WEEK.map(day => (
                                    <FormControlLabel key={day} label={day}
                                        control={
                                            <Checkbox
                                                checked={field.value?.includes(day)}
                                                onChange={e => {
                                                    const cur = field.value || []
                                                    field.onChange(e.target.checked ? [...cur, day] : cur.filter(d => d !== day))
                                                }}
                                            />
                                        }
                                    />
                                ))}
                            </>
                        )}
                    />
                </Box>
            </Grid>

            <Grid item xs={12}><Divider /></Grid>

            <Grid item xs={12}>
                <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Shift Timings</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Controller name='attendanceRules.shift.start' control={control}
                    render={({ field }) => (
                        <CustomTextField {...field} fullWidth type='time' label='Shift Start' InputLabelProps={{ shrink: true }} />
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <Controller name='attendanceRules.shift.end' control={control}
                    render={({ field }) => (
                        <CustomTextField {...field} fullWidth type='time' label='Shift End' InputLabelProps={{ shrink: true }} />
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <Controller name='attendanceRules.shift.graceMinutes' control={control}
                    render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Grace Period (min)' />}
                />
            </Grid>

            <Grid item xs={12}><Divider /></Grid>

            <Grid item xs={12}>
                <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Late Mark</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Controller name='attendanceRules.lateMark.enabled' control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                            label='Enable Late Mark'
                        />
                    )}
                />
            </Grid>
            {lateMarkEnabled && (
                <>
                    <Grid item xs={12} sm={4}>
                        <Controller name='attendanceRules.lateMark.countAfterMinutes' control={control}
                            render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Mark Late After (min)' />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Controller name='attendanceRules.lateMark.penaltyType' control={control}
                            render={({ field }) => (
                                <CustomTextField {...field} select fullWidth label='Penalty Type'>
                                    <MenuItem value='leave'>Deduct Leave</MenuItem>
                                    <MenuItem value='lop'>Loss of Pay</MenuItem>
                                    <MenuItem value='none'>No Penalty</MenuItem>
                                </CustomTextField>
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Controller name='attendanceRules.lateMark.penaltyValue' control={control}
                            render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Penalty Value (days)' />}
                        />
                    </Grid>
                </>
            )}

            <Grid item xs={12}><Divider /></Grid>

            <Grid item xs={12}>
                <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Half Day & Other</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Controller name='attendanceRules.halfDay.minHours' control={control}
                    render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Min Hours for Half Day' />}
                />
            </Grid>
            <Grid item xs={12} sm={8} sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                {[
                    { name: 'attendanceRules.sandwichRule', label: 'Sandwich Rule' },
                    { name: 'attendanceRules.includeHolidays', label: 'Include Holidays' },
                    { name: 'attendanceRules.includeWeekends', label: 'Include Weekends' }
                ].map(sw => (
                    <Controller key={sw.name} name={sw.name} control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                                label={sw.label}
                            />
                        )}
                    />
                ))}
            </Grid>
        </Grid>
    )
}

// ─── Step 3: Payroll ──────────────────────────────────────────────────────────

const StepPayroll = ({ control, watch }) => {
    const lopEnabled = watch('payrollRules.lop.enabled')

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Salary Cycle</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Controller name='payrollRules.salaryCycle.type' control={control}
                    render={({ field }) => (
                        <CustomTextField {...field} select fullWidth label='Cycle Type'>
                            <MenuItem value='monthly'>Monthly</MenuItem>
                            <MenuItem value='weekly'>Weekly</MenuItem>
                            <MenuItem value='biweekly'>Bi-Weekly</MenuItem>
                        </CustomTextField>
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <Controller name='payrollRules.salaryCycle.startDay' control={control}
                    render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Cycle Start Day' />}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <Controller name='payrollRules.salaryCycle.endDay' control={control}
                    render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Cycle End Day' />}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <Controller name='payrollRules.salaryDate' control={control}
                    render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Salary Disbursement Date' />}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <Controller name='payrollRules.payrollRunDate' control={control}
                    render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Payroll Run Date' />}
                />
            </Grid>

            <Grid item xs={12}><Divider /></Grid>

            <Grid item xs={12}>
                <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Loss of Pay (LOP)</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Controller name='payrollRules.lop.enabled' control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                            label='Enable LOP'
                        />
                    )}
                />
            </Grid>
            {lopEnabled && (
                <Grid item xs={12} sm={6}>
                    <Controller name='payrollRules.lop.calculation' control={control}
                        render={({ field }) => (
                            <CustomTextField {...field} select fullWidth label='Calculation Method'>
                                <MenuItem value='per_day'>Per Day</MenuItem>
                                <MenuItem value='calendar_days'>Calendar Days</MenuItem>
                                <MenuItem value='working_days'>Working Days</MenuItem>
                            </CustomTextField>
                        )}
                    />
                </Grid>
            )}

            <Grid item xs={12}><Divider /></Grid>

            <Grid item xs={12}>
                <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 1 }}>Leave Deduction Priority</Typography>
                <Typography variant='caption' color='text.disabled'>Comma-separated codes in priority order</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Controller name='payrollRules.leaveDeductionPriority' control={control}
                    render={({ field }) => (
                        <CustomTextField
                            fullWidth
                            label='Priority Codes'
                            value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                            onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            placeholder='CL, SL, EL, LWP'
                        />
                    )}
                />
            </Grid>

            <Grid item xs={12}><Divider /></Grid>

            <Grid item xs={12}>
                <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Unpaid Leave</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Controller name='payrollRules.unpaidLeave.code' control={control}
                    render={({ field }) => <CustomTextField {...field} fullWidth label='Unpaid Leave Code' placeholder='LWP' />}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <Controller name='payrollRules.unpaidLeave.autoAssign' control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                            label='Auto-Assign Unpaid Leave'
                        />
                    )}
                />
            </Grid>
        </Grid>
    )
}

// ─── Step 4: Regularisation ───────────────────────────────────────────────────

const StepRegularisation = ({ control, watch }) => {
    const enabled = watch('regularisationRules.enabled')

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Controller name='regularisationRules.enabled' control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                            label='Enable Regularisation Requests'
                        />
                    )}
                />
            </Grid>

            {enabled && (
                <>
                    <Grid item xs={12} sm={6}>
                        <Controller name='regularisationRules.maxRequestsPerMonth' control={control}
                            render={({ field }) => (
                                <CustomTextField {...field} fullWidth type='number' label='Max Requests Per Month' />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Controller name='regularisationRules.autoRejectAfterDays' control={control}
                            render={({ field }) => (
                                <CustomTextField {...field} fullWidth type='number' label='Auto Reject After (Days)' />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 2 }}>Allowed For</Typography>
                        <Controller name='regularisationRules.allowedFor' control={control}
                            render={({ field }) => (
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    {REGULARISATION_OPTIONS.map(opt => (
                                        <FormControlLabel key={opt.value} label={opt.label}
                                            control={
                                                <Checkbox
                                                    checked={field.value?.includes(opt.value)}
                                                    onChange={e => {
                                                        const cur = field.value || []
                                                        field.onChange(e.target.checked ? [...cur, opt.value] : cur.filter(v => v !== opt.value))
                                                    }}
                                                />
                                            }
                                        />
                                    ))}
                                </Box>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}><Divider /></Grid>

                    <Grid item xs={12}>
                        <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Approval Flow</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Controller name='regularisationRules.approvalFlow.type' control={control}
                            render={({ field }) => (
                                <CustomTextField {...field} select fullWidth label='Approval Type'>
                                    <MenuItem value='single'>Single Level</MenuItem>
                                    <MenuItem value='multi'>Multi Level</MenuItem>
                                    <MenuItem value='auto'>Auto Approve</MenuItem>
                                </CustomTextField>
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Controller name='regularisationRules.approvalFlow.levels' control={control}
                            render={({ field }) => (
                                <CustomTextField
                                    fullWidth
                                    label='Approval Levels'
                                    value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                                    onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                    placeholder='manager, hr'
                                />
                            )}
                        />
                    </Grid>
                </>
            )}
        </Grid>
    )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

const defaultWizardValues = {
    attendanceRules: {
        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        shift: { start: '09:00', end: '18:00', graceMinutes: 15 },
        lateMark: { enabled: true, countAfterMinutes: 15, penaltyType: 'leave', penaltyValue: 0.5 },
        halfDay: { minHours: 4 },
        sandwichRule: true,
        includeHolidays: false,
        includeWeekends: false
    },
    payrollRules: {
        salaryCycle: { type: 'monthly', startDay: 1, endDay: 31 },
        salaryDate: 5,
        payrollRunDate: 28,
        lop: { enabled: true, calculation: 'per_day' },
        leaveDeductionPriority: ['CL', 'SL', 'EL', 'LWP'],
        unpaidLeave: { code: 'LWP', autoAssign: true }
    },
    regularisationRules: {
        enabled: true,
        maxRequestsPerMonth: 3,
        allowedFor: ['late', 'absent', 'missed_punch'],
        approvalFlow: { type: 'single', levels: ['manager'] },
        autoRejectAfterDays: 7
    }
}

const LeavePolicyConfigWizard = () => {
    const [activeStep, setActiveStep] = useState(0)
    const theme = useTheme()

    const { control, watch, handleSubmit } = useForm({ defaultValues: defaultWizardValues })

    const onSubmit = async (data) => {
        console.log('Policy config:', data)
        toast.success('Policy configuration saved!')
    }

    const renderStep = (step) => {
        switch (step) {
            case 0: return <StepLeaveTypes />                             // owns its own API state
            case 1: return <StepAttendance control={control} watch={watch} />
            case 2: return <StepPayroll control={control} watch={watch} />
            case 3: return <StepRegularisation control={control} watch={watch} />
            default: return null
        }
    }

    return (
        <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>

            {/* Vertical Stepper Sidebar */}
            <StepperHeaderContainer>
                <StepperWrapper sx={{ height: '100%' }}>
                    <StepperEl
                        connector={<></>}
                        orientation='vertical'
                        activeStep={activeStep}
                        sx={{ height: '100%', minWidth: '15rem' }}
                    >
                        {steps.map((step, index) => {
                            const RenderAvatar = activeStep >= index ? CustomAvatar : Avatar
                            return (
                                <StepEl
                                    key={index}
                                    onClick={() => setActiveStep(index)}
                                    sx={{ '&.Mui-completed + svg': { color: 'primary.main' } }}
                                >
                                    <StepLabel>
                                        <div className='step-label'>
                                            <RenderAvatar
                                                variant='rounded'
                                                {...(activeStep >= index && { skin: 'light' })}
                                                {...(activeStep === index && { skin: 'filled' })}
                                                {...(activeStep >= index && { color: 'primary' })}
                                                sx={{
                                                    ...(activeStep === index && { boxShadow: t => t.shadows[3] }),
                                                    ...(activeStep > index && { color: t => hexToRGBA(t.palette.primary.main, 0.4) })
                                                }}
                                            >
                                                <Icon icon={step.icon} fontSize='1.5rem' />
                                            </RenderAvatar>
                                            <div>
                                                <Typography className='step-title'>{step.title}</Typography>
                                                <Typography className='step-subtitle'>{step.subtitle}</Typography>
                                            </div>
                                        </div>
                                    </StepLabel>
                                </StepEl>
                            )
                        })}
                    </StepperEl>
                </StepperWrapper>
            </StepperHeaderContainer>

            {/* Main Content */}
            <CardContent sx={{ pt: theme => `${theme.spacing(6)} !important`, flex: 1, overflow: 'auto' }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {renderStep(activeStep)}

                    {/* Navigation Footer */}
                    <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            variant='tonal'
                            color='secondary'
                            disabled={activeStep === 0}
                            onClick={() => setActiveStep(p => Math.max(0, p - 1))}
                            startIcon={<Icon icon={theme.direction === 'ltr' ? 'tabler:arrow-left' : 'tabler:arrow-right'} />}
                        >
                            Previous
                        </Button>

                        {activeStep === steps.length - 1 ? (
                            <Button type='submit' variant='contained' color='success' endIcon={<Icon icon='tabler:check' />}>
                                Save Policy
                            </Button>
                        ) : (
                            <Button
                                variant='contained'
                                onClick={() => setActiveStep(p => Math.min(steps.length - 1, p + 1))}
                                endIcon={<Icon icon={theme.direction === 'ltr' ? 'tabler:arrow-right' : 'tabler:arrow-left'} />}
                            >
                                Next
                            </Button>
                        )}
                    </Box>
                </form>
            </CardContent>
        </Card>
    )
}

export default LeavePolicyConfigWizard