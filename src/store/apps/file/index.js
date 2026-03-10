import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Fetch Invoices
export const fetchFileData = createAsyncThunk('files/fetchFileData', async params => {
  const response = await axiosRequest({
    url: `/api/admindash/file/getAll?page=${params?.paginationModel?.page + 1}&limit=${
      params?.paginationModel?.pageSize
    }`,
    method: 'GET'
  })

  return response
})

export const uploadFile = createAsyncThunk('files/uploadFile', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/file/create',
    method: 'POST',
    data: params
  })

  return response
})

export const uploadFileBucket = createAsyncThunk('files/uploadFile', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/file/create',
    method: 'POST',
    data: params
  })

  return response
})

export const changeFileStatus = createAsyncThunk('files/changeFileStatus', async params => {
  const response = await axiosRequest({
    url: '/api/admindash/file/updateStatus',
    method: 'PATCH',
    data: { id: params }
  })

  return response
})

export const fileSlice = createSlice({
  name: 'file',
  initialState: {
    fileLoadingStatus: 'NOT_LOADED',
    changeLoadingStatus: 'NOT_LOADED',
    fileUploadStatus: 'NOT_LOADED',
    files: [],
    fileError: null,
    totalPage: 0,
    totalData: 0,
    changeStatusError: null,
    fileUploadError: null,
    shouldFetchData: true
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchFileData.pending, (state, action) => {
        state.fileLoadingStatus = 'LOADING'
        state.fileError = null
      })
      .addCase(fetchFileData.fulfilled, (state, action) => {
        state.fileLoadingStatus = 'LOADED'
        state.fileUploadStatus = 'NOT_LOADED'
        state.files = action?.payload?.files
        state.totalPage = action?.payload?.totalPage
        state.totalData = action?.payload?.totalData
        state.shouldFetchData = false
      })
      .addCase(fetchFileData.rejected, (state, action) => {
        state.fileLoadingStatus = 'FAILED'
        state.fileError = action?.payload
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
      .addCase(uploadFile.pending, (state, action) => {
        state.fileUploadStatus = 'LOADING'
        state.fileUploadError = null
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.fileUploadStatus = 'LOADED'
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.fileUploadStatus = 'FAILED'
        state.fileUploadError = action?.payload
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
      .addCase(changeFileStatus.pending, (state, action) => {
        state.changeLoadingStatus = 'LOADING'
        state.changeStatusError = null
      })
      .addCase(changeFileStatus.fulfilled, (state, action) => {
        state.changeLoadingStatus = 'LOADED'
        state.shouldFetchData = true
        toast.success(action?.payload?.message, {
          duration: 2000
        })
      })
      .addCase(changeFileStatus.rejected, (state, action) => {
        state.changeLoadingStatus = 'FAILED'
        state.changeStatusError = 'failed'
        toast.error('Something went wrong', {
          duration: 2000
        })
      })
  }
})

export default fileSlice.reducer
