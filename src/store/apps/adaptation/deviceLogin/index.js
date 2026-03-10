import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch mail
export const fetchRestrictedProduct = createAsyncThunk('deviceLogin/fetchRestrictedProduct', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/admin/getDeviceDetails?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }&startDate=${params?.startDate || ''}&endDate=${params?.endDate || ''}`,
    method: 'GET'
  })

  return response
})

export const fetchNonRestrictedProduct = createAsyncThunk('deviceLogin/fetchNonRestrictedProduct', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/admin/getDealerDetails?page=${params?.paginationModel?.page + 1 || ''}&limit=${
      params?.paginationModel?.pageSize || ''
    }&startDate=${params?.startDate || ''}&endDate=${params?.endDate || ''}`,
    method: 'GET'
  })

  return response
})

export const DeviceLogin = createSlice({
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
        console.log('acc', action)
        state.restrictedProductLoadingStatus = 'LOADED'
        state.restrictedProduct = action?.payload?.data
        state.totalData1 = action?.payload?.paginate?.totalData
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
        console.log('acc', action)
        state.NonRestrictedProductLoadingStatus = 'LOADED'
        state.NonRestrictedProduct = action?.payload?.data
        state.totalData2 = action?.payload?.paginate?.totalData
        state.shouldFetchData.NonRestricted = false
      })
      .addCase(fetchNonRestrictedProduct.rejected, (state, action) => {
        state.NonRestrictedProductLoadingStatus = 'FAILED'
        state.NonRestrictedProductError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
  }
})

export default DeviceLogin.reducer
