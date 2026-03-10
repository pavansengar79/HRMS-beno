import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch Invoices
export const fetchCoupon = createAsyncThunk('coupon/fetchCoupon', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/coupon/list?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }`,
    method: 'GET'
  })

  return response
})

export const createCoupon = createAsyncThunk('coupon/createCoupon', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/coupon/create',
    method: 'POST',
    data: params
  })

  return response
})

export const updateCoupon = createAsyncThunk('coupon/updateCoupon', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/coupon/updateEnable',
    method: 'PATCH',
    data: params
  })

  return response
})

export const deleteCoupon = createAsyncThunk('coupon/deleteCoupon', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/coupon/${params}`,
    method: 'DELETE'
  })

  return response
})

export const coupon = createSlice({
  name: 'coupon',
  initialState: {
    couponLoadingStatus: 'NOT_LOADED',
    couponCreateLoadingStatus: 'NOT_LOADED',
    coupon: [],
    totalData: 0,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchCoupon.pending, (state, action) => {
        state.couponLoadingStatus = 'LOADING'
      })
      .addCase(fetchCoupon.fulfilled, (state, action) => {
        state.couponLoadingStatus = 'LOADED'
        state.couponCreateLoadingStatus = 'NOT_LOADED'
        state.coupon = action?.payload?.data
        state.totalData = action?.payload?.pagination?.totalDocuments
        state.shouldFetchData = false
      })
      .addCase(fetchCoupon.rejected, (state, action) => {
        state.couponLoadingStatus = 'FAILED'
        toast.error(action?.error?.message || 'Something went wrong', {
          duration: 2000
        })
      })
      .addCase(createCoupon.pending, (state, action) => {
        state.couponCreateLoadingStatus = 'LOADING'
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.couponCreateLoadingStatus = 'LOADED'
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.couponCreateLoadingStatus = 'FAILED'
        toast.error(action?.error?.message || 'Something went wrong', {
          duration: 2000
        })
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        toast.error(action?.error?.message || 'Something went wrong', {
          duration: 2000
        })
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        toast.error(action?.error?.message || 'Something went wrong', {
          duration: 2000
        })
      })
  }
})

export default coupon.reducer
