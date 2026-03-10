import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch Invoices

export const fetchQueryData = createAsyncThunk('helpdesk/fetchQueryData', async params => {
  console.log(params)

  const response = await axiosRequest({
    url: `/api/admindash/query/getAll?search=${params?.search || ''}&status=${params?.status || ''}&page=${
      params?.paginationModel?.page + 1
    }&limit=${params?.paginationModel?.pageSize || ''}}`,
    method: 'GET'
  })

  return response
})

export const getTicketCategories = createAsyncThunk('helpDesk/getTicketCategories', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/queryCategory/getAll?statue=OPEN&search=${params?.search}`,
    method: 'GET'
  })

  return response
})

export const createAssignUser = createAsyncThunk('helpdesk/createAssignUser', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/queryCategory/create1`,
    method: 'POST',
    data: params
  })
  console.log(response)

  return response
})

export const getTicketTimelines = createAsyncThunk('helpDesk/getTicketTimelines', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/query/timeline/${params}`,
    method: 'GET'
  })

  return response
})

export const ticketUpdateRemark = createAsyncThunk('helpDesk/ticketUpdateRemark', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/query/remarkAdded`,
    method: 'POST',
    data: params
  })

  return response
})

export const updateEscalationMatrix = createAsyncThunk('helpDesk/updateEscalationMatrix', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/query/EscalationMatrixTimeConfig`,
    method: 'PUT'
  })

  return response
})

export const helpDeskSlice = createSlice({
  name: 'helpDesk',
  initialState: {
    ticketCategoryLoadingStatus: 'NOT_LOADED',
    escalationMatrixLoadingStatus: 'NOT_LOADED',
    timelineLoadingStatus: 'NOT_LOADED',
    updateTicketLoadingStatus: 'NOT_LOADED',
    ticketCategories: [],
    ticketTimeLines: [],
    ticketCategorError: null,
    escalationMatrixError: null,
    ticketTimeLinesMatrixError: null,
    updateTicketError: null,
    queriesLoadingStatus: 'NOT_LOADED',
    queryLoadingStatus: 'NOT_LOADED',
    assignUserLoadingStatus: 'NOT_LOADED',
    updateAssignUserLoadingStatus: 'NOT_LOADED',
    counts: [],
    queries: [],
    percentageChange: [],
    totalDocument: 0,
    totalData: 0,
    totalPage: 0,
    queriesError: null,
    queryLoadMessage: '',
    queryStatusError: null,
    assignUserError: null,
    updateassignUserError: null,
    shouldFetchData: false
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getTicketCategories.pending, (state, action) => {
        state.ticketCategoryLoadingStatus = 'LOADING'
        state.fileError = null
      })
      .addCase(getTicketCategories.fulfilled, (state, action) => {
        state.ticketCategoryLoadingStatus = 'LOADED'
        state.ticketCategories = action?.payload?.categories
      })
      .addCase(getTicketCategories.rejected, (state, action) => {
        state.ticketCategoryLoadingStatus = 'FAILED'
        state.fileError = null
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
      .addCase(updateEscalationMatrix.pending, (state, action) => {
        state.escalationMatrixLoadingStatus = 'LOADING'
        state.escalationMatrixError = null
      })
      .addCase(updateEscalationMatrix.fulfilled, (state, action) => {
        state.escalationMatrixLoadingStatus = 'LOADED'
        toast.success('updated Successfully', {
          duration: 2000
        })
      })
      .addCase(updateEscalationMatrix.rejected, (state, action) => {
        state.escalationMatrixLoadingStatus = 'FAILED'
        state.escalationMatrixError = null
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
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
        console.log('fulfill')
        state.queriesLoadingStatus = 'LOADED'
        state.queries = action?.payload.queries
        state.counts = action?.payload.counts
        state.totalDocument = action?.payload.totalDocument
        state.totalData = action?.payload.totalData
        state.totalPage = action?.payload.totalPage
        state.shouldFetchData = false
        state.percentageChange = action?.payload?.percentageChange
      })
      .addCase(fetchQueryData.rejected, (state, action) => {
        state.queriesLoadingStatus = 'FAILED'
        state.queriesError = action?.payload
        toast.error('Something went wrong', { duration: 2000 })
      })
  }
})

export default helpDeskSlice.reducer
