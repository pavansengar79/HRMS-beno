import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch dealer
export const fetchData = createAsyncThunk('product/fetchData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/product/getProduct?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }&search=${params?.search}`,
    method: 'GET'
  })

  return response
})

export const fetchSizeData = createAsyncThunk('product/fetchSizeData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/product/getSizes?search=${params?.search}`,
    method: 'GET'
  })

  return response
})

// export const uploadFile = createAsyncThunk('appInvoice/uploadFile', async params => {
//   try {
//     const response = await axiosRequest({
//       url: '/api/admindash/file/create',
//       method: 'POST',
//       data: params
//     })

//     return response
//   } catch (error) {
//     console.log('Error is ===>', error)
//   }
// })

export const updateData = createAsyncThunk('product/updateData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/product/updateProduct?id=${params?.id}`,
    method: 'PUT',
    data: params?.data
  })

  return response
})

export const productSlice = createSlice({
  name: 'product',
  initialState: {
    dataLoadingStatus: 'NOT_LOADED',
    data: [],
    size: [],
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
        toast.success('Product Updated Successfully', { duration: 2000 })
      })
      .addCase(updateData.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(fetchSizeData.fulfilled, (state, action) => {
        state.size = action?.payload?.data
      })
      .addCase(fetchSizeData.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
  }
})

export default productSlice.reducer
