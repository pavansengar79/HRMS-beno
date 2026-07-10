// src/pages/enterprise-demo.js
//
// Enterprise Permission System Demo Page
// Shows all components of enterprise architecture
//

import { useSelector } from 'react-redux'
import { selectPermissions, selectRoleSlug, selectUser } from 'src/store/auth/authSlice'
import { PermissionButton } from 'src/components/PermissionButton'
import { PermissionGate, RoleGate } from 'src/hoc/withPermission'
import { getAccessiblePages, canPerformAction, getPageButtons } from 'src/config/permissionPageMap'
import { Box, Card, CardHeader, CardContent, Typography, Grid, Chip, Divider } from '@mui/material'
import Icon from 'src/@core/components/icon'

const EnterpriseDemoPage = () => {
  const permissions = useSelector(selectPermissions) || []
  const roleSlug = useSelector(selectRoleSlug)
  const user = useSelector(selectUser)
  
  // Get accessible pages
  const accessiblePages = getAccessiblePages(permissions)
  
  // Get available actions
  const canRunPayroll = canPerformAction(permissions, 'execute_payroll')
  const canApproveLeave = canPerformAction(permissions, 'approve_leave')
  
  // Get buttons for current page
  const currentPageButtons = getPageButtons(permissions, '/payroll/run')
  
  return (
    <Grid container spacing={6} sx={{ p: 4 }}>
      {/* Header */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Enterprise Permission Architecture Demo'
            subheader='100% Permission-Based Access Control'
          />
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Current User Context
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              <Chip label={`Role: ${roleSlug}`} color='primary' />
              <Chip label={`Email: ${user?.email}`} variant='outlined' />
              <Chip label={`Permissions: ${permissions.length}`} color='secondary' />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      {/* 1. Permission Gates */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader 
            title='1. Permission Gates'
            subheader='Conditionally render content based on permissions'
          />
          <CardContent>
            <Typography variant='subtitle2' gutterBottom>
              Example: Show content only if user has payroll.run
            </Typography>
            
            <PermissionGate 
              permissions={['payroll.run']} 
              fallback={
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography>🔒 Access restricted to payroll.run</Typography>
                </Box>
              }
            >
              <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, color: 'success.contrastText' }}>
                <Typography>✅ Payroll Run Section Visible!</Typography>
              </Box>
            </PermissionGate>
          </CardContent>
        </Card>
      </Grid>
      
      {/* 2. Permission Buttons */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader 
            title='2. Permission Buttons'
            subheader='Buttons automatically hide based on permissions'
          />
          <CardContent>
            <Typography variant='subtitle2' gutterBottom>
              Example: CRUD buttons conditionally visible
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <PermissionButton 
                permission='employee.create'
                color='primary'
                startIcon={<Icon icon='tabler:plus' />}
              >
                Add Employee
              </PermissionButton>
              
              <PermissionButton 
                permission='payroll.run'
                color='warning'
                startIcon={<Icon icon='tabler:player-play' />}
              >
                Run Payroll
              </PermissionButton>
              
              <PermissionButton 
                permission='leave.approve'
                color='success'
                startIcon={<Icon icon='tabler:check' />}
              >
                Approve Leave
              </PermissionButton>
              
              <PermissionButton 
                permission='shift.delete'
                color='error'
                startIcon={<Icon icon='tabler:trash' />}
              >
                Delete Shift
              </PermissionButton>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      {/* 3. Role Gates */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader 
            title='3. Role Gates'
            subheader='Content visible only to specific roles'
          />
          <CardContent>
            <Typography variant='subtitle2' gutterBottom>
              Example: Admin-only content
            </Typography>
            
            <RoleGate 
              roles={['org_admin', 'company_admin', 'unit_admin']} 
              fallback={
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography>🔒 Admin only section</Typography>
                </Box>
              }
            >
              <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
                <Typography>👑 Admin Section Visible!</Typography>
              </Box>
            </RoleGate>
          </CardContent>
        </Card>
      </Grid>
      
      {/* 4. Accessible Pages */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader 
            title='4. Accessible Pages'
            subheader={`Automatically computed from ${permissions.length} permissions`}
          />
          <CardContent>
            <Typography variant='subtitle2' gutterBottom>
              Total: {accessiblePages.length} pages accessible
            </Typography>
            
            <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
              {accessiblePages.map((page, i) => (
                <Chip 
                  key={i}
                  label={page}
                  size='small'
                  variant='outlined'
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      {/* 5. Action Permissions */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='5. Action-Based Permissions'
            subheader='Check if user can perform specific actions'
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item>
                <Chip 
                  icon={<Icon icon={canRunPayroll ? 'tabler:check' : 'tabler:x'} />}
                  label={`Run Payroll: ${canRunPayroll ? 'YES' : 'NO'}`}
                  color={canRunPayroll ? 'success' : 'default'}
                />
              </Grid>
              
              <Grid item>
                <Chip 
                  icon={<Icon icon={canApproveLeave ? 'tabler:check' : 'tabler:x'} />}
                  label={`Approve Leave: ${canApproveLeave ? 'YES' : 'NO'}`}
                  color={canApproveLeave ? 'success' : 'default'}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      
      {/* 6. Full Permission List */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='6. Complete Permission List'
            subheader='All permissions currently assigned to user'
          />
          <CardContent>
            <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {permissions.map((perm, i) => (
                <Chip 
                  key={i}
                  label={perm}
                  size='small'
                  color={'primary'}
                  variant='outlined'
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default EnterpriseDemoPage
