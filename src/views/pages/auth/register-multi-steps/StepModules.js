// ** React Imports
import { useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ─── Module Catalogue ─────────────────────────
// plans array = which plans include this module
export const ALL_MODULES = [
  {
    id: 'core',
    name: 'Core Platform',
    icon: 'tabler:layout-grid',
    desc: 'Auth, RBAC, audit logs, org structure',
    required: true,
    plans: ['basic', 'standard', 'professional', 'enterprise'],
    color: '#6366F1',
  },
  {
    id: 'employee',
    name: 'Employee Management',
    icon: 'tabler:users',
    desc: 'Profiles, lifecycle, designations, documents',
    required: true,
    plans: ['basic', 'standard', 'professional', 'enterprise'],
    color: '#0EA5E9',
  },
  {
    id: 'attendance',
    name: 'Attendance',
    icon: 'tabler:clock',
    desc: 'Check-in/out, biometric, WFH, reports',
    required: false,
    plans: ['standard', 'professional', 'enterprise'],
    color: '#10B981',
  },
  {
    id: 'leave',
    name: 'Leave Management',
    icon: 'tabler:beach',
    desc: 'Policy engine, approval workflow, balance tracking',
    required: false,
    plans: ['standard', 'professional', 'enterprise'],
    color: '#F59E0B',
  },
  {
    id: 'payroll',
    name: 'Payroll',
    icon: 'tabler:credit-card',
    desc: 'Salary structure, pay runs, payslips, TDS',
    required: false,
    plans: ['standard', 'professional', 'enterprise'],
    color: '#8B5CF6',
  },
  {
    id: 'appraisal',
    name: 'Performance & Appraisal',
    icon: 'tabler:star',
    desc: 'Goals, 360° reviews, ratings, calibration',
    required: false,
    plans: ['professional', 'enterprise'],
    color: '#EC4899',
  },
  {
    id: 'recruitment',
    name: 'Recruitment',
    icon: 'tabler:target',
    desc: 'Job postings, ATS pipeline, offer letters',
    required: false,
    plans: ['professional', 'enterprise'],
    color: '#EF4444',
  },
  {
    id: 'training',
    name: 'Training & LMS',
    icon: 'tabler:school',
    desc: 'Courses, certifications, completion tracking',
    required: false,
    plans: ['professional', 'enterprise'],
    color: '#14B8A6',
  },
  {
    id: 'expenses',
    name: 'Expense Management',
    icon: 'tabler:receipt',
    desc: 'Claims, approvals, reimbursement workflows',
    required: false,
    plans: ['enterprise'],
    color: '#F97316',
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    icon: 'tabler:chart-bar',
    desc: 'Custom dashboards, BI exports, trend reports',
    required: false,
    plans: ['enterprise'],
    color: '#3B82F6',
  },
  {
    id: 'assets',
    name: 'Asset Management',
    icon: 'tabler:briefcase',
    desc: 'Assign, track, return & audit company assets',
    required: false,
    plans: ['enterprise'],
    color: '#84CC16',
  },
  {
    id: 'helpdesk',
    name: 'HR Helpdesk',
    icon: 'tabler:headset',
    desc: 'Tickets, SLA tracking, HR knowledge base',
    required: false,
    plans: ['enterprise'],
    color: '#06B6D4',
  },
]

// ─── Plan display names ────────────────────────
const PLAN_NAMES = {
  basic:        'Basic',
  standard:     'Standard',
  professional: 'Professional',
  enterprise:   'Enterprise',
}

// ─── Module Card ──────────────────────────────
const ModuleCard = ({ module, plan, checked, onToggle }) => {
  const inPlan   = module.plans.includes(plan)
  const isLocked = module.required

  return (
    <Paper
      elevation={0}
      onClick={() => { if (!isLocked && inPlan) onToggle(module.id) }}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        p: 2,
        border: '1.5px solid',
        borderColor: checked && inPlan ? module.color : 'divider',
        borderRadius: 2.5,
        cursor: isLocked || !inPlan ? 'default' : 'pointer',
        bgcolor: checked && inPlan
          ? `${module.color}12`
          : !inPlan
          ? 'action.disabledBackground'
          : 'background.paper',
        opacity: !inPlan ? 0.5 : 1,
        transition: 'all 0.15s ease',
        position: 'relative',
        '&:hover': (!isLocked && inPlan) ? {
          borderColor: module.color,
          boxShadow: `0 0 0 3px ${module.color}18`,
        } : {},
      }}
    >
      {/* Upgrade badge for locked-out modules */}
      {!inPlan && (
        <Chip
          label='UPGRADE'
          size='small'
          sx={{
            position: 'absolute',
            top: 8,
            right: 10,
            fontSize: 9,
            fontWeight: 700,
            height: 18,
            letterSpacing: 0.5,
            bgcolor: 'action.selected',
            color: 'text.disabled',
          }}
        />
      )}

      {/* Module icon */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: checked && inPlan ? `${module.color}20` : 'action.hover',
          flexShrink: 0,
        }}
      >
        <Icon
          icon={module.icon}
          fontSize='1.25rem'
          style={{ color: inPlan ? module.color : 'var(--mui-palette-text-disabled)' }}
        />
      </Box>

      {/* Text */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            variant='body2'
            sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}
          >
            {module.name}
          </Typography>
          {isLocked && (
            <Chip
              label='Required'
              size='small'
              sx={{
                fontSize: 10,
                fontWeight: 700,
                height: 18,
                bgcolor: 'primary.lighter',
                color: 'primary.main',
              }}
            />
          )}
        </Box>
        <Typography variant='caption' sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
          {module.desc}
        </Typography>
      </Box>

      {/* Checkbox */}
      <Checkbox
        checked={!!(checked && inPlan)}
        disabled={isLocked || !inPlan}
        size='small'
        sx={{
          p: 0,
          flexShrink: 0,
          color: 'divider',
          '&.Mui-checked': { color: module.color },
        }}
        onClick={e => e.stopPropagation()}
      />
    </Paper>
  )
}

// ─── Component ───────────────────────────────
const StepModules = ({ handleNext, handlePrev, plan }) => {
  const planName = PLAN_NAMES[plan] || plan

  // Default selected = required + modules included in plan
  const [selected, setSelected] = useState(() =>
    ALL_MODULES
      .filter(m => m.required || m.plans.includes(plan))
      .map(m => m.id)
  )

  const toggle = id => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Group modules: included in plan vs locked (upgrade needed)
  const inPlanModules  = ALL_MODULES.filter(m => m.plans.includes(plan))
  const lockedModules  = ALL_MODULES.filter(m => !m.plans.includes(plan))
  const selectedCount  = selected.length

  const onNext = () => {
    handleNext({ modules: selected })
  }

  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant='h3'>Customise modules</Typography>
          <Chip
            label={`${planName} Plan`}
            size='small'
            sx={{
              fontWeight: 700,
              fontSize: 12,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
            }}
          />
        </Box>
        <Typography sx={{ color: 'text.secondary' }}>
          Modules included in your plan are pre-selected. Toggle to enable or disable optional ones.
          Greyed-out modules require a plan upgrade.
        </Typography>
      </Box>

      {/* Included modules */}
      <Typography variant='overline' sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1, mb: 2, display: 'block' }}>
        Included in {planName}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {inPlanModules.map(module => (
          <Grid item xs={12} sm={6} key={module.id}>
            <ModuleCard
              module={module}
              plan={plan}
              checked={selected.includes(module.id)}
              onToggle={toggle}
            />
          </Grid>
        ))}
      </Grid>

      {/* Locked/upgrade modules */}
      {lockedModules.length > 0 && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Typography variant='overline' sx={{ color: 'text.disabled', fontWeight: 700, letterSpacing: 1, mb: 2, display: 'block' }}>
            Available on higher plans
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {lockedModules.map(module => (
              <Grid item xs={12} sm={6} key={module.id}>
                <ModuleCard
                  module={module}
                  plan={plan}
                  checked={false}
                  onToggle={toggle}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Summary bar */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.75,
          borderRadius: 2,
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
          mb: 5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon='tabler:puzzle' fontSize='1rem' style={{ color: 'var(--mui-palette-primary-main)' }} />
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            <Typography component='span' sx={{ fontWeight: 700, color: 'text.primary' }}>
              {selectedCount} module{selectedCount !== 1 ? 's' : ''}
            </Typography>{' '}
            selected
          </Typography>
        </Box>
        <Chip
          label={`${planName} plan`}
          size='small'
          color='primary'
          variant='tonal'
          sx={{ fontWeight: 600, fontSize: 11 }}
        />
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button color='secondary' variant='tonal' onClick={handlePrev} sx={{ '& svg': { mr: 2 } }}>
          <Icon fontSize='1.125rem' icon='tabler:arrow-left' />
          Previous
        </Button>
        <Button variant='contained' onClick={onNext} sx={{ '& svg': { ml: 2 } }}>
          Continue to billing
          <Icon fontSize='1.125rem' icon='tabler:arrow-right' />
        </Button>
      </Box>
    </>
  )
}

export default StepModules
