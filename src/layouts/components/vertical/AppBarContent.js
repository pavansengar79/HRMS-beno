// src/layouts/components/vertical/AppBarContent.js
// Shows dynamic breadcrumbs: Org > Company > Unit > Module

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'

import Icon from 'src/@core/components/icon'
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import { useAuth } from 'src/hooks/useAuth'
import { selectRoleSlug } from 'src/store/auth/authSlice'
import {
  selectAllHierarchyCompanies,
  selectAllHierarchyUnits,
  selectSelectedCompany,
  selectSelectedUnit,
} from 'src/store/hierarchy/hierarchySlice'

// Map route pathname segments / [module] values to human-readable labels
const ROUTE_LABELS = {
  'dashboards':      'Dashboard',
  'analytics':       'Analytics',
  'company':         'Companies',
  'units':           'Units',
  'lob':             'LOBs',
  'department':      'Departments',
  'designation':     'Designations',
  'users':           'Employees',
  'employees':       'Employees',
  'attendance':      'Attendance',
  'leaves':          'Leaves',
  'payroll':         'Payroll',
  'policy':          'Policies',
  'holidays':        'Holidays',
  'rolesPermission': 'Roles & Permissions',
  'admin-users':     'Admin Users',
  'organisation':    'Organisations',
  'customers':       'Customers',
}

const AppBarContent = props => {
  const { hidden, settings, saveSettings, toggleNavVisibility } = props
  const theme          = useTheme()
  const router         = useRouter()
  const auth           = useAuth()
  const roleSlug       = useSelector(selectRoleSlug)
  const allCompanies   = useSelector(selectAllHierarchyCompanies)
  const allUnits       = useSelector(selectAllHierarchyUnits)
  const selectedCompany = useSelector(selectSelectedCompany)
  const selectedUnit    = useSelector(selectSelectedUnit)

  // Build breadcrumb items from current path + selected context
  const buildBreadcrumbs = () => {
    const crumbs   = []
    const pathname = router.pathname || ''
    const query    = router.query   || {}

    // ── Dynamic hierarchical route: /org/[orgId]/company/[companyId]/unit/[unitId]/[module]
    const isDynamicRoute = !!(query.orgId && query.companyId && query.unitId)

    if (isDynamicRoute) {
      const company = allCompanies.find(c => c._id === query.companyId) || selectedCompany
      const unit    = allUnits.find(u => u._id === query.unitId)        || selectedUnit
      const moduleLabel = ROUTE_LABELS[query.module] || query.module || ''

      if (roleSlug === 'org_admin' || roleSlug === 'org_head') {
        crumbs.push({ label: 'Organisation', href: '/dashboards/analytics', icon: 'mdi:office-building' })
      }

      if (company && (roleSlug === 'org_admin' || roleSlug === 'org_head')) {
        crumbs.push({
          label: company.name || company.company_name || 'Company',
          href:  `/company/${company._id}`,
          icon:  'mdi:domain',
        })
      } else if (company) {
        crumbs.push({
          label: company.name || company.company_name || 'Company',
          href:  `/company`,
          icon:  'mdi:domain',
        })
      }

      if (unit && roleSlug !== 'unit_admin' && roleSlug !== 'hr_manager') {
        crumbs.push({
          label: unit.name || unit.unit_name || 'Unit',
          href:  `/units/${unit._id}/overview`,
          icon:  'mdi:store-outline',
        })
      }

      if (moduleLabel) {
        crumbs.push({ label: moduleLabel, icon: null })
      }

      return crumbs
    }

    // ── Flat / non-hierarchical route ────────────────────────────────────────
    if (roleSlug === 'org_admin' || roleSlug === 'org_head') {
      crumbs.push({ label: 'Organisation', href: '/dashboards/analytics', icon: 'mdi:office-building' })
    }

    if (selectedCompany) {
      crumbs.push({
        label: selectedCompany.name || selectedCompany.company_name || 'Company',
        href:  `/company/${selectedCompany._id}`,
        icon:  'mdi:domain',
      })
    }

    if (selectedUnit) {
      crumbs.push({
        label: selectedUnit.name || selectedUnit.unit_name || 'Unit',
        href:  `/units/${selectedUnit._id}/overview`,
        icon:  'mdi:store-outline',
      })
    }

    // Add current page label from first route segment
    const segments = pathname.replace(/^\//, '').split('/').filter(Boolean)
    if (segments.length > 0) {
      const label = ROUTE_LABELS[segments[0]]
      if (label) crumbs.push({ label, icon: null })
    }

    return crumbs
  }

  const breadcrumbs   = buildBreadcrumbs()
  const showBreadcrumbs = ['org_admin', 'org_head', 'company_admin', 'unit_admin', 'hr_manager'].includes(roleSlug)

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden && !settings.navHidden ? (
          <IconButton color='inherit' sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
            <Icon fontSize='1.5rem' icon='tabler:menu-2' />
          </IconButton>
        ) : null}

        {showBreadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<Icon icon='mdi:chevron-right' fontSize='1rem' />}
            aria-label='breadcrumb'
            sx={{ ml: hidden ? 1 : 0 }}
          >
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1
              if (isLast) {
                return (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {crumb.icon && <Icon icon={crumb.icon} fontSize='0.95rem' />}
                    <Typography
                      variant='body2'
                      sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}
                    >
                      {crumb.label}
                    </Typography>
                  </Box>
                )
              }
              return (
                <Link
                  key={idx}
                  href={crumb.href || '#'}
                  underline='hover'
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    color: 'text.secondary', fontSize: '0.85rem',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {crumb.icon && <Icon icon={crumb.icon} fontSize='0.95rem' />}
                  {crumb.label}
                </Link>
              )
            })}
          </Breadcrumbs>
        )}
      </Box>

      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <ModeToggler settings={settings} saveSettings={saveSettings} />
        {auth.user && <UserDropdown settings={settings} />}
      </Box>
    </Box>
  )
}

export default AppBarContent

