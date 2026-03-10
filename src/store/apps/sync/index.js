import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'
import axios from 'axios'

// ** Fetch maintenance
// const token = window.localStorage.getItem(
//   authConfig.storageTokenKeyName,
//   window.localStorage.getItem(authConfig.storageTokenKeyName)
// )

const userName = 'JKxLrG73rxuGVG'
const password = 'uhM4KA73rxLrGuGVGoZrOfMOmfFl3A8cKXNMXWY1'

export const addSyncPayment = createAsyncThunk('appInvoice/addSyncPayment', async params => {
  const response = await axios.get(
    `https://jkc-services.jktyre.co.in/api/service/syncPaymentData?fromDate=${params?.data}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(userName + ':' + password).toString('base64')
      }
    }
  )

  return response.data
})

export const addSyncParty = createAsyncThunk('appInvoice/addSyncParty', async params => {
  const api =
    params.type === 'all'
      ? 'https://dev-connect-api.jktyre.co.in/api/admindash/sync/userRetailers'
      : `https://dev-connect-api.jktyre.co.in/api/admindash/sync/userRetailers?Kunnr=1100064`
  try {
    const response = await axiosRequest({
      url: `/api/admindash/sync/userRetailers`,
      method: 'GET'
    })

    return response
  } catch (error) {
    console.log('Error is ===>', error)
  }

  // if (params.type === 'all') {
  //   try {
  //     const response = await axiosRequest({
  //       url: `/api/admindash/sync/userRetailers`,
  //       method: 'GET'
  //     })

  //     return response
  //   } catch (error) {
  //     console.log('Error is ===>', error)
  //   }
  // } else {
  //   try {
  //     const response = await axiosRequest({
  //       url: `/api/admindash/sync/userRetailers?Kunnr=${params.data}`,
  //       method: 'GET'
  //     })

  //     return response
  //   } catch (error) {
  //     console.log('Error is ===>', error)
  //   }
  // }
})

export const addSyncOrder = createAsyncThunk('appInvoice/addSyncOrder', async params => {
  const api =
    params.type === 'all'
      ? 'https://jkc-services.jktyre.co.in/api/service/syncOrderData'
      : `https://jkc-services.jktyre.co.in/api/service/syncOrderData?Kunnr=${params?.data}`
  try {
    const response = await axios.get(api, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(userName + ':' + password).toString('base64')
      }
    })

    return response?.data
  } catch (error) {
    console.log('Error is ===>', error)
  }

  // const api = params.type === 'all' ? '/api/service/syncOrderData' : `/api/service/syncOrderData?Kunnr=${params.data}`
  // try {
  //   const response = await axiosRequest({
  //     //   url: `/api/service/syncOrderData?Kunnr=${params}`,
  //     url: api,
  //     method: 'GET'
  //   })

  //   return response
  // } catch (error) {
  //   console.log('Error is ===>', error)
  // }
})

export const addSyncUser = createAsyncThunk('appInvoice/addSyncUser', async params => {
  const api =
    params.type === 'all'
      ? 'https://jkc-services.jktyre.co.in/api/service/syncUserData'
      : `https://jkc-services.jktyre.co.in/api/service/syncUserData?Kunnr=${params.data}`
  try {
    const response = await axios.get(api, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(userName + ':' + password).toString('base64')
      }
    })

    return response?.data
  } catch (error) {
    console.log('Error is ===>', error)
  }
})

export const addSyncProduct = createAsyncThunk('appInvoice/addSyncProduct', async params => {
  const api =
    params.type === 'all'
      ? 'https://jkc-services.jktyre.co.in/api/service/syncProductData'
      : `https://jkc-services.jktyre.co.in/api/service/syncProductData?Kunnr=${params.data}`
  try {
    const response = await axios.get(api, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(userName + ':' + password).toString('base64')
      }
    })

    return response?.data
  } catch (error) {
    console.log('Error is ===>', error)
  }

  // const api =
  //   params.type === 'all' ? '/api/service/syncProductData' : `api/service/syncProductData?Kunnr=${params.data}`
  // try {
  //   const response = await axiosRequest({
  //     url: api,
  //     method: 'GET'
  //   })

  //   return response
  // } catch (error) {
  //   console.log('Error is ===>', error)
  // }
})

export const sync = createSlice({
  name: 'sync',
  initialState: {
    syncPaymentLoading: 'NOT_LOADED',
    syncPaymentError: null,
    syncUserLoading: 'NOT_LOADED',
    syncUserError: null,
    syncOrderLoading: 'NOT_LOADED',
    syncOrderError: null,
    syncPartyLoading: 'NOT_LOADED',
    syncPartyError: null,
    syncProductLoading: 'NOT_LOADED',
    syncProductError: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(addSyncPayment.pending, (state, action) => {
        state.syncPaymentLoading = 'LOADING'
        state.syncPaymentError = null
      })
      .addCase(addSyncPayment.fulfilled, (state, action) => {
        state.syncPaymentLoading = 'LOADED'
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addSyncPayment.rejected, (state, action) => {
        state.syncPaymentLoading = 'FAILED'
        state.syncPaymentError = action?.payload
      })

      .addCase(addSyncUser.pending, (state, action) => {
        state.syncUserLoading = 'LOADING'
        state.syncUserError = null
      })
      .addCase(addSyncUser.fulfilled, (state, action) => {
        state.syncUserLoading = 'LOADED'
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addSyncUser.rejected, (state, action) => {
        state.syncUserLoading = 'FAILED'
        state.syncUserError = action?.payload
      })

      .addCase(addSyncOrder.pending, (state, action) => {
        state.syncOrderLoading = 'LOADING'
        state.syncOrderError = null
      })
      .addCase(addSyncOrder.fulfilled, (state, action) => {
        state.syncOrderLoading = 'LOADED'
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addSyncOrder.rejected, (state, action) => {
        state.syncOrderLoading = 'FAILED'
        state.syncOrderError = action?.payload
      })

      .addCase(addSyncParty.pending, (state, action) => {
        state.syncPartyLoading = 'LOADING'
        state.syncPartyError = null
      })
      .addCase(addSyncParty.fulfilled, (state, action) => {
        state.syncPartyLoading = 'LOADED'
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addSyncParty.rejected, (state, action) => {
        state.syncPartyLoading = 'FAILED'
        state.syncPartyError = action?.payload
      })

      .addCase(addSyncProduct.pending, (state, action) => {
        state.syncProductLoading = 'LOADING'
        state.syncProductError = null
      })
      .addCase(addSyncProduct.fulfilled, (state, action) => {
        state.syncProductLoading = 'LOADED'
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addSyncProduct.rejected, (state, action) => {
        state.syncProductLoading = 'FAILED'
        state.syncProductError = action?.payload
      })
  }
})

export default sync.reducer
