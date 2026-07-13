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
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { selectRoleSlug } from 'src/store/auth/authSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_FOR_OPTIONS = [
    { value: 'late', label: 'Late Arrival' },
    { value: 'absent', label: 'Absent' },
    { value: 'missed_punch', label: 'Missed Punch' },
    { value: 'early_exit', label: 'Early Exit' }
]

const APPROVAL_FLOW_OPTIONS = [
    { value: 'L1_ONLY', label: 'L1 Only - Reporting Manager' },
    { value: 'L2_ONLY', label: 'L2 Only - HR Manager (Default)' },
    { value: 'L1_L2', label: 'L1 + L2 - Both Manager & HR' },
    { value: 'AUTO', label: 'Auto - Instant Approval' }
]

const EMPLOYEE_TYPES = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Intern' }
]

const defaultValues = {
    name: '',
    description: '',
    enabled: true,
    isDefault: false,
    allowedFor: ['late', 'absent', 'missed_punch'],
    maxRequestsPerMonth: 3,
    requestWindow: { pastDaysAllowed: 30, futureAllowed: false },
    approvalFlow: 'L2_ONLY',
    autoApproval: { enabled: false, conditions: [] },
    autoRejectAfterDays: 7,
    documentRequired: {
        enabled: false,
        forTypes: [],
        maxSizeMB: 5,
        allowedFormats: ['pdf', 'jpg', 'jpeg', 'png']
    },
    escalation: {
        enabled: false,
        afterDays: 3,
        escalateTo: 'l2'
    },
    applicableFor: {
        departments: [],
        designations: [],
        roles: [],
        employeeTypes: []
    },
    status: 'active',
    effectiveFrom: null,
    effectiveTill: null
}

// ─── Regularisation Policy Drawer ────────────────────────────────────────────

const RegularisationPolicyDrawer = ({ open, onClose, editData, onSuccess }) => {
    const [saving, setSaving] = useState(false)
    const [departments, setDepartments] = useState([])
    const [designations, setDesignations] = useState([])
    const [roles, setRoles] = useState([])
    const isEdit = Boolean(editData?._id)

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues })

    const enabled = watch('enabled')
    const autoApprovalEnabled = watch('autoApproval.enabled')
    const docRequired = watch('documentRequired.enabled')
    const escalationEnabled = watch('escalation.enabled')

    // Fetch departments, designations, and roles
    useEffect(() => {
        if (open) {
            const fetchDropdownData = async () => {
                try {
                    const [deptRes, desigRes, roleRes] = await Promise.all([
                        axiosRequest.get('/department').catch(() => ({ data: { data: [] } })),
                        axiosRequest.get('/designation').catch(() => ({ data: { data: [] } })),
                        axiosRequest.get('/role').catch(() => ({ data: { data: [] } }))
                    ])
                    
                    setDepartments(Array.isArray(deptRes.data?.data) ? deptRes.data.data : [])
                    setDesignations(Array.isArray(desigRes.data?.data) ? desigRes.data.data : [])
                    setRoles(Array.isArray(roleRes.data?.data) ? roleRes.data.data : [])
                } catch (err) {
                    console.error('Failed to fetch dropdown data:', err)
                }
            }
            fetchDropdownData()
        }
    }, [open])

    useEffect(() => {
        if (open) {
            if (editData) {
                console.log('Resetting form with editData:', editData)
                const formData = {
                    ...defaultValues,
                    ...editData,
                    requestWindow: editData.requestWindow || defaultValues.requestWindow,
                    autoApproval: editData.autoApproval || defaultValues.autoApproval,
                    documentRequired: editData.documentRequired || defaultValues.documentRequired,
                    escalation: editData.escalation || defaultValues.escalation,
                    applicableFor: editData.applicableFor || defaultValues.applicableFor
                }
                console.log('Form data to reset:', formData)
                reset(formData)
            } else {
                reset(defaultValues)
            }
        }
    }, [open, editData, reset])

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
                },
                documentRequired: {
                    ...data.documentRequired,
                    maxSizeMB: Number(data.documentRequired.maxSizeMB)
                },
                escalation: {
                    ...data.escalation,
                    afterDays: Number(data.escalation.afterDays)
                },
                applicableFor: {
                    departments: data.applicableFor?.departments || [],
                    designations: data.applicableFor?.designations || [],
                    roles: data.applicableFor?.roles || [],
                    employeeTypes: data.applicableFor?.employeeTypes || []
                }
            }

            console.log('📤 Submitting payload:', payload)

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
            PaperProps={{ sx: { width: { xs: '100%', sm: 700 } } }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 5, py: 4, borderBottom: t => `1px solid ${t.palette.divider}` }}>
                <Typography variant='h6'>{isEdit ? 'Edit Regularisation Policy' : 'New Regularisation Policy'}</Typography>
                <IconButton onClick={onClose} size='small'><Icon icon='tabler:x' /></IconButton>
            </Box>

            <Box component='form' onSubmit={handleSubmit(onSubmit)}
                sx={{ px: 5, py: 4, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}
            >
                {/* Policy Details */}
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
                            <Controller name='description' control={control}
                                render={({ field }) => (
                                    <CustomTextField {...field} fullWidth multiline rows={2} label='Description' />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller name='enabled' control={control}
                                render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable Policy' />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller name='isDefault' control={control}
                                render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Set as Default' />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller name='status' control={control}
                                render={({ field }) => (
                                    <CustomTextField {...field} select fullWidth label='Status'>
                                        <MenuItem value='active'>Active</MenuItem>
                                        <MenuItem value='inactive'>Inactive</MenuItem>
                                        <MenuItem value='draft'>Draft</MenuItem>
                                    </CustomTextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller name='effectiveFrom' control={control}
                                render={({ field }) => (
                                    <CustomTextField 
                                        {...field}
                                        fullWidth
                                        type='date'
                                        label='Effective From'
                                        InputLabelProps={{ shrink: true }}
                                        value={field.value ? field.value.split('T')[0] : ''}
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller name='effectiveTill' control={control}
                                render={({ field }) => (
                                    <CustomTextField 
                                        {...field}
                                        fullWidth
                                        type='date'
                                        label='Effective Till'
                                        InputLabelProps={{ shrink: true }}
                                        value={field.value ? field.value.split('T')[0] : ''}
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
                                    />
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
                            <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 2 }}>Allowed Regularisation Types</Typography>
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

                        {/* Request Limits */}
                        <Box>
                            <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Request Limits & Window</Typography>
                            <Grid container spacing={4}>
                                <Grid item xs={6}>
                                    <Controller name='maxRequestsPerMonth' control={control}
                                        render={({ field }) => (
                                            <CustomTextField {...field} fullWidth type='number' label='Max Requests / Month'
                                                helperText='How many regularisations allowed per month' inputProps={{ min: 1, max: 31 }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller name='autoRejectAfterDays' control={control}
                                        render={({ field }) => (
                                            <CustomTextField {...field} fullWidth type='number' label='Auto Reject After (days)'
                                                helperText='Pending requests older than N days auto-rejected' inputProps={{ min: 1, max: 30 }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller name='requestWindow.pastDaysAllowed' control={control}
                                        render={({ field }) => (
                                            <CustomTextField {...field} fullWidth type='number' label='Past Days Allowed'
                                                helperText='How many days back can employee regularize (1-90)' inputProps={{ min: 1, max: 90 }}
                                            />
                                        )}
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
                                <Grid item xs={12}>
                                    <Controller name='approvalFlow' control={control} rules={{ required: 'Approval flow required' }}
                                        render={({ field }) => (
                                            <CustomTextField {...field} select fullWidth label='Approval Flow *' error={!!errors.approvalFlow} helperText={errors.approvalFlow?.message}>
                                                {APPROVAL_FLOW_OPTIONS.map(opt => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </CustomTextField>
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
                                    Auto approval conditions can be configured after policy creation.
                                </Alert>
                            )}
                        </Box>

                        <Divider />

                        {/* Document Requirements */}
                        <Box>
                            <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Document Requirements</Typography>
                            <Grid container spacing={4}>
                                <Grid item xs={12}>
                                    <Controller name='documentRequired.enabled' control={control}
                                        render={({ field }) => (
                                            <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Require Documents' />
                                        )}
                                    />
                                </Grid>
                                {docRequired && (
                                    <>
                                        <Grid item xs={6}>
                                            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>Require document for:</Typography>
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
                                        <Grid item xs={6}>
                                            <Controller name='documentRequired.maxSizeMB' control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} fullWidth type='number' label='Max File Size (MB)' inputProps={{ min: 1, max: 20 }} />
                                                )}
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </Box>

                        <Divider />

                        {/* Escalation */}
                        <Box>
                            <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Escalation</Typography>
                            <Grid container spacing={4}>
                                <Grid item xs={12}>
                                    <Controller name='escalation.enabled' control={control}
                                        render={({ field }) => (
                                            <FormControlLabel control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label='Enable Escalation' />
                                        )}
                                    />
                                </Grid>
                                {escalationEnabled && (
                                    <>
                                        <Grid item xs={6}>
                                            <Controller name='escalation.afterDays' control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} fullWidth type='number' label='Escalate After (days)' inputProps={{ min: 1, max: 14 }} />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Controller name='escalation.escalateTo' control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} select fullWidth label='Escalate To'>
                                                        <MenuItem value='l2'>L2 - HR Manager</MenuItem>
                                                        <MenuItem value='unit_admin'>Unit Admin</MenuItem>
                                                        <MenuItem value='company_admin'>Company Admin</MenuItem>
                                                    </CustomTextField>
                                                )}
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </Box>

                        <Divider />

                        {/* Applicability */}
                        <Box>
                            <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Applicable For</Typography>
                            
                            {/* Departments */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>Departments</Typography>
                                <Controller name='applicableFor.departments' control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            select
                                            fullWidth
                                            label='Select Departments'
                                            SelectProps={{
                                                multiple: true,
                                                value: field.value || [],
                                                onChange: (e) => field.onChange(e.target.value),
                                                renderValue: (selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => {
                                                            const dept = departments.find(d => d._id === value || d.id === value)
                                                            return <Chip key={value} label={dept?.name || value} size='small' />
                                                        })}
                                                    </Box>
                                                )
                                            }}
                                        >
                                            {departments.map((dept) => (
                                                <MenuItem key={dept._id || dept.id} value={dept._id || dept.id}>
                                                    {dept.name}
                                                </MenuItem>
                                            ))}
                                        </CustomTextField>
                                    )}
                                />
                                <Typography variant='caption' color='text.secondary'>Leave empty to apply to all departments</Typography>
                            </Box>

                            {/* Designations */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>Designations</Typography>
                                <Controller name='applicableFor.designations' control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            select
                                            fullWidth
                                            label='Select Designations'
                                            SelectProps={{
                                                multiple: true,
                                                value: field.value || [],
                                                onChange: (e) => field.onChange(e.target.value),
                                                renderValue: (selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => {
                                                            const desig = designations.find(d => d._id === value || d.id === value)
                                                            return <Chip key={value} label={desig?.name || value} size='small' />
                                                        })}
                                                    </Box>
                                                )
                                            }}
                                        >
                                            {designations.map((desig) => (
                                                <MenuItem key={desig._id || desig.id} value={desig._id || desig.id}>
                                                    {desig.name}
                                                </MenuItem>
                                            ))}
                                        </CustomTextField>
                                    )}
                                />
                                <Typography variant='caption' color='text.secondary'>Leave empty to apply to all designations</Typography>
                            </Box>

                            {/* Roles */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>Roles</Typography>
                                <Controller name='applicableFor.roles' control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            select
                                            fullWidth
                                            label='Select Roles'
                                            SelectProps={{
                                                multiple: true,
                                                value: field.value || [],
                                                onChange: (e) => field.onChange(e.target.value),
                                                renderValue: (selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => {
                                                            const role = roles.find(r => r._id === value || r.id === value)
                                                            return <Chip key={value} label={role?.name || value} size='small' />
                                                        })}
                                                    </Box>
                                                )
                                            }}
                                        >
                                            {roles.map((role) => (
                                                <MenuItem key={role._id || role.id} value={role._id || role.id}>
                                                    {role.name}
                                                </MenuItem>
                                            ))}
                                        </CustomTextField>
                                    )}
                                />
                                <Typography variant='caption' color='text.secondary'>Leave empty to apply to all roles</Typography>
                            </Box>

                            {/* Employee Types */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>Employee Types</Typography>
                                <Controller name='applicableFor.employeeTypes' control={control}
                                    render={({ field }) => (
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            {EMPLOYEE_TYPES.map(opt => (
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
                                <Typography variant='caption' color='text.secondary'>Leave empty to apply to all employee types</Typography>
                            </Box>
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
            console.log('🔍 API Response:', res)
            console.log('📦 Response data:', res.data)
            
            if (res.data && res.success) {
                const policyData = res.data || []
                console.log('✅ Setting policies:', policyData.length, 'items', policyData)
                setPolicies(policyData)
            } else {
                console.error('❌ API returned success=false:', res.data)
                toast.error(res.data?.message || 'Failed to load policies')
            }
        } catch (err) {
            console.error('🚨 Fetch error:', err)
            console.error('🚨 Error response:', err.response)
            toast.error(err.response?.data?.message || 'Failed to load regularisation policies')
        } finally {
            setLoading(false)
            console.log('✅ Loading complete')
        }
    }, [])

    useEffect(() => { fetchPolicies() }, [fetchPolicies])

    const handleAdd = () => { setEditData(null); setDrawerOpen(true) }
    const handleEdit = (policy) => {
        console.log('Editing policy:', policy)
        setEditData(policy)
        setDrawerOpen(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this policy?')) return
        try {
            await axiosRequest.delete(`/api/v1/regularisation/policies/${id}`)
            toast.success('Policy deleted')
            fetchPolicies()
        } catch {
            toast.error('Failed to delete')
        }
    }

    const handleToggle = async (id) => {
        try {
            const res = await axiosRequest.patch(`/api/v1/regularisation/policies/${id}/toggle`)
            if (res.data?.success) {
                toast.success('Policy status updated')
                fetchPolicies()
            }
        } catch {
            toast.error('Failed to toggle')
        }
    }

    const onSuccess = (data, isEdit) => {
        if (isEdit) {
            setPolicies(prev => prev.map(p => p._id === data._id ? data : p))
        } else {
            setPolicies(prev => [...prev, data])
        }
    }

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><CircularProgress /></Box>
    }

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader
                        title='Regularisation Policies'
                        subheader='Enterprise-level regularisation policy management'
                        action={
                            <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={handleAdd}>
                                New Policy
                            </Button>
                        }
                    />
                    <Divider />
                    <CardContent>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                                <CircularProgress />
                            </Box>
                        ) : policies.length === 0 ? (
                            <Alert severity='info'>No regularisation policies yet. Create your first one.</Alert>
                        ) : (
                            <>
                                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                                    Found {policies.length} policy(ies)
                                </Typography>
                                <TableContainer component={Paper}>
                                    <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Policy Name</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Approval Flow</TableCell>
                                            <TableCell>Max Requests/Month</TableCell>
                                            <TableCell>Window Days</TableCell>
                                            <TableCell>Auto Reject</TableCell>
                                            <TableCell>Default</TableCell>
                                            <TableCell align='center'>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {policies.map((policy) => (
                                            <TableRow key={policy._id} hover>
                                                <TableCell>
                                                    <Typography variant='body2' fontWeight='medium'>{policy.name}</Typography>
                                                    {policy.description && (
                                                        <Typography variant='caption' color='text.secondary'>{policy.description}</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={policy.enabled ? 'Active' : 'Inactive'}
                                                        color={policy.enabled ? 'success' : 'default'}
                                                        size='small'
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={policy.approvalFlow} size='small' variant='outlined' />
                                                </TableCell>
                                                <TableCell>{policy.maxRequestsPerMonth}</TableCell>
                                                <TableCell>{policy.requestWindow?.pastDaysAllowed || 30}</TableCell>
                                                <TableCell>{policy.autoRejectAfterDays} days</TableCell>
                                                <TableCell>
                                                    {policy.isDefault && <Chip label='Default' color='primary' size='small' />}
                                                </TableCell>
                                                <TableCell align='center'>
                                                    <Tooltip title='Edit'>
                                                        <IconButton size='small' onClick={() => handleEdit(policy)}>
                                                            <Icon icon='tabler:edit' />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={policy.enabled ? 'Disable' : 'Enable'}>
                                                        <IconButton size='small' onClick={() => handleToggle(policy._id)}>
                                                            <Icon icon={policy.enabled ? 'tabler:toggle-right' : 'tabler:toggle-left'} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title='Delete'>
                                                        <IconButton size='small' color='error' onClick={() => handleDelete(policy._id)}>
                                                            <Icon icon='tabler:trash' />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            <RegularisationPolicyDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                editData={editData}
                onSuccess={onSuccess}
            />
        </Grid>
    )
}

export default TabRegularisationPolicy
