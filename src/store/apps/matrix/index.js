import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch Queries
export const fetchMatrixData = createAsyncThunk('matrix/fetchMatrixData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/query/getAllEscalationMatrix?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }`,
    method: 'GET'
  })

  return response
})

export const fetchCategory = createAsyncThunk('matrix/fetchCategory', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/queryCategory/getAll?active=${params?.status}`,
    method: 'GET'
  })

  return response
})

export const fetchTimeConfig = createAsyncThunk('matrix/fetchTimeConfig', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/query/EscalationMatrixTimeConfig',
    method: 'GET'
  })

  return response
})

export const addMatrix = createAsyncThunk('matrix/addMatrix', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/query/createEscalation',
    method: 'POST',
    data: params
  })

  return response
})

export const updateMatrix = createAsyncThunk('matrix/updateMatrix', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/query/updateEscalationMatrix?id=${params.id}`,
    method: 'PUT',
    data: params?.data
  })

  return response
})

export const updateTimeConfig = createAsyncThunk('matrix/updateTimeConfig', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/query/EscalationMatrixTimeConfig`,
    method: 'PUT',
    data: params
  })

  return response
})

export const deleteMatrix = createAsyncThunk('matrix/deleteMatrix', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/query/deleteEscalationMatrix?id=${params}`,
    method: 'DELETE'
  })

  return response
})

export const matrixSlice = createSlice({
  name: 'matrix',
  initialState: {
    matrixLoadingStatus: 'NOT_LOADED',
    matrix: [],
    totalData: 0,
    totalPage: 0,
    category: [],
    timeConfig: [],
    matrixError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMatrixData.pending, (state, action) => {
        state.matrixLoadingStatus = 'LOADING'
        state.matrixError = null
      })
      .addCase(fetchMatrixData.fulfilled, (state, action) => {
        state.matrixLoadingStatus = 'LOADED'
        state.matrix = action?.payload.data
        state.totalData = action?.payload.totalData
        state.totalPage = action?.payload.totalPage
        state.shouldFetchData = false
      })
      .addCase(fetchMatrixData.rejected, (state, action) => {
        state.matrixLoadingStatus = 'FAILED'
        state.matrixError = action?.payload
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.category = action?.payload?.categories
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        console.log('action', action)
        state.category = action?.payload?.categories
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(addMatrix.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addMatrix.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(deleteMatrix.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(deleteMatrix.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(updateMatrix.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateMatrix.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(fetchTimeConfig.fulfilled, (state, action) => {
        state.shouldFetchData = false
        state.timeConfig = action?.payload.data
      })
      .addCase(fetchTimeConfig.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(updateTimeConfig.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateTimeConfig.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
  }
})

export default matrixSlice.reducer
