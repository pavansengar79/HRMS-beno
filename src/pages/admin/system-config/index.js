// src/pages/admin/system-config/index.js
//
// System Configuration
//
// Company Admin view — Wizard with 6 steps:
//   Step 1 (REQUIRED): Essentials — PAN, timezone, currency
//   Step 2 (optional): Company Details — CIN/TAN/GST/PF/ESIC/address
//   Step 3 (optional): Lines of Business — LOB names for BU creation
//   Step 4 (optional): Security — MFA, session, OAuth
//   Step 5 (optional): Mail & Integrations — SMTP, Maps
//   Step 6 (optional): Module Flags + Operational Defaults
//
// Unit Admin view — Tier 2 overrides only:
//   Working Days, Standard Hours, Regularisation Window, Default Shift
//
// API: GET/PUT /api/v1/company-config/config
//      PUT /api/v1/companies/:id

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectRoleSlug, selectCompanyId, selectOrgId } from 'src/store/auth/authSlice'
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepButton from '@mui/material/StepButton'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomChip from 'src/@core/components/mui/chip'

const TIMEZONES  = ['Asia/Kolkata (IST +5:30)', 'UTC', 'US/Eastern', 'US/Pacific', 'Europe/London']
const CURRENCIES = ['INR — Indian Rupee (₹)', 'USD — US Dollar ($)', 'GBP — British Pound (£)', 'EUR — Euro (€)']
const PT_STATES  = ['Karnataka', 'Maharashtra', 'Delhi', 'Haryana', 'Telangana', 'Tamil Nadu', 'Andhra Pradesh']
const INDUSTRIES = ['Information Technology', 'Manufacturing', 'Financial Services', 'Healthcare', 'E-Commerce', 'Education']
const SHIFTS     = ['General (09:00–18:00)', 'Day Shift (07:00–15:00)', 'Night Shift (21:00–06:00)']
const WIZARD_STEPS = [
  { label: 'Essentials',          required: true  },
  { label: 'Company Details',     required: false },
  { label: 'Lines of Business',   required: false },
  { label: 'Security',            required: false },
  { label: 'Mail & Integrations', required: false },
  { label: 'Module Flags',        required: false },
]

// ─── LOB Manager ──────────────────────────────────────────────────────────────

const LOBManager = ({ companyId }) => {
  const [lobs, setLobs]     = useState([])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch LOBs on mount
  useEffect(() => {
    if (!companyId) return
    const fetchLobs = async () => {
      setLoading(true)
      try {
        const res = await axiosRequest.get('/api/v1/lobs', { params: { company_id: companyId } })
        const data = res?.data || res?.lobs || res || []
        setLobs(Array.isArray(data) ? data : data.lobs || [])
      } catch (err) {
        console.error('Failed to fetch LOBs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLobs()
  }, [companyId])

  const addLob = async () => {
    const name = input.trim()
    if (!name) { toast.error('Enter a LOB name'); return }
    if (lobs.some(l => l.name.toLowerCase() === name.toLowerCase())) { toast.error('LOB already exists'); return }
    
    setSaving(true)
    try {
      const res = await axiosRequest.post('/api/v1/lobs', { 
        name, 
        company_id: companyId,
        code: name.substring(0, 3).toUpperCase(),
        status: 'Active'
      })
      const newLob = res?.data || res
      setLobs(p => [...p, newLob])
      setInput('')
      toast.success('LOB created successfully')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create LOB')
    } finally {
      setSaving(false)
    }
  }

  const deleteLob = async (lobId, lobName) => {
    try {
      await axiosRequest.delete(`/api/v1/lobs/${lobId}`)
      setLobs(p => p.filter(l => l._id !== lobId))
      toast.success(`${lobName} removed`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete LOB')
    }
  }

  return (
    <Stack spacing={3}>
      <Alert severity='info' icon={<Icon icon='tabler:info-circle' />}>
        These names become the dropdown options when creating a Business Unit. Free text is not allowed.
      </Alert>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <Stack direction='row' flexWrap='wrap' gap={1}>
            {lobs.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>No LOBs created yet. Add your first one below.</Typography>
            ) : (
              lobs.map(lob => (
                <Chip 
                  key={lob._id} 
                  label={lob.name} 
                  color='primary' 
                  variant='outlined' 
                  size='small'
                  onDelete={() => deleteLob(lob._id, lob.name)}
                  sx={{ fontWeight: 600 }} 
                />
              ))
            )}
          </Stack>
          <Stack direction='row' spacing={2}>
            <CustomTextField 
              size='small' 
              placeholder='+ Add new LOB name…' 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLob() } }}
              sx={{ flex: 1 }} 
            />
            <Button variant='contained' size='small' onClick={addLob} disabled={saving || !input.trim()}>
              {saving ? <CircularProgress size={16} /> : 'Add'}
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  )
}

// ─── Feature Row ──────────────────────────────────────────────────────────────

const FeatureRow = ({ label, sub, status }) => {
  const map = { enabled: { color: 'success', label: 'Enabled' }, soon: { color: 'default', label: 'Coming Soon' }, enterprise: { color: 'secondary', label: 'Enterprise' }, pending: { color: 'warning', label: 'Pending' } }
  const { color, label: sl } = map[status] || { color: 'default', label: status }
  return (
    <Box sx={{ px: 4, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 0 } }}>
      <Box>
        <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>{label}</Typography>
        <Typography variant='caption' color='text.secondary'>{sub}</Typography>
      </Box>
      <CustomChip rounded skin='light' size='small' color={color} label={sl} />
    </Box>
  )
}

// ─── Security Row ─────────────────────────────────────────────────────────────

const SecurityRow = ({ label, sub, children }) => (
  <Box sx={{ px: 4, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 0 } }}>
    <Box sx={{ mr: 2 }}>
      <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>{label}</Typography>
      {sub && <Typography variant='caption' color='text.secondary'>{sub}</Typography>}
    </Box>
    {children}
  </Box>
)

// ─── Step Card ────────────────────────────────────────────────────────────────

const StepCard = ({ title, sub, required, onSave, saving, children }) => (
  <Card sx={{ mb: 0 }}>
    <Box sx={{ px: 5, py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box>
        <Stack direction='row' alignItems='center' spacing={1.5}>
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>{title}</Typography>
          {required && <CustomChip rounded skin='light' size='small' color='error' label='Required' />}
        </Stack>
        {sub && <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>{sub}</Typography>}
      </Box>
      {onSave && (
        <Button variant='contained' size='small' onClick={onSave} disabled={saving}>
          {saving ? <CircularProgress size={16} /> : 'Save'}
        </Button>
      )}
    </Box>
    <Box sx={{ p: 5 }}>{children}</Box>
  </Card>
)

// ─── Main Page ─────────────────────────────────────────────────────────────────

const SystemConfigPage = () => {
  const roleSlug = useSelector(selectRoleSlug)
  const userCompanyId = useSelector(selectCompanyId)      // Get company_id from user data
  const userOrgId = useSelector(selectOrgId)
  const isUnitLevel    = roleSlug === 'unit_admin' || roleSlug === 'hr_manager'
  const isCompanyLevel = !isUnitLevel

  const [activeStep, setActiveStep] = useState(0)
  const [completed,  setCompleted]  = useState({})
  const [initLoading, setInitLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [companyId, setCompanyId] = useState(null)

  // Step 1: Essentials
  const [ess, setEss] = useState({ pan: '', timezone: 'Asia/Kolkata (IST +5:30)', currency: 'INR — Indian Rupee (₹)', fiscalYear: '4' })
  // Step 2: Company Details
  const [profile, setProfile] = useState({ legalName: '', brandName: '', cin: '', tan: '', gst: '', pf: '', esic: '', ptState: 'Karnataka', industry: 'Information Technology', regAddress: '', corrAddress: '' })
  // Step 4: Security
  const [security, setSecurity] = useState({ mfa: 'ADMINS', maxAttempts: '5', sessionTimeout: '60 mins', googleOAuth: true, msOAuth: true })
  // Step 5: SMTP / Maps
  const [smtp, setSmtp] = useState({ fromName: '', fromEmail: '', host: '', port: '587', smtpSecurity: 'TLS', username: '', apiKey: '', mapsKey: '' })
  // Operational defaults (unit overrides + step 6)
  const [prefs, setPrefs] = useState({ workingHours: '8', regularisationWindow: '30', defaultShift: 'General (09:00–18:00)', workingDays: { MON: true, TUE: true, WED: true, THU: true, FRI: true, SAT: false, SUN: false } })

  // Boot
  useEffect(() => {
    const boot = async () => {
      try {
        // For company-level users, use company_id from user data directly
        if (isCompanyLevel && userCompanyId) {
          setCompanyId(userCompanyId)
          // Fetch company details by ID
          const compRes = await axiosRequest.get(`/api/v1/companies/${userCompanyId}`).catch(() => null)
          const company = compRes?.data || null  // AxiosInterceptor returns response.data, so compRes = { success, data }
          if (company) {
            // Build registered address string
            const regAddr = company.registered_address
              ? [company.registered_address.street, company.registered_address.city, company.registered_address.state, company.registered_address.pincode].filter(Boolean).join(', ')
              : ''
            // Build correspondence address string
            const corrAddr = company.correspondence_address
              ? [company.correspondence_address.street, company.correspondence_address.city, company.correspondence_address.state, company.correspondence_address.pincode].filter(Boolean).join(', ')
              : ''
            setProfile(p => ({ 
              ...p, 
              legalName: company.company_name || '', 
              brandName: company.brand_name || '', 
              cin: company.cin || '', 
              tan: company.tan || '', 
              gst: company.gst || '', 
              pf: company.pf_registration || company.epfo || '', 
              esic: company.esic_registration || company.esic || '', 
              ptState: company.pt_state || 'Karnataka', 
              industry: company.industry || 'Information Technology', 
              regAddress: regAddr, 
              corrAddress: corrAddr 
            }))
          }
        }
        const cfgRes = await axiosRequest.get('/api/v1/company-config/config').catch(() => null)
        const cfg    = cfgRes?.data || cfgRes || {}  // AxiosInterceptor returns response.data
        // Auto-fill Essentials (Step 1) from config if pan exists
        if (cfg.pan) {
          // Convert backend codes to display format
          const currencyDisplay = cfg.currency ? CURRENCIES.find(c => c.startsWith(cfg.currency)) || `INR — Indian Rupee (₹)` : `INR — Indian Rupee (₹)`
          const timezoneDisplay = cfg.timezone ? TIMEZONES.find(t => t.startsWith(cfg.timezone)) || 'Asia/Kolkata (IST +5:30)' : 'Asia/Kolkata (IST +5:30)'
          setEss(p => ({ ...p, pan: cfg.pan || '', timezone: timezoneDisplay, currency: currencyDisplay, fiscalYear: String(cfg.fiscalYearStart || '4') }))
          setCompleted(p => ({ ...p, 0: true }))  // Mark Step 1 as complete
        }
        // Auto-fill Working Days/Prefs (Step 6) from config
        const ww = Array.isArray(cfg.workWeek) ? cfg.workWeek : []
        setPrefs(p => ({ ...p, workingHours: String(cfg.standardHoursPerDay ?? p.workingHours), regularisationWindow: String(cfg.regularisationWindowDays ?? p.regularisationWindow), defaultShift: cfg.defaultFallbackShift || p.defaultShift, workingDays: ww.length > 0 ? { MON: ww.includes('MON'), TUE: ww.includes('TUE'), WED: ww.includes('WED'), THU: ww.includes('THU'), FRI: ww.includes('FRI'), SAT: ww.includes('SAT'), SUN: ww.includes('SUN') } : p.workingDays }))
        // Auto-fill SMTP settings (Step 5) if exists
        if (isCompanyLevel && cfg.smtp) setSmtp(p => ({ ...p, fromName: cfg.smtp.from || '', fromEmail: cfg.smtp.user || '', host: cfg.smtp.host || '', port: String(cfg.smtp.port || 587), username: cfg.smtp.user || '', mapsKey: cfg.googleMapsApiKey || '' }))
      } catch (_) {}
      finally { setInitLoading(false) }
    }
    boot()
  }, [isCompanyLevel, userCompanyId])

  const saveEssentials = async () => {
    if (!ess.pan) { toast.error('PAN is required'); return }
    setSaving(true)
    try {
      // Extract currency code (first 3 characters) and timezone code
      const currencyCode = ess.currency.substring(0, 3)
      const timezoneCode = ess.timezone.split(' ')[0].replace('(', '')
      await axiosRequest.put('/api/v1/company-config/config', { pan: ess.pan, timezone: timezoneCode, currency: currencyCode, fiscalYearStart: Number(ess.fiscalYear) })
      setCompleted(p => ({ ...p, 0: true })); toast.success('Essentials saved'); setActiveStep(1)
    } catch (err) { toast.error(err?.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const saveProfile = async () => {
    if (!companyId) { toast.error('No company loaded'); return }
    setSaving(true)
    try {
      await axiosRequest.put(`/api/v1/companies/${companyId}`, { 
        company_name: profile.legalName, 
        brand_name: profile.brandName, 
        cin: profile.cin, 
        tan: profile.tan, 
        gst: profile.gst, 
        pf_registration: profile.pf, 
        esic_registration: profile.esic, 
        pt_state: profile.ptState,
        industry: profile.industry,
        registered_address: { street: profile.regAddress, city: '', state: profile.ptState, pincode: '', country: 'India' } 
      })
      setCompleted(p => ({ ...p, 1: true })); toast.success('Company details saved'); setActiveStep(2)
    } catch (err) { toast.error(err?.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const savePrefs = async () => {
    setSaving(true)
    try {
      const workWeek = Object.entries(prefs.workingDays).filter(([, v]) => v).map(([k]) => k)
      await axiosRequest.put('/api/v1/company-config/config', { standardHoursPerDay: Number(prefs.workingHours), regularisationWindowDays: Number(prefs.regularisationWindow), defaultFallbackShift: prefs.defaultShift, workWeek })
      toast.success(isUnitLevel ? 'Unit overrides saved' : 'Operational defaults saved')
    } catch (err) { toast.error(err?.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const saveSecurity = async () => {
    setSaving(true)
    try {
      await axiosRequest.put('/api/v1/company-config/config', { mfaEnforcementLevel: security.mfa, loginMaxAttempts: Number(security.maxAttempts), sessionTimeoutMinutes: Number(security.sessionTimeout), googleOAuthEnabled: security.googleOAuth, microsoftOAuthEnabled: security.msOAuth })
      setCompleted(p => ({ ...p, 3: true })); toast.success('Security settings saved'); setActiveStep(4)
    } catch (err) { toast.error(err?.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const saveMail = async () => {
    setSaving(true)
    try {
      const payload = { smtp: { host: smtp.host, port: Number(smtp.port), user: smtp.username || smtp.fromEmail, from: smtp.fromName, secure: smtp.smtpSecurity === 'SSL' }, googleMapsApiKey: smtp.mapsKey }
      if (smtp.apiKey) payload.smtp.pass = smtp.apiKey
      await axiosRequest.put('/api/v1/company-config/config', payload)
      setCompleted(p => ({ ...p, 4: true })); toast.success('Mail config saved'); setActiveStep(5)
    } catch (err) { toast.error(err?.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const pf = key => ({ value: profile[key] || '', onChange: e => setProfile(p => ({ ...p, [key]: e.target.value })) })
  const sf = key => ({ value: smtp[key]    || '', onChange: e => setSmtp(p => ({ ...p, [key]: e.target.value })) })

  if (initLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>

  // ── Unit Admin View ───────────────────────────────────────────────────────

  if (isUnitLevel) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant='h5' sx={{ fontWeight: 800 }}>System Configuration</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>Unit operational overrides — apply to your Business Unit only</Typography>
        </Box>
        <Alert severity='info' sx={{ mb: 4 }} icon={<Icon icon='tabler:info-circle' />}>
          <Typography variant='body2' sx={{ fontWeight: 700, mb: 0.5 }}>Unit Overrides (Tier 2)</Typography>
          <Typography variant='caption'>Your company has set organisation-wide defaults. Override them here for your unit. Legal settings (PAN/GST, Currency, Fiscal Year, Security, SMTP) are company-only.</Typography>
        </Alert>
        <StepCard title='Working Schedule' sub='Override company defaults for your Business Unit' onSave={savePrefs} saving={saving}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth type='number' label='Standard Working Hours / Day'
                value={prefs.workingHours} onChange={e => setPrefs(p => ({ ...p, workingHours: e.target.value }))}
                inputProps={{ min: 4, max: 12 }} helperText='Company default is 8 hrs' />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth type='number' label='Regularisation Window (days back)'
                value={prefs.regularisationWindow} onChange={e => setPrefs(p => ({ ...p, regularisationWindow: e.target.value }))}
                inputProps={{ min: 1, max: 90 }} helperText='Company default is 30 days' />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth select label='Default Fallback Shift' value={prefs.defaultShift}
                onChange={e => setPrefs(p => ({ ...p, defaultShift: e.target.value }))} helperText='Applied when no roster entry exists'>
                {SHIFTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </CustomTextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Working Days</Typography>
              <Stack direction='row' flexWrap='wrap' gap={1}>
                {Object.entries(prefs.workingDays).map(([day, checked]) => (
                  <FormControlLabel key={day} sx={{ mr: 0 }}
                    control={<Checkbox checked={checked} size='small' onChange={e => setPrefs(p => ({ ...p, workingDays: { ...p.workingDays, [day]: e.target.checked } }))} />}
                    label={<Typography variant='body2'>{day}</Typography>} />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </StepCard>
        <Alert severity='warning' sx={{ mt: 4 }} icon={<Icon icon='tabler:lock' />}>
          <Typography variant='caption'><strong>Tier 3 settings</strong> (Attendance, Leave, Payroll Policies) are managed inside their respective module pages — not here.</Typography>
        </Alert>
      </Box>
    )
  }

  // ── Company Admin — Wizard ────────────────────────────────────────────────

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800 }}>System Configuration</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
            Step-by-step setup · <strong>Step 1 is required</strong> before running payroll · all others are optional
          </Typography>
        </Box>
        {completed[0] && <CustomChip rounded skin='light' size='small' color='success' label='Essentials complete' />}
      </Box>

      <Card sx={{ mb: 4 }}>
        <Box sx={{ p: 3 }}>
          <Stepper nonLinear activeStep={activeStep} alternativeLabel>
            {WIZARD_STEPS.map((step, i) => (
              <Step key={step.label} completed={!!completed[i]}>
                <StepButton onClick={() => setActiveStep(i)} optional={
                  step.required
                    ? <Typography variant='caption' color='error.main' sx={{ fontWeight: 600 }}>Required</Typography>
                    : <Typography variant='caption' color='text.secondary'>Optional</Typography>
                }>
                  {step.label}
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Card>

      {/* Step 1: Essentials */}
      {activeStep === 0 && (
        <Box>
          <Alert severity={completed[0] ? 'success' : 'warning'} sx={{ mb: 4 }} icon={<Icon icon={completed[0] ? 'tabler:check' : 'tabler:alert-triangle'} />}>
            {completed[0] ? 'Essentials saved — you can now run payroll.' : <><strong>Required before payroll can run.</strong> PAN is used for TDS calculations. Timezone and currency affect all date and amount display.</>}
          </Alert>
          <StepCard title='Step 1 — Essentials' required sub='These fields are the minimum needed to get started'>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomTextField fullWidth label='PAN (Permanent Account Number) *'
                  value={ess.pan} onChange={e => setEss(p => ({ ...p, pan: e.target.value }))}
                  inputProps={{ style: { fontFamily: 'monospace', fontSize: 15 }, placeholder: 'e.g. AADCM4321B' }}
                  helperText='Used for income tax identity and TDS deductions in payroll' />
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField fullWidth select label='Timezone *' value={ess.timezone} onChange={e => setEss(p => ({ ...p, timezone: e.target.value }))} helperText='All attendance and payroll dates use this timezone'>
                  {TIMEZONES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField fullWidth select label='Currency *' value={ess.currency} onChange={e => setEss(p => ({ ...p, currency: e.target.value }))} helperText='All salary figures display in this currency'>
                  {CURRENCIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField fullWidth select label='Fiscal Year Start' value={ess.fiscalYear} onChange={e => setEss(p => ({ ...p, fiscalYear: e.target.value }))}>
                  <MenuItem value='4'>April (Apr–Mar)</MenuItem>
                  <MenuItem value='1'>January (Jan–Dec)</MenuItem>
                </CustomTextField>
              </Grid>
              <Grid item xs={12}>
                <Alert severity='info' icon={<Icon icon='tabler:info-circle' />}>
                  <Typography variant='caption'><strong>PF &amp; ESIC registration numbers</strong> are required for accurate payroll deductions — add them in Step 2 (Company Details).</Typography>
                </Alert>
              </Grid>
            </Grid>
          </StepCard>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant='contained' endIcon={<Icon icon='tabler:arrow-right' />} onClick={saveEssentials} disabled={saving || !ess.pan}>
              {saving ? <CircularProgress size={16} /> : 'Save & Next'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 2: Company Details */}
      {activeStep === 1 && (
        <Box>
          <Alert severity='info' sx={{ mb: 4 }} icon={<Icon icon='tabler:info-circle' />}>
            <strong>Optional — but needed before payroll:</strong> PF registration, ESIC registration, and PT State are required for correct payroll deductions.
          </Alert>
          <StepCard title='Step 2 — Company Details' sub='Legal registration, statutory numbers, addresses'>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}><CustomTextField fullWidth label='Legal Company Name' {...pf('legalName')} /></Grid>
              <Grid item xs={12} sm={6}><CustomTextField fullWidth label='Display / Brand Name' {...pf('brandName')} /></Grid>
              <Grid item xs={12} sm={4}><CustomTextField fullWidth label='CIN' inputProps={{ style: { fontFamily: 'monospace' } }} {...pf('cin')} /></Grid>
              <Grid item xs={12} sm={4}><CustomTextField fullWidth label='TAN' inputProps={{ style: { fontFamily: 'monospace' } }} {...pf('tan')} /></Grid>
              <Grid item xs={12} sm={4}><CustomTextField fullWidth label='GST Registration' inputProps={{ style: { fontFamily: 'monospace' } }} {...pf('gst')} /></Grid>
              <Grid item xs={12} sm={4}><CustomTextField fullWidth label='PF Registration No.' inputProps={{ style: { fontFamily: 'monospace' } }} {...pf('pf')} helperText='Required for payroll' /></Grid>
              <Grid item xs={12} sm={4}><CustomTextField fullWidth label='ESIC Registration No.' inputProps={{ style: { fontFamily: 'monospace' } }} {...pf('esic')} helperText='Required for payroll' /></Grid>
              <Grid item xs={12} sm={4}>
                <CustomTextField fullWidth select label='PT State (Professional Tax)' value={profile.ptState} onChange={e => setProfile(p => ({ ...p, ptState: e.target.value }))} helperText='Required for payroll'>
                  {PT_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField fullWidth select label='Industry Type' value={profile.industry} onChange={e => setProfile(p => ({ ...p, industry: e.target.value }))}>
                  {INDUSTRIES.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}><CustomTextField fullWidth label='Registered Address' {...pf('regAddress')} /></Grid>
              <Grid item xs={12} sm={6}><CustomTextField fullWidth label='Correspondence Address' {...pf('corrAddress')} /></Grid>
            </Grid>
          </StepCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button variant='outlined' startIcon={<Icon icon='tabler:arrow-left' />} onClick={() => setActiveStep(0)}>Back</Button>
            <Stack direction='row' spacing={2}>
              <Button variant='outlined' color='secondary' onClick={() => { toast('Skipped — you can return anytime'); setActiveStep(2) }}>Skip for now</Button>
              <Button variant='contained' endIcon={<Icon icon='tabler:arrow-right' />} onClick={saveProfile} disabled={saving}>
                {saving ? <CircularProgress size={16} /> : 'Save & Next'}
              </Button>
            </Stack>
          </Box>
        </Box>
      )}

      {/* Step 3: Lines of Business */}
      {activeStep === 2 && (
        <Box>
          <Alert severity='info' sx={{ mb: 4 }} icon={<Icon icon='tabler:info-circle' />}>
            <strong>Required before creating Business Units.</strong> Without LOB names defined here, the LOB dropdown on the BU creation form will be empty.
          </Alert>
          <StepCard title='Step 3 — Lines of Business' sub='LOB names populate the dropdown when creating Business Units'>
            <LOBManager companyId={companyId} />
          </StepCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button variant='outlined' startIcon={<Icon icon='tabler:arrow-left' />} onClick={() => setActiveStep(1)}>Back</Button>
            <Stack direction='row' spacing={2}>
              <Button variant='outlined' color='secondary' onClick={() => { toast('Skipped — add LOBs before creating BUs'); setActiveStep(3) }}>Skip for now</Button>
              <Button variant='contained' endIcon={<Icon icon='tabler:arrow-right' />} onClick={() => { setCompleted(p => ({ ...p, 2: true })); setActiveStep(3) }}>Next</Button>
            </Stack>
          </Box>
        </Box>
      )}

      {/* Step 4: Security */}
      {activeStep === 3 && (
        <Box>
          <StepCard title='Step 4 — Security' sub='Authentication and access controls — company-wide, units cannot lower these'>
            <SecurityRow label='Multi-Factor Authentication (MFA)' sub='TOTP via Google Authenticator or similar.'>
              <CustomTextField select size='small' value={security.mfa} onChange={e => setSecurity(p => ({ ...p, mfa: e.target.value }))} sx={{ minWidth: 200 }}>
                <MenuItem value='OPTIONAL'>Optional for all</MenuItem>
                <MenuItem value='ADMINS'>Required for Admins</MenuItem>
                <MenuItem value='MANDATORY'>Required for all users</MenuItem>
              </CustomTextField>
            </SecurityRow>
            <SecurityRow label='Login Rate Limiting' sub='Lock account after N failed attempts'>
              <Stack direction='row' spacing={1.5} alignItems='center'>
                <CustomTextField type='number' size='small' sx={{ width: 70 }} value={security.maxAttempts} onChange={e => setSecurity(p => ({ ...p, maxAttempts: e.target.value }))} inputProps={{ min: 3, max: 20, style: { textAlign: 'center' } }} />
                <Typography variant='caption' color='text.secondary'>attempts then 15-min lockout</Typography>
              </Stack>
            </SecurityRow>
            <SecurityRow label='Session Timeout' sub='Auto-logout after inactivity'>
              <CustomTextField select size='small' value={security.sessionTimeout} onChange={e => setSecurity(p => ({ ...p, sessionTimeout: e.target.value }))} sx={{ minWidth: 150 }}>
                {['30 mins', '60 mins', '2 hours', '8 hours'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </CustomTextField>
            </SecurityRow>
            <SecurityRow label='OAuth Login' sub='Allow login with Google or Microsoft'>
              <Stack direction='row' spacing={2}>
                <FormControlLabel control={<Checkbox checked={security.googleOAuth} size='small' onChange={e => setSecurity(p => ({ ...p, googleOAuth: e.target.checked }))} />} label={<Typography variant='body2'>Google</Typography>} />
                <FormControlLabel control={<Checkbox checked={security.msOAuth} size='small' onChange={e => setSecurity(p => ({ ...p, msOAuth: e.target.checked }))} />} label={<Typography variant='body2'>Microsoft</Typography>} />
              </Stack>
            </SecurityRow>
            <SecurityRow label='IP Allowlisting' sub='Restrict logins to specific IP ranges'>
              <CustomChip rounded skin='light' label='Enterprise only' color='secondary' size='small' />
            </SecurityRow>
            <SecurityRow label='SAML 2.0 SSO' sub='Azure AD / Okta integration'>
              <CustomChip rounded skin='light' label='Enterprise only' color='secondary' size='small' />
            </SecurityRow>
          </StepCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button variant='outlined' startIcon={<Icon icon='tabler:arrow-left' />} onClick={() => setActiveStep(2)}>Back</Button>
            <Stack direction='row' spacing={2}>
              <Button variant='outlined' color='secondary' onClick={() => { toast('Skipped'); setActiveStep(4) }}>Skip for now</Button>
              <Button variant='contained' endIcon={<Icon icon='tabler:arrow-right' />} onClick={saveSecurity} disabled={saving}>
                {saving ? <CircularProgress size={16} /> : 'Save & Next'}
              </Button>
            </Stack>
          </Box>
        </Box>
      )}

      {/* Step 5: Mail & Integrations */}
      {activeStep === 4 && (
        <Box>
          <Alert severity='info' sx={{ mb: 4 }} icon={<Icon icon='tabler:info-circle' />}>
            Without mail config, payslip emails, leave approval notifications, and regularisation decisions won't be sent.
          </Alert>
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <StepCard title='SMTP / Email' sub='Sends leave notifications, payslips, regularisation decisions for all units'>
                <Grid container spacing={3}>
                  <Grid item xs={6}><CustomTextField fullWidth label='From Name' {...sf('fromName')} /></Grid>
                  <Grid item xs={6}><CustomTextField fullWidth label='From Email' type='email' {...sf('fromEmail')} /></Grid>
                  <Grid item xs={6}><CustomTextField fullWidth label='SMTP Host' {...sf('host')} /></Grid>
                  <Grid item xs={3}><CustomTextField fullWidth type='number' label='Port' value={smtp.port} onChange={e => setSmtp(p => ({ ...p, port: e.target.value }))} /></Grid>
                  <Grid item xs={3}>
                    <CustomTextField fullWidth select label='Security' value={smtp.smtpSecurity} onChange={e => setSmtp(p => ({ ...p, smtpSecurity: e.target.value }))}>
                      <MenuItem value='TLS'>TLS</MenuItem>
                      <MenuItem value='SSL'>SSL</MenuItem>
                    </CustomTextField>
                  </Grid>
                  <Grid item xs={6}><CustomTextField fullWidth label='SMTP Username' {...sf('username')} /></Grid>
                  <Grid item xs={6}><CustomTextField fullWidth label='API Key / Password' type='password' value={smtp.apiKey} onChange={e => setSmtp(p => ({ ...p, apiKey: e.target.value }))} /></Grid>
                  <Grid item xs={12}>
                    <Button variant='outlined' size='small' startIcon={<Icon icon='tabler:send' />} onClick={() => toast.success('Test email sent')}>Send Test Email</Button>
                  </Grid>
                </Grid>
              </StepCard>
            </Grid>
            <Grid item xs={12} md={5}>
              <StepCard title='Maps Integration' sub='Site location display · geo-fencing post-launch (BIO-01)'>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <CustomTextField fullWidth select label='Provider' value='Google Maps' onChange={() => {}}>
                      <MenuItem value='Google Maps'>Google Maps</MenuItem>
                      <MenuItem value='OpenStreetMap'>OpenStreetMap (free)</MenuItem>
                    </CustomTextField>
                  </Grid>
                  <Grid item xs={12}><CustomTextField fullWidth label='Google Maps API Key' {...sf('mapsKey')} /></Grid>
                  <Grid item xs={12}><Alert severity='info' sx={{ fontSize: 12 }}>Maps will be used for geo-fencing (BIO-01) post-launch.</Alert></Grid>
                </Grid>
              </StepCard>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button variant='outlined' startIcon={<Icon icon='tabler:arrow-left' />} onClick={() => setActiveStep(3)}>Back</Button>
            <Stack direction='row' spacing={2}>
              <Button variant='outlined' color='secondary' onClick={() => { toast('Skipped'); setActiveStep(5) }}>Skip for now</Button>
              <Button variant='contained' endIcon={<Icon icon='tabler:arrow-right' />} onClick={saveMail} disabled={saving}>
                {saving ? <CircularProgress size={16} /> : 'Save & Next'}
              </Button>
            </Stack>
          </Box>
        </Box>
      )}

      {/* Step 6: Module Flags + Operational Defaults */}
      {activeStep === 5 && (
        <Box>
          <StepCard title='Step 6 — Module Configuration' sub='Feature flags and plan-gated modules'>
            <FeatureRow label='HRMS Module' sub='Leave, Attendance, Payroll, Shifts, Regularisation — enabled for all units' status='enabled' />
            <FeatureRow label='CRM Module' sub='Customer relationship management — not yet available' status='soon' />
            <FeatureRow label='BU-Independent Payroll' sub='P-14 · Each BU runs payroll independently — Enterprise only' status='enterprise' />
            <Box sx={{ px: 4, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box><Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>Custom Roles</Typography><Typography variant='caption' color='text.secondary'>R-06 · Current plan allows up to 3 custom roles · 2 used</Typography></Box>
              <CustomChip rounded skin='light' label='2 / 3 used' color='warning' size='small' />
            </Box>
            <FeatureRow label='Leave Encashment' sub='L-15 · Pay unused leave balance — pending decision' status='pending' />
            <FeatureRow label='Sandwich Rule' sub='L-14 · Weekends between leave days count as leave — pending decision' status='pending' />
            <FeatureRow label='Biometrics' sub='BIO-01/02/03 · Browser WebAuthn + hardware device API · Post-launch' status='soon' />
          </StepCard>

          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 1 }}>Operational Defaults</Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>Company-wide defaults for working schedule. Individual Business Units can override these.</Typography>
            <StepCard title='Working Schedule Defaults' sub='Units can override Working Days, Hours, Regularisation Window, and Fallback Shift' onSave={savePrefs} saving={saving}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <CustomTextField fullWidth type='number' label='Standard Working Hours / Day'
                    value={prefs.workingHours} onChange={e => setPrefs(p => ({ ...p, workingHours: e.target.value }))} inputProps={{ min: 4, max: 12 }} helperText='Units that run extended shifts can override this' />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField fullWidth type='number' label='Regularisation Window (days back)'
                    value={prefs.regularisationWindow} onChange={e => setPrefs(p => ({ ...p, regularisationWindow: e.target.value }))} inputProps={{ min: 1, max: 90 }} helperText='Units with field workers can increase this' />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField fullWidth select label='Default Fallback Shift' value={prefs.defaultShift} onChange={e => setPrefs(p => ({ ...p, defaultShift: e.target.value }))} helperText='Applied when no roster entry exists'>
                    {SHIFTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </CustomTextField>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Working Days</Typography>
                  <Stack direction='row' flexWrap='wrap' gap={1}>
                    {Object.entries(prefs.workingDays).map(([day, checked]) => (
                      <FormControlLabel key={day} sx={{ mr: 0 }}
                        control={<Checkbox checked={checked} size='small' onChange={e => setPrefs(p => ({ ...p, workingDays: { ...p.workingDays, [day]: e.target.checked } }))} />}
                        label={<Typography variant='body2'>{day}</Typography>} />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </StepCard>
            <Alert severity='success' sx={{ mt: 3 }} icon={<Icon icon='tabler:building-community' />}>
              <Typography variant='caption'><strong>Tier 3 policies</strong> (Attendance, Leave, Payroll) are managed inside each module page — not here.</Typography>
            </Alert>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button variant='outlined' startIcon={<Icon icon='tabler:arrow-left' />} onClick={() => setActiveStep(4)}>Back</Button>
            <Button variant='contained' color='success' startIcon={<Icon icon='tabler:check' />}
              onClick={() => { setCompleted(p => ({ ...p, 5: true })); toast.success('Setup complete — company is ready') }}>
              Complete Setup
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default SystemConfigPage
