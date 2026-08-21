// ** React Imports
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TableContainer from '@mui/material/TableContainer'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import TablePagination from '@mui/material/TablePagination'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Helper to get notification icon
const getNotificationIcon = type => {
  const iconMap = {
    LEAVE_APPLIED: 'tabler:calendar-plus',
    LEAVE_APPROVED: 'tabler:check',
    LEAVE_REJECTED: 'tabler:x',
    LEAVE_CANCELLED: 'tabler:calendar-cancel',
    PAYSLIP_PUBLISHED: 'tabler:receipt',
    SALARY_UPDATED: 'tabler:currency-rupee',
    REGULARIZATION_APPLIED: 'tabler:clock-plus',
    REGULARIZATION_APPROVED: 'tabler:clock-check',
    REGULARIZATION_REJECTED: 'tabler:clock-x',
    DELEGATION_RECEIVED: 'tabler:user-check',
    DELEGATION_REVOKED: 'tabler:user-minus',
    SHIFT_SWAP_REQUESTED: 'tabler:arrows-exchange',
    SHIFT_SWAP_ACCEPTED: 'tabler:arrows-exchange-2',
    SHIFT_SWAP_REJECTED: 'tabler:x',
    GENERAL: 'tabler:bell',
    default: 'tabler:bell'
  }
  return iconMap[type] || iconMap.default
}

// ** Helper to get notification color
const getNotificationColor = priority => {
  const colorMap = {
    HIGH: 'error',
    MEDIUM: 'warning',
    LOW: 'success'
  }
  return colorMap[priority] || 'primary'
}

// ** Helper to format date
const formatDate = timestamp => {
  const date = new Date(timestamp)
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ** Helper to format relative time
const getRelativeTime = timestamp => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const UserNotificationsList = ({ userId }) => {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axiosRequest({
        url: `/api/v1/notifications/user/${userId}`,
        method: 'GET',
        params: {
          page: page + 1,
          limit: rowsPerPage
        }
      })

      setNotifications(response.data.notifications || [])
      setTotal(response.data.total || 0)
      setUnreadCount(response.data.unreadCount || 0)
    } catch (err) {
      console.error('Failed to fetch user notifications:', err)
      setError(err.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [userId, page, rowsPerPage])

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId, page, rowsPerPage, fetchNotifications])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewNotification = notification => {
    if (notification?.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color='error' align='center'>
            {error}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='User Notifications'
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Total: {total} notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} unread`}
                color='error'
                size='small'
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
        }
      />
      <CardContent>
        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Icon icon='tabler:bell-off' fontSize={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              No notifications found for this user
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '5%' }}>Status</TableCell>
                  <TableCell sx={{ width: '15%' }}>Type</TableCell>
                  <TableCell sx={{ width: '40%' }}>Title & Message</TableCell>
                  <TableCell sx={{ width: '10%' }}>Priority</TableCell>
                  <TableCell sx={{ width: '15%' }}>Date</TableCell>
                  <TableCell sx={{ width: '10%' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.map(notification => (
                  <TableRow
                    key={notification._id}
                    hover
                    sx={{
                      backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                      cursor: notification.actionUrl ? 'pointer' : 'default',
                      opacity: notification.isRead ? 0.7 : 1
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={notification.isRead ? 'Read' : 'Unread'}
                        color={notification.isRead ? 'default' : 'primary'}
                        size='small'
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CustomAvatar
                          skin='light'
                          color={getNotificationColor(notification.priority)}
                          sx={{ width: 32, height: 32 }}
                        >
                          <Icon icon={getNotificationIcon(notification.type)} fontSize='1rem' />
                        </CustomAvatar>
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                          {notification.type?.replace(/_/g, ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: notification.isRead ? 400 : 600,
                            mb: 0.5,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 400
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography
                          variant='caption'
                          sx={{
                            color: 'text.secondary',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {notification.message}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.priority}
                        color={getNotificationColor(notification.priority)}
                        size='small'
                        variant='tonal'
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant='body2' sx={{ fontSize: '0.875rem' }}>
                          {getRelativeTime(notification.createdAt)}
                        </Typography>
                        {notification.isRead && notification.readAt && (
                          <Typography variant='caption' sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
                            Read: {formatDate(notification.readAt)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {notification.actionUrl ? (
                        <Tooltip title={notification.actionLabel || 'View'}>
                          <IconButton
                            size='small'
                            onClick={() => handleViewNotification(notification)}
                            sx={{ color: 'primary.main' }}
                          >
                            <Icon icon='tabler:external-link' fontSize='1.25rem' />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component='div'
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </TableContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default UserNotificationsList
