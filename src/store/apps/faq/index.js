import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch faq
export const fetchFaqData = createAsyncThunk('FAQ/fetchFaqData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/faq/getfaq?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }`,
    method: 'GET'
  })

  return response
})

export const updateFaqData = createAsyncThunk('FAQ/updateFaqData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/faq/updatefaq/${params?.id}`,
    method: 'PUT',
    data: params?.data
  })

  return response
})

export const createFaqData = createAsyncThunk('FAQ/createFaqData', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/faq/createfaq',
    method: 'POST',
    data: params
  })

  return response
})

export const deleteFaqData = createAsyncThunk('FAQ/deleteFaqData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/faq/deletefaq/${params}`,
    method: 'DELETE'
  })

  return response
})

export const changeCategoryStatus = createAsyncThunk('FAQ/changeCategoryStatus', async params => {
  try {
    // const response = await axiosRequest({
    //   url: '/api/admindash/file/updateStatus',
    //   method: 'PATCH',
    //   data: { id: params }
    // })
    // return response
  } catch (error) {
    console.log('Error is ===>', error)
  }
})

export const faqSlice = createSlice({
  name: 'faq',
  initialState: {
    faqLoadingStatus: 'NOT_LOADED',
    changeCategoryLoadingStatus: 'NOT_LOADED',
    faq: [],
    totalData: 0,
    faqError: null,
    changeCategoryError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchFaqData.pending, (state, action) => {
        state.faqLoadingStatus = 'LOADING'
        state.faqError = null
      })
      .addCase(fetchFaqData.fulfilled, (state, action) => {
        state.shouldFetchData = false
        state.faqLoadingStatus = 'LOADED'
        state.faq = action?.payload?.data
        state.totalData = action?.payload?.totalData
      })
      .addCase(fetchFaqData.rejected, (state, action) => {
        toast.error('Something went wrong', { duration: 2000 })
        state.faqLoadingStatus = 'FAILED'
        state.faqError = action?.payload
      })
      .addCase(updateFaqData.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(updateFaqData.rejected, (state, action) => {
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
      .addCase(createFaqData.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(createFaqData.rejected, (state, action) => {
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
      .addCase(deleteFaqData.fulfilled, (state, action) => {
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
  }
})

export default faqSlice.reducer
