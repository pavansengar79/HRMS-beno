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
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import LoadingButton from '@mui/lab/LoadingButton'

// ** Icons
import Icon from 'src/@core/components/icon'
import { HOLIDAY_TYPES } from 'src/store/calendar/leaveSlice'
import { HOLIDAY_TYPE_CONFIG } from 'src/views/apps/calendar/SidebarLeft'

// ** Store


// ─── Default form state ─────────────────────────────────────────────────────
const defaultValues = {
    title: '',
    date: '',
    type: HOLIDAY_TYPES.NATIONAL,
    description: '',
    isOptional: false
}

// ─── Component ──────────────────────────────────────────────────────────────
const AddHolidaySidebar = ({
    store,
    dispatch,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    drawerWidth = 400,
    open,
    onClose,
    canEdit,            // boolean: has permission holiday.update or role==='tenant_admin'
    selectedHoliday,    // null → add mode, object → edit mode
    clearSelectedHoliday
}) => {
    const [values, setValues] = useState(defaultValues)
    const [loading, setLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const isEditMode = !!selectedHoliday

    // Populate form on edit
    useEffect(() => {
        if (selectedHoliday) {
            setValues({
                title: selectedHoliday.title || '',
                date: selectedHoliday.date || '',
                type: selectedHoliday.type || HOLIDAY_TYPES.NATIONAL,
                description: selectedHoliday.description || '',
                isOptional: selectedHoliday.isOptional ?? false
            })
        } else {
            setValues(defaultValues)
        }
    }, [selectedHoliday])

    const handleClose = () => {
        setValues(defaultValues)
        dispatch(clearSelectedHoliday())
        onClose()
    }

    const handleChange = field => e => {
        setValues(prev => ({ ...prev, [field]: e.target.value }))
    }

    const handleToggle = field => e => {
        setValues(prev => ({ ...prev, [field]: e.target.checked }))
    }

    const handleSubmit = async () => {
        if (!values.title.trim() || !values.date) return
        setLoading(true)
        try {
            if (isEditMode) {
                await dispatch(updateHoliday({ ...selectedHoliday, ...values }))
            } else {
                await dispatch(addHoliday(values))
            }
            handleClose()
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedHoliday?.id) return
        setDeleteLoading(true)
        try {
            await dispatch(deleteHoliday(selectedHoliday.id))
            handleClose()
        } finally {
            setDeleteLoading(false)
        }
    }

    const typeConfig = HOLIDAY_TYPE_CONFIG[values.type]

    return (
        <Drawer
            anchor='right'
            open={open}
            onClose={handleClose}
            ModalProps={{ keepMounted: true }}
            sx={{
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxShadow: '-4px 0 24px rgba(0,0,0,0.08)'
                }
            }}
        >
            {/* ── Header ── */}
            <Box
                sx={{
                    px: 5,
                    py: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: typeConfig?.lightColor + '60' || 'background.default'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: typeConfig?.color || 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Icon
                            icon={typeConfig?.icon || 'tabler:calendar'}
                            style={{ color: '#fff', fontSize: 18 }}
                        />
                    </Box>
                    <Box>
                        <Typography variant='h6' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {isEditMode ? 'Edit Holiday' : 'Add Holiday'}
                        </Typography>
                        {isEditMode && (
                            <Chip
                                label={values.type}
                                size='small'
                                sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    mt: 0.5,
                                    bgcolor: typeConfig?.color,
                                    color: '#fff'
                                }}
                            />
                        )}
                    </Box>
                </Box>
                <IconButton onClick={handleClose} size='small'>
                    <Icon icon='tabler:x' />
                </IconButton>
            </Box>

            {/* ── Permission guard ── */}
            {!canEdit && (
                <Alert
                    severity='info'
                    icon={<Icon icon='tabler:lock' />}
                    sx={{ mx: 5, mt: 4, borderRadius: 2 }}
                >
                    You have view-only access. Contact your admin to make changes.
                </Alert>
            )}

            {/* ── Form ── */}
            <Box sx={{ p: 5, overflowY: 'auto', height: '100%' }}>
                {/* Title */}
                <Box sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        label='Holiday Name'
                        placeholder='e.g. Republic Day'
                        value={values.title}
                        onChange={handleChange('title')}
                        disabled={!canEdit}
                        InputProps={{
                            startAdornment: (
                                <Icon icon='tabler:calendar-event' style={{ marginRight: 8, opacity: 0.5 }} />
                            )
                        }}
                    />
                </Box>

                {/* Date */}
                <Box sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        type='date'
                        label='Date'
                        value={values.date}
                        onChange={handleChange('date')}
                        disabled={!canEdit}
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>

                {/* Type */}
                <Box sx={{ mb: 4 }}>
                    <FormControl fullWidth disabled={!canEdit}>
                        <InputLabel>Holiday Type</InputLabel>
                        <Select value={values.type} label='Holiday Type' onChange={handleChange('type')}>
                            {Object.values(HOLIDAY_TYPES).map(type => {
                                const cfg = HOLIDAY_TYPE_CONFIG[type]
                                return (
                                    <MenuItem key={type} value={type}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 10, height: 10, borderRadius: '50%',
                                                    bgcolor: cfg.color, flexShrink: 0
                                                }}
                                            />
                                            <Typography variant='body2'>{type}</Typography>
                                        </Box>
                                    </MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                </Box>

                {/* Type info callout */}
                <Box
                    sx={{
                        mb: 4,
                        p: 3,
                        borderRadius: 2,
                        bgcolor: typeConfig?.lightColor + '80',
                        borderLeft: `3px solid ${typeConfig?.color}`,
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'flex-start'
                    }}
                >
                    <Icon icon='tabler:info-circle' style={{ color: typeConfig?.color, marginTop: 2, flexShrink: 0 }} />
                    <Typography variant='caption' sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        {typeConfig?.description}
                    </Typography>
                </Box>

                {/* Description */}
                <Box sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label='Description (optional)'
                        placeholder='Brief description of this holiday...'
                        value={values.description}
                        onChange={handleChange('description')}
                        disabled={!canEdit}
                    />
                </Box>

                {/* Optional toggle */}
                <Box
                    sx={{
                        mb: 5,
                        p: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
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
                        onChange={handleToggle('isOptional')}
                        disabled={!canEdit}
                    />
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* ── Actions ── */}
                {canEdit && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <LoadingButton
                            fullWidth
                            variant='contained'
                            loading={loading}
                            onClick={handleSubmit}
                            disabled={!values.title.trim() || !values.date}
                            startIcon={<Icon icon={isEditMode ? 'tabler:device-floppy' : 'tabler:plus'} />}
                        >
                            {isEditMode ? 'Save Changes' : 'Add Holiday'}
                        </LoadingButton>

                        {isEditMode && (
                            <LoadingButton
                                fullWidth
                                variant='outlined'
                                color='error'
                                loading={deleteLoading}
                                onClick={handleDelete}
                                startIcon={<Icon icon='tabler:trash' />}
                            >
                                Delete Holiday
                            </LoadingButton>
                        )}

                        <Button fullWidth variant='text' onClick={handleClose}>
                            Cancel
                        </Button>
                    </Box>
                )}

                {/* View-only close */}
                {!canEdit && (
                    <Button fullWidth variant='outlined' onClick={handleClose}>
                        Close
                    </Button>
                )}
            </Box>
        </Drawer>
    )
}

export default AddHolidaySidebar