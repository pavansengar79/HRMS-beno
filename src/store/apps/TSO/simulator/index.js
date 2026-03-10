import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch TSOSimulator
export const fetchTSO = createAsyncThunk('TSOSimulator/fetchTSO', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/vistex/scheme?status=${params?.status || ''}&page=${
      params?.paginationModel?.page + 1 || ''
    }&limit=${params?.paginationModel?.pageSize || ''}&id=${params?.id || ''}`,
    method: 'GET'
  })

  return response
})

export const fetchSchemeParameter = createAsyncThunk('TSOScheme/fetchSchemeParameter', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/vistex/scheme-parameter?module=${params?.module || ''}`,
    method: 'GET'
  })

  return response
})

export const updateTSO = createAsyncThunk('TSOSimulator/updateTSO', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/vistex/scheme-parameter',
    method: 'PUT',
    data: params
  })

  return response
})

export const createScheme = createAsyncThunk('TSOSimulator/createScheme', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/vistex/scheme',
    method: 'POST',
    data: params
  })

  return response
})

export const addTSO = createAsyncThunk('TSOSimulator/addTSO', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/vistex/run-simulator',
    method: 'POST',
    data: params
  })

  return response
})

export const sendApproval = createAsyncThunk('TSOSimulator/sendApproval', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/vistex/scheme', //dummy api
    method: 'POST',
    data: params
  })

  return response
})

export const deleteTSO = createAsyncThunk('TSOSimulator/deleteTSO', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/vistex/scheme?id=${params}`,
    method: 'DELETE'
  })

  return response
})

export const TSOSimulator = createSlice({
  name: 'TSOSimulator',
  initialState: {
    TSOSimulatorLoading: 'NOT_LOADED',
    TSOSimulator: [],
    SchemeParameter: [],
    totalData: 0,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTSO.pending, (state, action) => {
        state.TSOSimulatorLoading = 'LOADING'
        state.notificationError = null
      })
      .addCase(fetchTSO.fulfilled, (state, action) => {
        state.TSOSimulatorLoading = 'LOADED'
        state.TSOSimulator = action?.payload?.data
        state.totalData = action?.payload?.totalData
        state.shouldFetchData = false
      })
      .addCase(fetchTSO.rejected, (state, action) => {
        state.TSOSimulatorLoading = 'FAILED'
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
      })

      .addCase(fetchSchemeParameter.fulfilled, (state, action) => {
        state.SchemeParameter = action?.payload?.data
      })
      // .addCase(updateTSO.pending, (state, action) => {
      //   state.TSOSimulatorLoading = 'LOADING'
      // })
      .addCase(updateTSO.fulfilled, (state, action) => {
        // state.TSOSimulatorLoading = 'LOADED'
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateTSO.rejected, (state, action) => {
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
        // state.TSOSimulatorLoading = 'FAILED'
      })

      .addCase(addTSO.pending, (state, action) => {
        state.TSOSimulatorLoading = 'LOADING'
      })
      .addCase(addTSO.fulfilled, (state, action) => {
        state.TSOSimulatorLoading = 'LOADED'
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addTSO.rejected, (state, action) => {
        state.TSOSimulatorLoading = 'FAILED'
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
      })
      .addCase(createScheme.pending, (state, action) => {
        state.TSOSimulatorLoading = 'LOADING'
      })
      .addCase(createScheme.fulfilled, (state, action) => {
        state.TSOSimulatorLoading = 'LOADED'
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(createScheme.rejected, (state, action) => {
        state.TSOSimulatorLoading = 'FAILED'
        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
      })

      .addCase(sendApproval.pending, (state, action) => {
        state.approvalDataLoading = 'LOADING'
      })
      .addCase(sendApproval.fulfilled, (state, action) => {
        state.approvalDataLoading = 'LOADED'
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(sendApproval.rejected, (state, action) => {
        state.approvalDataLoading = 'FAILED'
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

export default TSOSimulator.reducer
