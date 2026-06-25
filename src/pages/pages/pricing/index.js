// src/pages/plan/pricing/index.jsx
// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { styled, alpha, useTheme } from '@mui/material/styles'
import MuiCardContent from '@mui/material/CardContent'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import MuiCardHeader from '@mui/material/CardHeader'

// ** Redux
import { useSelector } from 'react-redux'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Axios
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Toast
import toast from 'react-hot-toast'

// ─── Styled ──────────────────────────────────────────────────────────────────
const CardContent = styled(MuiCardContent)(({ theme }) => ({
  padding: `${theme.spacing(10, 12)} !important`,
  [theme.breakpoints.down('md')]: { padding: `${theme.spacing(8, 4)} !important` },
  [theme.breakpoints.down('sm')]: { padding: `${theme.spacing(6, 3)} !important` },
}))

const PlanCard = styled(Card)(({ theme, selected, current }) => ({
  height: '100%',
  position: 'relative',
  cursor: current ? 'default' : 'pointer',
  transition: 'all 0.2s ease',
  border: `2px solid ${
    current
      ? theme.palette.success.main
      : selected
      ? theme.palette.primary.main
      : theme.palette.divider
  }`,
  boxShadow: selected && !current
    ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.18)}`
    : theme.shadows[1],
  '&:hover': !current ? {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
    transform: 'translateY(-2px)',
  } : {},
}))

// ─── Constants ────────────────────────────────────────────────────────────────
const PLAN_IMAGE_MAP = {
  professionals: '/images/pages/pricing-plan-basic.png',
  teams:         '/images/pages/pricing-plan-standard.png',
  enterprise:    '/images/pages/pricing-plan-enterprise.png',
}

const ROLE_PLAN_ENDPOINT = {
  org_admin:    '/api/v1/dashboard/org',        // returns plan info in response
  tenent_admin: '/api/v1/dashboard/company',
  unit_admin:   '/api/v1/dashboard/unit',
  hr_manager:   '/api/v1/dashboard/hr',
  employee:     '/api/v1/dashboard/employee',
  super_admin:  null,                           // super admin has no "current plan"
}

// ─── Helper: format raw API plan into display shape ───────────────────────────
const formatPlan = (plan) => {
  const monthly = Number(plan.price_monthly ?? 0)
  const annual  = Number(plan.price_annual  ?? monthly * 12)
  return {
    _id:         plan._id,
    title:       plan.name || plan.package_type || 'Plan',
    packageType: plan.package_type,
    monthly,
    annual,
    perMonth:    annual ? Math.round(annual / 12) : 0,
    seats:       plan.seat_limit,
    popular:     plan.package_type === 'teams' || plan.package_type === 'standard',
    imgSrc:      PLAN_IMAGE_MAP[plan.package_type] || '/images/pages/pricing-plan-basic.png',
    modules:     Array.isArray(plan.modules)
      ? plan.modules.map(m => typeof m === 'string' ? m.replace(/_/g, ' ') : m.name || m.slug || String(m))
      : [],
    structureLevel: plan.structure_level || '',
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Current plan summary banner
const CurrentPlanBanner = ({ planInfo, loading }) => {
  const theme = useTheme()
  if (loading) return <LinearProgress sx={{ mb: 6, borderRadius: 1 }} />
  if (!planInfo) return null

  const {
    planName, status, trialEnd, nextBilling, seatsUsed, seatLimit,
    expiresAt, billingCycle
  } = planInfo

  const isTrialing  = status === 'trialing'  || status === 'trial'
  const isExpired   = status === 'expired'
  const isSuspended = status === 'suspended'

  const statusColor = isTrialing ? 'warning' : isExpired || isSuspended ? 'error' : 'success'

  const trialDaysLeft = trialEnd
    ? Math.max(0, Math.ceil((new Date(trialEnd) - Date.now()) / 86400000))
    : null

  return (
    <Alert
      severity={statusColor}
      icon={<Icon icon={isExpired ? 'tabler:alert-triangle' : isTrialing ? 'tabler:clock' : 'tabler:shield-check'} />}
      sx={{ mb: 6, borderRadius: 2, alignItems: 'flex-start' }}
    >
      <AlertTitle sx={{ fontWeight: 700 }}>
        {isExpired   ? 'Your trial has expired — upgrade to continue'   :
         isSuspended ? 'Account suspended — please upgrade your plan'    :
         isTrialing  ? `Trial active — ${trialDaysLeft ?? '?'} days remaining` :
                       `Current plan: ${planName}`}
      </AlertTitle>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mt: 1 }}>
        {planName && (
          <Box>
            <Typography variant='caption' color='text.secondary'>Plan</Typography>
            <Typography variant='body2' fontWeight={600}>{planName}</Typography>
          </Box>
        )}
        {billingCycle && (
          <Box>
            <Typography variant='caption' color='text.secondary'>Billing</Typography>
            <Typography variant='body2' fontWeight={600} sx={{ textTransform: 'capitalize' }}>{billingCycle}</Typography>
          </Box>
        )}
        {trialEnd && (
          <Box>
            <Typography variant='caption' color='text.secondary'>Trial ends</Typography>
            <Typography variant='body2' fontWeight={600}>{new Date(trialEnd).toLocaleDateString('en-IN')}</Typography>
          </Box>
        )}
        {nextBilling && (
          <Box>
            <Typography variant='caption' color='text.secondary'>Next billing</Typography>
            <Typography variant='body2' fontWeight={600}>{new Date(nextBilling).toLocaleDateString('en-IN')}</Typography>
          </Box>
        )}
        {seatLimit && (
          <Box sx={{ minWidth: 160 }}>
            <Typography variant='caption' color='text.secondary'>
              Seats used: {seatsUsed ?? 0} / {seatLimit}
            </Typography>
            <LinearProgress
              variant='determinate'
              value={Math.min(100, ((seatsUsed ?? 0) / seatLimit) * 100)}
              color={((seatsUsed ?? 0) / seatLimit) > 0.9 ? 'error' : 'primary'}
              sx={{ mt: 0.5, borderRadius: 1 }}
            />
          </Box>
        )}
      </Box>
    </Alert>
  )
}

// Single plan card
const PlanCardItem = ({ plan, billing, isCurrentPlan, onSelect, selected }) => {
  const theme = useTheme()
  const price   = billing === 'annually' ? plan.perMonth : plan.monthly
  const isCustom = !plan.monthly && !plan.annual

  return (
    <PlanCard selected={selected} current={isCurrentPlan} onClick={() => !isCurrentPlan && onSelect(plan)}>
      {plan.popular && !isCurrentPlan && (
        <Box sx={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
          <Chip
            label='Most Popular'
            color='primary'
            size='small'
            sx={{ borderRadius: '0 0 8px 8px', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.05em' }}
          />
        </Box>
      )}
      {isCurrentPlan && (
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <Chip
            label='Current Plan'
            color='success'
            size='small'
            icon={<Icon icon='tabler:check' />}
            sx={{ fontWeight: 700, fontSize: '0.65rem' }}
          />
        </Box>
      )}

      <CardContent sx={{ p: '24px !important' }}>
        {/* Icon + Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{
            p: 2, borderRadius: 1,
            bgcolor: isCurrentPlan
              ? alpha(theme.palette.success.main, 0.12)
              : alpha(theme.palette.primary.main, 0.10),
            color: isCurrentPlan ? 'success.main' : 'primary.main',
            display: 'flex',
          }}>
            <Icon icon={
              plan.packageType === 'enterprise' ? 'tabler:building-skyscraper' :
              plan.packageType === 'teams'       ? 'tabler:users'              :
                                                   'tabler:rocket'
            } fontSize='1.4rem' />
          </Box>
          <Typography variant='h6' fontWeight={700}>{plan.title}</Typography>
        </Box>

        {/* Price */}
        <Box sx={{ mb: 3 }}>
          {isCustom ? (
            <Typography variant='h4' fontWeight={800} color='primary.main'>Custom</Typography>
          ) : (
            <>
              <Typography variant='h4' fontWeight={800} color={isCurrentPlan ? 'success.main' : 'primary.main'}>
                ₹{price?.toLocaleString('en-IN')}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                /month{billing === 'annually' ? ' · billed annually' : ''}
              </Typography>
            </>
          )}
        </Box>

        {/* Seats */}
        <Typography variant='caption' color='text.secondary' sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Icon icon='tabler:users' fontSize='0.95rem' />
          {plan.seats ? `Up to ${plan.seats} employees` : 'Unlimited employees'}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Modules */}
        <Typography variant='caption' color='text.secondary' fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', mb: 2 }}>
          Modules included
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {plan.modules.slice(0, 6).map(m => (
            <Chip key={m} label={m} size='small' variant='outlined'
              sx={{ fontSize: '0.65rem', textTransform: 'capitalize' }} />
          ))}
          {plan.modules.length > 6 && (
            <Chip label={`+${plan.modules.length - 6} more`} size='small'
              sx={{ fontSize: '0.65rem', bgcolor: 'action.hover' }} />
          )}
        </Box>

        {/* CTA */}
        <Box sx={{ mt: 4 }}>
          {isCurrentPlan ? (
            <Button fullWidth variant='outlined' color='success' disabled
              startIcon={<Icon icon='tabler:check' />}>
              Active plan
            </Button>
          ) : isCustom ? (
            <Button fullWidth variant='contained' color='primary'
              onClick={() => onSelect(plan)}
              startIcon={<Icon icon='tabler:phone' />}>
              Contact sales
            </Button>
          ) : (
            <Button fullWidth variant={plan.popular ? 'contained' : 'outlined'} color='primary'
              onClick={() => onSelect(plan)}
              endIcon={<Icon icon='tabler:arrow-right' />}>
              Upgrade to {plan.title}
            </Button>
          )}
        </Box>
      </CardContent>
    </PlanCard>
  )
}

// Upgrade confirmation dialog
const UpgradeDialog = ({ open, plan, billing, currentPlan, onClose, onConfirm, loading }) => {
  if (!plan) return null
  const isCustom = !plan.monthly && !plan.annual
  const price    = billing === 'annually' ? plan.perMonth : plan.monthly

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Icon icon='tabler:arrows-exchange' />
        Upgrade plan
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {currentPlan?.planName && (
            <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'action.hover' }}>
              <Typography variant='caption' color='text.secondary'>Current plan</Typography>
              <Typography fontWeight={600}>{currentPlan.planName}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Icon icon='tabler:arrow-down' fontSize='1.5rem' color='text.secondary' />
          </Box>
          <Box sx={{ p: 3, borderRadius: 1,
            bgcolor: theme => alpha(theme.palette.primary.main, 0.08),
            border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.25)}` }}>
            <Typography variant='caption' color='text.secondary'>Upgrading to</Typography>
            <Typography fontWeight={700} color='primary.main' fontSize='1.1rem'>{plan.title}</Typography>
            {!isCustom && (
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                ₹{price?.toLocaleString('en-IN')}/month · {billing === 'annually' ? 'billed annually' : 'billed monthly'}
              </Typography>
            )}
          </Box>
          {isCustom ? (
            <Alert severity='info'>
              Our team will contact you with a custom quote within 24 hours.
            </Alert>
          ) : (
            <Alert severity='warning' icon={<Icon icon='tabler:info-circle' />}>
              Your upgrade takes effect immediately. You will be charged the pro-rated difference for the remaining billing period.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 5, pb: 4 }}>
        <Button variant='outlined' color='secondary' onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant='contained' onClick={onConfirm} disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:check' />}>
          {loading ? 'Processing...' : isCustom ? 'Request quote' : 'Confirm upgrade'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const PricingPage = () => {
  const theme  = useTheme()
  const router = useRouter()

  // Auth state — read role slug
  const roleSlug  = useSelector(state => state.auth?.user?.role?.slug || state.auth?.userData?.role?.slug || '')
  const authUser  = useSelector(state => state.auth?.user || state.auth?.userData)

  // Component state
  const [billing, setBilling]           = useState('annually')
  const [plans, setPlans]               = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [currentPlan, setCurrentPlan]   = useState(null)       // { planName, planId, status, trialEnd, ... }
  const [planLoading, setPlanLoading]   = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)       // plan object user clicked
  const [dialogOpen, setDialogOpen]     = useState(false)
  const [upgrading, setUpgrading]       = useState(false)
  const [error, setError]               = useState('')

  // ── 1. Fetch all public plans ─────────────────────────────────────────────
  const loadPlans = useCallback(async () => {
    setPlansLoading(true)
    setError('')
    try {
      const res   = await axiosRequest.get('/api/v1/plans/public')
      const data  = Array.isArray(res) ? res : res?.data || []
      setPlans(data.map(formatPlan))
    } catch (err) {
      console.error('Failed to load plans:', err)
      setError('Failed to load plans. Please refresh.')
    } finally {
      setPlansLoading(false)
    }
  }, [])

  // ── 2. Fetch current org/company/unit plan info ───────────────────────────
  // We read plan info embedded in the dashboard response since your backend
  // returns plan details in every dashboard API (organisation.plan_snapshot etc.)
  const loadCurrentPlan = useCallback(async () => {
    if (!roleSlug || roleSlug === 'super_admin') {
      setPlanLoading(false)
      return
    }
    setPlanLoading(true)
    try {
      // Try dedicated plan endpoint first, fall back to dashboard data
      let planData = null

      try {
        // Attempt org-level plan endpoint
        const res = await axiosRequest.get('/api/v1/organisation/plan')
        planData  = res?.data || res
      } catch {
        // Not available — read from dashboard response
        const endpoint = ROLE_PLAN_ENDPOINT[roleSlug]
        if (endpoint) {
          const dash = await axiosRequest.get(endpoint)
          const d    = dash?.data || dash
          // Backend embeds plan info in different keys — handle all shapes
          planData = d?.plan || d?.currentPlan || d?.planInfo || d?.organisation?.plan || null
        }
      }

      if (planData) {
        setCurrentPlan({
          planId:       planData._id || planData.planId || planData.plan_id,
          planName:     planData.name || planData.planName || planData.plan_name,
          status:       planData.status || planData.plan_status || 'active',
          billingCycle: planData.billing_cycle || planData.billingCycle,
          trialEnd:     planData.trial_end || planData.trialEnd || planData.trial_end_date,
          nextBilling:  planData.next_billing || planData.nextBilling,
          seatsUsed:    planData.seats_used   || planData.seatsUsed,
          seatLimit:    planData.seat_limit   || planData.seatLimit,
        })
      }
    } catch (err) {
      // TRIAL_EXPIRED 403 is already handled by interceptor — ignore here
      console.warn('Could not load current plan info:', err)
    } finally {
      setPlanLoading(false)
    }
  }, [roleSlug])

  useEffect(() => { loadPlans() },      [loadPlans])
  useEffect(() => { loadCurrentPlan() }, [loadCurrentPlan])

  // ── 3. Handle plan selection ──────────────────────────────────────────────
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan)
    setDialogOpen(true)
  }

  // ── 4. Confirm upgrade ────────────────────────────────────────────────────
  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return
    setUpgrading(true)
    try {
      const isCustom = !selectedPlan.monthly && !selectedPlan.annual

      if (isCustom) {
        // Enterprise — just send a contact request
        await axiosRequest.post('/api/v1/plans/contact-sales', {
          planId:      selectedPlan._id,
          billingCycle: billing,
          userId:      authUser?._id,
        })
        toast.success('Our team will contact you within 24 hours!')
      } else {
        // Upgrade via billing API
        await axiosRequest.post('/api/v1/organisation/upgrade-plan', {
          planId:       selectedPlan._id,
          billingCycle: billing,
        })
        toast.success(`Successfully upgraded to ${selectedPlan.title}!`)

        // Refresh current plan state
        await loadCurrentPlan()
      }
      setDialogOpen(false)
      setSelectedPlan(null)
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Upgrade failed. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }

  const handleCloseDialog = () => {
    if (upgrading) return
    setDialogOpen(false)
    setSelectedPlan(null)
  }

  const isCurrentPlan = (plan) =>
    currentPlan?.planId && plan._id && currentPlan.planId === plan._id

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 3, md: 6 } }}>
      {/* ── Page title ── */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant='h4' fontWeight={700} sx={{ mb: 2 }}>
          {roleSlug === 'super_admin' ? 'Pricing Plans' : 'Upgrade your plan'}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {roleSlug === 'super_admin'
            ? 'Overview of all available plans'
            : 'Choose the plan that fits your organisation'}
        </Typography>
      </Box>

      {/* ── Current plan banner ── */}
      <CurrentPlanBanner planInfo={currentPlan} loading={planLoading} />

      {/* ── Error state ── */}
      {error && (
        <Alert severity='error' sx={{ mb: 4 }} action={
          <Button color='inherit' size='small' onClick={loadPlans}>Retry</Button>
        }>
          {error}
        </Alert>
      )}

      {/* ── Billing toggle ── */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, mb: 8 }}>
        <Typography variant='body2' color={billing === 'monthly' ? 'text.primary' : 'text.secondary'} fontWeight={billing === 'monthly' ? 600 : 400}>
          Monthly
        </Typography>
        <Switch
          checked={billing === 'annually'}
          onChange={e => setBilling(e.target.checked ? 'annually' : 'monthly')}
          color='primary'
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant='body2' color={billing === 'annually' ? 'text.primary' : 'text.secondary'} fontWeight={billing === 'annually' ? 600 : 400}>
            Annual
          </Typography>
          <Chip label='Save 20%' color='success' size='small'
            sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
        </Box>
      </Box>

      {/* ── Plans grid ── */}
      {plansLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 16 }}>
          <CircularProgress />
        </Box>
      ) : plans.length === 0 ? (
        <Alert severity='warning' sx={{ mb: 4 }}>
          No plans available at the moment. Please contact support.
        </Alert>
      ) : (
        <Grid container spacing={5} sx={{ mb: 10 }} alignItems='stretch'>
          {plans.map(plan => (
            <Grid item xs={12} sm={6} md={3} key={plan._id || plan.title} sx={{ display: 'flex' }}>
              <PlanCardItem
                plan={plan}
                billing={billing}
                isCurrentPlan={isCurrentPlan(plan)}
                selected={selectedPlan?._id === plan._id}
                onSelect={handleSelectPlan}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── FAQ / features section ── */}
      <Card variant='outlined' sx={{ p: { xs: 4, md: 6 } }}>
        <Typography variant='h6' fontWeight={700} sx={{ mb: 4 }}>
          Frequently asked questions
        </Typography>
        <Grid container spacing={4}>
          {[
            ['How does the trial work?',
             '14-day free trial with full access to all features in your selected plan. No charge until the trial ends.'],
            ['Can I change plans anytime?',
             'Yes. Upgrades take effect immediately with pro-rated billing. Downgrades apply at the next billing cycle.'],
            ['What payment methods are accepted?',
             'We accept Visa, Mastercard, Amex, and RuPay. UPI and bank transfers available for Enterprise.'],
            ['What happens if I exceed seat limits?',
             "You'll receive an alert when you reach 90% of your seat limit. New employees can't be added until you upgrade."],
          ].map(([q, a]) => (
            <Grid item xs={12} md={6} key={q}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Icon icon='tabler:help-circle'
                  style={{ color: theme.palette.primary.main, flexShrink: 0, marginTop: 2 }} />
                <Box>
                  <Typography variant='body1' fontWeight={600} sx={{ mb: 1 }}>{q}</Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.7 }}>{a}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* ── Upgrade dialog ── */}
      <UpgradeDialog
        open={dialogOpen}
        plan={selectedPlan}
        billing={billing}
        currentPlan={currentPlan}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmUpgrade}
        loading={upgrading}
      />
    </Box>
  )
}

export default PricingPage