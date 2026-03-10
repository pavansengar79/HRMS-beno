import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch Invoices

export const fetchQueryData = createAsyncThunk('helpDeskTickets/fetchQueryData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/query/getAll?search=${params?.search || ''}&category=${params?.category?.name || ''}&status=${
      params?.status?.value || ''
    }&page=${params?.paginationModel?.page + 1}&limit=${params?.paginationModel?.pageSize || ''}&startDate=${
      params?.startDate || ''
    }&endDate=${params?.endDate || ''}`,
    method: 'GET'
  })

  return response
})

export const fetchQueryCategoryData = createAsyncThunk('helpDeskTickets/fetchQueryCategoryData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/queryCategory/getAll?active=true`,
    method: 'GET'
  })

  return response
})

export const getTicketTimelines = createAsyncThunk('helpDeskTickets/getTicketTimelines', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/query/timeline/${params}`,
    method: 'GET'
  })

  return response
})

export const ticketUpdateRemark = createAsyncThunk('helpDeskTickets/ticketUpdateRemark', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/query/remarkAdded`,
    method: 'POST',
    data: params
  })

  return response
})

export const helpDeskTickets = createSlice({
  name: 'helpDeskTickets',
  initialState: {
    timelineLoadingStatus: 'NOT_LOADED',
    updateTicketLoadingStatus: 'NOT_LOADED',
    queriesLoadingStatus: 'NOT_LOADED',
    ticketTimeLinesMatrixError: null,
    updateTicketError: null,
    queriesError: null,
    ticketTimeLines: [],
    queries: [],
    percentageChange: [],
    counts: [],
    category: [],
    totalData: 0,
    totalPage: 0,
    shouldFetchData: false
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getTicketTimelines.pending, (state, action) => {
        state.timelineLoadingStatus = 'LOADING'
        state.ticketTimeLinesMatrixError = null
      })
      .addCase(getTicketTimelines.fulfilled, (state, action) => {
        state.timelineLoadingStatus = 'LOADED'
        state.ticketTimeLines = action?.payload?.timeline
      })
      .addCase(getTicketTimelines.rejected, (state, action) => {
        state.timelineLoadingStatus = 'FAILED'
        state.ticketTimeLinesMatrixError = null
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
      .addCase(ticketUpdateRemark.pending, (state, action) => {
        state.updateTicketLoadingStatus = 'LOADING'
        state.updateTicketError = null
      })
      .addCase(ticketUpdateRemark.fulfilled, (state, action) => {
        state.updateTicketLoadingStatus = 'LOADED'
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(ticketUpdateRemark.rejected, (state, action) => {
        state.updateTicketLoadingStatus = 'FAILED'
        state.updateTicketError = action?.payload
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
      .addCase(fetchQueryData.pending, (state, action) => {
        state.queriesLoadingStatus = 'LOADING'
        state.queriesError = null
      })
      .addCase(fetchQueryData.fulfilled, (state, action) => {
        state.queriesLoadingStatus = 'LOADED'
        state.queries = action?.payload?.queries
        state.totalData = action?.payload?.totalData
        state.totalPage = action?.payload?.totalPage
        state.percentageChange = action?.payload?.percentageChange
        state.counts = action?.payload?.counts
        state.shouldFetchData = false
      })
      .addCase(fetchQueryData.rejected, (state, action) => {
        state.queriesLoadingStatus = 'FAILED'
        state.queriesError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
      .addCase(fetchQueryCategoryData.fulfilled, (state, action) => {
        state.category = action?.payload.categories
      })
  }
})

export default helpDeskTickets.reducer
