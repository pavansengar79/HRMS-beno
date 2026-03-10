import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch TSOScheme
export const fetchTSO = createAsyncThunk('TSOScheme/fetchTSO', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/vistex/scheme-parameter?module=${params?.module || ''}`,
    method: 'GET'
  })

  return response
})

export const updateTSO = createAsyncThunk('TSOScheme/updateTSO', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/vistex/scheme-parameter',
    method: 'PUT',
    data: params
  })

  return response
})

export const addTSO = createAsyncThunk('TSOScheme/addTSO', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/vistex/scheme-parameter',
    method: 'POST',
    data: params
  })

  return response
})

export const deleteTSO = createAsyncThunk('TSOScheme/deleteTSO', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/vistex/scheme-parameter?id=${params}`,
    method: 'DELETE'
  })

  return response
})

export const TSOScheme = createSlice({
  name: 'TSOScheme',
  initialState: {
    TSOSchemeLoading: 'NOT_LOADED',
    TSOScheme: [],
    totalData: 0,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTSO.pending, (state, action) => {
        state.TSOSchemeLoading = 'LOADING'
        state.notificationError = null
      })
      .addCase(fetchTSO.fulfilled, (state, action) => {
        state.TSOSchemeLoading = 'LOADED'
        state.TSOScheme = action?.payload?.data
        state.totalData = action?.payload?.totalData
        state.shouldFetchData = false
      })
      .addCase(fetchTSO.rejected, (state, action) => {
        state.TSOSchemeLoading = 'FAILED'
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
      })

      // .addCase(updateTSO.pending, (state, action) => {
      //   state.TSOSchemeLoading = 'LOADING'
      // })
      .addCase(updateTSO.fulfilled, (state, action) => {
        // state.TSOSchemeLoading = 'LOADED'
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateTSO.rejected, (state, action) => {
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
        // state.TSOSchemeLoading = 'FAILED'
      })

      .addCase(addTSO.pending, (state, action) => {
        state.TSOSchemeLoading = 'LOADING'
      })
      .addCase(addTSO.fulfilled, (state, action) => {
        state.TSOSchemeLoading = 'LOADED'
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addTSO.rejected, (state, action) => {
        state.TSOSchemeLoading = 'FAILED'
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
      })
      .addCase(deleteTSO.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(deleteTSO.rejected, (state, action) => {
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
      })
  }
})

export default TSOScheme.reducer
