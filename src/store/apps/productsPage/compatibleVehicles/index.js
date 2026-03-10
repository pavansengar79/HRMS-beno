import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch dealer
export const fetchData = createAsyncThunk('compatible/fetchData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/product/getCompatibleVehicles?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }&search=${params?.search}`,
    method: 'GET'
  })

  return response
})

export const addData = createAsyncThunk('compatible/addData', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/product/createCompatibleVehicles',
    method: 'POST',
    data: params
  })

  return response
})

export const updateData = createAsyncThunk('compatible/updateData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/product/updateCompatibleVehicles?id=${params?.id}`,
    method: 'PUT',
    data: params?.data
  })

  return response
})

export const deleteData = createAsyncThunk('compatible/deleteData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/product/deleteCompatibleVehicles?id=${params}`,
    method: 'DELETE'
  })

  return response
})

export const compatibleSlice = createSlice({
  name: 'compatible',
  initialState: {
    dataLoadingStatus: 'NOT_LOADED',
    data: [],
    totalPage: 0,
    totalData: 0,
    dataError: null,
    dataUpdateError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchData.pending, (state, action) => {
        state.dataLoadingStatus = 'LOADING'
        state.dataError = null
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.dataLoadingStatus = 'LOADED'
        state.data = action?.payload?.data
        state.totalPage = action?.payload?.totalPage
        state.totalData = action?.payload?.totalData
        state.shouldFetchData = false
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.dataLoadingStatus = 'FAILED'
        state.dataError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(updateData.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message || 'Updated Successfully', { duration: 2000 })
      })
      .addCase(deleteData.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, { duration: 2000 })
      })
      .addCase(addData.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message || 'Added Successfully ', { duration: 2000 })
      })
      .addCase(updateData.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(deleteData.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(addData.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
  }
})

export default compatibleSlice.reducer
