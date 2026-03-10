import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch secondarySales
export const fetchSecondarySales = createAsyncThunk('appInvoice/fetchSecondarySales', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/secondary-sales/getSecondarySales?page=${params.paginationModel.page + 1}&limit=${
      params.paginationModel.pageSize
    }&dealerCode=${params.dealerCode || ''}&cFromDate=${params.startDate || ''}&cToDate=${
      params?.endDate || ''
    }&iFromDate=${params.startDate2 || ''}&iToDate=${params.endDate2 || ''}`,
    method: 'GET'
  })

  return response
})

export const fetchUsers = createAsyncThunk('appInvoice/fetchUsers', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/getAllUsers?search=${params}`,
    method: 'GET'
  })

  return response
})

export const secondarySales = createSlice({
  name: 'secondarySales',
  initialState: {
    secondarySalesLoading: 'NOT_LOADED',
    secondarySales: [],
    users: [],
    csvData: [],
    secondarySalesError: null,
    totalPage: 0,
    totalData: 0
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSecondarySales.pending, (state, action) => {
        state.secondarySalesLoading = 'LOADING'
        state.secondarySalesError = null
      })
      .addCase(fetchSecondarySales.fulfilled, (state, action) => {
        state.secondarySalesLoading = 'LOADED'
        state.secondarySales = action?.payload?.data
        state.totalPage = action?.payload?.csvCount
        state.totalData = action?.payload?.totalData
        state.csvData = action?.payload?.csvData
      })
      .addCase(fetchSecondarySales.rejected, (state, action) => {
        state.secondarySalesLoading = 'FAILED'
        state.secondarySalesError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action?.payload?.data

        // state.totalPage = action?.payload?.totalPage
      })
  }
})

export default secondarySales.reducer
