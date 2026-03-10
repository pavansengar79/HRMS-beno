import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch notification
export const fetchNotification = createAsyncThunk('notificationTriggger/fetchNotification', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/getUserGroup?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }&search=${params?.search}`,
    method: 'GET'
  })

  return response
})

export const fetchDealers = createAsyncThunk('notificationTriggger/fetchDealers', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/getAllUsers?search=${params?.search || ''}&id=${params?.id || ''} `,
    method: 'GET'
  })

  return response
})

export const updateNotification = createAsyncThunk('notificationTriggger/updateNotification', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/adminUserRoute/userGroup',
    method: 'PUT',
    data: { groupName: params?.groupName, userList: params?.userList, _id: params?.id }
  })

  return response
})

export const addNotification = createAsyncThunk('notificationTriggger/addNotification', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/adminUserRoute/userGroup',
    method: 'POST',
    data: { groupName: params?.groupName, userList: params?.userList, fromCSV: params?.fromCSV }
  })

  return response
})

export const sendNotification = createAsyncThunk('notificationTriggger/sendNotification', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/adminUserRoute/dealer/push/notification',
    method: 'POST',
    data: params
  })

  return response
})

export const deleteNotification = createAsyncThunk('notificationTriggger/deleteNotification', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/userGroup/${params}`,
    method: 'DELETE'
  })

  return response
})

export const notification = createSlice({
  name: 'notification',
  initialState: {
    notificationLoading: 'NOT_LOADED',
    dealersLoading: 'NOT_LOADED',
    notification: [],
    dealers: [],
    totalData: 0,
    notificationError: null,
    dealersError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchNotification.pending, (state, action) => {
        state.notificationLoading = 'LOADING'
        state.notificationError = null
      })
      .addCase(fetchNotification.fulfilled, (state, action) => {
        state.notificationLoading = 'LOADED'
        state.notification = action?.payload?.data
        state.totalData = action?.payload?.totalData
        state.shouldFetchData = false
      })
      .addCase(fetchNotification.rejected, (state, action) => {
        state.notificationLoading = 'FAILED'
        state.notificationError = action?.payload
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
      })
      .addCase(fetchDealers.pending, (state, action) => {
        state.dealersLoading = 'LOADING'
        state.dealersError = null
      })
      .addCase(fetchDealers.fulfilled, (state, action) => {
        state.dealersLoading = 'LOADED'
        state.dealers = action?.payload?.data.map(user => {
          return { _id: user?._id, user: { Kunnr: user?.Kunnr, Name1: user?.Name1 } }
        })
      })
      .addCase(fetchDealers.rejected, (state, action) => {
        state.dealersLoading = 'FAILED'
        state.dealersError = action?.payload
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
      })

      .addCase(updateNotification.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateNotification.rejected, (state, action) => {
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
      })
      .addCase(sendNotification.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(sendNotification.rejected, (state, action) => {
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
      })
      .addCase(addNotification.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addNotification.rejected, (state, action) => {
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
      })
  }
})

export default notification.reducer
