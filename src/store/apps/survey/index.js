import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch notification
export const fetchNotification = createAsyncThunk('survey/fetchNotification', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/getSurvey?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }&search=${params?.search}`,
    method: 'GET'
  })

  return response
})

export const fetchDealers = createAsyncThunk('survey/fetchDealers', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/getUserGroup`,
    method: 'GET'
  })

  return response
})

export const updateNotification = createAsyncThunk('survey/updateNotification', async params => {
  console.log('params', params)
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/survey/${params?.id}`,
    method: 'PUT',
    data: params?.data
  })

  return response
})

export const addNotification = createAsyncThunk('survey/addNotification', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/adminUserRoute/survey',
    method: 'POST',
    data: params
  })

  return response
})

export const sendNotification = createAsyncThunk('survey/sendNotification', async params => {
  // try {
  //   const response = await axiosRequest({
  //     url: '/api/admindash/adminUserRoute/userGroup',
  //     method: 'POST',
  //     data: { groupId: params }
  //   })
  //   return response
  // } catch (error) {
  //   console.log('Error is ===>', error)
  // }
})

export const deleteNotification = createAsyncThunk('survey/deleteNotification', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/survey/${params}`,
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
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(fetchDealers.pending, (state, action) => {
        state.dealersLoading = 'LOADING'
        state.dealersError = null
      })
      .addCase(fetchDealers.fulfilled, (state, action) => {
        state.dealersLoading = 'LOADED'
        state.dealers = action?.payload?.data
      })
      .addCase(fetchDealers.rejected, (state, action) => {
        state.dealersLoading = 'FAILED'
        state.dealersError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })

      .addCase(updateNotification.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateNotification.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(sendNotification.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(sendNotification.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(addNotification.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addNotification.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
  }
})

export default notification.reducer
