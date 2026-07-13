// src/views/apps/company/view/CompanyViewRight.jsx

// ** MUI Imports
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { useTheme, alpha } from '@mui/material/styles'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Redux
import { useDispatch, useSelector } from 'react-redux'
import { updateCompany, getCompanyModules, updateCompanyModules } from 'src/store/company/companySlice'
import { useEffect, useState } from 'react'

// ─── Overview tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ company }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Map API fields
  const code = company.company_code || company.companyCode || company.tenantCode || '—'
  const name = company.company_name || company.companyName || '—'
  const email = company.company_email || company.companyEmail || '—'
  const phone = company.company_phone || company.companyPhone || '—'

  // Address handling
  const regAddr = company.registered_address || {}
  const address = company.address || {}

  return (
    <Stack spacing={4}>
      {/* ── Identity ────────────────────────────────────────────── */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant='h6'>Company Identity</Typography>
            <Chip label={company.status || 'Active'} size='small' color='success' />
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              {[
                { label: 'Company Code', value: code },
                { label: 'Company Name', value: name },
                { label: 'Brand Name',   value: company.brand_name || '—' },
                { label: 'Company Size', value: company.company_size || '—' },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ mb: 3 }}>
                  <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }}>{label}</Typography>
                  <Typography variant='body1' sx={{ fontWeight: 600, color: 'text.primary' }}>{value || '—'}</Typography>
                </Box>
              ))}
            </Grid>
            <Grid item xs={12} md={6}>
              {[
                { label: 'Email', value: email },
                { label: 'Phone', value: phone },
                { label: 'Year Type', value: company.year_type || 'CALENDAR' },
                { label: 'Pay Schedule', value: company.pay_schedule || 'MONTHLY' },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ mb: 3 }}>
                  <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }}>{label}</Typography>
                  <Typography variant='body1' sx={{ fontWeight: 600, color: 'text.primary' }}>{value || '—'}</Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Statutory Compliance ─────────────────────────────────── */}
      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 3 }}>Statutory Compliance</Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              {[
                { label: 'GST', value: company.gst },
                { label: 'PAN', value: company.pan },
                { label: 'CIN', value: company.cin },
                { label: 'TAN', value: company.tan },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ mb: 3 }}>
                  <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }}>{label}</Typography>
                  <Chip label={value || 'Not provided'} size='small' color={value ? 'primary' : 'default'} variant='outlined' />
                </Box>
              ))}
            </Grid>
            <Grid item xs={12} md={6}>
              {[
                { label: 'EPFO', value: company.epfo },
                { label: 'ESIC', value: company.esic },
                { label: 'PT State', value: company.pt_state },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ mb: 3 }}>
                  <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }}>{label}</Typography>
                  <Chip label={value || 'Not provided'} size='small' color={value ? 'primary' : 'default'} variant='outlined' />
                </Box>
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Addresses ─────────────────────────────────────────────── */}
      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 3 }}>Addresses</Typography>

          <Grid container spacing={4}>
            {/* Registered Address */}
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle2' sx={{ color: 'text.secondary', mb: 2 }}>Registered Address</Typography>
              {regAddr && Object.keys(regAddr).some(k => regAddr[k]) ? (
                <Box sx={{ p: 2, bgcolor: alpha('#6366f1', isDark ? 0.05 : 0.02), borderRadius: 2 }}>
                  {[regAddr.street, regAddr.city, regAddr.state, regAddr.pincode, regAddr.country].filter(Boolean).map((line, i) => (
                    <Typography key={i} variant='body2' sx={{ color: 'text.primary' }}>{line}</Typography>
                  ))}
                </Box>
              ) : (
                <Typography variant='body2' sx={{ color: 'text.disabled' }}>No registered address provided</Typography>
              )}
            </Grid>

            {/* Correspondence Address */}
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle2' sx={{ color: 'text.secondary', mb: 2 }}>Correspondence Address</Typography>
              {company.correspondence_address ? (
                <Box sx={{ p: 2, bgcolor: alpha('#10b981', isDark ? 0.05 : 0.02), borderRadius: 2 }}>
                  <Typography variant='body2' sx={{ color: 'text.primary' }}>{company.correspondence_address}</Typography>
                </Box>
              ) : (
                <Typography variant='body2' sx={{ color: 'text.disabled' }}>Same as registered address</Typography>
              )}
            </Grid>

            {/* Legacy Address (backward compatibility) */}
            {address && Object.keys(address).some(k => address[k]) && (
              <Grid item xs={12}>
                <Typography variant='subtitle2' sx={{ color: 'text.secondary', mb: 2 }}>Address (Legacy)</Typography>
                <Box sx={{ p: 2, bgcolor: alpha('#f59e0b', isDark ? 0.05 : 0.02), borderRadius: 2 }}>
                  {Object.entries(address).filter(([k, v]) => v).map(([k, v]) => (
                    <Typography key={k} variant='body2' sx={{ color: 'text.primary', textTransform: 'capitalize' }}>{k}: {v}</Typography>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  )
}

// ─── Config tab ───────────────────────────────────────────────────────────────
const ConfigTab = ({ company }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Working hours mapping
  const wh = company.working_hours || company.workingHours || {}

  // Leave policy mapping
  const lp = company.leave_policy || company.leavePolicy || {}

  return (
    <Stack spacing={4}>
      {/* ── Working Hours ─────────────────────────────────────── */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant='h6'>Working Hours</Typography>
            <Chip label={wh.start_time || '09:00'} size='small' color='primary' />
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }}>Start Time</Typography>
              <Typography variant='h5' sx={{ fontWeight: 800, color: 'text.primary' }}>{wh.start_time || '09:00'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }}>End Time</Typography>
              <Typography variant='h5' sx={{ fontWeight: 800, color: 'text.primary' }}>{wh.end_time || '18:00'}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }}>Saturday Type</Typography>
          <Chip label={wh.saturday_type?.replace(/_/g, ' ') || 'NONE'} size='small' sx={{ mt: 1 }} />

          <Divider sx={{ my: 4 }} />

          <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>Working Days</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {(wh.working_days || ['MON', 'TUE', 'WED', 'THU', 'FRI']).map(day => (
              <Chip key={day} label={day} size='small' color='primary' variant='outlined' />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* ── Leave Policy ──────────────────────────────────────── */}
      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 4 }}>Leave Policy</Typography>

          <Grid container spacing={4}>
            {[
              { label: 'Annual Leave', value: lp.annual_leave || lp.annualLeave || 12, color: '#6366f1' },
              { label: 'Sick Leave', value: lp.sick_leave || lp.sickLeave || 6, color: '#ef4444' },
              { label: 'Casual Leave', value: lp.casual_leave || lp.casualLeave || 6, color: '#10b981' },
            ].map(item => (
              <Grid item xs={12} md={4} key={item.label}>
                <Card sx={{ bgcolor: alpha(item.color, isDark ? 0.1 : 0.05), border: `1px solid ${alpha(item.color, 0.2)}` }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant='h3' sx={{ fontWeight: 800, color: item.color }}>{item.value}</Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>{item.label} days/year</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* ── Payroll Config ────────────────────────────────────── */}
      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 4 }}>Payroll Configuration</Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }}>Year Type</Typography>
              <Chip label={company.year_type || 'CALENDAR'} size='small' color='primary' sx={{ mt: 1 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }}>Pay Schedule</Typography>
              <Chip label={company.pay_schedule || 'MONTHLY'} size='small' color='success' sx={{ mt: 1 }} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  )
}

// ─── Modules tab ───────────────────────────────────────────────────────────────
const ModulesTab = ({ company }) => {
  const dispatch = useDispatch()
  const { modules, loading } = useSelector(s => s.company)
  const [localModules, setLocalModules] = useState([])

  const companyId = company._id || company.id
  useEffect(() => {
    if (companyId) {
      dispatch(getCompanyModules(companyId))
    }
  }, [companyId, dispatch])

  useEffect(() => {
    if (modules && modules.length > 0) {
      setLocalModules(modules.map(m => ({ ...m, is_active: m.is_active ?? m.isActive ?? true })))
    }
  }, [modules])

  const handleToggle = (moduleId) => {
    setLocalModules(prev =>
      prev.map(m => m.module_id === moduleId || m.moduleId === moduleId ? { ...m, is_active: !m.is_active } : m)
    )
  }

  const handleSave = async () => {
    const companyId = company._id || company.id
    const updates = localModules.map(m => ({
      moduleId: m.module_id || m.moduleId,
      is_active: m.is_active
    }))
    await dispatch(updateCompanyModules({ companyId, modules: updates }))
  }

  if (loading) return <Alert severity='info'>Loading modules…</Alert>

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant='h6'>Active Modules</Typography>
          <Button variant='contained' size='small' onClick={handleSave}>Save Changes</Button>
        </Box>

        {localModules.length === 0 ? (
          <Alert severity='info'>No modules configured for this company</Alert>
        ) : (
          <Grid container spacing={3}>
            {localModules.map(m => {
              const name = m.module_name || m.moduleName || m.name || 'Module'
              const code = m.module_code || m.moduleCode || m.code || ''
              const isActive = m.is_active
              return (
                <Grid item xs={12} sm={6} md={4} key={m.module_id || m.moduleId || m._id}>
                  <Card
                    sx={{
                      p: 3,
                      border: `2px solid`,
                      borderColor: isActive ? '#6366f1' : 'divider',
                      bgcolor: isActive ? alpha('#6366f1', 0.05) : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: 4 }
                    }}
                    onClick={() => handleToggle(m.module_id || m.moduleId)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant='body1' sx={{ fontWeight: 600 }}>{name}</Typography>
                        <Typography variant='caption' color='text.secondary'>{code}</Typography>
                      </Box>
                      <Chip label={isActive ? 'Active' : 'Inactive'} size='small' color={isActive ? 'success' : 'default'} />
                    </Box>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </CardContent>
    </Card>
  )
}

// ─── CompanyViewRight ─────────────────────────────────────────────────────────
const CompanyViewRight = ({ tab, company }) => {
  const router = useRouter()
  const { id } = router.query

  const handleTabChange = (_, newTab) => {
    router.push(`/company/${id}/details/${newTab}`, undefined, { shallow: true })
  }

  return (
    <TabContext value={tab}>
      <TabList
        variant='scrollable'
        scrollButtons='auto'
        onChange={handleTabChange}
        sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}`, mb: 4 }}
      >
        <Tab value='overview' label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Icon fontSize='1.125rem' icon='tabler:layout-dashboard' />
            Overview
          </Box>
        } />
        <Tab value='config' label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Icon fontSize='1.125rem' icon='tabler:settings' />
            Config
          </Box>
        } />
        <Tab value='modules' label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Icon fontSize='1.125rem' icon='tabler:apps' />
            Modules
          </Box>
        } />
      </TabList>

      <TabPanel value='overview' sx={{ p: 0 }}>
        <OverviewTab company={company} />
      </TabPanel>

      <TabPanel value='config' sx={{ p: 0 }}>
        <ConfigTab company={company} />
      </TabPanel>

      <TabPanel value='modules' sx={{ p: 0 }}>
        <ModulesTab company={company} />
      </TabPanel>
    </TabContext>
  )
}

export default CompanyViewRight