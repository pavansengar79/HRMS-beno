import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { duration } from 'moment'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch mail
export const fetchTyre = createAsyncThunk('roiMasters/fetchTyre', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/product/getCategory?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }`,
    method: 'GET'
  })

  return response
})

export const fetchExpnediture = createAsyncThunk('roiMasters/fetchExpnediture', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/roimaster/expenditure?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }`,
    method: 'GET'
  })

  return response
})

export const fetchInvestment = createAsyncThunk('roiMasters/fetchInvestment', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/roimaster/investment?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }`,
    method: 'GET'
  })

  return response
})

export const addExpenditure = createAsyncThunk('roiMasters/addExpenditure', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/roimaster/expenditure`,
    method: 'POST',
    data: { category: params.category }
  })

  return response
})

export const addInvestment = createAsyncThunk('roiMasters/addInvestment', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/roimaster/investment`,
    method: 'POST',
    data: { name: params.name }
  })

  return response
})

export const updateTyre = createAsyncThunk('roiMasters/updateTyre', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/roimaster/updateroimaster/${params?.id}`,
    method: 'PUT',
    data: params
  })

  return response
})

export const updateExpenditure = createAsyncThunk('roiMasters/updateExpenditure', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/roimaster/expenditure/${params?.id}`,
    method: 'PUT',
    data: params
  })

  return response
})

export const updateInvestment = createAsyncThunk('roiMasters/updateInvestment', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/roimaster/investment/${params?.id}`,
    method: 'PUT',
    data: params
  })

  return response
})

export const deleteExpenditure = createAsyncThunk('roiMasters/deleteExpenditure', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/roimaster/expenditure?id=${params}`,
    method: 'DELETE'
  })

  return response
})

export const deleteInvestment = createAsyncThunk('roiMasters/deleteInvestment', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/roimaster/investment?id=${params}`,
    method: 'DELETE'
  })

  return response
})

export const RoiMasters = createSlice({
  name: 'RoiMasters',
  initialState: {
    tyreLoadingStatus: 'NOT_LOADED',
    expenditureLoadingStatus: 'NOT_LOADED',
    investmentLoadingStatus: 'NOT_LOADED',
    tyre: [],
    expenditure: [],
    investment: [],
    totalData1: 0,
    totalData2: 0,
    totalData3: 0,
    tyreError: null,
    expenditureError: null,
    investmentError: null,
    shouldFetchData: { tyre: true, expenditure: true, investment: true }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTyre.pending, (state, action) => {
        state.tyreLoadingStatus = 'LOADING'
        state.tyreError = null
      })
      .addCase(fetchTyre.fulfilled, (state, action) => {
        state.shouldFetchData.tyre = false
        state.tyreLoadingStatus = 'LOADED'
        state.tyre = action?.payload?.data
        state.totalData1 = action?.payload?.totalData
      })
      .addCase(fetchTyre.rejected, (state, action) => {
        state.tyreLoadingStatus = 'FAILED'
        state.tyreError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(fetchExpnediture.pending, (state, action) => {
        state.expenditureLoadingStatus = 'LOADING'
        state.expenditureError = null
      })
      .addCase(fetchExpnediture.fulfilled, (state, action) => {
        state.shouldFetchData.expenditure = false
        console.log('acc', action)
        state.expenditureLoadingStatus = 'LOADED'
        state.expenditure = action?.payload?.expenditure
        state.totalData2 = action?.payload?.totalData
      })
      .addCase(fetchExpnediture.rejected, (state, action) => {
        state.expenditureLoadingStatus = 'FAILED'
        state.expenditureError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(fetchInvestment.pending, (state, action) => {
        state.investmentLoadingStatus = 'LOADING'
        state.investmentError = null
      })
      .addCase(fetchInvestment.fulfilled, (state, action) => {
        state.shouldFetchData.investment = false
        console.log('acc', action)
        state.investmentLoadingStatus = 'LOADED'
        state.investment = action?.payload?.investment
        state.totalData3 = action?.payload?.totalData
      })
      .addCase(fetchInvestment.rejected, (state, action) => {
        state.investmentLoadingStatus = 'FAILED'
        state.investmentError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })

      .addCase(addExpenditure.fulfilled, (state, action) => {
        state.shouldFetchData.expenditure = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addExpenditure.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(addInvestment.fulfilled, (state, action) => {
        state.shouldFetchData.investment = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(addInvestment.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(updateTyre.fulfilled, (state, action) => {
        state.shouldFetchData.tyre = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateTyre.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(updateExpenditure.fulfilled, (state, action) => {
        state.shouldFetchData.expenditure = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateExpenditure.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(updateInvestment.fulfilled, (state, action) => {
        state.shouldFetchData.investment = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateInvestment.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(deleteInvestment.fulfilled, (state, action) => {
        state.shouldFetchData.investment = true
        toast.success(action.payload?.message, {
          duration: 2000
        })
      })
      .addCase(deleteInvestment.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(deleteExpenditure.fulfilled, (state, action) => {
        state.shouldFetchData.expenditure = true
        toast.success(action.payload?.message, {
          duration: 2000
        })
      })
      .addCase(deleteExpenditure.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
      })
  }
})

export default RoiMasters.reducer
