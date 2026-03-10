import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'
import moment from 'moment'

// ** Fetch order
export const fetchOrderData = createAsyncThunk('orders/fetchOrderData', async params => {
  // params.createdAt = new Date(params?.createdAt).toISOString().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  // const newDate = new Date(params.createdAt).toLocaleString('en-Us', { timeZone: 'Asia/Kolkata' })
  // const formattedDate = moment.utc(params.createdAt).format('YYYY-MM-DD')
  // console.log('date1', new Date(formattedDate).toISOString())

  // console.log('params', moment.tz(params?.createdAt, 'America/New_York').format('DD-MM-YYYY'))

  const response = await axiosRequest({
    url: `/api/admindash/orders/getorders?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }`,
    method: 'POST',
    data: {
      // OrderNo: params?.orderNo,
      OrderNo: params.orderNo != '' ? params.orderNo : undefined,
      orderStatus: params.orderStatus != '' ? params.orderStatus : undefined,
      Dealercode: params.dealerCode != '' ? params.dealerCode : undefined,
      createdAt: params.createdAt ? moment.utc(params.createdAt).add(330, 'minutes') : undefined

      // ...(params.orderNo !== '' ? { orderNo: params?.orderNo } : { orderNo: null })
      // ...(params.orderStatus !== '' ? { orderStatus: params?.orderStatus } : { orderStatus: null })
      // ...(params.Dealercode !== '' ? { Dealercode: params?.Dealercode } : { Dealercode: null })
      // ...(params.createdAt !== '' ? { createdAt: params?.createdAt } : { orderNo: null })

      // createdAt: new Date(params?.createdAt).toISOString()
    }
  })

  return response
})

// export const uploadFile = createAsyncThunk('orders/uploadFile', async params => {
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

export const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orderLoadingStatus: 'NOT_LOADED',
    changeCategoryLoadingStatus: 'NOT_LOADED',
    order: [],
    totalData: 0,
    orderError: null,
    changeCategoryError: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchOrderData.pending, (state, action) => {
        state.orderLoadingStatus = 'LOADING'
        state.orderError = null
      })
      .addCase(fetchOrderData.fulfilled, (state, action) => {
        state.orderLoadingStatus = 'LOADED'
        state.order = action?.payload?.data
        state.totalData = action?.payload?.totalData
      })
      .addCase(fetchOrderData.rejected, (state, action) => {
        state.orderLoadingStatus = 'FAILED'
        state.orderError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
  }
})

export default orderSlice.reducer
