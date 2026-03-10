import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch mail
export const fetchRestrictedProduct = createAsyncThunk('productVisibility/fetchRestrictedProduct', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/product/getBlockedProduct?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }&search=${params?.search}`,
    method: 'GET'
  })

  return response
})

export const fetchNonRestrictedProduct = createAsyncThunk(
  'productVisibility/fetchNonRestrictedProduct',
  async params => {
    const response = await axiosRequest({
      url: `/api/admindash/product/getUnBlockedProduct?page=${params?.paginationModel?.page + 1}&limit=${
        params?.paginationModel?.pageSize
      }&search=${params?.search}`,
      method: 'GET'
    })

    return response
  }
)

export const updateProduct = createAsyncThunk('productVisibility/updateRestrictedProduct', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/product/availability`,
    method: 'PUT',
    data: { data: params.data }
  })

  return response
})

export const bulkUploadProduct = createAsyncThunk('productVisibility/bulkUploadProduct', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/product/availability',
    method: 'POST',
    data: { data: params.data }
  })

  return response
})

export const ProductVisibilitySlice = createSlice({
  name: 'Product',
  initialState: {
    restrictedProductLoadingStatus: 'NOT_LOADED',
    NonRestrictedProductLoadingStatus: 'NOT_LOADED',
    restrictedProduct: [],
    NonRestrictedProduct: [],
    totalData1: 0,
    totalData2: 0,
    restrictedProductError: null,
    NonRestrictedProductError: null,
    shouldFetchData: { restricted: true, NonRestricted: true }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchRestrictedProduct.pending, (state, action) => {
        state.restrictedProductLoadingStatus = 'LOADING'
        state.restrictedProductError = null
      })
      .addCase(fetchRestrictedProduct.fulfilled, (state, action) => {
        state.restrictedProductLoadingStatus = 'LOADED'
        state.restrictedProduct = action?.payload?.data
        state.totalData1 = action?.payload?.totalData
        state.shouldFetchData.restricted = false
      })
      .addCase(fetchRestrictedProduct.rejected, (state, action) => {
        state.restrictedProductLoadingStatus = 'FAILED'
        state.restrictedProductError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(fetchNonRestrictedProduct.pending, (state, action) => {
        state.NonRestrictedProductLoadingStatus = 'LOADING'
        state.NonRestrictedProductError = null
      })
      .addCase(fetchNonRestrictedProduct.fulfilled, (state, action) => {
        state.shouldFetchData.NonRestricted = false
        state.NonRestrictedProductLoadingStatus = 'LOADED'
        state.NonRestrictedProduct = action?.payload?.data
        state.totalData2 = action?.payload?.totalData
      })
      .addCase(fetchNonRestrictedProduct.rejected, (state, action) => {
        state.restrictedProductLoadingStatus = 'FAILED'
        state.restrictedProductError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })

      .addCase(updateProduct.fulfilled, (state, action) => {
        state.shouldFetchData.restricted = true        
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateProduct.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(bulkUploadProduct.fulfilled, (state, action) => {
        state.shouldFetchData.restricted = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(bulkUploadProduct.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })

    // .addCase(deleteMailScheduler.fulfilled, (state, action) => {
    //   console.log('acc'.action)
    //   toast.success(action.payload?.message || 'Deleted Successfully', {
    //     duration: 2000
    //   })
    // })
  }
})

export default ProductVisibilitySlice.reducer
