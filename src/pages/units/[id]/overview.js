// src/pages/units/[id]/overview.js
// Unit overview page — shows summary cards with quick links to HRMS modules

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Icon from 'src/@core/components/icon'
import { selectAllHierarchyUnits, selectAllHierarchyCompanies } from 'src/store/hierarchy/hierarchySlice'
import { selectRoleSlug } from 'src/store/auth/authSlice'

const HRMS_MODULES = [
  { title: 'Departments',  icon: 'mdi:office-building-outline', route: 'department',  color: '#7367f0' },
  { title: 'Designations', icon: 'mdi:briefcase-outline',       route: 'designation', color: '#28c76f' },
  { title: 'Employees',    icon: 'mdi:account-group-outline',   route: 'users',       color: '#00cfe8' },
  { title: 'Attendance',   icon: 'mdi:clock-check-outline',     route: 'attendance',  color: '#ff9f43' },
  { title: 'Leaves',       icon: 'mdi:calendar-account-outline',route: 'leaves',      color: '#ea5455' },
  { title: 'Payroll',      icon: 'mdi:cash-multiple',           route: 'payroll',     color: '#1e9ff2' },
  { title: 'Policies',     icon: 'mdi:shield-outline',          route: 'policy',      color: '#9c27b0' },
  { title: 'Holidays',     icon: 'mdi:calendar-star',           route: 'holidays',    color: '#ff6b6b' },
]

const UnitOverviewPage = () => {
  const router    = useRouter()
  const { id }    = router.query
  const units     = useSelector(selectAllHierarchyUnits)
  const companies = useSelector(selectAllHierarchyCompanies)

  const unit    = units.find(u => u._id === id)
  const company = unit
    ? companies.find(c => c._id === (unit.company_id || unit.company?._id || unit.company))
    : null

  if (!unit) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='h6' color='text.secondary'>Loading unit details...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Unit Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Icon icon='mdi:store-outline' fontSize='1.5rem' />
          <Typography variant='h5' fontWeight={600}>
            {unit.name || unit.unit_name}
          </Typography>
        </Box>
        {company && (
          <Typography variant='body2' color='text.secondary'>
            {company.name || company.company_name} · Unit Overview
          </Typography>
        )}
      </Box>

      {/* HRMS Module Cards */}
      <Typography variant='overline' color='text.disabled' sx={{ mb: 2, display: 'block', letterSpacing: 2 }}>
        HRMS MODULES
      </Typography>
      <Grid container spacing={4}>
        {HRMS_MODULES.map(mod => (
          <Grid item xs={12} sm={6} md={3} key={mod.route}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.2s' }}>
              <CardActionArea
                onClick={() => router.push(`/${mod.route}?unit=${id}`)}
                sx={{ p: 0 }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '20px !important' }}>
                  <Box
                    sx={{
                      width: 48, height: 48, borderRadius: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: mod.color + '18',
                    }}
                  >
                    <Icon icon={mod.icon} fontSize='1.5rem' style={{ color: mod.color }} />
                  </Box>
                  <Box>
                    <Typography variant='body1' fontWeight={600}>{mod.title}</Typography>
                    <Typography variant='caption' color='text.secondary'>Manage {mod.title}</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

UnitOverviewPage.acl = { action: 'read', subject: 'unit-overview' }

export default UnitOverviewPage
