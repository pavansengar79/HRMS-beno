// src/views/leavemanagement/TabLeaveTypes.jsx
// Integrated from policyWizard StepLeaveTypes + LeaveTypeDrawer, now using Redux
import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'

import { fetchLeaveTypes, createLeaveType, updateLeaveType } from 'src/store/leaves/leaveSlice'

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
  { value: 'ALL',    label: 'All'    },
  { value: 'MALE',   label: 'Male'   },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER',  label: 'Other'  },
]

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']

const COLOR_PRESETS = [
  '#10B981', '#4F46E5', '#F59E0B', '#EF4444',
  '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
  '#F97316', '#6B7280',
]

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
  maxConsecutiveDays: '',
  applicableGender: 'ALL',
  applicableEmploymentTypes: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'],
  requiresDocumentAfterDays: '',
  isActive: true,
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
  const dispatch = useDispatch()
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(editData?._id)

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: defaultLeaveTypeValues
  })

  const carryForwardAllowed = watch('isCarryForwardAllowed')
  const selectedColor = watch('colorCode')

  useEffect(() => {
    if (open) {
      if (editData) {
        reset({
          ...defaultLeaveTypeValues,
          ...editData,
          maxConsecutiveDays: editData.maxConsecutiveDays ?? '',
          requiresDocumentAfterDays: editData.requiresDocumentAfterDays ?? '',
          applicableEmploymentTypes: editData.applicableEmploymentTypes ?? ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'],
        })
      } else {
        reset(defaultLeaveTypeValues)
      }
    }
  }, [open, editData, reset])

  const buildPayload = (data) => ({
    name: data.name,
    code: data.code,
    accrualRatePerMonth: Number(data.accrualRatePerMonth),
    carryForwardLimit: Number(data.carryForwardLimit),
    isPaid: data.isPaid,
    colorCode: data.colorCode,
    defaultDaysPerYear: Number(data.defaultDaysPerYear),
    isCarryForwardAllowed: data.isCarryForwardAllowed,
    isEncashmentAllowed: data.isEncashmentAllowed,
    isHalfDayAllowed: data.isHalfDayAllowed,
    isSandwichApplicable: data.isSandwichApplicable,
    minNoticeDays: Number(data.minNoticeDays),
    maxConsecutiveDays: data.maxConsecutiveDays === '' ? null : Number(data.maxConsecutiveDays),
    applicableGender: data.applicableGender,
    applicableEmploymentTypes: data.applicableEmploymentTypes,
    requiresDocumentAfterDays: data.requiresDocumentAfterDays === '' ? null : Number(data.requiresDocumentAfterDays),
    isActive: data.isActive,
  })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const payload = buildPayload(data)
      if (isEdit) {
        await dispatch(updateLeaveType({ id: editData._id, payload })).unwrap()
        toast.success('Leave type updated successfully')
      } else {
        await dispatch(createLeaveType(payload)).unwrap()
        toast.success('Leave type created successfully')
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer open={open} anchor='right' onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 5, py: 4, borderBottom: theme => `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant='h6'>{isEdit ? 'Edit Leave Type' : 'Add Leave Type'}</Typography>
        <IconButton onClick={onClose} size='small'><Icon icon='tabler:x' /></IconButton>
      </Box>

      {/* Body */}
      <Box
        component='form'
        onSubmit={handleSubmit(onSubmit)}
        sx={{ px: 5, py: 4, overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}
      >

        {/* ── Basic Info ── */}
        <Box>
          <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Basic Info</Typography>
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
        </Box>

        <Divider />

        {/* ── Credit & Days ── */}
        <Box>
          <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Credit & Days</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='defaultDaysPerYear' control={control}
                rules={{ required: 'Required' }}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number' label='Default Days / Year *'
                    error={!!errors.defaultDaysPerYear} helperText={errors.defaultDaysPerYear?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='accrualRatePerMonth' control={control}
                rules={{ required: 'Required' }}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number' label='Accrual Rate / Month *' placeholder='1.25'
                    error={!!errors.accrualRatePerMonth} helperText={errors.accrualRatePerMonth?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name='minNoticeDays' control={control}
                render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Min Notice Days' />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name='maxConsecutiveDays' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number' label='Max Consecutive Days' placeholder='Leave blank for no limit' />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* ── Carry Forward ── */}
        <Box>
          <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Carry Forward</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Controller name='isCarryForwardAllowed' control={control}
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
                <Controller name='carryForwardLimit' control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth type='number' label='Carry Forward Limit (Days)' />
                  )}
                />
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider />

        {/* ── Document Rule ── */}
        <Box>
          <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Document Rule</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Controller name='requiresDocumentAfterDays' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number'
                    label='Requires Document After (Days)' placeholder='Leave blank if not required' />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* ── Rules & Flags ── */}
        <Box>
          <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Rules & Flags</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {[
              { name: 'isPaid',                label: 'Paid Leave'        },
              { name: 'isEncashmentAllowed',   label: 'Allow Encashment'  },
              { name: 'isHalfDayAllowed',      label: 'Allow Half Day'    },
              { name: 'isSandwichApplicable',  label: 'Sandwich Rule'     },
              { name: 'isActive',              label: 'Active'            },
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
          </Box>
        </Box>

        <Divider />

        {/* ── Applicability ── */}
        <Box>
          <Typography variant='overline' color='text.secondary' sx={{ display: 'block', mb: 3 }}>Applicability</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Controller name='applicableGender' control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select fullWidth label='Applicable Gender'>
                    {GENDER_OPTIONS.map(g => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>Applicable Employment Types</Typography>
              <Controller name='applicableEmploymentTypes' control={control}
                render={({ field }) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {EMPLOYMENT_TYPES.map(type => {
                      const checked = field.value?.includes(type)
                      return (
                        <Chip
                          key={type} label={type.replace('_', ' ')} clickable size='small'
                          color={checked ? 'primary' : 'default'} variant={checked ? 'filled' : 'outlined'}
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

        {/* ── Footer ── */}
        <Box sx={{ mt: 'auto', pt: 4, display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
          <Button variant='tonal' color='secondary' onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            type='submit' variant='contained' disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

const TabLeaveTypes = () => {
  const dispatch = useDispatch()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editData, setEditData] = useState(null)

  const { leaveTypes, leaveTypesLoading } = useSelector(state => state.leaves)

  const fetchTypes = useCallback(() => { dispatch(fetchLeaveTypes()) }, [dispatch])
  useEffect(() => { fetchTypes() }, [fetchTypes])

  const openAdd  = () => { setEditData(null);  setDrawerOpen(true) }
  const openEdit = lt  => { setEditData(lt);    setDrawerOpen(true) }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant='h5'>Leave Types</Typography>
        <Button variant='contained' size='small' startIcon={<Icon icon='tabler:plus' />} onClick={openAdd}>
          Add Leave Type
        </Button>
      </Box>

      {/* List */}
      {leaveTypesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : leaveTypes.length === 0 ? (
        <Alert severity='info'>No leave types configured yet. Click "Add Leave Type" to get started.</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {leaveTypes.map(lt => (
            <Card key={lt._id} variant='outlined' sx={{ borderRadius: 2, borderLeft: `4px solid ${lt.colorCode || '#6B7280'}` }}>
              <CardContent sx={{ py: '12px !important', px: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>

                  {/* Name + code */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
                      backgroundColor: lt.colorCode || '#6B7280',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Typography variant='caption' fontWeight={700} color='white'>{lt.code}</Typography>
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
                    {lt.isCarryForwardAllowed  && <Chip label='Carry Fwd'   size='small' color='primary'   variant='tonal' />}
                    {lt.isEncashmentAllowed    && <Chip label='Encashable'  size='small' color='warning'   variant='tonal' />}
                    {lt.isHalfDayAllowed       && <Chip label='Half Day'    size='small' variant='tonal' />}
                    {lt.isSandwichApplicable   && <Chip label='Sandwich'    size='small' variant='tonal' />}
                    {lt.applicableGender !== 'ALL' && <Chip label={lt.applicableGender} size='small' color='secondary' variant='tonal' />}
                    {!lt.isActive              && <Chip label='Inactive'    size='small' color='default' />}
                  </Box>

                  {/* Edit */}
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
        onSuccess={fetchTypes}
      />
    </Box>
  )
}

export default TabLeaveTypes