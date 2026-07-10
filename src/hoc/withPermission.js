// src/hoc/withPermission.js
//
// Higher-Order Component for permission-based page protection
// Wraps pages/components to enforce permission checks
//
// Usage:
//   export default withPermission(PayrollRunPage, ['payroll.run'])

import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { useEffect, Component } from 'react'
import { selectPermissions, selectRoleSlug } from 'src/store/auth/authSlice'
import { canAccessPage, getAccessiblePages } from 'src/config/permissionPageMap'
import { Box, Typography, Button } from '@mui/material'
import Icon from 'src/@core/components/icon'

// ─────────────────────────────────────────────────────────
// Loading Component
// ─────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '400px' 
  }}>
    <Typography>Loading...</Typography>
  </Box>
)

// ─────────────────────────────────────────────────────────
// Access Denied Component
// ─────────────────────────────────────────────────────────
const AccessDenied = ({ requiredPermission, currentPath }) => {
  const router = useRouter()
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '500px',
      gap: 4
    }}>
      <Icon icon='tabler:lock-access-off' fontSize='80px' color='error' />
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant='h4' sx={{ mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          You don't have permission to access this page.
        </Typography>
        {requiredPermission && (
          <Typography variant='caption' color='text.disabled' sx={{ mt: 1, display: 'block' }}>
            Required: {requiredPermission}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant='outlined' 
          onClick={() => router.back()}
          startIcon={<Icon icon='tabler:arrow-left' />}
        >
          Go Back
        </Button>
        <Button 
          variant='contained' 
          onClick={() => router.push('/dashboards/analytics')}
          startIcon={<Icon icon='tabler:home' />}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────
// HOC: withPermission
// ─────────────────────────────────────────────────────────
export const withPermission = (WrappedComponent, requiredPermissions = []) => {
  const PermissionGuard = (props) => {
    const router = useRouter()
    const permissions = useSelector(selectPermissions) || []
    const roleSlug = useSelector(selectRoleSlug)
    const currentPath = router.pathname
    
    // Check if user has ANY of the required permissions
    const hasAllPermissions = requiredPermissions.length === 0 || 
      requiredPermissions.some(perm => permissions.includes(perm))
    
    // Check if user can access this page
    const canAccess = canAccessPage(permissions, currentPath)
    
    // Redirect logic - must be before any early returns
    useEffect(() => {
      if (roleSlug !== 'super_admin' && !hasAllPermissions && !canAccess) {
        // Log permission denial for audit
        console.warn(`[Permission Denied] User attempted to access: ${currentPath}`, {
          required: requiredPermissions,
          actual: permissions
        })
        
        // Redirect to dashboard after 3 seconds
        // const timer = setTimeout(() => {
        //   router.push('/dashboards/analytics')
        // }, 3000)
        
        // return () => clearTimeout(timer)
      }
    }, [hasAllPermissions, canAccess, currentPath, permissions, router, roleSlug])
    
    // Super admin has all access
    if (roleSlug === 'super_admin') {
      return <WrappedComponent {...props} />
    }
    
    // Loading state
    if (permissions.length === 0) {
      return <LoadingScreen />
    }
    
    // Access denied
    if (!hasAllPermissions && !canAccess) {
      return (
        <AccessDenied 
          requiredPermission={requiredPermissions.join(' OR ')}
          currentPath={currentPath}
        />
      )
    }
    
    // Render component with permission props
    return (
      <WrappedComponent 
        {...props} 
        permissions={permissions}
        canCreate={permissions.some(p => p.includes('.create'))}
        canEdit={permissions.some(p => p.includes('.update'))}
        canDelete={permissions.some(p => p.includes('.delete'))}
      />
    )
  }
  
  PermissionGuard.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`
  
  return PermissionGuard
}

// ─────────────────────────────────────────────────────────
// HOC: withRole
// ─────────────────────────────────────────────────────────
export const withRole = (WrappedComponent, allowedRoles = []) => {
  const RoleGuard = (props) => {
    const router = useRouter()
    const roleSlug = useSelector(selectRoleSlug)
    
    const hasRole = allowedRoles.length === 0 || allowedRoles.includes(roleSlug)
    
    useEffect(() => {
      if (!hasRole) {
        console.warn(`[Role Denied] User role: ${roleSlug}, Required: ${allowedRoles.join(' OR ')}`)
        // router.push('/dashboards/analytics')
      }
    }, [hasRole, roleSlug, router])
    
    if (!hasRole) {
      return (
        <AccessDenied 
          requiredPermission={`Role: ${allowedRoles.join(' OR ')}`}
          currentPath={router.pathname}
        />
      )
    }
    
    return <WrappedComponent {...props} />
  }
  
  RoleGuard.displayName = `withRole(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`
  
  return RoleGuard
}

// ─────────────────────────────────────────────────────────
// Component: PermissionGate
// ─────────────────────────────────────────────────────────
export const PermissionGate = ({ 
  children, 
  permissions = [], 
  fallback = null,
  requireAll = false 
}) => {
  const userPermissions = useSelector(selectPermissions) || []
  const roleSlug = useSelector(selectRoleSlug)
  
  // Super admin bypass
  if (roleSlug === 'super_admin') {
    return children
  }
  
  // Check permissions
  const hasPermission = requireAll
    ? permissions.every(perm => userPermissions.includes(perm))
    : permissions.some(perm => userPermissions.includes(perm))
  
  return hasPermission ? children : fallback
}

// ─────────────────────────────────────────────────────────
// Component: RoleGate
// ─────────────────────────────────────────────────────────
export const RoleGate = ({ 
  children, 
  roles = [], 
  fallback = null 
}) => {
  const roleSlug = useSelector(selectRoleSlug)
  
  // Super admin bypass
  if (roleSlug === 'super_admin') {
    return children
  }
  
  const hasRole = roles.includes(roleSlug)
  
  return hasRole ? children : fallback
}

export default withPermission
