import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { t } from 'i18next'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch point
export const vistexData = createAsyncThunk('vistex/vistexData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/loyalty/vistex/scheme?page=${params.paginationModel.page + 1}&search=${params?.search}&limit=${
      params?.paginationModel?.pageSize
    }`,
    method: 'GET'
  })
  console.log(response)
  return response
})

export const syncreport = createAsyncThunk('vistex/syncreport', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/loyalty/vistex/sync ',
    method: 'POST',
    data: params
  })

  return response
})

export const vistex = createSlice({
  name: 'vistex',
  initialState: {
    pointLoadingStatus: 'NOT_LOADED',
    vistexarray: [],
    totalPage: 0,
    totalData: 0,
    pointError: null,
    shouldFetchData: false
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(vistexData.pending, (state, action) => {
        state.pointLoadingStatus = 'LOADING'
        state.pointError = null
      })
      .addCase(vistexData.fulfilled, (state, action) => {
        state.pointLoadingStatus = 'LOADED'
        console.log(action?.payload?.data)
        state.vistexarray = action?.payload?.data
        state.totalPage = action?.payload?.totalPage
        state.totalData = action?.payload?.totalData
        state.shouldFetchData = false
      })
      .addCase(vistexData.rejected, (state, action) => {
        state.pointLoadingStatus = 'FAILED'
        state.pointError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(syncreport.pending, (state, action) => {
        state.pointLoadingStatus = 'LOADING'
        state.pointError = null
      })
      .addCase(syncreport.fulfilled, (state, action) => {
        state.pointLoadingStatus = 'LOADED'
        toast.success(action?.payload?.message, {
          duration: 2000
        })
        state.shouldFetchData = true
      })
      .addCase(syncreport.rejected, (state, action) => {
        state.pointLoadingStatus = 'FAILED'

        toast.error(action?.error?.message || 'Something went wrong', { duration: 2000 })
      })
  }
})

export default vistex.reducer
