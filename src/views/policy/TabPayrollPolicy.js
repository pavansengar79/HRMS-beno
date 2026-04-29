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

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** API

// ─── Default Values ───────────────────────────────────────────────────────────

const defaultValues = {
    name: '',
    salaryCycle: { type: 'monthly', startDay: 1, endDay: 31 },
    salaryCreditDay: 5,
    payrollRunDay: 28,
    workingDaysConfig: { type: 'fixed', fixedDays: 26 },
    lopRule: {
        enabled: true,
        calculation: 'per_day',
        formula: 'salary / working_days'
    },
    leaveDeductionPriority: ['CL', 'SL', 'EL', 'LWP'],
    unpaidLeave: { code: 'LWP', autoAssign: true },
    overtimePayment: { enabled: false, multiplier: 1.5 },
    bonus: { enabled: false }
}

// ─── Payroll Policy Drawer ────────────────────────────────────────────────────

const PayrollPolicyDrawer = ({ open, onClose, editData, onSuccess }) => {
    const [saving, setSaving] = useState(false)
    const isEdit = Boolean(editData?._id)

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues })

    const lopEnabled = watch('lopRule.enabled')
    const overtimeEnabled = watch('overtimePayment.enabled')
    const workingDaysType = watch('workingDaysConfig.type')

    useEffect(() => {
        if (open) reset(editData ? {
            ...defaultValues, ...editData,
            leaveDeductionPriority: editData.leaveDeductionPriority ?? ['CL', 'SL', 'EL', 'LWP']
        } : defaultValues)
    }, [open, editData])

    const onSubmit = async (data) => {
        setSaving(true)
        try {
            const payload = {
                ...data,
                salaryCycle: {
                    ...data.salaryCycle,
                    startDay: Number(data.salaryCycle.startDay),
                    endDay: Number(data.salaryCycle.endDay)
                },
                salaryCreditDay: Number(data.salaryCreditDay),
                payrollRunDay: Number(data.payrollRunDay),
                workingDaysConfig: {
                    ...data.workingDaysConfig,
                    fixedDays: Number(data.workingDaysConfig.fixedDays)
                },
                overtimePayment: {
                    ...data.overtimePayment,
                    multiplier: Number(data.overtimePayment.multiplier)
                }
            }

            const res = isEdit
                ? await axiosRequest.put(`/payroll/policies/${editData._id}`, payload)
                : await axiosRequest.post('/payroll/policies', payload)

            if (res.data?.success) {
                toast.success(`Payroll policy ${isEdit ? 'updated' : 'created'}`)
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
                <Typography variant='h6'>{isEdit ? 'Edit Payroll Policy' : 'New Payroll Policy'}</Typography>
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

                {/* Salary Cycle */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Salary Cycle</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={4}>
                            <Controller name='salaryCycle.type' control={control}
                                render={({ field }) => (
                                    <CustomTextField {...field} select fullWidth label='Cycle Type'>
                                        <MenuItem value='monthly'>Monthly</MenuItem>
                                        <MenuItem value='weekly'>Weekly</MenuItem>
                                        <MenuItem value='biweekly'>Bi-Weekly</MenuItem>
                                    </CustomTextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Controller name='salaryCycle.startDay' control={control}
                                render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Start Day' />}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Controller name='salaryCycle.endDay' control={control}
                                render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='End Day' />}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller name='salaryCreditDay' control={control}
                                render={({ field }) => (
                                    <CustomTextField {...field} fullWidth type='number' label='Salary Credit Day'
                                        helperText='Day of month salary is credited'
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller name='payrollRunDay' control={control}
                                render={({ field }) => (
                                    <CustomTextField {...field} fullWidth type='number' label='Payroll Run Day'
                                        helperText='Day payroll processing runs'
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* Working Days Config */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Working Days</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6}>
                            <Controller name='workingDaysConfig.type' control={control}
                                render={({ field }) => (
                                    <CustomTextField {...field} select fullWidth label='Working Days Type'>
                                        <MenuItem value='fixed'>Fixed</MenuItem>
                                        <MenuItem value='actual'>Actual</MenuItem>
                                    </CustomTextField>
                                )}
                            />
                        </Grid>
                        {workingDaysType === 'fixed' && (
                            <Grid item xs={12} sm={6}>
                                <Controller name='workingDaysConfig.fixedDays' control={control}
                                    render={({ field }) => (
                                        <CustomTextField {...field} fullWidth type='number' label='Fixed Working Days / Month' />
                                    )}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Box>

                <Divider />

                {/* LOP Rule */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Loss of Pay (LOP)</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Controller name='lopRule.enabled' control={control}
                                render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable LOP' />
                                )}
                            />
                        </Grid>
                        {lopEnabled && (
                            <>
                                <Grid item xs={6}>
                                    <Controller name='lopRule.calculation' control={control}
                                        render={({ field }) => (
                                            <CustomTextField {...field} select fullWidth label='Calculation'>
                                                <MenuItem value='per_day'>Per Day</MenuItem>
                                                <MenuItem value='per_hour'>Per Hour</MenuItem>
                                            </CustomTextField>
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller name='lopRule.formula' control={control}
                                        render={({ field }) => (
                                            <CustomTextField {...field} fullWidth label='Formula' placeholder='salary / working_days' />
                                        )}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Box>

                <Divider />

                {/* Leave Deduction Priority */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 1 }}>Leave Deduction Priority</Typography>
                    <Typography variant='caption' color='text.disabled' sx={{ display: 'block', mb: 3 }}>
                        Comma-separated leave codes in deduction order
                    </Typography>
                    <Controller name='leaveDeductionPriority' control={control}
                        render={({ field }) => (
                            <CustomTextField
                                fullWidth
                                label='Priority Order'
                                value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                                onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder='CL, SL, EL, LWP'
                            />
                        )}
                    />
                </Box>

                <Divider />

                {/* Unpaid Leave */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Unpaid Leave</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={6}>
                            <Controller name='unpaidLeave.code' control={control}
                                render={({ field }) => <CustomTextField {...field} fullWidth label='Leave Code' placeholder='LWP' />}
                            />
                        </Grid>
                        <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Controller name='unpaidLeave.autoAssign' control={control}
                                render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Auto-Assign' />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* Overtime Payment */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Overtime Payment</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Controller name='overtimePayment.enabled' control={control}
                                render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable Overtime Pay' />
                                )}
                            />
                        </Grid>
                        {overtimeEnabled && (
                            <Grid item xs={6}>
                                <Controller name='overtimePayment.multiplier' control={control}
                                    render={({ field }) => (
                                        <CustomTextField {...field} fullWidth type='number' label='Pay Multiplier' placeholder='1.5' />
                                    )}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Box>

                <Divider />

                {/* Bonus */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 2 }}>Bonus</Typography>
                    <Controller name='bonus.enabled' control={control}
                        render={({ field }) => (
                            <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable Bonus' />
                        )}
                    />
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

// ─── TabPayrollPolicy ─────────────────────────────────────────────────────────

const TabPayrollPolicy = () => {
    const [policies, setPolicies] = useState([])
    const [loading, setLoading] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editData, setEditData] = useState(null)

    const fetchPolicies = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axiosRequest.get('/payroll/policies')
            if (res.data?.success) setPolicies(res.data.data)
        } catch {
            toast.error('Failed to load payroll policies')
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
                title='Payroll Policies'
                subheader='Configure salary cycles, LOP rules, and deduction priorities'
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
                    <Alert severity='info'>No payroll policies yet. Create your first one.</Alert>
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
                                        {policy.salaryCycle?.type} cycle ·{' '}
                                        Credit day: {policy.salaryCreditDay} ·{' '}
                                        Run day: {policy.payrollRunDay}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        {policy.lopRule?.enabled && <Chip label='LOP Enabled' size='small' color='warning' variant='tonal' />}
                                        {policy.overtimePayment?.enabled && <Chip label='OT Pay' size='small' color='info' variant='tonal' />}
                                        {policy.bonus?.enabled && <Chip label='Bonus' size='small' color='success' variant='tonal' />}
                                        {policy.leaveDeductionPriority?.map(code => (
                                            <Chip key={code} label={code} size='small' variant='outlined' />
                                        ))}
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

            <PayrollPolicyDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                editData={editData}
                onSuccess={handleSuccess}
            />
        </Card>
    )
}

export default TabPayrollPolicy