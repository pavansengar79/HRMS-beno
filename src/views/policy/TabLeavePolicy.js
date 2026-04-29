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
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Drawer from '@mui/material/Drawer'
import Skeleton from '@mui/material/Skeleton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'

// ** API — axiosRequest interceptor already unwraps axios response,
//           so res IS the server payload: { success, data, message }
import axiosRequest from 'src/utils/AxiosInterceptor'

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPLOYMENT_TYPES = ['full-time', 'contract', 'intern']

// Fields that come from /api/v1/leave/types and are configurable per-policy
const defaultPolicyLeaveEntry = {
    leaveTypeId: '',      // reference to the master leave type _id
    // ── these mirror the LeaveType API response fields ──
    name: '',
    code: '',
    colorCode: '#10B981',
    isPaid: true,
    accrualRatePerMonth: 0,
    defaultDaysPerYear: 0,
    isCarryForwardAllowed: false,
    carryForwardLimit: 0,
    isEncashmentAllowed: false,
    isHalfDayAllowed: true,
    isSandwichApplicable: false,
    minNoticeDays: 0,
    maxConsecutiveDays: null,
    applicableGender: 'ALL',
    applicableEmploymentTypes: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'],
    requiresDocumentAfterDays: null,
    isActive: true,
    // ── extra policy-level overrides (from architecture doc) ──
    credit: { totalPerYear: 0, frequency: 'monthly', perCycle: 0, accrualType: 'pro-rata' },
    balance: { maxBalance: 0, allowNegative: false, maxNegative: 0 },
    carryForward: { allowed: false, max: 0, expiryDays: 0 },
    encashment: { allowed: false, maxDays: 0 },
    application: { minDays: 0.5, maxDays: 30, advanceNoticeDays: 0, allowBackdated: false, allowHalfDay: true },
    documentRule: { required: false, afterDays: 0 },
    genderRestriction: { enabled: false, gender: '' }
}

const defaultPolicyValues = {
    name: '',
    description: '',
    effectiveFrom: '',
    status: 'active',
    applicableFor: {
        departments: [],
        roles: [],
        employmentTypes: ['full-time', 'contract', 'intern']
    },
    leaveTypes: []
}

// ─── Shared hook: fetch master leave types from API ───────────────────────────
// Used by both the drawer (to pick from) and potentially the list card

const useMasterLeaveTypes = () => {
    const [leaveTypes, setLeaveTypes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axiosRequest.get('/api/v1/leave/types')
                // interceptor pattern: res.success + res.data

                if (res?.success) {
                    // console.log("w types API response:", res.data)
                    setLeaveTypes(res.data)
                }
            } catch {
                toast.error('Failed to load leave types')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    return { leaveTypes, loading }
}

// ─── LeaveTypesSection — inside policy drawer ─────────────────────────────────
// Shows existing leave types from the master list.
// Each selected type can have its policy-level settings overridden.

const LeaveTypesSection = ({ control, watch, setValue, masterLeaveTypes, masterLoading }) => {
    const { fields, append, remove } = useFieldArray({ control, name: 'leaveTypes' })
    const [expanded, setExpanded] = useState(null)

    // When a master leave type is selected from the dropdown,
    // auto-populate all matching fields from the API response
    const handleLeaveTypeSelect = (index, leaveTypeId) => {
        const master = masterLeaveTypes.find(lt => lt._id === leaveTypeId)
        if (!master) return

        const prefix = `leaveTypes.${index}`

        // Map all API response fields into the form
        setValue(`${prefix}.leaveTypeId`, master._id)
        setValue(`${prefix}.name`, master.name)
        setValue(`${prefix}.code`, master.code)
        setValue(`${prefix}.colorCode`, master.colorCode || '#10B981')
        setValue(`${prefix}.isPaid`, master.isPaid)
        setValue(`${prefix}.accrualRatePerMonth`, master.accrualRatePerMonth ?? 0)
        setValue(`${prefix}.defaultDaysPerYear`, master.defaultDaysPerYear ?? 0)
        setValue(`${prefix}.isCarryForwardAllowed`, master.isCarryForwardAllowed ?? false)
        setValue(`${prefix}.carryForwardLimit`, master.carryForwardLimit ?? 0)
        setValue(`${prefix}.isEncashmentAllowed`, master.isEncashmentAllowed ?? false)
        setValue(`${prefix}.isHalfDayAllowed`, master.isHalfDayAllowed ?? true)
        setValue(`${prefix}.isSandwichApplicable`, master.isSandwichApplicable ?? false)
        setValue(`${prefix}.minNoticeDays`, master.minNoticeDays ?? 0)
        setValue(`${prefix}.maxConsecutiveDays`, master.maxConsecutiveDays ?? null)
        setValue(`${prefix}.applicableGender`, master.applicableGender ?? 'ALL')
        setValue(`${prefix}.applicableEmploymentTypes`, master.applicableEmploymentTypes ?? ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'])
        setValue(`${prefix}.requiresDocumentAfterDays`, master.requiresDocumentAfterDays ?? null)
        setValue(`${prefix}.isActive`, master.isActive ?? true)

        // Also sync to nested structure (policy-level overrides)
        setValue(`${prefix}.credit.totalPerYear`, master.defaultDaysPerYear ?? 0)
        setValue(`${prefix}.credit.perCycle`, master.accrualRatePerMonth ?? 0)
        setValue(`${prefix}.carryForward.allowed`, master.isCarryForwardAllowed ?? false)
        setValue(`${prefix}.carryForward.max`, master.carryForwardLimit ?? 0)
        setValue(`${prefix}.encashment.allowed`, master.isEncashmentAllowed ?? false)
        setValue(`${prefix}.application.allowHalfDay`, master.isHalfDayAllowed ?? true)
        setValue(`${prefix}.application.advanceNoticeDays`, master.minNoticeDays ?? 0)
        setValue(`${prefix}.documentRule.required`, master.requiresDocumentAfterDays != null)
        setValue(`${prefix}.documentRule.afterDays`, master.requiresDocumentAfterDays ?? 0)
        setValue(`${prefix}.genderRestriction.enabled`, master.applicableGender !== 'ALL')
        setValue(`${prefix}.genderRestriction.gender`, master.applicableGender !== 'ALL' ? master.applicableGender?.toLowerCase() : '')
    }

    const addLeaveType = () => {
        append({ ...defaultPolicyLeaveEntry })
        setExpanded(fields.length)
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant='subtitle1' fontWeight={600}>Leave Types in Policy</Typography>
                    <Typography variant='caption' color='text.secondary'>
                        Select from master leave types and override policy-level settings
                    </Typography>
                </Box>
                <Button size='small' variant='tonal' startIcon={<Icon icon='tabler:plus' />} onClick={addLeaveType}>
                    Add Leave Type
                </Button>
            </Box>

            {fields.length === 0 && (
                <Alert severity='info' sx={{ mb: 3 }}>
                    No leave types added. Click "Add Leave Type" to include types from the master list.
                </Alert>
            )}

            {fields.map((field, index) => {
                const p = `leaveTypes.${index}`
                const cfAllowed = watch(`${p}.carryForward.allowed`)
                const encAllowed = watch(`${p}.encashment.allowed`)
                const docReq = watch(`${p}.documentRule.required`)
                const genderEnabled = watch(`${p}.genderRestriction.enabled`)
                const colorVal = watch(`${p}.colorCode`)
                const nameVal = watch(`${p}.name`)
                const codeVal = watch(`${p}.code`)
                const leaveTypeId = watch(`${p}.leaveTypeId`)

                return (
                    <Accordion
                        key={field.id}
                        expanded={expanded === index}
                        onChange={() => setExpanded(expanded === index ? null : index)}
                        sx={{
                            mb: 2,
                            '&:before': { display: 'none' },
                            border: t => `1px solid ${t.palette.divider}`,
                            borderLeft: `4px solid ${colorVal || '#6B7280'}`,
                            borderRadius: '8px !important',
                            boxShadow: 'none'
                        }}
                    >
                        <AccordionSummary expandIcon={<Icon icon='tabler:chevron-down' />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                <Box sx={{
                                    width: 32, height: 32, borderRadius: 1,
                                    backgroundColor: colorVal || '#6B7280',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <Typography variant='caption' fontWeight={700} color='white' sx={{ fontSize: '0.65rem' }}>
                                        {codeVal || '?'}
                                    </Typography>
                                </Box>
                                <Typography fontWeight={500}>{nameVal || 'Select a leave type...'}</Typography>
                                {!leaveTypeId && (
                                    <Chip label='Not configured' size='small' color='warning' variant='tonal' />
                                )}
                                <Box sx={{ ml: 'auto', mr: 1 }}>
                                    <Button size='small' color='error' variant='tonal'
                                        onClick={e => { e.stopPropagation(); remove(index) }}
                                        startIcon={<Icon icon='tabler:trash' fontSize='1rem' />}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            </Box>
                        </AccordionSummary>

                        <AccordionDetails>
                            <Grid container spacing={4}>

                                {/* ── Step 1: Select master leave type ── */}
                                <Grid item xs={12}>
                                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 2 }}>
                                        Select Leave Type
                                    </Typography>
                                    {masterLoading ? (
                                        <Skeleton variant='rectangular' height={56} sx={{ borderRadius: 1 }} />
                                    ) : (
                                        <Controller
                                            name={`${p}.leaveTypeId`}
                                            control={control}
                                            rules={{ required: 'Please select a leave type' }}
                                            render={({ field, fieldState }) => (
                                                <CustomTextField
                                                    select
                                                    fullWidth
                                                    label='Master Leave Type *'
                                                    value={field.value || ''}
                                                    onChange={e => {
                                                        field.onChange(e.target.value)
                                                        handleLeaveTypeSelect(index, e.target.value)
                                                    }}
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message ?? 'All fields below will auto-fill and can be overridden'}
                                                >
                                                    {masterLeaveTypes.map(lt => (
                                                        <MenuItem key={lt._id} value={lt._id}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Box sx={{
                                                                    width: 10, height: 10, borderRadius: '50%',
                                                                    backgroundColor: lt.colorCode || '#6B7280', flexShrink: 0
                                                                }} />
                                                                <span>{lt.name}</span>
                                                                <Typography variant='caption' color='text.secondary' sx={{ ml: 0.5 }}>
                                                                    ({lt.code}) · {lt.defaultDaysPerYear} days/yr
                                                                </Typography>
                                                            </Box>
                                                        </MenuItem>
                                                    ))}
                                                </CustomTextField>
                                            )}
                                        />
                                    )}
                                </Grid>

                                {/* Only show overrides after a type is selected */}
                                {leaveTypeId && (
                                    <>
                                        <Grid item xs={12}><Divider textAlign='left'>
                                            <Typography variant='caption' color='text.secondary'>Policy-Level Overrides</Typography>
                                        </Divider></Grid>

                                        {/* ── Basic Info (read from API, editable) ── */}
                                        <Grid item xs={12}>
                                            <Typography variant='overline' color='text.secondary'>Basic Info</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={5}>
                                            <Controller name={`${p}.name`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} fullWidth label='Display Name' />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Controller name={`${p}.code`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} fullWidth label='Code'
                                                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={4} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Controller name={`${p}.isPaid`} control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                                                        label='Paid'
                                                    />
                                                )}
                                            />
                                            <Controller name={`${p}.isActive`} control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                                                        label='Active'
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        {/* Color */}
                                        <Grid item xs={12}>
                                            <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>Color</Typography>
                                            <Controller name={`${p}.colorCode`} control={control}
                                                render={({ field }) => (
                                                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                                        {['#10B981', '#4F46E5', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6B7280'].map(c => (
                                                            <Box key={c} onClick={() => field.onChange(c)}
                                                                sx={{
                                                                    width: 22, height: 22, borderRadius: '50%', backgroundColor: c, cursor: 'pointer',
                                                                    border: field.value === c ? '3px solid white' : '2px solid transparent',
                                                                    outline: field.value === c ? `2px solid ${c}` : 'none',
                                                                    transition: 'transform 0.15s',
                                                                    '&:hover': { transform: 'scale(1.2)' }
                                                                }}
                                                            />
                                                        ))}
                                                        <input type='color' value={field.value || '#10B981'}
                                                            onChange={e => field.onChange(e.target.value)}
                                                            style={{ width: 22, height: 22, border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 0 }}
                                                        />
                                                    </Box>
                                                )}
                                            />
                                        </Grid>

                                        <Grid item xs={12}><Divider /></Grid>

                                        {/* ── Credit & Days (from API: defaultDaysPerYear, accrualRatePerMonth) ── */}
                                        <Grid item xs={12}>
                                            <Typography variant='overline' color='text.secondary'>Credit & Accrual</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Controller name={`${p}.defaultDaysPerYear`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} fullWidth type='number' label='Days / Year' />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Controller name={`${p}.accrualRatePerMonth`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} fullWidth type='number' label='Accrual / Month' />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Controller name={`${p}.credit.frequency`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} select fullWidth label='Frequency'>
                                                        <MenuItem value='monthly'>Monthly</MenuItem>
                                                        <MenuItem value='quarterly'>Quarterly</MenuItem>
                                                        <MenuItem value='yearly'>Yearly</MenuItem>
                                                    </CustomTextField>
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Controller name={`${p}.credit.accrualType`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} select fullWidth label='Accrual Type'>
                                                        <MenuItem value='pro-rata'>Pro-Rata</MenuItem>
                                                        <MenuItem value='full'>Full</MenuItem>
                                                    </CustomTextField>
                                                )}
                                            />
                                        </Grid>

                                        <Grid item xs={12}><Divider /></Grid>

                                        {/* ── Balance ── */}
                                        <Grid item xs={12}>
                                            <Typography variant='overline' color='text.secondary'>Balance</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={4}>
                                            <Controller name={`${p}.balance.maxBalance`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} fullWidth type='number' label='Max Balance (days)' />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Controller name={`${p}.balance.allowNegative`} control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                                                        label='Allow Negative'
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={4}>
                                            <Controller name={`${p}.balance.maxNegative`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} fullWidth type='number' label='Max Negative Days' />
                                                )}
                                            />
                                        </Grid>

                                        <Grid item xs={12}><Divider /></Grid>

                                        {/* ── Carry Forward (from API: isCarryForwardAllowed, carryForwardLimit) ── */}
                                        <Grid item xs={12}>
                                            <Typography variant='overline' color='text.secondary'>Carry Forward</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Controller name={`${p}.isCarryForwardAllowed`} control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={<Switch checked={field.value} onChange={e => {
                                                            field.onChange(e.target.checked)
                                                            setValue(`${p}.carryForward.allowed`, e.target.checked)
                                                        }} />}
                                                        label='Allow Carry Forward'
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        {(watch(`${p}.isCarryForwardAllowed`) || cfAllowed) && (
                                            <>
                                                <Grid item xs={6} sm={4}>
                                                    <Controller name={`${p}.carryForwardLimit`} control={control}
                                                        render={({ field }) => (
                                                            <CustomTextField {...field} fullWidth type='number' label='CF Limit (days)'
                                                                onChange={e => {
                                                                    field.onChange(e.target.value)
                                                                    setValue(`${p}.carryForward.max`, e.target.value)
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={6} sm={4}>
                                                    <Controller name={`${p}.carryForward.expiryDays`} control={control}
                                                        render={({ field }) => (
                                                            <CustomTextField {...field} fullWidth type='number' label='Expiry (days)' />
                                                        )}
                                                    />
                                                </Grid>
                                            </>
                                        )}

                                        <Grid item xs={12}><Divider /></Grid>

                                        {/* ── Encashment (from API: isEncashmentAllowed) ── */}
                                        <Grid item xs={12}>
                                            <Typography variant='overline' color='text.secondary'>Encashment</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Controller name={`${p}.isEncashmentAllowed`} control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={<Switch checked={field.value} onChange={e => {
                                                            field.onChange(e.target.checked)
                                                            setValue(`${p}.encashment.allowed`, e.target.checked)
                                                        }} />}
                                                        label='Allow Encashment'
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        {(watch(`${p}.isEncashmentAllowed`) || encAllowed) && (
                                            <Grid item xs={12} sm={6}>
                                                <Controller name={`${p}.encashment.maxDays`} control={control}
                                                    render={({ field }) => (
                                                        <CustomTextField {...field} fullWidth type='number' label='Max Encashment Days' />
                                                    )}
                                                />
                                            </Grid>
                                        )}

                                        <Grid item xs={12}><Divider /></Grid>

                                        {/* ── Application Rules (from API: isHalfDayAllowed, minNoticeDays, maxConsecutiveDays) ── */}
                                        <Grid item xs={12}>
                                            <Typography variant='overline' color='text.secondary'>Application Rules</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Controller name={`${p}.application.minDays`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} fullWidth type='number' label='Min Days' />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Controller name={`${p}.application.maxDays`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} fullWidth type='number' label='Max Days' />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Controller name={`${p}.minNoticeDays`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} fullWidth type='number' label='Min Notice Days'
                                                        onChange={e => {
                                                            field.onChange(e.target.value)
                                                            setValue(`${p}.application.advanceNoticeDays`, e.target.value)
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Controller name={`${p}.maxConsecutiveDays`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField
                                                        fullWidth type='number' label='Max Consecutive Days'
                                                        placeholder='No limit'
                                                        value={field.value ?? ''}
                                                        onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            <Controller name={`${p}.isHalfDayAllowed`} control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={<Switch checked={field.value} onChange={e => {
                                                            field.onChange(e.target.checked)
                                                            setValue(`${p}.application.allowHalfDay`, e.target.checked)
                                                        }} />}
                                                        label='Allow Half Day'
                                                    />
                                                )}
                                            />
                                            <Controller name={`${p}.application.allowBackdated`} control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                                                        label='Allow Backdated'
                                                    />
                                                )}
                                            />
                                            <Controller name={`${p}.isSandwichApplicable`} control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                                                        label='Sandwich Rule'
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        <Grid item xs={12}><Divider /></Grid>

                                        {/* ── Document Rule (from API: requiresDocumentAfterDays) ── */}
                                        <Grid item xs={12}>
                                            <Typography variant='overline' color='text.secondary'>Document Rule</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Controller name={`${p}.documentRule.required`} control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                                                        label='Document Required'
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        {docReq && (
                                            <Grid item xs={12} sm={6}>
                                                <Controller name={`${p}.requiresDocumentAfterDays`} control={control}
                                                    render={({ field }) => (
                                                        <CustomTextField
                                                            fullWidth type='number' label='Required After (days)'
                                                            value={field.value ?? ''}
                                                            onChange={e => {
                                                                const val = e.target.value === '' ? null : Number(e.target.value)
                                                                field.onChange(val)
                                                                setValue(`${p}.documentRule.afterDays`, val ?? 0)
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                        )}

                                        <Grid item xs={12}><Divider /></Grid>

                                        {/* ── Applicability (from API: applicableGender, applicableEmploymentTypes) ── */}
                                        <Grid item xs={12}>
                                            <Typography variant='overline' color='text.secondary'>Applicability</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Controller name={`${p}.applicableGender`} control={control}
                                                render={({ field }) => (
                                                    <CustomTextField {...field} select fullWidth label='Applicable Gender'>
                                                        <MenuItem value='ALL'>All</MenuItem>
                                                        <MenuItem value='MALE'>Male</MenuItem>
                                                        <MenuItem value='FEMALE'>Female</MenuItem>
                                                        <MenuItem value='OTHER'>Other</MenuItem>
                                                    </CustomTextField>
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>Employment Types</Typography>
                                            <Controller name={`${p}.applicableEmploymentTypes`} control={control}
                                                render={({ field }) => (
                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                        {['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'].map(type => {
                                                            const checked = field.value?.includes(type)
                                                            return (
                                                                <Chip key={type} label={type.replace('_', ' ')} clickable size='small'
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

                                        {/* Gender restriction toggle (policy-level) */}
                                        {watch(`${p}.applicableGender`) !== 'ALL' && (
                                            <>
                                                <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Controller name={`${p}.genderRestriction.enabled`} control={control}
                                                        render={({ field }) => (
                                                            <FormControlLabel
                                                                control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                                                                label='Enable Gender Restriction'
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                {genderEnabled && (
                                                    <Grid item xs={12} sm={6}>
                                                        <Controller name={`${p}.genderRestriction.gender`} control={control}
                                                            render={({ field }) => (
                                                                <CustomTextField {...field} select fullWidth label='Restricted To'>
                                                                    <MenuItem value='male'>Male</MenuItem>
                                                                    <MenuItem value='female'>Female</MenuItem>
                                                                    <MenuItem value='other'>Other</MenuItem>
                                                                </CustomTextField>
                                                            )}
                                                        />
                                                    </Grid>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                )
            })}
        </Box>
    )
}

// ─── Leave Policy Drawer ──────────────────────────────────────────────────────

const LeavePolicyDrawer = ({ open, onClose, editData, onSuccess }) => {
    const [saving, setSaving] = useState(false)
    const isEdit = Boolean(editData?._id)

    // Fetch master leave types once when drawer mounts
    const { leaveTypes: masterLeaveTypes, loading: masterLoading } = useMasterLeaveTypes()

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm({ defaultValues: defaultPolicyValues })

    useEffect(() => {
        if (open) {
            reset(editData ? { ...defaultPolicyValues, ...editData } : defaultPolicyValues)
        }
    }, [open, editData])

    const onSubmit = async (data) => {
        setSaving(true)
        try {
            const res = isEdit
                ? await axiosRequest.put(`/api/v1/leave/policies/${editData._id}`, data)
                : await axiosRequest.post('/api/v1/leave/policies', data)

            // interceptor pattern: res.success + res.data
            if (res?.success) {
                toast.success(`Leave policy ${isEdit ? 'updated' : 'created'}`)
                onSuccess(res.data, isEdit)
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
            PaperProps={{ sx: { width: { xs: '100%', sm: 760 } } }}
        >
            {/* Header */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 5, py: 4, borderBottom: t => `1px solid ${t.palette.divider}`
            }}>
                <Box>
                    <Typography variant='h6'>{isEdit ? 'Edit Leave Policy' : 'New Leave Policy'}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                        Group leave types and define policy-level overrides
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size='small'><Icon icon='tabler:x' /></IconButton>
            </Box>

            <Box component='form' onSubmit={handleSubmit(onSubmit)}
                sx={{ px: 5, py: 4, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}
            >

                {/* ── Policy Meta ───────────────────────────── */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
                        Policy Details
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={8}>
                            <Controller name='name' control={control} rules={{ required: 'Policy name required' }}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field} fullWidth label='Policy Name *'
                                        error={!!errors.name} helperText={errors.name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Controller name='status' control={control}
                                render={({ field }) => (
                                    <CustomTextField {...field} select fullWidth label='Status'>
                                        <MenuItem value='active'>Active</MenuItem>
                                        <MenuItem value='inactive'>Inactive</MenuItem>
                                    </CustomTextField>
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
                        <Grid item xs={12} sm={6}>
                            <Controller name='effectiveFrom' control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field} fullWidth type='date' label='Effective From'
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* ── Applicability ─────────────────────────── */}
                <Box>
                    <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
                        Applicability
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
                                Employment Types
                            </Typography>
                            <Controller name='applicableFor.employmentTypes' control={control}
                                render={({ field }) => (
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {EMPLOYMENT_TYPES.map(type => {
                                            const checked = field.value?.includes(type)
                                            return (
                                                <Chip key={type} label={type} clickable size='small'
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

                <Divider />

                {/* ── Leave Types ───────────────────────────── */}
                <LeaveTypesSection
                    control={control}
                    watch={watch}
                    setValue={setValue}
                    masterLeaveTypes={masterLeaveTypes}
                    masterLoading={masterLoading}
                />

                {/* Footer */}
                <Box sx={{ mt: 'auto', pt: 4, display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                    <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button type='submit' variant='contained' disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}
                    >
                        {saving ? 'Saving...' : isEdit ? 'Update Policy' : 'Create Policy'}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    )
}

// ─── TabLeavePolicy — list view ───────────────────────────────────────────────

const TabLeavePolicy = () => {
    const [policies, setPolicies] = useState([])
    const [loading, setLoading] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editData, setEditData] = useState(null)

    // Correct interceptor pattern: res.success + res.data (not res.data.success)
    const fetchPolicies = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axiosRequest.get('/api/v1/leave/policies')
            if (res?.success) {
                setPolicies(res.data)
            }
        } catch {
            toast.error('Failed to load leave policies')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchPolicies() }, [fetchPolicies])

    const handleSuccess = (record, isEdit) => {
        setPolicies(prev =>
            isEdit
                ? prev.map(p => (p._id === record._id ? record : p))
                : [...prev, record]
        )
    }

    return (
        <Card>
            <CardHeader
                title='Leave Policies'
                subheader='Group master leave types into policies and override settings per policy'
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} variant='rectangular' height={90} sx={{ borderRadius: 2 }} />
                        ))}
                    </Box>
                ) : policies.length === 0 ? (
                    <Alert severity='info'>No leave policies yet. Create your first one.</Alert>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {policies.map(policy => (
                            <Box key={policy._id} sx={{
                                p: 4,
                                border: t => `1px solid ${t.palette.divider}`,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 2
                            }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    {/* Policy name + status */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                                        <Typography fontWeight={600}>{policy.name}</Typography>
                                        <Chip
                                            label={policy.status}
                                            size='small'
                                            color={policy.status === 'active' ? 'success' : 'default'}
                                            variant='tonal'
                                        />
                                    </Box>

                                    {/* Meta line */}
                                    <Typography variant='caption' color='text.secondary'>
                                        {policy.leaveTypes?.length || 0} leave type{policy.leaveTypes?.length !== 1 ? 's' : ''} ·{' '}
                                        Effective: {policy.effectiveFrom
                                            ? new Date(policy.effectiveFrom).toLocaleDateString('en-IN')
                                            : 'Not set'}
                                        {policy.description && ` · ${policy.description}`}
                                    </Typography>

                                    {/* Leave type chips — mapped from API response */}
                                    {policy.leaveTypes?.length > 0 && (
                                        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                                            {policy.leaveTypes.map((lt, i) => (
                                                <Tooltip
                                                    key={lt.leaveTypeId || lt.code || i}
                                                    title={`${lt.defaultDaysPerYear ?? lt.credit?.totalPerYear ?? '?'} days/yr · ${lt.isPaid ? 'Paid' : 'Unpaid'}`}
                                                >
                                                    <Chip
                                                        label={lt.code || lt.name}
                                                        size='small'
                                                        variant='outlined'
                                                        sx={{
                                                            borderColor: lt.colorCode || '#6B7280',
                                                            color: lt.colorCode || 'text.primary',
                                                            backgroundColor: (lt.colorCode || '#6B7280') + '18'
                                                        }}
                                                    />
                                                </Tooltip>
                                            ))}
                                        </Box>
                                    )}

                                    {/* Applicability */}
                                    {policy.applicableFor?.employmentTypes?.length > 0 && (
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                            {policy.applicableFor.employmentTypes.map(type => (
                                                <Chip key={type} label={type} size='small' variant='tonal' color='secondary' />
                                            ))}
                                        </Box>
                                    )}
                                </Box>

                                {/* Actions */}
                                <Tooltip title='Edit Policy'>
                                    <IconButton size='small' onClick={() => { setEditData(policy); setDrawerOpen(true) }}>
                                        <Icon icon='tabler:pencil' fontSize='1.1rem' />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>

            <LeavePolicyDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                editData={editData}
                onSuccess={handleSuccess}
            />
        </Card>
    )
}

export default TabLeavePolicy