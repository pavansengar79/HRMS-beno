// src/pages/admin/system-config/essentials.js
//
// Essentials Configuration - ORG ADMIN ONLY
//
// This page is visible ONLY to org_admin role and contains:
//   Organization-wide: Logo, Address, Timezone, Currency, Fiscal Year
//
// These are organization-wide settings that apply to all companies.
//
// API: GET/PUT /api/v1/organization/config

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { selectRoleSlug, selectOrgId } from 'src/store/auth/authSlice'
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
import CircularProgress from '@mui/material/CircularProgress'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomChip from 'src/@core/components/mui/chip'

const TIMEZONES  = ['Asia/Kolkata (IST +5:30)', 'UTC', 'US/Eastern', 'US/Pacific', 'Europe/London']
const CURRENCIES = ['INR — Indian Rupee (₹)', 'USD — US Dollar ($)', 'GBP — British Pound (£)', 'EUR — Euro (€)']

// Admin roles that can access this page
const ALLOWED_ROLES = ['org_admin', 'SUPER_ADMIN', 'product_admin']

// ─── Main Page ─────────────────────────────────────────────────────────────────

const EssentialsConfigPage = () => {
  const router = useRouter()
  const roleSlug = useSelector(selectRoleSlug)
  const userOrgId = useSelector(selectOrgId)

  // Check if user is org_admin
  const isOrgAdmin = ALLOWED_ROLES.includes(roleSlug)

  const [initLoading, setInitLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Organization config state
  const [org, setOrg] = useState({ 
    name: '',
    logo_url: '',
    timezone: 'Asia/Kolkata (IST +5:30)', 
    currency: 'INR — Indian Rupee (₹)', 
    fiscalYearStart: '4',
    industry: '',
    country: '',
    contact_email: '',
    contact_phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    }
  })

  // Boot - load existing config
  useEffect(() => {
    const boot = async () => {
      try {
        const res = await axiosRequest.get('/api/v1/organization/config').catch(() => null)
        const data = res?.data || {}

        // Auto-fill from organization config
        if (data) {
          const currencyDisplay = data.currency ? CURRENCIES.find(c => c.startsWith(data.currency)) || 'INR — Indian Rupee (₹)' : 'INR — Indian Rupee (₹)'
          const timezoneDisplay = data.timezone ? TIMEZONES.find(t => t.startsWith(data.timezone)) || 'Asia/Kolkata (IST +5:30)' : 'Asia/Kolkata (IST +5:30)'
          
          setOrg({ 
            name: data.name || '',
            logo_url: data.logo_url || '',
            timezone: timezoneDisplay, 
            currency: currencyDisplay, 
            fiscalYearStart: String(data.fiscalYearStart || '4'),
            industry: data.industry || '',
            country: data.country || '',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            address: data.address || {
              street: '',
              city: '',
              state: '',
              pincode: '',
              country: ''
            }
          })
          
          if (data.timezone || data.currency) setSaved(true)
        }
      } catch (_) {}
      finally { setInitLoading(false) }
    }
    boot()
  }, [])

  const saveConfig = async () => {
    setSaving(true)
    try {
      // Extract currency code (first 3 characters) and timezone code
      const currencyCode = org.currency.substring(0, 3)
      const timezoneCode = org.timezone.split(' ')[0].replace('(', '')
      
      await axiosRequest.put('/api/v1/organization/config', { 
        timezone: timezoneCode, 
        currency: currencyCode, 
        fiscalYearStart: Number(org.fiscalYearStart),
        industry: org.industry,
        country: org.country,
        contact_email: org.contact_email,
        contact_phone: org.contact_phone,
        address: org.address
      })
      
      setSaved(true)
      toast.success('Organization config saved successfully')
    } catch (err) { 
      toast.error(err?.response?.data?.message || 'Save failed') 
    }
    finally { setSaving(false) }
  }

  if (initLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>

  // Access denied if user is NOT org_admin
  if (!isOrgAdmin) {
    return (
      <Box sx={{ p: 8, textAlign: 'center' }}>
        <Icon icon='tabler:lock' fontSize={64} color='error' />
        <Typography variant='h5' sx={{ mt: 4 }}>Access Denied</Typography>
        <Typography color='text.secondary' sx={{ mt: 2 }}>This page is only accessible to Org Admin</Typography>
        <Typography variant='caption' color='text.disabled' sx={{ mt: 1, display: 'block' }}>Required role: org_admin</Typography>
        <Button variant='contained' sx={{ mt: 4 }} onClick={() => router.push('/dashboards/analytics')}>
          Go to Dashboard
        </Button>
      </Box>
    )
  }

  // ── Org Admin View ───────────────────────────────────────────────────────

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800 }}>Organization Essentials</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
            Organization-wide settings that apply to all companies
          </Typography>
        </Box>
        {saved && <CustomChip rounded skin='light' size='small' color='success' label='Saved' />}
      </Box>

      <Alert severity='info' sx={{ mb: 4 }} icon={<Icon icon='tabler:info-circle' />}>
        <Typography variant='body2'>
          <strong>Organization-level settings:</strong> These apply globally across all companies in the organization. 
          Company-specific settings (PAN, GST, PF/ESIC, etc.) are configured by Company Admins.
        </Typography>
      </Alert>

      {/* ── Organization Details Card ─────────────────────────────────────────────── */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ px: 5, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Organization Details</Typography>
          <Typography variant='caption' color='text.secondary'>Basic organization information (optional)</Typography>
        </Box>
        <Box sx={{ p: 5 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <CustomTextField 
                fullWidth 
                label='Organization Name'
                value={org.name} 
                disabled
                helperText='Organization name (read-only)'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField 
                fullWidth 
                label='Industry'
                value={org.industry}
                onChange={e => { setOrg(p => ({ ...p, industry: e.target.value })); setSaved(false) }}
                placeholder='e.g. Information Technology'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField 
                fullWidth 
                label='Contact Email'
                type='email'
                value={org.contact_email}
                onChange={e => { setOrg(p => ({ ...p, contact_email: e.target.value })); setSaved(false) }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField 
                fullWidth 
                label='Contact Phone'
                value={org.contact_phone}
                onChange={e => { setOrg(p => ({ ...p, contact_phone: e.target.value })); setSaved(false) }}
              />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* ── Address Card ─────────────────────────────────────────────────────── */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ px: 5, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Address (Optional)</Typography>
          <Typography variant='caption' color='text.secondary'>Organization registered address</Typography>
        </Box>
        <Box sx={{ p: 5 }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField 
                fullWidth 
                label='Street Address'
                value={org.address.street}
                onChange={e => { setOrg(p => ({ ...p, address: { ...p.address, street: e.target.value } })); setSaved(false) }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField 
                fullWidth 
                label='City'
                value={org.address.city}
                onChange={e => { setOrg(p => ({ ...p, address: { ...p.address, city: e.target.value } })); setSaved(false) }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField 
                fullWidth 
                label='State'
                value={org.address.state}
                onChange={e => { setOrg(p => ({ ...p, address: { ...p.address, state: e.target.value } })); setSaved(false) }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField 
                fullWidth 
                label='Pincode'
                value={org.address.pincode}
                onChange={e => { setOrg(p => ({ ...p, address: { ...p.address, pincode: e.target.value } })); setSaved(false) }}
              />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* ── Global Settings Card ─────────────────────────────────────────────────── */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ px: 5, py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box>
            <Stack direction='row' alignItems='center' spacing={1.5}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Global Settings</Typography>
              <CustomChip rounded skin='light' size='small' color='error' label='Required' />
            </Stack>
            <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
              Timezone and currency apply to all companies in the organization
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: 5 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <CustomTextField 
                fullWidth 
                select 
                label='Timezone *' 
                value={org.timezone} 
                onChange={e => { setOrg(p => ({ ...p, timezone: e.target.value })); setSaved(false) }} 
                helperText='All attendance and payroll dates use this timezone'
              >
                {TIMEZONES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </CustomTextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField 
                fullWidth 
                select 
                label='Currency *' 
                value={org.currency} 
                onChange={e => { setOrg(p => ({ ...p, currency: e.target.value })); setSaved(false) }} 
                helperText='All salary figures display in this currency'
              >
                {CURRENCIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </CustomTextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField 
                fullWidth 
                select 
                label='Fiscal Year Start' 
                value={org.fiscalYearStart} 
                onChange={e => { setOrg(p => ({ ...p, fiscalYearStart: e.target.value })); setSaved(false) }}
              >
                <MenuItem value='4'>April (Apr–Mar)</MenuItem>
                <MenuItem value='1'>January (Jan–Dec)</MenuItem>
              </CustomTextField>
            </Grid>
          </Grid>
        </Box>
      </Card>

      <Alert severity='info' sx={{ mb: 4 }} icon={<Icon icon='tabler:info-circle' />}>
        <Typography variant='body2'>
          <strong>Note:</strong> Company-specific settings (PAN, GST, CIN, PF/ESIC registration, Security, SMTP, LOBs) 
          are configured by Company Admins in their System Config page.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant='contained' endIcon={<Icon icon='tabler:check' />} onClick={saveConfig} disabled={saving}>
          {saving ? <CircularProgress size={16} /> : 'Save Configuration'}
        </Button>
      </Box>
    </Box>
  )
}

export default EssentialsConfigPage
