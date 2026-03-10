import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch forcastDate
export const fetchForcastDate = createAsyncThunk('forcastDate/fetchForcastDate', async params => {
  const response = await axiosRequest({
    url: `/api/user/reports/forcast/getForcastDate`,
    method: 'GET'
  })

  return response
})

export const addForcastDate = createAsyncThunk('forcastDate/addForcastDate', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/adminUserRoute/createForcastDate',
    method: 'POST',
    data: { startDate: params.startDate, endDate: params.endDate }
  })

  return response
})

export const forcastDate = createSlice({
  name: 'forcastDate',
  initialState: {
    forcastDateLoading: 'NOT_LOADED',
    forcastDate: [],
    forcastDateError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchForcastDate.pending, (state, action) => {
        state.forcastDateLoading = 'LOADING'
        state.forcastDateError = null
      })
      .addCase(fetchForcastDate.fulfilled, (state, action) => {
        state.shouldFetchData = false
        state.forcastDateLoading = 'LOADED'
        state.forcastDate = action?.payload?.data
      })
      .addCase(fetchForcastDate.rejected, (state, action) => {
        state.forcastDateLoading = 'FAILED'
        state.forcastDateError = action?.payload
      })

      .addCase(addForcastDate.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message || 'Added dates successfully', {
          duration: 2000
        })
      })
  }
})

export default forcastDate.reducer
