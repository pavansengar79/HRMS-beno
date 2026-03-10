import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch mail
export const fetchMailScheduler = createAsyncThunk('dealerPayment/fetchMailScheduler', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/admin/getAdoptionReportPayment?page=${params?.paginationModel?.page + 1}&limit=${
      params.paginationModel?.pageSize
    }&startDate=${params?.startDate || ''}&endDate=${params?.endDate || ''}`,
    method: 'GET'
  })

  return response
})

export const updateMailScheduler = createAsyncThunk('dealerPayment/updateMailScheduler', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/emailReportUpdate`,
    method: 'PUT',
    data: { frequency: params.frequency, report: params.report, userList: params.userList, _id: params.id }
  })

  return response
})

export const addMailScheduler = createAsyncThunk('dealerPayment/addMailScheduler', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/adminUserRoute/emailReport',
    method: 'POST',
    data: { frequency: params.frequency, report: params.report, userList: params.userList }
  })

  return response
})

export const deleteMailScheduler = createAsyncThunk('dealerPayment/deleteMailScheduler', async params => {
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
    totalPage: 0,
    mailError: null
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
        state.mail = action?.payload?.data[0]?.data
        state.totalData = action?.payload?.totalData
      })
      .addCase(fetchMailScheduler.rejected, (state, action) => {
        state.mailLoadingStatus = 'FAILED'
        state.mailError = action?.payload
      })

      .addCase(updateMailScheduler.fulfilled, (state, action) => {
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addMailScheduler.fulfilled, (state, action) => {
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(deleteMailScheduler.fulfilled, (state, action) => {
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
  }
})

export default mailSchedulerSlice.reducer
