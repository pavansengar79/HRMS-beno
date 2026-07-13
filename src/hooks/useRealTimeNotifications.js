import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchRealTimeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  fetchUnreadCount,
  clearNotifications
} from 'src/store/apps/realTimeNotifications'

export const useRealTimeNotifications = (pollingInterval = 30000) => {
  const dispatch = useDispatch()
  const { notifications, unreadCount, loading, error } = useSelector(state => state.realTimeNotifications)

  // ** Debug: Log notification state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔔 Notifications State:', { notifications, unreadCount, loading, error })
    }
  }, [notifications, unreadCount, loading, error])

  // ** Fetch notifications on mount and setup polling
  useEffect(() => {
    // Initial fetch
    dispatch(fetchRealTimeNotifications({ limit: 10 }))
    dispatch(fetchUnreadCount())

    // Setup polling for real-time updates
    const interval = setInterval(() => {
      dispatch(fetchRealTimeNotifications({ limit: 10 }))
      dispatch(fetchUnreadCount())
    }, pollingInterval)

    // Cleanup on unmount
    return () => {
      clearInterval(interval)
      dispatch(clearNotifications())
    }
  }, [dispatch, pollingInterval])

  // ** Mark single notification as read
  const handleMarkAsRead = useCallback(
    notificationId => {
      dispatch(markNotificationAsRead(notificationId))
    },
    [dispatch]
  )

  // ** Mark all notifications as read
  const handleMarkAllAsRead = useCallback(() => {
    dispatch(markAllNotificationsAsRead())
  }, [dispatch])

  // ** Manually refresh notifications
  const refreshNotifications = useCallback(() => {
    dispatch(fetchRealTimeNotifications({ limit: 10 }))
    dispatch(fetchUnreadCount())
  }, [dispatch])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refreshNotifications
  }
}
