import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

export const fetchAppVersion = createAsyncThunk('appInvoice/fetchAppVersion', async params => {
  const response = await axiosRequest({
    url: `/api/user/checkForUpdate`,
    method: 'GET'
  })

  return response
})

export const addAppVersion = createAsyncThunk('appInvoice/addAppVersion', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/appversion/addAppVersion',
    method: 'POST',
    data: params
  })

  return response
})

export const updateAppVersion = createAsyncThunk('appInvoice/updateAppVersion', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/appversion/updateAppVersion/${params?.id}`,
    method: 'PUT',
    data: params.data
  })

  return response
})

export const appVersion = createSlice({
  name: 'appVersion',
  initialState: {
    appVersionLoading: 'NOT_LOADED',
    appVersion: [],
    appVersionError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder

      .addCase(fetchAppVersion.pending, (state, action) => {
        state.appVersionLoading = 'LOADING'
        state.appVersionError = null
      })
      .addCase(fetchAppVersion.fulfilled, (state, action) => {
        state.shouldFetchData = false
        state.appVersionLoading = 'LOADED'
        state.appVersion = action?.payload?.version
      })
      .addCase(fetchAppVersion.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
        state.appVersionLoading = 'FAILED'
        state.appVersionError = action?.payload
      })

      .addCase(addAppVersion.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateAppVersion.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
  }
})

export default appVersion.reducer
