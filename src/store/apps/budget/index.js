import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// GET
export const getCategoryPicklist = createAsyncThunk('budget/getCategoryPicklist', async () => {
  const response = await axiosRequest({
    url: `/api/admindash/budget/getCategoryPicklist`,
    method: 'GET'
  })

  return response
})

export const getSchemePicklist = createAsyncThunk('budget/getSchemePicklist', async () => {
  const response = await axiosRequest({
    url: `/api/admindash/budget/getSchemePicklist`,
    method: 'GET'
  })

  return response
})

export const getBudgets = createAsyncThunk('budget/getBudgets', async () => {
  const response = await axiosRequest({
    url: `/api/admindash/budget/getBudgets`,
    method: 'GET'
  })

  return response
})

export const getBudgetVersions = createAsyncThunk('budget/getBudgetVersions', async () => {
  const response = await axiosRequest({
    url: `/api/admindash/budget/getBudgetVersions`,
    method: 'GET'
  })

  return response
})

// POST
export const getProducts = createAsyncThunk('budget/getProducts', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/budget/getProducts`,
    method: 'POST',
    data: params
  })

  return response
})

export const createBudget = createAsyncThunk('budget/createBudget', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/budget/createBudget`,
    method: 'POST',
    data: params
  })

  return response
})

export const editBudget = createAsyncThunk('budget/editBudget', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/budget/editBudget?id=${params._id}`,
    method: 'POST',
    data: params
  })

  return response
})

// DELETE
export const deleteByCategory = createAsyncThunk('budget/deleteByCategory', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/budget/deleteByCategory?productCategory=${params}`,
    method: 'DELETE'
  })

  return response
})

export const deleteBudgets = createAsyncThunk('budget/deleteBudgets', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/budget/deleteBudgets`,
    method: 'DELETE',
    data: params
  })

  return response
})

export const budgetSlice = createSlice({
  name: 'Budget',
  initialState: {
    categoryPicklistLoadingStatus: 'NOT LOADED',
    categoryPicklistError: null,
    productCategoryList: [],
    shouldFetchData: false
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getCategoryPicklist.pending, (state, action) => {
        state.categoryPicklistLoadingStatus = 'LOADING'
        state.categoryPicklistError = null
        console.log(action, 'pending')
      })
      .addCase(getCategoryPicklist.fulfilled, (state, action) => {
        console.log(action?.payload?.data, 'fulfilled')
        state.categoryPicklistLoadingStatus = 'LOADED'
        state.productCategoryList = action?.payload?.data
        state.shouldFetchData = false
      })
      .addCase(getCategoryPicklist.rejected, (state, action) => {
        console.log(action, 'rejected')

        state.categoryPicklistLoadingStatus = 'FAILED'
        // state.categoryPicklistError = action?.payload
        toast.error('Error fetching Product categories', {
          duration: 2000
        })
      })
  }
})

export default budgetSlice.reducer
