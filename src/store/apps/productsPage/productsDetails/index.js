import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch dealer
export const fetchData = createAsyncThunk('productDetails/fetchData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/product/getProductDetails?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }&search=${params?.search}`,
    method: 'GET'
  })

  return response
})

export const addData = createAsyncThunk('productDetails/addData', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/product/createProductDetails',
    method: 'POST',
    data: params
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

export const updateData = createAsyncThunk('productDetails/updateData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/product/updateProductDetails?id=${params?.id}`,
    method: 'PUT',
    data: params?.data
  })

  return response
})

export const deleteData = createAsyncThunk('productDetails/deleteData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/product/deleteProductDetails?id=${params}`,
    method: 'DELETE'
  })

  return response
})

export const productDetailSlice = createSlice({
  name: 'productDetails',
  initialState: {
    dataLoadingStatus: 'NOT_LOADED',
    data: [],
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
        toast.success('Updated Succesfully', { duration: 2000 })
      })
      .addCase(deleteData.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success('Deleted Succesfully', { duration: 2000 })
      })
      .addCase(addData.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success('Created Succesfully', { duration: 2000 })
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

export default productDetailSlice.reducer
