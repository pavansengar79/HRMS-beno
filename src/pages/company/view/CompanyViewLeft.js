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
  ACTIVE:   'success',
  INACTIVE: 'secondary',
  PENDING:  'warning'
}

const PLAN_COLOR = {
  TRIAL:      'warning',
  BASIC:      'primary',
  STANDARD:   'info',
  ENTERPRISE: 'error'
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

  const signupFormatted    = fmt(company.signupDate)
  const trialEndsFormatted = fmt(company.trialEndsAt)
  const updatedFormatted   = fmt(company.updatedAt)

  // ── Suspend ────────────────────────────────────────────────────────────────
  const handleSuspend = async () => {
    try {
      setSuspending(true)
      await dispatch(updateCompany({ id: company.id, payload: { status: 'INACTIVE' } }))
      setSuspendOpen(false)
    } finally {
      setSuspending(false)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>

          {/* ── Avatar + Name + Plan chip ──────────────────────── */}
          <CardContent sx={{ pt: 13.5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <CustomAvatar
              skin='light' variant='rounded' color='primary'
              sx={{ width: 100, height: 100, mb: 4, fontSize: '3rem' }}
            >
              {getInitials(company.companyName && company.companyName !== '—' ? company.companyName : 'NA')}
            </CustomAvatar>

            <Typography variant='h4' sx={{ mb: 3 }}>
              {company.companyName || 'Unnamed'}
            </Typography>

            <CustomChip
              rounded skin='light' size='small'
              label={company.plan}
              color={PLAN_COLOR[company.plan] || 'primary'}
              sx={{ textTransform: 'capitalize' }}
            />
          </CardContent>

          {/* ── Stats row ──────────────────────────────────────── */}
          <CardContent sx={{ pt: theme => `${theme.spacing(2)} !important` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                  <Icon fontSize='1.75rem' icon='tabler:users' />
                </CustomAvatar>
                <div>
                  <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    {company.usage?.totalEmployees ?? 0}
                  </Typography>
                  <Typography variant='body2'>Employees</Typography>
                </div>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                  <Icon fontSize='1.75rem' icon='tabler:calendar' />
                </CustomAvatar>
                <div>
                  <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    {signupFormatted}
                  </Typography>
                  <Typography variant='body2'>Signed Up</Typography>
                </div>
              </Box>

            </Box>
          </CardContent>

          <Divider sx={{ my: '0 !important', mx: 6 }} />

          {/* ── Company Details ─────────────────────────────────── */}
          <CardContent sx={{ pb: 4 }}>
            <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
              Details
            </Typography>

            <Box sx={{ pt: 4 }}>
              {[
                { label: 'Tenant Code',  value: company.tenantCode },
                { label: 'Company',      value: company.companyName },
                { label: 'Email',        value: company.companyEmail },
                { label: 'Phone',        value: company.companyPhone },
                { label: 'Pay Schedule', value: company.paySchedule },
                { label: 'Year Type',    value: company.yearType },
                { label: 'Trial Ends',   value: trialEndsFormatted },
                { label: 'Last Updated', value: updatedFormatted },
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

              {/* Status chip */}
              <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
                <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 120 }}>
                  Status:
                </Typography>
                <CustomChip
                  rounded skin='light' size='small'
                  label={company.status || 'ACTIVE'}
                  color={STATUS_COLOR[company.status] || 'success'}
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>

              {/* Onboarding chip */}
              <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
                <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 120 }}>
                  Onboarding:
                </Typography>
                <CustomChip
                  rounded skin='light' size='small'
                  label={company.isOnboardingComplete ? 'Complete' : 'Pending'}
                  color={company.isOnboardingComplete ? 'success' : 'warning'}
                />
              </Box>
            </Box>
          </CardContent>

          <Divider sx={{ my: '0 !important', mx: 6 }} />

          {/* ── Working Hours ───────────────────────────────────── */}
          {company.workingHours && (
            <CardContent sx={{ pb: 4 }}>
              <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mb: 3 }}>
                Working Hours
              </Typography>
              {[
                { label: 'Start Time',  value: company.workingHours.startTime },
                { label: 'End Time',    value: company.workingHours.endTime },
                { label: 'Saturday',    value: company.workingHours.saturdayType },
                { label: 'Working Days', value: company.workingHours.workingDays?.join(', ') },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', mb: 2 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 120 }}>
                    {label}:
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{value || '—'}</Typography>
                </Box>
              ))}
            </CardContent>
          )}

          <Divider sx={{ my: '0 !important', mx: 6 }} />

          {/* ── Leave Policy ────────────────────────────────────── */}
          {company.leavePolicy && (
            <CardContent sx={{ pb: 4 }}>
              <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mb: 3 }}>
                Leave Policy
              </Typography>
              {[
                { label: 'Annual Leave', value: `${company.leavePolicy.annualLeave} days` },
                { label: 'Sick Leave',   value: `${company.leavePolicy.sickLeave} days` },
                { label: 'Casual Leave', value: `${company.leavePolicy.casualLeave} days` },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', mb: 2 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 120 }}>
                    {label}:
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{value}</Typography>
                </Box>
              ))}
            </CardContent>
          )}

          {/* ── Actions ────────────────────────────────────────── */}
          {company.status !== 'INACTIVE' && (
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
            Are you sure you want to suspend <strong>{company.companyName}</strong>?
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