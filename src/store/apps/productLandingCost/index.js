import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch productLandingCost
export const fetchProductLandingCost = createAsyncThunk('appInvoice/fetchProductLandingCost', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/discount/getAllDiscount?page=${params.paginationModel.page + 1}&limit=${
      params.paginationModel.pageSize
    }`,
    method: 'GET'
  })

  return response
})

export const fetchProductCategory = createAsyncThunk('appInvoice/fetchProductCategory', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/product/getCategory`,
    method: 'GET'
  })

  return response
})

export const fetchProductList = createAsyncThunk('appInvoice/fetchProductList', async params => {
  const page = params.page === undefined ? '' : params.page
  const search = params.search === undefined ? '' : params.search
  const response = await axiosRequest({
    url: `/api/admindash/product/getProduct?page=${page}&search=${search}`,
    method: 'GET'
  })

  return response
})

export const addProductCategory = createAsyncThunk('appInvoice/addProductCategory', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/discount/createDiscount`,
    method: 'POST',
    data: params
  })

  return response
})

export const productLandingCost = createSlice({
  name: 'productLandingCost',
  initialState: {
    productLandingCostLoading: 'NOT_LOADED',
    productCategoryLoading: 'NOT_LOADED',
    productListLoading: 'NOT_LOADED',
    productLandingCost: [],
    productCategory: [],
    productList: [],
    csvData: [],
    productLandingCostError: null,
    totalPage: 0,
    totalPage2: 0,
    totalData: 0,
    totalData2: 0,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchProductLandingCost.pending, (state, action) => {
        state.productLandingCostLoading = 'LOADING'
        state.productLandingCostError = null
      })
      .addCase(fetchProductLandingCost.fulfilled, (state, action) => {
        state.productLandingCostLoading = 'LOADED'
        state.productLandingCost = action?.payload?.data
        state.totalPage = action?.payload?.totalPage
        state.totalData = action?.payload?.totalData
        state.csvData = action?.payload?.csvData
        state.shouldFetchData = false
      })
      .addCase(fetchProductLandingCost.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
        state.productLandingCostLoading = 'FAILED'
        state.productLandingCostError = action?.payload
      })
      .addCase(fetchProductCategory.pending, (state, action) => {
        state.productCategoryLoading = 'LOADING'
      })
      .addCase(fetchProductCategory.fulfilled, (state, action) => {
        state.productCategoryLoading = 'LOADED'
        state.productCategory = action?.payload?.data
      })
      .addCase(fetchProductList.pending, (state, action) => {
        state.productListLoading = 'LOADING'
      })
      .addCase(fetchProductList.fulfilled, (state, action) => {
        state.productListLoading = 'LOADED'
        state.productList = action?.payload?.data
        state.totalPage2 = action?.payload?.totalPage
        state.totalData2 = action?.payload?.totalData
      })
      .addCase(addProductCategory.fulfilled, (state, action) => {
        // toast.success(action?.payload?.message, {
        //   duration: 2000
        // })
        state.shouldFetchData = true
        toast.success('Added Successfully', {
          duration: 2000
        })
      })
  }
})

export default productLandingCost.reducer
