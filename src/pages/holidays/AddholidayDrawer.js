// ** React
import { useEffect, useState } from 'react'

// ** MUI
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import LoadingButton from '@mui/lab/LoadingButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'

// ** Icons
import Icon from 'src/@core/components/icon'

// ** Store
import { HOLIDAY_TYPES } from 'src/store/holiday/holidaySlice'

// ─── Type config (colors + metadata) ─────────────────────────────────────────
export const HOLIDAY_TYPE_CONFIG = {
  [HOLIDAY_TYPES.NATIONAL]: {
    label: 'National',
    color: '#1565C0',
    lightColor: '#DBEAFE',
    icon: 'tabler:flag',
    description: 'Public holidays declared by the central government, observed nationwide.',
  },
  [HOLIDAY_TYPES.REGIONAL]: {
    label: 'Regional',
    color: '#6A1B9A',
    lightColor: '#F3E5F5',
    icon: 'tabler:map-pin',
    description: 'State or regional holidays applicable to specific locations.',
  },
  [HOLIDAY_TYPES.RELIGIOUS]: {
    label: 'Religious',
    color: '#E65100',
    lightColor: '#FFF3E0',
    icon: 'tabler:star-crescent',
    description: 'Festivals and observances tied to religion or cultural traditions.',
  },
  [HOLIDAY_TYPES.OPTIONAL]: {
    label: 'Optional',
    color: '#B45309',
    lightColor: '#FEF3C7',
    icon: 'tabler:hand-click',
    description: 'Employees may choose to avail these holidays from a restricted list.',
  },
  [HOLIDAY_TYPES.COMPANY]: {
    label: 'Company',
    color: '#00695C',
    lightColor: '#E0F2F1',
    icon: 'tabler:building',
    description: 'Company-specific holidays declared internally for the organization.',
  },
}

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = values => {
  const errs = {}
  if (!values.name.trim())           errs.name = 'Holiday name is required'
  if (values.name.trim().length > 100) errs.name = 'Name must be 100 characters or less'
  if (!values.date)                  errs.date = 'Date is required'
  if (!values.type)                  errs.type = 'Type is required'
  if (!values.year || isNaN(Number(values.year))) errs.year = 'Valid year is required'
  if (Number(values.year) < 2000 || Number(values.year) > 2100) errs.year = 'Year must be between 2000 and 2100'
  return errs
}

// ─── Default form ─────────────────────────────────────────────────────────────
const defaultValues = {
  name:        '',
  date:        '',
  type:        HOLIDAY_TYPES.NATIONAL,
  description: '',
  isOptional:  false,
  year:        new Date().getFullYear(),
}

// ─── Component ────────────────────────────────────────────────────────────────
const AddHolidaySidebar = ({
  store,
  dispatch,
  addHoliday,
  deleteHoliday,
  drawerWidth = 420,
  open,
  onClose,
  canEdit,          // true only for tenant_admin
  selectedHoliday,  // null → add mode | object → view/delete mode
  clearSelectedHoliday,
}) => {
  const [values, setValues]           = useState(defaultValues)
  const [errors, setErrors]           = useState({})
  const [touched, setTouched]         = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isEditMode = !!selectedHoliday
  // No PUT in the API — edit mode is view-only (can delete)
  // Add mode → POST /holidays

  // ── Populate on open ──────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedHoliday) {
      setValues({
        name:        selectedHoliday.name        || '',
        date:        selectedHoliday.date        || '',
        type:        selectedHoliday.type        || HOLIDAY_TYPES.NATIONAL,
        description: selectedHoliday.description || '',
        isOptional:  selectedHoliday.isOptional  ?? false,
        year:        selectedHoliday.year        || new Date().getFullYear(),
      })
    } else {
      setValues(defaultValues)
    }
    setErrors({})
    setTouched({})
  }, [selectedHoliday, open])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleClose = () => {
    dispatch(clearSelectedHoliday())
    onClose()
  }

  const handleChange = field => e => {
    const val = e.target.value
    setValues(prev => ({ ...prev, [field]: val }))
    // Live-validate touched fields
    if (touched[field]) {
      const errs = validate({ ...values, [field]: val })
      setErrors(prev => ({ ...prev, [field]: errs[field] }))
    }
  }

  const handleBlur = field => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const errs = validate(values)
    setErrors(prev => ({ ...prev, [field]: errs[field] }))
  }

  const handleToggle = e => {
    setValues(prev => ({ ...prev, isOptional: e.target.checked }))
  }

  // ── Submit — POST /holidays ───────────────────────────────────────────────
  const handleSubmit = async () => {
    // Touch all fields to show errors
    const allTouched = Object.fromEntries(Object.keys(defaultValues).map(k => [k, true]))
    setTouched(allTouched)

    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const payload = {
      name:        values.name.trim(),
      date:        values.date,
      type:        values.type,
      year:        Number(values.year),
      ...(values.description.trim() && { description: values.description.trim() }),
      isOptional:  values.isOptional,
    }

    const result = await dispatch(addHoliday(payload))
    if (!result.error) {
      handleClose()
    }
  }

  // ── Delete — DELETE /holidays/:id ────────────────────────────────────────
  const handleConfirmDelete = async () => {
    setConfirmDelete(false)
    const result = await dispatch(deleteHoliday(selectedHoliday.id))
    if (!result.error) {
      handleClose()
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const typeConfig     = HOLIDAY_TYPE_CONFIG[values.type] || HOLIDAY_TYPE_CONFIG[HOLIDAY_TYPES.NATIONAL]
  const addLoading     = store?.addLoading    || false
  const deleteLoading  = store?.deleteLoading || false

  return (
    <>
      <Drawer
        anchor='right'
        open={open}
        onClose={handleClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: drawerWidth, display: 'flex', flexDirection: 'column' } }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            px: 5, py: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: typeConfig.lightColor + '70',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 38, height: 38, borderRadius: 2,
                bgcolor: typeConfig.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon icon={typeConfig.icon} style={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {isEditMode ? 'Holiday Details' : 'Add Holiday'}
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                {isEditMode
                  ? `ID: ${selectedHoliday?.id ?? '—'}`
                  : 'POST to /holidays'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size='small'>
            <Icon icon='tabler:x' />
          </IconButton>
        </Box>

        {/* ── Permission notice ── */}
        {!canEdit && (
          <Alert
            severity='info'
            icon={<Icon icon='tabler:lock' />}
            sx={{ mx: 5, mt: 4, borderRadius: 2, flexShrink: 0 }}
          >
            View-only access. Only <strong>tenant admins</strong> can create or delete holidays.
          </Alert>
        )}

        {/* ── Body ── */}
        <Box sx={{ p: 5, overflowY: 'auto', flex: 1 }}>

          {/* Name */}
          <TextField
            fullWidth
            label='Holiday Name *'
            placeholder='e.g. Republic Day'
            value={values.name}
            onChange={handleChange('name')}
            onBlur={handleBlur('name')}
            disabled={isEditMode || !canEdit}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 4 }}
            InputProps={{
              startAdornment: (
                <Icon icon='tabler:calendar-event' style={{ marginRight: 8, opacity: 0.5, fontSize: 18 }} />
              ),
            }}
          />

          {/* Date */}
          <TextField
            fullWidth
            type='date'
            label='Date *'
            value={values.date}
            onChange={handleChange('date')}
            onBlur={handleBlur('date')}
            disabled={isEditMode || !canEdit}
            error={!!errors.date}
            helperText={errors.date}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 4 }}
          />

          {/* Year */}
          <TextField
            fullWidth
            type='number'
            label='Year *'
            value={values.year}
            onChange={handleChange('year')}
            onBlur={handleBlur('year')}
            disabled={isEditMode || !canEdit}
            error={!!errors.year}
            helperText={errors.year || 'Calendar year for this holiday'}
            inputProps={{ min: 2000, max: 2100 }}
            sx={{ mb: 4 }}
            InputProps={{
              startAdornment: (
                <Icon icon='tabler:calendar' style={{ marginRight: 8, opacity: 0.5, fontSize: 18 }} />
              ),
            }}
          />

          {/* Type */}
          <FormControl fullWidth disabled={isEditMode || !canEdit} error={!!errors.type} sx={{ mb: 2 }}>
            <InputLabel>Holiday Type *</InputLabel>
            <Select value={values.type} label='Holiday Type *' onChange={handleChange('type')}>
              {Object.values(HOLIDAY_TYPES).map(type => {
                const cfg = HOLIDAY_TYPE_CONFIG[type]
                return (
                  <MenuItem key={type} value={type}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0 }} />
                      <Typography variant='body2'>{cfg.label}</Typography>
                    </Box>
                  </MenuItem>
                )
              })}
            </Select>
            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
          </FormControl>

          {/* Type description callout */}
          <Box
            sx={{
              mb: 4, p: 3, borderRadius: 2,
              bgcolor: typeConfig.lightColor + '80',
              borderLeft: `3px solid ${typeConfig.color}`,
              display: 'flex', gap: 1.5, alignItems: 'flex-start',
            }}
          >
            <Icon icon='tabler:info-circle' style={{ color: typeConfig.color, marginTop: 2, flexShrink: 0 }} />
            <Typography variant='caption' sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              {typeConfig.description}
            </Typography>
          </Box>

          {/* Description */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label='Description (optional)'
            placeholder='Brief description of this holiday…'
            value={values.description}
            onChange={handleChange('description')}
            disabled={isEditMode || !canEdit}
            sx={{ mb: 4 }}
          />

          {/* Optional toggle */}
          <Box
            sx={{
              mb: 5, p: 3,
              border: '1px solid', borderColor: 'divider', borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                Optional Holiday
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                Employees choose whether to avail this day
              </Typography>
            </Box>
            <Switch
              checked={values.isOptional}
              onChange={handleToggle}
              disabled={isEditMode || !canEdit}
            />
          </Box>

          {/* Edit-mode metadata chips */}
          {isEditMode && selectedHoliday && (
            <Box sx={{ mb: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                size='small'
                variant='tonal'
                color='primary'
                icon={<Icon icon='tabler:calendar' />}
                label={`Year: ${selectedHoliday.year}`}
              />
              <Chip
                size='small'
                variant='tonal'
                color={values.isOptional ? 'warning' : 'success'}
                icon={<Icon icon={values.isOptional ? 'tabler:hand-click' : 'tabler:lock-open'} />}
                label={values.isOptional ? 'Optional' : 'Mandatory'}
              />
            </Box>
          )}

          <Divider sx={{ mb: 4 }} />

          {/* ── Actions ── */}
          {canEdit ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!isEditMode && (
                <LoadingButton
                  fullWidth
                  variant='contained'
                  loading={addLoading}
                  onClick={handleSubmit}
                  startIcon={<Icon icon='tabler:plus' />}
                >
                  Add Holiday
                </LoadingButton>
              )}

              {isEditMode && (
                <LoadingButton
                  fullWidth
                  variant='outlined'
                  color='error'
                  loading={deleteLoading}
                  onClick={() => setConfirmDelete(true)}
                  startIcon={<Icon icon='tabler:trash' />}
                >
                  Delete Holiday
                </LoadingButton>
              )}

              <Button fullWidth variant='text' onClick={handleClose}>
                Cancel
              </Button>
            </Box>
          ) : (
            <Button fullWidth variant='outlined' onClick={handleClose}>
              Close
            </Button>
          )}
        </Box>
      </Drawer>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Icon icon='tabler:alert-triangle' style={{ color: '#d32f2f', fontSize: 24 }} />
          Delete Holiday
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{selectedHoliday?.name}</strong>?{' '}
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant='outlined' onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant='contained'
            color='error'
            loading={deleteLoading}
            onClick={handleConfirmDelete}
            startIcon={<Icon icon='tabler:trash' />}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AddHolidaySidebar