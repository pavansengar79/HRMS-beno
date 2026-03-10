import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { duration } from 'moment'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch Queries
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

export const updateQueryData = createAsyncThunk('helpdesk/updateQueryData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/query/update`,
    method: 'PATCH',
    data: params
  })

  return response
})

export const querySlice = createSlice({
  name: 'query',
  initialState: {
    queriesLoadingStatus: 'NOT_LOADED',
    queryLoadingStatus: 'NOT_LOADED',
    counts: [],
    queries: [],
    percentageChange: [],
    totalDocument: 0,
    totalData: 0,
    totalPage: 0,
    queriesError: null,
    queryLoadMessage: '',
    queryStatusError: null,
    shouldFetchData: false
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchQueryData.pending, (state, action) => {
        state.queriesLoadingStatus = 'LOADING'
        state.queriesError = null
      })
      .addCase(fetchQueryData.fulfilled, (state, action) => {
        state.assignUserLoadingStatus = 'NOT_LOADED'
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

      // .addCase(updateQueryData.fulfilled, (state, action) => {
      //   toast.success('Query Updated Successfully', {
      //     duration: 2000
      //   })
      // })
      // .addCase(updateQueryData.rejected, (state, action) => {
      //   toast.success('Query Updated Successfully', {
      //     duration: 2000
      //   })
      // })
      .addCase(updateQueryData.pending, (state, action) => {
        state.queryLoadingStatus = 'LOADING'
        state.queryStatusError = null
      })
      .addCase(updateQueryData.fulfilled, (state, action) => {
        // console.log('action', action.meta.arg.queryId)
        state.queryLoadingStatus = 'LOADED'
        toast.success(action?.payload?.message, {
          duration: 2000
        })
        state.shouldFetchData = true

        // state.queries = state.queries.map(data => (action.meta.arg.queryId == data._id ? data : state.queries))
      })
      .addCase(updateQueryData.rejected, (state, action) => {
        console.log('action', action)
        state.queryLoadingStatus = 'FAILED'
        state.queryStatusError = 'failed'
        toast.error('Something went wrong', { duration: 2000 })
      })

    // .addCase(updateQueryData.pending, (state, action) => {
    //   // Optionally, you can set a loading status for the update request
    // })
    // .addCase(updateQueryData.fulfilled, (state, action) => {
    //   // Update the state with the new data after successful patch request
    //   const updatedQueryIndex = state.queries.findIndex(query => query._id === action.payload.id)
    //   if (updatedQueryIndex !== -1) {
    //     state.queries[updatedQueryIndex] = action.payload
    //   }
    // })
    // .addCase(updateQueryData.rejected, (state, action) => {
    //   // Handle the error state for the update request
    // })
  }
})

export default querySlice.reducer
