// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const NEXT_STEPS_BY_PLAN = {
  basic: [
    'Add employees to your unit',
    'Configure leave policies from the dashboard',
    'Set up payroll structure',
    'Define working hours and shifts'
  ],
  standard: [
    'Add employees to your unit',
    'Configure leave policies',
    'Set up payroll structure',
    'Define attendance & shift settings',
    'Explore HR analytics'
  ],
  professional: [
    'Add employees to your unit',
    'Configure leave & payroll',
    'Invite your team managers',
    'Explore multi-location features',
    'Set up advanced reporting'
  ],
  enterprise: [
    'Our team will review your documents (1–2 business days)',
    'You will receive credentials for each Unit Admin via email',
    'Set up HR policies per unit from the dashboard',
    'Configure payroll, leave and attendance per unit',
    'Explore organisation-wide analytics'
  ]
}

const StepComplete = ({ formData, plan, onDashboard }) => {
  const isEnterprise = plan === 'enterprise'
  const nextSteps = NEXT_STEPS_BY_PLAN[plan] || NEXT_STEPS_BY_PLAN.standard

  const companyName = isEnterprise
    ? formData?.orgData?.orgName || 'Your Organisation'
    : formData?.unitData?.companyName || 'Your Company'

  return (
    <>
      <Box sx={{ textAlign: 'center', py: 4 }}>
        {/* Success icon */}
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: isEnterprise ? 'warning.lighter' : 'success.lighter',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            position: 'relative'
          }}
        >
          <Icon
            icon={isEnterprise ? 'tabler:building-skyscraper' : 'tabler:confetti'}
            fontSize='3rem'
            style={{ color: isEnterprise ? 'var(--mui-palette-warning-main)' : 'var(--mui-palette-success-main)' }}
          />
          <Box
            sx={{
              position: 'absolute', bottom: 0, right: 0,
              width: 32, height: 32, borderRadius: '50%',
              bgcolor: 'success.main',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff'
            }}
          >
            <Icon icon='tabler:check' fontSize='1rem' style={{ color: '#fff' }} />
          </Box>
        </Box>

        <Typography variant='h3' sx={{ mb: 1.5 }}>
          {isEnterprise ? 'Application Submitted!' : 'Welcome Aboard!'}
        </Typography>
        <Typography sx={{ color: 'text.secondary', maxWidth: 520, mx: 'auto', mb: 4 }}>
          {isEnterprise
            ? 'Your enterprise onboarding application has been received. Our team will review your documents and reach out within 1–2 business days.'
            : 'Your account and unit have been set up successfully. You can now start managing your HR operations.'}
        </Typography>

        {/* Summary */}
        <Paper
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, maxWidth: 520, mx: 'auto', mb: 4, textAlign: 'left' }}
        >
          <Typography variant='overline' sx={{ color: 'text.secondary', letterSpacing: 1, mb: 2, display: 'block' }}>
            Setup Summary
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: isEnterprise ? 'warning.lighter' : 'success.lighter' }}>
              <Icon
                icon={isEnterprise ? 'tabler:building-skyscraper' : 'tabler:building'}
                style={{ color: isEnterprise ? 'var(--mui-palette-warning-main)' : 'var(--mui-palette-success-main)' }}
              />
            </Avatar>
            <Box>
              <Typography variant='caption' sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                {isEnterprise ? 'Organisation' : 'Company / Unit'}
              </Typography>
              <Typography variant='body1' fontWeight={700}>{companyName}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              icon={<Icon icon='tabler:package' fontSize='0.875rem' />}
              label={`${plan?.charAt(0).toUpperCase()}${plan?.slice(1)} Plan`}
              size='small'
              color={isEnterprise ? 'warning' : 'primary'}
              variant='tonal'
              sx={{ fontWeight: 600 }}
            />
            {!isEnterprise && formData?.billingData?.billingCycle && (
              <Chip
                icon={<Icon icon='tabler:calendar' fontSize='0.875rem' />}
                label={formData.billingData.billingCycle === 'yearly' ? 'Annual Billing' : 'Monthly Billing'}
                size='small'
                color='info'
                variant='tonal'
                sx={{ fontWeight: 600 }}
              />
            )}
            {isEnterprise && formData?.orgData?.companies && (
              <Chip
                icon={<Icon icon='tabler:buildings' fontSize='0.875rem' />}
                label={`${formData.orgData.companies.length} Company`}
                size='small'
                color='info'
                variant='tonal'
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
        </Paper>

        {/* Enterprise review notice */}
        {isEnterprise && (
          <Alert
            severity='info'
            icon={<Icon icon='tabler:mail' />}
            sx={{ maxWidth: 520, mx: 'auto', mb: 4, borderRadius: 2, textAlign: 'left' }}
          >
            You'll receive a confirmation email at <strong>{formData?.personalData?.email}</strong>. Each Unit Admin will receive their login credentials separately once approved.
          </Alert>
        )}

        {/* What's next */}
        <Paper
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, maxWidth: 520, mx: 'auto', mb: 5, textAlign: 'left' }}
        >
          <Typography variant='body1' fontWeight={700} sx={{ mb: 1.5 }}>
            What's next:
          </Typography>
          <List dense disablePadding>
            {nextSteps.map((step, i) => (
              <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Icon
                    icon='tabler:circle-check-filled'
                    fontSize='1rem'
                    style={{ color: 'var(--mui-palette-success-main)' }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={step}
                  primaryTypographyProps={{ variant: 'body2', sx: { color: 'text.secondary' } }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* CTA */}
        {!isEnterprise && (
          <Button
            variant='contained'
            size='large'
            startIcon={<Icon icon='tabler:layout-dashboard' />}
            onClick={onDashboard}
            sx={{ px: 5, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: 15 }}
          >
            Go to Dashboard
          </Button>
        )}

        {isEnterprise && (
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            <Icon icon='tabler:clock' style={{ marginRight: 6, fontSize: 14, verticalAlign: 'middle' }} />
            You'll be redirected to your dashboard once your application is approved.
          </Typography>
        )}
      </Box>
    </>
  )
}

export default StepComplete
