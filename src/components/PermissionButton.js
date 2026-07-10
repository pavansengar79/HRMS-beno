// src/components/PermissionButton.js
//
// Permission-based button rendering component
// Automatically hides buttons based on user permissions
//
// Usage:
// <PermissionButton permission='payroll.run' onClick={handleRun}>
//   Run Payroll
// </PermissionButton>

import { useSelector } from 'react-redux'
import { selectPermissions, selectRoleSlug } from 'src/store/auth/authSlice'
import { Button } from '@mui/material'

export const PermissionButton = ({ 
  permission, 
  permissions = [], 
  requireAll = false,
  children, 
  onClick,
  color = 'primary',
  variant = 'contained',
  size = 'medium',
  disabled = false,
  startIcon,
  endIcon,
  ...props 
}) => {
  const userPermissions = useSelector(selectPermissions) || []
  const roleSlug = useSelector(selectRoleSlug)
  
  // Super admin bypass
  if (roleSlug === 'super_admin') {
    return (
      <Button 
        color={color}
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled}
        startIcon={startIcon}
        endIcon={endIcon}
        {...props}
      >
        {children}
      </Button>
    )
  }
  
  // Build permission list
  const permList = permission ? [permission] : permissions
  
  // Check permissions
  const hasPermission = permList.length === 0 || 
    (requireAll 
      ? permList.every(perm => userPermissions.includes(perm))
      : permList.some(perm => userPermissions.includes(perm))
    )
  
  // Don't render if no permission
  if (!hasPermission) {
    return null
  }
  
  return (
    <Button 
      color={color}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      {...props}
    >
      {children}
    </Button>
  )
}

export default PermissionButton
