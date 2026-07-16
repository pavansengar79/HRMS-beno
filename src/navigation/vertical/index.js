// src/navigation/vertical/index.js
//
// ─────────────────────────────────────────────────────────────────────────────
// HRMS Enterprise Sidebar — 3-Level Context-Aware Navigation
// ─────────────────────────────────────────────────────────────────────────────
//
// Route / Breadcrumb architecture:
//   /dashboards/analytics                                  → Org Level
//   /dashboards/analytics/company/[companyId]              → Company Level
//   /dashboards/analytics/company/[companyId]/unit/[unitId]→ Unit Level
//
// Sidebar transforms automatically based on the active URL path params.
// Next.js populates router.query with BOTH path-segment params AND ?query params.
// So router.query.companyId  → from  /company/[companyId]
//    router.query.unitId     → from  /unit/[unitId]
//
// CRITICAL (Vuexy rule):
//   nav items WITH `children`  → rendered as collapsible accordion (no navigation)
//   nav items WITHOUT children → rendered as clickable Link
//   ALL items here MUST be flat (no children)
//
// Section labels used per level:
//   Org    : COMPANIES | ORGANISATION | ADMIN
//   Company: [COMPANY NAME] | STRUCTURE | HRMS | INSIGHTS | ADMINISTRATION | UNITS
//   Unit   : [UNIT NAME]   | WORKFORCE  | COMPLIANCE | INSIGHTS | ADMINISTRATION
// ─────────────────────────────────────────────────────────────────────────────

import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { selectRoleSlug, selectUser, selectOrgId, selectPermissions, selectLevel } from 'src/store/auth/authSlice'
import {
  selectAllHierarchyCompanies,
  selectAllHierarchyUnits,
  selectSelectedCompanyId,
  selectSelectedUnitId,
  fetchHierarchy,
} from 'src/store/hierarchy/hierarchySlice'
import { getAccessiblePages, canAccessPage, getSidebarConfig } from 'src/config/permissionPageMap'

/** Mark every item auth:false so Vuexy ACL gate doesn't block them */
const stamp = items =>
  items.map(item => {
    const out = { ...item, auth: false }
    if (out.children) out.children = stamp(out.children)
    return out
  })

/** Resolve which company a unit belongs to — handles multiple API shapes */
const resolveCompanyId = u =>
  u?.company_id?._id || u?.company_id || u?.company?._id || u?.company || null

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1 — Org Admin Navigation
// Company clicks → /dashboards/analytics/company/[id]  (path-based, not ?query)
// ─────────────────────────────────────────────────────────────────────────────
// Admin roles that can access Access Control
const ADMIN_ROLES = ['org_admin', 'company_admin', 'unit_admin', 'SUPER_ADMIN', 'product_admin']

const buildOrgNav = (companies, permissions = [], roleSlug) => {
  const has = slug => permissions.includes(slug)
  const isAdmin = ADMIN_ROLES.includes(roleSlug)
  
  return stamp([
    { title: 'Dashboard',        icon: 'tabler:layout-dashboard',    path: '/dashboards/analytics' },
    
    // Company page visible only if user has company.read permission
    ...(has('company.read') ? [{ title: 'Companies', icon: 'tabler:building-skyscraper', path: '/company' }] : []),
    
    { sectionTitle: 'COMPANIES' },
    ...(companies.length > 0
      ? companies.map(c => ({
          title: c.name || c.company_name || 'Company',
          icon:  'tabler:building-skyscraper',
          path:  `/dashboards/analytics/company/${c._id}`,
        }))
      : []
    ),
    { sectionTitle: 'INSIGHTS' },
    { title: 'Reports & Analytics', icon: 'tabler:chart-bar',        path: '/charts/recharts' },
    { sectionTitle: 'ADMINISTRATION' },
    // Admin Users - visible if user has user.read permission (admin users management)
    ...(has('user.read') ? [{ title: 'Admin Users', icon: 'tabler:user-shield', path: '/admin-users' }] : []),
    // Access Control - ONLY for admins
    ...(isAdmin ? [{ title: 'Access Control', icon: 'tabler:lock', path: '/admin/access-control' }] : []),
    // Essentials - ONLY for org_admin (organization-wide PAN, timezone, currency)
    ...(roleSlug === 'org_admin' ? [{ title: 'Essentials', icon: 'tabler:settings-2', path: '/admin/system-config/essentials' }] : []),
    { title: 'General Features', icon: 'tabler:adjustments',         path: '/admin/general-features' },
  ])
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2 — Company Navigation
// showBack = true  → org_admin / org_head  (back goes to /dashboards/analytics)
// showBack = false → company_admin (their single-company scope, no org view)
//
// Section labels: no ORGANISATION — uses STRUCTURE / HRMS / INSIGHTS / ADMINISTRATION
// ─────────────────────────────────────────────────────────────────────────────
const buildCompanyNav = (company, units, orgId, showBack = true, roleSlug) => {
  const companyId   = company?._id
  const companyName = company?.name || company?.company_name || '…'
  const isAdmin = ADMIN_ROLES.includes(roleSlug)

  const unitLinks = units.map(u => ({
    title:        u.name || u.unit_name || 'Unit',
    icon:         'tabler:building-community',
    path:         `/dashboards/analytics/company/${companyId}/unit/${u._id}`,
    badgeContent: 'NEW',
    badgeColor:   'error',
  }))

  return stamp([
    // ── Back / Entry ───────────────────────────────────────────────────────
    ...(showBack
      ? [{
          title: 'All Companies',
          icon:  'tabler:chevron-left',
          path:  '/dashboards/analytics',
        }]
      : []
    ),

    // ── Company overview ──────────────────────────────────────────────────
    { sectionTitle: companyName.toUpperCase() },
    { title: 'Dashboard',          icon: 'tabler:layout-dashboard',
      path: `/dashboards/analytics/company/${companyId}` },

    // ── UNITS — select a unit to drill in ────────────────────────────────
    ...(unitLinks.length > 0
      ? [{ sectionTitle: 'UNITS' }, ...unitLinks]
      : []
    ),

    // ── STRUCTURE ────────────────────────────────────────────────────────
    { sectionTitle: 'STRUCTURE' },
    { title: 'Business Units',     icon: 'tabler:building-community',
      path: `/units?company=${companyId}` },
    { title: 'Sites & Locations',  icon: 'tabler:map-pin',
      path: `/sites?company=${companyId}` },


    // ── INSIGHTS ──────────────────────────────────────────────────────────
    { sectionTitle: 'INSIGHTS' },
    { title: 'Reports & Analytics',icon: 'tabler:chart-bar', path: '/charts/recharts' },

    // ── ADMINISTRATION ────────────────────────────────────────────────────
    { sectionTitle: 'ADMINISTRATION' },
    { title: 'Admin Users',        icon: 'tabler:user-shield',
      path: `/admin-users?company=${companyId}` },
    // Access Control - ONLY for admins
    ...(isAdmin ? [{ title: 'Access Control', icon: 'tabler:lock', path: '/admin/access-control' }] : []),
    // System Config - ONLY for company_admin (company-specific settings)
    ...(roleSlug === 'company_admin' ? [{ title: 'System Config', icon: 'tabler:settings', path: '/admin/system-config' }] : []),
    { title: 'General Features',   icon: 'tabler:adjustments',  path: '/admin/general-features' },
  ])
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 3 — Unit Navigation
// showBack = true  → org_admin / company_admin (back → company dashboard)
// showBack = false → unit_admin (no company-level access)
//
// NO Organisation section. Departments + Designations in WORKFORCE section.
// ─────────────────────────────────────────────────────────────────────────────
const buildUnitNav = (unit, company, orgId, showBack = true, permissions = [], roleSlug) => {
  const unitId      = unit?._id
  const companyId   = company?._id
  const unitName    = unit?.name || unit?.unit_name || '…'
  const companyName = company?.name || company?.company_name || 'Company'
  const isAdmin = ADMIN_ROLES.includes(roleSlug)

  // Permission helper
  const has = slug => permissions.includes(slug)

  // Module path builder — uses hierarchical /org/cid/unit/uid/mod when all IDs known
  const p = mod =>
    orgId && companyId && unitId
      ? `/org/${orgId}/company/${companyId}/unit/${unitId}/${mod}`
      : `/${mod}${unitId ? `?unit=${unitId}` : ''}`

  const backPath = companyId
    ? `/dashboards/analytics/company/${companyId}`
    : '/dashboards/analytics'

  return stamp([
    // ── Back / Entry ───────────────────────────────────────────────────────
    ...(showBack
      ? [{
          title: `‹ ${companyName}`,
          icon:  'tabler:chevron-left',
          path:  backPath,
        }]
      : []
    ),

    // ── Unit overview ─────────────────────────────────────────────────────
    { sectionTitle: unitName.toUpperCase() },
    { title: 'Dashboard',
      icon:  'tabler:layout-dashboard',
      path:  companyId && unitId
              ? `/dashboards/analytics/company/${companyId}/unit/${unitId}`
              : '/dashboards/analytics' },

    // ── HRMS ─────────────────────────────────────────────────────────────
    { sectionTitle: 'HRMS' },
    ...(has('employee.read') ? [{ title: 'Employees', icon: 'tabler:users', path: p('users') }] : []),
    ...(has('department.read') ? [{ title: 'Departments', icon: 'tabler:building', path: p('department') }] : []),
    ...(has('designation.read') ? [{ title: 'Designations', icon: 'tabler:briefcase', path: p('designation') }] : []),
    // Note: Business Units accessible at company level, not unit level

    // ── COMPLIANCE ────────────────────────────────────────────────────────
    ...(has('leavePolicy.read') || has('attendancePolicy.read') || has('payrollPolicy.read') || has('holiday.read')
      ? [
          { sectionTitle: 'COMPLIANCE' },
          { title: 'Policies', icon: 'tabler:shield-check', path: p('policy') }
        ]
      : []),

    // ── INSIGHTS ──────────────────────────────────────────────────────────
    { sectionTitle: 'INSIGHTS' },
    { title: 'Reports & Analytics',icon: 'tabler:chart-bar',        path: '/charts/recharts' },

    // ── ADMINISTRATION ────────────────────────────────────────────────────
    { sectionTitle: 'ADMINISTRATION' },
    // Access Control - ONLY for admins
    ...(isAdmin ? [{ title: 'Access Control', icon: 'tabler:lock', path: '/admin/access-control' }] : []),
    { title: 'Admin Users',        icon: 'tabler:user-shield',      path: '/admin-users' },
  ])
}

// ── Enterprise permission-based navigation builder ─────────────────────────
const buildDynamicNav = (roleSlug, user, units, permissions = []) => {
  const unit     = user?.unit_id ? units.find(u => u._id === user.unit_id) : null
  const unitName = (unit?.name || unit?.unit_name || 'My Unit').toUpperCase()
  const isAdmin = ADMIN_ROLES.includes(roleSlug)
  
  // Permission helper
  const has = slug => permissions.includes(slug)
  
  return stamp([
    { title: 'Dashboard',          icon: 'tabler:layout-dashboard', path: '/dashboards/analytics' },
    { sectionTitle: unitName },

    { sectionTitle: 'HRMS' },
    ...(has('employee.read') ? [{ title: 'Employees', icon: 'tabler:users', path: '/users' }] : []),
    ...(has('department.read') ? [{ title: 'Departments', icon: 'tabler:building', path: '/department' }] : []),
    ...(has('designation.read') ? [{ title: 'Designations', icon: 'tabler:briefcase', path: '/designation' }] : []),
    ...(has('attendance.read') ? [{ title: 'Attendance', icon: 'tabler:clock-check', path: '/attendance', badgeContent: 'Live', badgeColor: 'success' }] : []),
    ...(has('leave.read') ? [{ title: 'Leaves', icon: 'tabler:calendar-user', path: '/leaves', badgeContent: 'New', badgeColor: 'error' }] : []),
    ...(has('payroll.read') ? [{ title: 'Payroll', icon: 'tabler:cash', path: '/payroll', badgeContent: 'Run', badgeColor: 'warning' }] : []),
    ...(has('holiday.read') ? [{ title: 'Holidays', icon: 'tabler:calendar-event', path: '/holidays' }] : []),
    ...(has('shift.read') ? [{ title: 'Shifts', icon: 'tabler:clock', path: '/shift' }] : []),

    // Policies - only show if user has any policy permission
    ...(has('leavePolicy.read') || has('attendancePolicy.read') || has('payrollPolicy.read') || has('holiday.read')
      ? [
          { sectionTitle: 'COMPLIANCE' },
          { title: 'Policies', icon: 'tabler:shield-check', path: '/policy' }
        ]
      : []),

    { sectionTitle: 'INSIGHTS' },
    { title: 'Reports & Analytics',icon: 'tabler:chart-bar',        path: '/charts/recharts' },

    { sectionTitle: 'ADMINISTRATION' },
    // Access Control - ONLY for admins
    ...(isAdmin ? [{ title: 'Access Control', icon: 'tabler:lock', path: '/admin/access-control' }] : []),
    { title: 'Admin Users',        icon: 'tabler:user-shield',      path: '/admin-users' },
  ])
}

// ─────────────────────────────────────────────────────────────────────────────
// Static navs — Super Admin & Employee
// ─────────────────────────────────────────────────────────────────────────────
const SUPER_ADMIN_NAV = stamp([
  { title: 'Platform Overview',   icon: 'tabler:layout-dashboard',    path: '/dashboards/analytics' },
  { sectionTitle: 'PLATFORM' },
  { title: 'Organisations',       icon: 'tabler:building-skyscraper', path: '/organisation' },
  { title: 'Customers',           icon: 'tabler:users-group',         path: '/customers' },
  { title: 'Plans & Billing',     icon: 'tabler:credit-card',         path: '/pages/plan' },
  { sectionTitle: 'ADMINISTRATION' },
  { title: 'Access Control',      icon: 'tabler:lock',                path: '/admin/access-control' },
])

const EMPLOYEE_NAV = stamp([
  { title: 'My Dashboard',        icon: 'tabler:layout-dashboard',    path: '/dashboards/analytics' },
  { sectionTitle: 'MY WORKSPACE' },
  { title: 'My Attendance',       icon: 'tabler:clock',               path: '/attendance/my' },
  { title: 'Leave Requests',      icon: 'tabler:calendar-check',      path: '/leaves' },
  { title: 'My Payslips',         icon: 'tabler:file-invoice',        path: '/payroll/my' },
  { title: 'My Schedule',         icon: 'tabler:calendar',            path: '/calendar' },
  { sectionTitle: 'TAX PLANNING' },
  { title: 'Investment Declaration', icon: 'tabler:piggy-bank',       path: '/payroll/investment-declarations' },
  { sectionTitle: 'INFORMATION' },
  { title: 'Company Policies',    icon: 'tabler:shield-check',        path: '/policy' },
  { title: 'Holidays',            icon: 'tabler:calendar-event',      path: '/holidays' },
])

const MANAGER_NAV = stamp([
  { title: 'Dashboard',           icon: 'tabler:layout-dashboard',    path: '/dashboards/analytics' },
  { sectionTitle: 'MY TEAM' },
  { title: 'Team Attendance',  icon: 'tabler:clock-check', path: '/attendance/team' },
  { title: 'Leave Approvals',  icon: 'tabler:calendar-user', path: '/leaves' },
  { title: 'Delegation',          icon: 'tabler:users-plus',          path: '/delegation' },
  { sectionTitle: 'MY WORKSPACE' },
  { title: 'My Attendance',       icon: 'tabler:clock',               path: '/attendance/my' },
  { title: 'My Leaves',           icon: 'tabler:calendar-check',      path: '/leaves' },
  { title: 'My Payslips',         icon: 'tabler:file-invoice',        path: '/payroll/my' },
  { title: 'Investment Declaration', icon: 'tabler:piggy-bank',       path: '/payroll/investment-declarations' },
  { sectionTitle: 'INFORMATION' },
  { title: 'Company Policies',    icon: 'tabler:shield-check',        path: '/policy' },
])

// ─────────────────────────────────────────────────────────────────────────────
// Main hook — VerticalNavItems
// ─────────────────────────────────────────────────────────────────────────────
const VerticalNavItems = () => {
  const router     = useRouter()
  const dispatch   = useDispatch()
  const roleSlug   = useSelector(selectRoleSlug)
  const level      = useSelector(selectLevel)
  const user       = useSelector(selectUser)
  const orgId      = useSelector(selectOrgId)
  const permissions = useSelector(selectPermissions) || []
  const companies  = useSelector(selectAllHierarchyCompanies)
  const units      = useSelector(selectAllHierarchyUnits)
  const reduxCompanyId = useSelector(selectSelectedCompanyId)
  const reduxUnitId    = useSelector(selectSelectedUnitId)

  // Permission helper
  const hasPermission = slug => permissions.includes(slug) || roleSlug === 'super_admin'

  // Fetch hierarchy data once per role
  // ONLY org_admin and company_admin can call companies/units APIs
  // unit_admin, hr_manager, manager, employee do NOT have access to these APIs
  useEffect(() => {
    const hierarchyRoles = [
      'org_admin', 'org_head',
      'company_admin', 'company_hr_manager',
    ]
    if (roleSlug && hierarchyRoles.includes(roleSlug)) {
      dispatch(fetchHierarchy())
    }
  }, [roleSlug, dispatch])

  // ── Context detection ────────────────────────────────────────────────────
  //
  // router.query holds BOTH Next.js path segments AND ?querystring params.
  //   /dashboards/analytics/company/[companyId]/unit/[unitId]
  //   → router.query = { companyId: '...', unitId: '...' }
  //
  //   /leaves?company=xxx
  //   → router.query = { company: 'xxx' }
  //
  // Priority: path-param > company-detail-route > query-param > redux-sticky
  const {
    id:        routeId,         // /company/[id]/details/...
    companyId: pathCompanyId,   // /dashboards/analytics/company/[companyId]
    unitId:    pathUnitId,      // /dashboards/analytics/company/[cid]/unit/[unitId]
    company:   qCompany,        // ?company=xxx
    unit:      qUnit,           // ?unit=xxx
  } = router.query || {}

  const isCompanyDetailRoute = router.pathname?.startsWith('/company/[id]')

  const activeCompanyId =
    pathCompanyId                                      ||
    (isCompanyDetailRoute ? routeId : undefined)       ||
    qCompany                                           ||
    reduxCompanyId                                     ||
    null

  const activeUnitId =
    pathUnitId  ||
    qUnit       ||
    reduxUnitId ||
    null

  // For company_admin — their own company from JWT or inferred from units
  const myCompanyId =
    user?.company_id   ||
    user?.company?._id ||
    (units.length > 0 ? resolveCompanyId(units[0]) : null)

  // ── Role routing ─────────────────────────────────────────────────────────

  switch (roleSlug) {

    case 'super_admin':
      return SUPER_ADMIN_NAV

    case 'employee':
      return EMPLOYEE_NAV

    case 'manager':
      return MANAGER_NAV

    case 'unit_admin':
    case 'hr_manager':
      return buildDynamicNav(roleSlug, user, units, permissions)

    // ── Org Admin — full 3-level drill-down ──────────────────────────────
    case 'org_admin':
    case 'org_head':
    case 'org_auditor': {
      // Level 3: unit selected
      if (activeUnitId) {
        const unit    = units.find(u => u._id === activeUnitId)
        const cId     = activeCompanyId || (unit ? resolveCompanyId(unit) : null)
        const company = cId ? companies.find(c => c._id === cId) : null
        return buildUnitNav(
          unit    || { _id: activeUnitId, name: '…' },
          company || { _id: cId || '',    name: '…' },
          orgId,
          true,   // back → company dashboard
          permissions,
          roleSlug
        )
      }
      // Level 2: company selected
      if (activeCompanyId) {
        const company      = companies.find(c => c._id === activeCompanyId)
        const companyUnits = units.filter(u => resolveCompanyId(u) === activeCompanyId)
        return buildCompanyNav(
          company || { _id: activeCompanyId, name: '…' },
          companyUnits,
          orgId,
          true,   // back → /dashboards/analytics (org view)
          roleSlug
        )
      }
      // Level 1: org overview
        return buildOrgNav(companies, permissions, roleSlug)
    }

    // ── Company Admin — starts at Level 2, can drill to Level 3 ─────────
    case 'company_admin':
    case 'company_hr_manager': {
      // Level 3: unit selected
      if (activeUnitId) {
        const unit    = units.find(u => u._id === activeUnitId)
        const cId     = activeCompanyId || myCompanyId || (unit ? resolveCompanyId(unit) : null)
        const company = cId ? companies.find(c => c._id === cId) : null
        return buildUnitNav(
          unit    || { _id: activeUnitId, name: '…' },
          company || { _id: cId || '',    name: '…' },
          orgId,
          true,   // back → company dashboard
          permissions,
          roleSlug
        )
      }
      // Level 2: company overview (no back — company_admin owns one company)
      const cId          = activeCompanyId || myCompanyId
      const company      = companies.find(c => c._id === cId)
      const companyUnits = units.filter(u => resolveCompanyId(u) === cId)
      return buildCompanyNav(
        company || { _id: cId },
        companyUnits,
        orgId,
        false,   // no "← All Companies" for company_admin
        roleSlug
      )
    }

    default: {
      // Dynamic level-based routing for custom roles
      
      // Check user permissions and build dynamic sidebar
      if (permissions.length > 0) {
        return buildDynamicNav(roleSlug, user, units, permissions)
      }
      
      // Fallback based on level
      switch (level) {
        case 'org':
          return buildOrgNav(companies, permissions, roleSlug)
        case 'company': {
          const cId = activeCompanyId || myCompanyId
          const company = companies.find(c => c._id === cId)
          const companyUnits = units.filter(u => resolveCompanyId(u) === cId)
          return buildCompanyNav(
            company || { _id: cId },
            companyUnits,
            orgId,
            false,
            roleSlug
          )
        }
        case 'unit':
          return buildDynamicNav(roleSlug, user, units, permissions)
        default:
          return stamp([{ title: 'Dashboard', icon: 'tabler:layout-dashboard', path: '/dashboards/analytics' }])
      }
    }
  }
}

export default VerticalNavItems
