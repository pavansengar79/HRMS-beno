import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch mail
export const fetchMailScheduler = createAsyncThunk('reportQueries/fetchMailScheduler', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/admin/getAdoptionReportQueries?page=${params?.page}`,
    method: 'GET'
  })

  return response
})

export const updateMailScheduler = createAsyncThunk('reportQueries/updateMailScheduler', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/emailReportUpdate`,
    method: 'PUT',
    data: { frequency: params.frequency, report: params.report, userList: params.userList, _id: params.id }
  })

  return response
})

export const addMailScheduler = createAsyncThunk('reportQueries/addMailScheduler', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/adminUserRoute/emailReport',
    method: 'POST',
    data: { frequency: params.frequency, report: params.report, userList: params.userList }
  })

  return response
})

export const deleteMailScheduler = createAsyncThunk('reportQueries/deleteMailScheduler', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/emailReport/${params}`,
    method: 'DELETE'
  })

  return response
})

export const mailSchedulerSlice = createSlice({
  name: 'mailScheduler',
  initialState: {
    mailLoadingStatus: 'NOT_LOADED',
    mail: [],
    totalData: 0,
    mailError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMailScheduler.pending, (state, action) => {
        state.mailLoadingStatus = 'LOADING'
        state.mailError = null
      })
      .addCase(fetchMailScheduler.fulfilled, (state, action) => {
        state.mailLoadingStatus = 'LOADED'
        state.mail = action?.payload?.data[0].data
        state.totalData = action?.payload?.totalData
        state.shouldFetchData = false
      })
      .addCase(fetchMailScheduler.rejected, (state, action) => {
        state.mailLoadingStatus = 'FAILED'
        state.mailError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })

      .addCase(updateMailScheduler.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addMailScheduler.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(deleteMailScheduler.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
  }
})

export default mailSchedulerSlice.reducer
