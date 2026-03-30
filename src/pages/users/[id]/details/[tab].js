// src/pages/users/[id]/details/[[...tab]].jsx

// ** React Imports
import { useEffect } from 'react'
import { useRouter } from 'next/router'

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

const UserDetails = () => {
  const router   = useRouter()
  const dispatch = useDispatch()

  const { id, tab } = router.query
  const activeTab   = Array.isArray(tab) ? tab[0] : (tab || 'account')

  const employee = useSelector(selectSelectedEmployee)
  const loading  = useSelector(selectEmployeeDetailLoading)

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
        
        <UserViewLeft employee={employee} />
        
      </Grid>
      <Grid item xs={12} md={7} lg={8}>
        <UserViewRight tab={activeTab} employee={employee} />

      </Grid>
    </Grid>
  )
}

export default UserDetails