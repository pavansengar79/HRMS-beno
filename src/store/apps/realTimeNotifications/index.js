import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch real-time notifications
export const fetchRealTimeNotifications = createAsyncThunk(
  'realTimeNotifications/fetchRealTimeNotifications',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosRequest({
        url: '/api/v1/notifications',
        method: 'GET',
        params: { limit: params?.limit || 10, page: 1 }
      })

      // Backend returns: { success: true, data: { notifications: [], unreadCount: N, ... } }
      return response.data.notifications || []
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message)
    }
  }
)

// ** Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'realTimeNotifications/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await axiosRequest({
        url: `/api/v1/notifications/${notificationId}/read`,
        method: 'PATCH'
      })

      return { notificationId, ...response }
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message)
    }
  }
)

// ** Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  'realTimeNotifications/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosRequest({
        url: '/api/v1/notifications/read-all',
        method: 'PATCH'
      })

      return response
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message)
    }
  }
)

// ** Get unread count
export const fetchUnreadCount = createAsyncThunk(
  'realTimeNotifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosRequest({
        url: '/api/v1/notifications',
        method: 'GET',
        params: { limit: 1, page: 1 } // Just get minimal data to get unreadCount
      })

      // Backend returns: { success: true, data: { notifications: [], unreadCount: N, ... } }
      return response.data.unreadCount || 0
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message)
    }
  }
)

const realTimeNotificationsSlice = createSlice({
  name: 'realTimeNotifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: 'NOT_LOADED',
    error: null
  },
  reducers: {
    clearNotifications: state => {
      state.notifications = []
      state.unreadCount = 0
    }
  },
  extraReducers: builder => {
    builder
      // Fetch notifications
      .addCase(fetchRealTimeNotifications.pending, state => {
        state.loading = 'LOADING'
        state.error = null
      })
      .addCase(fetchRealTimeNotifications.fulfilled, (state, action) => {
        state.loading = 'LOADED'
        // Payload is already the notifications array
        state.notifications = action.payload || []
      })
      .addCase(fetchRealTimeNotifications.rejected, (state, action) => {
        state.loading = 'FAILED'
        state.error = action.payload
      })
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload?.notificationId
        const index = state.notifications.findIndex(n => n._id === notificationId)
        if (index !== -1) {
          state.notifications[index].isRead = true
        }
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      })
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, state => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }))
        state.unreadCount = 0
      })
      // Unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload || 0 // Payload is already the number
      })
  }
})

export const { clearNotifications } = realTimeNotificationsSlice.actions
export default realTimeNotificationsSlice.reducer
