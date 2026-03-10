import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'
import axios from 'axios'

// ** Fetch Invoices
export const fetchBannerData = createAsyncThunk('banner/fetchBannerData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/banner/getAll?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }`,
    method: 'GET'
  })

  return response
})

export const uploadBanner = createAsyncThunk('banner/uploadBanner', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/banner/create',
    method: 'POST',
    data: params
  })

  return response
})

export const changeBannerStatus = createAsyncThunk('banner/changeBannerStatus', async params => {
  // const token = window.localStorage.getItem('token')

  const response = await axiosRequest({
    url: '/api/admindash/banner/updateStatus',
    method: 'PATCH',
    data: { id: params }
  })

  // const response = await axios.patch(
  //   'https://dev-connect-api.jktyre.co.in/api/admindash/banner/updateStatus',
  //   {
  //     id: params
  //   },
  //   {
  //     headers: {
  //       Authorization: `Bearer ${token}`
  //     }
  //   }
  // )

  return response
})

export const bannerSlice = createSlice({
  name: 'banner',
  initialState: {
    bannerLoadingStatus: 'NOT_LOADED',
    changeLoadingStatus: 'NOT_LOADED',
    bannerUploadStatus: 'NOT_LOADED',
    banner: [],
    totalPage: 0,
    totalData: 0,
    bannerError: null,
    changeStatusError: null,
    bannerUploadError: null,
    shouldFetchData: false
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchBannerData.pending, (state, action) => {
        state.bannerLoadingStatus = 'LOADING'
        state.bannerError = null
      })
      .addCase(fetchBannerData.fulfilled, (state, action) => {
        state.bannerLoadingStatus = 'LOADED'
        state.bannerUploadStatus = 'NOT_LOADED'
        state.banner = action?.payload?.banners
        state.totalPage = action?.payload?.totalPage
        ;(state.totalData = action?.payload?.totalData), (state.shouldFetchData = false)
      })
      .addCase(fetchBannerData.rejected, (state, action) => {
        state.bannerLoadingStatus = 'FAILED'
        state.bannerError = action?.payload
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
      .addCase(uploadBanner.pending, (state, action) => {
        state.bannerUploadStatus = 'LOADING'
        state.bannerUploadError = null
      })
      .addCase(uploadBanner.fulfilled, (state, action) => {
        state.bannerUploadStatus = 'LOADED'
        toast.success(action?.payload?.message, { duration: 2000 })
        state.shouldFetchData = true
      })
      .addCase(uploadBanner.rejected, (state, action) => {
        state.bannerUploadStatus = 'FAILED'
        state.bannerUploadError = action?.payload
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
      .addCase(changeBannerStatus.pending, (state, action) => {
        state.changeLoadingStatus = 'LOADING'
        state.changeStatusError = null
      })
      .addCase(changeBannerStatus.fulfilled, (state, action) => {
        state.changeLoadingStatus = 'LOADED'
        toast.success(action?.payload?.message, { duration: 2000 })
        state.shouldFetchData = true
      })
      .addCase(changeBannerStatus.rejected, (state, action) => {
        state.changeLoadingStatus = 'FAILED'
        state.changeStatusError = action?.payload
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
  }
})

export default bannerSlice.reducer
