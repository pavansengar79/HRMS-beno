import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'
import moment from 'moment/moment'

// ** Fetch payment
export const fetchPaymentData = createAsyncThunk('payments/fetchPaymentData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/payment/getpayment?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }`,
    method: 'POST',
    data: {
      status: params.status != '' ? params.status : undefined,
      Dealercode: params.dealerCode != '' ? params.dealerCode : undefined,
      createdAt: params.createdAt ? moment.utc(params.createdAt).add(330, 'minutes') : undefined
    }

    // data: { Dealercode: params?.dealerCode, status: params?.status, createdAt: params?.createdAt }
  })

  return response
})

export const fetchDealerData = createAsyncThunk('payments/fetchDealerData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/adminUserRoute/getAllUsers?search=${params}`,
    method: 'GET'
  })

  return response
})

// export const uploadFile = createAsyncThunk('payments/uploadFile', async params => {
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

export const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    paymentLoadingStatus: 'NOT_LOADED',
    payment: [],
    totalData: 0,
    dealer: [],
    paymentError: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPaymentData.pending, (state, action) => {
        state.paymentLoadingStatus = 'LOADING'
        state.paymentError = null
      })
      .addCase(fetchPaymentData.fulfilled, (state, action) => {
        state.paymentLoadingStatus = 'LOADED'
        state.payment = action?.payload?.data
        state.totalData = action?.payload?.totalData
      })
      .addCase(fetchPaymentData.rejected, (state, action) => {
        state.paymentLoadingStatus = 'FAILED'
        state.paymentError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(fetchDealerData.fulfilled, (state, action) => {
        state.dealer = action?.payload?.data
      })
  }
})

export default paymentSlice.reducer
