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

  const [suspendOpen, setSuspendOpen] = useState(false)
  const [suspending, setSuspending]   = useState(false)

  if (!company) return null

  // ── Formatted dates ────────────────────────────────────────────────────────
  const fmt = dateStr =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
      : '—'

  const createdFormatted  = fmt(company.createdAt)
  const updatedFormatted  = fmt(company.updatedAt)

  // ── Suspend ────────────────────────────────────────────────────────────────
  const handleSuspend = async () => {
    try {
      setSuspending(true)
      await dispatch(updateCompany({ id: company._id || company.id, payload: { status: 'Inactive' } }))
      setSuspendOpen(false)
    } finally {
      setSuspending(false)
    }
  }

  // Map API fields to display
  const displayName = company.company_name || company.companyName || 'Unnamed'
  const displayCode = company.company_code || company.companyCode || company.tenantCode || '—'
  const displayEmail = company.company_email || company.companyEmail || '—'
  const displayPhone = company.company_phone || company.companyPhone || '—'

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
          {company.status !== 'Inactive' && (
            <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button color='error' variant='tonal' onClick={() => setSuspendOpen(true)}>
                Suspend
              </Button>
            </CardActions>
          )}

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
          <Typography variant='h4'>Suspend Company</Typography>
          <Typography color='text.secondary' sx={{ mt: 2 }}>
            Are you sure you want to suspend <strong>{displayName}</strong>?
            Their status will be set to Inactive.
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
            variant='contained' color='error'
            onClick={handleSuspend} disabled={suspending}
            startIcon={suspending ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {suspending ? 'Suspending…' : 'Suspend'}
          </Button>
          <Button variant='tonal' color='secondary' onClick={() => setSuspendOpen(false)} disabled={suspending}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

    </Grid>
  )
}

export default CompanyViewLeft