import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { t } from 'i18next'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch point
export const fetchPointData = createAsyncThunk('point/fetchPointData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/loyalty/getLoyaltyPoints?page=${params.paginationModel.page + 1}&limit=${
      params.paginationModel.pageSize
    }&startDate=${params.startDate || ''}&endDate=${params?.endDate || ''}&search=${params?.search}`,
    method: 'GET'
  })

  return response
})

export const bulkUploadPoint = createAsyncThunk('point/bulkUploadPoint', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/loyalty/uploadLoyaltyPoints',
    method: 'POST',
    data: params
  })

  return response
})

export const points = createSlice({
  name: 'point',
  initialState: {
    pointLoadingStatus: 'NOT_LOADED',
    point: [],
    totalPage: 0,
    totalData: 0,
    pointError: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPointData.pending, (state, action) => {
        state.pointLoadingStatus = 'LOADING'
        state.pointError = null
      })
      .addCase(fetchPointData.fulfilled, (state, action) => {
        state.pointLoadingStatus = 'LOADED'
        state.point = action?.payload?.LoyalityPoints
        state.totalPage = action?.payload?.totalPage
        state.totalData = action?.payload?.totalData
      })
      .addCase(fetchPointData.rejected, (state, action) => {
        state.pointLoadingStatus = 'FAILED'
        state.pointError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })

      .addCase(bulkUploadPoint.fulfilled, (state, action) => {
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(bulkUploadPoint.rejected, (state, action) => {
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
  }
})

export default points.reducer
