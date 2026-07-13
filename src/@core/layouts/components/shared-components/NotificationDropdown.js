// ** React Imports
import { useState, Fragment } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiMenu from '@mui/material/Menu'
import MuiMenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import PerfectScrollbarComponent from 'react-perfect-scrollbar'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Hook Import
import { useRealTimeNotifications } from 'src/hooks/useRealTimeNotifications'

// ** Styled Menu component
const Menu = styled(MuiMenu)(({ theme }) => ({
  '& .MuiMenu-paper': {
    width: 380,
    overflow: 'hidden',
    marginTop: theme.spacing(4.25),
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  '& .MuiMenu-list': {
    padding: 0,
    '& .MuiMenuItem-root': {
      margin: 0,
      borderRadius: 0,
      padding: theme.spacing(4, 6),
      '&:hover': {
        backgroundColor: theme.palette.action.hover
      }
    }
  }
}))

// ** Styled MenuItem component
const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}))

// ** Styled PerfectScrollbar component
const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  maxHeight: 349
})

// ** Styled Avatar component
const Avatar = styled(CustomAvatar)({
  width: 38,
  height: 38,
  fontSize: '1.125rem'
})

// ** Styled component for the title in MenuItems
const MenuItemTitle = styled(Typography)({
  fontWeight: 500,
  flex: '1 1 100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
})

// ** Styled component for the subtitle in MenuItems
const MenuItemSubtitle = styled(Typography)({
  flex: '1 1 100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
})

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <Box sx={{ maxHeight: 349, overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>{children}</PerfectScrollbar>
  }
}

// ** Helper to get notification icon based on type
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
    default: 'tabler:bell'
  }
  return iconMap[type] || iconMap.default
}

// ** Helper to get notification color based on priority
const getNotificationColor = (priority, isRead) => {
  if (isRead) return 'grey'
  const colorMap = {
    HIGH: 'error',
    MEDIUM: 'warning',
    LOW: 'success'
  }
  return colorMap[priority] || 'primary'
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

const NotificationDropdown = props => {
  // ** Props
  const { settings } = props

  // ** States
  const [anchorEl, setAnchorEl] = useState(null)

  // ** Hooks
  const router = useRouter()
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  const { notifications: rawNotifications, unreadCount, loading, markAsRead, markAllAsRead } = useRealTimeNotifications(30000)
  
  // ** Ensure notifications is always an array
  const notifications = Array.isArray(rawNotifications) ? rawNotifications : []

  // ** Vars
  const { direction } = settings

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationClick = notification => {
    if (notification?.actionUrl) {
      router.push(notification.actionUrl)
    }
    if (!notification.isRead) {
      markAsRead(notification._id)
    }
    handleDropdownClose()
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
    handleDropdownClose()
  }

  return (
    <Fragment>
      <IconButton color='inherit' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='customized-menu'>
        <Badge
          color='error'
          badgeContent={unreadCount > 0 ? unreadCount : 0}
          invisible={unreadCount === 0}
          sx={{
            '& .MuiBadge-badge': { top: 4, right: 4, boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}` }
          }}
        >
          <Icon fontSize='1.625rem' icon='tabler:bell' />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <MenuItem
          disableRipple
          disableTouchRipple
          sx={{ cursor: 'default', userSelect: 'auto', backgroundColor: 'transparent !important' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant='h5' sx={{ cursor: 'text' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && <CustomChip skin='light' size='small' color='primary' label={`${unreadCount} New`} />}
          </Box>
        </MenuItem>
        <ScrollWrapper hidden={hidden}>
          {loading === 'LOADING' && notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={32} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Icon icon='tabler:bell-off' fontSize={48} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification, index) => (
              <MenuItem
                key={notification._id || index}
                disableRipple
                disableTouchRipple
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                  opacity: notification.isRead ? 0.7 : 1
                }}
              >
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    skin='light'
                    color={getNotificationColor(notification.priority, notification.isRead)}
                    sx={{ mr: 2.5 }}
                  >
                    <Icon icon={getNotificationIcon(notification.type)} />
                  </Avatar>
                  <Box sx={{ mr: 4, flex: '1 1', display: 'flex', overflow: 'hidden', flexDirection: 'column' }}>
                    <MenuItemTitle>{notification.title}</MenuItemTitle>
                    <MenuItemSubtitle variant='body2'>{notification.message}</MenuItemSubtitle>
                  </Box>
                  <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                    {getRelativeTime(notification.createdAt)}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </ScrollWrapper>
        {notifications.length > 0 && (
          <MenuItem
            disableRipple
            disableTouchRipple
            sx={{
              borderBottom: 0,
              cursor: 'default',
              userSelect: 'auto',
              backgroundColor: 'transparent !important',
              borderTop: theme => `1px solid ${theme.palette.divider}`
            }}
          >
            <Button fullWidth variant='contained' onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
          </MenuItem>
        )}
      </Menu>
    </Fragment>
  )
}

export default NotificationDropdown
