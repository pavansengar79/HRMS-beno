import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch reason
export const fetchReasonData = createAsyncThunk('reject/fetchReasonData', async params => {
  const response = await axiosRequest({
    url: `/api/user/retread/reject-reason/getAllData?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }&search=${params?.search}&filter=ALL`,
    method: 'GET'
  })

  return response
})

export const fetchRowReasonData = createAsyncThunk('reject/fetchRowReasonData', async params => {
  const response = await axiosRequest({
    url: `/api/user/retread/reject-reason/getRRejectReason?_id=${params}`,
    method: 'GET'
  })

  return response
})

export const updateRejectData = createAsyncThunk('reject/updateRejectData', async params => {
  const response = await axiosRequest({
    url: `/api/user/retread/reject-reason/updateRRejectReason?id=${params.id}`,
    method: 'PUT',
    data: { name: params.name, description: params.description, status: params.status }
  })

  return response
})

export const addReason = createAsyncThunk('reject/addReason', async params => {
  const response = await axiosRequest({
    url: '/api/user/retread/reject-reason/addRRejectReason',
    method: 'POST',
    data: params
  })

  return response
})

export const deleteReason = createAsyncThunk('reject/deleteReason', async params => {
  const response = await axiosRequest({
    url: `/api/user/retread/reject-reason/deleteRRejectReason`,
    method: 'DELETE',
    data: { _id: params }
  })

  return response
})

export const reasonSlice = createSlice({
  name: 'reason',
  initialState: {
    reasonLoadingStatus: 'NOT_LOADED',
    reason: [],
    rowData: {},
    totalData: 0,
    reasonError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchReasonData.pending, (state, action) => {
        state.reasonLoadingStatus = 'LOADING'
        state.reasonError = null
      })
      .addCase(fetchReasonData.fulfilled, (state, action) => {
        console.log('acc', action)
        state.reasonLoadingStatus = 'LOADED'
        state.reason = action?.payload?.data
        state.totalData = action?.payload?.totalData
        state.shouldFetchData = false
      })
      .addCase(fetchReasonData.rejected, (state, action) => {
        state.reasonLoadingStatus = 'FAILED'
        state.reasonError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(updateRejectData.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action.payload.message, {
          duration: 2000
        })
      })
      .addCase(updateRejectData.rejected, (state, action) => {
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
      .addCase(addReason.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addReason.rejected, (state, action) => {
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
      .addCase(fetchRowReasonData.fulfilled, (state, action) => {
        console.log('acc'.action)
        state.rowData = action?.payload?.reason
      })
      .addCase(deleteReason.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(deleteReason.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
  }
})

export default reasonSlice.reducer
