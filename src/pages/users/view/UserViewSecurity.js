// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

// ** Custom Components
import UserViewSecurityPassword from './UserViewSecurityPassword'
import UserViewSecurityMFA from './UserViewSecurityMFA'

const UserViewSecurity = ({ employee }) => {
  const theme = useTheme()
  
  return (
    <Box sx={{ mt: theme.spacing(2) }}>
      <Card>
        <CardContent>
          {/* Password Change Section */}
          <UserViewSecurityPassword employee={employee} />
          
          {/* MFA Section */}
          <UserViewSecurityMFA employee={employee} />
        </CardContent>
      </Card>
    </Box>
  )
}

export default UserViewSecurity