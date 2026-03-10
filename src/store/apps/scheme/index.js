import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch scheme
export const fetchSchemeData = createAsyncThunk('Loyaltyscheme/fetchSchemeData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/loyalty/getLoyaltySchemes?page=${params?.paginationModel?.page + 1 || ''}&limit=${
      params?.paginationModel?.pageSize || ''
    }&search=${params?.search || ''}`,
    method: 'GET'
  })

  return response
})

export const fetchLoyaltySchemeData = createAsyncThunk('Loyaltyscheme/fetchLoyaltySchemeData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/loyalty/loyalty-scheme-data/${params}`,
    method: 'GET'
  })

  return response
})

export const fetchLoyaltySchemePremiuim = createAsyncThunk('Loyaltyscheme/fetchLoyaltySchemePremiuim', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/loyalty/loyalty-scheme-data/premium/${params}`,
    method: 'GET'
  })

  return response
})

export const fetchTotalPoints = createAsyncThunk('Loyaltyscheme/fetchTotalPoints', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/loyalty/loyalty-scheme-points/${params}`,
    method: 'GET'
  })

  return response
})

export const deleteSchemeData = createAsyncThunk('Loyaltyscheme/deleteData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/loyalty/deleteLoyaltySchemes/${params}`,
    method: 'DELETE'
  })

  return response
})

export const scheme = createSlice({
  name: 'scheme',
  initialState: {
    schemeLoadingStatus: 'NOT_LOADED',
    scheme: [],
   
    totalPage: 0,
    totalData: 0,
    schemeError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSchemeData.pending, (state, action) => {
        state.schemeLoadingStatus = 'LOADING'
        state.schemeError = null
      })
      .addCase(fetchSchemeData.fulfilled, (state, action) => {
        state.schemeLoadingStatus = 'LOADED'
        state.scheme = action?.payload?.LoyalitySchemes
        state.totalData = action?.payload?.totalData
        state.totalPage = action?.payload?.totalPage
        state.shouldFetchData = false
      })
      .addCase(fetchSchemeData.rejected, (state, action) => {
        state.schemeLoadingStatus = 'FAILED'
        state.schemeError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })

      .addCase(fetchLoyaltySchemeData.fulfilled, (state, action) => {
        state.loyaltySchemeData = action?.payload
        console.log('sceme', state.loyaltySchemeData)
      })
      .addCase(fetchLoyaltySchemeData.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })

      .addCase(fetchLoyaltySchemePremiuim.fulfilled, (state, action) => {
        state.loyaltySchemeDataPremium = action?.payload
      })
      .addCase(fetchLoyaltySchemePremiuim.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })

      .addCase(fetchTotalPoints.fulfilled, (state, action) => {
        state.totalPoints = action?.payload
      })
      .addCase(fetchTotalPoints.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })

      .addCase(deleteSchemeData.fulfilled, (state, action) => {
        toast.success(action?.payload?.message, { duration: 2000 })
        state.shouldFetchData = true
      })
      .addCase(deleteSchemeData.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
  }
})

export default scheme.reducer
