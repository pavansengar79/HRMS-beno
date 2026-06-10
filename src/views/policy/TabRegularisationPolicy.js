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

const ALLOWED_FOR_OPTIONS = [
    { value: 'late', label: 'Late Arrival' },
    { value: 'absent', label: 'Absent' },
    { value: 'missed_punch', label: 'Missed Punch' },
    { value: 'early_exit', label: 'Early Exit' }
]

const APPROVAL_LEVELS = ['manager', 'hr', 'admin']

const defaultValues = {
    name: '',
    enabled: true,
    allowedFor: ['late', 'absent', 'missed_punch'],
    maxRequestsPerMonth: 3,
    requestWindow: { pastDaysAllowed: 7, futureAllowed: false },
    approvalFlow: { type: 'single', levels: ['manager'] },
    autoApproval: { enabled: false, conditions: [] },
    autoRejectAfterDays: 7,
    documentRequired: { enabled: false, forTypes: [] }
}

// ─── Regularisation Policy Drawer ────────────────────────────────────────────

const RegularisationPolicyDrawer = ({ open, onClose, editData, onSuccess }) => {
    const [saving, setSaving] = useState(false)
    const isEdit = Boolean(editData?._id)

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues })

    const enabled = watch('enabled')
    const autoApprovalEnabled = watch('autoApproval.enabled')
    const docRequired = watch('documentRequired.enabled')

    useEffect(() => {
        if (open) reset(editData ? {
            ...defaultValues, ...editData,
            approvalFlow: editData.approvalFlow ?? defaultValues.approvalFlow,
            documentRequired: editData.documentRequired ?? defaultValues.documentRequired
        } : defaultValues)
    }, [open, editData])

    const onSubmit = async (data) => {
        setSaving(true)
        try {
            const payload = {
                ...data,
                maxRequestsPerMonth: Number(data.maxRequestsPerMonth),
                autoRejectAfterDays: Number(data.autoRejectAfterDays),
                requestWindow: {
                    pastDaysAllowed: Number(data.requestWindow.pastDaysAllowed),
                    futureAllowed: data.requestWindow.futureAllowed
                }
            }

            const res = isEdit
                ? await axiosRequest.put(`/api/v1/regularisation/policies/${editData._id}`, payload)
                : await axiosRequest.post('/api/v1/regularisation/policies', payload)

            if (res.data?.success) {
                toast.success(`Regularisation policy ${isEdit ? 'updated' : 'created'}`)
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
            PaperProps={{ sx: { width: { xs: '100%', sm: 580 } } }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 5, py: 4, borderBottom: t => `1px solid ${t.palette.divider}` }}>
                <Typography variant='h6'>{isEdit ? 'Edit Regularisation Policy' : 'New Regularisation Policy'}</Typography>
                <IconButton onClick={onClose} size='small'><Icon icon='tabler:x' /></IconButton>
            </Box>

            <Box component='form' onSubmit={handleSubmit(onSubmit)}
                sx={{ px: 5, py: 4, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}
            >
                {/* Policy Name + Enable */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Policy Details</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Controller name='name' control={control} rules={{ required: 'Name required' }}
                                render={({ field }) => (
                                    <CustomTextField {...field} fullWidth label='Policy Name *' error={!!errors.name} helperText={errors.name?.message} />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller name='enabled' control={control}
                                render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable Regularisation' />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {enabled && (
                    <>
                        <Divider />

                        {/* Allowed For */}
                        <Box>
                            <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 2 }}>Allowed For</Typography>
                            <Controller name='allowedFor' control={control}
                                render={({ field }) => (
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        {ALLOWED_FOR_OPTIONS.map(opt => (
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
                        </Box>

                        <Divider />

                        {/* Limits */}
                        <Box>
                            <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Limits</Typography>
                            <Grid container spacing={4}>
                                <Grid item xs={6}>
                                    <Controller name='maxRequestsPerMonth' control={control}
                                        render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Max Requests / Month' />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller name='autoRejectAfterDays' control={control}
                                        render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Auto Reject After (days)' />}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller name='requestWindow.pastDaysAllowed' control={control}
                                        render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Past Days Allowed' />}
                                    />
                                </Grid>
                                <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Controller name='requestWindow.futureAllowed' control={control}
                                        render={({ field }) => (
                                            <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Allow Future Dates' />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider />

                        {/* Approval Flow */}
                        <Box>
                            <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Approval Flow</Typography>
                            <Grid container spacing={4}>
                                <Grid item xs={6}>
                                    <Controller name='approvalFlow.type' control={control}
                                        render={({ field }) => (
                                            <CustomTextField {...field} select fullWidth label='Approval Type'>
                                                <MenuItem value='single'>Single Level</MenuItem>
                                                <MenuItem value='multi'>Multi Level</MenuItem>
                                            </CustomTextField>
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>Approvers</Typography>
                                    <Controller name='approvalFlow.levels' control={control}
                                        render={({ field }) => (
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                {APPROVAL_LEVELS.map(level => {
                                                    const checked = field.value?.includes(level)
                                                    return (
                                                        <Chip key={level} label={level} clickable size='small'
                                                            color={checked ? 'primary' : 'default'}
                                                            variant={checked ? 'filled' : 'outlined'}
                                                            onClick={() => {
                                                                const cur = field.value || []
                                                                field.onChange(checked ? cur.filter(l => l !== level) : [...cur, level])
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

                        <Divider />

                        {/* Auto Approval */}
                        <Box>
                            <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 2 }}>Auto Approval</Typography>
                            <Controller name='autoApproval.enabled' control={control}
                                render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable Auto Approval' />
                                )}
                            />
                            {autoApprovalEnabled && (
                                <Alert severity='info' sx={{ mt: 2 }}>
                                    Auto approval conditions can be configured from the engine settings.
                                </Alert>
                            )}
                        </Box>

                        <Divider />

                        {/* Document Required */}
                        <Box>
                            <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Document Requirement</Typography>
                            <Grid container spacing={4}>
                                <Grid item xs={12}>
                                    <Controller name='documentRequired.enabled' control={control}
                                        render={({ field }) => (
                                            <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Require Document' />
                                        )}
                                    />
                                </Grid>
                                {docRequired && (
                                    <Grid item xs={12}>
                                        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>Require document for</Typography>
                                        <Controller name='documentRequired.forTypes' control={control}
                                            render={({ field }) => (
                                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                                    {ALLOWED_FOR_OPTIONS.map(opt => (
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
                                )}
                            </Grid>
                        </Box>
                    </>
                )}

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

// ─── TabRegularisationPolicy ──────────────────────────────────────────────────

const TabRegularisationPolicy = () => {
    const [policies, setPolicies] = useState([])
    const [loading, setLoading] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editData, setEditData] = useState(null)

    const fetchPolicies = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axiosRequest.get('/api/v1/regularisation/policies')
            if (res.data?.success) setPolicies(res.data.data)
        } catch {
            toast.error('Failed to load regularisation policies')
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
                title='Regularisation Policies'
                subheader='Configure attendance regularisation rules, approval flows, and limits'
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
                    <Alert severity='info'>No regularisation policies yet. Create your first one.</Alert>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {policies.map(policy => (
                            <Box key={policy._id} sx={{
                                p: 4, border: t => `1px solid ${t.palette.divider}`, borderRadius: 2,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2
                            }}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                                        <Typography fontWeight={600}>{policy.name}</Typography>
                                        <Chip
                                            label={policy.enabled ? 'Enabled' : 'Disabled'} size='small'
                                            color={policy.enabled ? 'success' : 'default'} variant='tonal'
                                        />
                                    </Box>
                                    <Typography variant='caption' color='text.secondary'>
                                        Max {policy.maxRequestsPerMonth} req/month ·{' '}
                                        Auto reject after {policy.autoRejectAfterDays} days ·{' '}
                                        Approval: {policy.approvalFlow?.type}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                        {policy.allowedFor?.map(type => (
                                            <Chip key={type} label={type.replace('_', ' ')} size='small' variant='tonal' color='primary' />
                                        ))}
                                        {policy.autoApproval?.enabled && <Chip label='Auto Approve' size='small' color='info' variant='tonal' />}
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

            <RegularisationPolicyDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                editData={editData}
                onSuccess={handleSuccess}
            />
        </Card>
    )
}

export default TabRegularisationPolicy