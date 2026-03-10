import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { duration } from 'moment'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch disabled
export const fetchDisabledData = createAsyncThunk('disable/fetchDisabledData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/disable/getAllDisable?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }`,
    method: 'GET'
  })

  return response
})
export const fetchUsers = createAsyncThunk('disable/fetchUsers', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/getAllUsers?search=${params || ''}`,
    method: 'GET'
  })

  return response
})

export const addDisabledData = createAsyncThunk('disable/addDisabledData', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/disable/addDisable',
    method: 'POST',
    data: params
  })

  return response
})

export const updateDisabledData = createAsyncThunk('disable/updateDisabledData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/disable/updateDisable?id=${params?.id}`,
    method: 'PUT',
    data: params?.data
  })

  return response
})

export const disabled = createSlice({
  name: 'disabled',
  initialState: {
    disabledLoadingStatus: 'NOT_LOADED',
    disabledAddLoadingStatus: 'NOT_LOADED',
    usersLoadingStatus: 'NOT_LOADED',
    disabled: [],
    users: [],
    totalData: 0,
    disabledError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchDisabledData.pending, (state, action) => {
        state.disabledLoadingStatus = 'LOADING'
        state.disabledError = null
      })
      .addCase(fetchDisabledData.fulfilled, (state, action) => {
        state.disabledLoadingStatus = 'LOADED'
        state.disabled = action?.payload?.data
        state.totalData = action?.payload?.totalData
        state.shouldFetchData = false
      })
      .addCase(fetchDisabledData.rejected, (state, action) => {
        state.disabledLoadingStatus = 'FAILED'
        state.disabledError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(fetchUsers.pending, (state, action) => {
        state.usersLoadingStatus = 'LOADING'
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoadingStatus = 'LOADED'
        state.users = action?.payload?.data.map(user => {
          return { Kunnr: user?.Kunnr, Name1: user?.Name1 }
        })
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoadingStatus = 'FAILED'
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(addDisabledData.pending, (state, action) => {
        state.disabledAddLoadingStatus = 'LOADING'
        state.disabledError = null
      })
      .addCase(addDisabledData.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, { duration: 2000 })
        state.disabledAddLoadingStatus = 'LOADED'
      })
      .addCase(addDisabledData.rejected, (state, action) => {
        state.disabledAddLoadingStatus = 'FAILED'
        toast.error('Button is Already Disabled', { duration: 2000 })
      })
      .addCase(updateDisabledData.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, { duration: 2000 })
      })
      .addCase(updateDisabledData.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
  }
})

export default disabled.reducer
