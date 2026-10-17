// src/views/apps/company/view/CompanyViewLeft.jsx

// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'

// ** Redux
import { useDispatch } from 'react-redux'
import { updateCompany } from 'src/store/company/companySlice'
import { useSelector } from 'react-redux'
import { selectPermissions } from 'src/store/auth/authSlice'
import toast from 'react-hot-toast'

// ─── Color maps ───────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  Active:    'success',
  Suspended: 'warning',
  Inactive:  'error'
}

const SIZE_COLOR = {
  '1-10':     'primary',
  '11-50':    'info',
  '51-200':   'success',
  '201-500':  'warning',
  '500+':     'error'
}

// ─── CompanyViewLeft ──────────────────────────────────────────────────────────
const CompanyViewLeft = ({ company }) => {
  const dispatch = useDispatch()
  const permissions = useSelector(selectPermissions) || []
  const canEdit = permissions.includes('company.update')

  const [suspendOpen, setSuspendOpen] = useState(false)
  const [suspending, setSuspending]   = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({})

  if (!company) return null

  // ── Formatted dates ────────────────────────────────────────────────────────
  const fmt = dateStr =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
      : '—'

  const createdFormatted  = fmt(company.createdAt)
  const updatedFormatted  = fmt(company.updatedAt)

  // ── Suspend ────────────────────────────────────────────────────────────────
  const isInactive = company.status === 'Inactive' || company.status === 'Suspended'
  const handleStatusChange = async () => {
    try {
      setSuspending(true)
      await dispatch(updateCompany({ id: company._id || company.id, payload: { status: isInactive ? 'Active' : 'Inactive' } })).unwrap()
      setSuspendOpen(false)
    } catch (error) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Failed to update company status')
    } finally {
      setSuspending(false)
    }
  }

  // Map API fields to display
  const displayName = company.company_name || company.companyName || 'Unnamed'
  const displayCode = company.company_code || company.companyCode || company.tenantCode || '—'
  const displayEmail = company.company_email || company.companyEmail || '—'
  const displayPhone = company.company_phone || company.companyPhone || '—'

  const openEdit = () => {
    setEditForm({
      company_name: company.company_name || '',
      brand_name: company.brand_name || '',
      company_phone: company.company_phone || company.companyPhone || '',
      gst: company.gst || '',
      pan: company.pan || '',
      cin: company.cin || '',
      tan: company.tan || '',
      epfo: company.epfo || '',
      esic: company.esic || '',
      pt_state: company.pt_state || ''
    })
    setEditOpen(true)
  }

  const handleEditChange = event => {
    const { name, value } = event.target
    setEditForm(previous => ({
      ...previous,
      [name]: name === 'company_phone' ? value.replace(/\D/g, '').slice(0, 13) : value
    }))
  }

  const handleEditSave = async event => {
    event.preventDefault()
    const companyName = editForm.company_name?.trim()
    if (!companyName) {
      toast.error('Company name is required')
      return
    }

    try {
      setSaving(true)
      await dispatch(updateCompany({
        id: company._id || company.id,
        payload: { ...editForm, company_name: companyName }
      })).unwrap()
      setEditOpen(false)
      toast.success('Company details updated')
    } catch (error) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Failed to update company details')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>

          {/* ── Avatar + Name + Status chip ──────────────────────── */}
          <CardContent sx={{ pt: 13.5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <CustomAvatar
              skin='light' variant='rounded' color='primary'
              sx={{ width: 100, height: 100, mb: 4, fontSize: '3rem' }}
            >
              {getInitials(displayName !== '—' ? displayName : 'NA')}
            </CustomAvatar>

            <Typography variant='h4' sx={{ mb: 3 }}>
              {displayName}
            </Typography>

            <CustomChip
              rounded skin='light' size='small'
              label={company.status || 'Active'}
              color={STATUS_COLOR[company.status] || 'success'}
              sx={{ textTransform: 'capitalize' }}
            />
          </CardContent>

          {/* ── Stats row ──────────────────────────────────────── */}
          <CardContent sx={{ pt: theme => `${theme.spacing(2)} !important` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                  <Icon fontSize='1.75rem' icon='tabler:building-skyscraper' />
                </CustomAvatar>
                <div>
                  <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    {company.company_size || '—'}
                  </Typography>
                  <Typography variant='body2'>Company Size</Typography>
                </div>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                  <Icon fontSize='1.75rem' icon='tabler:calendar' />
                </CustomAvatar>
                <div>
                  <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    {createdFormatted}
                  </Typography>
                  <Typography variant='body2'>Created</Typography>
                </div>
              </Box>

            </Box>
          </CardContent>

          <Divider sx={{ my: '0 !important', mx: 6 }} />

          {/* ── Company Details ─────────────────────────────────── */}
          <CardContent sx={{ pb: 4 }}>
            <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
              Identity
            </Typography>

            <Box sx={{ pt: 4 }}>
              {[
                { label: 'Company Code', value: displayCode },
                { label: 'Company Name', value: displayName },
                { label: 'Brand Name',   value: company.brand_name || '—' },
                { label: 'Email',        value: displayEmail },
                { label: 'Phone',        value: displayPhone },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', mb: 3 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 120 }}>
                    {label}:
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {value || '—'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>

          {/* ── Statutory Compliance ─────────────────────────────── */}
          <Divider sx={{ my: '0 !important', mx: 6 }} />
          <CardContent sx={{ pb: 4 }}>
            <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mb: 3 }}>
              Statutory Compliance
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  { label: 'GST', value: company.gst },
                  { label: 'PAN', value: company.pan },
                  { label: 'CIN', value: company.cin },
                  { label: 'TAN', value: company.tan },
                ].map(item => (
                  <Chip
                    key={item.label}
                    label={item.value ? `${item.label}: ${item.value}` : `${item.label}: —`}
                    size='small'
                    variant='outlined'
                    color={item.value ? 'primary' : 'default'}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  { label: 'EPFO', value: company.epfo },
                  { label: 'ESIC', value: company.esic },
                  { label: 'PT State', value: company.pt_state },
                ].map(item => (
                  <Chip
                    key={item.label}
                    label={item.value ? `${item.label}: ${item.value}` : `${item.label}: —`}
                    size='small'
                    variant='outlined'
                    color={item.value ? 'success' : 'default'}
                  />
                ))}
              </Box>
            </Stack>
          </CardContent>

          {/* ── Working Hours ───────────────────────────────────── */}
          {company.working_hours && (
            <>
              <Divider sx={{ my: '0 !important', mx: 6 }} />
              <CardContent sx={{ pb: 4 }}>
                <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mb: 3 }}>
                  Working Hours
                </Typography>
                {[
                  { label: 'Start Time',  value: company.working_hours.start_time },
                  { label: 'End Time',    value: company.working_hours.end_time },
                  { label: 'Saturday',    value: company.working_hours.saturday_type?.replace(/_/g, ' ') },
                  { label: 'Working Days', value: company.working_hours.working_days?.join(', ') },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display: 'flex', mb: 2 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 120 }}>
                      {label}:
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{value || '—'}</Typography>
                  </Box>
                ))}
              </CardContent>
            </>
          )}

          {/* ── Leave Policy ────────────────────────────────────── */}
          {company.leave_policy && (
            <>
              <Divider sx={{ my: '0 !important', mx: 6 }} />
              <CardContent sx={{ pb: 4 }}>
                <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mb: 3 }}>
                  Leave Policy
                </Typography>
                {[
                  { label: 'Annual Leave', value: `${company.leave_policy.annual_leave} days` },
                  { label: 'Sick Leave',   value: `${company.leave_policy.sick_leave} days` },
                  { label: 'Casual Leave', value: `${company.leave_policy.casual_leave} days` },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display: 'flex', mb: 2 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 120 }}>
                      {label}:
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </>
          )}

          {/* ── Meta ────────────────────────────────────────────── */}
          <Divider sx={{ my: '0 !important', mx: 6 }} />
          <CardContent sx={{ pb: 4 }}>
            <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mb: 3 }}>
              Meta
            </Typography>
            {[
              { label: 'Onboarding Step', value: `${company.onboarding_step || 1}/5` },
              { label: 'Onboarding',      value: company.is_onboarding_complete ? 'Complete' : 'Pending' },
              { label: 'Last Updated',    value: updatedFormatted },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 140 }}>
                  {label}:
                </Typography>
                {label === 'Onboarding' ? (
                  <CustomChip
                    rounded skin='light' size='small'
                    label={value}
                    color={company.is_onboarding_complete ? 'success' : 'warning'}
                  />
                ) : (
                  <Typography sx={{ color: 'text.secondary' }}>{value || '—'}</Typography>
                )}
              </Box>
            ))}
          </CardContent>

          {/* ── Actions ────────────────────────────────────────── */}
          <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
            {canEdit && (
              <Button variant='contained' startIcon={<Icon icon='tabler:edit' />} onClick={openEdit}>
                Edit Details
              </Button>
            )}
            <Button color={isInactive ? 'success' : 'error'} variant='tonal' onClick={() => setSuspendOpen(true)}>
              {isInactive ? 'Activate' : 'Suspend'}
            </Button>
          </CardActions>

        </Card>
      </Grid>

      {/* ── Suspend Confirm Dialog ───────────────────────────────── */}
      <Dialog open={suspendOpen} onClose={() => !suspending && setSuspendOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle
          component='div'
          sx={{
            textAlign: 'center',
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          }}
        >
          <Typography variant='h4'>{isInactive ? 'Activate' : 'Suspend'} Company</Typography>
          <Typography color='text.secondary' sx={{ mt: 2 }}>
            Are you sure you want to {isInactive ? 'activate' : 'suspend'} <strong>{displayName}</strong>?
            Their status will be set to {isInactive ? 'Active' : 'Inactive'}.
          </Typography>
        </DialogTitle>
        <DialogActions
          sx={{
            justifyContent: 'center',
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
            gap: 3,
          }}
        >
          <Button
            variant='contained' color={isInactive ? 'success' : 'error'}
            onClick={handleStatusChange} disabled={suspending}
            startIcon={suspending ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {suspending ? 'Updating…' : isInactive ? 'Activate' : 'Suspend'}
          </Button>
          <Button variant='tonal' color='secondary' onClick={() => setSuspendOpen(false)} disabled={suspending}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => !saving && setEditOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Edit Company Details</DialogTitle>
        <Box component='form' onSubmit={handleEditSave}>
          <DialogContent dividers>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              {[
                { name: 'company_name', label: 'Company Name', required: true },
                { name: 'brand_name', label: 'Brand Name' },
                { name: 'company_phone', label: 'Phone Number', phone: true },
                { name: 'gst', label: 'GST' },
                { name: 'pan', label: 'PAN' },
                { name: 'cin', label: 'CIN' },
                { name: 'tan', label: 'TAN' },
                { name: 'epfo', label: 'EPFO' },
                { name: 'esic', label: 'ESIC' },
                { name: 'pt_state', label: 'PT State' }
              ].map(field => (
                <TextField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  value={editForm[field.name] || ''}
                  onChange={handleEditChange}
                  required={field.required}
                  fullWidth
                  {...(field.phone && {
                    type: 'tel',
                    inputProps: { inputMode: 'numeric', maxLength: 13, pattern: '[0-9]{0,13}' }
                  })}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant='tonal' color='secondary' onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type='submit' variant='contained' disabled={saving}>
              {saving ? <CircularProgress size={20} color='inherit' /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

    </Grid>
  )
}

export default CompanyViewLeft