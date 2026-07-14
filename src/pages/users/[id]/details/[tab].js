// src/pages/users/[id]/details/[[...tab]].jsx

// ** React Imports
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

// ** Redux
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchEmployeeById,
  clearSelectedEmployee,
  selectSelectedEmployee,
  selectEmployeeDetailLoading,
} from 'src/store/employee/employeeSlice'

// ** View Components
import UserViewLeft from '../../view/UserViewLeft'
import UserViewRight from '../../view/UserViewRight'
import { selectPermissions, selectRoleSlug, selectUser } from 'src/store/auth/authSlice'

const UserDetails = () => {
  const router   = useRouter()
  const dispatch = useDispatch()

  const { id, tab } = router.query
  const activeTab   = Array.isArray(tab) ? tab[0] : (tab || 'account')

  const employee = useSelector(selectSelectedEmployee)
  const loading  = useSelector(selectEmployeeDetailLoading)
  const current_user = useSelector(selectUser)
  const permissions = useSelector(selectPermissions)
  const userRole    = useSelector(selectRoleSlug) ?? ''
  
  console.log('Current user:', current_user.id)
  
  const canManageEmployees = permissions.includes('employee.create') || permissions.includes('employee.update')
  
  // ── Self-access check ──────────────────────────────────────────────────────
  // All users can view and update their own profile WITHOUT employee.update permission
  // Unit Admin, HR Manager, Manager can view/edit anyone
  const isOwnProfile = current_user?._id === id || current_user?.id === id
  const canViewOthers = ['unit_admin', 'hr_manager', 'manager'].includes(userRole)
  
  // Redirect if not authorized (employee viewing someone else)
  useEffect(() => {
    if (!isOwnProfile && !canViewOthers && !canManageEmployees) {
      toast.error('You can only view your own profile')
      router.push('/dashboards/analytics')
    }
  }, [isOwnProfile, canViewOthers, canManageEmployees, router])
  
  // ── Permission Logic ────────────────────────────────────────────────────────
  // Can edit if: own profile OR has employee management permissions OR is admin
  const isPermitted = isOwnProfile || canManageEmployees || canViewOthers

  useEffect(() => {
    if (id) {
      dispatch(fetchEmployeeById(id))
    }

    return () => {
      dispatch(clearSelectedEmployee())
    }
  }, [id, dispatch])

  if (loading || !employee) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, flexDirection: 'column', gap: 3 }}>
        <CircularProgress />
        <Typography sx={{ color: 'text.secondary' }}>Loading employee details…</Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={5} lg={4}>
        {/* {current_user?.id}
        <br/>
        {id} */}
        <UserViewLeft employee={employee}  role={userRole} isPermitted={ isPermitted} />
      </Grid>
      <Grid item xs={12} md={7} lg={8}>
        <UserViewRight tab={activeTab} employee={employee}  isPermitted={ isPermitted}/>
      </Grid>
    </Grid>
  )
}

export default UserDetails