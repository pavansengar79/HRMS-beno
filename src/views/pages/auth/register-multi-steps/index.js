// ** React Imports
import { useState, useMemo } from 'react'

// ** MUI Imports
import Avatar from '@mui/material/Avatar'
import Stepper from '@mui/material/Stepper'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import { styled, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiStep from '@mui/material/Step'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Step Components
import StepPersonalInfo from 'src/views/pages/auth/register-multi-steps/StepPersonalInfo'
import StepModules from 'src/views/pages/auth/register-multi-steps/StepModules'
import StepBillingDetails from 'src/views/pages/auth/register-multi-steps/StepBillingDetails'
import StepUnitSetup from 'src/views/pages/auth/register-multi-steps/StepUnitSetup'
import StepEnterpriseOrg from 'src/views/pages/auth/register-multi-steps/StepEnterpriseOrg'
import StepComplete from 'src/views/pages/auth/register-multi-steps/StepComplete'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Styled Components
import StepperWrapper from 'src/@core/styles/mui/stepper'

// ─── Step Definitions ────────────────────────
// Modules step is inserted between Account and Billing for all non-basic plans.
// Basic plan: Account → Billing → Unit → Done  (no modules to configure)
// Others:     Account → Modules → Billing → Unit/Org → Done
const BASE_STEPS_WITH_MODULES = [
  { title: 'Account',  icon: 'tabler:user',       subtitle: 'Create Account'  },
  { title: 'Modules',  icon: 'tabler:puzzle',      subtitle: 'Pick Features'   },
  { title: 'Billing',  icon: 'tabler:receipt',     subtitle: 'Payment Details' },
]

const BASE_STEPS_NO_MODULES = [
  { title: 'Account',  icon: 'tabler:user',    subtitle: 'Create Account'  },
  { title: 'Billing',  icon: 'tabler:receipt', subtitle: 'Payment Details' },
]

const UNIT_STEP = { title: 'Unit Setup',    icon: 'tabler:building-store',      subtitle: 'Configure Unit' }
const ORG_STEP  = { title: 'Organisation',  icon: 'tabler:building-skyscraper', subtitle: 'Org Structure'  }
const DONE_STEP = { title: 'Done',          icon: 'tabler:circle-check',        subtitle: 'All Set!'       }

// ─── Plan accent colours ──────────────────────
const PLAN_ACCENT = {
  basic:        { color: '#10B981', label: 'Basic',        icon: 'tabler:rocket'              },
  standard:     { color: '#3B82F6', label: 'Standard',     icon: 'tabler:building-store'      },
  professional: { color: '#8B5CF6', label: 'Professional', icon: 'tabler:building'            },
  enterprise:   { color: '#F59E0B', label: 'Enterprise',   icon: 'tabler:building-skyscraper' },
}

// ─── Decorative canvas background ────────────
const GridPattern = () => (
  <Box
    sx={{
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: theme =>
          `radial-gradient(${hexToRGBA(theme.palette.primary.main, 0.06)} 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        top: -160,
        right: -160,
        width: 520,
        height: 520,
        borderRadius: '50%',
        background: theme =>
          `radial-gradient(circle, ${hexToRGBA(theme.palette.primary.main, 0.13)} 0%, transparent 70%)`,
        filter: 'blur(50px)',
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: theme =>
          `radial-gradient(circle, ${hexToRGBA(theme.palette.secondary.main, 0.08)} 0%, transparent 70%)`,
        filter: 'blur(50px)',
      }}
    />
  </Box>
)

// ─── Step number badge ────────────────────────
const StepBadge = ({ index, active, completed, accentColor, theme }) => {
  const activeBg = accentColor || theme.palette.primary.main
  const bg = completed ? activeBg : active ? activeBg : 'transparent'
  const border = completed || active ? activeBg : theme.palette.divider
  const color = completed || active ? '#fff' : theme.palette.text.disabled

  return (
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        bgcolor: bg,
        color,
        border: `2px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 13,
        flexShrink: 0,
        boxShadow: active ? `0 0 0 4px ${hexToRGBA(activeBg, 0.15)}` : 'none',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {completed
        ? <Icon icon='tabler:check' fontSize='0.9rem' />
        : index + 1
      }
    </Box>
  )
}

// ─── Main Component ───────────────────────────
const RegisterMultiSteps = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [personalData, setPersonalData] = useState(null)
  const [modulesData,  setModulesData]  = useState(null)
  const [billingData,  setBillingData]  = useState(null)
  const [unitData,     setUnitData]     = useState(null)
  const [orgData,      setOrgData]      = useState(null)

  const theme      = useTheme()
  const { settings } = useSettings()
  const smallScreen  = useMediaQuery(theme.breakpoints.down('md'))
  const { direction } = settings

  const selectedPlan = personalData?.subscriptionPlan || null
  const isEnterprise = selectedPlan === 'enterprise'
  const planMeta     = PLAN_ACCENT[selectedPlan] || null

  // Basic plan has no module selection (only 2 core modules, nothing to toggle)
  const hasModules   = selectedPlan && selectedPlan !== 'basic'

  const steps = useMemo(() => {
    const base = hasModules ? BASE_STEPS_WITH_MODULES : BASE_STEPS_NO_MODULES
    if (!selectedPlan) return [...BASE_STEPS_NO_MODULES, UNIT_STEP, DONE_STEP]
    return [...base, isEnterprise ? ORG_STEP : UNIT_STEP, DONE_STEP]
  }, [selectedPlan, isEnterprise, hasModules])

  const totalSteps  = steps.length
  const progressPct = Math.round((activeStep / (totalSteps - 1)) * 100)
  const isDone      = activeStep === totalSteps - 1

  const accentColor = planMeta?.color || theme.palette.primary.main

  // ── Navigation ──
  // Step indices shift by 1 when modules step is present
  const handleNext = (data) => {
     console.log("data",data)
    if (activeStep === 0 && data) setPersonalData(data)
     

    if (hasModules) {
      // With modules: 0=Account 1=Modules 2=Billing 3=Unit/Org 4=Done
      if (activeStep === 1 && data) setModulesData(data)
      if (activeStep === 2 && data) setBillingData(data)
      if (activeStep === 3) {
        if (isEnterprise && data) setOrgData(data)
        else if (!isEnterprise && data) setUnitData(data)
      }
    } else {
      // Without modules: 0=Account 1=Billing 2=Unit/Org 3=Done
      if (activeStep === 1 && data) setBillingData(data)
      if (activeStep === 2) {
        if (isEnterprise && data) setOrgData(data)
        else if (!isEnterprise && data) setUnitData(data)
      }
    }

    setActiveStep(s => s + 1)
  }

  const handlePrev = () => {
    if (activeStep !== 0) setActiveStep(s => s - 1)
  }

  const handleDashboard = () => {
    window.location.href = '/dashboard'
  }

  // ── Step content ──
  // Routing depends on whether plan includes module selection
  const getStepContent = step => {
    // Step 0: always Account/Personal Info
    if (step === 0) {
      return (
        <StepPersonalInfo
          handleNext={handleNext}
          onFormData={data => setPersonalData(data)}
          formData={personalData}
        />
      )
    }

    if (hasModules) {
      // Flow: 0=Account → 1=Modules → 2=Billing → 3=Unit/Org → 4=Done
      switch (step) {
        case 1:
          return (
            <StepModules
              handleNext={data => handleNext(data)}
              handlePrev={handlePrev}
              plan={selectedPlan}
            />
          )
        case 2:
          return (
            <StepBillingDetails
              handleNext={data => handleNext(data)}
              handlePrev={handlePrev}
              plan={selectedPlan}
            />
          )
        case 3:
          return isEnterprise ? (
            <StepEnterpriseOrg
              handleNext={data => handleNext(data)}
              handlePrev={handlePrev}
            />
          ) : (
            <StepUnitSetup
              handleNext={data => handleNext(data)}
              handlePrev={handlePrev}
              plan={selectedPlan}
            />
          )
        case 4:
          return (
            <StepComplete
              formData={{ personalData, modulesData, billingData, unitData, orgData }}
              plan={selectedPlan}
              onDashboard={handleDashboard}
            />
          )
        default:
          return null
      }
    } else {
      // Basic plan flow: 0=Account → 1=Billing → 2=Unit → 3=Done
      switch (step) {
        case 1:
          return (
            <StepBillingDetails
              handleNext={data => handleNext(data)}
              handlePrev={handlePrev}
              plan={selectedPlan}
            />
          )
        case 2:
          return (
            <StepUnitSetup
              handleNext={data => handleNext(data)}
              handlePrev={handlePrev}
              plan={selectedPlan}
            />
          )
        case 3:
          return (
            <StepComplete
              formData={{ personalData, modulesData: null, billingData, unitData, orgData }}
              plan={selectedPlan}
              onDashboard={handleDashboard}
            />
          )
        default:
          return null
      }
    }
  }

  // ── Step headline copy (index-aware) ──
  const HEADLINES_WITH_MODULES = [
    'Set up your account',
    'Choose your modules',
    'Billing & payment',
    isEnterprise ? 'Build your organisation' : 'Configure your unit',
    '',
  ]
  const SUBLINES_WITH_MODULES = [
    'Create your admin credentials and pick the plan that suits your business.',
    'Select the features your team needs. Locked modules require a plan upgrade.',
    'Set up billing before we configure your workspace.',
    isEnterprise
      ? 'Define your organisation, add companies, lines of business and units.'
      : 'Tell us where your business operates — this becomes your primary unit.',
    '',
  ]
  const HEADLINES_NO_MODULES = [
    'Set up your account',
    'Billing & payment',
    'Configure your unit',
    '',
  ]
  const SUBLINES_NO_MODULES = [
    'Create your admin credentials and pick the plan that suits your business.',
    'Set up billing before we configure your workspace.',
    'Tell us where your business operates — this becomes your primary unit.',
    '',
  ]

  const headlines = hasModules ? HEADLINES_WITH_MODULES : HEADLINES_NO_MODULES
  const sublines  = hasModules ? SUBLINES_WITH_MODULES  : SUBLINES_NO_MODULES
  const headline  = headlines[activeStep] || ''
  const subline   = sublines[activeStep]  || ''

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <GridPattern />

      

      {/* ══ Thin progress bar ═══════════════════ */}
      <LinearProgress
        variant='determinate'
        value={progressPct}
        sx={{
          height: 2,
          borderRadius: 0,
          bgcolor: 'divider',
          position: 'relative',
          zIndex: 99,
          '& .MuiLinearProgress-bar': {
            bgcolor: accentColor,
            transition: 'width 0.55s cubic-bezier(0.4,0,0.2,1)',
          },
        }}
      />

      {/* ══ Main body ═══════════════════════════ */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: { xs: 2, sm: 4, md: 6 },
          pt: { xs: 5, md: 8 },
          pb: 12,
        }}
      >

        {/* ── Page hero copy ───────────────────── */}
        {!isDone && (
          <Box
            sx={{
              textAlign: 'center',
              mb: { xs: 5, md: 6 },
              maxWidth: 580,
              animation: 'fadeUp 0.4s ease both',
              '@keyframes fadeUp': {
                from: { opacity: 0, transform: 'translateY(12px)' },
                to:   { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Typography
              component='span'
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.75,
                py: 0.5,
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: accentColor,
                bgcolor: hexToRGBA(accentColor, 0.1),
                border: `1px solid ${hexToRGBA(accentColor, 0.2)}`,
                mb: 2,
              }}
            >
              <Icon icon='tabler:shield-check' fontSize='0.875rem' />
              Enterprise Onboarding
            </Typography>

            <Typography
              variant='h3'
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.75px',
                lineHeight: 1.15,
                color: 'text.primary',
                mb: 1.5,
                fontSize: { xs: '1.75rem', md: '2.25rem' },
              }}
            >
              {headline}
            </Typography>
            <Typography
              variant='body1'
              sx={{ color: 'text.secondary', lineHeight: 1.75, maxWidth: 480, mx: 'auto' }}
            >
              {subline}
            </Typography>
          </Box>
        )}

        {/* ── Stepper pill ─────────────────────── */}
        {!isDone && (
          <Box sx={{ width: '100%', maxWidth: 820, mb: { xs: 5, md: 6 } }}>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                px: { xs: 2.5, md: 4 },
                py: 2.5,
                bgcolor: 'background.paper',
                boxShadow: theme =>
                  `0 1px 2px ${hexToRGBA(theme.palette.common.black, 0.04)},
                   0 4px 16px ${hexToRGBA(theme.palette.common.black, 0.05)}`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {steps.map((step, index) => {
                  const isActive    = activeStep === index
                  const isCompleted = activeStep > index

                  return (
                    <Box
                      key={`step-${index}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: index < steps.length - 1 ? 1 : 'unset',
                        minWidth: 0,
                      }}
                    >
                      {/* Step item */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.25,
                          flexShrink: 0,
                          opacity: !isActive && !isCompleted ? 0.38 : 1,
                          transition: 'opacity 0.25s',
                        }}
                      >
                        <StepBadge
                          index={index}
                          active={isActive}
                          completed={isCompleted}
                          accentColor={accentColor}
                          theme={theme}
                        />
                        {/* Label: always show on desktop; only active on mobile */}
                        <Box sx={{ display: { xs: isActive ? 'block' : 'none', sm: 'block' } }}>
                          <Typography
                            sx={{
                              display: 'block',
                              fontWeight: isActive ? 700 : isCompleted ? 600 : 500,
                              fontSize: 13,
                              color: isActive
                                ? 'text.primary'
                                : isCompleted
                                ? accentColor
                                : 'text.disabled',
                              lineHeight: 1.25,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {step.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: 'text.disabled',
                              lineHeight: 1,
                              display: { xs: 'none', md: 'block' },
                            }}
                          >
                            {step.subtitle}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Connector */}
                      {index < steps.length - 1 && (
                        <Box
                          sx={{
                            flex: 1,
                            height: 2,
                            mx: { xs: 1.5, md: 2.5 },
                            borderRadius: 2,
                            position: 'relative',
                            overflow: 'hidden',
                            bgcolor: 'divider',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: isCompleted ? '100%' : '0%',
                              bgcolor: accentColor,
                              transition: 'width 0.45s cubic-bezier(0.4,0,0.2,1)',
                              borderRadius: 2,
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  )
                })}
              </Box>
            </Paper>
          </Box>
        )}

        {/* ── Form card ────────────────────────── */}
        <Box
          sx={{
            width: '100%',
            maxWidth: isDone ? 620 : 840,
            transition: 'max-width 0.35s cubic-bezier(0.4,0,0.2,1)',
            animation: 'fadeUp 0.35s ease both',
            '@keyframes fadeUp': {
              from: { opacity: 0, transform: 'translateY(10px)' },
              to:   { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'hidden',
              boxShadow: theme =>
                `0 2px 8px ${hexToRGBA(theme.palette.common.black, 0.05)},
                 0 20px 60px ${hexToRGBA(theme.palette.common.black, 0.08)}`,
            }}
          >
            {/* Colour accent top bar */}
            {!isDone && (
              <Box
                sx={{
                  height: 4,
                  background: `linear-gradient(90deg, ${accentColor} 0%, ${hexToRGBA(accentColor, 0.35)} 100%)`,
                }}
              />
            )}

            {/* Step header bar (inside card) */}
            {!isDone && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: { xs: 3, sm: 5, md: 7 },
                  pt: 3.5,
                  pb: 0,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      bgcolor: hexToRGBA(accentColor, 0.1),
                      border: `1px solid ${hexToRGBA(accentColor, 0.2)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      icon={steps[activeStep]?.icon || 'tabler:circle'}
                      fontSize='1.125rem'
                      style={{ color: accentColor }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant='body2'
                      sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}
                    >
                      {steps[activeStep]?.title}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                      {steps[activeStep]?.subtitle}
                    </Typography>
                  </Box>
                </Box>

                {/* Step x/n pill */}
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 10,
                    bgcolor: hexToRGBA(accentColor, 0.08),
                    border: `1px solid ${hexToRGBA(accentColor, 0.18)}`,
                  }}
                >
                  <Typography
                    variant='caption'
                    sx={{ fontWeight: 700, color: accentColor, fontSize: 11 }}
                  >
                    {activeStep + 1} of {totalSteps}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Divider below in-card header */}
            {!isDone && (
              <Box sx={{ px: { xs: 3, sm: 5, md: 7 }, pt: 3 }}>
                <Box sx={{ height: 1, bgcolor: 'divider' }} />
              </Box>
            )}

            {/* Form body */}
            <Box sx={{ px: { xs: 3, sm: 5, md: 7 }, py: { xs: 4, md: 5 } }}>
              {getStepContent(activeStep)}
            </Box>
          </Paper>

          {/* ── Security footnote ──────────────── */}
          {!isDone && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mt: 3,
              }}
            >
              {[
                { icon: 'tabler:lock', text: '256-bit SSL encrypted' },
                { icon: 'tabler:shield-check', text: 'SOC 2 Compliant' },
                { icon: 'tabler:eye-off', text: 'Data never sold' },
              ].map(item => (
                <Box
                  key={item.text}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <Icon
                    icon={item.icon}
                    fontSize='0.8rem'
                    style={{ color: 'var(--mui-palette-text-disabled)' }}
                  />
                  <Typography variant='caption' sx={{ color: 'text.disabled', fontSize: 11 }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default RegisterMultiSteps
