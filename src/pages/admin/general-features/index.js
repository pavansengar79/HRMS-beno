// src/pages/admin/general-features/index.js
// General Features — Read-only reference: what every employee gets by default
// Visible to: org_admin, company_admin (reference/documentation screen)
// No API calls — purely presentational

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'

// ─── Data ──────────────────────────────────────────────────────────────────────

const SELF_SERVICE_FEATURES = [
  {
    title: 'View own dashboard',
    desc: "Today's attendance, leave balance, upcoming holidays, latest payslip card",
    color: 'success',
  },
  {
    title: 'Apply for leave',
    desc: 'Annual, Sick, Casual, Compensatory Off — request routed to Reporting Manager (L-05 · RM-02)',
    color: 'primary',
  },
  {
    title: 'View own leave balances and history',
    desc: 'Balance per type, accrual schedule, days taken, pending requests (L-04 · L-11)',
    color: 'info',
  },
  {
    title: 'View own attendance records',
    desc: 'Monthly calendar, clock-in/out times, OT hours, late arrivals (AT-02 · AT-03)',
    color: 'warning',
  },
  {
    title: 'Raise attendance regularisation',
    desc: 'Forgot to punch, WFH, field work, system error — up to 30 days back, routes to Reporting Manager (AT-08 · AT-09 · AT-13)',
    color: 'error',
  },
  {
    title: 'View and download own payslips',
    desc: 'All historical payslips, PDF download, YTD earnings summary (P-17 · P-18)',
    color: 'success',
  },
  {
    title: 'View own shift and roster',
    desc: 'Current shift assignment, weekly schedule, upcoming changes (SH-04)',
    color: 'primary',
  },
  {
    title: 'Request shift swap with a colleague',
    desc: 'Submit swap request — manager approves, roster auto-updates on approval (SH-06 · SH-07)',
    color: 'info',
  },
  {
    title: 'Update own profile (editable fields only)',
    desc: 'Phone, address, emergency contact — read-only: role, department, joining date, salary (E-08)',
    color: 'warning',
  },
  {
    title: 'View company structure (read-only)',
    desc: "Can see all units and departments in their company. Can only click into units they are assigned to — all others are visible but non-interactive (Meeting note: visibility vs clickability)",
    color: 'error',
  },
]

const RESTRICTED_ACTIONS = [
  'Approve or reject any request — leave, regularisation, payroll, shift swap',
  'View salary or payslips of any other employee',
  'Create, edit, or delete departments, Business Units, or Sites',
  'Access or change any system configuration',
  'Create, edit, or assign roles and privileges',
  'Invite or manage other users on the platform',
  'Initiate or approve payroll runs',
  'Click into or access any unit they are not assigned to (visible but non-clickable)',
]

const STACKING_EXAMPLES = [
  {
    title: 'Example: Employee → HR Manager',
    base: 'General User',
    added: [
      { label: 'approve_leave', color: 'success' },
      { label: 'manage_employees', color: 'success' },
      { label: 'run_payroll', color: 'success' },
      { label: 'approve_payroll', color: 'success' },
      { label: 'approve_regularisation', color: 'success' },
      { label: 'view_all_payslips', color: 'success' },
    ],
    note: 'Full HRMS operations added on top of self-service base. HR Manager can still apply their own leave, view their own attendance, etc.',
  },
  {
    title: 'Example: Employee → Finance Manager (custom)',
    base: 'General User',
    added: [
      { label: 'run_payroll', color: 'warning' },
      { label: 'approve_payroll', color: 'warning' },
      { label: 'lock_payroll', color: 'warning' },
      { label: 'view_all_payslips', color: 'warning' },
    ],
    note: 'Payroll-focused access only. Cannot approve leave or manage employees. Custom role created by Company Admin.',
  },
  {
    title: 'Example: Employee → Unit Admin',
    base: 'General User',
    added: [
      { label: 'approve_leave', color: 'info' },
      { label: 'create_department (own BU only)', color: 'info' },
      { label: 'manage_shifts', color: 'info' },
      { label: 'approve_regularisation', color: 'info' },
      { label: 'view_attendance', color: 'info' },
    ],
    note: 'Unit-scoped access. create_department is enforced at API level to own BU only — not just a UI restriction (R-14).',
  },
]

// ─── Section header component ──────────────────────────────────────────────────

const SectionHeader = ({ title, sub }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 4 }}>
    <Box sx={{ width: 3, height: 22, bgcolor: 'primary.main', borderRadius: 1, flexShrink: 0 }} />
    <Typography variant='h6' sx={{ fontWeight: 700 }}>{title}</Typography>
    {sub && <Typography variant='caption' color='text.secondary'>{sub}</Typography>}
    <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
  </Box>
)

// ─── Main Page ─────────────────────────────────────────────────────────────────

const GeneralFeaturesPage = () => {
  return (
    <Box>
      {/* ── Stats Cards ── */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant='h3' sx={{ fontWeight: 800, color: 'success.main', letterSpacing: -1 }}>10</Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>Self-service features</Typography>
              <Typography variant='caption' color='text.disabled'>every employee gets by default</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant='h3' sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: -1 }}>126</Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>Employees on General User role</Typography>
              <Typography variant='caption' color='text.disabled'>auto-assigned · non-editable</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ── Architecture note ── */}
      <Alert severity='warning' icon={<Icon icon='tabler:alert-circle' />} sx={{ mb: 4 }}>
        <strong>Architecture note:</strong> General User is the system default role. It cannot be restricted or removed.
        When an employee is assigned an additional role (e.g. Recruiter, Finance Manager), their total access = this base + the additional role's privileges stacked on top. The base never changes.
      </Alert>

      {/* ── What Every Employee Gets ── */}
      <SectionHeader title='What Every Employee Gets' sub='Non-editable · Assigned automatically on onboarding · Cannot be removed' />
      <Card sx={{ mb: 4 }}>
        <Box sx={{ px: 5, py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box>
            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Self-Service Features (10)</Typography>
          </Box>
          <CustomChip rounded skin='light' label='Read-only · System default' color='secondary' size='small' />
        </Box>
        <Stack spacing={0}>
          {SELF_SERVICE_FEATURES.map((feat, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex', gap: 2.5, px: 4, py: 2.5,
                bgcolor: `${feat.color}.light`,
                borderBottom: i < SELF_SERVICE_FEATURES.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Box sx={{
                width: 26, height: 26, bgcolor: `${feat.color}.main`, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25,
              }}>
                <Icon icon='tabler:check' fontSize={14} color='white' />
              </Box>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>{feat.title}</Typography>
                <Typography variant='caption' color='text.secondary'>{feat.desc}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Card>

      {/* ── What They Cannot Do ── */}
      <SectionHeader title='What General Users Cannot Do' sub='Requires explicit privilege assignment via a Privileged role' />
      <Card sx={{ mb: 4 }}>
        <Box sx={{ px: 5, py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Restricted Actions</Typography>
          <CustomChip rounded skin='light' label='Requires privilege' color='error' size='small' />
        </Box>
        <Stack spacing={0}>
          {RESTRICTED_ACTIONS.map((action, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex', gap: 2, px: 4, py: 2,
                bgcolor: 'error.light',
                borderBottom: i < RESTRICTED_ACTIONS.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ color: 'error.main', fontSize: 18, lineHeight: 1.3, flexShrink: 0 }}>✗</Typography>
              <Typography variant='body2'>{action}</Typography>
            </Box>
          ))}
        </Stack>
      </Card>

      {/* ── Privilege Stacking Examples ── */}
      <SectionHeader
        title='Privilege Stacking — How It Works'
        sub='When an employee is assigned an additional role, total access = General User base + role privileges'
      />
      <Stack spacing={3} sx={{ mb: 4 }}>
        {STACKING_EXAMPLES.map(ex => (
          <Card key={ex.title}>
            <Box sx={{ px: 5, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>{ex.title}</Typography>
            </Box>
            <Box sx={{ p: 4 }}>
              <Stack direction='row' spacing={1} flexWrap='wrap' gap={1} sx={{ mb: 2 }}>
                <Typography variant='caption' color='text.secondary' sx={{ alignSelf: 'center', mr: 1 }}>
                  Base ({ex.base}) +
                </Typography>
                {ex.added.map(priv => (
                  <Chip
                    key={priv.label}
                    label={priv.label}
                    size='small'
                    color={priv.color}
                    variant='outlined'
                    sx={{ fontFamily: 'monospace', fontSize: 11 }}
                  />
                ))}
              </Stack>
              <Typography variant='caption' color='text.secondary'>{ex.note}</Typography>
            </Box>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}

export default GeneralFeaturesPage
