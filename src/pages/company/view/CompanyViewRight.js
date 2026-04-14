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

// ** Next Imports
import { useRouter } from 'next/router'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ─── Overview tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ company }) => (
  <Card>
    <CardContent>
      <Typography variant='h6' sx={{ mb: 4 }}>Usage</Typography>
      <Box sx={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Employees', value: company.usage?.totalEmployees ?? 0 },
          { label: 'Active',          value: company.usage?.byStatus?.ACTIVE ?? 0 },
          { label: 'Inactive',        value: company.usage?.byStatus?.INACTIVE ?? 0 },
          { label: 'On Leave',        value: company.usage?.byStatus?.ON_LEAVE ?? 0 },
        ].map(({ label, value }) => (
          <Box key={label} sx={{ textAlign: 'center' }}>
            <Typography variant='h4' sx={{ fontWeight: 600, color: 'primary.main' }}>{value}</Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>{label}</Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant='h6' sx={{ mb: 3 }}>Address</Typography>
      {company.address && Object.keys(company.address).length > 0 ? (
        Object.entries(company.address).map(([k, v]) => (
          <Box key={k} sx={{ display: 'flex', mb: 2 }}>
            <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 120, textTransform: 'capitalize' }}>
              {k}:
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>{v || '—'}</Typography>
          </Box>
        ))
      ) : (
        <Typography variant='body2' sx={{ color: 'text.disabled' }}>No address on file.</Typography>
      )}
    </CardContent>
  </Card>
)

// ─── Config tab ───────────────────────────────────────────────────────────────
const ConfigTab = ({ company }) => (
  <Card>
    <CardContent>
      <Typography variant='h6' sx={{ mb: 3 }}>Payroll & Schedule</Typography>
      {[
        { label: 'Pay Schedule', value: company.paySchedule },
        { label: 'Year Type',    value: company.yearType },
      ].map(({ label, value }) => (
        <Box key={label} sx={{ display: 'flex', mb: 2 }}>
          <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 140 }}>{label}:</Typography>
          <Typography sx={{ color: 'text.secondary' }}>{value || '—'}</Typography>
        </Box>
      ))}

      <Divider sx={{ my: 4 }} />

      <Typography variant='h6' sx={{ mb: 3 }}>Working Hours</Typography>
      {company.workingHours && [
        { label: 'Start Time',   value: company.workingHours.startTime },
        { label: 'End Time',     value: company.workingHours.endTime },
        { label: 'Saturday',     value: company.workingHours.saturdayType },
        { label: 'Working Days', value: company.workingHours.workingDays?.join(', ') },
      ].map(({ label, value }) => (
        <Box key={label} sx={{ display: 'flex', mb: 2 }}>
          <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 140 }}>{label}:</Typography>
          <Typography sx={{ color: 'text.secondary' }}>{value || '—'}</Typography>
        </Box>
      ))}

      <Divider sx={{ my: 4 }} />

      <Typography variant='h6' sx={{ mb: 3 }}>Leave Policy</Typography>
      {company.leavePolicy && [
        { label: 'Annual Leave', value: `${company.leavePolicy.annualLeave} days` },
        { label: 'Sick Leave',   value: `${company.leavePolicy.sickLeave} days` },
        { label: 'Casual Leave', value: `${company.leavePolicy.casualLeave} days` },
      ].map(({ label, value }) => (
        <Box key={label} sx={{ display: 'flex', mb: 2 }}>
          <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary', minWidth: 140 }}>{label}:</Typography>
          <Typography sx={{ color: 'text.secondary' }}>{value}</Typography>
        </Box>
      ))}
    </CardContent>
  </Card>
)

// ─── CompanyViewRight ─────────────────────────────────────────────────────────
const CompanyViewRight = ({ tab, company }) => {
  const router = useRouter()
  const { id } = router.query

  const handleTabChange = (_, newTab) => {
    router.push(`/apps/company/${id}/details/${newTab}`, undefined, { shallow: true })
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
      </TabList>

      <TabPanel value='overview' sx={{ p: 0 }}>
        <OverviewTab company={company} />
      </TabPanel>

      <TabPanel value='config' sx={{ p: 0 }}>
        <ConfigTab company={company} />
      </TabPanel>
    </TabContext>
  )
}

export default CompanyViewRight