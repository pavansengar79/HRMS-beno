import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch dealer
export const fetchDealerData = createAsyncThunk('appInvoice/fetchDealerData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/getAllUsers?page=${params?.paginationModel?.page + 1 || ''}&limit=${
      params?.paginationModel?.pageSize || ''
    }&search=${params?.search || ''}`,
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

export const changeDealerStatus = createAsyncThunk('appInvoice/changeDealerStatus', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/adminUserRoute/changeUserStatus',
    method: 'POST',
    data: { user: params.id, active: params.active }
  })

  return response
})

export const dealerSlice = createSlice({
  name: 'dealer',
  initialState: {
    dealerLoadingStatus: 'NOT_LOADED',
    dealer: [],
    totalPage: 0,
    totalData: 0,
    dealerError: null,
    changeCategoryError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchDealerData.pending, (state, action) => {
        state.dealerLoadingStatus = 'LOADING'
        state.dealerError = null
      })
      .addCase(fetchDealerData.fulfilled, (state, action) => {
        state.dealerLoadingStatus = 'LOADED'
        state.dealer = action?.payload?.data
        state.totalPage = action?.payload?.totalPage
        state.totalData = action?.payload?.totalData
        state.shouldFetchData = false
      })
      .addCase(fetchDealerData.rejected, (state, action) => {
        state.dealerLoadingStatus = 'FAILED'
        state.dealerError = action?.payload
        toast.error('Something went wrong', { duration: 200 })
      })
      .addCase(changeDealerStatus.fulfilled, (state, action) => {
        toast.success(action?.payload?.message, { duration: 2000 })
        state.shouldFetchData = true
      })
      .addCase(changeDealerStatus.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 200 })
      })
  }
})

export default dealerSlice.reducer
