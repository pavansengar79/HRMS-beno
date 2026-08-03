// ** Custom Component Import
import UserNotificationsList from './UserNotificationsList'

// ** MUI Imports
import { Box } from '@mui/material'

const UserViewNotification = ({ employee }) => {
  // Use employee.userId (from User collection) or employee._id (fallback)
  const userId = employee?.userId || employee?._id

  return (
    <Box sx={{ mt: 2 }}>
      <UserNotificationsList userId={userId} />
    </Box>
  )
}

export default UserViewNotification
